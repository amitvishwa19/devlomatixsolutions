'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
    Key, 
    Link as LinkIcon, 
    ShieldCheck, 
    Zap, 
    Globe, 
    Info, 
    Check, 
    RefreshCw, 
    Activity, 
    Workflow, 
    Star, 
    Cpu, 
    BrainCircuit, 
    Sparkles, 
    MoreVertical, 
    Settings2, 
    Trash2, 
    StarIcon,
    Copy,
    ZapOff,
    Plus
} from 'lucide-react';
import { toast } from 'sonner';
import axios from '@/utils/axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

import { useModal } from '@/hooks/useModal';
import { useAction } from '@/hooks/use-action';
import { getAgentModels } from '../_actions/get-agent-models';
import { deleteAgentModel } from '../_actions/delete-agent-model';
import { updateAgentModel } from '../_actions/update-agent-model';
import { testAgentModelConnection } from '../_actions/test-agent-model-connection';

export const ModelMissionControl = ({ workspaceId, userId }) => {
    const { onOpen } = useModal();

    const [strategy, setStrategy] = useState('sequential');
    const [models, setModels] = useState([]);
    const [activeHandshakes, setActiveHandshakes] = useState(new Set());
    const [isRefreshingAll, setIsRefreshingAll] = useState(false);

    const { execute: fetchModels, isLoading: isFetching } = useAction(getAgentModels, {
        onSuccess: (data) => {
            setModels(data.models);
        },
        onError: (error) => {
            console.error("Fetch error:", error);
            toast.error("Failed to sync with model cluster");
        }
    });

    useEffect(() => {
        if (workspaceId) {
            fetchModels({ workspaceId });
        }
    }, [workspaceId]);

    const { execute: updateModel } = useAction(updateAgentModel, {
        onSuccess: () => {
            fetchModels({ workspaceId });
            toast.success("Primary gateway updated", { id: 'update-model' });
        },
        onError: (error) => toast.error(error, { id: 'update-model' })
    });

    const { execute: deleteModel } = useAction(deleteAgentModel, {
        onSuccess: () => {
            fetchModels({ workspaceId });
            toast.success("Model removed from cluster", { id: 'delete-model' });
        },
        onError: (error) => toast.error(error, { id: 'delete-model' })
    });

    const handleTestHandshake = async (model) => {
        if (activeHandshakes.has(model.id)) return;

        setActiveHandshakes(prev => new Set(prev).add(model.id));
        toast.loading(`Testing handshake for ${model.name}...`, { id: `handshake-${model.id}` });
        
        try {
            const result = await testAgentModelConnection({
                id: model.id,
                provider: model.provider,
                name: model.name,
                apiKey: model.apiKey,
                baseUrl: model.baseUrl
            });

            if (result.error) {
                toast.error(result.error, { id: `handshake-${model.id}` });
            } else {
                toast.success(result.data.message, { id: `handshake-${model.id}` });
                fetchModels({ workspaceId });
            }
        } catch (err) {
            toast.error("Handshake failed unexpectedly", { id: `handshake-${model.id}` });
        } finally {
            setActiveHandshakes(prev => {
                const next = new Set(prev);
                next.delete(model.id);
                return next;
            });
        }
    };

    const handleRefreshAll = async () => {
        if (isRefreshingAll || models.length === 0) return;
        
        setIsRefreshingAll(true);
        toast.loading("Initiating global cluster handshake...", { id: 'bulk-handshake' });

        const promises = models.map(m => handleTestHandshake(m));
        
        await Promise.allSettled(promises);
        
        setIsRefreshingAll(false);
        toast.success("Global cluster handshake complete", { id: 'bulk-handshake' });
        fetchModels({ workspaceId });
    };

    const handleSetDefault = (id) => {
        toast.loading("Setting primary gateway...", { id: 'update-model' });
        updateModel({ id, workspaceId, isDefault: true });
    };

    const handleDelete = (id) => {
        toast.loading("Removing model node from cluster...", { id: 'delete-model' });
        deleteModel({ id });
    };

    return (
        <TooltipProvider>
            <div className="space-y-8 animate-fade-in">
                {/* Compact Internal Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-6">
                    <div>
                        <div className="flex items-center gap-2">
                            <h2 className="text-sm font-bold tracking-[0.2em] text-muted-foreground uppercase">Cluster Nodes</h2>
                            <Badge variant="outline" className="bg-indigo-500/10 text-indigo-500 border-indigo-500/20 px-2 py-0 text-[10px] font-black">{models.length} Operational</Badge>
                        </div>
                        <p className="text-[10px] text-muted-foreground font-bold opacity-40 mt-1 flex items-center gap-2 uppercase tracking-wide">
                            <Workflow className="w-3 h-3 text-indigo-400" /> Infrastructure orchestration & heartbeat monitoring
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleRefreshAll}
                            disabled={isFetching || isRefreshingAll}
                            className="h-9 px-3 rounded-lg border border-border/40 hover:bg-white/5 gap-2 text-xs font-bold"
                        >
                            <RefreshCw className={`w-3.5 h-3.5 ${isFetching || isRefreshingAll ? 'animate-spin' : ''}`} />
                            Sync Cluster
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => onOpen('addAgentModel', {
                                workspaceId,
                                userId,
                                onApply: () => fetchModels({ workspaceId })
                            })}
                            className="h-9 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white border-none text-xs font-bold shadow-lg shadow-indigo-600/20 flex items-center gap-2"
                        >
                            <Plus className="w-3.5 h-3.5" />
                            Deploy Node
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Cluster Intelligence Panel */}
                    <div className="lg:col-span-8 space-y-4">
                        <div className="grid grid-cols-1 gap-4">
                            <AnimatePresence mode="popLayout">
                                {models.length > 0 ? (
                                    models.map((model) => {
                                        const p = model.provider?.toLowerCase();
                                        return (
                                            <motion.div
                                                key={model.id}
                                                layout
                                                initial={{ opacity: 0, scale: 0.98 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                className={`relative group rounded-xl border transition-all duration-300 ${model.isDefault
                                                    ? 'border-indigo-500/30 bg-indigo-500/3'
                                                    : 'border-white/5 bg-white/[0.02] hover:border-white/10'
                                                    } backdrop-blur-xl overflow-hidden`}
                                            >
                                                <div className="p-4 flex items-center gap-4 relative z-10">
                                                    {/* Compact Icon */}
                                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center border transition-all ${model.isDefault ? 'bg-indigo-500/10 border-indigo-500/30' : 'bg-white/[0.03] border-white/[0.08]'}`}>
                                                        {(() => {
                                                            if (p === 'openai') return <Cpu className="w-4 h-4 text-emerald-400" />;
                                                            if (p === 'anthropic') return <BrainCircuit className="w-4 h-4 text-orange-400" />;
                                                            if (p === 'google') return <Globe className="w-4 h-4 text-blue-400" />;
                                                            if (p === 'openrouter') return <Zap className="w-4 h-4 text-indigo-300" />;
                                                            if (p === 'meta') return <ShieldCheck className="w-4 h-4 text-indigo-400" />;
                                                            if (p === 'mistral') return <Zap className="w-4 h-4 text-amber-400" />;
                                                            return <LinkIcon className="w-4 h-4 text-slate-400" />;
                                                        })()}
                                                    </div>

                                                    <div className="min-w-0 flex-1">
                                                        <div className="flex items-center gap-2 mb-0.5">
                                                            <h3 className="font-bold text-sm text-foreground/90 truncate tracking-tight">{model.name.split('/').pop()}</h3>
                                                            {model.isDefault && (
                                                                <span className="text-[8px] font-black uppercase tracking-[0.2em] text-indigo-400 px-1.5 py-0.5 bg-indigo-500/10 rounded-sm border border-indigo-500/20">Master</span>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center gap-3 text-[10px] font-bold text-muted-foreground/40">
                                                            <span className="flex items-center gap-1"><RefreshCw className="w-2.5 h-2.5" /> {model.latency}</span>
                                                            <span className="flex items-center gap-1"><ShieldCheck className="w-2.5 h-2.5" /> {model.successRate}</span>
                                                            <span className="flex items-center gap-1">
                                                                <div className={`w-1 h-1 rounded-full ${model.healthStatus === 'Excellent' ? 'bg-emerald-500' : 'bg-rose-500 animate-pulse'}`} />
                                                                {model.healthStatus}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {/* Actions */}
                                                    <div className="flex items-center gap-1 scale-90 sm:scale-100">
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    onClick={() => handleSetDefault(model.id)}
                                                                    className={`h-8 w-8 rounded-lg hover:text-indigo-500 transition-all ${model.isDefault ? 'text-indigo-500' : 'text-muted-foreground/40'}`}
                                                                >
                                                                    <StarIcon className={`h-3.5 w-3.5 ${model.isDefault ? 'fill-current' : ''}`} />
                                                                </Button>
                                                            </TooltipTrigger>
                                                            <TooltipContent side="top">Set as Master Node</TooltipContent>
                                                        </Tooltip>

                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    onClick={() => handleTestHandshake(model)}
                                                                    disabled={activeHandshakes.has(model.id)}
                                                                    className="h-8 w-8 rounded-lg hover:text-indigo-500 transition-all text-muted-foreground/40"
                                                                >
                                                                    <RefreshCw className={`h-3.5 w-3.5 ${activeHandshakes.has(model.id) ? 'animate-spin text-indigo-500' : ''}`} />
                                                                </Button>
                                                            </TooltipTrigger>
                                                            <TooltipContent side="top">Heartbeat Handshake</TooltipContent>
                                                        </Tooltip>

                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-white/5 text-muted-foreground/40">
                                                                    <MoreVertical className="h-3.5 w-3.5" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end" className="w-56 p-2 rounded-xl border-white/5 bg-[#0a0a0a]/90 backdrop-blur-2xl">
                                                                <DropdownMenuItem
                                                                    onClick={() => onOpen('addAgentModel', {
                                                                        model,
                                                                        workspaceId,
                                                                        userId,
                                                                        onApply: () => fetchModels({ workspaceId })
                                                                    })}
                                                                    className="flex items-center gap-3 py-2 px-3 rounded-lg cursor-pointer focus:bg-indigo-500/10 focus:text-indigo-400"
                                                                >
                                                                    <Settings2 className="h-4 w-4" />
                                                                    <span className="font-bold text-xs uppercase tracking-widest">Node Config</span>
                                                                </DropdownMenuItem>
                                                                <DropdownMenuSeparator className="bg-white/[0.05] my-1" />
                                                                <DropdownMenuItem
                                                                    onClick={() => handleDelete(model.id)}
                                                                    className="flex items-center gap-3 py-2 px-3 rounded-lg cursor-pointer focus:bg-rose-500/10 text-rose-500/60 focus:text-rose-500"
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                    <span className="font-bold text-xs uppercase tracking-widest">Decommission</span>
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        );
                                    })
                                ) : (
                                    <div className="flex flex-col items-center justify-center p-12 border border-dashed border-white/5 rounded-2xl bg-white/[0.01] text-center space-y-4">
                                        <ZapOff className="w-8 h-8 text-muted-foreground/20" />
                                        <div className="space-y-1">
                                            <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground/60">Cluster Offline</h3>
                                            <p className="text-[10px] text-muted-foreground/40 max-w-[240px] leading-relaxed">No infrastructure nodes detected. Deploy a model to begin swarm orchestration.</p>
                                        </div>
                                    </div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Side Configuration */}
                    <div className="lg:col-span-4 space-y-6">
                        <Card className="border-white/5 bg-white/[0.02] rounded-2xl overflow-hidden shadow-2xl">
                            <CardHeader className="border-b border-white/5 pb-4">
                                <CardTitle className="text-xs font-bold tracking-[0.2em] uppercase flex items-center gap-2 text-muted-foreground">
                                    <Activity className="w-4 h-4 text-indigo-500" /> Resilience
                                </CardTitle>
                                <CardDescription className="text-[9px] uppercase tracking-widest font-black opacity-30">Cluster failover logic</CardDescription>
                            </CardHeader>
                            <CardContent className="p-4 space-y-6">
                                <div className="space-y-3">
                                    {[
                                        { id: 'primary', label: 'Single Gateway', icon: ShieldCheck, color: 'text-slate-500' },
                                        { id: 'sequential', label: 'Smart Fallback', icon: Workflow, color: 'text-indigo-400' },
                                        { id: 'parallel', label: 'Global Blast', icon: Zap, color: 'text-amber-400' }
                                    ].map((s) => (
                                        <button
                                            key={s.id}
                                            onClick={() => setStrategy(s.id)}
                                            className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all ${strategy === s.id ? 'border-indigo-500/40 bg-indigo-500/10 text-indigo-400' : 'border-white/5 bg-white/[0.01] hover:bg-white/[0.03] opacity-60'}`}
                                        >
                                            <s.icon className="w-3.5 h-3.5" />
                                            <span className="text-[10px] font-black uppercase tracking-widest leading-none">{s.label}</span>
                                        </button>
                                    ))}
                                </div>

                                <div className="space-y-2 pt-4 border-t border-white/5">
                                    <label className="text-[9px] font-black text-muted-foreground/30 uppercase tracking-widest flex items-center gap-2">
                                        <Globe className="w-3 h-3 text-emerald-500/40" /> Gateway Endpoint
                                    </label>
                                    <div className="relative group">
                                        <input
                                            readOnly
                                            value="https://dev.devlomatix.com/api/gw/v1/..."
                                            className="w-full bg-black/60 border border-white/5 rounded-xl py-2 px-3 text-[9px] font-mono text-muted-foreground/40 outline-none"
                                        />
                                        <button 
                                            onClick={() => {
                                                navigator.clipboard.writeText("https://dev.devlomatix.com/api/gw/v1/webhook");
                                                toast.success("Webhook URL copied");
                                            }}
                                            className="absolute inset-y-0 right-2 flex items-center text-muted-foreground/20 hover:text-white transition-colors"
                                        >
                                            <Copy className="w-3 h-3" />
                                        </button>
                                    </div>
                                </div>

                                <Button
                                    className="w-full h-10 bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase tracking-[0.2em] text-[10px] rounded-xl shadow-lg shadow-indigo-600/20 border-t border-white/10"
                                    onClick={() => toast.success("Cluster orchestration committed")}
                                >
                                    Commit Strategy
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </TooltipProvider>
    );
};
