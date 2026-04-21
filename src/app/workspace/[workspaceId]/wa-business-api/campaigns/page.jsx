'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import {
    Megaphone, Plus, Search, Filter, LayoutGrid, List,
    MoreHorizontal, Play, Pause, Trash2, Edit2, 
    CheckCircle2, Clock, AlertCircle, RefreshCw,
    Users, MessageSquare, Target, Activity, Box, Tag,
    BarChart3
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
import { 
    AlertDialog, 
    AlertDialogAction, 
    AlertDialogCancel, 
    AlertDialogContent, 
    AlertDialogDescription, 
    AlertDialogFooter, 
    AlertDialogHeader, 
    AlertDialogTitle 
} from "@/components/ui/alert-dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

import { useAction } from '@/hooks/use-action';
import { getCampaigns } from './_actions/get-campaigns';
import { saveCampaign } from './_actions/save-campaign';
import { deleteCampaign } from './_actions/delete-campaign';
import { triggerCampaign } from './_actions/trigger-campaign';
import { getTemplates } from '../_actions/get-templates';

export default function CampaignsPage() {
    const params = useParams();
    const workspaceId = params.workspaceId;
    const { data: session } = useSession();
    
    // Core Data State
    const [campaigns, setCampaigns] = useState([]);
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(true);

    // UI State
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('newest');
    const [viewMode, setViewMode] = useState('list');
    const [activeSegment, setActiveSegment] = useState('all');

    // Modals
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
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

    const { execute: executeSave, isLoading: isSaving } = useAction(saveCampaign, {
        onSuccess: () => {
            toast.success("Campaign configuration saved");
            setEditDialogOpen(false);
            fetchInitialData(true);
        },
        onError: (err) => toast.error(err)
    });

    const { execute: executeDelete } = useAction(deleteCampaign, {
        onSuccess: () => {
            toast.success("Campaign purged successfully");
            setDeleteDialogOpen(false);
            fetchInitialData(true);
        },
        onError: (err) => toast.error(err)
    });

    const { execute: executeTrigger } = useAction(triggerCampaign, {
        onSuccess: () => {
            toast.success("Campaign deployment synchronized");
            fetchInitialData(true);
        },
        onError: (err) => toast.error(err)
    });

    const fetchInitialData = useCallback((silent = false) => {
        if (!silent) setLoading(true);
        if (workspaceId) {
            executeGetCampaigns({ workspaceId });
            executeGetTemplates({ workspaceId });
        }
    }, [workspaceId, executeGetCampaigns, executeGetTemplates]);

    useEffect(() => {
        fetchInitialData();
    }, [fetchInitialData]);

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

    const saveEdit = () => {
        executeSave({
            workspaceId,
            id: activeCampaign?.id,
            ...editForm
        });
    };

    const confirmDelete = () => {
        if (activeCampaign) {
            executeDelete({ workspaceId, id: activeCampaign.id });
        }
    };

    const handleTrigger = (id) => {
        executeTrigger({ workspaceId, campaignId: id });
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'RUNNING': return <Badge className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 flex items-center gap-1.5 px-3 py-1 rounded-full"><Activity className="w-3 h-3 animate-pulse" /> RUNNING</Badge>;
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
                                placeholder="Search Campaigns..."
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
                                        <span className="text-xs font-semibold uppercase">Sort: {sortBy}</span>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48 rounded-xl">
                                    <DropdownMenuItem onClick={() => setSortBy('newest')} className="text-xs font-bold">Newest First</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setSortBy('oldest')} className="text-xs font-bold">Oldest First</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setSortBy('name-asc')} className="text-xs font-bold">Name A-Z</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>

                            <div className="flex items-center border border-border/40 shadow-sm rounded-full overflow-hidden h-10 bg-background">
                                <Button variant={viewMode === 'list' ? 'secondary' : 'ghost'} size="icon" className="rounded-none w-10 text-foreground/70" onClick={() => setViewMode('list')}><List className="w-4 h-4" /></Button>
                                <Separator orientation="vertical" className="h-6" />
                                <Button variant={viewMode === 'grid' ? 'secondary' : 'ghost'} size="icon" className="rounded-none w-10 text-foreground/70" onClick={() => setViewMode('grid')}><LayoutGrid className="w-4 h-4" /></Button>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 overflow-hidden">
                        {loading ? (
                            <div className="h-full flex flex-col items-center justify-center gap-4 opacity-70">
                                <RefreshCw className="w-10 h-10 text-primary animate-spin" />
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Acquiring Stream...</p>
                            </div>
                        ) : filteredCampaigns.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center opacity-50 p-12 text-center">
                                <div className="p-6 bg-muted/20 rounded-full mb-6 border border-dashed border-border border-primary/20">
                                    <Megaphone className="w-12 h-12 text-primary/30" />
                                </div>
                                <h3 className="text-sm font-bold uppercase tracking-tight">No active campaigns</h3>
                                <p className="text-xs text-muted-foreground mt-2 max-w-xs leading-relaxed font-semibold">Deploy your first message protocol to start broadcasting via the Business API.</p>
                            </div>
                        ) : (
                            <ScrollArea className="h-full p-6">
                                <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6' : 'space-y-4'}>
                                    {filteredCampaigns.map(c => (
                                        <div 
                                            key={c.id} 
                                            className={`group bg-card border border-border/50 rounded-2xl overflow-hidden transition-all hover:shadow-xl hover:shadow-primary/5 hover:border-primary/20 ${viewMode === 'list' ? 'flex items-center p-3' : 'flex flex-col'}`}
                                        >
                                            {/* Preview Component */}
                                            <div className={`${viewMode === 'list' ? 'w-20 h-20 shrink-0' : 'h-32'} bg-muted/30 relative flex items-center justify-center border-b border-border/20 group-hover:bg-primary/5 transition-colors p-4`}>
                                                <Target className="w-8 h-8 text-primary/40 group-hover:scale-110 transition-transform" />
                                                <div className="absolute top-3 right-3">
                                                    {getStatusBadge(c.status)}
                                                </div>
                                            </div>

                                            <div className="flex-1 p-5 flex flex-col min-w-0">
                                                <div className="flex items-start justify-between gap-4 mb-4">
                                                    <div className="min-w-0 flex-1">
                                                        <h3 className="text-sm font-bold truncate group-hover:text-primary transition-colors">{c.name}</h3>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <Clock className="w-3.5 h-3.5 text-muted-foreground/60" />
                                                            <span className="text-[10px] text-muted-foreground font-bold">{new Date(c.createdAt).toLocaleDateString()}</span>
                                                        </div>
                                                    </div>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon" className="w-8 h-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <MoreHorizontal className="w-4 h-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end" className="rounded-xl w-44 outline-none">
                                                            <DropdownMenuItem onClick={() => handleTrigger(c.id)} className="text-xs font-bold gap-3">
                                                                <Play className="w-4 h-4 text-emerald-500" /> Trigger Broadcast
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => handleEdit(c)} className="text-xs font-bold gap-3">
                                                                <Edit2 className="w-4 h-4 text-primary" /> Edit Metadata
                                                            </DropdownMenuItem>
                                                            <Separator className="my-1" />
                                                            <DropdownMenuItem onClick={() => { setActiveCampaign(c); setDeleteDialogOpen(true); }} className="text-xs font-bold gap-3 text-red-500">
                                                                <Trash2 className="w-4 h-4" /> Delete Task
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </div>

                                                <div className="grid grid-cols-2 gap-4 mt-auto">
                                                    <div className="bg-muted/30 p-3 rounded-xl border border-border/30">
                                                        <p className="text-[9px] font-bold text-muted-foreground uppercase flex items-center gap-1"><Users className="w-2.5 h-2.5" /> Recipients</p>
                                                        <p className="text-lg font-bold">{c.total || 0}</p>
                                                    </div>
                                                    <div className="bg-muted/30 p-3 rounded-xl border border-border/30 relative overflow-hidden">
                                                        <p className="text-[9px] font-bold text-muted-foreground uppercase flex items-center gap-1"><BarChart3 className="w-2.5 h-2.5" /> Progress</p>
                                                        <p className="text-lg font-bold text-primary">{Math.round((c.success / (c.total || 1)) * 100)}%</p>
                                                        <div className="absolute bottom-0 left-0 h-1 bg-primary/20 w-full">
                                                            <div className="h-full bg-primary" style={{ width: `${(c.success / (c.total || 1)) * 100}%` }} />
                                                        </div>
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

            {/* Campaign Deployment Modal */}
            <CampaignModal 
                isOpen={editDialogOpen}
                onOpenChange={setEditDialogOpen}
                activeCampaign={activeCampaign}
                templates={templates}
                onSave={saveEdit}
                isLoading={isSaving}
            />

            {/* Delete Alert */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent className="rounded-2xl border-border/40">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="font-bold text-2xl">Purge Object?</AlertDialogTitle>
                        <AlertDialogDescription className="font-bold text-muted-foreground">This will permanently remove the broadcast metrics and queue data. This action is irreversible.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="rounded-xl font-bold border-border/40">ABORT</AlertDialogCancel>
                        <AlertDialogAction className="rounded-xl font-bold bg-red-500 hover:bg-red-600 border-none" onClick={confirmDelete}>PURGE</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}