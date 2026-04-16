'use client';

import React, { useState, useEffect, use } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
    Key,
    Link as LinkIcon,
    ShieldCheck,
    ShieldAlert,
    Copy,
    Zap,
    Globe,
    Info,
    Check,
    AlertCircle,
    Loader2,
    ArrowLeft,
    RefreshCw,
    Lock,
    Database,
    Activity,
    LayoutDashboard,
    ZapOff,
    Workflow,
    Star,
    Tag,
    Cpu,
    BrainCircuit,
    Sparkles,
    TrendingUp,
    MoreVertical,
    Settings2,
    Edit,
    Trash2,
    StarIcon
} from 'lucide-react';
import { toast } from 'sonner';
import axios from '@/utils/axios';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession } from 'next-auth/react';
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

// Restored Universal Credentials
import { useModal } from '@/hooks/useModal';
import { AddAgentModelModal } from '../_components/AddAgentModelModal';
import { useAction } from '@/hooks/use-action';
import { getAgentModels } from '../_actions/get-agent-models';
import { deleteAgentModel } from '../_actions/delete-agent-model';
import { updateAgentModel } from '../_actions/update-agent-model';
import { testAgentModelConnection } from '../_actions/test-agent-model-connection';

const MOCK_MODELS = [
    {
        id: 'MOD-1',
        name: 'GPT-4o (Omni)',
        provider: 'OpenAI',
        healthStatus: 'Excellent',
        latency: '120ms',
        successRate: '99.9%',
        capability: 'Vision, 128k Context',
        bestFor: 'Multimodal Orchestration',
        isDefault: true,
        apiKey: '••••••••••••••••'
    },
    {
        id: 'MOD-2',
        name: 'Claude 3.5 Sonnet',
        provider: 'Anthropic',
        healthStatus: 'Excellent',
        latency: '185ms',
        successRate: '99.8%',
        capability: '200k Context, Analysis',
        bestFor: 'Creative Reasoning',
        isDefault: false,
        apiKey: '••••••••••••••••'
    },
    {
        id: 'MOD-3',
        name: 'DeepSeek-V3',
        provider: 'OpenRouter',
        healthStatus: 'Excellent',
        latency: '1.2s',
        successRate: '99.5%',
        capability: 'Coding, 64k Context',
        bestFor: 'Technical Architecture',
        isDefault: false,
        apiKey: '••••••••••••••••'
    }
];

