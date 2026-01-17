'use client';

import { useState } from 'react';
import Icon from '@/components/ui/AppIcon';



const AttachmentManager = ({
    attachments,
    onAttachmentsChange,
}) => {
    const [isDragging, setIsDragging] = useState(false);

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    };

    const handleFileSelect = (event) => {
        const files = event.target.files;
        if (!files) return;

        const newAttachments = Array.from(files).map((file) => ({
            id: Math.random().toString(36).substr(2, 9),
            name: file.name,
            size: file.size,
            type: file.type,
        }));

        onAttachmentsChange([...attachments, ...newAttachments]);
    };

    const handleRemoveAttachment = (attachmentId) => {
        onAttachmentsChange(attachments.filter((a) => a.id !== attachmentId));
    };

    const handleDragOver = (event) => {
        event.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (event) => {
        event.preventDefault();
        setIsDragging(false);

        const files = event.dataTransfer.files;
        if (!files) return;

        const newAttachments = Array.from(files).map((file) => ({
            id: Math.random().toString(36).substr(2, 9),
            name: file.name,
            size: file.size,
            type: file.type,
        }));

        onAttachmentsChange([...attachments, ...newAttachments]);
    };

    const getFileIcon = (type) => {
        if (type.includes('pdf')) return 'DocumentTextIcon';
        if (type.includes('image')) return 'PhotoIcon';
        if (type.includes('word') || type.includes('document')) return 'DocumentIcon';
        if (type.includes('excel') || type.includes('spreadsheet')) return 'TableCellsIcon';
        return 'DocumentIcon';
    };

    return (
        <div className="space-y-3">
            <label className="block text-sm font-medium text-foreground">
                Attachments
            </label>

            <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-md p-6 text-center transition-smooth ${isDragging
                    ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                    }`}
            >
                <Icon
                    name="PaperClipIcon"
                    size={40}
                    className="mx-auto text-muted-foreground mb-3"
                />
                <p className="text-sm text-foreground mb-2">
                    Drag and drop files here, or click to browse
                </p>
                <p className="text-xs text-muted-foreground mb-4 font-caption">
                    Supported formats: PDF, DOC, DOCX, XLS, XLSX, JPG, PNG (Max 10MB per file)
                </p>
                <label className="inline-flex items-center space-x-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-md text-sm hover:bg-secondary/90 transition-smooth cursor-pointer">
                    <Icon name="FolderOpenIcon" size={18} />
                    <span>Browse Files</span>
                    <input
                        type="file"
                        multiple
                        onChange={handleFileSelect}
                        className="hidden"
                        accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                    />
                </label>
            </div>

            {attachments.length > 0 && (
                <div className="space-y-2">
                    <p className="text-sm font-medium text-foreground">
                        Attached Files ({attachments.length})
                    </p>
                    <div className="space-y-2">
                        {attachments.map((attachment) => (
                            <div
                                key={attachment.id}
                                className="flex items-center justify-between bg-card border border-border rounded-md px-4 py-3"
                            >
                                <div className="flex items-center space-x-3 flex-1 min-w-0">
                                    <Icon
                                        name={getFileIcon(attachment.type)}
                                        size={20}
                                        className="text-primary flex-shrink-0"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-foreground truncate">
                                            {attachment.name}
                                        </p>
                                        <p className="text-xs text-muted-foreground font-caption">
                                            {formatFileSize(attachment.size)}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => handleRemoveAttachment(attachment.id)}
                                    className="ml-3 p-1.5 rounded hover:bg-destructive/10 transition-smooth flex-shrink-0"
                                    aria-label={`Remove ${attachment.name}`}
                                >
                                    <Icon name="TrashIcon" size={18} className="text-destructive" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AttachmentManager;