'use client';

import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Share2,
    Eye,
    ThumbsUp,
    MessageSquare,
    Repeat,
    Send,
    Heart,
    Bookmark,
    CheckCircle2
} from 'lucide-react';
import { toast } from 'sonner';

export function PostPreviewModal({ open, onOpenChange, post }) {
    if (!post) return null;

    const channel = post.channel || 'LinkedIn';

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md bg-card border-border/80 p-0 overflow-hidden flex flex-col max-h-[85vh]">
                <DialogHeader className="p-4 border-b border-border/60 bg-sky-500/10 flex flex-row items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-500">
                            <Eye className="w-4 h-4" />
                        </div>
                        <div>
                            <DialogTitle className="text-sm font-bold text-foreground">
                                Live Feed Mockup: {channel}
                            </DialogTitle>
                            <DialogDescription className="text-xs text-muted-foreground">
                                Realistic audience view preview
                            </DialogDescription>
                        </div>
                    </div>
                    <Badge variant="outline" className="text-[9px] font-mono">
                        {post.status}
                    </Badge>
                </DialogHeader>

                <div className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
                    {/* Mockup Card */}
                    <div className="p-4 rounded-xl bg-secondary/30 border border-border/60 space-y-3">
                        {/* Profile Header */}
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-sky-600 flex items-center justify-center text-white font-bold text-xs">
                                D
                            </div>
                            <div>
                                <div className="flex items-center gap-1">
                                    <span className="font-bold text-foreground text-xs">Devlomatix Solutions</span>
                                    <CheckCircle2 className="w-3 h-3 text-sky-400" />
                                </div>
                                <span className="text-[10px] text-muted-foreground">@devlomatix • {post.schedule || 'Scheduled'}</span>
                            </div>
                        </div>

                        {/* Post Text */}
                        <div className="text-xs text-foreground whitespace-pre-wrap leading-relaxed">
                            {post.content}
                        </div>

                        {/* Mock Media Banner */}
                        {post.hasMedia && (
                            <div className="h-36 rounded-lg bg-gradient-to-tr from-sky-500/20 via-purple-500/10 to-emerald-500/20 border border-border/60 flex items-center justify-center text-center p-4">
                                <div className="space-y-1">
                                    <div className="font-bold text-xs text-foreground">Devlomatix Workspace Suite</div>
                                    <span className="text-[10px] text-muted-foreground block">Automate Everything • Built for Modern Teams</span>
                                </div>
                            </div>
                        )}

                        {/* Action Bar Simulation */}
                        <div className="flex items-center justify-between pt-2 border-t border-border/40 text-muted-foreground text-[11px]">
                            <div className="flex items-center gap-1 hover:text-sky-400 cursor-pointer">
                                <ThumbsUp className="w-3.5 h-3.5" /> <span>Like</span>
                            </div>
                            <div className="flex items-center gap-1 hover:text-sky-400 cursor-pointer">
                                <MessageSquare className="w-3.5 h-3.5" /> <span>Comment</span>
                            </div>
                            <div className="flex items-center gap-1 hover:text-sky-400 cursor-pointer">
                                <Repeat className="w-3.5 h-3.5" /> <span>Repost</span>
                            </div>
                            <div className="flex items-center gap-1 hover:text-sky-400 cursor-pointer">
                                <Send className="w-3.5 h-3.5" /> <span>Send</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-3.5 border-t border-border/60 bg-secondary/15 flex justify-end">
                    <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)} className="h-8 text-xs">
                        Close Preview
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
