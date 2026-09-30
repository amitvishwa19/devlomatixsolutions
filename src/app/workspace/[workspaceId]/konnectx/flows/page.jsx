'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import {
    RefreshCw,
    Plus,
    Search,
    ChevronRight,
    ExternalLink,
    Pencil,
    Copy,
    Trash2,
    Settings,
    Layers,
    Info,
    AlertCircle,
    CheckCircle2,
    Clock,
    ArrowLeft,
    Eye,
    Globe,
    FileCode,
    AlertTriangle,
    MoreVertical,
    LayoutGrid,
    List,
    Sparkles,
    Send,
    Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { useAction } from "@/hooks/use-action";

// Local Actions
import { getFlows } from "./_actions/get-flows";
import { saveFlow } from "./_actions/save-flow";
import { deleteFlow } from "./_actions/delete-flow";
import { pushFlowToMeta } from "./_actions/push-flow";
import { publishMetaFlow } from "./_actions/publish-meta-flow";
import { syncMetaFlows } from "./_actions/sync-meta-flows";
import { cloneFlow } from "./_actions/clone-flow";

// Components
import FlowBuilder from "./_components/FlowBuilder";
import AccountSwitcher from "../_components/AccountSwitcher";

const FLOW_CATEGORIES = [
    { value: 'ALL', label: 'All Flows' },
    { value: 'LEAD_GENERATION', label: 'Lead Generation' },
    { value: 'APPOINTMENT_BOOKING', label: 'Appointment Booking' },
    { value: 'CUSTOMER_SUPPORT', label: 'Customer Support' },
    { value: 'FEEDBACK', label: 'Feedback' },
    { value: 'SURVEY', label: 'Survey' },
    { value: 'SIGN_UP', label: 'Sign Up' },
    { value: 'ORDER_STATUS', label: 'Order Status' },
    { value: 'AUTO_REPLY', label: 'Auto Reply' },
    { value: 'OTHER', label: 'Other' },
];

