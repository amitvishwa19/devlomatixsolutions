'use client';

import React, { useState } from 'react';
import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { deleteCategory } from '../_actions/deleteCategory';
import { toast } from 'sonner';
import { Loader2, Trash2 } from 'lucide-react';

export function DeleteCategoryModal({ isOpen, onClose, workspaceId, category, onSuccess }) {
    const [isDeleting, setIsDeleting] = useState(false);

    if (!category) return null;

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            const result = await deleteCategory({ 
                workspaceId, 
                categoryId: category.id 
            });

            if (result?.error) {
                toast.error(result.error);
                return;
            }

            toast.success("Category deleted successfully");
            if (onSuccess) onSuccess();
            onClose();
        } catch (error) {
            toast.error("Failed to delete category");
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <AlertDialog open={isOpen} onOpenChange={(open) => !open && !isDeleting && onClose?.()}>
            <AlertDialogContent className="sm:max-w-[425px] bg-card/95 backdrop-blur-2xl border-destructive/20 shadow-2xl">
                <AlertDialogHeader>
                    <AlertDialogTitle className="text-lg font-bold text-destructive flex items-center gap-2">
                        <Trash2 className="w-5 h-5 text-destructive shrink-0" />
                        <span>Delete Category</span>
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-xs font-medium text-muted-foreground mt-2">
                        Are you sure you want to delete <span className="font-bold text-foreground">"{category.name}"</span>? 
                        This action cannot be undone and will remove the category from all associated products.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="gap-2 sm:gap-0 mt-4">
                    <AlertDialogCancel 
                        disabled={isDeleting} 
                        className="rounded-md font-bold"
                    >
                        Cancel
                    </AlertDialogCancel>
                    <Button 
                        onClick={handleDelete} 
                        disabled={isDeleting}
                        variant="destructive"
                        className="rounded-md font-bold flex items-center gap-2"
                    >
                        {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                        {isDeleting ? "Deleting..." : "Delete Category"}
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
