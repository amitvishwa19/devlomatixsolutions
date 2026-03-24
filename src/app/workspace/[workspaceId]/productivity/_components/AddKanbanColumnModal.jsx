'use client';

import { useState, useEffect } from "react";
import { useModal } from "@/hooks/useModal";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, LayoutPanelTop, Type } from "lucide-react";
import { toast } from "sonner";

export const AddKanbanColumnModal = () => {
    const { isOpen, onClose, type, data } = useModal();
    const isModalOpen = isOpen && type === "addKanbanColumn";
    const { workspaceId, onApply, order } = data || {};

    const [isLoading, setIsLoading] = useState(false);
    const [title, setTitle] = useState("");

    useEffect(() => {
        if (isModalOpen) {
            setTitle("");
        }
    }, [isModalOpen]);

    const onSubmit = async (e) => {
        e.preventDefault();
        try {
            setIsLoading(true);
            const response = await fetch(`/api/workspace/${workspaceId}/productivity/kanban/columns`, {
                method: 'POST',
                body: JSON.stringify({
                    title,
                    order: order || 0
                })
            });
            
            if (!response.ok) throw new Error("Failed to create column");
            
            const newColumn = await response.json();
            toast.success("Column created successfully");
            
            if (onApply) onApply(newColumn);
            onClose();
        } catch (error) {
            console.error(error);
            toast.error("Something went wrong");
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        onClose();
    };

    return (
        <Dialog open={isModalOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md overflow-hidden border shadow-2xl p-0 bg-background rounded-xl">
                <form onSubmit={onSubmit} className="flex flex-col">
                    <DialogHeader className="p-8 pb-0">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 rounded-xl bg-primary/10">
                                <LayoutPanelTop className="h-5 w-5 text-primary" />
                            </div>
                            <DialogTitle className="text-2xl font-bold tracking-tight">
                                Create New Column
                            </DialogTitle>
                        </div>
                        <DialogDescription className="text-sm font-medium text-muted-foreground">
                            Add a new stage to your workspace's Kanban board.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="p-8 space-y-6">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-muted-foreground ml-1 flex items-center gap-1.5 uppercase tracking-widest opacity-70">
                                    <Type size={12} /> Column Title
                                </label>
                                <Input
                                    disabled={isLoading}
                                    className="h-12 bg-muted/30 border-none rounded-xl focus-visible:ring-1 focus-visible:ring-primary shadow-inner text-sm font-bold"
                                    placeholder="e.g. TO DO, REVIEW, DONE"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    required
                                    autoFocus
                                />
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="p-8 pt-0 flex gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleClose}
                            className="h-12 rounded-xl font-bold flex-1 border-border/40 bg-background/50"
                        >
                            Cancel
                        </Button>
                        <Button
                            disabled={isLoading || !title.trim()}
                            className="h-12 rounded-xl font-bold flex-1 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20"
                        >
                            {isLoading ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                "Create Column"
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};