export default function FlowsPage() {
    const params = useParams();
    const workspaceId = params.workspaceId;

    const [flows, setFlows] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('ALL');
    const [selectedStatus, setSelectedStatus] = useState('ALL');
    const [sortBy, setSortBy] = useState('DESCENDING');
    const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
    const [view, setView] = useState('list'); // 'list' | 'builder'

    const [selectedFlow, setSelectedFlow] = useState(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [flowToDelete, setFlowToDelete] = useState(null);
    const [isUpdating, setIsUpdating] = useState(false);
    const [newFlowName, setNewFlowName] = useState('');
    const [newFlowCategory, setNewFlowCategory] = useState('OTHER');
    const [newFlowEndpoint, setNewFlowEndpoint] = useState('');

    // Inline rename state in builder
    const [isEditingName, setIsEditingName] = useState(false);
    const [tempName, setTempName] = useState('');

    // --- Actions ---

    const { execute: executeGetFlows } = useAction(getFlows, {
        onSuccess: (data) => {
            setFlows(data.flows || []);
            setIsLoading(false);
        },
        onError: (err) => {
            toast.error(err || "Failed to load flows");
            setIsLoading(false);
        }
    });

    const fetchFlows = () => {
        if (workspaceId) {
            setIsLoading(true);
            executeGetFlows({ workspaceId });
        }
    };

    const { execute: executeSync, isLoading: isSyncing } = useAction(syncMetaFlows, {
        onSuccess: (data) => {
            toast.success(`Successfully synchronized ${data.count} flows from Meta`);
            fetchFlows();
        },
        onError: (error) => {
            toast.error(error || "Failed to sync flows from Meta");
        }
    });

    const { execute: executeSaveFlow } = useAction(saveFlow, {
        onSuccess: (data) => {
            toast.success(selectedFlow ? "Flow updated" : "Flow created");
            setIsCreateModalOpen(false);
            fetchFlows();
            if (!selectedFlow && data.flow) {
                // If it was a new flow, open builder directly
                handleEditFlow(data.flow);
            } else if (selectedFlow && data.flow) {
                setSelectedFlow(data.flow);
            }
        },
        onError: (err) => toast.error(err || "Failed to save flow"),
        onComplete: () => setIsUpdating(false)
    });

    const { execute: executeDeleteFlow, isLoading: isDeleting } = useAction(deleteFlow, {
        onSuccess: () => {
            toast.success("Flow deleted");
            setIsDeleteModalOpen(false);
            setFlowToDelete(null);
            fetchFlows();
        },
        onError: (err) => toast.error(err || "Failed to delete flow")
    });

    const { execute: executePush, isLoading: isPushing } = useAction(pushFlowToMeta, {
        onSuccess: (data) => {
            toast.success("Flow pushed to Meta successfully");
            fetchFlows();
            if (selectedFlow) {
                setSelectedFlow(prev => prev ? { ...prev, flowId: data.flowId, status: 'DRAFT' } : null);
            }
        },
        onError: (error) => toast.error(error || "Failed to push flow to Meta")
    });

    const { execute: executePublish, isLoading: isPublishing } = useAction(publishMetaFlow, {
        onSuccess: () => {
            toast.success("Flow published on Meta live");
            fetchFlows();
            if (selectedFlow) {
                setSelectedFlow(prev => prev ? { ...prev, status: 'PUBLISHED' } : null);
            }
        },
        onError: (error) => toast.error(error || "Failed to publish flow")
    });

    const { execute: executeClone, isLoading: isCloning } = useAction(cloneFlow, {
        onSuccess: () => {
            toast.success("Flow cloned successfully");
            fetchFlows();
        },
        onError: (error) => toast.error(error || "Failed to clone flow")
    });

    // --- Effects ---

    useEffect(() => {
        fetchFlows();

        const handleAccountSwitch = () => {
            fetchFlows();
        };

        window.addEventListener('wa-account-switched', handleAccountSwitch);
        return () => window.removeEventListener('wa-account-switched', handleAccountSwitch);
    }, [workspaceId]);

    // --- Handlers ---

    const handleCreateFlow = () => {
        if (!newFlowName.trim()) return;
        setIsUpdating(true);
        executeSaveFlow({
            workspaceId,
            name: newFlowName.trim(),
            categories: [newFlowCategory],
            endpointUrl: newFlowEndpoint.trim() || null,
            screens: []
        });
        setNewFlowName('');
        setNewFlowCategory('OTHER');
        setNewFlowEndpoint('');
    };

    const handleEditFlow = (flow) => {
        setSelectedFlow(flow);
        setView('builder');
    };

    const handleSaveFromBuilder = (screens, definitionJson) => {
        if (!selectedFlow) return;
        toast.promise(
            executeSaveFlow({
                workspaceId,
                id: selectedFlow.id,
                name: selectedFlow.name,
                screens,
                definition: typeof definitionJson === 'string' ? JSON.parse(definitionJson) : definitionJson
            }),
            {
                loading: 'Saving flow definitions...',
                success: 'Flow saved successfully',
                error: 'Failed to save flow'
            }
        );
    };

    const getStatusBadge = (status) => {
        switch (status?.toUpperCase()) {
            case 'PUBLISHED':
                return (
                    <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[10px] px-2 py-0.5 h-5 gap-1 font-semibold shadow-none">
                        <CheckCircle2 className="w-3 h-3" /> Published
                    </Badge>
                );
            case 'DRAFT':
                return (
                    <Badge variant="secondary" className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 text-[10px] px-2 py-0.5 h-5 gap-1 font-semibold shadow-none">
                        <Clock className="w-3 h-3" /> Draft
                    </Badge>
                );
            case 'DEPRECATED':
                return (
                    <Badge variant="outline" className="bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20 text-[10px] px-2 py-0.5 h-5 gap-1 font-semibold shadow-none">
                        <AlertCircle className="w-3 h-3" /> Deprecated
                    </Badge>
                );
            default:
                return (
                    <Badge variant="outline" className="text-[10px] px-2 py-0.5 h-5 font-semibold">
                        {status || 'Draft'}
                    </Badge>
                );
        }
    };

    // Filter & Sort Flows
    const filteredFlows = useMemo(() => {
        return [...flows]
            .filter((flow) => {
                const query = searchTerm.toLowerCase();
                const matchesSearch =
                    (flow.name || '').toLowerCase().includes(query) ||
                    (flow.id || '').toLowerCase().includes(query) ||
                    (flow.flowId || '').toLowerCase().includes(query) ||
                    (flow.categories || []).some(c => c.toLowerCase().includes(query)) ||
                    (flow.endpointUrl || '').toLowerCase().includes(query);

                if (!matchesSearch) return false;

                if (selectedCategory !== 'ALL') {
                    if (!flow.categories?.includes(selectedCategory)) return false;
                }

                if (selectedStatus !== 'ALL') {
                    if (flow.status?.toUpperCase() !== selectedStatus) return false;
                }

                return true;
            })
            .sort((a, b) => {
                if (sortBy === 'NAME_ASC') {
                    return (a.name || '').localeCompare(b.name || '', undefined, { numeric: true, sensitivity: 'base' });
                }
                if (sortBy === 'NAME_DESC') {
                    return (b.name || '').localeCompare(a.name || '', undefined, { numeric: true, sensitivity: 'base' });
                }
                if (sortBy === 'STATUS') {
                    return (a.status || '').localeCompare(b.status || '');
                }
                if (sortBy === 'ASCENDING' || sortBy === 'OLDEST') {
                    const timeA = new Date(a.createdAt || a.updatedAt || 0).getTime();
                    const timeB = new Date(b.createdAt || b.updatedAt || 0).getTime();
                    if (timeA !== timeB) return timeA - timeB;
                    return String(a.id || '').localeCompare(String(b.id || ''));
                }

                // Default ('DESCENDING' / 'NEWEST'): Descending from field createdAt (newest at top)
                const timeA = new Date(a.createdAt || a.updatedAt || 0).getTime();
                const timeB = new Date(b.createdAt || b.updatedAt || 0).getTime();
                if (timeB !== timeA) return timeB - timeA;
                return String(b.id || '').localeCompare(String(a.id || ''));
            });
    }, [flows, searchTerm, selectedCategory, selectedStatus, sortBy]);

    // Summary Counts
    const totalCount = flows.length;
    const publishedCount = flows.filter(f => f.status === 'PUBLISHED').length;
    const draftCount = flows.filter(f => f.status === 'DRAFT' || !f.status).length;

    // --- Builder View ---
    if (view === 'builder') {
        return (
            <div className="flex flex-col h-full bg-background animate-in slide-in-from-right duration-500">
                {/* Builder Top Bar */}
                <div className="flex items-center justify-between px-6 py-3 border-b bg-card/80 backdrop-blur-md sticky top-0 z-20">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                                setView('list');
                                fetchFlows();
                            }}
                            className="gap-2 rounded-lg text-xs font-semibold"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to Flows
                        </Button>
                        <div className="h-5 w-px bg-border/60" />
                        <div className="flex items-center gap-2">
                            {isEditingName ? (
                                <input
                                    autoFocus
                                    value={tempName}
                                    onChange={(e) => setTempName(e.target.value)}
                                    onBlur={() => {
                                        if (tempName.trim() && tempName !== selectedFlow.name) {
                                            executeSaveFlow({
                                                workspaceId,
                                                id: selectedFlow.id,
                                                name: tempName.trim()
                                            });
                                            setSelectedFlow({ ...selectedFlow, name: tempName.trim() });
                                        }
                                        setIsEditingName(false);
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') e.currentTarget.blur();
                                        if (e.key === 'Escape') {
                                            setTempName(selectedFlow.name);
                                            setIsEditingName(false);
                                        }
                                    }}
                                    className="text-sm font-bold bg-transparent border-b border-primary outline-none px-0 py-0.5 min-w-[200px]"
                                />
                            ) : (
                                <h2
                                    className="text-sm font-bold cursor-pointer hover:text-primary transition-colors flex items-center gap-2 group"
                                    onClick={() => {
                                        setTempName(selectedFlow.name);
                                        setIsEditingName(true);
                                    }}
                                >
                                    {selectedFlow?.name}
                                    <Pencil className="w-3.5 h-3.5 opacity-0 group-hover:opacity-60" />
                                </h2>
                            )}
                            {getStatusBadge(selectedFlow?.status)}
                            {selectedFlow?.flowId && (
                                <Badge variant="outline" className="text-[10px] font-mono opacity-70">
                                    Meta: {selectedFlow.flowId}
                                </Badge>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            className="gap-1.5 text-xs font-semibold"
                            onClick={() => executePush({ workspaceId, id: selectedFlow.id })}
                            disabled={isPushing}
                        >
                            <Globe className={`w-3.5 h-3.5 ${isPushing ? 'animate-spin text-primary' : ''}`} />
                            {selectedFlow?.flowId ? 'Re-push to Meta' : 'Push to Meta'}
                        </Button>

                        {selectedFlow?.flowId && selectedFlow?.status !== 'PUBLISHED' && (
                            <Button
                                variant="default"
                                size="sm"
                                className="gap-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                                onClick={() => executePublish({ workspaceId, id: selectedFlow.id })}
                                disabled={isPublishing}
                            >
                                <CheckCircle2 className={`w-3.5 h-3.5 ${isPublishing ? 'animate-spin' : ''}`} />
                                Publish Live
                            </Button>
                        )}
                    </div>
                </div>

                {/* Builder Canvas Area */}
                <div className="flex-1 overflow-hidden p-3">
                    <FlowBuilder
                        initialScreens={selectedFlow?.screens || []}
                        onSave={handleSaveFromBuilder}
                        onCancel={() => {
                            setView('list');
                            fetchFlows();
                        }}
                        flowName={selectedFlow?.name || 'Your form'}
                        endpointUrl={selectedFlow?.endpointUrl || ''}
                    />
                </div>
            </div>
        );
    }

    // --- Main Unified List / Grid View ---
    return (
        <TooltipProvider>
            <div className="flex flex-col h-full gap-2 p-2 animate-in fade-in duration-500">
                {/* Header */}
                <div className="flex border border-border items-center justify-between bg-card p-2 rounded-md shadow-sm">
                    <div className="flex flex-row gap-2 items-center">
                        <Layers className="w-8 h-8 text-primary" />
                        <div className="flex flex-col">
                            <h2 className="text-xl font-bold text-foreground">WhatsApp Flows</h2>
                            <p className="text-xs text-muted-foreground">Build, design and manage interactive multi-screen form experiences.</p>
                        </div>
                    </div>

                    <div className="flex flex-row gap-2">
                        <AccountSwitcher />
                        <Button
                            variant="outline"
                            className="border-primary/20 text-primary shadow-sm gap-2"
                            onClick={() => executeSync({ workspaceId })}
                            disabled={isSyncing}
                        >
                            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                            Sync Meta
                        </Button>
                        <Button
                            className="bg-primary hover:bg-primary/90 shadow-sm gap-2"
                            onClick={() => setIsCreateModalOpen(true)}
                        >
                            <Plus className="w-4 h-4" />
                            Create Flow
                        </Button>
                    </div>
                </div>

                {/* Filter Pills / Segments */}
                <div className="bg-card p-2.5 rounded-xl border border-border/50 shadow-sm flex flex-wrap items-center gap-1.5">
                    {FLOW_CATEGORIES.map((cat) => {
                        const isSelected = selectedCategory === cat.value;
                        const count = cat.value === 'ALL'
                            ? totalCount
                            : flows.filter(f => f.categories?.includes(cat.value)).length;

                        return (
                            <Button
                                key={cat.value}
                                variant={isSelected ? "default" : "ghost"}
                                size="sm"
                                onClick={() => setSelectedCategory(cat.value)}
                                className="h-8 text-xs font-semibold gap-2 rounded-lg"
                            >
                                {cat.label}
                                <Badge
                                    variant={isSelected ? "secondary" : "outline"}
                                    className="h-4 px-1.5 text-[10px] font-mono ml-0.5"
                                >
                                    {count}
                                </Badge>
                            </Button>
                        );
                    })}
                </div>

                {/* Toolbar */}
                <div className="bg-card p-2 rounded-xl shadow-sm flex flex-row gap-4 justify-between items-center border border-border/50">
                    <div className="relative flex-1 max-w-xs md:max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search flows by name, ID, or category..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 bg-background/50 border-border h-10 ring-offset-background text-xs"
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Status Filter */}
                        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                            <SelectTrigger className="h-10 text-xs w-[130px] bg-background/50 border-border">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">All Statuses</SelectItem>
                                <SelectItem value="PUBLISHED">Published ({publishedCount})</SelectItem>
                                <SelectItem value="DRAFT">Drafts ({draftCount})</SelectItem>
                                <SelectItem value="DEPRECATED">Deprecated</SelectItem>
                            </SelectContent>
                        </Select>

                        {/* Sort Dropdown */}
                        <Select value={sortBy} onValueChange={setSortBy}>
                            <SelectTrigger className="h-10 text-xs w-[170px] bg-background/50 border-border">
                                <SelectValue placeholder="Sort by" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="DESCENDING">Descending (Newest First)</SelectItem>
                                <SelectItem value="ASCENDING">Ascending (Oldest First)</SelectItem>
                                <SelectItem value="NAME_ASC">Name (A-Z)</SelectItem>
                                <SelectItem value="NAME_DESC">Name (Z-A)</SelectItem>
                                <SelectItem value="STATUS">Status</SelectItem>
                            </SelectContent>
                        </Select>

                        {/* View Mode */}
                        <div className="flex gap-1 bg-muted/30 p-1 rounded-lg border border-border/50 h-10">
                            <Button
                                variant={viewMode === 'grid' ? "secondary" : "ghost"}
                                size="icon"
                                className="w-8 h-8"
                                onClick={() => setViewMode('grid')}
                                title="Grid View"
                            >
                                <LayoutGrid className="w-4 h-4" />
                            </Button>
                            <Button
                                variant={viewMode === 'list' ? "secondary" : "ghost"}
                                size="icon"
                                className="w-8 h-8"
                                onClick={() => setViewMode('list')}
                                title="List View"
                            >
                                <List className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 h-full">
                    <div className="space-y-4 pr-1">
                        {isLoading ? (
                            <div className="flex-1 flex flex-col items-center justify-center h-64 opacity-50">
                                <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
                                <p className="text-sm font-medium">Loading flows...</p>
                            </div>
                        ) : filteredFlows.length === 0 ? (
                            <div className="flex-1 flex flex-col items-center justify-center p-20 border-2 border-dashed border-border rounded-xl bg-card/10 text-center">
                                <Layers className="w-16 h-16 text-muted-foreground/20 mb-6" />
                                <h3 className="text-xl font-bold text-foreground">
                                    {searchTerm || selectedCategory !== 'ALL' || selectedStatus !== 'ALL'
                                        ? "No matching flows found"
                                        : "No WhatsApp Flows found"}
                                </h3>
                                <p className="text-xs text-muted-foreground mt-1 mb-4 max-w-sm mx-auto">
                                    {searchTerm || selectedCategory !== 'ALL' || selectedStatus !== 'ALL'
                                        ? "Try adjusting your search query or filters."
                                        : "Create your first interactive WhatsApp flow or sync with Meta to get started."}
                                </p>
                                <div className="flex items-center gap-2">
                                    <Button
                                        onClick={() => setIsCreateModalOpen(true)}
                                        className="gap-2 bg-primary hover:bg-primary/90"
                                    >
                                        <Plus className="w-4 h-4" />
                                        Create Flow
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={() => executeSync({ workspaceId })}
                                        disabled={isSyncing}
                                        className="gap-2 border-primary/20 text-primary"
                                    >
                                        <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                                        Sync Meta
                                    </Button>
                                </div>
                            </div>
                        ) : viewMode === 'grid' ? (
                            /* GRID VIEW */
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-12">
                                {filteredFlows.map((flow) => {
                                    const screenCount = flow.screens?.length || 0;
                                    const errs = (() => {
                                        try {
                                            const raw = flow.metaValidationErrors;
                                            if (Array.isArray(raw)) return raw;
                                            if (typeof raw === 'string') return JSON.parse(raw);
                                            return [];
                                        } catch { return []; }
                                    })();

                                    return (
                                        <Card
                                            key={flow.id}
                                            className="group border border-border/50 hover:border-primary/30 shadow-sm hover:shadow-md transition-all duration-200 bg-card/60 backdrop-blur-sm relative rounded-xl overflow-hidden flex flex-col justify-between"
                                        >
                                            <div className="p-4 space-y-3 min-w-0">
                                                {/* Header: Title + Status */}
                                                <div className="flex items-start justify-between gap-2 min-w-0">
                                                    <div className="min-w-0 flex-1">
                                                        <h3
                                                            className="text-sm font-bold text-foreground break-words whitespace-normal leading-snug group-hover:text-primary transition-colors cursor-pointer"
                                                            title={flow.name}
                                                            onClick={() => handleEditFlow(flow)}
                                                        >
                                                            {flow.name}
                                                        </h3>
                                                        <div className="flex items-center gap-1.5 mt-1 min-w-0 flex-wrap">
                                                            <code className="text-[10px] font-mono text-muted-foreground/70 bg-muted/40 px-1.5 py-0.5 rounded border border-border/30">
                                                                {flow.flowId ? `Meta: ${flow.flowId}` : `Draft ID: ${flow.id.slice(-8)}`}
                                                            </code>
                                                            <Badge variant="outline" className="text-[9px] px-1.5 py-0 font-medium text-muted-foreground">
                                                                {screenCount} {screenCount === 1 ? 'screen' : 'screens'}
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                    <div className="shrink-0">
                                                        {getStatusBadge(flow.status)}
                                                    </div>
                                                </div>

                                                {/* Categories & Badges */}
                                                {flow.categories && flow.categories.length > 0 && (
                                                    <div className="flex flex-wrap gap-1 pt-0.5">
                                                        {flow.categories.map((cat) => (
                                                            <Badge
                                                                key={cat}
                                                                variant="outline"
                                                                className="text-[9px] font-semibold px-2 py-0 h-4.5 bg-muted/20 border-border/50 text-muted-foreground rounded-md"
                                                            >
                                                                {cat}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                )}

                                                {/* Validation Errors Banner */}
                                                {errs.length > 0 && (
                                                    <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-2 space-y-0.5">
                                                        {errs.slice(0, 1).map((err, i) => (
                                                            <div key={i} className="flex items-start gap-1.5 text-[11px] text-destructive leading-tight">
                                                                <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                                                                <span className="truncate flex-1" title={err.message || JSON.stringify(err)}>
                                                                    {err.message || JSON.stringify(err)}
                                                                </span>
                                                            </div>
                                                        ))}
                                                        {errs.length > 1 && (
                                                            <p className="text-[10px] text-destructive/80 font-semibold pl-5">
                                                                +{errs.length - 1} more validation issues
                                                            </p>
                                                        )}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Action Footer */}
                                            <div className="px-4 py-3 bg-muted/15 border-t border-border/40 flex items-center justify-between gap-2">
                                                <div className="flex items-center gap-1.5 min-w-0 flex-1">
                                                    <Button
                                                        variant="default"
                                                        size="sm"
                                                        className="h-8 px-3 text-xs font-bold gap-1.5 rounded-lg flex-1 min-w-0"
                                                        onClick={() => handleEditFlow(flow)}
                                                    >
                                                        <Pencil className="w-3.5 h-3.5 shrink-0" />
                                                        <span>Design Flow</span>
                                                    </Button>

                                                    {!flow.flowId ? (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="h-8 px-2.5 text-xs font-semibold gap-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20 hover:bg-blue-500/20 rounded-lg shrink-0"
                                                            onClick={() => executePush({ workspaceId, id: flow.id })}
                                                            disabled={isPushing}
                                                            title="Push flow to Meta"
                                                        >
                                                            <Globe className={`w-3.5 h-3.5 ${isPushing ? 'animate-spin' : ''}`} />
                                                            <span>Push</span>
                                                        </Button>
                                                    ) : flow.status === 'DRAFT' ? (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="h-8 px-2.5 text-xs font-semibold gap-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20 rounded-lg shrink-0"
                                                            onClick={() => executePublish({ workspaceId, id: flow.id })}
                                                            disabled={isPublishing}
                                                            title="Publish live to Meta"
                                                        >
                                                            <CheckCircle2 className={`w-3.5 h-3.5 ${isPublishing ? 'animate-spin' : ''}`} />
                                                            <span>Publish</span>
                                                        </Button>
                                                    ) : null}
                                                </div>

                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground shrink-0"
                                                        >
                                                            <MoreVertical className="w-4 h-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-44">
                                                        {flow.flowId && (
                                                            <>
                                                                <DropdownMenuItem
                                                                    className="text-xs gap-2 cursor-pointer"
                                                                    onClick={() => window.open(`https://business.facebook.com/wa/manage/flows/${flow.flowId}`, '_blank')}
                                                                >
                                                                    <ExternalLink className="w-3.5 h-3.5" />
                                                                    Meta Flow Manager
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem
                                                                    className="text-xs gap-2 cursor-pointer"
                                                                    onClick={() => executePush({ workspaceId, id: flow.id })}
                                                                    disabled={isPushing}
                                                                >
                                                                    <Globe className="w-3.5 h-3.5" />
                                                                    Re-push to Meta
                                                                </DropdownMenuItem>
                                                                <DropdownMenuSeparator />
                                                            </>
                                                        )}
                                                        <DropdownMenuItem
                                                            className="text-xs gap-2 cursor-pointer"
                                                            onClick={() => executeClone({ workspaceId, id: flow.id })}
                                                            disabled={isCloning}
                                                        >
                                                            <Copy className="w-3.5 h-3.5" />
                                                            Clone Flow
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem
                                                            className="text-xs gap-2 text-destructive focus:text-destructive cursor-pointer font-medium"
                                                            onClick={() => {
                                                                setFlowToDelete(flow);
                                                                setIsDeleteModalOpen(true);
                                                            }}
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                            Delete Flow
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </Card>
                                    );
                                })}
                            </div>
                        ) : (
                            /* LIST VIEW */
                            <div className="space-y-2.5 pb-12">
                                {filteredFlows.map((flow) => {
                                    const screenCount = flow.screens?.length || 0;

                                    return (
                                        <div
                                            key={flow.id}
                                            className="group relative flex items-center justify-between gap-4 p-3.5 bg-card/60 hover:bg-card border border-border/50 hover:border-primary/30 rounded-xl transition-all duration-200"
                                        >
                                            {/* Info Left */}
                                            <div className="flex-1 min-w-0 flex items-center gap-3.5">
                                                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20 text-primary">
                                                    <Layers className="w-5 h-5" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                                                        <span
                                                            className="text-sm font-bold text-foreground truncate cursor-pointer hover:text-primary transition-colors"
                                                            title={flow.name}
                                                            onClick={() => handleEditFlow(flow)}
                                                        >
                                                            {flow.name}
                                                        </span>
                                                        {getStatusBadge(flow.status)}
                                                        {flow.categories?.map(cat => (
                                                            <Badge key={cat} variant="outline" className="text-[9px] px-1.5 py-0 h-4 font-semibold text-muted-foreground">
                                                                {cat}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                    <div className="flex items-center gap-2 text-[11px] text-muted-foreground font-mono">
                                                        <span>{flow.flowId ? `Meta: ${flow.flowId}` : `Draft ID: ${flow.id.slice(-8)}`}</span>
                                                        <span>•</span>
                                                        <span>{screenCount} {screenCount === 1 ? 'screen' : 'screens'}</span>
                                                        {flow.endpointUrl && (
                                                            <>
                                                                <span>•</span>
                                                                <span className="truncate max-w-[200px] text-[10px]">{flow.endpointUrl}</span>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Actions Right */}
                                            <div className="flex items-center gap-2 shrink-0">
                                                <Button
                                                    variant="default"
                                                    size="sm"
                                                    className="h-8 px-3 text-xs font-bold gap-1.5 rounded-lg"
                                                    onClick={() => handleEditFlow(flow)}
                                                >
                                                    <Pencil className="w-3.5 h-3.5" />
                                                    <span>Design</span>
                                                </Button>

                                                {!flow.flowId ? (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="h-8 px-2.5 text-xs font-semibold gap-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20 hover:bg-blue-500/20 rounded-lg"
                                                        onClick={() => executePush({ workspaceId, id: flow.id })}
                                                        disabled={isPushing}
                                                    >
                                                        <Globe className="w-3.5 h-3.5" />
                                                        <span>Push</span>
                                                    </Button>
                                                ) : flow.status === 'DRAFT' ? (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="h-8 px-2.5 text-xs font-semibold gap-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20 rounded-lg"
                                                        onClick={() => executePublish({ workspaceId, id: flow.id })}
                                                        disabled={isPublishing}
                                                    >
                                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                                        <span>Publish</span>
                                                    </Button>
                                                ) : null}

                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground"
                                                        >
                                                            <MoreVertical className="w-4 h-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-44">
                                                        {flow.flowId && (
                                                            <>
                                                                <DropdownMenuItem
                                                                    className="text-xs gap-2 cursor-pointer"
                                                                    onClick={() => window.open(`https://business.facebook.com/wa/manage/flows/${flow.flowId}`, '_blank')}
                                                                >
                                                                    <ExternalLink className="w-3.5 h-3.5" />
                                                                    Meta Flow Manager
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem
                                                                    className="text-xs gap-2 cursor-pointer"
                                                                    onClick={() => executePush({ workspaceId, id: flow.id })}
                                                                    disabled={isPushing}
                                                                >
                                                                    <Globe className="w-3.5 h-3.5" />
                                                                    Re-push to Meta
                                                                </DropdownMenuItem>
                                                                <DropdownMenuSeparator />
                                                            </>
                                                        )}
                                                        <DropdownMenuItem
                                                            className="text-xs gap-2 cursor-pointer"
                                                            onClick={() => executeClone({ workspaceId, id: flow.id })}
                                                            disabled={isCloning}
                                                        >
                                                            <Copy className="w-3.5 h-3.5" />
                                                            Clone Flow
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem
                                                            className="text-xs gap-2 text-destructive focus:text-destructive cursor-pointer font-medium"
                                                            onClick={() => {
                                                                setFlowToDelete(flow);
                                                                setIsDeleteModalOpen(true);
                                                            }}
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                            Delete Flow
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* Create Flow Modal */}
                <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                    <DialogContent className="sm:max-w-[480px] rounded-2xl">
                        <DialogHeader>
                            <DialogTitle className="text-base font-bold">Design New Flow</DialogTitle>
                            <DialogDescription className="text-xs">
                                Set up the flow name and category to start designing screens in the visual editor.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-3">
                            <div className="space-y-2">
                                <Label className="text-xs font-semibold">Flow Name</Label>
                                <Input
                                    value={newFlowName}
                                    onChange={(e) => setNewFlowName(e.target.value)}
                                    placeholder="e.g., Customer Feedback Form"
                                    className="h-10 rounded-xl text-xs"
                                    autoFocus
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-semibold">Category</Label>
                                <Select value={newFlowCategory} onValueChange={setNewFlowCategory}>
                                    <SelectTrigger className="h-10 rounded-xl text-xs">
                                        <SelectValue placeholder="Select category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {FLOW_CATEGORIES.filter(c => c.value !== 'ALL').map(cat => (
                                            <SelectItem key={cat.value} value={cat.value} className="text-xs">
                                                {cat.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-semibold flex items-center gap-1.5">
                                    Endpoint URL
                                    <span className="text-[10px] text-muted-foreground font-normal">(Optional for dynamic data exchange)</span>
                                </Label>
                                <Input
                                    value={newFlowEndpoint}
                                    onChange={(e) => setNewFlowEndpoint(e.target.value)}
                                    placeholder="https://your-api.com/whatsapp/flow-endpoint"
                                    className="h-10 rounded-xl font-mono text-xs"
                                />
                            </div>
                        </div>
                        <DialogFooter className="gap-2 sm:gap-0">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setIsCreateModalOpen(false)}
                                className="rounded-xl"
                            >
                                Cancel
                            </Button>
                            <Button
                                size="sm"
                                onClick={handleCreateFlow}
                                disabled={isUpdating || !newFlowName.trim()}
                                className="rounded-xl gap-2 font-semibold px-5"
                            >
                                {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                                Create & Design
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Delete Confirmation Modal */}
                <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
                    <DialogContent className="sm:max-w-[420px] rounded-2xl">
                        <DialogHeader>
                            <DialogTitle className="text-base font-bold text-destructive flex items-center gap-2">
                                <Trash2 className="w-5 h-5" />
                                Delete Flow
                            </DialogTitle>
                            <DialogDescription className="text-xs">
                                Are you sure you want to delete <span className="font-bold text-foreground">{flowToDelete?.name}</span>?
                                {flowToDelete?.flowId ? " This will also attempt to delete it from Meta Cloud." : ""}
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter className="gap-2 sm:gap-0 pt-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setIsDeleteModalOpen(false)}
                                className="rounded-xl"
                                disabled={isDeleting}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => flowToDelete && executeDeleteFlow({ workspaceId, id: flowToDelete.id })}
                                disabled={isDeleting}
                                className="rounded-xl gap-2 font-semibold"
                            >
                                {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                Confirm Delete
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </TooltipProvider>
    );
}
