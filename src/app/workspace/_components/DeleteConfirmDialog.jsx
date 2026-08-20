'use client';

import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trash2, Loader2 } from "lucide-react";

/**
 * Standard Delete Confirmation Dialog
 * 
 * @param {Object} props
 * @param {boolean} props.isOpen - Dialog open state
 * @param {function} props.onClose - Function to close dialog
 * @param {function} props.onConfirm - Function to trigger delete action
 * @param {string} [props.title='Delete Item'] - Dialog header title
 * @param {string} [props.description] - Custom description text
 * @param {string} [props.entityName] - Highlighted name of item being deleted
 * @param {string} [props.confirmText='Delete'] - Text for the confirm button
 * @param {boolean} [props.isDeleting=false] - Loading state for action
 */
export function DeleteConfirmDialog({
    isOpen,
    onClose,
    onConfirm,
    title = "Delete Item",
    description,
    entityName,
    confirmText = "Delete",
    isDeleting = false,
}) {
    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && !isDeleting && onClose?.()}>
            <DialogContent className="sm:max-w-[425px] bg-card/95 backdrop-blur-2xl border-destructive/20 shadow-2xl">
                <DialogHeader>
                    <DialogTitle className="text-lg font-bold text-destructive flex items-center gap-2">
                        <Trash2 className="w-5 h-5 text-destructive shrink-0" />
                        <span>{title}</span>
                    </DialogTitle>
                    <DialogDescription className="text-xs font-medium text-muted-foreground mt-2">
                        {description || (
                            <>
                                Are you sure you want to delete {entityName ? <span className="font-bold text-foreground">{entityName}</span> : "this item"}? 
                                {" "}This action cannot be undone and will permanently remove all associated records.
                            </>
                        )}
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="gap-2 sm:gap-0 mt-4">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        disabled={isDeleting}
                        className="rounded-md font-bold"
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={onConfirm}
                        disabled={isDeleting}
                        className="rounded-md font-bold"
                    >
                        {isDeleting ? (
                            <span className="flex items-center gap-2">
                                <Loader2 className="w-4 h-4 animate-spin" /> Deleting...
                            </span>
                        ) : (
                            confirmText
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default DeleteConfirmDialog;
