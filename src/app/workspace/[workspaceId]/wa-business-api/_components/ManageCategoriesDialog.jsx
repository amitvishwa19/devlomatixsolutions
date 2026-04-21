'use client';

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import CategoriesManager from "./CategoriesManager";
import { Layers } from "lucide-react";

export default function ManageCategoriesDialog({ isOpen, onOpenChange, workspaceId, categories, onUpdate }) {
    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <Layers className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <DialogTitle className="text-xl font-bold">Standardize Taxonomy</DialogTitle>
                            <DialogDescription className="text-xs">
                                Create logical categories to segment your audience.
                            </DialogDescription>
                        </div>
                    </div>
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
