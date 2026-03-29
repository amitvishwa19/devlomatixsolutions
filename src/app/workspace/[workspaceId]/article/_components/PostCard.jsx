'use client';

import { useState } from 'react';
import { 
 Clock, 
 CheckCircle2, 
 AlertCircle, 
 FileText, 
 Share2, 
 Facebook, 
 Linkedin, 
 Twitter, 
 MessageCircle, 
 Image as ImageIcon,
 MoreHorizontal,
 Edit2,
 Send,
 Trash2,
 Loader2,
 Instagram
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
 DropdownMenu,
 DropdownMenuContent,
 DropdownMenuItem,
 DropdownMenuLabel,
 DropdownMenuSeparator,
 DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
 AlertDialog,
 AlertDialogAction,
 AlertDialogCancel,
 AlertDialogContent,
 AlertDialogDescription,
 AlertDialogFooter,
 AlertDialogHeader,
 AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from 'sonner';
import axios from '@/utils/axios';
import { useParams } from 'next/navigation';
import { useModal } from '@/hooks/useModal';

// Helper to truncate text to a specific number of words
const truncateWords = (html, wordLimit) => {
 if (!html) return "";
 const text = html.replace(/<[^>]*>/g, ' '); // Strip HTML tags
 const words = text.split(/\s+/).filter(word => word.length > 0);
 if (words.length <= wordLimit) return html;
 return words.slice(0, wordLimit).join(' ') + '...';
};

const getStatusBadge = (status) => {
 switch (status) {
 case 'PUBLISHED':
 return <Badge className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border-emerald-500/20 gap-1.5 font-bold text-[10px]">
 <CheckCircle2 size={12} /> Published
 </Badge>;
 case 'SCHEDULED':
 return <Badge className="bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 border-blue-500/20 gap-1.5 font-bold text-[10px]">
 <Clock size={12} /> Scheduled
 </Badge>;
 case 'FAILED':
 return <Badge className="bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 border-rose-500/20 gap-1.5 font-bold text-[10px]">
 <AlertCircle size={12} /> Failed
 </Badge>;
 default:
 return <Badge className="bg-muted text-muted-foreground hover:bg-muted/80 border-none gap-1.5 font-bold text-[10px]">
 <FileText size={12} /> Draft
 </Badge>;
 }
};

const getPlatformIcon = (platform) => {
 const p = platform?.toUpperCase();
 switch (p) {
 case 'FACEBOOK': return <Facebook size={14} className="text-blue-600" />;
 case 'INSTAGRAM': return <Instagram size={14} className="text-pink-600" />;
 case 'LINKEDIN': return <Linkedin size={14} className="text-blue-700" />;
 case 'TWITTER': 
 case 'X': return <Twitter size={14} className="text-sky-500" />;
 case 'WHATSAPP': return <MessageCircle size={14} className="text-emerald-500" />;
 default: return <Share2 size={14} className="text-muted-foreground" />;
 }
};

export const PostCard = ({ post, onApply }) => {
 const { workspaceId } = useParams();
 const { onOpen } = useModal();
 const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
 const [isDeleting, setIsDeleting] = useState(false);
 const [isPublishing, setIsPublishing] = useState(false);
 const [postingAccountId, setPostingAccountId] = useState(null);

 const handlePublishToAccount = async (accountId, platform) => {
 setPostingAccountId(accountId);
 const toastId = toast.loading(`Posting to ${platform}...`);
 try {
 await axios.post(`/api/workspace/${workspaceId}/social/posts/${post.id}/publish`, { accountId });
 toast.success(`Posted to ${platform} successfully`, { id: toastId });
 onApply?.();
 } catch (error) {
 toast.error(error?.response?.data?.message || `Failed to post to ${platform}`, { id: toastId });
 } finally {
 setPostingAccountId(null);
 }
 };

 const handlePublishNow = async () => {
 try {
 setIsPublishing(true);
 await axios.patch(`/api/workspace/${workspaceId}/social/posts/${post.id}`, { status: 'PUBLISHED' });
 toast.success("Post published successfully");
 onApply?.();
 } catch (error) {
 console.error(error);
 toast.error("Failed to publish post");
 } finally {
 setIsPublishing(false);
 }
 };

 const handleDelete = async () => {
 try {
 setIsDeleting(true);
 await axios.delete(`/api/workspace/${workspaceId}/social/posts/${post.id}`);
 toast.success("Post deleted successfully");
 onApply?.();
 } catch (error) {
 console.error(error);
 toast.error("Failed to delete post");
 } finally {
 setIsDeleting(false);
 setIsDeleteDialogOpen(false);
 }
 };

 return (
 <>
 <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
 <AlertDialogContent className="rounded-xl border border-border shadow-2xl overflow-hidden p-0 animate-fade-in">
 <AlertDialogHeader className="p-8 pb-4">
 <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center mb-4 border border-rose-100 shadow-sm">
 <Trash2 className="w-6 h-6 text-rose-500" />
 </div>
 <AlertDialogTitle className="text-2xl ">Are you absolutely sure?</AlertDialogTitle>
 <AlertDialogDescription className="text-sm font-medium">
 This action cannot be undone. This post will be permanently deleted from your workspace.
 </AlertDialogDescription>
 </AlertDialogHeader>
 <AlertDialogFooter className="p-8 pt-4 flex flex-row gap-4 bg-muted/20">
 <AlertDialogCancel className="rounded-md text-[10px] font-bold flex-1 mt-0 border-border/60">Cancel</AlertDialogCancel>
 <AlertDialogAction 
 onClick={(e) => {
 e.preventDefault();
 handleDelete();
 }}
 className="rounded-md text-[10px] font-bold flex-1 bg-rose-500 hover:bg-rose-600 text-white shadow-lg shadow-rose-500/20 pointer-events-auto"
 disabled={isDeleting}
 >
 {isDeleting ? "Deleting..." : "Delete Post"}
 </AlertDialogAction>
 </AlertDialogFooter>
 </AlertDialogContent>
 </AlertDialog>

 <div className="group flex flex-col bg-card rounded-xl border border-border overflow-hidden hover:shadow-medium transition-all shadow-soft animate-fade-in">
 {/* Media Preview */}
 <div className="aspect-[16/10] bg-muted/30 relative overflow-hidden flex items-center justify-center border-b border-border/10">
 {post.mediaUrls?.[0] ? (
 <img src={post.mediaUrls[0]} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
 ) : (
 <ImageIcon className="text-muted-foreground/20 w-16 h-16" />
 )}
 <div className="absolute top-4 left-4">
 {getStatusBadge(post.status)}
 </div>
 <div className="absolute top-4 right-4 flex gap-1.5">
 {(post.accounts || []).map(account => (
 <button
 key={account.id || account.platform}
 type="button"
 title={`Post to ${account.profileName} (${account.platform})`}
 onClick={() => account.id && handlePublishToAccount(account.id, account.platform)}
 disabled={postingAccountId === account.id}
 className="bg-background/90 p-1.5 rounded-xl shadow-soft border border-border hover:bg-primary/10 hover:border-primary/30 transition-all disabled:opacity-50 cursor-pointer"
 >
 {postingAccountId === account.id 
 ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
 : getPlatformIcon(account.platform)}
 </button>
 ))}
 </div>
 </div>

 {/* Post Content */}
 <div className="p-5 flex-1 space-y-4">
 <div>
 {/* Classification */}
 <div className="flex flex-wrap gap-1.5 mb-3">
 {post.category && (
 <Badge 
 variant="outline" 
 style={{ 
 backgroundColor: `${post.category.color}10`, 
 color: post.category.color,
 borderColor: `${post.category.color}30`
 }}
 className="text-[9px] px-2 py-0.5 rounded-md border"
 >
 {post.category.name}
 </Badge>
 )}
 {(post.tags || []).map((tag, i) => (
 <Badge 
 key={i} 
 variant="outline" 
 className="text-[9px] font-bold text-muted-foreground/60 px-2 py-0.5 rounded-md border-border/100 bg-muted/5"
 >
 #{tag}
 </Badge>
 ))}
 </div>
 <h4 className="text-sm font-bold text-foreground mb-1 line-clamp-1 truncate">{post.title || "Untitled Post"}</h4>
 <div 
 className="text-xs font-medium text-muted-foreground line-clamp-3 leading-relaxed opacity-80 prose prose-invert prose-sm max-w-none"
 dangerouslySetInnerHTML={{ __html: truncateWords(post.content, 200) }}
 />
 </div>

 <div className="flex items-center justify-between pt-4 border-t border-border/10">
 <div className="flex items-center gap-2 text-muted-foreground">
 <Clock className="w-3 h-3" />
 <span className="text-[10px] font-bold tracking-wider">
 {post.scheduledAt ? new Date(post.scheduledAt).toLocaleString() : 'Not Scheduled'}
 </span>
 </div>
 
 <DropdownMenu>
 <DropdownMenuTrigger asChild>
 <Button variant="ghost" size="icon" className="w-8 rounded-xl text-muted-foreground/50 hover:text-foreground hover:bg-muted">
 <MoreHorizontal className="w-4 h-4" />
 </Button>
 </DropdownMenuTrigger>
 <DropdownMenuContent align="end" className="w-48 rounded-xl shadow-2xl border-border/100 p-2">
 <DropdownMenuItem 
 onClick={() => onOpen('addPost', { workspaceId, onApply, initialData: post })}
 className="cursor-pointer font-bold px-3 py-2.5 rounded-lg"
 >
 <Edit2 className="w-4 h-4 mr-2 text-primary" /> Edit Post
 </DropdownMenuItem>
 <DropdownMenuItem 
 onClick={handlePublishNow}
 disabled={isPublishing || post.status === 'PUBLISHED'}
 className="cursor-pointer font-bold px-3 py-2.5 rounded-lg"
 >
 <Send className="w-4 h-4 mr-2 text-emerald-500" /> {isPublishing ? 'Publishing...' : 'Publish Now'}
 </DropdownMenuItem>
 <DropdownMenuSeparator className="bg-border/10" />
 <DropdownMenuItem 
 onClick={() => setIsDeleteDialogOpen(true)}
 className="cursor-pointer font-bold px-3 py-2.5 rounded-lg text-rose-500 hover:bg-rose-500/10"
 >
 <Trash2 className="w-4 h-4 mr-2" /> Delete
 </DropdownMenuItem>
 </DropdownMenuContent>
 </DropdownMenu>
 </div>
 </div>
 </div>
 </>
);
};