export default function AgentCredentials({ params: paramsPromise }) {
    const params = use(paramsPromise);
    const workspaceId = params?.workspaceId;
    const { onOpen } = useModal();

    const [loading, setLoading] = useState(false);
    const [strategy, setStrategy] = useState('sequential'); // 'primary', 'sequential', 'parallel'
    const [models, setModels] = useState([]);
    const [activeHandshakes, setActiveHandshakes] = useState(new Set());
    const [isRefreshingAll, setIsRefreshingAll] = useState(false);

    const { data: session } = useSession();
    const userId = session?.user?.userId;

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

    const { execute: runHandshake } = useAction(testAgentModelConnection, {
        onSuccess: (data) => {
            fetchModels({ workspaceId });
        },
        onError: (error) => {
            toast.error(error, { id: 'handshake' });
            fetchModels({ workspaceId });
        }
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
            <div className="p-8 space-y-8 animate-fade-in duration-300  bg-linear-to-br from-background via-background/95 to-indigo-500/5">
                {/* Mission Control Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-5">
                        <Link href={`/workspace/${workspaceId}/agent`}>
                            <Button variant="ghost" size="icon" className="rounded-lg border hover:bg-card hover:scale-105 transition-all">
                                <ArrowLeft className="w-8 h-8 text-primary" />
                            </Button>
                        </Link>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-xl  text-primary">Mission Control</h1>
                                <Badge variant="outline" className="bg-indigo-500/10 text-indigo-500 border-indigo-500/20 px-2 py-0 text-xs font-bold">Active</Badge>
                            </div>
                            <p className="text-xs text-muted-foreground font-bold opacity-60 flex items-center gap-2">
                                <Workflow className="w-3 h-3 text-indigo-400" /> Intelligent Agent Connectivity & Fallback Cluster
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleRefreshAll}
                            disabled={isFetching || isRefreshingAll}
                            className="rounded-xl border border-border/40 hover:bg-card"
                        >
                            <RefreshCw className={`w-4 h-4 text-muted-foreground ${isFetching || isRefreshingAll ? 'animate-spin' : ''}`} />
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => onOpen('addAgentModel', {
                                workspaceId,
                                userId,
                                onApply: (newModel) => fetchModels({ workspaceId })
                            })}
                            className="rounded-md border-border/40 font-bold bg-card shadow-sm hover:shadow-indigo-500/10 transition-all text-xs h-10 px-5 gap-2 group"
                        >
                            <Sparkles className="w-4 h-4 text-primary group-hover:rotate-12 transition-transform" />
                            Deploy New Model
                        </Button>
                        <Button variant="ghost" size="icon" className="rounded-xl border border-border/40 hover:bg-card">
                            <Settings2 className="w-4 h-4 text-muted-foreground" />
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Cluster Intelligence Panel */}
                    <div className="lg:col-span-8 space-y-6">
                        <div className="flex items-center justify-between mb-2 px-1">
                            <div className="flex items-center gap-2">
                                <BrainCircuit className="w-4 h-4 text-indigo-500" />
                                <h2 className="text-sm font-bold tracking-widest text-muted-foreground">Active Model Cluster</h2>
                            </div>
                            <span className="text-xs font-bold text-muted-foreground opacity-50 ">
                                {models.length} Nodes Connected
                            </span>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            <AnimatePresence mode="popLayout">
                                {models.length > 0 ? (
                                    models.map((model) => {
                                        const p = model.provider?.toLowerCase();
                                        const glowColor =
                                            p === 'openai' ? 'rgba(16,185,129,0.15)' :
                                                p === 'anthropic' ? 'rgba(249,115,22,0.15)' :
                                                    p === 'google' ? 'rgba(59,130,246,0.15)' :
                                                        p === 'openrouter' ? 'rgba(129,140,248,0.15)' :
                                                            p === 'mistral' ? 'rgba(245,158,11,0.15)' :
                                                                'rgba(99,102,241,0.15)';

                                        return (
                                            <motion.div
                                                key={model.id}
                                                layout
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                whileHover={{ y: -1, backgroundColor: 'rgba(255,255,255,0.03)' }}
                                                exit={{ opacity: 0, scale: 0.98 }}
                                                className={`relative group rounded-xl border transition-all duration-500 ${model.isDefault
                                                    ? 'border-indigo-500/50 bg-indigo-500/3 shadow-[0_0_25px_rgba(99,102,241,0.08)]'
                                                    : 'border-white/6 bg-white/1 hover:border-white/12'
                                                    } backdrop-blur-xl overflow-hidden`}
                                            >
                                                {/* Subtle Mesh Background for Primary */}
                                                {model.isDefault && (
                                                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,rgba(99,102,241,0.1),transparent_70%)] pointer-events-none" />
                                                )}

                                                <div className="p-3 pr-4 flex items-center gap-4 relative z-10">
                                                    {/* compact Icon with Aura */}
                                                    <div className="shrink-0 relative">
                                                        <div
                                                            className="absolute inset-0 rounded-full blur-[14px] opacity-40 transition-opacity group-hover:opacity-70"
                                                            style={{ backgroundColor: glowColor }}
                                                        />
                                                        <div className={`w-11 h-11 rounded-lg flex items-center justify-center border transition-all duration-500 relative z-10 ${model.isDefault ? 'bg-indigo-500/10 border-indigo-500/30' : 'bg-white/[0.03] border-white/[0.08] group-hover:border-white/[0.15]'
                                                            }`}>
                                                            {(() => {
                                                                if (p === 'openai') return <Cpu className="w-5 h-5 text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.4)]" />;
                                                                if (p === 'anthropic') return <BrainCircuit className="w-5 h-5 text-orange-400 drop-shadow-[0_0_8px_rgba(249,115,22,0.4)]" />;
                                                                if (p === 'google') return <Globe className="w-5 h-5 text-blue-400 drop-shadow-[0_0_8px_rgba(59,130,246,0.4)]" />;
                                                                if (p === 'openrouter') return <Zap className="w-5 h-5 text-indigo-300 drop-shadow-[0_0_8px_rgba(129,140,248,0.4)]" />;
                                                                if (p === 'meta') return <ShieldCheck className="w-5 h-5 text-indigo-400 drop-shadow-[0_0_8px_rgba(99,102,241,0.4)]" />;
                                                                if (p === 'mistral') return <Zap className="w-5 h-5 text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.4)]" />;
                                                                return <LinkIcon className="w-5 h-5 text-slate-400" />;
                                                            })()}
                                                        </div>
                                                        {model.isDefault && (
                                                            <div className="absolute -top-1 -right-1 z-20">
                                                                <div className="w-3.5 h-3.5 bg-indigo-500 rounded-full border-2 border-[#0a0a0a] flex items-center justify-center shadow-[0_0_10px_rgba(99,102,241,0.5)]">
                                                                    <Star className="w-2 h-2 text-white fill-white" />
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Refined Model Info */}
                                                    <div className="min-w-0 max-w-[240px]">
                                                        <div className="flex items-center gap-2 mb-0.5">

                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <h3 className="font-bold text-sm text-foreground/90 group-hover:text-foreground transition-colors truncate tracking-tight cursor-help">{model.name.split('/').pop()}</h3>
                                                                </TooltipTrigger>
                                                                <TooltipContent className="bg-[#0a0a0a] border-white/5 text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400">
                                                                    Provider: {model.provider}
                                                                </TooltipContent>
                                                            </Tooltip>


                                                            {model.isDefault && (
                                                                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-indigo-400 px-1.5 py-0.5 bg-indigo-500/10 rounded-sm border border-indigo-500/20 shadow-[0_0_10px_rgba(99,102,241,0.1)]">Master</span>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground/40  truncate">
                                                            <span className="truncate text-white/20">{model.capability.split(',')[0]}</span>
                                                        </div>
                                                    </div>

                                                    {/* Telemetry Bar (Desktop) */}
                                                    <div className="hidden lg:flex items-center gap-8 ml-4 px-8 border-x border-white/[0.04]">
                                                        <div className="flex flex-col gap-0.5">
                                                            <span className="text-[9px] font-bold text-muted-foreground/20 uppercase tracking-[0.2em]">Latent</span>
                                                            <span className="text-xs font-mono font-bold tabular-nums text-foreground/60 group-hover:text-foreground/80 transition-colors">{model.latency}</span>
                                                        </div>
                                                        <div className="flex flex-col gap-0.5">
                                                            <span className="text-[9px] font-bold text-muted-foreground/20 uppercase tracking-[0.2em]">Efficiency</span>
                                                            <span className="text-xs font-mono font-bold tabular-nums text-emerald-400/70 group-hover:text-emerald-400 transition-colors">{model.successRate}</span>
                                                        </div>
                                                        <div className="flex flex-col gap-0.5">
                                                            <span className="text-[9px] font-bold text-muted-foreground/20 uppercase tracking-[0.2em]">Heartbeat</span>
                                                            <div className="flex items-center gap-1.5">
                                                                <motion.span
                                                                    animate={model.healthStatus === 'Excellent' ? { scale: [1, 1.2, 1], opacity: [1, 0.7, 1] } : {}}
                                                                    transition={{ repeat: Infinity, duration: 2 }}
                                                                    className={`w-1.5 h-1.5 rounded-full ${model.healthStatus === 'Excellent' ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.7)]' :
                                                                        model.healthStatus === 'UNTESTED' ? 'bg-slate-500' :
                                                                            model.healthStatus === 'Offline' ? 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.7)]' :
                                                                                'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.7)]'
                                                                        }`}
                                                                />
                                                                <span className="text-[10px] font-bold uppercase tracking-widest text-foreground/40 group-hover:text-foreground/60 transition-colors">{model.healthStatus}</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Actions Group */}
                                                    <div className="flex items-center gap-2 ml-auto shrink-0">

                                                        <Tooltip>                                                            <TooltipTrigger asChild>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleSetDefault(model.id)}
                                                                className="h-8 px-3 text-[10px] font-bold text-muted-foreground/40 hover:text-indigo-500  transition-all"
                                                            >
                                                                <StarIcon className={`h-3.5 w-3.5 ${model.isDefault ? 'text-primary fill-primary ' : ''}`} />
                                                            </Button>
                                                        </TooltipTrigger>
                                                            <TooltipContent className="bg-[#0a0a0a] border-white/5   text-indigo-400">
                                                                Make Default Gateway
                                                            </TooltipContent>
                                                        </Tooltip>



                                                        <div className="flex items-center gap-1">

                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        onClick={() => handleTestHandshake(model)}
                                                                        disabled={activeHandshakes.has(model.id)}
                                                                        className="h-8 w-8 rounded-lg  hover:text-indigo-500 transition-all text-muted-foreground/40"
                                                                    >
                                                                        {activeHandshakes.has(model.id) ? (
                                                                            <RefreshCw className="h-3.5 w-3.5 text-primary animate-spin" />
                                                                        ) : (
                                                                            <Activity className={`h-3.5 w-3.5 text-primary ${model.healthStatus === 'UNTESTED' ? 'text-slate-500' : ''}`} />
                                                                        )}
                                                                    </Button>
                                                                </TooltipTrigger>
                                                                <TooltipContent className="bg-[#0a0a0a] border-white/5  text-indigo-400">
                                                                    Handshake Ping
                                                                </TooltipContent>
                                                            </Tooltip>


                                                            <DropdownMenu>
                                                                <DropdownMenuTrigger asChild>
                                                                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-white/5 transition-all text-muted-foreground/40">
                                                                        <MoreVertical className="h-3.5 w-3.5" />
                                                                    </Button>
                                                                </DropdownMenuTrigger>
                                                                <DropdownMenuContent align="end" className="w-56 p-1.5 rounded-xl border-white/5 shadow-2xl backdrop-blur-2xl bg-black/80">
                                                                    <DropdownMenuItem
                                                                        onClick={() => onOpen('addAgentModel', {
                                                                            model,
                                                                            workspaceId,
                                                                            userId,
                                                                            onApply: () => fetchModels({ workspaceId })
                                                                        })}
                                                                        className="flex items-center gap-2.5 py-2 px-3 rounded-lg cursor-pointer focus:bg-indigo-500/10 focus:text-indigo-400 transition-colors"
                                                                    >
                                                                        <Settings2 className="h-4 w-4 opacity-50" />
                                                                        <span className="font-bold text-xs">Node Configuration</span>
                                                                    </DropdownMenuItem>

                                                                    <DropdownMenuSeparator className="bg-white/[0.05] my-1" />

                                                                    <DropdownMenuItem
                                                                        onClick={() => handleDelete(model.id)}
                                                                        className="flex items-center gap-2.5 py-2 px-3 rounded-lg cursor-pointer focus:bg-rose-500/10 text-rose-500/60 focus:text-rose-500 transition-colors"
                                                                    >
                                                                        <Trash2 className="h-4 w-4 opacity-50" />
                                                                        <span className="font-bold text-xs">Decommission Node</span>
                                                                    </DropdownMenuItem>
                                                                </DropdownMenuContent>
                                                            </DropdownMenu>
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        );
                                    })
                                ) : (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="flex flex-col items-center justify-center p-12 border border-dashed border-border/60 rounded-xl bg-card/20 backdrop-blur-sm text-center space-y-4"
                                    >
                                        <div className="p-4 bg-indigo-500/5 rounded-full border border-indigo-500/10">
                                            <ZapOff className="w-8 h-8 text-indigo-500/40" />
                                        </div>
                                        <div className="space-y-1">
                                            <h3 className="text-lg font-bold text-foreground">No models deployed</h3>
                                            <p className="text-xs text-muted-foreground max-w-[300px] leading-relaxed">
                                                Your model cluster is currently offline. Deploy your first AI node to start orchestrating intelligent agents.
                                            </p>
                                        </div>
                                        <Button
                                            variant="outline"
                                            onClick={() => onOpen('addAgentModel', {
                                                workspaceId,
                                                userId: user?.id,
                                                onApply: (newModel) => fetchModels({ workspaceId })
                                            })}
                                            className="rounded-md border-border/40 font-bold bg-background shadow-md hover:shadow-indigo-500/10 transition-all text-xs h-10 px-6 gap-2 group"
                                        >
                                            <Sparkles className="w-4 h-4 text-primary group-hover:rotate-12 transition-transform" />
                                            Deploy Model
                                        </Button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Strategy Config Panel */}
                    <div className="lg:col-span-4 space-y-6">
                        <Card className="border-white/[0.05] bg-[#0a0a0a]/60 backdrop-blur-2xl rounded-2xl overflow-hidden shadow-2xl transition-all duration-500 hover:border-white/[0.1] group/sidebar">
                            <CardHeader className="border-b border-white/[0.03] pb-6 bg-white/[0.01]">
                                <CardTitle className="text-sm font-bold tracking-widest flex items-center gap-2 text-foreground/90 group-hover/sidebar:text-foreground transition-colors">
                                    <Activity className="w-4 h-4 text-indigo-500 drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]" /> Fallback Strategy
                                </CardTitle>
                                <CardDescription className="text-[10px] font-bold uppercase tracking-widest opacity-40">Configure cluster resilience & failover behavior</CardDescription>
                            </CardHeader>

                            <CardContent className="p-5 space-y-8">
                                {/* Strategy Toggles */}
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-muted-foreground/30 uppercase tracking-[0.2em] flex items-center gap-2 ml-1">
                                        Execution Mode
                                    </label>
                                    <div className="grid grid-cols-1 gap-3">
                                        {[
                                            { id: 'primary', label: 'Single Gateway', desc: 'Only use the primary model. Hard fail on error.', icon: ShieldCheck, color: 'text-slate-400', bg: 'bg-white/[0.03]' },
                                            { id: 'sequential', label: 'Intelligent Fallback', desc: 'Try primary, then fallback sequentially.', icon: Workflow, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
                                            { id: 'parallel', label: 'Parallel Blast', desc: 'Call all cluster nodes. First success wins.', icon: Zap, color: 'text-amber-400', bg: 'bg-amber-500/10' }
                                        ].map((s) => (
                                            <button
                                                key={s.id}
                                                onClick={() => setStrategy(s.id)}
                                                className={`flex items-start gap-4 p-4 rounded-xl border text-left transition-all duration-300 group/btn ${strategy === s.id
                                                    ? 'border-indigo-500/40 bg-indigo-500/5 ring-1 ring-indigo-500/10 shadow-[0_0_20px_rgba(99,102,241,0.05)]'
                                                    : 'border-white/[0.04] bg-white/[0.01] hover:bg-white/[0.03] hover:border-white/[0.08]'
                                                    }`}
                                            >
                                                <div className={`mt-0.5 p-2 rounded-lg transition-all duration-500 ${strategy === s.id ? 'bg-indigo-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.4)]' : `${s.bg} ${s.color} opacity-60 group-hover/btn:opacity-100`}`}>
                                                    <s.icon className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <p className={`text-xs font-bold mb-1 transition-colors ${strategy === s.id ? 'text-indigo-400' : 'text-foreground/70'}`}>{s.label}</p>
                                                    <p className="text-[10px] font-bold text-muted-foreground/40 leading-relaxed uppercase tracking-wide group-hover/btn:text-muted-foreground/60 transition-colors">{s.desc}</p>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Gateway Webhook monitor */}
                                {/* Gateway Webhook monitor */}
                                <div className="space-y-4 pt-4 border-t border-white/[0.03]">
                                    <div className="flex items-center justify-between px-1">
                                        <label className="text-[10px] font-black text-muted-foreground/30 uppercase tracking-[0.2em] flex items-center gap-2">
                                            <Globe className="w-3 h-3 text-emerald-500/60" /> Gateway Webhook
                                        </label>
                                        <Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest border-emerald-500/20 text-emerald-500 bg-emerald-500/5 px-2 py-0.5">Encrypted</Badge>
                                    </div>
                                    <div className="relative group/webhook">
                                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                            <LinkIcon className="h-3 w-3 text-muted-foreground/40" />
                                        </div>
                                        <input
                                            readOnly
                                            value="https://dev.devlomatix.com/api/gw/v1/webho..."
                                            className="w-full bg-[#0a0a0a] border border-white/[0.05] rounded-xl py-2.5 pl-9 pr-10 text-[10px] font-mono font-bold text-muted-foreground/40 group-hover/webhook:border-white/[0.1] group-hover/webhook:text-indigo-500/40 transition-all outline-none"
                                        />
                                        <button
                                            onClick={() => {
                                                navigator.clipboard.writeText("https://dev.devlomatix.com/api/gw/v1/webhook");
                                                toast.success("Webhook URL copied", { id: 'webhook' });
                                            }}
                                            className="absolute inset-y-0 right-0 pr-3.5 flex items-center hover:text-indigo-400 transition-colors text-muted-foreground/40"
                                        >
                                            <Copy className="h-3 h-3" />
                                        </button>
                                    </div>
                                </div>

                                {/* Self-Healing Card */}
                                <div className="p-4 rounded-xl border border-amber-500/10 bg-[#120d05] space-y-2 relative overflow-hidden group/healing">
                                    <div className="absolute -right-4 -top-4 w-16 h-16 bg-amber-500/5 blur-2xl rounded-full" />
                                    <div className="flex items-center gap-2 mb-1">
                                        <Sparkles className="w-3.5 h-3.5 text-amber-500 drop-shadow-[0_0_5px_rgba(245,158,11,0.5)]" />
                                        <label className="text-[10px] font-black text-amber-500 uppercase tracking-[0.15em]">Self-Healing Active</label>
                                    </div>
                                    <p className="text-[10px] font-bold text-muted-foreground/40 leading-relaxed tracking-wide">
                                        Cluster intelligence is monitoring {models.length} nodes. Auto-optimization is currently suggesting <span className="text-amber-500/90 font-black">**GPT-4o**</span> based on 120ms latency.
                                    </p>
                                </div>

                                {/* Final Action */}
                                <div className="pt-2">
                                    <Button
                                        className="w-full h-12 bg-indigo-600 hover:bg-indigo-500 text-white font-bold uppercase tracking-[0.2em] text-[10px] rounded-xl shadow-[0_0_25px_rgba(99,102,241,0.3)] hover:shadow-[0_0_35px_rgba(99,102,241,0.4)] transition-all flex items-center justify-center gap-2 group/commit border-t border-white/10"
                                        onClick={() => toast.success("Mission Control Strategy committed", { id: 'commit' })}
                                    >
                                        <ShieldCheck className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                        Commit Strategy
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                <AddAgentModelModal />
            </div>
        </TooltipProvider>
    );
}