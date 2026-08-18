'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
    Clock,
    Plus,
    Search,
    Send,
    Eye,
    Trash2,
    Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { getPosts, publishPostNow, deletePost } from '../_actions/socialhub-actions';
import { ComposePostModal } from '../_components/ComposePostModal';
import { PostPreviewModal } from '../_components/PostPreviewModal';

export default function SocialHubScheduledPage() {
    const params = useParams();
    const workspaceId = params?.workspaceId;

    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    const [isComposeOpen, setIsComposeOpen] = useState(false);
    const [selectedPost, setSelectedPost] = useState(null);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);

    const loadData = async () => {
        setLoading(true);
        const res = await getPosts(workspaceId);
        if (res.success) setPosts(res.data);
        setLoading(false);
    };

    useEffect(() => {
        loadData();
    }, [workspaceId]);

    const handlePublish = async (id) => {
        const res = await publishPostNow(workspaceId, id);
        if (res.success) {
            toast.success("Post published live now!");
            loadData();
        }
    };

    const handleDelete = async (id) => {
        const res = await deletePost(workspaceId, id);
        if (res.success) {
            toast.success("Post removed from schedule queue");
            loadData();
        }
    };

    const filtered = posts.filter(p =>
        p.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.channel.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20">
                            <Clock className="w-4 h-4 text-rose-500" />
                        </div>
                        <h1 className="text-lg font-bold text-foreground">Scheduled Social Queue</h1>
                    </div>
                    <p className="text-xs text-muted-foreground">Manage upcoming posts queued across LinkedIn, X (Twitter), Facebook, and Instagram.</p>
                </div>

                <Button
                    size="sm"
                    onClick={() => setIsComposeOpen(true)}
                    className="h-8 text-xs bg-rose-600 hover:bg-rose-700 text-white gap-1.5 shadow-xs"
                >
                    <Plus className="w-3.5 h-3.5" />
                    Compose Post
                </Button>
            </div>

            <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-muted-foreground" />
                <Input
                    placeholder="Search scheduled posts..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-8 pl-8 text-xs bg-secondary/30 border-border/80"
                />
            </div>

            {loading ? (
                <div className="py-12 text-center text-xs text-muted-foreground">
                    <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-primary" /> Loading queue...
                </div>
            ) : filtered.length === 0 ? (
                <div className="py-12 text-center text-xs text-muted-foreground">
                    No scheduled posts in the queue
                </div>
            ) : (
                <div className="space-y-3">
                    {filtered.map((post) => (
                        <Card key={post.id} className="bg-card border-border/80 p-4 space-y-3 shadow-xs hover:border-rose-500/40 transition-all">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Badge variant="outline" className="text-[9px] font-mono">{post.channel}</Badge>
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
                                <div className="flex items-center gap-1.5">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                            setSelectedPost(post);
                                            setIsPreviewOpen(true);
                                        }}
                                        className="h-7 text-xs text-muted-foreground hover:text-foreground gap-1"
                                    >
                                        <Eye className="w-3 h-3" /> Mockup
                                    </Button>
                                    {post.status !== 'Published' && (
                                        <Button
                                            size="sm"
                                            onClick={() => handlePublish(post.id)}
                                            className="h-7 text-xs bg-rose-600 hover:bg-rose-700 text-white gap-1 shadow-xs"
                                        >
                                            <Send className="w-3 h-3" /> Publish Now
                                        </Button>
                                    )}
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleDelete(post.id)}
                                        className="h-7 w-7 text-rose-500 hover:bg-rose-500/10"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

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
        </div>
    );
}
