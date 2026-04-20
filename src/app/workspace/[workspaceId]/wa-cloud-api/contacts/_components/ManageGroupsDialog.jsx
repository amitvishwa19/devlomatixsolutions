'use client';

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog";
import GroupsManager from "./GroupsManager";

export default function ManageGroupsDialog({ isOpen, onOpenChange, workspaceId, groups, onUpdate }) {
    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Broadcast Groups</DialogTitle>
                    <DialogDescription>Group your audience for targeted messaging campaigns.</DialogDescription>
                </DialogHeader>
                <GroupsManager 
                    workspaceId={workspaceId} 
                    groups={groups} 
                    onUpdate={onUpdate} 
                />
            </DialogContent>
        </Dialog>
    );
}
