'use client';

import React from 'react';
import { Star } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

function formatTimeAgo(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMin = Math.floor(diffMs / 60000);
    const diffHr = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHr / 24);

    if (diffMin < 1) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHr < 24) return `${diffHr}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function extractDisplayName(raw) {
    if (!raw) return 'Unknown Sender';
    let cleaned = String(raw).replace(/^['"]+|['"]+$/g, '').trim();
    const match = cleaned.match(/^(?:([^<]+)\s*)?<([^>]+)>/);
    let name = '';
    if (match && match[1]?.trim()) {
        name = match[1].trim();
    } else if (cleaned.includes('@')) {
        name = cleaned.replace(/[<>]/g, '').split('@')[0];
    } else {
        name = cleaned;
    }

    // Beautify: handle dots, hyphens, underscores e.g. "amit.vishwakarma" -> "Amit Vishwakarma"
    if (/[._-]/.test(name)) {
        return name.split(/[._-]+/).filter(Boolean).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
    }
    if (name.includes(' ')) {
        return name.split(/\s+/).filter(Boolean).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    }
    return name.charAt(0).toUpperCase() + name.slice(1);
}

export default function MailboxThreadCard({
    thread,
    isSelected,
    onSelect,
    onToggleStar
}) {
    const isUnread = (thread.unreadCount || 0) > 0;
    const rawSender = thread.contact?.name || thread.messages?.[0]?.from || 'Unknown Sender';
    const contactName = extractDisplayName(rawSender);
    const initial = contactName.charAt(0).toUpperCase();

    return (
        <div
            onClick={onSelect}
            className={`p-3.5 cursor-pointer transition-all border-b border-slate-100 dark:border-slate-800/60 relative ${
                isSelected
                    ? 'bg-blue-50/90 dark:bg-blue-950/40 border-l-4 border-l-blue-600'
                    : isUnread
                        ? 'bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                        : 'bg-slate-50/40 dark:bg-slate-900/30 hover:bg-slate-50 dark:hover:bg-slate-800/50'
            }`}
        >
            <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                    {/* Avatar */}
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-xs">
                        {initial}
                    </div>

                    <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                            <span className={`text-xs truncate ${isUnread ? 'font-bold text-slate-900 dark:text-slate-100' : 'font-medium text-slate-700 dark:text-slate-300'}`}>
                                {contactName}
                            </span>
                            {isUnread && (
                                <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                    <span className="text-[11px] text-slate-400">
                        {formatTimeAgo(thread.lastMessageAt)}
                    </span>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                            e.stopPropagation();
                            onToggleStar(thread.id);
                        }}
                        className="h-6 w-6 text-slate-300 hover:text-amber-500 hover:bg-transparent"
                    >
                        <Star className={`w-3.5 h-3.5 ${thread.isStarred ? 'text-amber-500 fill-amber-500' : ''}`} />
                    </Button>
                </div>
            </div>

            {/* Subject */}
            <h4 className={`text-xs mt-1.5 truncate ${isUnread ? 'font-bold text-slate-900 dark:text-white' : 'font-medium text-slate-800 dark:text-slate-200'}`}>
                {thread.subject}
            </h4>

            {/* Snippet */}
            <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                {thread.snippet || 'No message preview'}
            </p>

            {/* Deal / Contact tags */}
            {(thread.deal || thread.contact?.type) && (
                <div className="flex items-center gap-1.5 mt-2">
                    {thread.deal && (
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/30">
                            🏷️ {thread.deal.title}
                        </Badge>
                    )}
                    {thread.contact?.type && (
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">
                            {thread.contact.type}
                        </Badge>
                    )}
                </div>
            )}
        </div>
    );
}
