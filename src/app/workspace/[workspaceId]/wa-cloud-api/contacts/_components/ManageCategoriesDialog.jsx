'use client';

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog";
import CategoriesManager from "./CategoriesManager";

export default function ManageCategoriesDialog({ isOpen, onOpenChange, workspaceId, categories, onUpdate }) {
    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Audience Categories</DialogTitle>
                    <DialogDescription>Define high-level segments for your contacts.</DialogDescription>
                </DialogHeader>
                <CategoriesManager 
                    workspaceId={workspaceId} 
                    categories={categories} 
                    onUpdate={onUpdate} 
                    type="CONTACT" 
                />
            </DialogContent>
        </Dialog>
    );
}
