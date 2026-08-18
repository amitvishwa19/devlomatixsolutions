'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import {
    Share2,
    Calendar,
    Send,
    Clock,
    Plus,
    Sparkles,
    Eye,
    TrendingUp,
    CheckCircle2,
    Linkedin,
    Twitter,
    Facebook,
    Instagram,
    Youtube,
    MoreVertical,
    ArrowUpRight,
    Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { getPosts, getAccounts, publishPostNow } from './_actions/socialhub-actions';
import { ComposePostModal } from './_components/ComposePostModal';
import { PostPreviewModal } from './_components/PostPreviewModal';
import { ConnectAccountModal } from './_components/ConnectAccountModal';

export default function SocialHubDashboard() {
    const params = useParams();
    const workspaceId = params?.workspaceId;

    const [posts, setPosts] = useState([]);
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(true);

    const [isComposeOpen, setIsComposeOpen] = useState(false);
    const [selectedPost, setSelectedPost] = useState(null);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [isConnectOpen, setIsConnectOpen] = useState(false);

    const loadData = async () => {
        setLoading(true);
        const [postsRes, accRes] = await Promise.all([
            getPosts(workspaceId),
            getAccounts(workspaceId)
        ]);
        if (postsRes.success) setPosts(postsRes.data);
        if (accRes.success) setAccounts(accRes.data);
        setLoading(false);
    };

    useEffect(() => {
        loadData();
    }, [workspaceId]);

    const handlePublishNow = async (id) => {
        const res = await publishPostNow(workspaceId, id);
        if (res.success) {
            toast.success("Post published live immediately!");
            loadData();
        }
    };

    const stats = [
        { label: 'Scheduled Queue', value: `${posts.length}`, change: 'Next in queue', icon: Clock, color: 'text-rose-500 bg-rose-500/10 border-rose-500/20' },
        { label: 'Total Reach (30d)', value: '142.5K', change: '+28.4% engagement', icon: TrendingUp, color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' },
        { label: 'Connected Channels', value: `${accounts.length} Active`, change: 'LinkedIn, X, Meta', icon: Share2, color: 'text-sky-500 bg-sky-500/10 border-sky-500/20' },
        { label: 'AI Captions Created', value: '64', change: 'Via FlowGenix', icon: Sparkles, color: 'text-purple-500 bg-purple-500/10 border-purple-500/20' }
    ];

    const getChannelBadge = (channel) => {
        if (channel.includes('LinkedIn')) return <Badge variant="outline" className="text-[9px] font-mono text-blue-500 border-blue-500/30">LinkedIn</Badge>;
        if (channel.includes('Twitter') || channel.includes('X')) return <Badge variant="outline" className="text-[9px] font-mono text-sky-400 border-sky-400/30">X (Twitter)</Badge>;
        if (channel.includes('Instagram')) return <Badge variant="outline" className="text-[9px] font-mono text-rose-400 border-rose-400/30">Instagram</Badge>;
        return <Badge variant="outline" className="text-[9px] font-mono">{channel}</Badge>;
    };

    return (
        <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
            {/* Header Banner */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-rose-500/10 via-primary/5 to-transparent p-5 rounded-2xl border border-border/80">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20">
                            <Share2 className="w-5 h-5 text-rose-500" />
                        </div>
                        <h1 className="text-xl font-bold tracking-tight text-foreground">SocialHub Media Scheduler</h1>
                        <Badge variant="outline" className="bg-rose-500/10 text-rose-500 border-rose-500/30 text-[10px] font-mono">
                            OMNICHANNEL SOCIAL
                        </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground max-w-xl">
                        Schedule, draft with AI, and publish posts across LinkedIn, X, Facebook, and Instagram from one unified calendar.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Link href={`/workspace/${workspaceId}/socialhub/calendar`}>
                        <Button variant="outline" size="sm" className="h-8 text-xs border-border/80 gap-1.5 shadow-xs">
                            <Calendar className="w-3.5 h-3.5" />
                            Calendar View
                        </Button>
                    </Link>
                    <Button
                        size="sm"
                        onClick={() => setIsComposeOpen(true)}
                        className="h-8 text-xs bg-rose-600 hover:bg-rose-700 text-white gap-1.5 shadow-xs"
                    >
                        <Plus className="w-3.5 h-3.5" />
                        Compose Post
                    </Button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                {stats.map((stat, i) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                    >
                        <Card className="bg-card border-border/80 shadow-xs hover:border-border transition-colors">
                            <CardHeader className="py-0 px-3 border-b border-border/40 space-y-0">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{stat.label}</span>
                                    <div className={`w-7 h-7 rounded-md flex items-center justify-center border shrink-0 ${stat.color}`}>
                                        <stat.icon className="w-3.5 h-3.5" />
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-3 pt-2">
                                <div className="text-xl font-bold text-foreground">{stat.value}</div>
                                <span className="text-[10px] text-muted-foreground">{stat.change}</span>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* Scheduled Posts Feed */}
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-rose-500" />
                        <h2 className="text-sm font-bold text-foreground">Upcoming & Scheduled Posts</h2>
                    </div>
                    <Link href={`/workspace/${workspaceId}/socialhub/scheduled`}>
                        <Button variant="ghost" size="sm" className="h-7 text-xs text-rose-500 hover:bg-rose-500/10 gap-1">
                            <span>Manage Queue</span>
                            <ArrowUpRight className="w-3.5 h-3.5" />
                        </Button>
                    </Link>
                </div>

                {loading ? (
                    <div className="py-12 text-center text-xs text-muted-foreground">
                        <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-primary" /> Loading social posts...
                    </div>
                ) : posts.length === 0 ? (
                    <div className="py-12 text-center text-xs text-muted-foreground">
                        No scheduled posts in the queue
                    </div>
                ) : (
                    <div className="space-y-3">
                        {posts.map((post) => (
                            <Card key={post.id} className="bg-card border-border/80 p-4 space-y-3 shadow-xs hover:border-rose-500/40 transition-all">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        {getChannelBadge(post.channel)}
                                        <span className="text-[11px] text-muted-foreground font-mono flex items-center gap-1">
                                            <Clock className="w-3 h-3" /> {post.schedule}
                                        </span>
                                    </div>
                                    <Badge
                                        variant="outline"
                                        className={`text-[9px] font-semibold px-2 py-0.5 rounded-full ${
                                            post.status === 'Published'
                                                ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                                                : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                                        }`}
                                    >
                                        {post.status}
                                    </Badge>
                                </div>

                                <p className="text-xs text-foreground leading-relaxed whitespace-pre-wrap">{post.content}</p>

                                <div className="pt-2 border-t border-border/40 flex items-center justify-between gap-2">
                                    <span className="text-[10px] text-muted-foreground">
                                        {post.hasMedia ? '📷 Media banner attached' : 'Text post'}
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => {
                                                setSelectedPost(post);
                                                setIsPreviewOpen(true);
                                            }}
                                            className="h-7 text-xs text-muted-foreground hover:text-foreground gap-1"
                                        >
                                            <Eye className="w-3 h-3" /> Mockup Preview
                                        </Button>
                                        {post.status !== 'Published' && (
                                            <Button
                                                size="sm"
                                                onClick={() => handlePublishNow(post.id)}
                                                className="h-7 text-xs bg-rose-600 hover:bg-rose-700 text-white gap-1 shadow-xs"
                                            >
                                                <Send className="w-3 h-3" /> Publish Now
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            {/* Compose Post Modal */}
            <ComposePostModal
                open={isComposeOpen}
                onOpenChange={setIsComposeOpen}
                workspaceId={workspaceId}
                onPostCreated={() => loadData()}
            />

            {/* Post Preview Modal */}
            <PostPreviewModal
                open={isPreviewOpen}
                onOpenChange={setIsPreviewOpen}
                post={selectedPost}
            />

            {/* Connect Account Modal */}
            <ConnectAccountModal
                open={isConnectOpen}
                onOpenChange={setIsConnectOpen}
                workspaceId={workspaceId}
                onAccountConnected={() => loadData()}
            />
        </div>
    );
}
