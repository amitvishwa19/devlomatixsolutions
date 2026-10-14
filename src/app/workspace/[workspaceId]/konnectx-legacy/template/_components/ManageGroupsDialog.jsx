'use client';

import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { FolderPlus, Trash2, Edit2, Plus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import {
    saveTemplateGroupAction,
    deleteTemplateGroupAction
} from '../../_actions/template-actions';

const PRESET_COLORS = [
    '#10b981', // emerald
    '#3b82f6', // blue
    '#8b5cf6', // purple
    '#ec4899', // pink
    '#f59e0b', // amber
    '#06b6d4', // cyan
];

export default function ManageGroupsDialog({
    isOpen,
    onClose,
    groups = [],
    workspaceId,
    onGroupsUpdated
}) {
    const [editingGroup, setEditingGroup] = useState(null);
    const [name, setName] = useState('');
    const [color, setColor] = useState('#10b981');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleStartCreate = () => {
        setEditingGroup(null);
        setName('');
        setColor('#10b981');
    };

    const handleStartEdit = (g) => {
        setEditingGroup(g);
        setName(g.name);
        setColor(g.color || '#10b981');
    };

    const handleSaveGroup = async (e) => {
        e?.preventDefault();
        if (!name.trim()) {
            toast.error("Please enter a group name");
            return;
        }

        setIsSubmitting(true);
        try {
            const res = await saveTemplateGroupAction(workspaceId, {
                id: editingGroup?.id,
                name: name.trim(),
                color
            });

            if (!res.success) throw new Error(res.error);

            toast.success(editingGroup ? "Group updated!" : "Group created!");
            setName('');
            setEditingGroup(null);
            if (onGroupsUpdated) onGroupsUpdated();
        } catch (err) {
            toast.error(err.message || "Failed to save group");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteGroup = async (groupId) => {
        if (!confirm("Are you sure you want to delete this group? Templates inside will become ungrouped.")) return;

        try {
            const res = await deleteTemplateGroupAction(workspaceId, groupId);
            if (!res.success) throw new Error(res.error);

            toast.success("Group deleted");
            if (onGroupsUpdated) onGroupsUpdated();
        } catch (err) {
            toast.error(err.message || "Failed to delete group");
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md bg-card/95 backdrop-blur-xl border-border/50 text-foreground p-6 rounded-2xl shadow-2xl">
                <DialogHeader className="space-y-1">
                    <div className="flex items-center gap-2">
                        <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <FolderPlus size={18} />
                        </div>
                        <DialogTitle className="text-base font-bold text-foreground">
                            Manage Template Groups
                        </DialogTitle>
                    </div>
                    <DialogDescription className="text-xs text-muted-foreground">
                        Organize your WhatsApp templates into categorized folders.
                    </DialogDescription>
                </DialogHeader>

                {/* Form to Add / Edit */}
                <form onSubmit={handleSaveGroup} className="space-y-3 p-3.5 rounded-xl bg-card/40 border border-border/40 mt-2">
                    <div className="text-xs font-semibold text-foreground">
                        {editingGroup ? "Edit Group" : "Add New Group"}
                    </div>

                    <div className="flex items-center gap-2">
                        <Input
                            placeholder="Group name (e.g. Sales, Onboarding)..."
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="h-8 text-xs bg-background/50 border-border/50 rounded-lg flex-1"
                        />
                        <div className="flex items-center gap-1">
                            {PRESET_COLORS.map(c => (
                                <button
                                    key={c}
                                    type="button"
                                    onClick={() => setColor(c)}
                                    className={`w-5 h-5 rounded-full border transition-all ${
                                        color === c ? 'border-white scale-110' : 'border-transparent opacity-70 hover:opacity-100'
                                    }`}
                                    style={{ backgroundColor: c }}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-2">
                        {editingGroup && (
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={handleStartCreate}
                                className="h-7 text-xs text-muted-foreground"
                            >
                                Cancel Edit
                            </Button>
                        )}
                        <Button
                            type="submit"
                            size="sm"
                            disabled={isSubmitting || !name.trim()}
                            className="h-7 text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-bold gap-1 rounded-lg"
                        >
                            {isSubmitting ? <Loader2 size={12} className="animate-spin" /> : <Plus size={12} />}
                            <span>{editingGroup ? "Save Changes" : "Create Group"}</span>
                        </Button>
                    </div>
                </form>

                {/* Groups List */}
                <div className="space-y-2 pt-2">
                    <div className="text-xs font-semibold text-foreground">
                        Existing Groups ({groups.length})
                    </div>

                    <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
                        {groups.length > 0 ? (
                            groups.map(g => (
                                <div
                                    key={g.id}
                                    className="p-2.5 rounded-xl bg-card/30 border border-border/30 flex items-center justify-between gap-2"
                                >
                                    <div className="flex items-center gap-2">
                                        <div
                                            className="w-2.5 h-2.5 rounded-full"
                                            style={{ backgroundColor: g.color || '#10b981' }}
                                        />
                                        <span className="text-xs font-medium text-foreground">{g.name}</span>
                                        <Badge variant="outline" className="text-[9px] px-1 py-0">
                                            {g._count?.templates || 0} templates
                                        </Badge>
                                    </div>

                                    <div className="flex items-center gap-1">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleStartEdit(g)}
                                            className="h-6 w-6 text-muted-foreground hover:text-foreground"
                                        >
                                            <Edit2 size={12} />
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleDeleteGroup(g.id)}
                                            className="h-6 w-6 text-destructive hover:bg-destructive/10"
                                        >
                                            <Trash2 size={12} />
                                        </Button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-4 text-center text-xs text-muted-foreground">
                                No custom groups created yet.
                            </div>
                        )}
                    </div>
                </div>

                <DialogFooter className="pt-2">
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={onClose}
                        className="h-8 text-xs text-muted-foreground"
                    >
                        Close
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
