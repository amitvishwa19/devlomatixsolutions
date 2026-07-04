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
import { Loader2, Share2, X, Mail } from 'lucide-react';
import { useAction } from "@/hooks/use-action";
import { shareTemplate } from '../_actions/share-template';
import { removeTemplateShare } from '../_actions/remove-template-share';
import { searchUsers } from '../_actions/search-users';

export default function ShareTemplateDialog({ isOpen, onOpenChange, template, workspaceId, currentUserId, onShareUpdate }) {
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

    const { execute: executeShare, isLoading: isSharing } = useAction(shareTemplate, {
        onSuccess: (data) => {
            toast.success(`Template shared with ${data.sharedWith.displayName || data.sharedWith.email}`);
            onShareUpdate?.();
            onOpenChange(false);
        },
        onError: (err) => toast.error(err)
    });

    const { execute: executeRemoveShare, isLoading: isRemoving } = useAction(removeTemplateShare, {
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
        executeShare({ workspaceId, templateId: template.id, email: selectedUserId });
    };

    if (!template) return null;

    const sharedWith = template.sharedWith || [];
    const excludedIds = new Set(sharedWith.map(s => s.sharedWithUserId));
    if (currentUserId) excludedIds.add(currentUserId);

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="bg-card border-border max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Share2 className="w-4 h-4" /> Share Template
                    </DialogTitle>
                    <DialogDescription>
                        Share &quot;{template.name}&quot; with other users.
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
                                        const isShared = excludedIds.has(user.id);
                                        return (
                                            <SelectItem key={user.id} value={user.email} disabled={isShared}>
                                                {user.displayName || user.email} {isShared ? '(Already shared)' : ''}
                                            </SelectItem>
                                        );
                                    })}
                                </SelectContent>
                            </Select>
                            <Button onClick={handleShare} disabled={isSharing || !selectedUserId} className="gap-2">
                                {isSharing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Share2 className="w-4 h-4" />}
                                Share
                            </Button>
                        </div>
                    </div>

                    {sharedWith.length > 0 && (
                        <div className="space-y-2">
                            <Label>Shared with</Label>
                            <div className="space-y-2 max-h-40 overflow-y-auto">
                                {sharedWith.map((share) => (
                                    <div key={share.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/30 border border-border/50">
                                        <div className="flex items-center gap-2 min-w-0">
                                            <Mail className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                                            <span className="text-sm truncate">{share.sharedWith?.displayName || share.sharedWith?.email}</span>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="w-7 h-7 text-muted-foreground hover:text-destructive shrink-0"
                                            onClick={() => executeRemoveShare({ workspaceId, templateId: template.id, sharedWithUserId: share.sharedWithUserId })}
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
