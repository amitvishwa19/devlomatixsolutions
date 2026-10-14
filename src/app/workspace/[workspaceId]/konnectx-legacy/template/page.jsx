'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    Plus,
    Search,
    Zap,
    MessageSquare,
    Layers,
    LayoutGrid,
    List,
    RefreshCw,
    FolderPlus,
    Tag,
    Send,
    Edit2,
    Trash2,
    Copy,
    Eye,
    Loader2,
    CheckCircle2,
    Smartphone,
    SlidersHorizontal,
    MoreVertical
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog";
import { toast } from 'sonner';

import {
    getTemplatesAction,
    deleteTemplateAction,
    getTemplateGroupsAction
} from '../_actions/template-actions';
import TemplateBuilder from './_components/TemplateBuilder';
import TemplatePreview from './_components/TemplatePreview';
import TestTemplateDialog from './_components/TestTemplateDialog';
import ManageGroupsDialog from './_components/ManageGroupsDialog';

export default function KonnectLegacyTemplatePage() {
    const params = useParams();
    const router = useRouter();
    const workspaceId = params.workspaceId;

    const [templates, setTemplates] = useState([]);
    const [groups, setGroups] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('ALL');
    const [selectedGroup, setSelectedGroup] = useState('ALL');
    const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'

    // Modals
    const [isBuilderOpen, setIsBuilderOpen] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState(null);
    const [isTestOpen, setIsTestOpen] = useState(false);
    const [testingTemplate, setTestingTemplate] = useState(null);
    const [isManageGroupsOpen, setIsManageGroupsOpen] = useState(false);
    const [previewTemplate, setPreviewTemplate] = useState(null);

    // Load templates & groups
    const loadData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [tempRes, groupRes] = await Promise.all([
                getTemplatesAction(workspaceId),
                getTemplateGroupsAction(workspaceId)
            ]);

            if (tempRes.success) setTemplates(tempRes.templates || []);
            if (groupRes.success) setGroups(groupRes.groups || []);
        } catch (err) {
            console.error(err);
            toast.error("Failed to load templates");
        } finally {
            setIsLoading(false);
        }
    }, [workspaceId]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    // Handle Delete
    const handleDeleteTemplate = async (templateId, name) => {
        if (!confirm(`Are you sure you want to delete template "${name}"?`)) return;

        try {
            const res = await deleteTemplateAction(workspaceId, templateId);
            if (!res.success) throw new Error(res.error);

            toast.success("Template deleted successfully");
            setTemplates(prev => prev.filter(t => t.id !== templateId));
        } catch (err) {
            toast.error(err.message || "Failed to delete template");
        }
    };

    // Handle Duplicate
    const handleDuplicate = (template) => {
        setEditingTemplate({
            ...template,
            id: undefined,
            name: `${template.name}_copy`
        });
        setIsBuilderOpen(true);
    };

    // Filtered templates
    const filteredTemplates = templates.filter(t => {
        const matchesSearch = !searchTerm ||
            t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            t.body.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesCategory = selectedCategory === 'ALL' || t.category === selectedCategory;

        const matchesGroup = selectedGroup === 'ALL'
            ? true
            : selectedGroup === 'UNGROUPED'
                ? !t.groupId
                : t.groupId === selectedGroup;

        return matchesSearch && matchesCategory && matchesGroup;
    });

    return (
        <div className="flex flex-col min-h-screen bg-background">
            {/* Top Header */}
            <div className="border-b border-border/40 bg-card/30 backdrop-blur-md px-6 py-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2.5">
                            <div className="h-9 w-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                                <Zap className="h-4 w-4" />
                            </div>
                            <div>
                                <h1 className="text-lg font-bold text-foreground tracking-tight flex items-center gap-2">
                                    <span>Message Templates</span>
                                    <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
                                        Instant Ready
                                    </Badge>
                                </h1>
                                <p className="text-xs text-muted-foreground">
                                    Pre-formatted WhatsApp messages for broadcasts, chatbots, and instant manual replies.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setIsManageGroupsOpen(true)}
                            className="h-8 text-xs border-border/50 text-foreground gap-1.5 rounded-xl hover:bg-muted/30"
                        >
                            <FolderPlus size={13} className="text-emerald-400" />
                            <span>Manage Groups</span>
                        </Button>

                        <Button
                            size="sm"
                            onClick={() => {
                                setEditingTemplate(null);
                                setIsBuilderOpen(true);
                            }}
                            className="h-8 text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-bold gap-1.5 rounded-xl shadow-md"
                        >
                            <Plus size={13} />
                            <span>Create Template</span>
                        </Button>
                    </div>
                </div>

                {/* Filter & Search Bar */}
                <div className="mt-4 flex flex-col md:flex-row items-center justify-between gap-3 pt-3 border-t border-border/20">
                    <div className="flex items-center gap-2.5 w-full md:w-auto flex-wrap">
                        {/* Search */}
                        <div className="relative w-full sm:w-64">
                            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-muted-foreground" />
                            <Input
                                placeholder="Search templates..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="h-8 pl-8 text-xs bg-background/50 border-border/40 rounded-xl"
                            />
                        </div>

                        {/* Category Filter */}
                        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                            <SelectTrigger className="h-8 text-xs w-36 bg-background/50 border-border/40 rounded-xl">
                                <SelectValue placeholder="Category" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">All Categories</SelectItem>
                                <SelectItem value="MARKETING">Marketing</SelectItem>
                                <SelectItem value="UTILITY">Utility</SelectItem>
                                <SelectItem value="AUTHENTICATION">Authentication</SelectItem>
                                <SelectItem value="GREETING">Greeting</SelectItem>
                                <SelectItem value="REMINDER">Reminder</SelectItem>
                            </SelectContent>
                        </Select>

                        {/* Group Filter */}
                        <Select value={selectedGroup} onValueChange={setSelectedGroup}>
                            <SelectTrigger className="h-8 text-xs w-36 bg-background/50 border-border/40 rounded-xl">
                                <SelectValue placeholder="Folder / Group" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">All Groups</SelectItem>
                                <SelectItem value="UNGROUPED">Ungrouped</SelectItem>
                                {groups.map(g => (
                                    <SelectItem key={g.id} value={g.id}>
                                        {g.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* View Mode & Stats */}
                    <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-end">
                        <span className="text-xs text-muted-foreground font-medium">
                            {filteredTemplates.length} {filteredTemplates.length === 1 ? 'template' : 'templates'}
                        </span>

                        <div className="flex items-center p-0.5 rounded-lg bg-card/60 border border-border/40">
                            <button
                                type="button"
                                onClick={() => setViewMode('grid')}
                                className={`p-1.5 rounded-md text-xs transition-colors ${
                                    viewMode === 'grid' ? 'bg-primary text-primary-foreground shadow-2xs' : 'text-muted-foreground hover:text-foreground'
                                }`}
                                title="Grid View"
                            >
                                <LayoutGrid size={13} />
                            </button>
                            <button
                                type="button"
                                onClick={() => setViewMode('list')}
                                className={`p-1.5 rounded-md text-xs transition-colors ${
                                    viewMode === 'list' ? 'bg-primary text-primary-foreground shadow-2xs' : 'text-muted-foreground hover:text-foreground'
                                }`}
                                title="List View"
                            >
                                <List size={13} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Template Cards Stream */}
            <div className="flex-1 p-6">
                {isLoading ? (
                    <div className="py-20 text-center flex flex-col items-center justify-center gap-3">
                        <Loader2 size={24} className="animate-spin text-emerald-400" />
                        <span className="text-xs text-muted-foreground">Loading message templates...</span>
                    </div>
                ) : filteredTemplates.length > 0 ? (
                    viewMode === 'grid' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredTemplates.map((template) => (
                                <div
                                    key={template.id}
                                    className="p-4 rounded-2xl bg-card/40 border border-border/40 hover:border-emerald-500/40 transition-all shadow-xs flex flex-col justify-between group space-y-3"
                                >
                                    <div className="space-y-2.5">
                                        {/* Card Header: Name & Badges */}
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center gap-1.5 flex-wrap">
                                                    <h3 className="text-xs font-bold text-foreground font-mono truncate">
                                                        {template.name}
                                                    </h3>
                                                    <Badge variant="outline" className="text-[9px] px-1.5 py-0 bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
                                                        READY
                                                    </Badge>
                                                </div>
                                                <div className="flex items-center gap-1.5 mt-1">
                                                    <Badge variant="secondary" className="text-[9px] px-1 py-0 font-medium">
                                                        {template.category}
                                                    </Badge>
                                                    {template.group && (
                                                        <span
                                                            className="text-[9px] font-medium px-1.5 py-0.5 rounded-md border"
                                                            style={{
                                                                borderColor: `${template.group.color || '#10b981'}40`,
                                                                color: template.group.color || '#10b981',
                                                                backgroundColor: `${template.group.color || '#10b981'}10`
                                                            }}
                                                        >
                                                            {template.group.name}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Action Dropdown */}
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground">
                                                        <MoreVertical size={13} />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="text-xs">
                                                    <DropdownMenuItem onClick={() => setPreviewTemplate(template)}>
                                                        <Eye size={12} className="mr-2" />
                                                        <span>Preview</span>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => {
                                                        setTestingTemplate(template);
                                                        setIsTestOpen(true);
                                                    }}>
                                                        <Send size={12} className="mr-2" />
                                                        <span>Send Test Message</span>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => {
                                                        setEditingTemplate(template);
                                                        setIsBuilderOpen(true);
                                                    }}>
                                                        <Edit2 size={12} className="mr-2" />
                                                        <span>Edit</span>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleDuplicate(template)}>
                                                        <Copy size={12} className="mr-2" />
                                                        <span>Duplicate</span>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => handleDeleteTemplate(template.id, template.name)}
                                                        className="text-destructive focus:text-destructive"
                                                    >
                                                        <Trash2 size={12} className="mr-2" />
                                                        <span>Delete</span>
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>

                                        {/* Body Preview */}
                                        <div className="p-3 rounded-xl bg-background/50 border border-border/30 text-xs text-foreground/90 font-sans leading-relaxed line-clamp-3 select-text whitespace-pre-wrap">
                                            {template.body}
                                        </div>

                                        {/* Variables & Buttons Pills */}
                                        <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1">
                                            <span>
                                                {template.variables?.length || 0} variables
                                            </span>
                                            {template.buttons?.length > 0 && (
                                                <span className="text-emerald-400 font-medium">
                                                    {template.buttons.length} buttons
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Bottom Quick Action Bar */}
                                    <div className="pt-2 border-t border-border/20 flex items-center justify-between gap-2">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setPreviewTemplate(template)}
                                            className="h-7 text-xs text-muted-foreground hover:text-foreground gap-1 px-2 rounded-lg"
                                        >
                                            <Eye size={12} />
                                            <span>Preview</span>
                                        </Button>

                                        <div className="flex items-center gap-1.5">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => {
                                                    setEditingTemplate(template);
                                                    setIsBuilderOpen(true);
                                                }}
                                                className="h-7 text-xs border-border/50 text-foreground gap-1 px-2.5 rounded-lg"
                                            >
                                                <Edit2 size={11} />
                                                <span>Edit</span>
                                            </Button>
                                            <Button
                                                size="sm"
                                                onClick={() => {
                                                    setTestingTemplate(template);
                                                    setIsTestOpen(true);
                                                }}
                                                className="h-7 text-xs bg-emerald-600/90 hover:bg-emerald-600 text-white font-bold gap-1 px-2.5 rounded-lg"
                                            >
                                                <Send size={11} />
                                                <span>Test Send</span>
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        /* List View */
                        <div className="rounded-2xl border border-border/40 bg-card/30 overflow-hidden divide-y divide-border/20">
                            {filteredTemplates.map((template) => (
                                <div
                                    key={template.id}
                                    className="p-3.5 flex items-center justify-between gap-4 hover:bg-muted/10 transition-colors"
                                >
                                    <div className="flex items-center gap-3 min-w-0 flex-1">
                                        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0">
                                            <Zap size={15} />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-2">
                                                <h4 className="text-xs font-bold text-foreground font-mono truncate">{template.name}</h4>
                                                <Badge variant="outline" className="text-[9px] px-1.5 py-0 bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
                                                    READY
                                                </Badge>
                                                <Badge variant="secondary" className="text-[9px] px-1 py-0">
                                                    {template.category}
                                                </Badge>
                                            </div>
                                            <p className="text-[11px] text-muted-foreground truncate mt-0.5 max-w-md">
                                                {template.body}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 shrink-0">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setPreviewTemplate(template)}
                                            className="h-7 text-xs text-muted-foreground hover:text-foreground gap-1 px-2 rounded-lg"
                                        >
                                            <Eye size={12} />
                                            <span className="hidden sm:inline">Preview</span>
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                setEditingTemplate(template);
                                                setIsBuilderOpen(true);
                                            }}
                                            className="h-7 text-xs border-border/50 text-foreground gap-1 px-2.5 rounded-lg"
                                        >
                                            <Edit2 size={11} />
                                            <span>Edit</span>
                                        </Button>
                                        <Button
                                            size="sm"
                                            onClick={() => {
                                                setTestingTemplate(template);
                                                setIsTestOpen(true);
                                            }}
                                            className="h-7 text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-bold gap-1 px-2.5 rounded-lg"
                                        >
                                            <Send size={11} />
                                            <span>Test Send</span>
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )
                ) : (
                    /* Empty State */
                    <div className="py-20 text-center max-w-md mx-auto space-y-4">
                        <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 mx-auto flex items-center justify-center">
                            <Zap size={28} />
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-sm font-bold text-foreground">No templates found</h3>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                Create your first reusable WhatsApp message template with dynamic variables and interactive buttons. No Meta approval required!
                            </p>
                        </div>
                        <Button
                            size="sm"
                            onClick={() => {
                                setEditingTemplate(null);
                                setIsBuilderOpen(true);
                            }}
                            className="h-8 text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-bold gap-1.5 rounded-xl shadow-md"
                        >
                            <Plus size={13} />
                            <span>Create First Template</span>
                        </Button>
                    </div>
                )}
            </div>

            {/* Template Builder Drawer */}
            <TemplateBuilder
                isOpen={isBuilderOpen}
                onClose={() => {
                    setIsBuilderOpen(false);
                    setEditingTemplate(null);
                }}
                initialData={editingTemplate}
                workspaceId={workspaceId}
                groups={groups}
                onTemplateSaved={loadData}
                onOpenManageGroups={() => setIsManageGroupsOpen(true)}
            />

            {/* Test Send Dialog */}
            <TestTemplateDialog
                isOpen={isTestOpen}
                onClose={() => {
                    setIsTestOpen(false);
                    setTestingTemplate(null);
                }}
                template={testingTemplate}
                workspaceId={workspaceId}
            />

            {/* Manage Groups Dialog */}
            <ManageGroupsDialog
                isOpen={isManageGroupsOpen}
                onClose={() => setIsManageGroupsOpen(false)}
                groups={groups}
                workspaceId={workspaceId}
                onGroupsUpdated={loadData}
            />

            {/* Fullscreen Preview Dialog */}
            <Dialog open={!!previewTemplate} onOpenChange={() => setPreviewTemplate(null)}>
                <DialogContent className="max-w-sm bg-transparent border-none shadow-none p-0 flex justify-center">
                    {previewTemplate && (
                        <TemplatePreview template={previewTemplate} showDeviceFrame={true} />
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
