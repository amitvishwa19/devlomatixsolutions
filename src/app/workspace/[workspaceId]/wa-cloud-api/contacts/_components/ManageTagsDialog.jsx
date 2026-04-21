'use client';

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog";
import CategoriesManager from "./CategoriesManager";

export default function ManageTagsDialog({ isOpen, onOpenChange, workspaceId, categories, onUpdate }) {
    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Tag Library</DialogTitle>
                    <DialogDescription>Define structured tags to organize your audience.</DialogDescription>
                </DialogHeader>
                <CategoriesManager 
                    workspaceId={workspaceId} 
                    categories={categories} 
                    onUpdate={onUpdate} 
                    type="TAG" 
                />
            </DialogContent>
        </Dialog>
    );
}
