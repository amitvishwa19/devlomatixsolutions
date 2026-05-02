'use client';

import React from 'react';
import { Trash2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

export function DeleteAccountModal({
    open,
    onOpenChange,
    accountName,
    onDelete,
    loading
}) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className=" borderrounded-md shadow-2xl">
                <DialogHeader className="space-y-4">

                    <div className="space-y-1">
                        <DialogTitle className="flex items-center gap-2 text-xl font-semibold tracking-tight">
                            <Trash2 className="w-6 h-6 text-destructive" />
                            Delete Account?
                        </DialogTitle>
                        <DialogDescription className="text-sm font-medium leading-relaxed">
                            This will permanently remove the cloud credentials and stop all automated handlers for <span className="text-foreground font-semibold">"{accountName}"</span>.
                        </DialogDescription>
                    </div>
                </DialogHeader>
                <DialogFooter className="flex flex-row gap-2">

                    <Button
                        variant="outline"
                        className="text-sm font-medium  px-8 rounded-md border border-border/20"
                        onClick={() => onOpenChange(false)}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="destructive"
                        className="text-sm font-medium  px-8 rounded-md shadow-lg shadow-destructive/10 flex-1"
                        onClick={onDelete}
                        disabled={loading}
                    >
                        {loading ? "Deleting..." : "Delete Account"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
