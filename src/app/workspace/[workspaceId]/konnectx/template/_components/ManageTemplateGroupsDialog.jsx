'use client';

import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
    Plus,
    X,
    FolderPlus,
    Trash2,
    Loader2,
    Pencil,
    Save,
    Layers,
    Tag,
    Check
} from 'lucide-react';
import { useAction } from '@/hooks/use-action';
import { saveTemplateGroup } from '../_actions/save-template-group';
import { deleteTemplateGroup } from '../_actions/delete-template-group';
import { toast } from 'sonner';

const COLOR_PRESETS = [
    { name: 'Blue', value: '#3b82f6', bg: 'bg-blue-500/10', text: 'text-blue-500', border: 'border-blue-500/30' },
    { name: 'Emerald', value: '#10b981', bg: 'bg-emerald-500/10', text: 'text-emerald-500', border: 'border-emerald-500/30' },
    { name: 'Purple', value: '#8b5cf6', bg: 'bg-purple-500/10', text: 'text-purple-500', border: 'border-purple-500/30' },
    { name: 'Amber', value: '#f59e0b', bg: 'bg-amber-500/10', text: 'text-amber-500', border: 'border-amber-500/30' },
    { name: 'Rose', value: '#f43f5e', bg: 'bg-rose-500/10', text: 'text-rose-500', border: 'border-rose-500/30' },
    { name: 'Indigo', value: '#6366f1', bg: 'bg-indigo-500/10', text: 'text-indigo-500', border: 'border-indigo-500/30' },
    { name: 'Cyan', value: '#06b6d4', bg: 'bg-cyan-500/10', text: 'text-cyan-500', border: 'border-cyan-500/30' },
    { name: 'Orange', value: '#f97316', bg: 'bg-orange-500/10', text: 'text-orange-500', border: 'border-orange-500/30' },
];

