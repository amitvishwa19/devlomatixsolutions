'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { BrainCircuit, Search, Boxes, CheckCircle2, PowerOff, Loader2, Activity, RefreshCw, Target, ToggleLeft, ToggleRight } from 'lucide-react';
import { toast } from 'sonner';
import {
    getProvidersAction,
    testProviderConnectionAction,
    toggleProviderStatusAction,
    setModelActiveAction,
    setAllProvidersActiveAction
} from '../../_action/provider-actions';
import { inferCapabilities } from '../../_lib/model-capabilities';

const capabilityLabels = {
    thinking: "Thinking",
    coding: "Coding",
    vision: "Vision",
    search: "Search",
    "long-ctx": "Long Context"
};

const bestForFallback = {
    thinking: "Deep reasoning, math & logic",
    coding: "Code generation and refactoring",
    vision: "Image and multimodal tasks",
    search: "Web research & live data",
    "long-ctx": "Long documents & large context"
};

const capabilityDefaultBestFor = {
    "logic, reasoning": "Deep reasoning, math & logic",
    "code generation": "Code generation and refactoring",
    "general intelligence": "General-purpose conversations & tasks",
    "multimodal": "Image and multimodal tasks",
    "fast response": "Low-latency, high-speed inference",
    "cost optimized": "Cost-efficient inference at scale"
};

function defaultModelsFor(provider) {
    switch (provider?.toLowerCase()) {
        case "freemodel": return ["meta-llama/llama-3.1-8b-instruct", "qwen/qwen-2.5-72b-instruct", "deepseek-ai/deepseek-r1-distill-llama-70b"];
        case "nvidia": return ["meta/llama-3.1-405b-instruct", "nvidia/nemotron-4-340b-instruct"];
        case "anthropic": return ["claude-3-7-sonnet", "claude-3-5-haiku"];
        case "deepseek": return ["deepseek-chat-v3", "deepseek-reasoner-r1"];
        case "groq": return ["llama-3.3-70b-versatile", "mixtral-8x7b"];
        case "google": return ["gemini-2.0-flash", "gemini-1.5-pro"];
        case "openrouter": return ["auto", "anthropic/claude-3.5-sonnet", "deepseek/deepseek-r1"];
        case "ollama": return ["llama3.2:latest", "deepseek-r1:14b"];
        default: return [];
    }
}

function parseImportedModels(provider) {
    const fromMetadata = Array.isArray(provider.metadata?.importedModels) ? provider.metadata.importedModels : null;
    if (fromMetadata && fromMetadata.length > 0) return fromMetadata;
    const desc = provider.description || "";
    const match = desc.match(/Imported Models:\s*(.+)/i);
    if (match && match[1]) return match[1].split(",").map(m => m.trim()).filter(Boolean);
    return defaultModelsFor(provider.provider);
}

function resolveBestFor(provider, caps) {
    const bestFor = (provider.bestFor || "").trim();
    if (bestFor) return bestFor;
    const capability = (provider.capability || "").toLowerCase().trim();
    if (capability && capabilityDefaultBestFor[capability]) return capabilityDefaultBestFor[capability];
    for (const cap of caps) {
        if (bestForFallback[cap]) return bestForFallback[cap];
    }
    return "General-purpose AI tasks";
}

function capabilityChips(provider, caps) {
    const fromField = (provider.capability || "").split(",").map(c => c.trim()).filter(Boolean);
    const labels = caps.map(c => capabilityLabels[c] || c);
    const merged = [...new Set([...fromField, ...labels])];
    return merged.length > 0 ? merged : ["General"];
}

