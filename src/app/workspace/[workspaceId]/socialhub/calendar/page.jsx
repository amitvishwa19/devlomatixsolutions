'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Calendar,
    ChevronLeft,
    ChevronRight,
    Plus,
    Share2,
    Eye
} from 'lucide-react';
import { toast } from 'sonner';
import { ComposePostModal } from '../_components/ComposePostModal';
import { PostPreviewModal } from '../_components/PostPreviewModal';

export default function SocialHubCalendarPage() {
    const params = useParams();
    const workspaceId = params?.workspaceId;

    const [isComposeOpen, setIsComposeOpen] = useState(false);
    const [selectedPost, setSelectedPost] = useState(null);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);

    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    const calendarGrid = [
        {
            day: '17',
            posts: [
                {
                    id: 'cal-1',
                    channel: 'LinkedIn',
                    title: 'WhatsApp Automation v2 Launch',
                    content: '🚀 Super excited to announce our new WhatsApp Automation capabilities! Businesses can now automate 80% of customer support workflows with zero-code.',
                    schedule: 'Aug 17 at 02:00 PM',
                    status: 'Scheduled',
                    color: 'bg-blue-600/10 text-blue-600 border-blue-600/20',
                    hasMedia: true
                }
            ]
        },
        {
            day: '18',
            posts: [
                {
                    id: 'cal-2',
                    channel: 'X (Twitter)',
                    title: 'LLM Multi-Model Routing Thread',
                    content: 'Why multi-model AI routing saves 60% on LLM inference costs. A quick deep dive into intelligent prompt orchestration 🧵👇',
                    schedule: 'Aug 18 at 10:30 AM',
                    status: 'Scheduled',
                    color: 'bg-sky-500/10 text-sky-500 border-sky-500/20',
                    hasMedia: false
                }
            ]
        },
        { day: '19', posts: [] },
        {
            day: '20',
            posts: [
                {
                    id: 'cal-3',
                    channel: 'Instagram',
                    title: 'Developer Workspace BTS Reel',
                    content: 'Behind the scenes at Devlomatix: Crafting pixel-perfect developer experiences ✨ #DeveloperTools #SaaS #BuildInPublic',
                    schedule: 'Aug 20 at 06:00 PM',
                    status: 'Draft',
                    color: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
                    hasMedia: true
                }
            ]
        },
        { day: '21', posts: [] },
        {
            day: '22',
            posts: [
                {
                    id: 'cal-4',
                    channel: 'LinkedIn',
                    title: 'Customer Case Study Spotlight',
                    content: 'How Acme Global scaled their customer onboarding throughput by 4.2x using FlowForge automated workflows.',
                    schedule: 'Aug 22 at 11:00 AM',
                    status: 'Scheduled',
                    color: 'bg-blue-600/10 text-blue-600 border-blue-600/20',
                    hasMedia: true
                }
            ]
        },
        { day: '23', posts: [] }
    ];

    const handleInspectPost = (p) => {
        setSelectedPost(p);
        setIsPreviewOpen(true);
    };

    return (
        <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20">
                            <Calendar className="w-4 h-4 text-rose-500" />
                        </div>
                        <h1 className="text-lg font-bold text-foreground">Content Publishing Calendar</h1>
                    </div>
                    <p className="text-xs text-muted-foreground">Interactive weekly and monthly editorial schedule across all connected social channels.</p>
                </div>

                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 bg-secondary/40 border border-border/60 rounded-lg p-1">
                        <Button variant="ghost" size="icon" className="h-6 w-6"><ChevronLeft className="w-3.5 h-3.5" /></Button>
                        <span className="text-xs font-semibold px-2">August 2026</span>
                        <Button variant="ghost" size="icon" className="h-6 w-6"><ChevronRight className="w-3.5 h-3.5" /></Button>
                    </div>

                    <Button
                        size="sm"
                        onClick={() => setIsComposeOpen(true)}
                        className="h-8 text-xs bg-rose-600 hover:bg-rose-700 text-white gap-1.5 shadow-xs"
                    >
                        <Plus className="w-3.5 h-3.5" />
                        New Post
                    </Button>
                </div>
            </div>

            {/* Weekly Calendar Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-7 gap-3">
                {days.map((d, i) => (
                    <div key={d} className="space-y-2">
                        <div className="p-2 text-center rounded-lg bg-secondary/30 border border-border/40">
                            <span className="font-semibold text-xs text-muted-foreground block">{d}</span>
                            <span className="font-black text-sm text-foreground">{calendarGrid[i]?.day}</span>
                        </div>
                        <div className="min-h-[140px] p-2 rounded-xl bg-card border border-border/60 space-y-2">
                            {calendarGrid[i]?.posts.map((p, idx) => (
                                <div
                                    key={idx}
                                    onClick={() => handleInspectPost(p)}
                                    className={`p-2 rounded-lg border text-xs space-y-1 cursor-pointer hover:opacity-85 transition-opacity ${p.color}`}
                                >
                                    <div className="flex items-center justify-between text-[9px] font-bold">
                                        <span>{p.channel}</span>
                                        <span>{p.schedule.split('at ')[1] || '10:00 AM'}</span>
                                    </div>
                                    <p className="text-[11px] leading-tight font-medium line-clamp-2">{p.title}</p>
                                </div>
                            ))}
                            {calendarGrid[i]?.posts.length === 0 && (
                                <button
                                    onClick={() => setIsComposeOpen(true)}
                                    className="w-full h-full min-h-[90px] border border-dashed border-border/40 rounded-lg flex items-center justify-center text-muted-foreground/50 hover:text-foreground hover:border-border transition-colors text-xs"
                                >
                                    <Plus className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Compose Post Modal */}
            <ComposePostModal
                open={isComposeOpen}
                onOpenChange={setIsComposeOpen}
                workspaceId={workspaceId}
            />

            {/* Post Preview Modal */}
            <PostPreviewModal
                open={isPreviewOpen}
                onOpenChange={setIsPreviewOpen}
                post={selectedPost}
            />
        </div>
    );
}
