'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import {
    Search, Plus, Download, Upload, RefreshCw, 
    Filter, LayoutGrid, List, MessageSquare, 
    LayoutTemplate, Box, Eye, Edit2, Copy, Trash2, 
    Folder, Tag, Clock, CheckCircle2
} from 'lucide-react';
import { 
    DropdownMenu, 
    DropdownMenuTrigger, 
    DropdownMenuContent, 
    DropdownMenuItem 
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import { useAction } from '@/hooks/use-action';
import { getTemplates } from '../_actions/get-templates';
import { saveTemplate } from '../_actions/save-template';
import { deleteTemplate } from '../_actions/delete-template';

// Local Components
import CreateTemplateModal from '../_components/CreateTemplateModal';

const getStringColor = (str) => {
    if (!str) return '215, 15%, 45%'; // slate
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = (hash << 5) - hash + str.charCodeAt(i);
        hash |= 0;
    }
    const h = Math.abs(hash * 137) % 360;
    return `${h}, 70%, 45%`; 
};

export default function TemplatesPage() {
    const params = useParams();
    const workspaceId = params.workspaceId;
    const { data: session } = useSession();
    const userId = session?.user?.userId || session?.user?.id || '';

    // Core Data State
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(true);

    // UI State
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('newest');
    const [viewMode, setViewMode] = useState('list');
    const [activeSegment, setActiveSegment] = useState('all');

    // Modals
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [activeTemplate, setActiveTemplate] = useState(null);

    // --- Server Actions ---
    const { execute: executeGetTemplates } = useAction(getTemplates, {
        onSuccess: (data) => setTemplates(data.templates || []),
        onError: (err) => toast.error(err),
        onComplete: () => setLoading(false)
    });

    const { execute: executeSave, isLoading: isSaving } = useAction(saveTemplate, {
        onSuccess: () => {
            toast.success("Template saved successfully");
            setIsCreateModalOpen(false);
            fetchInitialData(true);
        },
        onError: (err) => toast.error(err)
    });

    const { execute: executeDelete } = useAction(deleteTemplate, {
        onSuccess: () => {
            toast.success("Template deleted");
            fetchInitialData(true);
        },
        onError: (err) => toast.error(err)
    });

    // --- Loading Logic ---
    const fetchInitialData = useCallback((silent = false) => {
        if (!silent) setLoading(true);
        if (workspaceId) {
            executeGetTemplates({ workspaceId });
        }
    }, [workspaceId, executeGetTemplates]);

    useEffect(() => {
        fetchInitialData();
    }, [fetchInitialData]);

    // Computed Aggregations for Sidebar
    const categories = useMemo(() => {
        const counts = {};
        templates.forEach(t => {
            const cat = t.category || 'General';
            counts[cat] = (counts[cat] || 0) + 1;
        });
        return Object.entries(counts).sort((a, b) => b[1] - a[1]);
    }, [templates]);

    const types = useMemo(() => {
        const counts = {};
        templates.forEach(t => {
            const type = t.type || 'TEXT';
            counts[type] = (counts[type] || 0) + 1;
        });
        return Object.entries(counts).sort((a, b) => b[1] - a[1]);
    }, [templates]);

    // Computed: Filtered Templates
    const filteredTemplates = useMemo(() => {
        return templates.filter(t => {
            const matchesSearch = 
                t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (t.body || '').toLowerCase().includes(searchQuery.toLowerCase());

            let matchesSegment = true;
            if (activeSegment !== 'all') {
                const [type, value] = activeSegment.split('::');
                if (type === 'cat') {
                    matchesSegment = (t.category || 'General') === value;
                } else if (type === 'type') {
                    matchesSegment = (t.type || 'TEXT') === value;
                }
            }

            return matchesSearch && matchesSegment;
        }).sort((a, b) => {
            if (sortBy === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
            if (sortBy === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
            if (sortBy === 'name-asc') return a.name.localeCompare(b.name);
            return 0;
        });
    }, [templates, searchQuery, activeSegment, sortBy]);

    // --- Handlers ---
    const handleSaveTemplate = (data) => {
        executeSave({
            ...data,
            workspaceId,
            body: data.content, // Map content to body field in DB
            id: activeTemplate?.id
        });
    };

    const handleDelete = (id) => {
        if (confirm("Are you sure you want to delete this template?")) {
            executeDelete({ workspaceId, id });
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-70px)] overflow-hidden bg-background">
            {/* Upper Action Bar */}
            <div className="flex items-center justify-between py-2 px-4 border-b bg-card/30">
                <div className="flex items-center gap-4">
                    <div className="p-1.5 bg-primary/10 rounded-lg">
                        <LayoutTemplate className="w-5 h-5 text-primary" />
                    </div>
                    <h1 className="text-xl font-bold text-foreground/90">Message Library</h1>
                </div>

                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="gap-2 border-border/40">
                        <Download className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Export JSON</span>
                    </Button>
                    <Separator orientation="vertical" className="h-4 mx-1" />
                    <Button size="sm" onClick={() => { setActiveTemplate(null); setIsCreateModalOpen(true); }} className="gap-2 shadow-sm font-semibold">
                        <Plus className="w-4 h-4" />
                        <span>Create Template</span>
                    </Button>
                </div>
            </div>

            <div className="flex flex-1 overflow-hidden">
                {/* Library Sidebar (Mirroring Contacts Sidebar) */}
                <div className="w-64 border-r bg-card/20 flex flex-col hide-scrollbar">
                    <ScrollArea className="flex-1 transition-all">
                        <div className="p-4 space-y-8 pb-12">
                            {/* Segment: All */}
                            <div className="space-y-2">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60 px-2 underline decoration-primary/20 underline-offset-4">Library Segments</span>
                                <Button
                                    variant={activeSegment === 'all' ? 'secondary' : 'ghost'}
                                    className="w-full justify-start h-10 text-sm gap-3 px-3 shadow-none transition-all group"
                                    onClick={() => setActiveSegment('all')}
                                >
                                    <Box className={`w-4 h-4 ${activeSegment === 'all' ? 'text-primary' : 'text-muted-foreground group-hover:text-primary'}`} />
                                    <span className="font-semibold">All Templates</span>
                                    <Badge variant="secondary" className="ml-auto text-[10px] bg-background border-none">{templates.length}</Badge>
                                </Button>
                            </div>

                            {/* Segment: Categories */}
                            {categories.length > 0 && (
                            <div className="space-y-2">
                                <div className="flex items-center justify-between px-2">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60 flex items-center gap-1"><Folder className="w-3 h-3" /> Categories</span>
                                </div>
                                <div className="space-y-0.5">
                                    {categories.map(([cat, count]) => (
                                        <div
                                            key={cat}
                                            className={`w-full flex items-center justify-between transition-all cursor-pointer py-2 px-3 rounded-md text-sm ${activeSegment === `cat::${cat}` ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-muted text-muted-foreground group'}`}
                                            onClick={() => setActiveSegment(`cat::${cat}`)}
                                        >
                                            <div className="flex items-center gap-2">
                                                <div className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: `hsl(${getStringColor(cat)})` }} />
                                                <span className="truncate max-w-[120px]">{cat}</span>
                                            </div>
                                            <span className="text-[10px] opacity-60 font-mono font-bold group-hover:opacity-100">{count}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            )}

                            {/* Segment: Types */}
                            {types.length > 0 && (
                            <div className="space-y-2">
                                <div className="flex items-center justify-between px-2">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60 flex items-center gap-1"><Tag className="w-3 h-3" /> Template Types</span>
                                </div>
                                <div className="space-y-0.5">
                                    {types.map(([type, count]) => {
                                        const c = getStringColor(type);
                                        return (
                                        <div
                                            key={type}
                                            className={`w-full flex items-center justify-between transition-all cursor-pointer py-2 px-3 rounded-md text-sm ${activeSegment === `type::${type}` ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-muted text-muted-foreground group'}`}
                                            onClick={() => setActiveSegment(`type::${type}`)}
                                        >
                                            <div className="flex items-center gap-2">
                                                <div className="w-1.5 h-3 bg-muted rounded-full" style={{ backgroundColor: `hsl(${c})` }} />
                                                <span className="truncate text-[11px] font-bold uppercase tracking-tighter">{type}</span>
                                            </div>
                                            <span className="text-[10px] opacity-60 font-mono font-bold group-hover:opacity-100">{count}</span>
                                        </div>
                                    )})}
                                </div>
                            </div>
                            )}
                        </div>
                    </ScrollArea>
                    <div className="p-4 border-t bg-muted/10">
                         <div className="bg-primary/5 rounded-xl p-3 border border-primary/10">
                            <p className="text-[10px] font-bold text-primary flex items-center gap-2 uppercase tracking-widest">
                                <CheckCircle2 className="w-3 h-3" /> System Synchronized
                            </p>
                            <p className="text-[9px] text-muted-foreground mt-1 leading-relaxed">Templates are stored in the global message protocol library.</p>
                         </div>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 flex flex-col bg-muted/10">
                    {/* Search & Sort Bar */}
                    <div className="flex items-center gap-4 py-2 px-4 border-b bg-card/40">
                        <div className="relative flex-1 max-w-md group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60 group-focus-within:text-primary transition-colors" />
                            <Input
                                placeholder="Search Protocol Library..."
                                className="pl-9 bg-background h-10 border-border/40 shadow-sm focus-visible:ring-primary/20 rounded-full text-xs"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="sm" className="h-10 gap-2 border-border/40 shadow-sm px-4 rounded-full">
                                        <Filter className="w-3.5 h-3.5" />
                                        <span className="text-xs font-semibold">Sort: {sortBy.replace('-', ' ')}</span>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48">
                                    <DropdownMenuItem onClick={() => setSortBy('newest')}>Newest First</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setSortBy('oldest')}>Oldest First</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setSortBy('name-asc')}>A - Z</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>

                    <div className="flex-1 overflow-hidden">
                        {loading ? (
                            <div className="h-full flex flex-col items-center justify-center gap-4 opacity-70">
                                <RefreshCw className="w-8 h-8 text-primary animate-spin" />
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Acquiring Signal...</p>
                            </div>
                        ) : filteredTemplates.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center opacity-50 p-12 text-center">
                                <div className="p-6 bg-muted/20 rounded-full mb-6 border border-dashed border-border text-primary/30">
                                    <LayoutTemplate className="w-12 h-12" />
                                </div>
                                <h3 className="text-sm font-bold uppercase tracking-widest">No protocols detected</h3>
                                <p className="text-xs text-muted-foreground mt-2 max-w-xs leading-relaxed">Your message library is currently empty. Initialize a new template to start automation.</p>
                            </div>
                        ) : (
                            <ScrollArea className="h-full">
                                <div className="divide-y divide-border/40">
                                    {filteredTemplates.map(template => (
                                        <div 
                                            key={template.id} 
                                            className="group flex items-center gap-4 p-3 px-6 transition-all hover:bg-muted/50 cursor-pointer"
                                            onClick={() => { setActiveTemplate(template); setIsCreateModalOpen(true); }}
                                        >
                                            {/* Icon Section (Matches Contact Avatar style) */}
                                            <div className="shrink-0 flex items-center justify-center">
                                                <div className="w-10 h-10 rounded-full bg-muted border border-border/50 flex items-center justify-center text-primary shadow-sm group-hover:scale-105 transition-transform">
                                                    {template.type === 'IMAGE' ? <Eye className="w-5 h-5" /> : 
                                                     template.type === 'DOCUMENT' ? <RefreshCw className="w-5 h-5" /> : 
                                                     <MessageSquare className="w-5 h-5" />}
                                                </div>
                                            </div>

                                            {/* Info Section */}
                                            <div className="flex-1 min-w-0 flex items-center justify-between">
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2">
                                                        <h3 className="text-sm font-bold truncate group-hover:text-primary transition-colors">{template.name}</h3>
                                                        <Badge variant="outline" className="h-4 text-[9px] font-bold px-1.5 border-none uppercase tracking-wider" style={{ backgroundColor: `${getStringColor(template.category)}15`, color: `hsl(${getStringColor(template.category)})` }}>
                                                            {template.category || 'General'}
                                                        </Badge>
                                                        <Badge variant="outline" className="h-4 text-[8px] px-1 gap-0.5 border-none bg-blue-500/10 text-blue-500 font-bold uppercase">
                                                            {template.type}
                                                        </Badge>
                                                    </div>
                                                    <p className="text-[11px] text-muted-foreground line-clamp-1 max-w-2xl font-medium opacity-70">
                                                        {template.body}
                                                    </p>
                                                </div>

                                                <div className="flex items-center gap-6">
                                                    <div className="hidden md:flex flex-col items-end gap-1">
                                                        <div className="flex items-center gap-1 text-[10px] font-mono text-muted-foreground/60">
                                                            <Clock className="w-3 h-3" /> {new Date(template.createdAt).toLocaleDateString()}
                                                        </div>
                                                        <div className="flex items-center gap-1 text-[9px] font-bold text-emerald-500 uppercase">
                                                            <CheckCircle2 className="w-3 h-3" /> Active
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                                        <Button 
                                                            variant="ghost" 
                                                            size="icon" 
                                                            className="h-8 w-8 text-muted-foreground/30 hover:text-destructive transition-all"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleDelete(template.id);
                                                            }}
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </Button>
                                                        <Button 
                                                            variant="ghost" 
                                                            size="icon" 
                                                            className="h-8 w-8 text-muted-foreground/60"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setActiveTemplate(template);
                                                                setIsCreateModalOpen(true);
                                                            }}
                                                        >
                                                            <Edit2 className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>
                        )}
                    </div>
                </div>
            </div>

            <CreateTemplateModal
                isOpen={isCreateModalOpen}
                onOpenChange={setIsCreateModalOpen}
                initialData={activeTemplate}
                onSave={handleSaveTemplate}
                isLoading={isSaving}
            />
        </div>
    );
}

