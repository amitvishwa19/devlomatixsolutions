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
    Trash2
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
        capability: 'Multimodal, Coding, Logic',
        bestFor: 'Complex Reasoning',
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
        capability: 'Writing, Analysis, Nuance',
        bestFor: 'Creative Content',
        isDefault: false,
        apiKey: '••••••••••••••••'
    },
    {
        id: 'MOD-3',
        name: 'Gemini 1.5 Pro',
        provider: 'Google',
        healthStatus: 'Degraded',
        latency: '450ms',
        successRate: '94.2%',
        capability: 'Huge Context, Multimedia',
        bestFor: 'Large Document Processing',
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

    const { execute: runHandshake, isLoading: isTesting } = useAction(testAgentModelConnection, {
        onSuccess: (data) => {
            toast.success(data.message, { id: 'handshake' });
            fetchModels({ workspaceId });
        },
        onError: (error) => {
            toast.error(error, { id: 'handshake' });
            fetchModels({ workspaceId });
        }
    });

    const handleTestHandshake = (model) => {
        toast.loading(`Testing handshake for ${model.name}...`, { id: 'handshake' });
        runHandshake({
            id: model.id,
            provider: model.provider,
            name: model.name,
            apiKey: model.apiKey,
            baseUrl: model.baseUrl
        });
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
                        <div className="flex items-center gap-2 mb-1">
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
                        onClick={() => fetchModels({ workspaceId })}
                        disabled={isFetching}
                        className="rounded-xl border border-border/40 hover:bg-card"
                    >
                        <RefreshCw className={`w-4 h-4 text-muted-foreground ${isFetching ? 'animate-spin' : ''}`} />
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
                                models.map((model) => (
                                    <motion.div
                                        key={model.id}
                                        layout
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        className={`relative group rounded-lg border transition-all duration-300 ${model.isDefault
                                            ? 'border-indigo-500/30 bg-indigo-500/3 shadow-lg shadow-indigo-500/5'
                                            : 'border-border/40 bg-card/40 hover:border-border/80'
                                            } backdrop-blur-sm overflow-hidden`}
                                    >
                                        {model.isDefault && (
                                            <div className="absolute top-0 right-0 p-3">
                                                <Badge className="bg-indigo-600 text-white border-none shadow-lg shadow-indigo-500/40 text-xs font-bold tracking-widest px-3 py-1">
                                                    <Star className="w-2.5 h-2.5 mr-1 fill-white" /> Primary Gateway
                                                </Badge>
                                            </div>
                                        )}

                                        <div className="p-2 flex flex-col md:flex-row gap-6 md:items-center">
                                            {/* Provider Icon / Branding */}
                                            <div className="shrink-0">
                                                <div className={`w-14 h-14 rounded-xl flex items-center justify-center border ${model.isDefault ? 'bg-indigo-500/10 border-indigo-500/20' : 'bg-muted/30 border-border/20'
                                                    }`}>
                                                    <Cpu className="w-6 h-6 text-emerald-500" />
                                                </div>
                                            </div>

                                            {/* Model Info */}
                                            <div className="grow space-y-1">
                                                <div className="flex items-center gap-3">
                                                    <h3 className="font-bold  text-foreground tracking-tight">{model.name}</h3>
                                                    <Badge variant="ghost" className="text-xs font-bold tracking-widest bg-muted/50 text-muted-foreground/70">{model.provider}</Badge>
                                                </div>
                                                <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                                                    <span className="text-xs font-bold text-muted-foreground/60 flex items-center gap-1.5 ">
                                                        <Tag className="w-3 h-3 text-indigo-400" /> {model.capability}
                                                    </span>
                                                    <span className="text-xs font-bold text-indigo-500/80 flex items-center gap-1.5 ">
                                                        <Sparkles className="w-3 h-3" /> Best For: {model.bestFor}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Health Metrics */}
                                            <div className="grid grid-cols-2 md:flex items-center gap-6">
                                                <div className="text-center md:text-left">
                                                    <p className="text-xs font-bold text-muted-foreground/50 tracking-widest mb-1">Latency</p>
                                                    <p className="text-xs font-bold text-foreground">{model.latency}</p>
                                                </div>
                                                <div className="text-center md:text-left">
                                                    <p className="text-xs font-bold text-muted-foreground/50 tracking-widest mb-1">Reliability</p>
                                                    <p className={`text-xs font-bold ${model.healthStatus === 'Excellent' ? 'text-emerald-500' : 'text-amber-500'}`}>
                                                        {model.successRate}
                                                    </p>
                                                </div>
                                                <div className="text-center md:text-left hidden sm:block">
                                                    <p className="text-xs font-bold text-muted-foreground/50 tracking-widest mb-1">Status</p>
                                                    <div className="flex items-center gap-1.5">
                                                        <span className={`w-1.5 h-1.5 rounded-full ${model.healthStatus === 'Excellent' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]' :
                                                            model.healthStatus === 'UNTESTED' ? 'bg-slate-400 shadow-[0_0_8px_rgba(148,163,184,0.4)]' :
                                                                model.healthStatus === 'Offline' ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]' :
                                                                    'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]'
                                                            }`} />
                                                        <span className="text-xs font-bold">{model.healthStatus}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex items-center gap-3 ml-auto">
                                                <Button
                                                    variant={model.isDefault ? "secondary" : "outline"}
                                                    size="sm"
                                                    onClick={() => handleSetDefault(model.id)}
                                                    disabled={model.isDefault}
                                                    className={`rounded-lg h-9 text-xs font-bold tracking-widest transition-all ${model.isDefault
                                                        ? 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20'
                                                        : 'border-border/40 bg-background/50 hover:bg-indigo-500 hover:text-white hover:border-indigo-500'
                                                        }`}
                                                >
                                                    {model.isDefault ? <Check className="w-3.5 h-3.5 mr-1.5" /> : <TrendingUp className="w-3.5 h-3.5 mr-1.5" />}
                                                    {model.isDefault ? 'Primary Gateway' : 'Set as Main'}
                                                </Button>

                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleTestHandshake(model)}
                                                    className="h-9 w-9 rounded-lg hover:bg-indigo-500/10 hover:text-indigo-600 border border-transparent hover:border-indigo-500/20 transition-all text-muted-foreground/60"
                                                    title="Test Handshake"
                                                >
                                                    <Zap className="h-4 w-4" />
                                                </Button>

                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg hover:bg-muted/50 border border-transparent hover:border-border/40 transition-all">
                                                            <MoreVertical className="h-4 w-4 text-muted-foreground/60" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-48 rounded-xl border-border/20 shadow-xl backdrop-blur-xl bg-card/95">
                                                        <DropdownMenuItem
                                                            onClick={() => onOpen('addAgentModel', {
                                                                model,
                                                                workspaceId,
                                                                userId,
                                                                onApply: () => fetchModels({ workspaceId })
                                                            })}
                                                            className="flex items-center gap-2 py-2.5 cursor-pointer focus:bg-indigo-500/5 focus:text-indigo-600"
                                                        >
                                                            <Edit className="h-4 w-4" />
                                                            <span className="font-bold text-xs">Edit Configuration</span>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator className="bg-border/10" />
                                                        <DropdownMenuItem
                                                            onClick={() => handleDelete(model.id)}
                                                            className="flex items-center gap-2 py-2.5 cursor-pointer focus:bg-rose-500/5 text-rose-500/80 focus:text-rose-600"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                            <span className="font-bold text-xs">Decommission Node</span>
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))
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
                    <Card className="border-border/40 bg-card/60 backdrop-blur-md rounded-2xl overflow-hidden shadow-sm sticky top-8">
                        <CardHeader className="border-b border-border/10 pb-6 bg-indigo-500/[0.02]">
                            <CardTitle className="text-sm font-bold tracking-widest flex items-center gap-2">
                                <Activity className="w-4 h-4 text-indigo-500" /> Fallback Strategy
                            </CardTitle>
                            <CardDescription className="text-xs font-medium">Configure cluster resilience & failover behavior</CardDescription>
                        </CardHeader>

                        <CardContent className="p-6 space-y-8">
                            {/* Strategy Toggles */}
                            <div className="space-y-4">
                                <label className="text-xs font-bold text-muted-foreground/70 tracking-widest flex items-center gap-2">
                                    Execution Mode
                                </label>
                                <div className="grid grid-cols-1 gap-2">
                                    {[
                                        { id: 'primary', label: 'Single Gateway', desc: 'Only use the primary model. Hard fail on error.', icon: ShieldCheck },
                                        { id: 'sequential', label: 'Intelligent Fallback', desc: 'Try primary, then fallback sequentially.', icon: Workflow },
                                        { id: 'parallel', label: 'Parallel Blast', desc: 'Call all cluster nodes. First success wins.', icon: Zap }
                                    ].map((s) => (
                                        <button
                                            key={s.id}
                                            onClick={() => setStrategy(s.id)}
                                            className={`flex items-start gap-4 p-4 rounded-xl border text-left transition-all ${strategy === s.id
                                                ? 'border-indigo-500/40 bg-indigo-500/5 ring-1 ring-indigo-500/10'
                                                : 'border-border/40 hover:bg-muted/30'
                                                }`}
                                        >
                                            <div className={`mt-0.5 p-1.5 rounded-lg ${strategy === s.id ? 'bg-indigo-500 text-white' : 'bg-muted text-muted-foreground'}`}>
                                                <s.icon className="w-3.5 h-3.5" />
                                            </div>
                                            <div>
                                                <p className={`text-xs font-bold mb-0.5 ${strategy === s.id ? 'text-indigo-600' : 'text-foreground'}`}>{s.label}</p>
                                                <p className="text-xs font-medium text-muted-foreground opacity-70 leading-relaxed">{s.desc}</p>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Inbound Webhook */}
                            <div className="space-y-4 pt-4 border-t border-border/10">
                                <div className="flex items-center justify-between">
                                    <label className="text-xs font-bold text-muted-foreground/70 tracking-widest flex items-center gap-2">
                                        <Globe className="w-3.5 h-3.5 text-emerald-500" /> Gateway Webhook
                                    </label>
                                    <Badge variant="outline" className="text-xs font-bold bg-emerald-500/10 text-emerald-600 border-emerald-500/20 px-2">Encrypted</Badge>
                                </div>
                                <div className="p-3 bg-muted/40 backdrop-blur-sm rounded-lg border border-border/40 group relative">
                                    <code className="text-xs font-mono font-bold text-indigo-600 truncate block pr-8">
                                        https://dev.devlomatix.com/api/gw/v1/webhook
                                    </code>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7 absolute right-1.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-indigo-600"
                                        onClick={() => {
                                            navigator.clipboard.writeText("https://dev.devlomatix.com/api/gw/v1/webhook");
                                            toast.success("Webhook URL copied");
                                        }}
                                    >
                                        <Copy className="w-3 h-3" />
                                    </Button>
                                </div>
                            </div>

                            {/* Self-Healing Status */}
                            <div className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-xl space-y-2">
                                <div className="flex items-center gap-2">
                                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                                    <span className="text-xs font-bold text-amber-600 tracking-wider">Self-Healing Active</span>
                                </div>
                                <p className="text-xs text-amber-700/70 font-bold leading-relaxed">
                                    Cluster intelligence is monitoring 3 nodes. Auto-optimization is currently suggesting **GPT-4o** based on 120ms latency.
                                </p>
                            </div>
                        </CardContent>

                        <CardFooter className="bg-muted/30 border-t border-border/10 p-4">
                            <Button className="w-full rounded-md bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-lg shadow-indigo-500/20 text-xs h-10 gap-2">
                                <ShieldCheck className="w-3.5 h-3.5" /> Commit Strategy
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            </div>

            <AddAgentModelModal />
        </div>
    );
}