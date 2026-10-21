'use client';

import React from 'react';
import {
    Inbox,
    Star,
    Send,
    Archive,
    Trash2,
    Plus
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function MailboxSidebar({
    currentFolder,
    counts,
    onSelectFolder,
    onOpenCompose
}) {
    const folders = [
        {
            id: 'INBOX',
            label: 'Inbox',
            icon: Inbox,
            count: counts.unread,
            showCountBadge: counts.unread > 0,
            badgeClass: 'bg-blue-600 text-white font-bold'
        },
        {
            id: 'STARRED',
            label: 'Starred',
            icon: Star,
            iconClass: 'text-amber-500 fill-amber-500/20',
            count: counts.starred,
            showCountBadge: counts.starred > 0
        },
        {
            id: 'SENT',
            label: 'Sent',
            icon: Send,
            count: counts.sent,
            showCountBadge: counts.sent > 0
        },
        {
            id: 'ARCHIVE',
            label: 'Archive',
            icon: Archive,
            count: counts.archive,
            showCountBadge: false
        },
        {
            id: 'TRASH',
            label: 'Trash',
            icon: Trash2,
            count: counts.trash,
            showCountBadge: false
        }
    ];

    return (
        <aside className="w-64 border-r flex flex-col shrink-0 bg-card h-full min-h-0">
            {/* Compose Button */}
            <div className="p-4 border-b border-slate-100 dark:border-slate-800">
                <Button
                    onClick={onOpenCompose}
                    className="w-full justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-sm font-semibold rounded-xl h-10"
                >
                    <Plus className="w-4 h-4" />
                    Compose Email
                </Button>
            </div>

            {/* Folder Navigation */}
            <nav className="flex-1 overflow-y-auto p-3 space-y-1.5" aria-label="Mailbox folders">
                {folders.map(folder => {
                    const IconComponent = folder.icon;
                    const isActive = currentFolder === folder.id;

                    return (
                        <Button
                            key={folder.id}
                            variant={isActive ? "secondary" : "ghost"}
                            onClick={() => onSelectFolder(folder.id)}
                            className={`w-full justify-between px-3 py-2.5 h-10 rounded-xl text-sm font-medium transition-all ${isActive
                                ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 font-semibold shadow-xs'
                                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <IconComponent className={`w-4 h-4 ${folder.iconClass || (isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500')}`} />
                                <span>{folder.label}</span>
                            </div>

                            {folder.showCountBadge && (
                                <Badge className={`text-xs px-2 py-0.5 rounded-full ${folder.badgeClass || 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'}`}>
                                    {folder.count}
                                </Badge>
                            )}
                        </Button>
                    );
                })}

                {/* Resend Status Card */}
                <div className="pt-6 pb-2 px-1">
                    <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800">
                        <div className="flex items-center gap-2 mb-1.5">
                            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">Resend Inbound Active</span>
                        </div>
                        <p className="text-[11px] text-slate-500 leading-relaxed">
                            Inbound emails received via Resend webhook are auto-saved to CRM.
                        </p>
                    </div>
                </div>
            </nav>
        </aside>
    );
}
