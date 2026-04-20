'use client';

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

import { Loader2 } from "lucide-react";

export default function BulkDeleteDialog({ isOpen, onOpenChange, count, onConfirm, isProcessing }) {
    return (
        <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Delete {count} contacts permanently? This action cannot be undone.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isProcessing}>Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                        onClick={onConfirm} 
                        disabled={isProcessing} 
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90 gap-2"
                    >
                        {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                        {isProcessing ? 'Deleting...' : 'Delete'}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
