'use client';

import React from 'react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { Loader2, Trash2 } from "lucide-react";

export default function BulkDeleteDialog({ isOpen, onOpenChange, count, onConfirm, isProcessing }) {
    return (
        <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
            <AlertDialogContent className="sm:max-w-[425px] bg-card/95 backdrop-blur-2xl border-destructive/20 shadow-2xl">
                <DialogHeaderWrapper>
                    <AlertDialogTitle className="text-lg font-bold text-destructive flex items-center gap-2">
                        <Trash2 className="w-5 h-5 text-destructive shrink-0" />
                        <span>Delete Contacts?</span>
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-xs font-medium text-muted-foreground mt-2">
                        Are you sure you want to delete <span className="font-bold text-foreground">{count} contacts</span> permanently? This action cannot be undone.
                    </AlertDialogDescription>
                </DialogHeaderWrapper>
                <AlertDialogFooter className="gap-2 sm:gap-0 mt-4">
                    <AlertDialogCancel disabled={isProcessing} className="rounded-md font-bold">Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                        onClick={onConfirm} 
                        disabled={isProcessing} 
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-md font-bold gap-2"
                    >
                        {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                        {isProcessing ? 'Deleting...' : `Delete ${count} Contacts`}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

function DialogHeaderWrapper({ children }) {
    return <AlertDialogHeader>{children}</AlertDialogHeader>;
}
