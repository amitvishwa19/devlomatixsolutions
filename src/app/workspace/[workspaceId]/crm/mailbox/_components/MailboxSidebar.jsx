'use client';

import React from 'react';
import {
    Inbox,
    Star,
    Send,
    Archive,
    Trash2,
    Plus,
    ChevronDown,
    Check,
    User,
    Briefcase,
    Layers,
    Mail
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function MailboxSidebar({
    currentFolder,
    counts,
    onSelectFolder,
    onOpenCompose,
    mailboxes = [],
    activeMailboxEmail = 'ALL',
    onSelectMailbox = () => {}
}) {
    const activeMailbox = mailboxes.find((m) => m.email === activeMailboxEmail) || mailboxes[0] || {
        id: 'all',
        email: 'ALL',
        label: 'All Inboxes',
        type: 'ALL'
    };

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
            {/* Mailbox Identity Switcher */}
            {mailboxes && mailboxes.length > 1 && (
                <div className="p-3 pb-0">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button
                                type="button"
                                className="w-full flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-blue-400 transition-all text-left cursor-pointer group"
                            >
                                <div className="flex items-center gap-2 min-w-0 pr-1">
                                    <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 font-bold text-xs">
                                        {activeMailbox?.type === 'ALL' ? (
                                            <Layers className="w-3.5 h-3.5" />
                                        ) : activeMailbox?.type === 'PERSONAL' ? (
                                            <User className="w-3.5 h-3.5" />
                                        ) : (
                                            <Briefcase className="w-3.5 h-3.5" />
                                        )}
                                    </div>
                                    <div className="min-w-0">
                                        <div className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                                            {activeMailbox?.label || 'All Inboxes'}
                                        </div>
                                        <div className="text-[10px] text-slate-500 truncate">
                                            {activeMailbox?.email === 'ALL' ? 'Unified Mailbox' : activeMailbox?.email}
                                        </div>
                                    </div>
                                </div>
                                <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 shrink-0" />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-64 z-[9999] shadow-xl p-1 text-xs">
                            <DropdownMenuLabel className="text-[10px] uppercase tracking-wider text-slate-400 font-bold px-2 py-1">
                                Switch Mailbox
                            </DropdownMenuLabel>
                            {mailboxes.map((mb) => {
                                const isSelected = (activeMailboxEmail || 'ALL') === mb.email;
                                return (
                                    <DropdownMenuItem
                                        key={mb.id}
                                        onClick={() => onSelectMailbox(mb.email)}
                                        className={`flex items-center justify-between px-2 py-1.5 rounded-lg cursor-pointer ${
                                            isSelected ? 'bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-semibold' : ''
                                        }`}
                                    >
                                        <div className="flex items-center gap-2 min-w-0">
                                            {mb.type === 'ALL' ? (
                                                <Layers className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                                            ) : mb.type === 'PERSONAL' ? (
                                                <User className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                                            ) : (
                                                <Briefcase className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                                            )}
                                            <div className="min-w-0">
                                                <div className="truncate text-xs">{mb.label}</div>
                                                {mb.email !== 'ALL' && (
                                                    <div className="text-[10px] text-slate-400 truncate">{mb.email}</div>
                                                )}
                                            </div>
                                        </div>
                                        {isSelected && <Check className="w-3.5 h-3.5 text-blue-600 shrink-0 ml-1" />}
                                    </DropdownMenuItem>
                                );
                            })}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            )}

            {/* Compose Button */}
            <div className="p-3 border-b border-slate-100 dark:border-slate-800">
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
