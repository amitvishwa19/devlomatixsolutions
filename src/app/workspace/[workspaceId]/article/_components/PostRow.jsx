'use client';

import {
 Clock,
 CheckCircle2,
 AlertCircle,
 FileText,
 Share2,
 Facebook,
 Linkedin,
 Twitter,
 Instagram,
 MessageCircle,

 Image as ImageIcon,
 MoreHorizontal,
 Edit2,
 Send,
 Trash2,
 Loader2
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
import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useModal } from '@/hooks/useModal';

// Helper to truncate text to a specific number of words
const truncateWords = (html, wordLimit) => {
 if (!html) return "";
 const text = html.replace(/<[^>]*>/g, ' '); // Strip HTML tags
 const words = text.split(/\s+/).filter(word => word.length > 0);
 if (words.length <= wordLimit) return text;
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

export const PostRow = ({ post, onApply }) => {
 const params = useParams();
 const workspaceId = params.workspaceId;
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
 <AlertDialogContent className="rounded-lg border border-border shadow-2xl overflow-hidden p-0 animate-fade-in">
 <AlertDialogHeader className="p-8 pb-4">
 <div className="w-12 h-12 bg-rose-50 rounded-lg flex items-center justify-center mb-4 border border-rose-100 shadow-sm">
 <Trash2 className="w-6 h-6 text-rose-500" />
 </div>
 <AlertDialogTitle className="text-2xl ">Are you absolutely sure?</AlertDialogTitle>
 <AlertDialogDescription className="text-sm font-medium">
 This action cannot be undone. This post will be permanently deleted from your workspace.
 </AlertDialogDescription>
 </AlertDialogHeader>
 <AlertDialogFooter className="p-8 pt-4 flex flex-row gap-4 bg-muted/20">
 <AlertDialogCancel className="rounded-lg text-[10px] font-bold flex-1 mt-0 border-border/60">Cancel</AlertDialogCancel>
 <AlertDialogAction
 onClick={(e) => {
 e.preventDefault();
 handleDelete();
 }}
 className="rounded-lg text-[10px] font-bold flex-1 bg-rose-500 hover:bg-rose-600 text-white shadow-lg shadow-rose-500/20 pointer-events-auto"
 disabled={isDeleting}
 >
 {isDeleting ? "Deleting..." : "Delete Post"}
 </AlertDialogAction>
 </AlertDialogFooter>
 </AlertDialogContent>
 </AlertDialog>

 <div className="group flex items-center bg-card rounded-lg border border-border overflow-hidden hover:shadow-medium transition-all p-3 gap-4 shadow-soft animate-fade-in">
 {/* Media Thumbnail */}
 <div className="w-16 h-16 bg-muted/30 rounded-lg overflow-hidden flex items-center justify-center shrink-0 border border-border/10">
 {post.mediaUrls?.[0] ? (
 <img src={post.mediaUrls[0]} alt="" className="w-full h-full object-cover" />
 ) : (
 <ImageIcon className="text-muted-foreground/20 w-8 h-8" />
 )}
 </div>

 {/* Content */}
 <div className="flex-1 min-w-0 flex items-center justify-between gap-4">
 <div className="flex-1 min-w-0 w-[40%] flex-wrap">
 <h4 className="text-sm font-bold text-foreground truncate">{post.title || "Untitled Post"}</h4>
 <p className="text-[10px] text-muted-foreground font-medium truncate opacity-70 flex-wrap">
 {truncateWords(post.content || "", 10)}
 </p>
 <div className="flex flex-wrap gap-1.5 mt-2">
 {post.category && (
 <Badge 
 variant="outline" 
 style={{ 
 backgroundColor: `${post.category.color}10`, 
 color: post.category.color,
 borderColor: `${post.category.color}30`
 }}
 className="text-[8px] tracking-tighter px-1.5 py-0 rounded-sm border"
 >
 {post.category.name}
 </Badge>
 )}
 {(post.tags || []).map((tag, i) => (
 <span key={i} className="text-[9px] font-bold text-muted-foreground/40 tracking-tighter">
 #{tag}
 </span>
 ))}
 </div>
 </div>

 <div className="flex items-center gap-6 shrink-0">
 {/* Platforms */}
 <div className="flex -space-x-1">
 {(post.accounts || []).map(account => (
 <button
 key={account.id || account.platform}
 type="button"
 title={`Post to ${account.profileName} (${account.platform})`}
 onClick={() => account.id && handlePublishToAccount(account.id, account.platform)}
 disabled={postingAccountId === account.id}
 className="bg-background w-8 h-8 mr-2 rounded-full border-2 border-background flex items-center justify-center shadow-sm hover:scale-110 hover:z-10 transition-transform disabled:opacity-50 cursor-pointer"
 >
 {postingAccountId === account.id
 ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
 : getPlatformIcon(account.platform)}
 </button>
 ))}
 </div>

 {/* Status */}
 <div className="w-28 flex justify-center">
 {getStatusBadge(post.status)}
 </div>

 {/* Date */}
 <div className="flex flex-col items-end w-32">
 <span className="text-[10px] tracking-tighter text-muted-foreground opacity-50">Scheduled For</span>
 <span className="text-[11px] font-bold text-foreground">
 {post.scheduledAt ? new Date(post.scheduledAt).toLocaleDateString() : 'N/A'}
 </span>
 </div>

 {/* Actions */}
 <DropdownMenu>
 <DropdownMenuTrigger asChild>
 <Button variant="ghost" size="icon" className="w-8 rounded-lg text-muted-foreground/50 hover:text-foreground">
 <MoreHorizontal className="w-4 h-4" />
 </Button>
 </DropdownMenuTrigger>
 <DropdownMenuContent align="end" className="w-48 rounded-lg shadow-2xl border-border/20 p-2">
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
