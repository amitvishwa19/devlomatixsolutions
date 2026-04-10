'use client';

import React from 'react';
import { RefreshCw } from 'lucide-react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export function DeleteContactDialog({
    open,
    onOpenChange,
    contactToDelete,
    onConfirm,
    loading
}) {
    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent className="bg-zinc-950 border-white/5 backdrop-blur-xl">
                <AlertDialogHeader>
                    <AlertDialogTitle className="text-xl font-bold text-white">Remove Contact?</AlertDialogTitle>
                    <AlertDialogDescription className="text-zinc-400 text-sm">
                        You are about to permanently delete <span className="text-white font-bold">{contactToDelete?.name}</span> from the secure vault. This action is irreversible and will remove all associated digital records.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="mt-6 flex gap-2">
                    <AlertDialogCancel className="bg-white/5 border-white/10">Close Vault</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={(e) => {
                            e.preventDefault();
                            onConfirm();
                        }}
                        disabled={loading}
                        className="bg-destructive hover:bg-destructive/90    px-6 "
                    >
                        {loading ? (
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                            'Confirm Deletion'
                        )}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