export default function ManageTemplateGroupsDialog({
    isOpen,
    onOpenChange,
    workspaceId,
    groups = [],
    onUpdate
}) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [selectedColor, setSelectedColor] = useState('#3b82f6');
    const [editingGroup, setEditingGroup] = useState(null);
    const [isDeletingId, setIsDeletingId] = useState(null);

    const { execute: executeSave, isLoading: isSaving } = useAction(saveTemplateGroup, {
        onSuccess: () => {
            toast.success(editingGroup ? "Template group updated" : "Template group created");
            resetForm();
            onUpdate?.();
        },
        onError: (err) => {
            toast.error(err || "Failed to save template group");
        }
    });

    const { execute: executeDelete } = useAction(deleteTemplateGroup, {
        onSuccess: () => {
            toast.success("Template group removed");
            setIsDeletingId(null);
            onUpdate?.();
        },
        onError: (err) => {
            toast.error(err || "Failed to delete template group");
            setIsDeletingId(null);
        }
    });

    const resetForm = () => {
        setName('');
        setDescription('');
        setSelectedColor('#3b82f6');
        setEditingGroup(null);
    };

    const handleEdit = (group) => {
        setEditingGroup(group);
        setName(group.name || '');
        setDescription(group.description || '');
        setSelectedColor(group.color || '#3b82f6');
    };

    const handleDelete = (group) => {
        if (confirm(`Are you sure you want to delete "${group.name}"? Templates in this group will become ungrouped.`)) {
            setIsDeletingId(group.id);
            executeDelete({ id: group.id, workspaceId });
        }
    };

    const handleSubmit = (e) => {
        e?.preventDefault();
        if (!name.trim()) {
            toast.error("Please enter a group name");
            return;
        }

        executeSave({
            id: editingGroup?.id,
            name: name.trim(),
            description: description.trim() || null,
            color: selectedColor,
            workspaceId
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => {
            if (!open) resetForm();
            onOpenChange?.(open);
        }}>
            <DialogContent className="max-w-lg bg-card border-border p-5">
                <DialogHeader className="space-y-1">
                    <DialogTitle className="flex items-center gap-2 text-lg font-bold">
                        <FolderPlus className="w-5 h-5 text-primary" />
                        Manage Template Groups
                    </DialogTitle>
                    <DialogDescription className="text-xs text-muted-foreground">
                        Organize WhatsApp message templates into custom folders and categories for easy access.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 pt-2">
                    {/* Create / Edit Form */}
                    <div className="p-3.5 border border-border/70 rounded-xl bg-muted/20 space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold uppercase text-primary tracking-wider">
                                {editingGroup ? 'Edit Group' : 'Create New Group'}
                            </span>
                            {editingGroup && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
                                    onClick={resetForm}
                                >
                                    <X className="w-3 h-3 mr-1" /> Cancel Edit
                                </Button>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-foreground">Group Name</label>
                            <Input
                                placeholder="e.g. Recruitment, Sales, Customer Support"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="h-9 bg-background border-border text-sm"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-foreground">Color Theme</label>
                            <div className="flex items-center gap-2 flex-wrap">
                                {COLOR_PRESETS.map((color) => (
                                    <button
                                        key={color.value}
                                        type="button"
                                        onClick={() => setSelectedColor(color.value)}
                                        className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${selectedColor === color.value ? 'ring-2 ring-primary ring-offset-2 ring-offset-background scale-110' : 'opacity-80 hover:opacity-100'}`}
                                        style={{ backgroundColor: color.value }}
                                        title={color.name}
                                    >
                                        {selectedColor === color.value && <Check className="w-3.5 h-3.5 text-white" />}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-foreground">Description (Optional)</label>
                            <Textarea
                                placeholder="Brief summary of templates stored in this group..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="resize-none h-16 text-xs bg-background border-border"
                            />
                        </div>

                        {name.trim() && (
                            <div className="flex items-center gap-2 pt-1">
                                <span className="text-[11px] text-muted-foreground">Preview:</span>
                                <Badge
                                    variant="outline"
                                    className="text-xs font-semibold px-2.5 py-0.5 rounded-full"
                                    style={{
                                        borderColor: `${selectedColor}60`,
                                        color: selectedColor,
                                        backgroundColor: `${selectedColor}15`
                                    }}
                                >
                                    <span className="w-2 h-2 rounded-full mr-1.5 inline-block" style={{ backgroundColor: selectedColor }} />
                                    {name}
                                </Badge>
                            </div>
                        )}

                        <Button
                            onClick={handleSubmit}
                            disabled={isSaving || !name.trim()}
                            className="w-full h-9 font-semibold gap-2 mt-2"
                        >
                            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : (editingGroup ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />)}
                            {isSaving ? (editingGroup ? 'Updating Group...' : 'Creating Group...') : (editingGroup ? 'Save Changes' : 'Create Template Group')}
                        </Button>
                    </div>

                    {/* Existing Groups List */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between px-1">
                            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                Existing Groups ({groups.length})
                            </span>
                        </div>

                        <ScrollArea className="h-[210px] border border-border/50 rounded-xl p-1 bg-muted/5">
                            {groups.length === 0 ? (
                                <div className="h-40 flex flex-col items-center justify-center text-center p-4 text-muted-foreground">
                                    <FolderPlus className="w-8 h-8 opacity-30 mb-2" />
                                    <p className="text-xs font-medium">No custom template groups created yet.</p>
                                    <p className="text-[11px] opacity-70">Use the form above to add your first group.</p>
                                </div>
                            ) : (
                                <div className="space-y-1.5 p-1">
                                    {groups.map((group) => {
                                        const groupColor = group.color || '#3b82f6';
                                        const isSelected = editingGroup?.id === group.id;

                                        return (
                                            <div
                                                key={group.id}
                                                className={`flex items-center justify-between p-2.5 rounded-lg border transition-all ${isSelected ? 'bg-primary/5 border-primary/40 ring-1 ring-primary/20' : 'bg-card hover:bg-muted/40 border-border/40'}`}
                                            >
                                                <div className="flex items-center gap-3 overflow-hidden">
                                                    <div
                                                        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                                                        style={{ backgroundColor: `${groupColor}20` }}
                                                    >
                                                        <Layers className="w-4 h-4" style={{ color: groupColor }} />
                                                    </div>
                                                    <div className="flex flex-col min-w-0">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-xs font-bold text-foreground truncate">
                                                                {group.name}
                                                            </span>
                                                            <Badge
                                                                variant="secondary"
                                                                className="h-4 px-1.5 text-[9px] font-mono"
                                                            >
                                                                {group.templateCount || 0} templates
                                                            </Badge>
                                                        </div>
                                                        {group.description && (
                                                            <span className="text-[11px] text-muted-foreground truncate max-w-[220px]">
                                                                {group.description}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-1 shrink-0 ml-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="w-7 h-7 text-muted-foreground hover:text-foreground"
                                                        onClick={() => handleEdit(group)}
                                                        title="Edit group"
                                                    >
                                                        <Pencil className="w-3.5 h-3.5" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="w-7 h-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                                                        onClick={() => handleDelete(group)}
                                                        disabled={isDeletingId === group.id}
                                                        title="Delete group"
                                                    >
                                                        {isDeletingId === group.id ? (
                                                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                        ) : (
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        )}
                                                    </Button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </ScrollArea>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
