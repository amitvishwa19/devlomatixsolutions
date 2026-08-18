'use client';

import React, { useState } from 'react';
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
    BookOpen,
    Globe,
    Lock,
    ThumbsUp,
    ThumbsDown,
    Share2,
    Copy,
    Check,
    Clock,
    Eye
} from 'lucide-react';
import { toast } from 'sonner';

export function ArticleViewerModal({ open, onOpenChange, article }) {
    if (!article) return null;

    const [voted, setVoted] = useState(false);
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(`https://docs.devlomatix.com/articles/${article.id}`);
        setCopied(true);
        toast.success("Article URL copied to clipboard!");
        setTimeout(() => setCopied(false), 2000);
    };

    const handleVote = (isHelpful) => {
        if (voted) return toast.info("You have already submitted feedback");
        setVoted(true);
        toast.success(isHelpful ? "Thanks for your feedback!" : "Feedback recorded. We'll improve this guide.");
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-2xl bg-card border-border/80 p-0 overflow-hidden flex flex-col max-h-[90vh]">
                <DialogHeader className="p-4 border-b border-border/60 bg-emerald-500/10 flex flex-row items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-500">
                            <BookOpen className="w-4 h-4" />
                        </div>
                        <div>
                            <span className="text-[10px] uppercase font-semibold text-muted-foreground block">{article.category}</span>
                            <DialogTitle className="text-sm font-bold text-foreground">
                                {article.title}
                            </DialogTitle>
                        </div>
                    </div>
                    <Badge
                        variant="outline"
                        className={`text-[9px] font-semibold px-2 py-0.5 rounded ${
                            article.visibility === 'Public' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20'
                        }`}
                    >
                        {article.visibility}
                    </Badge>
                </DialogHeader>

                <div className="p-6 space-y-5 overflow-y-auto flex-1 text-xs bg-card">
                    {/* Metadata Header */}
                    <div className="flex items-center justify-between pb-3 border-b border-border/40 text-[11px] text-muted-foreground">
                        <div className="flex items-center gap-3">
                            <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" /> Updated {article.updated || 'Recently'}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                                <Eye className="w-3 h-3" /> {article.views || '0'} views
                            </span>
                        </div>
                        <Button variant="ghost" size="sm" onClick={handleCopy} className="h-6 text-[10px] gap-1">
                            {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                            Share Link
                        </Button>
                    </div>

                    {/* Article Content Body */}
                    <div className="space-y-3 leading-relaxed text-foreground text-xs">
                        <div className="p-4 rounded-xl bg-secondary/20 border border-border/40 whitespace-pre-wrap font-sans">
                            {article.content || "This guide provides instructions and setup steps for configuring this integration across your Devlomatix workspace."}
                        </div>
                    </div>

                    {/* Feedback Rating Box */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 rounded-lg bg-secondary/30 border border-border/40">
                        <span className="font-semibold text-xs text-foreground">Was this article helpful?</span>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleVote(true)}
                                className="h-7 text-xs border-border/80 gap-1 hover:text-emerald-500"
                            >
                                <ThumbsUp className="w-3 h-3" /> Yes, helpful
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleVote(false)}
                                className="h-7 text-xs border-border/80 gap-1 hover:text-rose-500"
                            >
                                <ThumbsDown className="w-3 h-3" /> Needs Improvement
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="p-3.5 border-t border-border/60 bg-secondary/15 flex justify-end">
                    <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)} className="h-8 text-xs">
                        Close
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
