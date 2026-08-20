'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Save, Loader2, Tag, X, Plus, Sparkles, Folder } from 'lucide-react';
import TipTap from '@/components/global/TipTap';
import axios from '@/utils/axios';
import { toast } from 'sonner';

export default function RichDocumentEditorModal({
    isOpen,
    onOpenChange,
    document,
    workspaceId,
    currentFolderId,
    onSaveComplete
}) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [content, setContent] = useState('');
    const [category, setCategory] = useState('GENERAL');
    const [status, setStatus] = useState('APPROVED');
    const [tags, setTags] = useState([]);
    const [tagInput, setTagInput] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (document) {
            setTitle(document.name || '');
            setDescription(document.description || '');
            setContent(document.content || '');
            setCategory(document.category || 'GENERAL');
            setStatus(document.status || 'APPROVED');
            setTags(document.tags || []);
        } else {
            setTitle('');
            setDescription('');
            setContent('');
            setCategory('GENERAL');
            setStatus('APPROVED');
            setTags([]);
        }
    }, [document, isOpen]);

    const handleAddTag = (e) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            const trimmed = tagInput.trim().replace(/^#/, '');
            if (trimmed && !tags.includes(trimmed)) {
                setTags(prev => [...prev, trimmed]);
            }
            setTagInput('');
        }
    };

    const handleRemoveTag = (tagToRemove) => {
        setTags(prev => prev.filter(t => t !== tagToRemove));
    };

    const handleSave = async () => {
        if (!title.trim()) {
            return toast.error("Document title is required");
        }

        setIsSaving(true);
        try {
            if (document?.id) {
                // Update existing document
                await axios.patch(`/api/workspace/${workspaceId}/document/${document.id}`, {
                    name: title.trim(),
                    description: description.trim() || null,
                    content,
                    category,
                    status,
                    tags,
                });
                toast.success("Document updated successfully");
            } else {
                // Create new rich document
                await axios.post(`/api/workspace/${workspaceId}/document`, {
                    name: title.trim(),
                    description: description.trim() || null,
                    content,
                    category,
                    status,
                    tags,
                    isFolder: false,
                    parentId: currentFolderId || null
                });
                toast.success("Document created successfully");
            }

            if (onSaveComplete) onSaveComplete();
            onOpenChange(false);
        } catch (error) {
            console.error("Save document error:", error);
            toast.error(error.response?.data?.message || "Failed to save document");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl w-[95vw] h-[90vh] p-0 rounded-2xl border border-border/60 bg-card shadow-2xl flex flex-col overflow-hidden">
                {/* Header */}
                <div className="px-6 py-4 border-b border-border/40 bg-muted/20 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10 border border-primary/20 text-primary">
                            <FileText className="w-5 h-5" />
                        </div>
                        <div>
                            <DialogTitle className="text-base font-bold">
                                {document?.id ? 'Edit Document' : 'Create New Document'}
                            </DialogTitle>
                            <p className="text-[11px] text-muted-foreground">
                                Native rich-text document with collaboration and sharing capabilities.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onOpenChange(false)}
                            className="text-xs font-semibold"
                        >
                            Cancel
                        </Button>
                        <Button
                            size="sm"
                            onClick={handleSave}
                            disabled={isSaving || !title.trim()}
                            className="text-xs font-semibold gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground shadow-md"
                        >
                            {isSaving ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                                <Save className="w-3.5 h-3.5" />
                            )}
                            {document?.id ? 'Save Changes' : 'Create Document'}
                        </Button>
                    </div>
                </div>

                {/* Body: Metadata inputs + TipTap editor */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {/* Title and Status row */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="md:col-span-2 space-y-1.5">
                            <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                Document Title *
                            </Label>
                            <Input
                                placeholder="e.g. Product Architecture Specification Q3..."
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="h-10 text-sm font-semibold bg-background rounded-lg border-border/60"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                Status
                            </Label>
                            <Select value={status} onValueChange={setStatus}>
                                <SelectTrigger className="h-10 text-xs font-semibold bg-background rounded-lg border-border/60">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="rounded-lg">
                                    <SelectItem value="APPROVED" className="text-xs font-semibold">Approved</SelectItem>
                                    <SelectItem value="PENDING" className="text-xs font-semibold">Pending Review</SelectItem>
                                    <SelectItem value="REVIEW" className="text-xs font-semibold">In Review</SelectItem>
                                    <SelectItem value="DRAFT" className="text-xs font-semibold">Draft</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Description and Category */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="md:col-span-2 space-y-1.5">
                            <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                Description / Summary (Optional)
                            </Label>
                            <Input
                                placeholder="Brief summary of document purpose..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="h-9 text-xs bg-background rounded-lg border-border/60 font-medium"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                Category
                            </Label>
                            <Select value={category} onValueChange={setCategory}>
                                <SelectTrigger className="h-9 text-xs font-semibold bg-background rounded-lg border-border/60">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="rounded-lg">
                                    <SelectItem value="GENERAL" className="text-xs font-semibold">General</SelectItem>
                                    <SelectItem value="SPECIFICATION" className="text-xs font-semibold">Specification</SelectItem>
                                    <SelectItem value="CONTRACT" className="text-xs font-semibold">Contract / Legal</SelectItem>
                                    <SelectItem value="REPORT" className="text-xs font-semibold">Report</SelectItem>
                                    <SelectItem value="FINANCE" className="text-xs font-semibold">Finance</SelectItem>
                                    <SelectItem value="MARKETING" className="text-xs font-semibold">Marketing</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Tags input */}
                    <div className="space-y-1.5">
                        <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                            Tags
                        </Label>
                        <div className="flex flex-wrap items-center gap-1.5 p-2 rounded-lg bg-background border border-border/60 min-h-[38px]">
                            {tags.map((tag) => (
                                <Badge key={tag} variant="secondary" className="gap-1 text-[11px] font-semibold bg-primary/10 text-primary border border-primary/20">
                                    #{tag}
                                    <X className="w-3 h-3 cursor-pointer hover:text-destructive" onClick={() => handleRemoveTag(tag)} />
                                </Badge>
                            ))}
                            <input
                                placeholder={tags.length === 0 ? "Type tag and press Enter..." : "Add more..."}
                                value={tagInput}
                                onChange={(e) => setTagInput(e.target.value)}
                                onKeyDown={handleAddTag}
                                className="flex-1 min-w-[120px] bg-transparent text-xs outline-none font-medium placeholder:text-muted-foreground/60"
                            />
                        </div>
                    </div>

                    {/* TipTap Rich Editor */}
                    <div className="space-y-1.5">
                        <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                            Document Content
                        </Label>
                        <div className="border border-border/60 rounded-xl overflow-hidden bg-background shadow-inner">
                            <TipTap data={content} onChange={(html) => setContent(html)} />
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
