'use client';

import React from 'react';
import { 
    Inbox, 
    Send, 
    File, 
    Trash2, 
    Archive, 
    AlertCircle, 
    Star, 
    Tag 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { 
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from '@/components/ui/scroll-area';

export const MailSidebar = ({ 
    activeFolder, 
    onFolderChange, 
    counts = {}, 
    accounts = [], 
    labels = [],
    selectedAccountId, 
    onAccountChange 
}) => {
    const folders = [
        { id: 'INBOX', label: 'Inbox', icon: Inbox, color: 'text-blue-500' },
        { id: 'SENT', label: 'Sent', icon: Send, color: 'text-green-500' },
        { id: 'DRAFT', label: 'Drafts', icon: File, color: 'text-orange-500' },
        { id: 'STARRED', label: 'Starred', icon: Star, color: 'text-yellow-500' },
        { id: 'TRASH', label: 'Trash', icon: Trash2, color: 'text-rose-500' },
        { id: 'SPAM', label: 'Spam', icon: AlertCircle, color: 'text-purple-500' },
        { id: 'ARCHIVE', label: 'Archive', icon: Archive, color: 'text-slate-500' },
    ];

    const userLabels = labels.filter(l => l.type === 'user');

    return (
        <div className="w-64 h-full flex flex-col bg-card/10 backdrop-blur-md border-r border-border/40 p-4 space-y-6">
            <div className="space-y-4 px-1">
                <div className="flex items-center gap-3">
                    <div className="bg-primary/20 p-2 rounded-lg">
                        <Inbox className="w-6 h-6 text-primary" />
                    </div>
                    <h2 className="text-lg font-bold tracking-tight">Mailbox</h2>
                </div>

                {accounts.length > 0 && (
                    <div className="animate-in fade-in slide-in-from-top-2 duration-500">
                        <Select value={selectedAccountId} onValueChange={onAccountChange}>
                            <SelectTrigger className="w-full bg-muted/30 border-none rounded-xl h-12 font-bold text-[10px] uppercase tracking-wider focus:ring-1 focus:ring-primary/50 shadow-inner">
                                <SelectValue placeholder="Select Account" />
                            </SelectTrigger>
                            <SelectContent className="rounded-2xl border-border/20 shadow-2xl backdrop-blur-xl">
                                {accounts.map((account) => (
                                    <SelectItem 
                                        key={account.id} 
                                        value={account.id}
                                        className="font-bold text-[10px] py-3 tracking-wide"
                                    >
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-primary" />
                                            {account.email || "Gmail Account"}
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                )}
            </div>

            <div className="space-y-1">
                {folders.map((folder) => {
                    const Icon = folder.icon;
                    const isActive = activeFolder === folder.id;
                    const count = counts[folder.id];

                    return (
                        <Button
                            key={folder.id}
                            variant="ghost"
                            onClick={() => onFolderChange(folder.id)}
                            className={cn(
                                "w-full justify-start gap-3 h-11 px-3 rounded-xl transition-all font-bold text-[11px] tracking-widest uppercase",
                                isActive 
                                    ? "bg-primary/10 text-primary shadow-sm" 
                                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                            )}
                        >
                            <Icon className={cn("w-4 h-4", isActive ? "" : folder.color)} />
                            <span className="flex-1 text-left">{folder.label}</span>
                            {count > 0 && (
                                <span className={cn(
                                    "px-2 py-0.5 rounded-full text-[10px] font-extrabold",
                                    isActive ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                                )}>
                                    {count}
                                </span>
                            )}
                        </Button>
                    );
                })}
            </div>

            <div className="pt-6 border-t border-border/20 flex-1 min-h-0 flex flex-col">
                <h3 className="px-3 text-[10px] font-bold text-muted-foreground tracking-[0.2em] mb-4 uppercase opacity-50">User Labels</h3>
                <ScrollArea className="flex-1">
                    <div className="space-y-1 pr-3">
                        {userLabels.length > 0 ? userLabels.map(label => (
                            <Button 
                                key={label.id} 
                                variant="ghost" 
                                onClick={() => onFolderChange(label.id)}
                                className={cn(
                                    "w-full justify-start gap-3 h-10 px-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                    activeFolder === label.id ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted/30"
                                )}
                            >
                                <Tag className="w-3.5 h-3.5 opacity-50" /> 
                                <span className="truncate">{label.name}</span>
                            </Button>
                        )) : (
                            <p className="px-3 text-[10px] italic text-muted-foreground py-4">No custom labels found.</p>
                        )}
                    </div>
                </ScrollArea>
            </div>
        </div>
    );
};
