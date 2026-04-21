'use client';

import React from 'react';
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
import { RefreshCw } from 'lucide-react';

export default function DeleteCampaignModal({
    isOpen,
    onOpenChange,
    onConfirm,
    isLoading,
    campaignName
}) {
    return (
        <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
            <AlertDialogContent className="rounded-lg border">
                <AlertDialogHeader>
                    <AlertDialogTitle className="font-bold text-xl">
                        Purge {campaignName ? `"${campaignName}"` : 'Object'}?
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-sm text-muted-foreground">
                        This will permanently remove the broadcast metrics and queue data. This action is irreversible.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="gap-2">
                    <AlertDialogCancel
                        disabled={isLoading}
                        className="rounded- font-bold border-border/40"
                    >
                        Cancel
                    </AlertDialogCancel>
                    <Button
                        disabled={isLoading}
                        className="rounded-md font-bold bg-red-500 hover:bg-red-600 border-none min-w-[100px]"
                        onClick={onConfirm}
                    >
                        {isLoading ? (
                            <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                        ) : null}
                        {isLoading ? 'Deleting......' : 'Delete'}
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
