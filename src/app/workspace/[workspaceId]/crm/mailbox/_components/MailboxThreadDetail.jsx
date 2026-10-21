'use client';

import React, { useState } from 'react';
import {
    Star,
    Archive,
    Trash2,
    ArrowLeft,
    User,
    DollarSign,
    Paperclip,
    Loader2,
    Copy,
    Printer,
    Check
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import MailboxReplyComposer from './MailboxReplyComposer';

function formatDisplayName(raw, fallback = 'Team Member') {
    if (!raw) return fallback;
    let cleaned = String(raw).replace(/^['"]+|['"]+$/g, '').trim();
    const match = cleaned.match(/^(?:([^<]+)\s*)?<([^>]+)>/);
    let name = '';
    let email = '';
    if (match) {
        name = match[1]?.trim() || '';
        email = match[2]?.trim() || '';
    } else if (cleaned.includes('@')) {
        email = cleaned.replace(/[<>]/g, '').trim();
    } else {
        name = cleaned;
    }

    if (!name && email) {
        name = email.split('@')[0];
    }

    if (name && /[._-]/.test(name)) {
        name = name.split(/[._-]+/).filter(Boolean).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
    } else if (name && name.includes(' ')) {
        name = name.split(/\s+/).filter(Boolean).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    } else if (name) {
        name = name.charAt(0).toUpperCase() + name.slice(1);
    }

    return email ? `${name} <${email}>` : (name || fallback);
}

export default function MailboxThreadDetail({
    thread,
    isLoading,
    replyBody,
    isSendingReply,
    onBack,
    onToggleStar,
    onMoveFolder,
    onReplyChange,
    onSendReply,
    onOpenFullComposer,
    onLinkQuotation
}) {
    if (isLoading) {
        return (
            <div className="flex-1 flex items-center justify-center text-slate-400">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
        );
    }

    if (!thread) return null;

    // Resolve recipient for quick reply
    const lastMsg = thread.messages?.[thread.messages.length - 1];
    const replyRecipient = lastMsg?.direction === 'INBOUND' ? lastMsg.fromEmail : thread.contact?.email;

    return (
        <section className="flex-1 flex flex-col h-full overflow-hidden bg-white dark:bg-slate-900">
            {/* Thread Action Header */}
            <div className="p-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/60 dark:bg-slate-900/80">
                <div className="flex items-center gap-1.5">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 md:hidden"
                        onClick={onBack}
                        title="Back to list"
                    >
                        <ArrowLeft className="w-4 h-4" />
                    </Button>

                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onToggleStar(thread.id)}
                        className="h-8 w-8 text-slate-400 hover:text-amber-500 rounded-lg"
                        title={thread.isStarred ? 'Unstar' : 'Star'}
                    >
                        <Star className={`w-4 h-4 ${thread.isStarred ? 'text-amber-500 fill-amber-500' : ''}`} />
                    </Button>

                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onMoveFolder(thread.id, 'ARCHIVE')}
                        className="h-8 w-8 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 rounded-lg"
                        title="Archive"
                    >
                        <Archive className="w-4 h-4" />
                    </Button>

                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onMoveFolder(thread.id, 'TRASH')}
                        className="h-8 w-8 text-slate-500 hover:text-red-600 rounded-lg"
                        title="Delete"
                    >
                        <Trash2 className="w-4 h-4" />
                    </Button>

                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => window.print()}
                        className="h-8 w-8 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 rounded-lg hidden sm:flex"
                        title="Print Thread"
                    >
                        <Printer className="w-4 h-4" />
                    </Button>
                </div>

                {/* Deal & Contact Meta Bar */}
                <div className="flex items-center gap-2">
                    {thread.contact && (
                        <Badge variant="outline" className="text-xs bg-white dark:bg-slate-800 gap-1.5 py-1 px-2.5 rounded-lg border-slate-200 dark:border-slate-700">
                            <User className="w-3 h-3 text-blue-500" />
                            <span className="font-semibold text-slate-700 dark:text-slate-300">{thread.contact.name}</span>
                        </Badge>
                    )}
                    {thread.deal && (
                        <Badge variant="secondary" className="text-xs gap-1.5 py-1 px-2.5 rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/50 dark:border-emerald-900/50">
                            <DollarSign className="w-3 h-3" />
                            <span className="font-semibold">{thread.deal.title}</span>
                            {thread.deal.stage?.name && (
                                <span className="opacity-75 font-normal">({thread.deal.stage.name})</span>
                            )}
                        </Badge>
                    )}
                </div>
            </div>

            {/* Subject Title */}
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                <h2 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                    {thread.subject}
                </h2>
            </div>

            {/* Message History Chain */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5">
                {thread.messages?.map((msg) => {
                    const isInbound = msg.direction === 'INBOUND';
                    const displaySender = isInbound
                        ? formatDisplayName(msg.from || msg.fromEmail, 'Contact')
                        : `${formatDisplayName(msg.sentByUser?.displayName || msg.from, 'Team Member')} (via CRM)`;
                    const senderInitial = displaySender.charAt(0).toUpperCase();

                    const handleCopyMessage = () => {
                        const content = msg.bodyText || msg.snippet || '';
                        if (content) {
                            navigator.clipboard.writeText(content);
                            toast.success('Message content copied to clipboard');
                        }
                    };

                    return (
                        <article
                            key={msg.id}
                            className={`rounded-2xl border p-5 transition-shadow ${
                                isInbound
                                    ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xs'
                                    : 'bg-blue-50/40 dark:bg-blue-950/20 border-blue-200/60 dark:border-blue-900/40'
                            }`}
                        >
                            {/* Message Header */}
                            <div className="flex items-start justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800/80">
                                <div className="flex items-center gap-3">
                                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-xs ${
                                        isInbound
                                            ? 'bg-gradient-to-tr from-slate-600 to-slate-800'
                                            : 'bg-gradient-to-tr from-blue-600 to-indigo-600'
                                    }`}>
                                        {senderInitial}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                                                {displaySender}
                                            </span>
                                            <Badge variant="outline" className={`text-[10px] py-0 h-4 font-normal ${
                                                isInbound
                                                    ? 'text-slate-600 border-slate-200 dark:border-slate-700'
                                                    : 'text-blue-700 border-blue-200 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60'
                                            }`}>
                                                {isInbound ? 'Incoming' : 'Outbound Reply'}
                                            </Badge>
                                        </div>
                                        <p className="text-[11px] text-slate-400 mt-0.5">
                                            To: {Array.isArray(msg.to) ? msg.to.join(', ') : msg.to}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <time className="text-[11px] text-slate-400" dateTime={msg.createdAt}>
                                        {new Date(msg.createdAt).toLocaleString(undefined, {
                                            month: 'short',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </time>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={handleCopyMessage}
                                        className="h-6 w-6 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                                        title="Copy message content"
                                    >
                                        <Copy className="w-3 h-3" />
                                    </Button>
                                </div>
                            </div>

                            {/* Message Content */}
                            <div className="text-xs leading-relaxed text-slate-700 dark:text-slate-300">
                                {msg.bodyHtml ? (
                                    <div
                                        className="prose dark:prose-invert max-w-none text-xs"
                                        dangerouslySetInnerHTML={{ __html: msg.bodyHtml }}
                                    />
                                ) : (
                                    <pre className="font-sans whitespace-pre-wrap">{msg.bodyText || msg.snippet}</pre>
                                )}
                            </div>

                            {/* Attachments */}
                            {msg.attachments && msg.attachments.length > 0 && (
                                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap gap-2">
                                    {msg.attachments.map(att => (
                                        <a
                                            key={att.id}
                                            href={att.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-medium transition-colors"
                                        >
                                            <Paperclip className="w-3 h-3 text-slate-400" />
                                            <span>{att.filename}</span>
                                            <span className="text-[10px] text-slate-400">({Math.round((att.size || 0) / 1024)} KB)</span>
                                        </a>
                                    ))}
                                </div>
                            )}
                        </article>
                    );
                })}
            </div>

            {/* Quick Reply Bar */}
            <MailboxReplyComposer
                recipient={replyRecipient}
                replyBody={replyBody}
                isSending={isSendingReply}
                onReplyChange={onReplyChange}
                onSendReply={onSendReply}
                onOpenFullComposer={onOpenFullComposer}
                onLinkQuotation={onLinkQuotation}
            />
        </section>
    );
}
