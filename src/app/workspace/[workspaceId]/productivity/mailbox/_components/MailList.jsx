import React, { useRef } from 'react';
import { Search, Loader2, Star, Paperclip, MoreVertical, RefreshCw, Inbox, Circle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { useVirtualizer } from '@tanstack/react-virtual';

export const MailList = ({
    messages = [],
    selectedId,
    onSelect,
    loading = false,
    search = '',
    onSearchChange,
    onRefresh
}) => {
    const parentRef = useRef(null);

    const rowVirtualizer = useVirtualizer({
        count: messages.length,
        getScrollElement: () => parentRef.current,
        estimateSize: () => 92, // Reduced for high density
        overscan: 10,
    });

    return (
        <div className="flex-1 flex flex-col h-full min-h-0 bg-transparent border-r border-border/20 w-full overflow-hidden animate-in fade-in duration-700">
            <div className="px-5 py-5 border-b border-border/10 bg-background/5 backdrop-blur-md flex-shrink-0">
                <div className="flex items-center gap-3">
                    <div className="relative flex-1 group">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <Input
                            placeholder="Find conversations..."
                            value={search}
                            onChange={(e) => onSearchChange(e.target.value)}
                            className="pl-10 h-10 bg-muted/30 border-white/5 rounded-md focus-visible:ring-1 focus-visible:ring-primary shadow-inner font-bold text-[11px] tracking-wide"
                        />
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onRefresh}
                        disabled={loading}
                        className="h-10 w-10 rounded-md hover:bg-primary/10 hover:text-primary transition-all border border-transparent hover:border-primary/20"
                    >
                        <RefreshCw className={cn("w-3.5 h-3.5", loading && "animate-spin")} />
                    </Button>
                </div>
            </div>

            <div 
                ref={parentRef}
                className="flex-1 min-h-0 overflow-y-auto custom-scrollbar bg-black/5"
            >
                {loading ? (
                    <div className="flex flex-col items-center justify-center h-64 space-y-4 opacity-50">
                        <div className="relative">
                            <Loader2 className="w-10 h-10 animate-spin text-primary" />
                            <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full"></div>
                        </div>
                        <span className="text-[10px] uppercase font-bold tracking-[0.2em] animate-pulse">Syncing Cloud</span>
                    </div>
                ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground opacity-30 select-none">
                        <Inbox className="w-16 h-16 mb-4 stroke-[1px]" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Inbox Zero Meta Achieved</span>
                    </div>
                ) : (
                    <div 
                        style={{
                            height: `${rowVirtualizer.getTotalSize()}px`,
                            width: '100%',
                            position: 'relative',
                        }}
                    >
                        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                            const message = messages[virtualRow.index];
                            const isSelected = selectedId === message.id;

                            return (
                                <motion.div
                                    key={message.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    onClick={() => onSelect(message.id)}
                                    style={{
                                        position: 'absolute',
                                        top: `${virtualRow.start}px`,
                                        left: 0,
                                        width: '100%',
                                        height: `${virtualRow.size}px`,
                                        padding: '4px 8px', // Outer padding for tile separation
                                    }}
                                >
                                    <div className={cn(
                                        "w-full h-full rounded-md cursor-pointer transition-all duration-300 relative group overflow-hidden border px-4 py-3 flex flex-col justify-center",
                                        isSelected 
                                            ? "bg-primary/15 border-primary/30 shadow-lg shadow-primary/5 ring-1 ring-primary/20" 
                                            : "bg-white/[0.02] border-white/5 hover:bg-white/[0.05] hover:border-white/10 hover:shadow-md"
                                    )}>
                                        {/* Status Indicator */}
                                        {!message.isRead && (
                                            <div className="absolute left-1.5 top-1/2 -translate-y-1/2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(var(--primary),0.8)]" />
                                            </div>
                                        )}

                                        <div className="flex items-center justify-between gap-3 mb-1.5">
                                            <h4 className={cn(
                                                "text-[11px] truncate flex-1 tracking-tight",
                                                !message.isRead ? "font-bold text-foreground" : "font-semibold text-muted-foreground/80"
                                            )}>
                                                {message.from}
                                            </h4>
                                            <span className="text-[9px] text-muted-foreground font-bold whitespace-nowrap opacity-60">
                                                {formatDistanceToNow(new Date(message.date), { addSuffix: true })}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-2 mb-1">
                                            <h5 className={cn(
                                                "text-[12px] truncate flex-1 tracking-tight",
                                                !message.isRead ? "font-bold text-foreground" : "font-medium text-muted-foreground"
                                            )}>
                                                {message.subject}
                                            </h5>
                                            {message.hasAttachments && <Paperclip className="w-3 h-3 opacity-40" />}
                                        </div>

                                        <p className="text-[10px] text-muted-foreground font-medium line-clamp-1 opacity-60 group-hover:opacity-100 transition-opacity">
                                            {message.snippet}
                                        </p>

                                        {/* Quick Actions overlay */}
                                        <div className="absolute right-3 bottom-3 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all translate-y-1 group-hover:translate-y-0">
                                            <Star className={cn("w-3 h-3 transition-colors", message.isStarred ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground hover:text-yellow-500")} />
                                            <MoreVertical className="w-3 h-3 text-muted-foreground" />
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};
