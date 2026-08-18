'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Send,
    Sparkles,
    Calendar,
    Share2,
    Linkedin,
    Twitter,
    Facebook,
    Instagram,
    Image as ImageIcon,
    Clock,
    Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { createPost } from '../_actions/socialhub-actions';

export default function SocialHubComposerPage() {
    const params = useParams();
    const workspaceId = params?.workspaceId;

    const [selectedChannel, setSelectedChannel] = useState('LinkedIn');
    const [content, setContent] = useState('');
    const [scheduleTime, setScheduleTime] = useState('Tomorrow at 10:00 AM');
    const [submitting, setSubmitting] = useState(false);

    const channels = [
        { name: 'LinkedIn', icon: Linkedin, color: 'text-blue-600 border-blue-600/30' },
        { name: 'X (Twitter)', icon: Twitter, color: 'text-sky-500 border-sky-500/30' },
        { name: 'Facebook', icon: Facebook, color: 'text-blue-500 border-blue-500/30' },
        { name: 'Instagram', icon: Instagram, color: 'text-rose-500 border-rose-500/30' }
    ];

    const generateAiCaption = () => {
        setContent("🚀 Transforming modern developer workflows with AI! Our latest update unlocks seamless WhatsApp customer triggers, multi-model LLM routing, and automated invoice delivery in 1 platform. Check it out today! #DeveloperTools #AI #SaaS");
        toast.info("Generated high-engagement post draft via FlowGenix AI!");
    };

    const handleSubmit = async (publishNow = false) => {
        if (!content.trim()) return toast.error("Please enter post content");

        setSubmitting(true);
        const res = await createPost(workspaceId, {
            channel: selectedChannel,
            content,
            schedule: scheduleTime,
            publishNow
        });

        if (res.success) {
            toast.success(publishNow ? "Post published live to social feeds!" : "Post added to schedule queue!");
            setContent('');
        }
        setSubmitting(false);
    };

    return (
        <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20">
                            <Send className="w-4 h-4 text-rose-500" />
                        </div>
                        <h1 className="text-lg font-bold text-foreground">Multi-Channel Post Composer</h1>
                    </div>
                    <p className="text-xs text-muted-foreground">Draft once, optimize with FlowGenix AI, and schedule across all your brand accounts.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Editor Column */}
                <div className="lg:col-span-2 space-y-4">
                    {/* Channel Selector */}
                    <div className="space-y-2">
                        <Label className="text-xs">Select Target Account</Label>
                        <div className="flex items-center gap-2 flex-wrap">
                            {channels.map((c) => (
                                <button
                                    key={c.name}
                                    type="button"
                                    onClick={() => setSelectedChannel(c.name)}
                                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                                        selectedChannel === c.name
                                            ? 'bg-secondary border-primary shadow-xs'
                                            : 'bg-card border-border/60 hover:bg-secondary/40 text-muted-foreground'
                                    }`}
                                >
                                    <c.icon className={`w-3.5 h-3.5 ${c.color}`} />
                                    <span>{c.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Post Content */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label className="text-xs">Post Copy & Hashtags</Label>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={generateAiCaption}
                                className="h-7 text-xs border-purple-500/30 text-purple-500 bg-purple-500/10 gap-1"
                            >
                                <Sparkles className="w-3 h-3" /> AI Caption Polish
                            </Button>
                        </div>
                        <Textarea
                            rows={6}
                            placeholder="What's happening in your business? Share an update, announcement, or tip..."
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            className="text-xs bg-secondary/30 border-border/80 resize-none p-3 font-normal"
                        />
                        <span className="text-[10px] text-muted-foreground block text-right font-mono">
                            {content.length} characters
                        </span>
                    </div>

                    {/* Scheduling Details */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                        <div className="space-y-1">
                            <Label className="text-xs">Schedule Date & Time</Label>
                            <Input
                                value={scheduleTime}
                                onChange={(e) => setScheduleTime(e.target.value)}
                                className="h-8 text-xs bg-secondary/30 border-border/80 font-mono"
                            />
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-end gap-2 pt-3 border-t border-border/40">
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={submitting}
                            onClick={() => handleSubmit(false)}
                            className="h-8 text-xs border-border/80 gap-1.5 shadow-xs"
                        >
                            <Clock className="w-3.5 h-3.5" />
                            Schedule Post
                        </Button>
                        <Button
                            size="sm"
                            disabled={submitting}
                            onClick={() => handleSubmit(true)}
                            className="h-8 text-xs bg-rose-600 hover:bg-rose-700 text-white gap-1.5 shadow-xs"
                        >
                            {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                            Publish Now
                        </Button>
                    </div>
                </div>

                {/* Live Preview Column */}
                <div className="space-y-3">
                    <Label className="text-xs">Live Feed Preview ({selectedChannel})</Label>
                    <Card className="bg-card border-border/80 p-4 space-y-3 shadow-xs">
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-xs text-primary">
                                D
                            </div>
                            <div>
                                <span className="font-semibold text-xs text-foreground block">Devlomatix Platform</span>
                                <span className="text-[10px] text-muted-foreground">Just now • 🌐</span>
                            </div>
                        </div>
                        <p className="text-xs text-foreground whitespace-pre-wrap leading-relaxed">
                            {content || "Your drafted post copy and preview will appear here in real time..."}
                        </p>
                        <div className="pt-2 border-t border-border/40 flex items-center justify-between text-[11px] text-muted-foreground">
                            <span>👍 42 Likes</span>
                            <span>💬 8 Comments</span>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
