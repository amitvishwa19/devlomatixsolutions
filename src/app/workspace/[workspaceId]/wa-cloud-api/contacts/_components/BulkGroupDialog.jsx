'use client';

import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2, Layers, Check } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function BulkGroupDialog({ isOpen, onOpenChange, count, groups, onConfirm, isProcessing }) {
    const [selectedGroupId, setSelectedGroupId] = useState('');

    const handleConfirm = () => {
        if (!selectedGroupId) return;
        onConfirm(selectedGroupId);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md bg-card border">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold tracking-tight">Move to Broadcast List</DialogTitle>
                    <DialogDescription>
                        Assign {count} selected contacts to a broadcast group for targeted campaigns.
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4 space-y-4">
                    <Label className="text-xs font-bold text-muted-foreground/60 px-1 uppercase tracking-widest">Select Target Group</Label>
                    <ScrollArea className="h-[250px] pr-4">
                        <div className="grid gap-2">
                            {groups.map((group) => (
                                <div
                                    key={group.id}
                                    onClick={() => setSelectedGroupId(group.id)}
                                    className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all duration-200 ${selectedGroupId === group.id ? 'border-primary bg-primary/10 ring-1 ring-primary/20' : 'hover:bg-muted/30 border-border/40 opacity-70 hover:opacity-100'}`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`p-1.5 rounded-lg ${selectedGroupId === group.id ? 'bg-primary/20' : 'bg-primary/10'}`}>
                                            <Layers className={`w-4 h-4 text-primary ${selectedGroupId === group.id ? 'opacity-100' : 'opacity-70'}`} />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold truncate">{group.name}</span>
                                            {group.description && <span className="text-[10px] text-muted-foreground line-clamp-1">{group.description}</span>}
                                        </div>
                                    </div>
                                    {selectedGroupId === group.id && (
                                        <div className="bg-primary text-primary-foreground rounded-full p-1">
                                            <Check className="w-3 h-3" />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                </div>

                <DialogFooter className="pt-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        className="flex-1"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleConfirm}
                        disabled={isProcessing || !selectedGroupId}
                        className="flex-[2] shadow-lg shadow-primary/20 gap-2 font-bold"
                    >
                        {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Layers className="w-4 h-4" />}
                        {isProcessing ? 'Processing...' : `Move ${count} Contacts`}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
