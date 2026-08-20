'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
    DropdownMenuLabel
} from '@/components/ui/dropdown-menu';
import {
    FileText,
    Save,
    Loader2,
    Tag,
    X,
    Plus,
    Sparkles,
    Folder,
    LayoutTemplate,
    Download,
    Printer,
    FileCode,
    FileCheck,
    Maximize2,
    Minimize2,
    ListTree,
    Clock,
    BookOpen
} from 'lucide-react';
import TipTap from '@/components/global/TipTap';
import { toast } from 'sonner';
import { createDocument } from '../_actions/create-document';
import { updateDocument } from '../_actions/update-document';
import { DOCUMENT_TEMPLATES } from '../_lib/documentTemplates';
import { exportToMarkdown, exportToHTML, printDocumentToPDF } from '../_lib/exportUtils';
import DocumentAiModal from './DocumentAiModal';

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
    const [isAiModalOpen, setIsAiModalOpen] = useState(false);
    const [isZenMode, setIsZenMode] = useState(false);
    const [showOutline, setShowOutline] = useState(false);

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

    // Live Metrics
    const docMetrics = useMemo(() => {
        const plain = (content || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
        const words = plain ? plain.split(' ').filter(Boolean).length : 0;
        const chars = plain.length;
        const readTimeMinutes = Math.max(1, Math.ceil(words / 200));
        return { words, chars, readTimeMinutes };
    }, [content]);

    // Heading Outline Extraction
    const headings = useMemo(() => {
        if (!content) return [];
        const regex = /<h([1-3])[^>]*>(.*?)<\/h[1-3]>/gi;
        const list = [];
        let match;
        while ((match = regex.exec(content)) !== null) {
            const level = parseInt(match[1], 10);
            const text = match[2].replace(/<[^>]+>/g, '').trim();
            if (text) list.push({ level, text });
        }
        return list;
    }, [content]);

    const handleApplyTemplate = (template) => {
        if (content && content.length > 30) {
            if (!confirm(`Apply "${template.title}" template? This will replace your current editor content.`)) {
                return;
            }
        }
        setContent(template.content);
        if (!title.trim()) {
            setTitle(template.title);
        }
        setCategory(template.category || 'GENERAL');
        toast.success(`"${template.title}" template applied`);
    };

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
                const res = await updateDocument(workspaceId, document.id, {
                    name: title.trim(),
                    description: description.trim() || null,
                    content,
                    category,
                    status,
                    tags,
                });
                if (!res.success) throw new Error(res.error);
                toast.success("Document updated successfully");
            } else {
                // Create new rich document
                const res = await createDocument(workspaceId, {
                    name: title.trim(),
                    description: description.trim() || null,
                    content,
                    category,
                    status,
                    tags,
                    isFolder: false,
                    parentId: currentFolderId || null
                });
                if (!res.success) throw new Error(res.error);
                toast.success("Document created successfully");
            }

            if (onSaveComplete) onSaveComplete();
            onOpenChange(false);
        } catch (error) {
            console.error("Save document error:", error);
            toast.error(error.message || "Failed to save document");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <>
            <Dialog open={isOpen} onOpenChange={onOpenChange}>
                <DialogContent className={`${isZenMode ? 'max-w-[98vw] w-[98vw] h-[96vh]' : 'max-w-4xl w-[95vw] h-[90vh]'} p-0 rounded-2xl border border-border/60 bg-card shadow-2xl flex flex-col overflow-hidden transition-all duration-200`}>
                    {/* Header */}
                    <div className="px-6 py-3.5 border-b border-border/40 bg-muted/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-primary/10 border border-primary/20 text-primary">
                                <FileText className="w-5 h-5" />
                            </div>
                            <div>
                                <DialogTitle className="text-base font-bold">
                                    {document?.id ? 'Edit Document' : 'Create New Document'}
                                </DialogTitle>
                                <div className="flex items-center gap-2 mt-0.5">
                                    <span className="text-[11px] text-muted-foreground">
                                        Native rich-text document
                                    </span>
                                    <span className="text-[10px] text-muted-foreground">•</span>
                                    <span className="text-[10px] font-mono text-primary font-semibold flex items-center gap-1">
                                        <Clock className="w-3 h-3" /> {docMetrics.readTimeMinutes} min read ({docMetrics.words} words)
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Top Action Toolbar */}
                        <div className="flex items-center gap-2 flex-wrap">
                            {/* Outline Toggle */}
                            {headings.length > 0 && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setShowOutline(prev => !prev)}
                                    className={`text-xs font-semibold gap-1.5 h-8 border-border/60 ${showOutline ? 'bg-primary/10 text-primary border-primary/30' : 'bg-background'}`}
                                >
                                    <ListTree className="w-3.5 h-3.5" />
                                    <span className="hidden sm:inline">Outline ({headings.length})</span>
                                </Button>
                            )}

                            {/* Templates Dropdown */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="text-xs font-semibold gap-1.5 h-8 bg-background border-border/60 hover:bg-primary/5 hover:text-primary shadow-xs"
                                    >
                                        <LayoutTemplate className="w-3.5 h-3.5 text-blue-500" />
                                        Templates
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-64 rounded-xl shadow-xl border-border/50 p-1.5">
                                    <DropdownMenuLabel className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider px-2 py-1">
                                        Starter Document Templates
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    {DOCUMENT_TEMPLATES.map((tpl) => (
                                        <DropdownMenuItem
                                            key={tpl.id}
                                            onClick={() => handleApplyTemplate(tpl)}
                                            className="text-xs font-semibold py-2 cursor-pointer flex flex-col items-start gap-0.5 rounded-lg"
                                        >
                                            <div className="font-bold text-foreground flex items-center gap-1.5">
                                                <span>{tpl.title}</span>
                                            </div>
                                            <span className="text-[10px] text-muted-foreground line-clamp-1">{tpl.description}</span>
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>

                            {/* AI Assistant Button (if document exists) */}
                            {document?.id && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setIsAiModalOpen(true)}
                                    className="text-xs font-semibold gap-1.5 h-8 bg-purple-500/10 border-purple-500/30 text-purple-600 hover:bg-purple-500/20 shadow-xs"
                                >
                                    <Sparkles className="w-3.5 h-3.5 text-purple-500 animate-pulse" />
                                    AI Insights
                                </Button>
                            )}

                            {/* Export Dropdown */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="text-xs font-semibold gap-1.5 h-8 bg-background border-border/60 shadow-xs"
                                    >
                                        <Download className="w-3.5 h-3.5 text-emerald-500" />
                                        Export
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-44 rounded-xl shadow-xl border-border/50">
                                    <DropdownMenuItem
                                        onClick={() => exportToMarkdown({ name: title, content, category, tags, createdAt: document?.createdAt })}
                                        className="text-xs font-semibold gap-2 cursor-pointer"
                                    >
                                        <FileCode className="w-3.5 h-3.5 text-blue-500" /> Export Markdown (.md)
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={() => exportToHTML({ name: title, content, category, createdAt: document?.createdAt })}
                                        className="text-xs font-semibold gap-2 cursor-pointer"
                                    >
                                        <FileCheck className="w-3.5 h-3.5 text-emerald-500" /> Export HTML (.html)
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        onClick={() => printDocumentToPDF({ name: title, content, category, status, createdAt: document?.createdAt })}
                                        className="text-xs font-semibold gap-2 cursor-pointer"
                                    >
                                        <Printer className="w-3.5 h-3.5 text-purple-500" /> Print / Save PDF
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>

                            {/* Zen Mode Toggle */}
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => setIsZenMode(prev => !prev)}
                                className="h-8 w-8 rounded-lg border-border/60 bg-background"
                                title={isZenMode ? "Exit Zen Mode" : "Full-Screen Zen Mode"}
                            >
                                {isZenMode ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                            </Button>

                            <Button
                                size="sm"
                                onClick={handleSave}
                                disabled={isSaving || !title.trim()}
                                className="text-xs font-semibold gap-1.5 h-8 bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm"
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

                    {/* TipTap Rich Editor + Outline Panel */}
                    <div className="space-y-1.5">
                        <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                            Document Content
                        </Label>
                        <div className={`grid ${showOutline && headings.length > 0 ? 'grid-cols-1 lg:grid-cols-4 gap-4' : 'grid-cols-1'}`}>
                            <div className={`${showOutline && headings.length > 0 ? 'lg:col-span-3' : 'w-full'} border border-border/60 rounded-xl overflow-hidden bg-background shadow-inner`}>
                                <TipTap data={content} onChange={(html) => setContent(html)} />
                            </div>

                            {/* Sticky Table of Contents Sidebar */}
                            {showOutline && headings.length > 0 && (
                                <div className="hidden lg:flex flex-col p-4 rounded-xl border border-border/60 bg-muted/20 space-y-3 h-fit max-h-[500px] overflow-y-auto">
                                    <div className="flex items-center justify-between border-b border-border/40 pb-2">
                                        <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                                            <ListTree className="w-3.5 h-3.5 text-primary" />
                                            Table of Contents
                                        </div>
                                        <span className="text-[10px] text-muted-foreground font-mono">{headings.length} headings</span>
                                    </div>
                                    <div className="space-y-1.5">
                                        {headings.map((h, idx) => (
                                            <div
                                                key={idx}
                                                style={{ paddingLeft: `${(h.level - 1) * 12}px` }}
                                                className="text-xs font-medium text-muted-foreground hover:text-primary transition-colors py-1 cursor-default truncate flex items-center gap-1.5"
                                            >
                                                <span className="text-[10px] font-mono text-primary/70">H{h.level}</span>
                                                <span className="truncate">{h.text}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>

        {/* AI Assistant Modal for Editor */}
        {document?.id && (
            <DocumentAiModal
                isOpen={isAiModalOpen}
                onOpenChange={setIsAiModalOpen}
                document={{ ...document, name: title, content }}
                workspaceId={workspaceId}
                onInsertText={(aiText) => {
                    setContent(prev => `${prev}<hr/><h3>🤖 AI Generated Analysis</h3><p>${aiText.replace(/\n/g, '<br/>')}</p>`);
                }}
            />
        )}
        </>
    );
}
