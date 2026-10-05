'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    SlidersHorizontal,
    Layers,
    Plus,
    Trash2,
    CheckCircle2,
    DollarSign,
    Sparkles,
    Loader2,
    RefreshCw,
    MessageCircle,
    Briefcase,
    Receipt,
    HelpCircle,
    Zap,
    Save,
    ArrowUp,
    ArrowDown
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

import {
    getPipelinesAction,
    createPipelineAction,
    updatePipelineAction,
    deletePipelineAction,
    createDealStageAction,
    updateDealStageDetailsAction,
    deleteDealStageAction
} from '../_actions/pipeline-actions';

export default function CrmSettingsPage() {
    const params = useParams();
    const router = useRouter();
    const workspaceId = params?.workspaceId;

    const [pipelines, setPipelines] = useState([]);
    const [selectedPipelineId, setSelectedPipelineId] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    // New Pipeline Form
    const [newPipelineName, setNewPipelineName] = useState('');
    const [newPipelineColor, setNewPipelineColor] = useState('#3b82f6');
    const [isCreatingPipeline, setIsCreatingPipeline] = useState(false);

    // Add Stage Form
    const [newStageName, setNewStageName] = useState('');
    const [newStageProb, setNewStageProb] = useState(50);
    const [newStageColor, setNewStageColor] = useState('#3b82f6');
    const [isWonStage, setIsWonStage] = useState(false);
    const [isLostStage, setIsLostStage] = useState(false);
    const [isAddingStage, setIsAddingStage] = useState(false);

    const loadPipelines = async () => {
        if (!workspaceId) return;
        try {
            setIsLoading(true);
            const res = await getPipelinesAction(workspaceId);
            if (res.success) {
                setPipelines(res.data);
                if (res.data.length > 0) {
                    if (!selectedPipelineId || !res.data.find(p => p.id === selectedPipelineId)) {
                        const def = res.data.find(p => p.isDefault) || res.data[0];
                        setSelectedPipelineId(def.id);
                    }
                }
            } else {
                toast.error(res.error || "Failed to load pipelines");
            }
        } catch (error) {
            console.error("Settings load error:", error);
            toast.error("Error loading pipeline settings");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadPipelines();
    }, [workspaceId]);

    const activePipeline = pipelines.find(p => p.id === selectedPipelineId) || pipelines[0];

    const handleCreatePipeline = async (e) => {
        e.preventDefault();
        if (!newPipelineName.trim()) {
            toast.error("Pipeline name is required");
            return;
        }

        setIsCreatingPipeline(true);
        try {
            const res = await createPipelineAction(workspaceId, {
                name: newPipelineName.trim(),
                color: newPipelineColor
            });

            if (res.success) {
                toast.success(`Pipeline "${res.data.name}" created!`);
                setNewPipelineName('');
                await loadPipelines();
                setSelectedPipelineId(res.data.id);
            } else {
                toast.error(res.error || "Failed to create pipeline");
            }
        } catch (error) {
            toast.error("Error creating pipeline");
        } finally {
            setIsCreatingPipeline(false);
        }
    };

    const handleSetDefaultPipeline = async (pipelineId) => {
        try {
            const res = await updatePipelineAction(workspaceId, pipelineId, { isDefault: true });
            if (res.success) {
                toast.success("Default pipeline updated");
                loadPipelines();
            } else {
                toast.error(res.error || "Failed to set default pipeline");
            }
        } catch (error) {
            toast.error("Error updating pipeline");
        }
    };

    const handleDeletePipeline = async (pipelineId, name) => {
        if (!confirm(`Are you sure you want to delete pipeline "${name}"? All stages and deals will be deleted.`)) return;

        try {
            const res = await deletePipelineAction(workspaceId, pipelineId);
            if (res.success) {
                toast.success("Pipeline deleted");
                loadPipelines();
            } else {
                toast.error(res.error || "Failed to delete pipeline");
            }
        } catch (error) {
            toast.error("Error deleting pipeline");
        }
    };

    const handleAddStage = async (e) => {
        e.preventDefault();
        if (!newStageName.trim() || !activePipeline) {
            toast.error("Stage name is required");
            return;
        }

        setIsAddingStage(true);
        try {
            const res = await createDealStageAction(workspaceId, activePipeline.id, {
                name: newStageName.trim(),
                probability: newStageProb,
                color: newStageColor,
                isWon: isWonStage,
                isLost: isLostStage
            });

            if (res.success) {
                toast.success(`Stage "${res.data.name}" added`);
                setNewStageName('');
                setNewStageProb(50);
                setIsWonStage(false);
                setIsLostStage(false);
                loadPipelines();
            } else {
                toast.error(res.error || "Failed to add stage");
            }
        } catch (error) {
            toast.error("Error adding stage");
        } finally {
            setIsAddingStage(false);
        }
    };

    const handleUpdateStage = async (stageId, data) => {
        try {
            const res = await updateDealStageDetailsAction(workspaceId, stageId, data);
            if (res.success) {
                toast.success("Stage updated");
                loadPipelines();
            } else {
                toast.error(res.error || "Failed to update stage");
            }
        } catch (error) {
            toast.error("Error updating stage");
        }
    };

    const handleDeleteStage = async (stageId, stageName) => {
        if (!confirm(`Delete stage "${stageName}"?`)) return;

        try {
            const res = await deleteDealStageAction(workspaceId, stageId);
            if (res.success) {
                toast.success("Stage deleted");
                loadPipelines();
            } else {
                toast.error(res.error || "Failed to delete stage");
            }
        } catch (error) {
            toast.error("Error deleting stage");
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-background p-4 lg:p-8 space-y-8 max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-primary/10 text-primary">
                        <SlidersHorizontal className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-xl lg:text-2xl font-black tracking-tight text-foreground">
                            CRM Settings & Pipeline Builder
                        </h1>
                        <p className="text-xs text-muted-foreground">
                            Configure sales stages, deal probabilities, custom funnels, and cross-module bridges.
                        </p>
                    </div>
                </div>

                <Button
                    variant="outline"
                    size="sm"
                    className="h-9 gap-1.5 text-xs font-semibold"
                    onClick={loadPipelines}
                >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Refresh Settings</span>
                </Button>
            </div>

            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    <p className="text-xs font-semibold text-muted-foreground">Loading CRM configurations...</p>
                </div>
            ) : (
                <div className="space-y-8">
                    {/* Section 1: Pipeline Selector & Manager */}
                    <div className="p-6 rounded-3xl bg-card border border-border/80 space-y-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/60">
                            <div>
                                <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                                    <Layers className="w-4 h-4 text-primary" />
                                    <span>Sales Pipelines</span>
                                </h2>
                                <p className="text-xs text-muted-foreground">
                                    Switch between pipelines or create customized funnels for different business units.
                                </p>
                            </div>

                            <div className="flex items-center gap-2">
                                <Select value={selectedPipelineId} onValueChange={setSelectedPipelineId}>
                                    <SelectTrigger className="h-9 w-[220px] text-xs font-semibold">
                                        <SelectValue placeholder="Select Pipeline" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {pipelines.map(pipe => (
                                            <SelectItem key={pipe.id} value={pipe.id}>
                                                {pipe.name} {pipe.isDefault ? '(Default)' : ''}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                {activePipeline && !activePipeline.isDefault && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        className="h-9 text-xs font-semibold"
                                        onClick={() => handleSetDefaultPipeline(activePipeline.id)}
                                    >
                                        Make Default
                                    </Button>
                                )}

                                {activePipeline && pipelines.length > 1 && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="h-9 w-9 text-destructive hover:bg-destructive/10"
                                        title="Delete Pipeline"
                                        onClick={() => handleDeletePipeline(activePipeline.id, activePipeline.name)}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                )}
                            </div>
                        </div>

                        {/* Pipeline Stage Builder */}
                        {activePipeline && (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                        Stages in "{activePipeline.name}"
                                    </h3>
                                    <span className="text-xs text-muted-foreground">
                                        {activePipeline.stages?.length || 0} Stages Configured
                                    </span>
                                </div>

                                {/* Stages List */}
                                <div className="space-y-2.5">
                                    {(activePipeline.stages || []).map((stage, idx) => (
                                        <div
                                            key={stage.id}
                                            className="p-3.5 rounded-2xl bg-muted/30 border border-border/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                                        >
                                            <div className="flex items-center gap-3 min-w-0">
                                                <span className="w-5 h-5 rounded-full bg-muted flex items-center justify-center font-black text-[10px] text-muted-foreground shrink-0">
                                                    {idx + 1}
                                                </span>
                                                <span
                                                    className="w-3.5 h-3.5 rounded-full shrink-0"
                                                    style={{ backgroundColor: stage.color || '#3b82f6' }}
                                                />
                                                <div className="min-w-0">
                                                    <p className="font-bold text-foreground text-sm truncate">{stage.name}</p>
                                                    <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                                                        <span>Win Probability: {stage.probability}%</span>
                                                        {stage.isWon && <Badge className="text-[9px] bg-emerald-500/10 text-emerald-500">Won State</Badge>}
                                                        {stage.isLost && <Badge className="text-[9px] bg-red-500/10 text-red-500">Lost State</Badge>}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2 justify-end">
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    max="100"
                                                    value={stage.probability}
                                                    onChange={(e) => handleUpdateStage(stage.id, { probability: parseInt(e.target.value) || 0 })}
                                                    className="w-16 h-8 text-xs text-center font-bold bg-background"
                                                    title="Change Win Probability %"
                                                />
                                                <span className="text-xs text-muted-foreground font-bold">%</span>

                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-destructive hover:bg-destructive/10"
                                                    onClick={() => handleDeleteStage(stage.id, stage.name)}
                                                    title="Delete Stage"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Add New Stage Form */}
                                <form onSubmit={handleAddStage} className="p-4 rounded-2xl border border-dashed border-border/80 bg-card space-y-3 mt-4">
                                    <h4 className="text-xs font-bold text-foreground">Add Custom Stage to Pipeline</h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                                        <Input
                                            placeholder="Stage Name (e.g., Technical Review)..."
                                            value={newStageName}
                                            onChange={(e) => setNewStageName(e.target.value)}
                                            className="h-9 text-xs sm:col-span-2 bg-background"
                                            required
                                        />
                                        <div className="flex items-center gap-1.5">
                                            <Input
                                                type="number"
                                                min="0"
                                                max="100"
                                                placeholder="50"
                                                value={newStageProb}
                                                onChange={(e) => setNewStageProb(e.target.value)}
                                                className="h-9 text-xs bg-background text-center font-bold"
                                            />
                                            <span className="text-xs text-muted-foreground font-bold">% Prob</span>
                                        </div>

                                        <Button
                                            type="submit"
                                            size="sm"
                                            disabled={isAddingStage || !newStageName.trim()}
                                            className="h-9 text-xs font-semibold"
                                        >
                                            {isAddingStage ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : <Plus className="w-3.5 h-3.5 mr-1" />}
                                            Add Stage
                                        </Button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {/* Create New Pipeline Inline Box */}
                        <div className="pt-4 border-t border-border/60">
                            <h3 className="text-xs font-bold text-foreground mb-2">Create New Pipeline</h3>
                            <form onSubmit={handleCreatePipeline} className="flex items-center gap-2 flex-wrap">
                                <Input
                                    placeholder="Pipeline Name (e.g., Enterprise B2B Sales, WhatsApp Funnel)..."
                                    value={newPipelineName}
                                    onChange={(e) => setNewPipelineName(e.target.value)}
                                    className="h-9 text-xs max-w-sm bg-background"
                                    required
                                />
                                <Button
                                    type="submit"
                                    size="sm"
                                    disabled={isCreatingPipeline || !newPipelineName.trim()}
                                    className="h-9 text-xs font-semibold"
                                >
                                    {isCreatingPipeline ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : <Plus className="w-3.5 h-3.5 mr-1" />}
                                    Create Pipeline
                                </Button>
                            </form>
                        </div>
                    </div>

                    {/* Section 2: Unified Cross-Module Bridges Status */}
                    <div className="p-6 rounded-3xl bg-card border border-border/80 space-y-4">
                        <div className="pb-3 border-b border-border/60">
                            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                                <Zap className="w-4 h-4 text-amber-500" />
                                <span>Devlomatix Unified Ecosystem Integrations</span>
                            </h2>
                            <p className="text-xs text-muted-foreground">
                                Real-time synchronization state across connected platform modules.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* KonnectX WhatsApp */}
                            <div className="p-4 rounded-2xl bg-muted/20 border border-border/70 flex items-start gap-3">
                                <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500 shrink-0">
                                    <MessageCircle className="w-5 h-5" />
                                </div>
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <h4 className="font-bold text-xs text-foreground">KonnectX WhatsApp Cloud</h4>
                                        <Badge className="bg-emerald-500/10 text-emerald-500 text-[9px]">Active & Synced</Badge>
                                    </div>
                                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                                        Direct WhatsApp outreach from CRM contact dossiers and deal cards with real-time bidirectional message logging.
                                    </p>
                                </div>
                            </div>

                            {/* Hireflow ATS */}
                            <div className="p-4 rounded-2xl bg-muted/20 border border-border/70 flex items-start gap-3">
                                <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-500 shrink-0">
                                    <Briefcase className="w-5 h-5" />
                                </div>
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <h4 className="font-bold text-xs text-foreground">Hireflow ATS Recruitment</h4>
                                        <Badge className="bg-indigo-500/10 text-indigo-500 text-[9px]">Connected</Badge>
                                    </div>
                                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                                        Convert job applicants and candidates directly into qualified CRM Leads, staffing deals, and client interviews.
                                    </p>
                                </div>
                            </div>

                            {/* PayFlow Invoicing */}
                            <div className="p-4 rounded-2xl bg-muted/20 border border-border/70 flex items-start gap-3">
                                <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-500 shrink-0">
                                    <Receipt className="w-5 h-5" />
                                </div>
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <h4 className="font-bold text-xs text-foreground">PayFlow Invoices & Billing</h4>
                                        <Badge className="bg-blue-500/10 text-blue-500 text-[9px]">Linked</Badge>
                                    </div>
                                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                                        Synchronize closed-won deals into invoices and compute real-time Customer Lifetime Value (LTV).
                                    </p>
                                </div>
                            </div>

                            {/* DeskFlow & FlowForge */}
                            <div className="p-4 rounded-2xl bg-muted/20 border border-border/70 flex items-start gap-3">
                                <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-500 shrink-0">
                                    <Sparkles className="w-5 h-5" />
                                </div>
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <h4 className="font-bold text-xs text-foreground">FlowForge Automation Engine</h4>
                                        <Badge className="bg-purple-500/10 text-purple-500 text-[9px]">Active</Badge>
                                    </div>
                                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                                        Trigger automated webhook flows and multi-step actions on deal stage transitions and new lead signups.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
