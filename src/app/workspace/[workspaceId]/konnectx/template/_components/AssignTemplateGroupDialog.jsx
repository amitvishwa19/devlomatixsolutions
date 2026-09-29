'use client';

import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { FolderPlus, Layers, Loader2, Tag } from 'lucide-react';
import { useAction } from '@/hooks/use-action';
import { assignTemplateGroup } from '../_actions/assign-template-group';
import { toast } from 'sonner';
import { getTemplateDisplayName } from '../../_lib/template-formatter';

export default function AssignTemplateGroupDialog({
    isOpen,
    onOpenChange,
    template,
    workspaceId,
    groups = [],
    onSuccess,
    onOpenManageGroups
}) {
    const [selectedGroupId, setSelectedGroupId] = useState('NONE');

    useEffect(() => {
        if (template) {
            const currentGroupId = template.metadata?.groupId || 'NONE';
            setSelectedGroupId(currentGroupId);
        }
    }, [template, isOpen]);

    const { execute: executeAssign, isLoading: isAssigning } = useAction(assignTemplateGroup, {
        onSuccess: (res) => {
            toast.success(
                res.groupName
                    ? `Template moved to group "${res.groupName}"`
                    : "Template removed from group"
            );
            onOpenChange?.(false);
            onSuccess?.();
        },
        onError: (err) => {
            toast.error(err || "Failed to assign group");
        }
    });

    const handleSave = () => {
        if (!template) return;
        executeAssign({
            workspaceId,
            templateIds: [template.id],
            groupId: selectedGroupId === 'NONE' ? null : selectedGroupId
        });
    };

    if (!template) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md bg-card border-border">
                <DialogHeader className="space-y-1">
                    <DialogTitle className="flex items-center gap-2 text-base font-bold">
                        <FolderPlus className="w-4 h-4 text-primary" />
                        Assign Template Group
                    </DialogTitle>
                    <DialogDescription className="text-xs text-muted-foreground">
                        Select a group for <span className="font-semibold text-foreground">{getTemplateDisplayName(template)}</span>.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-2">
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-foreground block">
                            Choose Group
                        </label>
                        <Select
                            value={selectedGroupId}
                            onValueChange={setSelectedGroupId}
                        >
                            <SelectTrigger className="w-full bg-background border-border">
                                <SelectValue placeholder="Select a group" />
                            </SelectTrigger>
                            <SelectContent className="bg-card border-border">
                                <SelectItem value="NONE" className="text-muted-foreground">
                                    <span className="flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-muted-foreground/40" />
                                        No Group (Ungrouped)
                                    </span>
                                </SelectItem>
                                {groups.map((group) => (
                                    <SelectItem key={group.id} value={group.id}>
                                        <span className="flex items-center gap-2">
                                            <span
                                                className="w-2.5 h-2.5 rounded-full"
                                                style={{ backgroundColor: group.color || '#3b82f6' }}
                                            />
                                            {group.name}
                                        </span>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex items-center justify-between pt-1 text-xs">
                        <span className="text-muted-foreground">Need a new group?</span>
                        <Button
                            type="button"
                            variant="link"
                            size="sm"
                            className="h-auto p-0 text-primary font-semibold"
                            onClick={() => {
                                onOpenChange?.(false);
                                onOpenManageGroups?.();
                            }}
                        >
                            + Create & Manage Groups
                        </Button>
                    </div>
                </div>

                <DialogFooter className="gap-2 sm:gap-0">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => onOpenChange?.(false)}
                        disabled={isAssigning}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        onClick={handleSave}
                        disabled={isAssigning}
                        className="gap-2 font-semibold"
                    >
                        {isAssigning && <Loader2 className="w-4 h-4 animate-spin" />}
                        Save Group
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
