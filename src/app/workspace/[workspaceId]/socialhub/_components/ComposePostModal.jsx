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
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
    Share2,
    Send,
    Sparkles,
    Calendar,
    Image as ImageIcon,
    Clock,
    Hash,
    Check,
    Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { createPost } from '../_actions/socialhub-actions';

export function ComposePostModal({ open, onOpenChange, workspaceId, onPostCreated }) {
    const [creating, setCreating] = useState(false);
    const [content, setContent] = useState('');
    const [selectedChannels, setSelectedChannels] = useState(['LinkedIn', 'X (Twitter)']);
    const [scheduleTime, setScheduleTime] = useState('Tomorrow at 10:00 AM');
    const [publishNow, setPublishNow] = useState(false);
    const [hasMedia, setHasMedia] = useState(false);

    const channelsList = ['LinkedIn', 'X (Twitter)', 'Instagram', 'Facebook', 'Threads'];

    const handleToggleChannel = (ch) => {
        if (selectedChannels.includes(ch)) {
            if (selectedChannels.length <= 1) return toast.info("Select at least 1 social channel");
            setSelectedChannels(selectedChannels.filter(c => c !== ch));
        } else {
            setSelectedChannels([...selectedChannels, ch]);
        }
    };

    const handleAiEnhance = () => {
        if (!content.trim()) return toast.info("Type a few thoughts first to let AI polish it!");
        setContent(`${content.trim()}\n\n🚀 Empower your business with automated intelligence. Built with Devlomatix.\n\n#Tech #AI #Automation #Productivity`);
        toast.success("Enhanced copy and generated trending hashtags!");
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        if (!content.trim()) return toast.error("Please write post content");

        setCreating(true);
        const res = await createPost(workspaceId, {
            channel: selectedChannels.join(', '),
            content,
            schedule: publishNow ? 'Just now' : scheduleTime,
            publishNow,
            hasMedia
        });

        if (res.success) {
            toast.success(
                publishNow
                    ? `Post published live to ${selectedChannels.join(', ')}!`
                    : `Post scheduled across ${selectedChannels.join(', ')}!`
            );
            onOpenChange(false);
            setContent('');
            if (onPostCreated) onPostCreated(res.data);
        } else {
            toast.error(res.error || "Failed to schedule post");
        }
        setCreating(false);
    };

    const charCount = content.length;
    const isOverTwitterLimit = selectedChannels.includes('X (Twitter)') && charCount > 280;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-2xl bg-card border-border/80 p-0 overflow-hidden flex flex-col max-h-[90vh]">
                <DialogHeader className="p-4 border-b border-border/60 bg-sky-500/10 flex flex-row items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-500">
                            <Share2 className="w-4 h-4" />
                        </div>
                        <div>
                            <DialogTitle className="text-sm font-bold text-foreground">
                                Omnichannel Social Post Composer
                            </DialogTitle>
                            <DialogDescription className="text-xs text-muted-foreground">
                                Craft, AI-polish, and schedule posts across all connected accounts.
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <form onSubmit={handleCreate} className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
                    {/* Target Channels */}
                    <div className="space-y-1.5">
                        <Label className="text-xs font-semibold uppercase text-muted-foreground text-[10px]">Publish To Channels</Label>
                        <div className="flex flex-wrap gap-2">
                            {channelsList.map((ch) => {
                                const isSelected = selectedChannels.includes(ch);
                                return (
                                    <button
                                        type="button"
                                        key={ch}
                                        onClick={() => handleToggleChannel(ch)}
                                        className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                                            isSelected
                                                ? 'bg-sky-500/20 border-sky-500/40 text-sky-400 shadow-xs'
                                                : 'bg-secondary/30 border-border/60 text-muted-foreground hover:text-foreground'
                                        }`}
                                    >
                                        {ch}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Content Editor */}
                    <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                            <Label className="text-xs font-semibold">Post Copy</Label>
                            <div className="flex items-center gap-2">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleAiEnhance}
                                    className="h-6 text-[10px] text-purple-400 hover:bg-purple-500/10 gap-1"
                                >
                                    <Sparkles className="w-3 h-3" /> AI Copy Polisher
                                </Button>
                                <span className={`text-[11px] font-mono ${isOverTwitterLimit ? 'text-rose-500 font-bold' : 'text-muted-foreground'}`}>
                                    {charCount} chars
                                </span>
                            </div>
                        </div>
                        <Textarea
                            rows={6}
                            placeholder="What would you like to share with your audience? Add hashtags, links, and value..."
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            className="text-xs bg-secondary/30 border-border/80 resize-none font-normal"
                            required
                        />
                    </div>

                    {/* Media & Schedule Controls */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-lg bg-secondary/30 border border-border/40">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <span className="font-semibold text-foreground block">Attach Media Banner</span>
                                <p className="text-[11px] text-muted-foreground">Attach brand card image</p>
                            </div>
                            <Switch checked={hasMedia} onCheckedChange={setHasMedia} />
                        </div>

                        <div className="flex items-center justify-between sm:border-l sm:border-border/40 sm:pl-3">
                            <div className="space-y-0.5">
                                <span className="font-semibold text-foreground block">Publish Instantly</span>
                                <p className="text-[11px] text-muted-foreground">Skip scheduling queue</p>
                            </div>
                            <Switch checked={publishNow} onCheckedChange={setPublishNow} />
                        </div>
                    </div>

                    {!publishNow && (
                        <div className="space-y-1">
                            <Label className="text-xs font-semibold">Scheduled Date & Time Slot</Label>
                            <Input
                                placeholder="e.g. Tomorrow at 10:30 AM"
                                value={scheduleTime}
                                onChange={(e) => setScheduleTime(e.target.value)}
                                className="h-8 text-xs bg-secondary/30 border-border/80"
                            />
                        </div>
                    )}
                </form>

                <div className="p-4 border-t border-border/60 bg-secondary/15 flex items-center justify-between gap-2 shrink-0">
                    <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)} className="h-8 text-xs">
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        onClick={handleCreate}
                        disabled={creating}
                        className="h-8 text-xs bg-sky-600 hover:bg-sky-700 text-white gap-1.5 shadow-xs"
                    >
                        {creating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                        {publishNow ? 'Publish Live Now' : 'Schedule Queue'}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
