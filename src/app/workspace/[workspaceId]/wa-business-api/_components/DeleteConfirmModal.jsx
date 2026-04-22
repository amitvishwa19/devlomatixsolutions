'use client';

import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { 
    Trash2, 
    AlertTriangle, 
    RefreshCw, 
    X,
    ShieldAlert
} from 'lucide-react';

export default function DeleteConfirmModal({
    isOpen,
    onOpenChange,
    onConfirm,
    isLoading,
    title = "Confirm Deletion",
    description = "This action will permanently remove this item.",
    itemName = "",
    warningText = "Irreversible action. All associated records will be purged.",
    actionText = "CONFIRM DELETE"
}) {
    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[400px] p-0 overflow-hidden border bg-background/95 backdrop-blur-xl shadow-2xl rounded-3xl border-red-500/10">
                <div className="flex flex-col relative">
                    {/* Header Aesthetic */}
                    <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-red-500/10 to-transparent pointer-events-none" />
                    
                    <div className="p-8 pb-4 relative z-10 text-center">
                        <div className="flex flex-col items-center gap-4">
                            <div className="p-4 bg-red-500/10 rounded-2xl ring-8 ring-red-500/5 animate-pulse">
                                <ShieldAlert className="w-8 h-8 text-red-500" />
                            </div>
                            
                            <div className="space-y-2">
                                <DialogTitle className="text-xl font-bold tracking-tight">
                                    {title}
                                </DialogTitle>
                                <DialogDescription className="text-xs font-medium text-muted-foreground leading-relaxed px-4">
                                    {description} {itemName && <span className="text-foreground font-bold underline decoration-red-500/30 underline-offset-4">{itemName}</span>}
                                </DialogDescription>
                            </div>
                        </div>
                    </div>

                    <div className="px-8 py-6 space-y-4 relative z-10">
                        <div className="p-4 rounded-xl bg-muted/30 border border-border/40 flex items-start gap-3">
                            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                            <p className="text-[10px] text-muted-foreground/80 leading-relaxed font-medium">
                                {warningText}
                            </p>
                        </div>
                    </div>

                    <div className="p-6 pt-0 bg-background/50 relative z-10">
                        <div className="flex items-center gap-3">
                            <Button
                                variant="outline"
                                className="flex-1 rounded-xl h-11 text-xs font-bold border-border/40 hover:bg-background transition-all"
                                onClick={() => onOpenChange(false)}
                                disabled={isLoading}
                            >
                                <X className="w-3.5 h-3.5 mr-2" />
                                DISMISS
                            </Button>
                            <Button
                                className="flex-1 rounded-xl h-11 text-xs font-bold bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/20 border-none transition-all group"
                                onClick={onConfirm}
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <RefreshCw className="w-3.5 h-3.5 animate-spin mr-2" />
                                ) : (
                                    <Trash2 className="w-3.5 h-3.5 mr-2 group-hover:scale-110 transition-transform" />
                                )}
                                {isLoading ? 'PURGING...' : actionText}
                            </Button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
