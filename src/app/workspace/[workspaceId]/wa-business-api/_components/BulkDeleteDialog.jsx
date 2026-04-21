'use client';

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Trash2, AlertTriangle, Loader2 } from 'lucide-react';

export default function BulkDeleteDialog({
    isOpen,
    onOpenChange,
    count,
    onDelete,
    isDeleting
}) {
    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[400px] p-0 overflow-hidden bg-card border-none shadow-2xl">
                <DialogHeader className="p-8 pb-4 text-center">
                    <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
                        <AlertTriangle className="w-8 h-8 text-destructive animate-pulse" />
                    </div>
                    <DialogTitle className="text-xl font-black">Mass Deletion Protocol</DialogTitle>
                    <DialogDescription className="text-xs font-bold uppercase tracking-widest text-muted-foreground mt-2">
                        This action will permanently erase <span className="text-destructive font-black underline">{count}</span> identity records.
                    </DialogDescription>
                </DialogHeader>
                
                <div className="px-8 pb-8 flex flex-col gap-4">
                    <div className="p-4 bg-muted/20 rounded-2xl border border-dashed border-border/40 text-[10px] font-medium leading-relaxed text-center italic">
                        "Deleting these contacts will remove all associated metadata and interaction logs from the local database. This action is irreversible."
                    </div>
                    
                    <div className="flex gap-3">
                        <Button variant="ghost" className="flex-1 h-11 rounded-xl font-black uppercase tracking-widest text-[10px]" disabled={isDeleting} onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" className="flex-1 h-11 rounded-xl shadow-lg shadow-destructive/20 font-black uppercase tracking-widest text-[10px] gap-2" onClick={onDelete} disabled={isDeleting}>
                            {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                            Execute Deletion
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
