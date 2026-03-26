'use client';

import React, { useState, useEffect, use, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
    Cpu,
    Zap,
    Activity,
    Settings2,
    RefreshCw,
    ShieldCheck,
    AlertTriangle,
    Play,
    Square,
    History,
    Network,
    Bot,
    ArrowUpRight,
    Terminal,
    Link as LinkIcon,
    Clock,
    LayoutGrid,
    CheckCircle2,
    ShieldAlert,
    MoreVertical,
    Check,
    X,
    MessageSquare,
    Layers,
    Kanban,
    Plus
} from 'lucide-react';
import { toast } from 'sonner';
import axios from '@/utils/axios';
import Link from 'next/link';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function AgentDashboard({ params: paramsPromise }) {
    const params = use(paramsPromise);
    const workspaceId = params?.workspaceId;

    const [loading, setLoading] = useState(true);
    const [config, setConfig] = useState(null);
    const [missions, setMissions] = useState([]);
    const [activityLogs, setActivityLogs] = useState([]);
    const [isLoadingLogs, setIsLoadingLogs] = useState(false);
    const [stats, setStats] = useState({
        requests: 0,
        successRate: 0,
        latency: 0,
        tokens: 0
    });

    const [approvals, setApprovals] = useState([
        { id: 'APP-1', type: 'Database Access', agent: 'OC-2', description: 'Agent OC-2 requesting permission to modify metadata schema.', critical: true },
        { id: 'APP-2', type: 'Email Dispatch', agent: 'OC-1', description: 'Agent OC-1 requesting to send 45 scheduled campaign emails.', critical: false }
    ]);

    const fetchConfig = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await axios.get(`/api/workspace/${workspaceId}/agent`);
            setConfig(data);
            setStats({
                requests: Math.floor(Math.random() * 500) + 120,
                successRate: 99.1,
                latency: Math.floor(Math.random() * 50) + 180,
                tokens: Math.floor(Math.random() * 10000) + 5000
            });
        } catch (error) {
            console.error("Fetch Config Error:", error);
        } finally {
            setLoading(false);
        }
    }, [workspaceId]);

    const fetchMissions = useCallback(async () => {
        try {
            const { data } = await axios.get(`/api/workspace/${workspaceId}/agent/mission`);
            setMissions(data || []);
        } catch (error) {
            console.error("Fetch Missions Error:", error);
        }
    }, [workspaceId]);

    const fetchLogs = useCallback(async () => {
        setIsLoadingLogs(true);
        try {
            const { data } = await axios.get(`/api/workspace/${workspaceId}/system/webhooks/logs`);
            setActivityLogs(data || []);
        } catch (error) {
            console.error("Fetch Logs Error:", error);
        } finally {
            setIsLoadingLogs(false);
        }
    }, [workspaceId]);

    useEffect(() => {
        fetchConfig();
        fetchMissions();
        fetchLogs();
    }, [fetchConfig, fetchMissions, fetchLogs]);

    const handleSync = async () => {
        setIsLoadingLogs(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 1000));
            toast.success("Orchestration registry synchronized");
            fetchConfig();
            fetchMissions();
            fetchLogs();
        } finally {
            setIsLoadingLogs(false);
        }
    };

    const handleApprove = (id) => {
        setApprovals(prev => prev.filter(app => app.id !== id));
        toast.success(`Request ${id} approved`);
    };

    const handleReject = (id) => {
        setApprovals(prev => prev.filter(app => app.id !== id));
        toast.error(`Request ${id} denied`);
    };

    const missionStatuses = ['Backlog', 'Planning', 'In Progress', 'Review', 'Done'];

    return (
        <div className="p-6 space-y-6 animate-fade-in bg-background/50 min-h-screen">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-600/20">
                            <Layers className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black tracking-tight uppercase flex items-center gap-2">
                                Mission Control
                                <Badge variant="outline" className="text-[10px] bg-indigo-500/10 text-indigo-600 border-indigo-500/20 uppercase font-black tracking-widest px-2">v2.0 Beta</Badge>
                            </h1>
                            <p className="text-xs text-muted-foreground font-bold tracking-widest uppercase opacity-60">Multi-Agent Orchestration Gateway</p>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="rounded-xl text-muted-foreground hover:text-indigo-600 font-bold text-xs gap-2 h-10 px-4 transition-colors"
                        onClick={handleSync}
                        disabled={isLoadingLogs}
                    >
                        <RefreshCw className={`w-4 h-4 ${isLoadingLogs ? 'animate-spin' : ''}`} />
                        Sync Ops
                    </Button>
                    <Link href={`/workspace/${workspaceId}/agent/credential`}>
                        <Button variant="outline" className="rounded-xl border-border/40 hover:bg-card text-foreground font-bold text-xs gap-2 h-10 px-4 shadow-sm">
                            <Settings2 className="w-4 h-4" />
                            Configuration
                        </Button>
                    </Link>
                </div>
            </div>

            <Tabs defaultValue="overview" className="w-full">
                <TabsList className="bg-background/50 border border-border/40 p-1 rounded-xl mb-6 flex-wrap h-auto gap-1">
                    <TabsTrigger value="overview" className="rounded-lg gap-2 text-[11px] font-bold px-4 transition-all data-[state=active]:bg-card data-[state=active]:text-indigo-600">
                        <LayoutGrid className="w-3.5 h-3.5" />
                        OVERVIEW
                    </TabsTrigger>
                    <TabsTrigger value="missions" className="rounded-lg gap-2 text-[11px] font-bold px-4 transition-all data-[state=active]:bg-card data-[state=active]:text-indigo-600">
                        <Kanban className="w-3.5 h-3.5" />
                        MISSIONS (KANBAN)
                    </TabsTrigger>
                    <TabsTrigger value="approvals" className="rounded-lg gap-2 text-[11px] font-bold px-4 transition-all data-[state=active]:bg-card data-[state=active]:text-indigo-600">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        APPROVAL QUEUE
                    </TabsTrigger>
                    <TabsTrigger value="feed" className="rounded-lg gap-2 text-[11px] font-bold px-4 transition-all data-[state=active]:bg-card data-[state=active]:text-indigo-600">
                        <Terminal className="w-3.5 h-3.5" />
                        LIVE INTELLIGENCE
                    </TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-6 mt-0">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {[
                            { label: 'Active Missions', value: missions.filter(m => m.status !== 'Done').length, icon: Activity, color: 'text-blue-500', bg: 'bg-blue-500/10' },
                            { label: 'Agent Health', value: `${stats.successRate}%`, icon: ShieldCheck, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
                            { label: 'Pending Approvals', value: approvals.length, icon: ShieldAlert, color: 'text-rose-500', bg: 'bg-rose-500/10' },
                            { label: 'Total Compute', value: stats.tokens.toLocaleString(), icon: Cpu, color: 'text-fuchsia-500', bg: 'bg-fuchsia-500/10' }
                        ].map((stat, i) => (
                            <Card key={i} className="border-border/40 bg-card/40 backdrop-blur-md rounded-2xl overflow-hidden shadow-sm">
                                <CardContent className="p-5 flex items-center justify-between">
                                    <div>
                                        <p className="text-[10px] font-black tracking-widest uppercase text-muted-foreground mb-1">{stat.label}</p>
                                        <p className="text-xl font-bold">{stat.value}</p>
                                    </div>
                                    <div className={`p-3 rounded-xl ${stat.bg}`}>
                                        <stat.icon className={`w-5 h-5 ${stat.color}`} />
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <Card className="lg:col-span-2 border-border/40 bg-card/40 backdrop-blur-md rounded-2xl overflow-hidden shadow-xl shadow-indigo-500/5">
                            <CardHeader className="pb-4 border-b border-border/10">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="text-lg font-bold">Active Agents</CardTitle>
                                        <CardDescription className="text-xs">Direct control over registered OpenClaw specialized instances.</CardDescription>
                                    </div>
                                    <Badge variant="outline" className="bg-indigo-500/5 text-indigo-600 border-indigo-500/20 font-bold uppercase text-[9px]">
                                        {config?.agents?.length || 0} Ready
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0">
                                {loading ? (
                                    <div className="p-16 text-center animate-pulse">
                                        <Bot className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4 animate-spin" />
                                        <p className="text-xs font-black tracking-widest uppercase opacity-40">Polling Gateway Registry...</p>
                                    </div>
                                ) : config?.agents?.length > 0 ? (
                                    <div className="divide-y divide-border/10">
                                        {config.agents.map((agent) => (
                                            <div key={agent.id} className="p-6 flex items-center justify-between hover:bg-indigo-500/5 transition-colors group">
                                                <div className="flex items-center gap-4">
                                                    <div className="relative">
                                                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-fuchsia-500/20 border border-indigo-500/10 flex items-center justify-center">
                                                            <Bot className="w-6 h-6 text-indigo-600" />
                                                        </div>
                                                        <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-card ${agent.status === 'online' ? 'bg-emerald-500' : 'bg-muted-foreground/30'}`} />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-sm flex items-center gap-2">
                                                            {agent.name}
                                                            {agent.status === 'online' && <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />}
                                                        </h4>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <Badge variant="secondary" className="text-[9px] font-black tracking-widest uppercase px-1.5 h-4 opacity-70">{agent.role}</Badge>
                                                            <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-tighter opacity-70">ID: {agent.id}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Button size="icon" variant="ghost" className="h-9 w-9 rounded-xl text-emerald-500 hover:bg-emerald-500/10">
                                                        <Play className="w-4 h-4 fill-current" />
                                                    </Button>
                                                    <Button size="icon" variant="ghost" className="h-9 w-9 rounded-xl text-rose-500 hover:bg-rose-500/10">
                                                        <Square className="w-3.5 h-3.5 fill-current" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-16 text-center">
                                        <AlertTriangle className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
                                        <p className="text-xs font-black tracking-widest uppercase text-muted-foreground opacity-40">Registry empty or disconnected</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <div className="space-y-6">
                            <Card className="border-border/40 bg-card/40 backdrop-blur-md rounded-2xl overflow-hidden shadow-lg shadow-emerald-500/5">
                                <CardHeader className="pb-3 flex flex-row items-center justify-between">
                                    <CardTitle className="text-sm font-bold flex items-center gap-2 text-foreground">
                                        <Network className="w-4 h-4 text-emerald-500" />
                                        Inbound Stream
                                    </CardTitle>
                                    <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[9px] font-black uppercase h-5">Live Hub</Badge>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="p-4 bg-background/40 rounded-xl border border-border/10">
                                        <div className="flex gap-1.5 h-4 items-end">
                                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].map(i => (
                                                <div key={i} className={`flex-1 rounded-sm bg-emerald-500 animate-pulse`} style={{ animationDelay: `${i * 100}ms`, height: `${40 + Math.random() * 60}%` }} />
                                            ))}
                                        </div>
                                    </div>
                                    <p className="text-[10px] text-muted-foreground font-medium text-center">Listening for triggers from OpenClaw Gateway.</p>
                                </CardContent>
                            </Card>

                            <Card className="border-indigo-500/20 bg-indigo-500/5 rounded-2xl overflow-hidden shadow-lg">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                                        <Bot className="w-4 h-4 text-indigo-500" />
                                        Quick Discovery
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <p className="text-[10px] font-medium text-indigo-700/70 leading-relaxed px-1">
                                        Your instances can communicate via the internal mesh network using shared tokens.
                                    </p>
                                    <Button variant="outline" className="w-full h-9 rounded-xl border-indigo-500/20 text-indigo-600 font-bold uppercase text-[9px] tracking-widest bg-white/50" asChild>
                                        <Link href={`/workspace/${workspaceId}/agent/credential`}>View Mesh Config</Link>
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </TabsContent>

                {/* Missions Tab */}
                <TabsContent value="missions" className="space-y-6 mt-0">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-4">
                            <Badge variant="outline" className="bg-indigo-500/10 text-indigo-600 border-indigo-500/20 uppercase font-black tracking-widest px-2">{missions.length} Missions</Badge>
                        </div>
                        <Button size="sm" className="rounded-xl bg-indigo-600 hover:bg-indigo-700 font-bold uppercase text-[10px] h-9 px-4 shadow-lg shadow-indigo-600/20">
                            Create New Mission
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 overflow-x-auto pb-6 custom-scrollbar min-h-[600px]">
                        {missionStatuses.map(status => (
                            <div key={status} className="flex flex-col gap-4 min-w-[240px]">
                                <div className="flex items-center justify-between mb-1 px-1">
                                    <h3 className="text-[11px] font-black tracking-widest uppercase text-muted-foreground flex items-center gap-2">
                                        {status}
                                        <span className="w-5 h-5 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold">{missions.filter(m => m.status === status).length}</span>
                                    </h3>
                                    <MoreVertical className="w-3.5 h-3.5 text-muted-foreground/30" />
                                </div>

                                <div className="flex-1 space-y-3 bg-muted/20 p-2 rounded-2xl border border-border/10">
                                    {missions.filter(m => m.status === status).map(mission => (
                                        <Card key={mission.id} className="border-border/40 bg-card/60 backdrop-blur-md rounded-xl overflow-hidden shadow-sm hover:shadow-md hover:border-indigo-500/30 transition-all cursor-pointer group">
                                            <CardContent className="p-4 space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <Badge className={`text-[9px] font-black uppercase tracking-tighter px-1.5 h-4 
                                                        ${mission.priority === 'Critical' ? 'bg-rose-500/10 text-rose-600 border-rose-500/20' :
                                                            mission.priority === 'High' ? 'bg-amber-500/10 text-amber-600 border-amber-500/20' :
                                                                'bg-blue-500/10 text-blue-600 border-blue-500/20'}`} variant="outline">
                                                        {mission.priority}
                                                    </Badge>
                                                    <span className="text-[9px] font-mono text-muted-foreground/50">{mission.id}</span>
                                                </div>
                                                <h4 className="text-sm font-bold text-foreground leading-tight">{mission.title}</h4>

                                                <div className="flex items-center justify-between text-[10px] text-muted-foreground mt-4">
                                                    <div className="flex items-center gap-1.5 bg-background/50 px-2 py-0.5 rounded-lg border border-border/40">
                                                        <Bot className="w-3 h-3 text-indigo-500" />
                                                        <span className="font-bold">{mission.agentId}</span>
                                                    </div>
                                                    <span className="font-bold opacity-70">{mission.progress}%</span>
                                                </div>
                                                <Progress value={mission.progress} className="h-1 bg-muted rounded-full" />
                                            </CardContent>
                                        </Card>
                                    ))}
                                    {missions.filter(m => m.status === status).length === 0 && (
                                        <div className="h-24 flex items-center justify-center border-2 border-dashed border-border/10 rounded-xl opacity-20 group-hover:opacity-40 transition-opacity">
                                            <Plus className="w-6 h-6" />
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </TabsContent>

                {/* Approvals Tab */}
                <TabsContent value="approvals" className="space-y-6 mt-0">
                    <Card className="border-border/40 bg-card/40 backdrop-blur-md rounded-2xl overflow-hidden shadow-xl shadow-rose-500/5 min-h-[500px]">
                        <CardHeader className="border-b border-border/10 pb-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-rose-500 shadow-lg shadow-rose-500/20 rounded-2xl">
                                    <ShieldAlert className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <CardTitle className="text-xl font-black tracking-tight flex items-center gap-2 uppercase">
                                        Governance Queue
                                        <Badge variant="outline" className="text-[10px] bg-rose-500/10 text-rose-600 border-rose-500/20 uppercase font-black ml-2 h-5">Gated Actions</Badge>
                                    </CardTitle>
                                    <CardDescription className="text-xs font-medium">Review and approve sensitive actions requested by autonomous agents.</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            {approvals.length > 0 ? (
                                <div className="divide-y divide-border/10">
                                    {approvals.map((req) => (
                                        <div key={req.id} className="p-8 flex items-start justify-between hover:bg-rose-500/5 transition-colors group">
                                            <div className="flex gap-6 min-w-0">
                                                <div className={`p-4 rounded-2xl shadow-inner shrink-0 ${req.critical ? 'bg-rose-500/10' : 'bg-amber-500/10'}`}>
                                                    <Bot className={`w-8 h-8 ${req.critical ? 'text-rose-500' : 'text-amber-600'}`} />
                                                </div>
                                                <div className="space-y-1 min-w-0">
                                                    <div className="flex items-center gap-3">
                                                        <h4 className="font-bold text-lg text-foreground">{req.type}</h4>
                                                        <Badge variant="outline" className="bg-background text-[10px] font-black uppercase h-5 text-muted-foreground">{req.id}</Badge>
                                                    </div>
                                                    <p className="text-sm text-muted-foreground font-medium leading-relaxed max-w-xl">{req.description}</p>
                                                    <div className="flex items-center gap-4 mt-4">
                                                        <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground bg-muted/40 px-3 py-1 rounded-xl">
                                                            <Activity className="w-3.5 h-3.5" />
                                                            Source: {req.agent}
                                                        </div>
                                                        <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-600 bg-cyan-500/5 px-3 py-1 rounded-xl">
                                                            <Clock className="w-3.5 h-3.5" />
                                                            Expires in 2h
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <Button
                                                    variant="outline"
                                                    className="rounded-xl h-12 w-12 text-rose-500 border-rose-500/20 hover:bg-rose-500 hover:text-white transition-all shadow-sm"
                                                    onClick={() => handleReject(req.id)}
                                                >
                                                    <X className="w-5 h-5" />
                                                </Button>
                                                <Button
                                                    className="rounded-xl h-12 px-8 bg-emerald-600 hover:bg-emerald-700 text-white font-bold uppercase tracking-widest text-[11px] shadow-lg shadow-emerald-500/20"
                                                    onClick={() => handleApprove(req.id)}
                                                >
                                                    Approve Action
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-24 text-center">
                                    <CheckCircle2 className="w-16 h-16 text-emerald-500/20 mx-auto mb-6" />
                                    <h3 className="text-xl font-bold text-foreground/40 uppercase tracking-tight">Queue is Empty</h3>
                                    <p className="text-sm text-muted-foreground opacity-60 mt-2 font-medium">All autonomous actions have been reconciled.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Feed Tab */}
                <TabsContent value="feed" className="mt-0 space-y-6">
                    <Card className="border-border/40 bg-card/40 backdrop-blur-md rounded-2xl overflow-hidden shadow-xl min-h-[600px] flex flex-col">
                        <CardHeader className="pb-4 border-b border-border/10 shrink-0 flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-lg font-bold flex items-center gap-2">
                                    <Terminal className="w-5 h-5 text-indigo-500" />
                                    Global Intelligence Stream
                                </CardTitle>
                                <CardDescription className="text-xs">Real-time audit of agent thoughts, decisions, and network triggers.</CardDescription>
                            </div>
                            <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground/30 hover:text-indigo-600" onClick={fetchLogs}>
                                <RefreshCw className={`w-4 h-4 ${isLoadingLogs ? 'animate-spin' : ''}`} />
                            </Button>
                        </CardHeader>
                        <CardContent className="p-0 flex-1 overflow-y-auto custom-scrollbar bg-black/5 animate-pulse-subtle">
                            <div className="p-6 space-y-6 font-mono text-[11px]">
                                {activityLogs.length > 0 ? (
                                    activityLogs.map((log) => (
                                        <div key={log.id} className="flex gap-4 group">
                                            <div className="space-y-1 shrink-0 text-right w-16 pt-0.5">
                                                <p className="text-muted-foreground opacity-30 font-bold">{new Date(log.createdAt).toLocaleTimeString([], { hour12: false })}</p>
                                                <p className="text-[8px] font-black uppercase text-indigo-500/40 tracking-tighter">{log.type}</p>
                                            </div>
                                            <div className="flex-1 space-y-2">
                                                <div className="flex items-center gap-2 border-l-2 border-border/30 pl-4 py-1 group-hover:border-indigo-500/50 transition-colors">
                                                    <span className={`font-black uppercase tracking-widest px-1.5 rounded-md h-5 flex items-center
                                                        ${log.level === 'SUCCESS' ? 'text-emerald-500 bg-emerald-500/5' : 'text-rose-500 bg-rose-500/5'}`}>
                                                        [{log.message.split(':')[0]}]
                                                    </span>
                                                    <span className="text-foreground/90 font-bold">{log.message.split(':').slice(1).join(':')}</span>
                                                </div>
                                                <div className="ml-4 p-3 bg-white/5 rounded-xl border border-border/10 text-[10px] text-muted-foreground overflow-x-auto">
                                                    <pre>{JSON.stringify(log.details, null, 2)}</pre>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-4 flex flex-col items-center justify-center h-[400px] opacity-20">
                                        <Terminal className="w-16 h-16 mb-4" />
                                        <p className="text-xs font-black tracking-widest uppercase">Initializing Stream Matrix...</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
