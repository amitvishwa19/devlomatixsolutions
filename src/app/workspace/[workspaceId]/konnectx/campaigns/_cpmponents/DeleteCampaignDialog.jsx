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
import { Trash2 } from 'lucide-react';

export default function DeleteCampaignDialog({ open, onOpenChange, campaign, isDeleting, onConfirm }) {
    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Delete Campaign</AlertDialogTitle>
                    <AlertDialogDescription>
                        Are you sure you want to delete <span className="font-semibold text-foreground">{campaign?.name}</span>? This action cannot be undone.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => onOpenChange(false)} disabled={isDeleting}>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={onConfirm} disabled={isDeleting} className="bg-destructive text-destructive-foreground hover:bg-destructive/80 min-w-[80px]">
                        {isDeleting ? <Trash2 className="w-4 h-4 animate-spin" /> : "Delete"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
