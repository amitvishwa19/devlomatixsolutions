'use client';

import { useState } from 'react';
import Icon from '@/components/ui/AppIcon';



const EmailPreview = ({
    subject,
    content,
    recipients,
    attachments,
    onClose,
}) => {
    const [activeTab, setActiveTab] = useState < 'preview' | 'recipients' > ('preview');

    const renderContentWithVariables = (text) => {
        const parts = text.split(/(\{\{[^}]+\}\})/g);
        return parts.map((part, index) => {
            if (part.match(/\{\{[^}]+\}\}/)) {
                return (
                    <span key={index} className="bg-primary/20 text-primary px-1 rounded font-medium">
                        {part}
                    </span>
                );
            }
            return part;
        });
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    };

    return (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
            <div className="w-full max-w-4xl bg-card rounded-lg shadow-elevation-xl overflow-hidden max-h-[90vh] flex flex-col">
                <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                    <h2 className="text-xl font-semibold text-foreground">Email Preview</h2>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-md hover:bg-muted transition-smooth"
                        aria-label="Close preview"
                    >
                        <Icon name="XMarkIcon" size={24} />
                    </button>
                </div>

                <div className="flex border-b border-border">
                    <button
                        onClick={() => setActiveTab('preview')}
                        className={`flex-1 px-6 py-3 text-sm font-medium transition-smooth ${activeTab === 'preview' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        <div className="flex items-center justify-center space-x-2">
                            <Icon name="EnvelopeIcon" size={18} />
                            <span>Email Content</span>
                        </div>
                    </button>
                    <button
                        onClick={() => setActiveTab('recipients')}
                        className={`flex-1 px-6 py-3 text-sm font-medium transition-smooth ${activeTab === 'recipients' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        <div className="flex items-center justify-center space-x-2">
                            <Icon name="UsersIcon" size={18} />
                            <span>Recipients ({recipients.length})</span>
                        </div>
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    {activeTab === 'preview' ? (
                        <div className="space-y-6">
                            <div className="bg-muted/50 rounded-lg p-6 space-y-4">
                                <div>
                                    <p className="text-xs text-muted-foreground font-caption mb-1">Subject</p>
                                    <p className="text-lg font-semibold text-foreground">
                                        {renderContentWithVariables(subject)}
                                    </p>
                                </div>

                                <div className="border-t border-border pt-4">
                                    <p className="text-xs text-muted-foreground font-caption mb-3">Message</p>
                                    <div className="prose prose-sm max-w-none text-foreground whitespace-pre-wrap">
                                        {renderContentWithVariables(content)}
                                    </div>
                                </div>

                                {attachments.length > 0 && (
                                    <div className="border-t border-border pt-4">
                                        <p className="text-xs text-muted-foreground font-caption mb-3">
                                            Attachments ({attachments.length})
                                        </p>
                                        <div className="space-y-2">
                                            {attachments.map((attachment) => (
                                                <div
                                                    key={attachment.id}
                                                    className="flex items-center space-x-3 bg-card border border-border rounded-md px-3 py-2"
                                                >
                                                    <Icon name="PaperClipIcon" size={16} className="text-primary" />
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium text-foreground truncate">
                                                            {attachment.name}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground font-caption">
                                                            {formatFileSize(attachment.size)}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="flex items-start space-x-2 p-4 bg-primary/10 rounded-md">
                                <Icon
                                    name="InformationCircleIcon"
                                    size={20}
                                    className="text-primary flex-shrink-0 mt-0.5"
                                />
                                <div className="text-sm text-foreground">
                                    <p className="font-medium mb-1">Preview Note</p>
                                    <p className="text-muted-foreground">
                                        Variables shown in highlighted format will be replaced with actual values
                                        when the email is sent to recipients.
                                    </p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <p className="text-sm text-muted-foreground">
                                    Total recipients: <span className="font-semibold text-foreground">{recipients.length}</span>
                                </p>
                            </div>

                            <div className="space-y-2">
                                {recipients.map((recipient) => (
                                    <div
                                        key={recipient.id}
                                        className="flex items-center space-x-3 bg-muted/50 rounded-md px-4 py-3"
                                    >
                                        <Icon
                                            name={
                                                recipient.type === 'patient' ? 'UserIcon'
                                                    : recipient.type === 'doctor' ? 'UserCircleIcon' : 'UsersIcon'
                                            }
                                            size={20}
                                            className="text-muted-foreground flex-shrink-0"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-foreground">{recipient.name}</p>
                                            <p className="text-xs text-muted-foreground font-caption">
                                                {recipient.email}
                                            </p>
                                        </div>
                                        <span
                                            className={`px-2 py-1 rounded text-xs font-medium flex-shrink-0 ${recipient.type === 'patient' ? 'bg-primary/10 text-primary'
                                                : recipient.type === 'doctor' ? 'bg-secondary/10 text-secondary' : 'bg-accent/10 text-accent'
                                                }`}
                                        >
                                            {recipient.type}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EmailPreview;