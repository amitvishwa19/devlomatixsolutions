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
import { Input } from '@/components/ui/input';
import {
    Sparkles,
    Search,
    BookOpen,
    ArrowRight,
    Loader2
} from 'lucide-react';
import { toast } from 'sonner';

export function AiSearchModal({ open, onOpenChange, articles = [], onSelectArticle }) {
    const [query, setQuery] = useState('');
    const [searching, setSearching] = useState(false);
    const [aiAnswer, setAiAnswer] = useState(null);

    const handleSearch = (e) => {
        e.preventDefault();
        if (!query.trim()) return;

        setSearching(true);
        setAiAnswer(null);

        setTimeout(() => {
            setSearching(false);
            setAiAnswer({
                summary: `Based on your query "${query}", we found matching guides in Meta WhatsApp Cloud API credentials and Custom Domains setup. The system recommends checking API access permissions in Workspace Settings.`,
                sources: articles.slice(0, 2)
            });
        }, 600);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-xl bg-card border-border/80 p-0 overflow-hidden flex flex-col">
                <DialogHeader className="p-4 border-b border-border/60 bg-purple-500/10 flex flex-row items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-500">
                            <Sparkles className="w-4 h-4" />
                        </div>
                        <div>
                            <DialogTitle className="text-sm font-bold text-foreground">
                                FlowGenix RAG Semantic Search
                            </DialogTitle>
                            <DialogDescription className="text-xs text-muted-foreground">
                                Ask questions in plain English to search across all knowledge articles.
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="p-5 space-y-4 text-xs">
                    <form onSubmit={handleSearch} className="flex items-center gap-2">
                        <div className="relative flex-1">
                            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-muted-foreground" />
                            <Input
                                placeholder="e.g. How do I configure WhatsApp Webhook triggers?..."
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                className="h-8 pl-8 text-xs bg-secondary/30 border-border/80"
                                autoFocus
                            />
                        </div>
                        <Button type="submit" size="sm" disabled={searching} className="h-8 text-xs bg-purple-600 hover:bg-purple-700 text-white gap-1">
                            {searching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                            Ask AI
                        </Button>
                    </form>

                    {aiAnswer && (
                        <div className="space-y-3 p-4 rounded-xl bg-purple-500/10 border border-purple-500/20">
                            <div className="space-y-1">
                                <span className="font-semibold text-xs text-purple-400 flex items-center gap-1.5">
                                    <Sparkles className="w-3.5 h-3.5" /> AI Synthesis Answer
                                </span>
                                <p className="text-xs text-foreground leading-relaxed">{aiAnswer.summary}</p>
                            </div>

                            <div className="space-y-1.5 pt-2 border-t border-purple-500/20">
                                <span className="text-[10px] text-muted-foreground uppercase font-semibold">Referenced Documentation:</span>
                                <div className="space-y-1">
                                    {aiAnswer.sources.map((art) => (
                                        <div
                                            key={art.id}
                                            onClick={() => {
                                                if (onSelectArticle) onSelectArticle(art);
                                                onOpenChange(false);
                                            }}
                                            className="flex items-center justify-between p-2 rounded-lg bg-card/60 border border-border/40 hover:border-purple-500/40 cursor-pointer transition-colors"
                                        >
                                            <span className="font-medium text-xs text-foreground truncate">{art.title}</span>
                                            <ArrowRight className="w-3.5 h-3.5 text-muted-foreground" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
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
