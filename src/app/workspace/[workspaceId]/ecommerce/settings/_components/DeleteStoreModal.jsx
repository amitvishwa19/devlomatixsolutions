"use client";

import { Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

export function DeleteStoreModal({ open, onClose, store, onConfirm, isDeleting }) {
    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="bg-card border-white/10 text-white">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Trash2 className="w-5 h-5 text-rose-500" />
                        Delete Store
                    </DialogTitle>
                    <DialogDescription className="text-muted-foreground">
                        Are you sure you want to delete <span className="text-white font-semibold">{store?.name}</span>? 
                        This action cannot be undone and all associated data will be permanently lost.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="gap-2 sm:gap-0">
                    <Button variant="outline" onClick={onClose} disabled={isDeleting} className="border-white/10">
                        Cancel
                    </Button>
                    <Button 
                        variant="destructive" 
                        onClick={onConfirm}
                        disabled={isDeleting}
                        className="bg-rose-500 hover:bg-rose-600"
                    >
                        {isDeleting ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Deleting...
                            </>
                        ) : (
                            <>
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete Store
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}