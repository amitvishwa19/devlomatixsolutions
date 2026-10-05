'use client';

import React, { useState, useEffect, useMemo, useTransition } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { DragDropContext } from '@hello-pangea/dnd';
import {
    Plus,
    LayoutGrid,
    List,
    Search,
    Filter,
    ArrowUpDown,
    TrendingUp,
    DollarSign,
    Target,
    Layers,
    SlidersHorizontal,
    Sparkles,
    Loader2,
    RefreshCw,
    Building2,
    User,
    Calendar,
    MessageCircle,
    ChevronRight,
    CheckCircle2
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

import StageColumn from './_components/StageColumn';
import DealDrawer from './_components/DealDrawer';
import CreateDealModal from './_components/CreateDealModal';

import { getPipelinesAction, ensureDefaultPipeline } from '../_actions/pipeline-actions';
import { getDealsAction, updateDealStageAction } from '../_actions/deal-actions';

export default function PipelinePage() {
    const params = useParams();
    const router = useRouter();
    const workspaceId = params?.workspaceId;

    const [pipelines, setPipelines] = useState([]);
    const [selectedPipelineId, setSelectedPipelineId] = useState('');
    const [deals, setDeals] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    // View state
    const [viewMode, setViewMode] = useState('kanban'); // 'kanban' | 'table'
    const [searchQuery, setSearchQuery] = useState('');
    const [priorityFilter, setPriorityFilter] = useState('ALL');
    const [statusFilter, setStatusFilter] = useState('OPEN'); // 'OPEN' | 'WON' | 'LOST' | 'ALL'

    // Modals & Drawer State
    const [selectedDealId, setSelectedDealId] = useState(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [createModalDefaultStage, setCreateModalDefaultStage] = useState(null);

    // Load pipelines & deals
    const loadPipelineData = async (showRefreshToast = false) => {
        if (!workspaceId) return;
        try {
            if (showRefreshToast) setIsRefreshing(true);
            else setIsLoading(true);

            // 1. Ensure default pipeline and fetch all pipelines
            const pipelineRes = await getPipelinesAction(workspaceId);
            let activePipelines = pipelineRes.success ? pipelineRes.data : [];

            if (!activePipelines || activePipelines.length === 0) {
                const initRes = await ensureDefaultPipeline(workspaceId);
                if (initRes.success && initRes.data) {
                    activePipelines = [initRes.data];
                }
            }

            setPipelines(activePipelines);

            // Determine active pipeline ID
            const activePipe = activePipelines.find(p => p.id === selectedPipelineId) ||
                activePipelines.find(p => p.isDefault) ||
                activePipelines[0];

            if (activePipe) {
                setSelectedPipelineId(activePipe.id);
                // 2. Fetch deals for this pipeline
                const dealsRes = await getDealsAction(workspaceId, {
                    pipelineId: activePipe.id,
                    status: statusFilter === 'ALL' ? undefined : statusFilter,
                    priority: priorityFilter === 'ALL' ? undefined : priorityFilter,
                    search: searchQuery || undefined
                });

                if (dealsRes.success) {
                    setDeals(dealsRes.data);
                } else {
                    toast.error(dealsRes.error || "Failed to load deals");
                }
            }

            if (showRefreshToast) {
                toast.success("Pipeline refreshed");
            }
        } catch (error) {
            console.error("Pipeline loading error:", error);
            toast.error("Failed to load pipeline data");
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    };

    useEffect(() => {
        loadPipelineData();
    }, [workspaceId, selectedPipelineId, priorityFilter, statusFilter]);

    const activePipeline = useMemo(() => {
        return pipelines.find(p => p.id === selectedPipelineId) || pipelines[0] || null;
    }, [pipelines, selectedPipelineId]);

    const stages = useMemo(() => {
        return activePipeline?.stages?.sort((a, b) => a.order - b.order) || [];
    }, [activePipeline]);

    // Filtered deals matching search
    const filteredDeals = useMemo(() => {
        if (!searchQuery.trim()) return deals;
        const q = searchQuery.toLowerCase();
        return deals.filter(deal =>
            deal.title.toLowerCase().includes(q) ||
            deal.account?.name?.toLowerCase().includes(q) ||
            deal.contact?.name?.toLowerCase().includes(q)
        );
    }, [deals, searchQuery]);

    // Group deals by stageId
    const dealsByStage = useMemo(() => {
        const map = {};
        stages.forEach(stage => {
            map[stage.id] = [];
        });
        filteredDeals.forEach(deal => {
            if (map[deal.stageId]) {
                map[deal.stageId].push(deal);
            }
        });
        return map;
    }, [stages, filteredDeals]);

    // Telemetry computations
    const pipelineMetrics = useMemo(() => {
        const totalValue = deals.reduce((sum, d) => sum + (d.value || 0), 0);
        const openDeals = deals.filter(d => d.status === 'OPEN');
        const wonDeals = deals.filter(d => d.status === 'WON');
        const weightedValue = deals.reduce((sum, d) => {
            const stageProb = d.stage?.probability ?? 50;
            return sum + (d.value || 0) * (stageProb / 100);
        }, 0);
        const winRate = deals.length > 0 ? ((wonDeals.length / deals.length) * 100).toFixed(0) : 0;

        return {
            totalValue,
            weightedValue,
            openCount: openDeals.length,
            wonCount: wonDeals.length,
            winRate
        };
    }, [deals]);

    // Drag and Drop Handler
    const handleDragEnd = async (result) => {
        const { source, destination, draggableId } = result;

        if (!destination) return;
        if (
            source.droppableId === destination.droppableId &&
            source.index === destination.index
        ) {
            return;
        }

        const sourceStageId = source.droppableId;
        const targetStageId = destination.droppableId;
        const draggedDealId = draggableId;

        // Optimistic UI update
        const updatedDeals = [...deals];
        const draggedDealIndex = updatedDeals.findIndex(d => d.id === draggedDealId);

        if (draggedDealIndex === -1) return;

        const updatedDeal = {
            ...updatedDeals[draggedDealIndex],
            stageId: targetStageId,
            stage: stages.find(s => s.id === targetStageId) || updatedDeals[draggedDealIndex].stage
        };

        updatedDeals[draggedDealIndex] = updatedDeal;
        setDeals(updatedDeals);

        // Server sync
        try {
            const res = await updateDealStageAction(
                workspaceId,
                draggedDealId,
                targetStageId,
                destination.index
            );

            if (!res.success) {
                toast.error(res.error || "Failed to update deal stage");
                // Revert on failure
                loadPipelineData();
            } else {
                const targetStageName = stages.find(s => s.id === targetStageId)?.name || 'new stage';
                toast.success(`Moved deal to ${targetStageName}`);
            }
        } catch (error) {
            console.error("Stage transition error:", error);
            toast.error("Error moving deal stage");
            loadPipelineData();
        }
    };

    const handleOpenDealDrawer = (deal) => {
        setSelectedDealId(deal.id);
        setIsDrawerOpen(true);
    };

    const handleAddDealToStage = (stageId) => {
        setCreateModalDefaultStage(stageId);
        setIsCreateModalOpen(true);
    };

    const handleDealUpdated = () => {
        loadPipelineData();
    };

    const formatCurrency = (val) => {
        return `₹ ${Number(val || 0).toLocaleString('en-IN')}`;
    };

    return (
        <div className="flex flex-col h-[calc(100vh-3.5rem)] overflow-hidden bg-background">
            {/* Top Pipeline Bar & Controls */}
            <div className="flex-none p-4 pb-3 border-b border-border/60 bg-card/40 backdrop-blur-sm space-y-3">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                    {/* Pipeline Selector & Quick Info */}
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                            <Layers className="w-5 h-5 text-primary" />
                            <Select
                                value={selectedPipelineId}
                                onValueChange={(val) => setSelectedPipelineId(val)}
                            >
                                <SelectTrigger className="h-9 w-[220px] font-semibold bg-background border-border/80">
                                    <SelectValue placeholder="Select Pipeline" />
                                </SelectTrigger>
                                <SelectContent>
                                    {pipelines.map(pipe => (
                                        <SelectItem key={pipe.id} value={pipe.id} className="font-medium">
                                            {pipe.name} {pipe.isDefault && "(Default)"}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Telemetry Pills */}
                        <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-border/60">
                            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-primary/10 text-primary border border-primary/20 rounded-full text-xs font-bold">
                                <DollarSign className="w-3.5 h-3.5" />
                                <span>Total: {formatCurrency(pipelineMetrics.totalValue)}</span>
                            </div>
                            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-full text-xs font-bold">
                                <Target className="w-3.5 h-3.5" />
                                <span>Weighted: {formatCurrency(pipelineMetrics.weightedValue)}</span>
                            </div>
                            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-muted border border-border rounded-full text-xs font-semibold text-muted-foreground">
                                <span>{pipelineMetrics.openCount} Open Deals</span>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons & View Mode */}
                    <div className="flex items-center gap-2 flex-wrap">
                        {/* View Switcher */}
                        <div className="flex items-center bg-muted/70 p-0.5 rounded-lg border border-border/60">
                            <Button
                                type="button"
                                variant={viewMode === 'kanban' ? 'secondary' : 'ghost'}
                                size="sm"
                                className={`h-8 px-2.5 text-xs font-semibold gap-1.5 ${viewMode === 'kanban' ? 'shadow-sm' : 'text-muted-foreground'}`}
                                onClick={() => setViewMode('kanban')}
                            >
                                <LayoutGrid className="w-3.5 h-3.5" />
                                <span>Board</span>
                            </Button>
                            <Button
                                type="button"
                                variant={viewMode === 'table' ? 'secondary' : 'ghost'}
                                size="sm"
                                className={`h-8 px-2.5 text-xs font-semibold gap-1.5 ${viewMode === 'table' ? 'shadow-sm' : 'text-muted-foreground'}`}
                                onClick={() => setViewMode('table')}
                            >
                                <List className="w-3.5 h-3.5" />
                                <span>Table</span>
                            </Button>
                        </div>

                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-8 gap-1.5 text-xs"
                            onClick={() => loadPipelineData(true)}
                            disabled={isRefreshing}
                        >
                            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                            <span className="hidden sm:inline">Sync</span>
                        </Button>

                        <Button
                            type="button"
                            size="sm"
                            className="h-8 gap-1.5 text-xs bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-sm"
                            onClick={() => {
                                setCreateModalDefaultStage(stages[0]?.id || null);
                                setIsCreateModalOpen(true);
                            }}
                        >
                            <Plus className="w-4 h-4" />
                            <span>New Deal</span>
                        </Button>
                    </div>
                </div>

                {/* Filter & Search Bar */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 pt-1">
                    <div className="relative w-full sm:w-80">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="Search deals, contacts, companies..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="h-8 pl-8 text-xs bg-background/80 border-border/80"
                        />
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                        {/* Status Filter */}
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="h-8 w-[120px] text-xs bg-background/80 border-border/80">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">All Status</SelectItem>
                                <SelectItem value="OPEN">Open Deals</SelectItem>
                                <SelectItem value="WON">Won</SelectItem>
                                <SelectItem value="LOST">Lost</SelectItem>
                            </SelectContent>
                        </Select>

                        {/* Priority Filter */}
                        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                            <SelectTrigger className="h-8 w-[120px] text-xs bg-background/80 border-border/80">
                                <SelectValue placeholder="Priority" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">All Priority</SelectItem>
                                <SelectItem value="LOW">Low</SelectItem>
                                <SelectItem value="MEDIUM">Medium</SelectItem>
                                <SelectItem value="HIGH">High</SelectItem>
                                <SelectItem value="URGENT">Urgent</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 overflow-hidden p-4">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center h-full gap-3">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        <p className="text-sm font-medium text-muted-foreground">Loading pipeline & deals...</p>
                    </div>
                ) : viewMode === 'kanban' ? (
                    /* Kanban Drag & Drop Board */
                    <DragDropContext onDragEnd={handleDragEnd}>
                        <div
                            className="flex gap-4 h-full overflow-x-auto pb-2 items-start"
                            style={{ scrollbarWidth: 'thin' }}
                        >
                            {stages.map(stage => (
                                <StageColumn
                                    key={stage.id}
                                    stage={stage}
                                    deals={dealsByStage[stage.id] || []}
                                    onDealClick={handleOpenDealDrawer}
                                    onAddDeal={handleAddDealToStage}
                                    onQuickWhatsApp={(deal) => {
                                        setSelectedDealId(deal.id);
                                        setIsDrawerOpen(true);
                                    }}
                                />
                            ))}

                            {/* Quick Add Stage Button / Config Link */}
                            <div className="flex flex-col justify-center items-center w-64 min-w-[240px] h-32 border border-dashed border-border/80 rounded-2xl bg-muted/10 hover:bg-muted/30 transition-colors p-4 text-center shrink-0">
                                <p className="text-xs font-semibold text-muted-foreground">Need custom stages?</p>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="mt-2 text-xs font-semibold h-7 border-border/80"
                                    onClick={() => router.push(`/workspace/${workspaceId}/crm/settings`)}
                                >
                                    <SlidersHorizontal className="w-3.5 h-3.5 mr-1" />
                                    Configure Pipeline
                                </Button>
                            </div>
                        </div>
                    </DragDropContext>
                ) : (
                    /* Table / List View */
                    <div className="h-full border border-border/70 rounded-2xl bg-card overflow-hidden flex flex-col">
                        <div className="overflow-y-auto flex-1">
                            <table className="w-full text-left text-xs">
                                <thead className="bg-muted/50 border-b border-border text-muted-foreground font-semibold sticky top-0 backdrop-blur-md">
                                    <tr>
                                        <th className="py-3 px-4">Deal Title</th>
                                        <th className="py-3 px-4">Company / Contact</th>
                                        <th className="py-3 px-4">Stage</th>
                                        <th className="py-3 px-4">Value</th>
                                        <th className="py-3 px-4">Priority</th>
                                        <th className="py-3 px-4">Expected Close</th>
                                        <th className="py-3 px-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border/60">
                                    {filteredDeals.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="py-12 text-center text-muted-foreground">
                                                No deals match the selected criteria.
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredDeals.map(deal => (
                                            <tr
                                                key={deal.id}
                                                className="hover:bg-muted/40 transition-colors cursor-pointer group"
                                                onClick={() => handleOpenDealDrawer(deal)}
                                            >
                                                <td className="py-3.5 px-4 font-bold text-foreground">
                                                    <div className="flex items-center gap-2">
                                                        <span>{deal.title}</span>
                                                        {deal.contact?.phone && (
                                                            <span className="p-1 rounded bg-emerald-500/10 text-emerald-500">
                                                                <MessageCircle className="w-3 h-3" />
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="py-3.5 px-4 text-muted-foreground">
                                                    <div className="space-y-0.5">
                                                        {deal.account && (
                                                            <div className="flex items-center gap-1.5 font-medium text-foreground">
                                                                <Building2 className="w-3 h-3 text-muted-foreground" />
                                                                <span>{deal.account.name}</span>
                                                            </div>
                                                        )}
                                                        {deal.contact && (
                                                            <div className="flex items-center gap-1.5 text-[11px]">
                                                                <User className="w-3 h-3 text-muted-foreground" />
                                                                <span>{deal.contact.name || deal.contact.phone}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="py-3.5 px-4">
                                                    <Badge
                                                        variant="outline"
                                                        className="text-[11px] font-semibold border"
                                                        style={{
                                                            borderColor: deal.stage?.color ? `${deal.stage.color}60` : undefined,
                                                            backgroundColor: deal.stage?.color ? `${deal.stage.color}15` : undefined
                                                        }}
                                                    >
                                                        {deal.stage?.name || 'Stage'}
                                                    </Badge>
                                                </td>
                                                <td className="py-3.5 px-4 font-bold text-foreground">
                                                    {formatCurrency(deal.value)}
                                                </td>
                                                <td className="py-3.5 px-4">
                                                    <Badge
                                                        variant="secondary"
                                                        className={`text-[10px] uppercase font-bold ${
                                                            deal.priority === 'URGENT' ? 'bg-red-500/10 text-red-500 border border-red-500/20' :
                                                            deal.priority === 'HIGH' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' :
                                                            deal.priority === 'LOW' ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20' :
                                                            'bg-muted text-muted-foreground'
                                                        }`}
                                                    >
                                                        {deal.priority}
                                                    </Badge>
                                                </td>
                                                <td className="py-3.5 px-4 text-muted-foreground">
                                                    {deal.expectedCloseDate ? (
                                                        <div className="flex items-center gap-1.5">
                                                            <Calendar className="w-3 h-3" />
                                                            <span>{new Date(deal.expectedCloseDate).toLocaleDateString()}</span>
                                                        </div>
                                                    ) : '—'}
                                                </td>
                                                <td className="py-3.5 px-4 text-right">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-7 text-xs font-semibold text-primary hover:text-primary group-hover:translate-x-0.5 transition-transform"
                                                    >
                                                        Inspect
                                                        <ChevronRight className="w-3.5 h-3.5 ml-1" />
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* Slide-out Deal Inspection Drawer */}
            <DealDrawer
                isOpen={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
                dealId={selectedDealId}
                workspaceId={workspaceId}
                stages={stages}
                onDealUpdated={handleDealUpdated}
            />

            {/* Create Deal Modal */}
            <CreateDealModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                workspaceId={workspaceId}
                pipelines={pipelines}
                defaultStageId={createModalDefaultStage}
                onDealCreated={handleDealUpdated}
            />
        </div>
    );
}
