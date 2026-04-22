'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import {
    Megaphone, Plus, Search, Filter,
    Play, Pause, Trash2, Edit2,
    CheckCircle2, RefreshCw, RotateCcw,
    Users, Activity, Box
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
// Local Components
import CampaignModal from '../_components/CampaignModal';
import DeleteCampaignModal from '../_components/DeleteCampaignModal';

import { useAction } from '@/hooks/use-action';
import { getCampaigns } from './_actions/get-campaigns';
import { saveCampaign } from './_actions/save-campaign';
import { deleteCampaign } from './_actions/delete-campaign';
import { triggerCampaign } from './_actions/trigger-campaign';
import { resetCampaign } from './_actions/reset-campaign';
import { getTemplates } from '../_actions/get-templates';
import { getGroups } from '../_actions/get-groups';
import { getTags } from '../_actions/get-tags';
import { getCategories } from '../_actions/get-categories';

export default function CampaignsPage() {
    const params = useParams();
    const workspaceId = params.workspaceId;
    const { data: session } = useSession();
    
    // Core Data State
    const [campaigns, setCampaigns] = useState([]);
    const [templates, setTemplates] = useState([]);
    const [groups, setGroups] = useState([]);
    const [tags, setTags] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    // UI State
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('newest');
    const [activeSegment, setActiveSegment] = useState('all');

    // Modals
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [triggeringId, setTriggeringId] = useState(null);
    const [activeCampaign, setActiveCampaign] = useState(null);
    const [editForm, setEditForm] = useState({
        name: '',
        templateId: '',
        recipients: '',
        status: 'PAUSED',
        template: ''
    });

    // --- Server Actions ---
    const { execute: executeGetCampaigns } = useAction(getCampaigns, {
        onSuccess: (data) => setCampaigns(data.campaigns || []),
        onError: (err) => toast.error(err),
        onComplete: () => setLoading(false)
    });

    const { execute: executeGetTemplates } = useAction(getTemplates, {
        onSuccess: (data) => setTemplates(data.templates || []),
        onError: (err) => toast.error(err)
    });

    const { execute: executeGetGroups } = useAction(getGroups, {
        onSuccess: (data) => setGroups(data || []),
        onError: (err) => toast.error(err)
    });

    const { execute: executeGetTags } = useAction(getTags, {
        onSuccess: (data) => setTags(data || []),
        onError: (err) => toast.error(err)
    });

    const { execute: executeGetCategories } = useAction(getCategories, {
        onSuccess: (data) => setCategories(data || []),
        onError: (err) => toast.error(err)
    });

    const { execute: executeSave, isLoading: isSaving } = useAction(saveCampaign, {
        onSuccess: () => {
            toast.success("Campaign configuration saved");
            setEditDialogOpen(false);
            fetchInitialData(true);
        },
        onError: (err) => toast.error(err)
    });

    const { execute: executeDelete, isLoading: isDeleting } = useAction(deleteCampaign, {
        onSuccess: () => {
            toast.success("Campaign purged successfully");
            setDeleteDialogOpen(false);
            fetchInitialData(true);
        },
        onError: (err) => toast.error(err)
    });

    const { execute: executeTrigger } = useAction(triggerCampaign, {
        onSuccess: () => {
            toast.success("Campaign broadcast started.");
            setTriggeringId(null);
            fetchInitialData(true);
        },
        onError: (err) => {
            toast.error(err);
            setTriggeringId(null);
        }
    });

    const fetchInitialData = useCallback((silent = false) => {
        if (!silent) setLoading(true);
        if (workspaceId) {
            executeGetCampaigns({ workspaceId });
            executeGetTemplates({ workspaceId });
            executeGetGroups({ workspaceId });
            executeGetTags({ workspaceId });
            executeGetCategories({ workspaceId });
        }
    }, [workspaceId, executeGetCampaigns, executeGetTemplates, executeGetGroups, executeGetTags, executeGetCategories]);

    useEffect(() => {
        fetchInitialData();
    }, [fetchInitialData]);

    // --- Background Polling for Running Campaigns ---
    useEffect(() => {
        const hasRunningCampaign = campaigns.some(c => c.status === 'RUNNING');
        let interval;

        if (hasRunningCampaign) {
            console.log("[POLLING] Starting background sync for active campaigns...");
            interval = setInterval(() => {
                fetchInitialData(true); // Silent refresh
            }, 4000); // 4 second heartbeat
        }

        return () => {
            if (interval) {
                console.log("[POLLING] Stopping background sync.");
                clearInterval(interval);
            }
        };
    }, [campaigns, fetchInitialData]);

    // --- Computed Filters ---
    const filteredCampaigns = useMemo(() => {
        return campaigns.filter(c => {
            const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesSegment = activeSegment === 'all' || c.status === activeSegment;
            return matchesSearch && matchesSegment;
        }).sort((a, b) => {
            if (sortBy === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
            if (sortBy === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
            if (sortBy === 'name-asc') return a.name.localeCompare(b.name);
            return 0;
        });
    }, [campaigns, searchQuery, activeSegment, sortBy]);

    const stats = useMemo(() => {
        return {
            all: campaigns.length,
            running: campaigns.filter(c => c.status === 'RUNNING').length,
            completed: campaigns.filter(c => c.status === 'COMPLETED').length,
            paused: campaigns.filter(c => c.status === 'PAUSED').length,
            totalRecipients: campaigns.reduce((sum, c) => sum + (c.total || 0), 0)
        };
    }, [campaigns]);

    // --- Handlers ---
    const handleAdd = () => {
        setActiveCampaign(null);
        setEditForm({ name: '', templateId: '', recipients: '', status: 'PAUSED', template: '' });
        setEditDialogOpen(true);
    };

    const handleEdit = (campaign) => {
        setActiveCampaign(campaign);
        setEditForm({
            name: campaign.name,
            templateId: campaign.templateId || '',
            recipients: campaign.metadata?.recipients || '',
            status: campaign.status,
            template: campaign.templateBody || ''
        });
        setEditDialogOpen(true);
    };

    const saveEdit = (data) => {
        // Parse CSV recipients string into array of objects
        let parsedRecipients = [];
        if (data?.recipients) {
            parsedRecipients = data.recipients
                .split('\n')
                .map(line => line.trim())
                .filter(line => line.length > 0)
                .map(line => {
                    const parts = line.split(',').map(p => p.trim());
                    // Basic format: phone, name, var1, var2...
                    return {
                        phone: parts[0],
                        name: parts[1] || '',
                        variables: parts.slice(2).reduce((acc, v, i) => ({
                            ...acc,
                            [`var${i + 1}`]: v
                        }), {})
                    };
                })
                .filter(r => r.phone); // Ensure we have a phone number
        }

        executeSave({
            workspaceId,
            id: activeCampaign?.id,
            name: data.name,
            templateId: data.templateId,
            status: data.status,
            recipients: parsedRecipients,
            groupIds: data.groupIds || [],
            categoryIds: data.categoryIds || [],
            tags: data.tags || [],
            messageTemplate: data.messageTemplate || { body: data.template }
        });
    };

    const confirmDelete = (e) => {
        if (e) e.preventDefault();
        if (activeCampaign) {
            executeDelete({ workspaceId, id: activeCampaign.id });
        }
    };

    const onReset = useAction(resetCampaign, {
        onSuccess: (data) => {
            toast.success("Campaign reset successfully. You can now re-run it.");
            fetchData();
        },
        onError: (error) => toast.error(error)
    });

    const handleReset = (id) => {
        onReset.execute({ workspaceId, id });
    };

    const handleTrigger = (id) => {
        setTriggeringId(id);
        executeTrigger({ workspaceId, id, action: 'start' });
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'RUNNING': return (
                <div className="relative inline-flex items-center">
                    <Badge className="bg-primary/20 text-primary border-primary/30 hover:bg-primary/30 flex items-center gap-1.5 px-3 py-1 rounded-full relative z-10 font-bold tracking-tight">
                        <Activity className="w-3 h-3 animate-pulse" /> 
                        RUNNING
                    </Badge>
                    <span className="absolute inset-0 rounded-full bg-primary/20 animate-ping opacity-75"></span>
                    <span className="absolute inset-0 rounded-full bg-primary/10 animate-pulse scale-150 opacity-20"></span>
                </div>
            );
            case 'COMPLETED': return <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/20 flex items-center gap-1.5 px-3 py-1 rounded-full"><CheckCircle2 className="w-3 h-3" /> COMPLETED</Badge>;
            case 'PAUSED': return <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20 hover:bg-amber-500/20 flex items-center gap-1.5 px-3 py-1 rounded-full"><Pause className="w-3 h-3" /> PAUSED</Badge>;
            default: return <Badge variant="secondary" className="flex items-center gap-1.5 px-3 py-1 rounded-full">{status}</Badge>;
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-70px)] overflow-hidden bg-background">
            {/* Upper Action Bar */}
            <div className="flex items-center justify-between py-2 px-4 border-b bg-card/30">
                <div className="flex items-center gap-4">
                    <div className="p-1.5 bg-primary/10 rounded-lg">
                        <Megaphone className="w-5 h-5 text-primary" />
                    </div>
                    <h1 className="text-xl font-bold text-foreground/90">Campaign Manager</h1>
                </div>

                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="gap-2 border-border/40" onClick={() => fetchInitialData()}>
                        <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                        <span className="hidden sm:inline">Sync Data</span>
                    </Button>
                    <Separator orientation="vertical" className="h-4 mx-1" />
                    <Button size="sm" onClick={handleAdd} className="gap-2 shadow-sm font-semibold">
                        <Plus className="w-4 h-4" />
                        <span>New Campaign</span>
                    </Button>
                </div>
            </div>

            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar Navigation */}
                <div className="w-64 border-r bg-card/20 flex flex-col hide-scrollbar">
                    <ScrollArea className="flex-1 transition-all">
                        <div className="p-4 space-y-8 pb-12">
                            {/* Segment: All */}
                            <div className="space-y-2">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60 px-2 underline decoration-primary/20 underline-offset-4">Fleet Segments</span>
                                <Button
                                    variant={activeSegment === 'all' ? 'secondary' : 'ghost'}
                                    className="w-full justify-start h-10 text-sm gap-3 px-3 shadow-none transition-all group"
                                    onClick={() => setActiveSegment('all')}
                                >
                                    <Box className={`w-4 h-4 ${activeSegment === 'all' ? 'text-primary' : 'text-muted-foreground group-hover:text-primary'}`} />
                                    <span className="font-semibold">All Broadcasts</span>
                                    <Badge variant="secondary" className="ml-auto text-[10px] bg-background border-none">{stats.all}</Badge>
                                </Button>
                            </div>

                            {/* Segment: Statuses */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between px-2">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60 flex items-center gap-1"><Activity className="w-3 h-3" /> Status Distribution</span>
                                </div>
                                <div className="space-y-0.5">
                                    <div
                                        className={`w-full flex items-center justify-between transition-all cursor-pointer py-2 px-3 rounded-md text-sm ${activeSegment === 'RUNNING' ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-muted text-muted-foreground group'}`}
                                        onClick={() => setActiveSegment('RUNNING')}
                                    >
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-primary" />
                                            <span>Running</span>
                                        </div>
                                        <span className="text-[10px] opacity-60 font-bold group-hover:opacity-100">{stats.running}</span>
                                    </div>
                                    <div
                                        className={`w-full flex items-center justify-between transition-all cursor-pointer py-2 px-3 rounded-md text-sm ${activeSegment === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-500 font-medium' : 'hover:bg-muted text-muted-foreground group'}`}
                                        onClick={() => setActiveSegment('COMPLETED')}
                                    >
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                            <span>Completed</span>
                                        </div>
                                        <span className="text-[10px] opacity-60 font-bold group-hover:opacity-100">{stats.completed}</span>
                                    </div>
                                    <div
                                        className={`w-full flex items-center justify-between transition-all cursor-pointer py-2 px-3 rounded-md text-sm ${activeSegment === 'PAUSED' ? 'bg-amber-500/10 text-amber-500 font-medium' : 'hover:bg-muted text-muted-foreground group'}`}
                                        onClick={() => setActiveSegment('PAUSED')}
                                    >
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-amber-500" />
                                            <span>Paused</span>
                                        </div>
                                        <span className="text-[10px] opacity-60 font-bold group-hover:opacity-100">{stats.paused}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Aggregates */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between px-2">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60 flex items-center gap-1"><Users className="w-3 h-3" /> Reach Metrics</span>
                                </div>
                                <div className="p-3 bg-muted/20 rounded-xl space-y-3">
                                    <div>
                                        <p className="text-[10px] font-bold text-muted-foreground uppercase">Total Recipients</p>
                                        <p className="text-xl font-bold">{stats.totalRecipients.toLocaleString()}</p>
                                    </div>
                                    <div className="h-1 bg-muted rounded-full overflow-hidden">
                                        <div className="h-full bg-primary" style={{ width: `${(stats.completed / (stats.all || 1)) * 100}%` }} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </ScrollArea>
                    
                    <div className="p-4 border-t bg-muted/10">
                         <div className="bg-primary/5 rounded-xl p-3 border border-primary/10">
                            <p className="text-[10px] font-bold text-primary flex items-center gap-2 uppercase">
                                <CheckCircle2 className="w-3 h-3" /> System Synchronized
                            </p>
                            <p className="text-[9px] text-muted-foreground mt-1 leading-relaxed">Campaigns are processed by the Business API queue worker.</p>
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
                                placeholder="Search campaigns..."
                                className="pl-9 bg-background h-10 border-border/40 shadow-sm focus-visible:ring-primary/20 rounded-full text-xs"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="sm" className="h-9 gap-2 border-border/40 text-xs font-semibold">
                                        <Filter className="w-3.5 h-3.5" />
                                        Sort
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-40 rounded-xl">
                                    <DropdownMenuItem onClick={() => setSortBy('newest')} className="text-xs">Newest First</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setSortBy('oldest')} className="text-xs">Oldest First</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setSortBy('name-asc')} className="text-xs">Name A–Z</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>

                    <div className="flex-1 overflow-hidden">
                        {loading ? (
                            <div className="h-full flex flex-col items-center justify-center gap-3 opacity-60">
                                <RefreshCw className="w-8 h-8 text-primary animate-spin" />
                                <p className="text-xs text-muted-foreground">Loading campaigns...</p>
                            </div>
                        ) : filteredCampaigns.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center gap-4 p-12 text-center">
                                <div className="p-5 bg-muted/30 rounded-2xl border border-dashed border-border">
                                    <Megaphone className="w-10 h-10 text-muted-foreground/30" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-foreground/70">No campaigns found</p>
                                    <p className="text-xs text-muted-foreground mt-1">Create your first campaign to get started.</p>
                                </div>
                            </div>
                        ) : (
                            <ScrollArea className="h-full">
                                <table className="w-full">
                                    <thead className="sticky top-0 z-10">
                                        <tr className="border-b border-border/60 bg-card/80 backdrop-blur-sm">
                                            <th className="text-left px-6 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider w-[30%]">Campaign</th>
                                            <th className="text-left px-4 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider hidden md:table-cell">Template</th>
                                            <th className="text-left px-4 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Status</th>
                                            <th className="text-right px-4 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider hidden lg:table-cell">Recipients</th>
                                            <th className="px-4 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider hidden lg:table-cell w-36">Progress</th>
                                            <th className="text-right px-4 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider hidden xl:table-cell">Created</th>
                                            <th className="px-6 py-3 w-28 text-right text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border/30">
                                        {filteredCampaigns.map(c => {
                                            const progressPct = Math.round((c.success / (c.total || 1)) * 100);
                                            const template = templates.find(t => t.id === c.templateId);
                                            return (
                                                <tr key={c.id} className="group hover:bg-muted/20 transition-colors duration-100">
                                                    <td className="px-6 py-3.5">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 border border-primary/10">
                                                                <Megaphone className="w-3.5 h-3.5 text-primary" />
                                                            </div>
                                                            <div className="min-w-0">
                                                                <p className="font-semibold text-sm text-foreground truncate">{c.name}</p>
                                                                <p className="text-[10px] text-muted-foreground/50 mt-0.5 font-mono">{c.id.slice(0, 12)}…</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3.5 hidden md:table-cell">
                                                        {template ? (
                                                            <span className="text-xs text-muted-foreground font-medium truncate max-w-[160px] block">{template.name}</span>
                                                        ) : (
                                                            <span className="text-xs text-muted-foreground/30">—</span>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3.5">
                                                        {getStatusBadge(c.status)}
                                                    </td>
                                                    <td className="px-4 py-3.5 text-right hidden lg:table-cell">
                                                        <span className="text-sm font-semibold tabular-nums">{(c.total || 0).toLocaleString()}</span>
                                                    </td>
                                                    <td className="px-4 py-3.5 hidden lg:table-cell">
                                                        <div className="flex flex-col gap-1.5">
                                                            <div className="flex items-center gap-2.5">
                                                                <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden border border-border/5">
                                                                    <div className="h-full bg-primary rounded-full shadow-[0_0_8px_rgba(var(--primary),0.5)] transition-all duration-500" style={{ width: `${progressPct}%` }} />
                                                                </div>
                                                                <span className="text-xs text-muted-foreground tabular-nums w-8 text-right font-bold">{progressPct}%</span>
                                                            </div>
                                                            {(c.status === 'RUNNING' && (c.metadata?.activePhone || c.messageTemplate?.activePhone)) && (
                                                                <div className="flex items-center gap-1.5 text-[10px] text-primary/80 font-medium animate-in fade-in slide-in-from-left-1">
                                                                    <RefreshCw className="w-2.5 h-2.5 animate-spin" />
                                                                    <span>Dialing: {c.metadata?.activePhone || c.messageTemplate?.activePhone}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3.5 text-right hidden xl:table-cell">
                                                        <span className="text-xs text-muted-foreground">{new Date(c.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                                    </td>
                                                    <td className="px-4 py-3.5">
                                                        <div className="flex items-center justify-end gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                                                            <Button 
                                                                size="sm" 
                                                                variant="outline" 
                                                                disabled={triggeringId === c.id}
                                                                className="h-7 px-3 text-[10px] font-bold gap-1.5 border-emerald-500/20 text-emerald-600 hover:bg-emerald-500/10 hover:text-emerald-600 hover:border-emerald-500/40 transition-all shadow-sm" 
                                                                onClick={() => handleTrigger(c.id)}
                                                            >
                                                                {triggeringId === c.id ? (
                                                                    <RefreshCw className="w-3 h-3 animate-spin" />
                                                                ) : (
                                                                    <Play className="w-3 h-3 fill-current" />
                                                                )}
                                                                {triggeringId === c.id ? 'Starting...' : 'RUN'}
                                                            </Button>

                                                            {c.status === 'COMPLETED' && (
                                                                <Button 
                                                                    variant="ghost" 
                                                                    size="icon" 
                                                                    className="w-8 h-8 rounded-lg hover:bg-amber-500/10 hover:text-amber-600 transition-all text-muted-foreground/40" 
                                                                    onClick={() => handleReset(c.id)}
                                                                    title="Reset & Re-run"
                                                                >
                                                                    <RotateCcw className="w-3.5 h-3.5" />
                                                                </Button>
                                                            )}

                                                            <Button variant="ghost" size="icon" className="w-8 h-8 rounded-lg hover:bg-primary/10 hover:text-primary transition-all text-muted-foreground/40 hover:text-primary" onClick={() => handleEdit(c)} title="Edit Campaign">
                                                                <Edit2 className="w-3.5 h-3.5" />
                                                            </Button>
                                                            <Button variant="ghost" size="icon" className="w-8 h-8 rounded-lg hover:bg-red-500/10 hover:text-red-500 transition-all text-muted-foreground/40 hover:text-red-500" onClick={() => { setActiveCampaign(c); setDeleteDialogOpen(true); }} title="Delete Campaign">
                                                                <Trash2 className="w-3.5 h-3.5" />
                                                            </Button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                                <div className="px-6 py-3 border-t border-border/30 bg-card/20">
                                    <p className="text-xs text-muted-foreground">{filteredCampaigns.length} campaign{filteredCampaigns.length !== 1 ? 's' : ''}</p>
                                </div>
                            </ScrollArea>
                        )}
                    </div>
                </div>
            </div>


            {/* Campaign Deployment Modal */}
            <CampaignModal 
                isOpen={editDialogOpen}
                onOpenChange={setEditDialogOpen}
                activeCampaign={activeCampaign}
                templates={templates}
                groups={groups}
                tags={tags}
                categories={categories}
                onSave={saveEdit}
                isLoading={isSaving}
            />

            {/* Delete Alert */}
            <DeleteCampaignModal 
                isOpen={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                onConfirm={confirmDelete}
                isLoading={isDeleting}
                campaignName={activeCampaign?.name}
            />
        </div>
    );
}