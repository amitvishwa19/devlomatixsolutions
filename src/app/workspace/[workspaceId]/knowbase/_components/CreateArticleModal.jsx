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
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    BookOpen,
    FileText,
    Sparkles,
    Globe,
    Lock,
    Save,
    Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { createArticle } from '../_actions/knowbase-actions';

export function CreateArticleModal({ open, onOpenChange, workspaceId, categories = [], onArticleCreated }) {
    const [creating, setCreating] = useState(false);
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState(categories[0]?.name || 'Getting Started & Setup');
    const [visibility, setVisibility] = useState('Public');
    const [content, setContent] = useState('');

    const handleCreate = async (e) => {
        e.preventDefault();
        if (!title.trim()) return toast.error("Please enter an article title");
        if (!content.trim()) return toast.error("Please enter article body content");

        setCreating(true);
        const res = await createArticle(workspaceId, {
            title,
            category,
            visibility,
            content
        });

        if (res.success) {
            toast.success(`Article "${title}" published successfully!`);
            onOpenChange(false);
            setTitle('');
            setContent('');
            if (onArticleCreated) onArticleCreated(res.data);
        } else {
            toast.error(res.error || "Failed to create article");
        }
        setCreating(false);
    };

    const handleAiAssist = () => {
        if (!title.trim()) return toast.info("Enter a title first to generate guide with AI");
        setContent(`## Overview\nThis guide explains everything you need to know about ${title}.\n\n### Step 1: Configuration\n1. Navigate to your workspace settings.\n2. Verify system permissions and API tokens.\n\n### Step 2: Verification\nTest the integration to confirm live connectivity.`);
        toast.success("AI draft generated based on your title!");
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
                            <DialogTitle className="text-sm font-bold text-foreground">
                                Publish Knowledge Base Guide
                            </DialogTitle>
                            <DialogDescription className="text-xs text-muted-foreground">
                                Create customer documentation or internal team SOP wiki pages.
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <form onSubmit={handleCreate} className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
                    <div className="space-y-1">
                        <Label className="text-xs font-semibold">Article Title</Label>
                        <Input
                            placeholder="e.g. How to configure Custom Webhooks in FlowForge"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="h-8 text-xs bg-secondary/30 border-border/80"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <Label className="text-xs font-semibold">Category / Collection</Label>
                            <Select value={category} onValueChange={setCategory}>
                                <SelectTrigger className="h-8 text-xs bg-secondary/30 border-border/80">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.length > 0 ? (
                                        categories.map((c) => (
                                            <SelectItem key={c.id || c.name} value={c.name}>{c.name}</SelectItem>
                                        ))
                                    ) : (
                                        <>
                                            <SelectItem value="Getting Started & Setup">Getting Started & Setup</SelectItem>
                                            <SelectItem value="WhatsApp & KonnectX Guides">WhatsApp & KonnectX Guides</SelectItem>
                                            <SelectItem value="Billing & Invoice FAQs">Billing & Invoice FAQs</SelectItem>
                                            <SelectItem value="Internal SOPs & Team Wiki">Internal SOPs & Team Wiki</SelectItem>
                                        </>
                                    )}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-1">
                            <Label className="text-xs font-semibold">Audience Visibility</Label>
                            <Select value={visibility} onValueChange={setVisibility}>
                                <SelectTrigger className="h-8 text-xs bg-secondary/30 border-border/80">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Public">Public (Customer Help Center)</SelectItem>
                                    <SelectItem value="Internal">Internal (Team Only Wiki)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <div className="flex items-center justify-between">
                            <Label className="text-xs font-semibold">Markdown Body Content</Label>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={handleAiAssist}
                                className="h-6 text-[10px] text-purple-500 hover:bg-purple-500/10 gap-1"
                            >
                                <Sparkles className="w-3 h-3" /> AI Draft Assistant
                            </Button>
                        </div>
                        <Textarea
                            rows={8}
                            placeholder="Write comprehensive guide instructions using Markdown (# Heading, - bullet, 1. steps)..."
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            className="text-xs bg-secondary/30 border-border/80 font-mono resize-none font-normal"
                            required
                        />
                    </div>
                </form>

                <div className="p-4 border-t border-border/60 bg-secondary/15 flex items-center justify-between gap-2 shrink-0">
                    <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)} className="h-8 text-xs">
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        onClick={handleCreate}
                        disabled={creating}
                        className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 shadow-xs"
                    >
                        {creating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                        Publish Article
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
