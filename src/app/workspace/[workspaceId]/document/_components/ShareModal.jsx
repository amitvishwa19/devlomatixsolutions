'use client';

import { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, Loader2, Users, X, UserPlus, Globe, Copy, Check, ShieldCheck, Shield, Lock, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { getDocumentShareInfo } from '../_actions/get-document-share-info';
import { getShareableWorkspaceUsers } from '../_actions/get-shareable-workspace-users';
import { shareDocumentWithUser } from '../_actions/share-document';
import { unshareDocumentWithUser } from '../_actions/unshare-document';

export default function ShareModal({ isOpen, onOpenChange, document, workspaceId, onShareComplete }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedRole, setSelectedRole] = useState('VIEWER');
    const [collaborators, setCollaborators] = useState([]);
    const [owner, setOwner] = useState(null);
    const [isLoadingAccess, setIsLoadingAccess] = useState(false);
    const [copied, setCopied] = useState(false);

    // Fetch full access list when modal opens
    const fetchAccessList = useCallback(async () => {
        if (!document?.id || !workspaceId) return;
        try {
            setIsLoadingAccess(true);
            const res = await getDocumentShareInfo(workspaceId, document.id);
            if (res.success && res.data) {
                setCollaborators(res.data.sharedWith || []);
                setOwner(res.data.user || null);
            }
        } catch (error) {
            console.error("Error fetching access list:", error);
        } finally {
            setIsLoadingAccess(false);
        }
    }, [document?.id, workspaceId]);

    useEffect(() => {
        if (isOpen && document?.id) {
            fetchAccessList();
            setSearchQuery('');
            setSearchResults([]);
        }
    }, [isOpen, document?.id, fetchAccessList]);

    // Live search for workspace users
    useEffect(() => {
        if (!isOpen) return;

        const delayFn = setTimeout(async () => {
            setIsSearching(true);
            try {
                const res = await getShareableWorkspaceUsers(workspaceId, searchQuery);

                // Filter out the owner and already added users from the dropdown
                const existingUserIds = new Set([
                    document?.userId,
                    owner?.id,
                    ...(collaborators.map(c => c.userId || c.user?.id))
                ].filter(Boolean));

                const filtered = (res.data || []).filter(u => !existingUserIds.has(u.id));
                setSearchResults(filtered);
            } catch (error) {
                console.error("User search error:", error);
            } finally {
                setIsSearching(false);
            }
        }, 300);

        return () => clearTimeout(delayFn);
    }, [searchQuery, isOpen, workspaceId, document?.id, owner?.id, collaborators]);

    const handleShareUser = async (targetUserId, roleToAssign = selectedRole) => {
        if (!document?.id || !targetUserId) return;
        setIsSubmitting(true);
        try {
            const res = await shareDocumentWithUser(workspaceId, document.id, {
                userId: targetUserId,
                role: roleToAssign
            });
            if (!res.success) throw new Error(res.error);
            toast.success("Collaborator access granted");
            setSearchQuery('');
            setSearchResults([]);
            fetchAccessList();
            if (onShareComplete) onShareComplete();
        } catch (error) {
            console.error("Failed to grant access:", error);
            toast.error(error.message || "Failed to grant access");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdateRole = async (targetUserId, newRole) => {
        if (!document?.id || !targetUserId) return;
        setIsSubmitting(true);
        try {
            const res = await shareDocumentWithUser(workspaceId, document.id, {
                userId: targetUserId,
                role: newRole
            });
            if (!res.success) throw new Error(res.error);
            toast.success(`Role updated to ${newRole}`);
            fetchAccessList();
            if (onShareComplete) onShareComplete();
        } catch (error) {
            toast.error(error.message || "Failed to update role");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleRevokeAccess = async (targetUserId) => {
        if (!document?.id || !targetUserId) return;
        setIsSubmitting(true);
        try {
            const res = await unshareDocumentWithUser(workspaceId, document.id, {
                userId: targetUserId
            });
            if (!res.success) throw new Error(res.error);
            toast.success("Access revoked");
            fetchAccessList();
            if (onShareComplete) onShareComplete();
        } catch (error) {
            toast.error(error.message || "Failed to revoke access");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCopyLink = () => {
        if (typeof window === 'undefined') return;
        const shareUrl = `${window.location.origin}/workspace/${workspaceId}/document?preview=${document?.id}`;
        navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        toast.success("Direct link copied to clipboard!");
        setTimeout(() => setCopied(false), 2500);
    };

    if (!document) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg rounded-xl border border-border/60 bg-card p-0 shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="p-6 pb-4 border-b border-border/30 bg-muted/20">
                    <DialogHeader className="space-y-1.5">
                        <div className="flex items-center gap-2 text-primary">
                            <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
                                <Users className="w-4 h-4 text-primary" />
                            </div>
                            <DialogTitle className="text-lg font-bold">
                                Share {document.isFolder ? 'Folder' : 'Document'}
                            </DialogTitle>
                        </div>
                        <DialogDescription className="text-xs text-muted-foreground truncate max-w-full">
                            Manage collaborator permissions for <span className="font-semibold text-foreground">{document.name}</span>
                        </DialogDescription>
                    </DialogHeader>

                    {/* Invite / Search input */}
                    <div className="mt-4 flex items-center gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder="Search workspace members by name or email..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9 h-10 bg-background text-xs rounded-lg border-border/60 focus-visible:ring-1 focus-visible:ring-primary font-medium"
                            />
                            {isSearching && (
                                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-muted-foreground" />
                            )}
                        </div>
                        <Select value={selectedRole} onValueChange={setSelectedRole}>
                            <SelectTrigger className="w-[105px] h-10 bg-background text-xs font-semibold rounded-lg border-border/60">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="rounded-lg shadow-xl border-border/50">
                                <SelectItem value="VIEWER" className="text-xs font-semibold py-1.5">Viewer</SelectItem>
                                <SelectItem value="EDITOR" className="text-xs font-semibold py-1.5">Editor</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Live search results drop panel */}
                    {searchResults.length > 0 && (
                        <div className="mt-2 bg-background rounded-lg border border-border/60 shadow-xl max-h-48 overflow-y-auto divide-y divide-border/30">
                            {searchResults.map((user) => (
                                <div key={user.id} className="flex items-center justify-between p-2.5 hover:bg-muted/40 transition-colors">
                                    <div className="flex items-center gap-2.5 min-w-0">
                                        <Avatar className="h-8 w-8 border border-border/40">
                                            <AvatarImage src={user.avatar} />
                                            <AvatarFallback className="text-[10px] font-bold bg-primary/10 text-primary">
                                                {user.displayName?.charAt(0) || user.email?.charAt(0) || '?'}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex flex-col min-w-0">
                                            <div className="flex items-center gap-1.5">
                                                <span className="text-xs font-bold truncate text-foreground">{user.displayName}</span>
                                                {user.isWorkspaceMember && (
                                                    <Badge variant="secondary" className="text-[8px] px-1 py-0 h-3.5 bg-primary/10 text-primary">Member</Badge>
                                                )}
                                            </div>
                                            <span className="text-[10px] text-muted-foreground truncate">{user.email}</span>
                                        </div>
                                    </div>
                                    <Button
                                        size="sm"
                                        onClick={() => handleShareUser(user.id)}
                                        disabled={isSubmitting}
                                        className="h-7 text-xs font-semibold rounded-md px-3 bg-primary hover:bg-primary/90"
                                    >
                                        <UserPlus className="w-3.5 h-3.5 mr-1" /> Invite
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* People with Access Section */}
                <div className="p-6 space-y-4 max-h-[320px] overflow-y-auto">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                            People with Access ({1 + collaborators.filter(c => c.userId !== (owner?.id || document.userId)).length})
                        </span>
                        {isLoadingAccess && <Loader2 className="w-3.5 h-3.5 animate-spin text-muted-foreground" />}
                    </div>

                    <div className="space-y-2.5">
                        {/* Owner Row */}
                        {(owner || document.user) && (
                            <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted/30 border border-border/30">
                                <div className="flex items-center gap-3 min-w-0">
                                    <Avatar className="h-8 w-8 border border-border/50">
                                        <AvatarImage src={owner?.avatar || document.user?.avatar} />
                                        <AvatarFallback className="text-xs font-bold bg-amber-500/10 text-amber-500">
                                            {(owner?.displayName || document.user?.displayName || document.user?.name)?.charAt(0) || 'O'}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex flex-col min-w-0">
                                        <div className="flex items-center gap-1.5">
                                            <span className="text-xs font-bold text-foreground truncate">
                                                {owner?.displayName || document.user?.displayName || document.user?.name || 'Owner'}
                                            </span>
                                            <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/30 text-[9px] px-1 py-0">Owner</Badge>
                                        </div>
                                        <span className="text-[11px] text-muted-foreground truncate">{owner?.email || document.user?.email}</span>
                                    </div>
                                </div>
                                <span className="text-[11px] font-semibold text-muted-foreground pr-2">Full Control</span>
                            </div>
                        )}

                        {/* Collaborators List */}
                        {collaborators.map((access) => {
                            const isOwnerRow = access.userId === (owner?.id || document.userId);
                            if (isOwnerRow || !access.user) return null;

                            return (
                                <div key={access.id} className="flex items-center justify-between p-2.5 rounded-lg bg-card hover:bg-muted/30 border border-border/40 transition-colors group">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <Avatar className="h-8 w-8 border border-border/50">
                                            <AvatarImage src={access.user.avatar} />
                                            <AvatarFallback className="text-xs font-bold bg-primary/10 text-primary">
                                                {access.user.displayName?.charAt(0) || access.user.name?.charAt(0) || access.user.email?.charAt(0) || '?'}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex flex-col min-w-0">
                                            <span className="text-xs font-bold text-foreground truncate">
                                                {access.user.displayName || access.user.name || 'User'}
                                            </span>
                                            <span className="text-[11px] text-muted-foreground truncate">{access.user.email}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-1.5 shrink-0">
                                        <Select
                                            value={access.role}
                                            onValueChange={(newRole) => handleUpdateRole(access.userId, newRole)}
                                            disabled={isSubmitting}
                                        >
                                            <SelectTrigger className="h-7 w-[90px] text-[11px] font-semibold bg-muted/40 border-border/50 rounded-md">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-md">
                                                <SelectItem value="VIEWER" className="text-xs font-semibold py-1">Viewer</SelectItem>
                                                <SelectItem value="EDITOR" className="text-xs font-semibold py-1">Editor</SelectItem>
                                            </SelectContent>
                                        </Select>

                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-7 w-7 text-muted-foreground/60 hover:text-destructive hover:bg-destructive/10 rounded-md"
                                            onClick={() => handleRevokeAccess(access.userId)}
                                            disabled={isSubmitting}
                                            title="Revoke access"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </Button>
                                    </div>
                                </div>
                            );
                        })}

                        {collaborators.filter(c => c.userId !== (owner?.id || document.userId)).length === 0 && (
                            <div className="py-6 text-center border border-dashed border-border/50 rounded-lg">
                                <Globe className="w-6 h-6 text-muted-foreground/40 mx-auto mb-1.5" />
                                <p className="text-xs font-medium text-muted-foreground">Only the owner currently has access.</p>
                                <p className="text-[10px] text-muted-foreground/70 mt-0.5">Use the search box above to add team members.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer Link Share */}
                <div className="p-4 bg-muted/30 border-t border-border/40 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground truncate">
                        <Lock className="w-3.5 h-3.5 shrink-0 text-emerald-500" />
                        <span className="truncate">Restricted to workspace members with access</span>
                    </div>

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCopyLink}
                        className="text-xs font-semibold gap-1.5 h-8 bg-background border-border/60 hover:bg-primary/5 hover:text-primary shrink-0"
                    >
                        {copied ? (
                            <>
                                <Check className="w-3.5 h-3.5 text-emerald-500" /> Copied
                            </>
                        ) : (
                            <>
                                <Copy className="w-3.5 h-3.5" /> Copy Link
                            </>
                        )}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}