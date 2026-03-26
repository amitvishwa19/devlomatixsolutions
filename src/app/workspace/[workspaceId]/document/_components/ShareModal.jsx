'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Loader2, Users, X, UserPlus, Globe } from 'lucide-react';
import axios from '@/utils/axios';
import { toast } from 'sonner';

export default function ShareModal({ isOpen, onOpenChange, document, workspaceId, onShareComplete }) {
 const [searchQuery, setSearchQuery] = useState('');
 const [searchResults, setSearchResults] = useState([]);
 const [isSearching, setIsSearching] = useState(false);
 const [isSubmitting, setIsSubmitting] = useState(false);
 const [role, setRole] = useState('VIEWER');

 // Debounce search
 useEffect(() => {
 if (!searchQuery || searchQuery.length < 2) {
 setSearchResults([]);
 return;
 }

 const delayFn = setTimeout(async () => {
 setIsSearching(true);
 try {
 const res = await axios.get(`/api/users/search?q=${searchQuery}`);
 // Filter out users already in sharedWith
 const existingIds = document?.sharedWith?.map(s => s.userId) || [];
 setSearchResults(res.data.filter(u => !existingIds.includes(u.id)));
 } catch (error) {
 console.error(error);
 } finally {
 setIsSearching(false);
 }
 }, 400);

 return () => clearTimeout(delayFn);
 }, [searchQuery, document]);

 const handleShare = async (userId) => {
 if (!document) return;
 setIsSubmitting(true);
 try {
 await axios.post(`/api/workspace/${workspaceId}/document/${document.id}/share`, {
 userId,
 role
 });
 toast.success("Access granted successfully");
 setSearchQuery('');
 setSearchResults([]);
 if (onShareComplete) onShareComplete();
 } catch (error) {
 toast.error("Failed to share document");
 } finally {
 setIsSubmitting(false);
 }
 };

 const handleRemove = async (userId) => {
 if (!document) return;
 setIsSubmitting(true);
 try {
 await axios.delete(`/api/workspace/${workspaceId}/document/${document.id}/share?userId=${userId}`);
 toast.success("Access revoked");
 if (onShareComplete) onShareComplete();
 } catch (error) {
 toast.error("Failed to revoke access");
 } finally {
 setIsSubmitting(false);
 }
 };

 if (!document) return null;

 return (
 <Dialog open={isOpen} onOpenChange={onOpenChange}>
 <DialogContent className="sm:max-w-md rounded-2xl border-none shadow-2xl overflow-hidden p-0">
 <div className="p-6 pb-4">
 <DialogHeader className="mb-4">
 <DialogTitle className="text-xl font-bold flex items-center gap-2">
 <Users className="w-5 h-5 text-primary" />
 Share {document.isFolder ? 'Folder' : 'Document'}
 </DialogTitle>
 <DialogDescription className="font-medium">
 Invite workspace members to collaborate on <span className="text-foreground font-bold">{document.name}</span>
 </DialogDescription>
 </DialogHeader>

 {/* Invite Section */}
 <div className="flex items-center gap-2 mt-2">
 <div className="relative flex-1">
 <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
 <Input 
 placeholder="Search by name or email..." 
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 className="pl-9 h-11 bg-muted/40 border-none rounded-xl focus-visible:ring-1 focus-visible:ring-primary/40 font-medium"
 />
 {isSearching && (
 <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-muted-foreground" />
 )}
 </div>
 <Select value={role} onValueChange={setRole}>
 <SelectTrigger className="w-[110px] h-11 border-none bg-muted/40 font-semibold rounded-xl">
 <SelectValue />
 </SelectTrigger>
 <SelectContent className="rounded-xl shadow-xl border-border/40">
 <SelectItem value="VIEWER" className="font-semibold py-2">Viewer</SelectItem>
 <SelectItem value="EDITOR" className="font-semibold py-2">Editor</SelectItem>
 </SelectContent>
 </Select>
 </div>

 {/* Search Results Dropdown Simulation */}
 {searchResults.length > 0 && (
 <div className="mt-2 bg-card rounded-xl border border-border/50 shadow-sm max-h-48 overflow-y-auto">
 {searchResults.map(user => (
 <div key={user.id} className="flex items-center justify-between p-3 hover:bg-muted/30 transition-colors border-b border-border/30 last:border-0">
 <div className="flex items-center gap-3">
 <Avatar className="h-8 w-8">
 <AvatarImage src={user.avatar} />
 <AvatarFallback className="text-xs">{user.displayName?.charAt(0) || user.email?.charAt(0) || '?'}</AvatarFallback>
 </Avatar>
 <div className="flex flex-col">
 <span className="text-sm font-bold leading-none">{user.displayName || 'Unknown User'}</span>
 <span className="text-xs text-muted-foreground mt-1">{user.email}</span>
 </div>
 </div>
 <Button 
 size="sm" 
 onClick={() => handleShare(user.id)}
 disabled={isSubmitting}
 className="h-8 rounded-lg font-bold text-xs"
 >
 Invite
 </Button>
 </div>
 ))}
 </div>
 )}
 </div>

 <div className="bg-muted/20 px-6 py-4 border-t border-border/40">
 <h4 className="text-xs font-black text-muted-foreground mb-4">People with access</h4>
 
 <div className="space-y-3">
 {/* The Owner (technically from the document.user relation) */}
 {document.user && (
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-3">
 <Avatar className="h-9 w-9 border border-border/50">
 <AvatarImage src={document.user.avatar} />
 <AvatarFallback className="text-xs font-bold text-primary">{document.user.displayName?.charAt(0) || document.user.name?.charAt(0) || '?'}</AvatarFallback>
 </Avatar>
 <div className="flex flex-col">
 <span className="text-sm font-bold leading-none">{document.user.displayName || document.user.name || 'Owner'} <span className="text-xs text-muted-foreground font-medium ml-1">(Owner)</span></span>
 <span className="text-xs text-muted-foreground mt-1">{document.user.email}</span>
 </div>
 </div>
 <span className="text-xs font-bold text-muted-foreground/50">Owner</span>
 </div>
 )}

 {/* Shared Users */}
 {document.sharedWith?.length === 0 && !document.user && (
 <div className="text-sm text-muted-foreground py-2 flex items-center gap-2">
 <Globe className="w-4 h-4 text-muted-foreground/50" />
 No one else has access
 </div>
 )}

 {document.sharedWith?.map((access) => {
 if (!access.user || access.userId === document.userId) return null; // Skip owner if accidentally in sharedWith
 return (
 <div key={access.id} className="flex items-center justify-between group">
 <div className="flex items-center gap-3">
 <Avatar className="h-9 w-9 border border-border/50">
 <AvatarImage src={access.user.avatar} />
 <AvatarFallback className="text-xs font-bold">{access.user.displayName?.charAt(0) || access.user.email?.charAt(0) || '?'}</AvatarFallback>
 </Avatar>
 <div className="flex flex-col">
 <span className="text-sm font-bold leading-none">{access.user.displayName || 'User'}</span>
 <span className="text-xs text-muted-foreground mt-1">{access.user.email}</span>
 </div>
 </div>
 <div className="flex items-center gap-2">
 <span className="text-xs font-bold text-foreground/70 ">{access.role}</span>
 <Button 
 variant="ghost" 
 size="icon" 
 className="h-7 w-7 text-muted-foreground/40 hover:text-destructive opacity-0 group-hover:opacity-100 transition-all rounded-lg"
 onClick={() => handleRemove(access.userId)}
 disabled={isSubmitting}
 >
 <X className="w-4 h-4" />
 </Button>
 </div>
 </div>
 );
 })}
 </div>
 </div>
 </DialogContent>
 </Dialog>
 );
}
