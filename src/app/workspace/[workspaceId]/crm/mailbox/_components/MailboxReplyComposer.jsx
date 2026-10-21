'use client';

import React, { useState } from 'react';
import { Send, CornerUpLeft, FileSpreadsheet, Loader2, Sparkles, Smile, Bold, Italic, Maximize2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export default function MailboxReplyComposer({
    recipient,
    replyBody,
    isSending,
    onReplyChange,
    onSendReply,
    onOpenFullComposer,
    onLinkQuotation
}) {
    const quickReplies = [
        "Received with thanks, reviewing now!",
        "Sounds good! Let's schedule a call this week.",
        "Thank you for the update.",
        "Working on this and will get back to you shortly."
    ];

    const handleKeyDown = (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            if (replyBody.trim() && !isSending) {
                onSendReply();
            }
        }
    };

    const handleInsertCanned = (text) => {
        const next = replyBody ? `${replyBody}\n${text}` : text;
        onReplyChange(next);
    };

    return (
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            {/* Quick Canned Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2.5 mb-2 no-scrollbar">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-purple-500" /> Quick:
                </span>
                {quickReplies.map((qr, idx) => (
                    <button
                        key={idx}
                        type="button"
                        onClick={() => handleInsertCanned(qr)}
                        className="text-[11px] px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800 dark:hover:bg-slate-700/80 text-slate-600 dark:text-slate-300 font-medium shrink-0 transition-colors cursor-pointer border border-slate-200/60 dark:border-slate-700"
                    >
                        {qr}
                    </button>
                ))}
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500/20 bg-slate-50/60 dark:bg-slate-900/60 p-3.5 transition-all shadow-xs">
                {/* Header Context */}
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200/60 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-1.5">
                        <CornerUpLeft className="w-3.5 h-3.5 text-blue-500" />
                        <span>Replying to <span className="font-semibold text-slate-700 dark:text-slate-300">{recipient || 'thread participants'}</span></span>
                    </div>
                    <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full font-medium">Dispatched via Resend</span>
                </div>

                {/* Reply Textarea */}
                <Textarea
                    rows={3}
                    placeholder="Type your reply message here... (Press Ctrl+Enter to send)"
                    value={replyBody}
                    onChange={(e) => onReplyChange(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="border-none bg-transparent resize-none focus-visible:ring-0 p-0 text-xs text-slate-800 dark:text-slate-200 placeholder:text-slate-400"
                />

                {/* Bottom Action Row */}
                <div className="flex items-center justify-between pt-2.5 mt-2 border-t border-slate-200/60 dark:border-slate-800">
                    <div className="flex items-center gap-1.5">
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={onLinkQuotation}
                            className="h-8 text-xs text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 gap-1.5 rounded-xl hover:bg-blue-50/80 dark:hover:bg-blue-950/40"
                        >
                            <FileSpreadsheet className="w-3.5 h-3.5 text-blue-500" />
                            <span>Link Quotation</span>
                        </Button>

                        {onOpenFullComposer && (
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={onOpenFullComposer}
                                className="h-8 text-xs text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 gap-1.5 rounded-xl hover:bg-blue-50/80 dark:hover:bg-blue-950/40"
                                title="Expand to full WYSIWYG editor with attachments & templates"
                            >
                                <Maximize2 className="w-3.5 h-3.5 text-blue-500" />
                                <span>Full Editor</span>
                            </Button>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-400 hidden sm:inline">Ctrl+Enter to send</span>
                        <Button
                            onClick={onSendReply}
                            disabled={isSending || !replyBody.trim()}
                            className="h-8 px-4 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl gap-2 shadow-xs transition-all"
                        >
                            {isSending ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                                <Send className="w-3.5 h-3.5" />
                            )}
                            Send Reply
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
