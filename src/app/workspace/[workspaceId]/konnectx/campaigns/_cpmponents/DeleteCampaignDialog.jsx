"use client";

import React from 'react';
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
import { Trash2, Loader2 } from 'lucide-react';

export default function DeleteCampaignDialog({ open, onOpenChange, campaign, isDeleting, onConfirm }) {
    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent className="sm:max-w-[425px] bg-card/95 backdrop-blur-2xl border-destructive/20 shadow-2xl">
                <AlertDialogHeader>
                    <AlertDialogTitle className="text-lg font-bold text-destructive flex items-center gap-2">
                        <Trash2 className="w-5 h-5 text-destructive shrink-0" />
                        <span>Delete Campaign</span>
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-xs font-medium text-muted-foreground mt-2">
                        Are you sure you want to delete <span className="font-bold text-foreground">{campaign?.name}</span>? This action cannot be undone and will remove all scheduled dispatches.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="gap-2 sm:gap-0 mt-4">
                    <AlertDialogCancel onClick={() => onOpenChange(false)} disabled={isDeleting} className="rounded-md font-bold">Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={(e) => {
                            e.preventDefault();
                            onConfirm();
                        }}
                        disabled={isDeleting}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-md font-bold min-w-[80px] flex items-center gap-2"
                    >
                        {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                        {isDeleting ? "Deleting..." : "Delete Campaign"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
