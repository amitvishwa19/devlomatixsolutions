'use client';

import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, Share2, X, Mail, Layers, Tag } from 'lucide-react';
import { useAction } from "@/hooks/use-action";
import { shareContact } from '../_actions/share-contact';
import { shareContactsByFilter } from '../_actions/share-contacts-by-filter';
import { removeContactShare } from '../_actions/remove-contact-share';
import { searchUsers } from '../../template/_actions/search-users';

export default function ShareContactDialog({ isOpen, onOpenChange, contact, workspaceId, currentUserId, onShareUpdate, filterInfo }) {
    const [selectedUserId, setSelectedUserId] = useState('');
    const [users, setUsers] = useState([]);
    const [usersLoading, setUsersLoading] = useState(false);

    const { execute: executeSearch } = useAction(searchUsers, {
        onSuccess: (data) => setUsers(data || []),
        onError: () => setUsers([]),
        onComplete: () => setUsersLoading(false)
    });

    useEffect(() => {
        if (isOpen) {
            setSelectedUserId('');
            setUsersLoading(true);
            executeSearch({ workspaceId, query: '' });
        }
    }, [isOpen, workspaceId, executeSearch]);

    const { execute: executeShare, isLoading: isSharing } = useAction(shareContact, {
        onSuccess: (data) => {
            toast.success(`Contact shared with ${data.sharedWith.displayName || data.sharedWith.email}`);
            onShareUpdate?.();
            onOpenChange(false);
        },
        onError: (err) => toast.error(err)
    });

    const { execute: executeShareFilter, isLoading: isSharingFilter } = useAction(shareContactsByFilter, {
        onSuccess: (data) => {
            toast.success(`Shared ${data.count} contact(s) with ${data.user.displayName || data.user.email}`);
            onShareUpdate?.();
            onOpenChange(false);
        },
        onError: (err) => toast.error(err)
    });

    const { execute: executeRemoveShare, isLoading: isRemoving } = useAction(removeContactShare, {
        onSuccess: () => {
            toast.success('Share access removed');
            onShareUpdate?.();
        },
        onError: (err) => toast.error(err)
    });

    const handleShare = () => {
        if (!selectedUserId) {
            toast.error('Please select a user');
            return;
        }
        if (filterInfo) {
            executeShareFilter({ workspaceId, filterType: filterInfo.type, filterValue: filterInfo.value, email: selectedUserId });
        } else if (contact) {
            executeShare({ workspaceId, contactId: contact.id, email: selectedUserId });
        }
    };

    if (!contact && !filterInfo) return null;

    const isFilterMode = !!filterInfo;

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="bg-card border-border max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        {filterInfo ? <Layers className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
                        {filterInfo ? `Share "${filterInfo.value}"` : 'Share Contact'}
                    </DialogTitle>
                    <DialogDescription>
                        {filterInfo
                            ? `Share all contacts in "${filterInfo.value}" (${filterInfo.count || 0} contacts) with a user.`
                            : `Share "${contact?.name}" with other users.`
                        }
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label>Select User</Label>
                        <div className="flex gap-2">
                            <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                                <SelectTrigger className="flex-1">
                                    <SelectValue placeholder="Choose a user..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {users.map((user) => {
                                        const isShared = new Set([...(contact?.sharedWith || []).map(s => s.sharedWithUserId), ...(currentUserId ? [currentUserId] : [])]).has(user.id);
                                        return (
                                            <SelectItem key={user.id} value={user.email} disabled={isShared}>
                                                {user.displayName || user.email} {isShared ? '(Already shared)' : ''}
                                            </SelectItem>
                                        );
                                    })}
                                </SelectContent>
                            </Select>
                            <Button onClick={handleShare} disabled={(isSharing || isSharingFilter) || !selectedUserId} className="gap-2">
                                {(isSharing || isSharingFilter) ? <Loader2 className="w-4 h-4 animate-spin" /> : <Share2 className="w-4 h-4" />}
                                Share
                            </Button>
                        </div>
                    </div>

                    {!isFilterMode && (contact?.sharedWith?.length > 0) && (
                        <div className="space-y-2">
                            <Label>Shared with</Label>
                            <div className="space-y-2 max-h-40 overflow-y-auto">
                                {(contact?.sharedWith || []).map((share) => (
                                    <div key={share.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/30 border border-border/50">
                                        <div className="flex items-center gap-2 min-w-0">
                                            <Mail className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                                            <span className="text-sm truncate">{share.sharedWith?.displayName || share.sharedWith?.email}</span>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="w-7 h-7 text-muted-foreground hover:text-destructive shrink-0"
                                            onClick={() => executeRemoveShare({ workspaceId, contactId: contact.id, sharedWithUserId: share.sharedWithUserId })}
                                            disabled={isRemoving}
                                        >
                                            <X className="w-3.5 h-3.5" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
