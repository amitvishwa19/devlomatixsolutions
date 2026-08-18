'use client';

import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    FolderPlus,
    Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { createCategory } from '../_actions/knowbase-actions';

export function CreateCategoryModal({ open, onOpenChange, workspaceId, onCategoryCreated }) {
    const [creating, setCreating] = useState(false);
    const [name, setName] = useState('');

    const handleCreate = async (e) => {
        e.preventDefault();
        if (!name.trim()) return toast.error("Please enter a collection name");

        setCreating(true);
        const res = await createCategory(workspaceId, name);
        if (res.success) {
            toast.success(`Category "${name}" created!`);
            onOpenChange(false);
            setName('');
            if (onCategoryCreated) onCategoryCreated(res.data);
        } else {
            toast.error(res.error || "Failed to create category");
        }
        setCreating(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md bg-card border-border/80 p-0 overflow-hidden flex flex-col">
                <DialogHeader className="p-4 border-b border-border/60 bg-emerald-500/10">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-500">
                            <FolderPlus className="w-4 h-4" />
                        </div>
                        <div>
                            <DialogTitle className="text-sm font-bold text-foreground">
                                Add Knowledge Collection
                            </DialogTitle>
                            <DialogDescription className="text-xs text-muted-foreground">
                                Group related articles into a browsable help category.
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <form onSubmit={handleCreate} className="p-5 space-y-3.5 text-xs">
                    <div className="space-y-1">
                        <Label className="text-xs font-semibold">Category Name</Label>
                        <Input
                            placeholder="e.g. API Integration & Webhooks"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="h-8 text-xs bg-secondary/30 border-border/80"
                            required
                        />
                    </div>

                    <div className="flex justify-end gap-2 pt-2 border-t border-border/40">
                        <Button type="button" variant="ghost" size="sm" onClick={() => onOpenChange(false)} className="h-8 text-xs">
                            Cancel
                        </Button>
                        <Button type="submit" size="sm" disabled={creating} className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs">
                            {creating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Create Collection'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
