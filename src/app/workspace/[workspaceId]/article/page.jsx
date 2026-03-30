'use client';

import { useState, useEffect, useCallback } from'react';
import { useParams } from'next/navigation';
import axios from'@/utils/axios';
import {
 Plus,
 Calendar,
 Share2,
 Search,
 LayoutGrid,
 List,
 Filter
} from'lucide-react';
import { Button } from'@/components/ui/button';
import { Input } from'@/components/ui/input';
import { useModal } from'@/hooks/useModal';

// Local Components
import { PostCard } from'./_components/PostCard';
import { PostRow } from'./_components/PostRow';
import { PostStats } from'./_components/PostStats';
import { CalendarView } from'./_components/CalendarView';
import { AddPostModal } from'./_components/AddPostModal';
import { AddCredentialModal } from'./_components/AddCredentialModal';
import { MediaLibraryModal } from'./_components/MediaLibraryModal';
import { RecentLogsWidget } from'./_components/RecentLogsWidget';
import { cn } from'@/lib/utils';

export default function ArticlePage() {
 const params = useParams();
 const workspaceId = params.workspaceId;
 const { onOpen } = useModal();

 const [posts, setPosts] = useState([]);
 const [loading, setLoading] = useState(true);
 const [search, setSearch] = useState('');
 const [viewMode, setViewMode] = useState('list');

 const fetchPosts = useCallback(async () => {
 setLoading(true);
 try {
 const res = await axios.get(`/api/workspace/${workspaceId}/social/posts`);
 setPosts(res.data);
 } catch (error) {
 console.error(error);
 } finally {
 setLoading(false);
 }
 }, [workspaceId]);

 useEffect(() => {
 fetchPosts();
 }, [fetchPosts]);

 return (
 <div className="space-y-4 animate-fade-in p-2">
 {/* Local Modals */}
 <AddPostModal />
 <AddCredentialModal />
 <MediaLibraryModal />

 {/* Header Section */}
 <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-card border border-border p-4 rounded-md shadow-soft">
 <div className="space-y-1">
 <h1 className="text-xl font-extrabold text-foreground flex items-center gap-3">
 <Share2 className="text-primary h-6 w-6"/>
 Post Management
 </h1>
 <p className="text-muted-foreground text-xs font-bold opacity-70">
 Create, schedule, and publish content across all your social channels.
 </p>
 </div>
 <div className="flex items-center gap-3">
 <Button
 variant="outline"
 onClick={() => onOpen('addCredential', { workspaceId, onApply: fetchPosts })}
 className="rounded-md border-border/60 hover:bg-background font-bold"
 >
 <Share2 className="w-4 h-4 mr-2 text-primary"/> Add Credentials
 </Button>
 <Button
 variant="outline"
 onClick={() => setViewMode('calendar')}
 className={cn(
"rounded-md border-border/60 hover:bg-background font-bold transition-all",
 viewMode ==='calendar'&&"bg-primary/5 border-primary/40 text-primary"
 )}
 >
 <Calendar className="w-4 h-4 mr-2 text-primary"/> Calendar
 </Button>
 <Button
 onClick={() => onOpen('addPost', { workspaceId, onApply: fetchPosts })}
 className="rounded-md shadow-soft transition-all font-bold px-6"
 >
 <Plus className="w-5 h-5"/> New Post
 </Button>
 </div>
 </div>

 <RecentLogsWidget workspaceId={workspaceId} />

 {/* Quick Stats */}
 <PostStats posts={posts} />

 {/* Filters & Search */}
 <div className="flex flex-col md:flex-row items-center gap-4 bg-card p-2 rounded-md border border-border shadow-soft">
 <div className="relative flex-1 group">
 <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors"/>
 <Input
 placeholder="SEARCH POSTS OR TOPICS..."
 value={search}
 onChange={(e) => setSearch(e.target.value)}
 className="pl-11 h-12 bg-background border border-border rounded-md focus-visible:ring-1 focus-visible:ring-primary shadow-inner font-bold text-[10px]"
 />
 </div>
 <div className="flex items-center gap-3">
 <div className="flex items-center bg-background rounded-md p-1 border border-border">
 <Button
 variant="ghost"
 size="sm"
 onClick={() => setViewMode('list')}
 className={cn(
"px-3 rounded-md transition-all text-[10px] font-bold mr-1",
 viewMode ==='list'
 ?"bg-primary text-primary-foreground shadow-soft"
 :"text-muted-foreground hover:text-foreground hover:bg-muted/50"
 )}
 >
 <List className="w-3.5 h-3.5 mr-2"/> List
 </Button>
 <Button
 variant="ghost"
 size="sm"
 onClick={() => setViewMode('grid')}
 className={cn(
"px-3 rounded-md transition-all text-[10px] font-bold mr-1",
 viewMode ==='grid'
 ?"bg-primary text-primary-foreground shadow-soft"
 :"text-muted-foreground hover:text-foreground hover:bg-muted/50"
 )}
 >
 <LayoutGrid className="w-3.5 h-3.5 mr-2"/> Grid
 </Button>
 <Button
 variant="ghost"
 size="sm"
 onClick={() => setViewMode('calendar')}
 className={cn(
"px-3 rounded-md transition-all text-[10px] font-bold",
 viewMode ==='calendar'
 ?"bg-primary text-primary-foreground shadow-soft"
 :"text-muted-foreground hover:text-foreground hover:bg-muted/50"
 )}
 >
 <Calendar className="w-3.5 h-3.5 mr-2"/> Calendar
 </Button>
 </div>

 </div>
 </div>

 {/* Content List */}
 {viewMode ==='calendar'? (
 <div className="animate-in fade-in duration-500">
 <CalendarView
 posts={posts}
 workspaceId={workspaceId}
 onOpenPost={(post) => onOpen('addPost', { workspaceId, initialData: post, onApply: fetchPosts })}
 />
 </div>
 ) : (
 <div className={cn(
"animate-in fade-in duration-500",
 viewMode ==='grid'
 ?"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
 :"flex flex-col gap-3"
 )}>
 {posts.length === 0 && !loading ? (
 <div className="col-span-full py-32 text-center bg-card/10 rounded-md border border-dashed border-border/60">
 <div className="bg-muted/30 w-20 h-20 rounded-md flex items-center justify-center mx-auto mb-6 border border-border/20">
 <Share2 className="w-10 text-muted-foreground/30"/>
 </div>
 <h3 className="text-xl font-bold text-foreground mb-2">Your feed is quiet...</h3>
 <p className="text-muted-foreground mb-8 text-[10px] font-bold">Start your first multi-platform social media post.</p>
 <Button
 onClick={() => onOpen('addPost', { workspaceId, onApply: fetchPosts })}
 className="rounded-md font-bold px-8 text-[10px]"
 >
 Create First Post
 </Button>
 </div>
 ) : (
 posts
 .filter(p => p.title?.toLowerCase().includes(search.toLowerCase()) || p.content?.toLowerCase().includes(search.toLowerCase()))
 .map((post) => (
 viewMode ==='grid'? (
 <PostCard key={post.id} post={post} onApply={fetchPosts} />
 ) : (
 <PostRow key={post.id} post={post} onApply={fetchPosts} />
 )
 ))
 )}
 </div>
 )}
 </div>
 );
}