export function ModelsTab({ workspaceId }) {
    const [providers, setProviders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [testingId, setTestingId] = useState(null);
    const [refreshingAll, setRefreshingAll] = useState(false);
    const [bulkToggling, setBulkToggling] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeOnly, setActiveOnly] = useState(false);

    const fetchProviders = useCallback(async () => {
        if (!workspaceId) return;
        setLoading(true);
        const res = await getProvidersAction(workspaceId);
        if (res.success) setProviders(res.data || []);
        setLoading(false);
    }, [workspaceId]);

    useEffect(() => {
        fetchProviders();
    }, [fetchProviders]);

    const modelEntries = useMemo(() => {
        const entries = [];
        for (const provider of providers) {
            const models = parseImportedModels(provider);
            const modelStates = provider.metadata?.modelStates && typeof provider.metadata.modelStates === "object" ? provider.metadata.modelStates : {};
            for (const model of models) {
                const caps = inferCapabilities({ model, label: provider.label || "", strengths: provider.strengths || "" });
                entries.push({
                    model,
                    shortName: model.includes('/') ? model.split('/').pop() : model,
                    provider: provider.provider,
                    providerName: provider.name,
                    providerLabel: provider.label,
                    providerId: provider.id,
                    isActive: Boolean(provider.isActive) && (modelStates[model] ?? true),
                    healthStatus: provider.healthStatus,
                    latency: provider.latency,
                    successRate: provider.successRate,
                    isDefault: provider.isDefault,
                    capabilities: caps,
                    capabilityChips: capabilityChips(provider, caps),
                    bestFor: resolveBestFor(provider, caps),
                    strengths: provider.strengths || ""
                });
            }
        }
        return entries;
    }, [providers]);

    const filtered = useMemo(() => {
        const q = searchQuery.trim().toLowerCase();
        return modelEntries.filter(e => {
            if (activeOnly && !e.isActive) return false;
            if (!q) return true;
            return e.model.toLowerCase().includes(q) || e.providerName.toLowerCase().includes(q) || e.shortName.toLowerCase().includes(q) || e.bestFor.toLowerCase().includes(q);
        });
    }, [modelEntries, searchQuery, activeOnly]);

    const activeCount = modelEntries.filter(e => e.isActive).length;
    const configuredCount = modelEntries.length;
    const healthyProviders = providers.filter(p => p.healthStatus === "HEALTHY").length;

    const stats = [
        { label: "Configured Models", value: configuredCount, icon: Boxes, color: "text-primary" },
        { label: "Active Models", value: activeCount, icon: CheckCircle2, color: "text-emerald-400" },
        { label: "Inactive Models", value: configuredCount - activeCount, icon: PowerOff, color: "text-muted-foreground" },
        { label: "Healthy Providers", value: providers.length ? `${healthyProviders}/${providers.length}` : "0", icon: Activity, color: "text-emerald-400" }
    ];

    const handleTestConnection = async (providerId) => {
        if (!providerId || testingId) return;
        setTestingId(providerId);
        try {
            const res = await testProviderConnectionAction({ id: providerId, workspaceId });
            if (res.success) {
                toast.success(res.isHealthy ? "Connection healthy" : "Connection re-checked");
            } else {
                toast.error(res.error || "Connection test failed");
            }
        } catch (err) {
            toast.error(err.message || "Connection test failed");
        } finally {
            setTestingId(null);
            await fetchProviders();
        }
    };

    const handleRefreshAll = async () => {
        if (providers.length === 0 || refreshingAll) return;
        setRefreshingAll(true);
        try {
            for (const provider of providers) {
                await testProviderConnectionAction({ id: provider.id, workspaceId });
            }
            toast.success(`Checked ${providers.length} provider connections`);
        } catch (err) {
            toast.error(err.message || "Failed to refresh connections");
        } finally {
            setRefreshingAll(false);
            await fetchProviders();
        }
    };

    const handleToggleModel = async (providerId, model, currentActive) => {
        const newActive = !currentActive;
        try {
            if (newActive) {
                const provider = providers.find(p => p.id === providerId);
                if (provider && !provider.isActive) {
                    await toggleProviderStatusAction({ id: providerId, isActive: true, workspaceId });
                }
            }
            const res = await setModelActiveAction({ id: providerId, model, isActive: newActive, workspaceId });
            if (res.success) {
                toast.success(newActive ? "Model enabled" : "Model disabled");
                if (res.data) {
                    setProviders(prev => prev.map(p => p.id === providerId ? { ...p, isActive: res.data.isActive, metadata: res.data.metadata } : p));
                }
            } else {
                toast.error(res.error || "Failed to update model");
            }
        } catch (err) {
            toast.error(err.message || "Failed to update model");
        }
    };

    const handleToggleAll = async (activate) => {
        if (providers.length === 0 || bulkToggling) return;
        setBulkToggling(true);
        try {
            const res = await setAllProvidersActiveAction({ workspaceId, isActive: activate });
            if (res.success) {
                toast.success(
                    activate
                        ? `Activated ${res.data.providerCount} providers / ${res.data.count} models`
                        : `Deactivated ${res.data.providerCount} providers / ${res.data.count} models`
                );
                await fetchProviders();
            } else {
                toast.error(res.error || "Failed to update all providers");
            }
        } catch (err) {
            toast.error(err.message || "Failed to update all providers");
        } finally {
            setBulkToggling(false);
        }
    };

    return (
        <TooltipProvider delayDuration={200}>
            <div className="space-y-6 pb-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl border border-border/50 bg-card/40 backdrop-blur-md">
                <div>
                    <h2 className="text-base font-bold flex items-center gap-2">
                        <BrainCircuit className="w-5 h-5 text-primary" /> Models & LLMs
                    </h2>
                    <p className="text-xs text-muted-foreground mt-0.5">
                        Every configured model across your connected providers. Active models are ready to receive routed traffic.
                    </p>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                    <div className="flex items-center gap-2 bg-secondary/30 px-3 py-1.5 rounded-lg border border-border/40">
                        <span className="text-xs font-semibold text-muted-foreground">Active Only</span>
                        <Switch checked={activeOnly} onCheckedChange={setActiveOnly} className="scale-90" />
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Button size="sm" variant="outline" disabled={bulkToggling || providers.length === 0} onClick={() => handleToggleAll(true)} className="text-xs font-semibold gap-1.5 text-emerald-400">
                            {bulkToggling ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ToggleRight className="w-3.5 h-3.5" />}
                            Activate All
                        </Button>
                        <Button size="sm" variant="outline" disabled={bulkToggling || providers.length === 0} onClick={() => handleToggleAll(false)} className="text-xs font-semibold gap-1.5 text-muted-foreground">
                            {bulkToggling ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ToggleLeft className="w-3.5 h-3.5" />}
                            Deactivate All
                        </Button>
                    </div>
                    <Button size="sm" variant="outline" disabled={refreshingAll || providers.length === 0} onClick={handleRefreshAll} className="text-xs font-semibold gap-1.5">
                        {refreshingAll ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                        {refreshingAll ? "Checking..." : "Refresh All"}
                    </Button>
                    <div className="relative w-full sm:w-56">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Search models or providers..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 bg-secondary/30 border-border/40 text-xs h-8 rounded-lg"
                        />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {stats.map((s) => (
                    <Card key={s.label} className="border-border/40 bg-card/40">
                        <CardContent className="p-4 flex items-center gap-3">
                            <s.icon className={`w-8 h-8 ${s.color}`} />
                            <div>
                                <div className="text-xl font-black">{s.value}</div>
                                <div className="text-[11px] text-muted-foreground font-semibold">{s.label}</div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {loading ? (
                <div className="flex items-center justify-center p-8 text-xs text-muted-foreground gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-primary" /> Loading models...
                </div>
            ) : filtered.length === 0 ? (
                <div className="text-center p-10 text-xs text-muted-foreground">
                    {configuredCount === 0
                        ? "No provider connections yet. Add a provider API key in the Providers tab to start importing models."
                        : "No models match your current filters."}
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5">
                    {filtered.map((entry, idx) => {
                        const isTesting = testingId === entry.providerId;
                        return (
                            <Card key={`${entry.providerId}-${entry.model}-${idx}`} className={`border transition-all flex flex-col justify-between p-3 rounded-lg ${entry.isActive ? "border-primary/30 bg-card hover:border-primary/50" : "border bg-card opacity-90"}`}>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between gap-2">
                                        <Badge className={`text-[9px] font-mono px-1.5 py-0 border ${entry.isActive ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/20" : "bg-secondary text-muted-foreground border-border/40"}`}>
                                            {entry.isActive ? "● Active" : "○ Inactive"}
                                        </Badge>
                                        <span className={`text-[9px] font-mono ${entry.healthStatus === "HEALTHY" ? "text-emerald-400" : entry.healthStatus === "ERROR" ? "text-red-400" : "text-muted-foreground"}`}>
                                            {entry.healthStatus}{entry.latency ? ` • ${entry.latency}` : ""}
                                        </span>
                                    </div>

                                    <div className="min-w-0">
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <div className="font-mono text-xs font-bold text-foreground leading-snug break-words cursor-default">
                                                    {entry.shortName}
                                                </div>
                                            </TooltipTrigger>
                                            <TooltipContent side="top">{entry.model}</TooltipContent>
                                        </Tooltip>
                                        <div className="text-[10px] text-muted-foreground font-mono truncate mt-0.5">
                                            {entry.provider} / {entry.providerLabel || entry.providerName}
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-1.5 pt-0.5">
                                        <Target className="w-3 h-3 text-primary mt-0.5 shrink-0" />
                                        <p className="text-[10px] text-muted-foreground leading-snug">
                                            <span className="text-foreground font-semibold">Best for:&nbsp;</span>
                                            {entry.bestFor}
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-1 flex-wrap pt-1">
                                        {entry.capabilityChips.map(cap => (
                                            <Badge key={cap} variant="outline" className="text-[8px] font-mono px-1.5 py-0 text-primary border-primary/20 bg-primary/5">
                                                {cap}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>

                                <div className="pt-2 mt-2 border-t border-border/30 flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-1.5 min-w-0">
                                        <Switch
                                            checked={entry.isActive}
                                            onCheckedChange={() => handleToggleModel(entry.providerId, entry.model, entry.isActive)}
                                            className="scale-75 shrink-0"
                                        />
                                        <Badge className="text-[8px] font-mono px-1.5 py-0 bg-primary/10 text-primary border border-primary/20 truncate max-w-[70%]">
                                            {entry.providerName}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center gap-1 shrink-0">
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button
                                                    size="icon-sm"
                                                    variant="ghost"
                                                    onClick={() => handleToggleModel(entry.providerId, entry.model, entry.isActive)}
                                                    className={`h-6 w-6 ${entry.isActive ? "text-emerald-400 hover:bg-emerald-500/10" : "text-muted-foreground hover:text-foreground"}`}
                                                >
                                                    <PowerOff className="w-3 h-3" />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent side="top">{entry.isActive ? "Disable model" : "Enable model"}</TooltipContent>
                                        </Tooltip>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button
                                                    size="icon-sm"
                                                    variant="ghost"
                                                    disabled={isTesting || refreshingAll}
                                                    onClick={() => handleTestConnection(entry.providerId)}
                                                    className="h-6 w-6 text-muted-foreground hover:text-primary"
                                                >
                                                    {isTesting ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent side="top">Test connection</TooltipContent>
                                        </Tooltip>
                                    </div>
                                </div>
                            </Card>
                        );
                    })}
                </div>
            )}
            </div>
        </TooltipProvider>
    );
}