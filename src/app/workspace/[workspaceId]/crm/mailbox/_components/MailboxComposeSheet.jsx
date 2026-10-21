'use client';

import React, { useState, useRef } from 'react';
import { Send, Loader2, Paperclip, X, ChevronDown, ChevronUp, Sparkles, Building, FileSpreadsheet } from 'lucide-react';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetFooter
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import MailboxRichEditor from './MailboxRichEditor';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function MailboxComposeSheet({
    isOpen,
    onOpenChange,
    senderInfo,
    senderName = '',
    onSenderNameChange,
    mailboxes = [],
    selectedFromEmail = '',
    onFromEmailChange,
    to,
    cc = '',
    bcc = '',
    subject,
    body,
    contactId,
    dealId,
    attachments = [],
    contactsList = [],
    dealsList = [],
    isSending,
    onToChange,
    onCcChange,
    onBccChange,
    onSubjectChange,
    onBodyChange,
    onContactSelect,
    onDealSelect,
    onAttachmentsChange,
    onSend
}) {
    const [showCcBcc, setShowCcBcc] = useState(false);
    const fileInputRef = useRef(null);

    // Selected contact and deal details for context
    const selectedContact = contactsList.find(c => c.id === contactId);
    const selectedDeal = dealsList.find(d => d.id === dealId);

    // Handle File Attachments (convert to base64)
    const handleFileSelect = (e) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        files.forEach(file => {
            // Cap at 10MB per file
            if (file.size > 10 * 1024 * 1024) {
                alert(`File "${file.name}" exceeds the 10MB limit.`);
                return;
            }

            const reader = new FileReader();
            reader.onload = () => {
                const base64Data = reader.result.split(',')[1];
                if (onAttachmentsChange) {
                    onAttachmentsChange(prev => [
                        ...prev,
                        {
                            filename: file.name,
                            content: base64Data,
                            size: file.size,
                            type: file.type
                        }
                    ]);
                }
            };
            reader.readAsDataURL(file);
        });

        // Reset input
        e.target.value = '';
    };

    const removeAttachment = (index) => {
        if (onAttachmentsChange) {
            onAttachmentsChange(prev => prev.filter((_, i) => i !== index));
        }
    };

    const formatBytes = (bytes) => {
        if (!bytes) return '';
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    return (
        <Sheet open={isOpen} onOpenChange={onOpenChange}>
            <SheetContent
                side="right"
                className="w-full sm:max-w-none sm:w-[54vw] flex flex-col h-full  border-0 bg-transparent  shadow-2xl p-2"
            >

                <div className='rounded-lg border h-full bg-card'>

                    <ScrollArea className='h-[92vh]'>
                        {/* Header */}
                        <SheetHeader className="p-5 border-b border-slate-100 dark:border-slate-800 text-left bg-slate-50/50 dark:bg-slate-900/50">
                            <div className="flex items-center justify-between">
                                <SheetTitle className="text-base font-bold flex items-center gap-2.5 text-slate-900 dark:text-white">
                                    <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-xs">
                                        <Send className="w-4 h-4" />
                                    </div>
                                    <span>New Message</span>
                                    <Badge variant="outline" className="text-[10px] ml-1 text-slate-500 font-normal">
                                        Resend Inbound CRM
                                    </Badge>
                                </SheetTitle>
                            </div>
                        </SheetHeader>

                        <div className="flex-1 overflow-y-auto p-5 space-y-4">
                            {/* 1. Sender Identity Selector / Preview */}
                            <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 text-xs gap-2">
                                <div className="flex items-center gap-2 min-w-0 flex-1">
                                    <span className="font-semibold text-slate-400 text-[11px] uppercase tracking-wider shrink-0">From:</span>
                                    {mailboxes && mailboxes.filter(m => m.email !== 'ALL').length > 1 ? (
                                        <Select
                                            value={selectedFromEmail || mailboxes.find(m => m.isPrimary)?.email || mailboxes[1]?.email}
                                            onValueChange={(val) => onFromEmailChange?.(val)}
                                        >
                                            <SelectTrigger className="h-7 text-xs font-medium border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-lg max-w-[340px]">
                                                <SelectValue placeholder="Select Sender Mailbox" />
                                            </SelectTrigger>
                                            <SelectContent className="z-[99999] max-h-56">
                                                {mailboxes.filter(m => m.email !== 'ALL').map((mb) => (
                                                    <SelectItem key={mb.id} value={mb.email} className="text-xs cursor-pointer">
                                                        <div className="flex items-center gap-1.5">
                                                            <span className="font-bold text-slate-800 dark:text-slate-100">{mb.displayName || mb.label}</span>
                                                            <span className="text-slate-400 font-mono text-[11px]">&lt;{mb.email}&gt;</span>
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    ) : (
                                        <span className="text-slate-700 dark:text-slate-300 font-medium text-[11px] truncate">
                                            {senderName || senderInfo?.name || ''} &lt;{selectedFromEmail || senderInfo?.email || 'crm@devlomatix.in'}&gt;
                                        </span>
                                    )}
                                </div>
                                <Badge variant="outline" className="text-[10px] font-normal border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 bg-blue-50/50 dark:bg-blue-950/40 shrink-0">
                                    Verified Sender
                                </Badge>
                            </div>

                            {/* 2. Recipient (To) & Contact Selector */}
                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between">
                                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                        Recipient (To) <span className="text-red-500">*</span>
                                    </label>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setShowCcBcc(!showCcBcc)}
                                        className="h-6 text-[11px] text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 p-0 font-medium"
                                    >
                                        {showCcBcc ? 'Hide Cc / Bcc' : '+ Cc / Bcc'}
                                    </Button>
                                </div>

                                <div className="flex gap-2">
                                    <Input
                                        placeholder="client@company.com"
                                        value={to}
                                        onChange={(e) => onToChange(e.target.value)}
                                        className="text-xs h-9 rounded-xl flex-1 bg-white dark:bg-slate-900"
                                    />
                                    {contactsList.length > 0 && (
                                        <Select onValueChange={onContactSelect} value={contactId || ''}>
                                            <SelectTrigger className="w-[190px] text-xs h-9 rounded-xl shrink-0 bg-white dark:bg-slate-900">
                                                <SelectValue placeholder="Select Contact" />
                                            </SelectTrigger>
                                            <SelectContent className="max-h-64">
                                                {contactsList.map(c => (
                                                    <SelectItem key={c.id} value={c.id} className="text-xs">
                                                        <div className="flex flex-col">
                                                            <span className="font-medium">{c.name}</span>
                                                            {c.email && <span className="text-[10px] text-slate-400">{c.email}</span>}
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                </div>
                            </div>

                            {/* 3. Collapsible Cc & Bcc Inputs */}
                            {showCcBcc && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800">
                                    <div className="space-y-1">
                                        <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                                            Cc (Carbon Copy)
                                        </label>
                                        <Input
                                            placeholder="colleague@company.com"
                                            value={cc}
                                            onChange={(e) => onCcChange && onCcChange(e.target.value)}
                                            className="text-xs h-8 rounded-lg bg-white dark:bg-slate-900"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                                            Bcc (Blind Copy)
                                        </label>
                                        <Input
                                            placeholder="audit@company.com"
                                            value={bcc}
                                            onChange={(e) => onBccChange && onBccChange(e.target.value)}
                                            className="text-xs h-8 rounded-lg bg-white dark:bg-slate-900"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* 4. Subject */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                    Subject <span className="text-red-500">*</span>
                                </label>
                                <Input
                                    placeholder="e.g. Partnership Proposal & Agreement"
                                    value={subject}
                                    onChange={(e) => onSubjectChange(e.target.value)}
                                    className="text-xs h-9 rounded-xl bg-white dark:bg-slate-900 font-medium"
                                />
                            </div>

                            {/* 5. Deal Context Association (Optional) */}
                            {dealsList.length > 0 && (
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                        Associated CRM Deal (Optional)
                                    </label>
                                    <Select value={dealId || 'none'} onValueChange={onDealSelect}>
                                        <SelectTrigger className="text-xs h-9 rounded-xl bg-white dark:bg-slate-900">
                                            <SelectValue placeholder="Associate with Deal..." />
                                        </SelectTrigger>
                                        <SelectContent className="max-h-60">
                                            <SelectItem value="none">None</SelectItem>
                                            {dealsList.map(d => (
                                                <SelectItem key={d.id} value={d.id} className="text-xs">
                                                    {d.title} ({d.currency} {d.value})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}

                            {/* 6. Rich Text Editor */}
                            <div className="space-y-1.5 flex-1 flex flex-col">
                                <div className="flex items-center justify-between">
                                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                        Email Body <span className="text-red-500">*</span>
                                    </label>
                                    <span className="text-[11px] text-slate-400">
                                        Powered by TipTap WYSIWYG
                                    </span>
                                </div>
                                <MailboxRichEditor
                                    content={body}
                                    onChange={({ html, text }) => onBodyChange(html, text)}
                                    placeholder="Type your message, add links, lists, or pick a prebuilt template..."
                                    minHeight="260px"
                                    contactName={selectedContact?.name || ''}
                                    dealTitle={selectedDeal?.title || ''}
                                />
                            </div>

                            {/* 7. Attachments List */}
                            {attachments.length > 0 && (
                                <div className="space-y-2">
                                    <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                                        Attachments ({attachments.length})
                                    </span>
                                    <div className="flex flex-wrap gap-2">
                                        {attachments.map((att, idx) => (
                                            <div
                                                key={idx}
                                                className="flex items-center gap-2 pl-2.5 pr-1.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs shadow-2xs"
                                            >
                                                <Paperclip className="w-3.5 h-3.5 text-blue-500" />
                                                <span className="max-w-[160px] truncate font-medium text-slate-700 dark:text-slate-300">
                                                    {att.filename}
                                                </span>
                                                <span className="text-[10px] text-slate-400 font-mono">
                                                    ({formatBytes(att.size)})
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() => removeAttachment(idx)}
                                                    className="p-1 hover:text-red-500 rounded-md transition-colors"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>


                    </ScrollArea>

                    {/* Footer with Attachment button and Send */}
                    <SheetFooter className="p-4 border-t  flex items-center justify-between gap-3 flex-row ">
                        <div className="flex items-center gap-2">
                            <input
                                type="file"
                                multiple
                                ref={fileInputRef}
                                onChange={handleFileSelect}
                                className="hidden"
                            />
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => fileInputRef.current?.click()}
                                className="h-9 text-xs rounded-xl gap-1.5 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
                            >
                                <Paperclip className="w-3.5 h-3.5 text-slate-500" />
                                <span>Attach Files</span>
                            </Button>

                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onOpenChange(false)}
                                className="text-xs rounded-xl h-9 text-slate-500"
                            >
                                Cancel
                            </Button>
                        </div>

                        <Button
                            onClick={onSend}
                            disabled={isSending || !to.trim() || !subject.trim() || !body.trim()}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl gap-2 shadow-xs h-9 px-6 transition-all"
                        >
                            {isSending ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Send className="w-4 h-4" />
                            )}
                            Send via Resend
                        </Button>
                    </SheetFooter>


                </div>
            </SheetContent>
        </Sheet>
    );
}
