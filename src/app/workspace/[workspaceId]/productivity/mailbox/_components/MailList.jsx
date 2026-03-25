'use client';

import React from 'react';
import { Search, Loader2, Star, Paperclip, MoreVertical, RefreshCw } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

export const MailList = ({
    messages = [],
    selectedId,
    onSelect,
    loading = false,
    search = '',
    onSearchChange,
    onRefresh
}) => {
    return (
        <div className="flex-1 flex flex-col h-full min-h-0 bg-transparent border-r border-border/20 w-full overflow-hidden">
            <div className="pl-4 pr-6 py-4 border-b border-border/20 bg-background/5 backdrop-blur-sm flex-shrink-0">
                <div className="flex items-center gap-2">
                    <div className="relative flex-1 group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <Input
                            placeholder="Search messages..."
                            value={search}
                            onChange={(e) => onSearchChange(e.target.value)}
                            className="pl-10 h-10 bg-muted/40 border-none rounded-xl focus-visible:ring-1 focus-visible:ring-primary shadow-inner font-bold text-[11px] tracking-widest"
                        />
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onRefresh}
                        disabled={loading}
                        className="h-10 w-10 rounded-xl hover:bg-primary/10 hover:text-primary transition-all shadow-sm"
                    >
                        <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
                    </Button>
                </div>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar">
                {loading ? (
                    <div className="flex flex-col items-center justify-center h-64 space-y-4 opacity-50">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        <span className="text-[10px] font-bold tracking-widest uppercase">Syncing your inbox...</span>
                    </div>
                ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-muted-foreground opacity-50">
                        <Inbox className="w-12 h-12 mb-4" />
                        <span className="text-[10px] font-bold tracking-widest uppercase">No messages found</span>
                    </div>
                ) : (
                    <div className="divide-y divide-border/10">
                        <AnimatePresence mode="popLayout">
                            {messages.map((message) => (
                                <motion.div
                                    key={message.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    layout
                                    onClick={() => onSelect(message.id)}
                                    className={cn(
                                        "w-full pl-4 pr-12 py-4 cursor-pointer transition-all hover:bg-muted/30 relative group overflow-hidden",
                                        selectedId === message.id ? "bg-primary/5 before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-primary" : ""
                                    )}
                                >
                                    <div className="flex items-center justify-between gap-4 mb-1">
                                        <h4 className={cn(
                                            "text-xs truncate flex-1",
                                            !message.isRead ? "font-extrabold text-foreground" : "font-semibold text-muted-foreground"
                                        )}>
                                            {message.from}
                                        </h4>
                                        <span className="text-[10px] text-muted-foreground font-bold whitespace-nowrap flex-shrink-0">
                                            {formatDistanceToNow(new Date(message.date), { addSuffix: true })}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <h5 className={cn(
                                            "text-[11px] truncate flex-1",
                                            !message.isRead ? "font-bold" : "text-muted-foreground"
                                        )}>
                                            {message.subject}
                                        </h5>
                                        {message.hasAttachments && <Paperclip className="w-3 h-3 text-muted-foreground" />}
                                    </div>
                                    <p className="text-[10px] text-muted-foreground line-clamp-2 leading-relaxed opacity-70">
                                        {message.snippet}
                                    </p>

                                    <div className="absolute right-8 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                        <Star className={cn("w-3.5 h-3.5", message.isStarred ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground")} />
                                        <MoreVertical className="w-3.5 h-3.5 text-muted-foreground" />
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </div>
    );
};

// Need Inbox for empty state
import { Inbox } from 'lucide-react';
