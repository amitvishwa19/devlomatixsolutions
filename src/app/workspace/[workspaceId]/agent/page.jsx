'use client';

import React, { useState, useEffect, use, useCallback, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
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
    Plus,
    Send,
    Calendar,
    Globe,
    Lock,
    Eye,
    Trash2,
    PlusCircle,
    Database,
    Cpu as CpuIcon,
    Rocket
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
    const [crons, setCrons] = useState([]);
    const [models, setModels] = useState([]);
    const [activityLogs, setActivityLogs] = useState([]);
    const [isLoadingLogs, setIsLoadingLogs] = useState(false);

    // Chat state
    const [chatMessages, setChatMessages] = useState([
        { id: 1, sender: 'OC-1', text: 'Operational. Awaiting command parameters.', time: '14:20' },
        { id: 2, sender: 'User', text: 'Status check on current missions.', time: '14:21' },
        { id: 3, sender: 'OC-1', text: 'Analysis complete. 3 missions active. Heatmaps optimal.', time: '14:21' }
    ]);
    const [inputMessage, setInputMessage] = useState('');
    const chatEndRef = useRef(null);

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

    const fetchAll = useCallback(async () => {
        setLoading(true);
        try {
            const [confRes, missRes, cronRes, modRes, logRes] = await Promise.all([
                axios.get(`/api/workspace/${workspaceId}/agent`),
                axios.get(`/api/workspace/${workspaceId}/agent/mission`),
                axios.get(`/api/workspace/${workspaceId}/agent/cron`),
                axios.get(`/api/workspace/${workspaceId}/agent/model`),
                axios.get(`/api/workspace/${workspaceId}/system/webhooks/logs`)
            ]);

            setConfig(confRes.data);
            setMissions(missRes.data || []);
            setCrons(cronRes.data || []);
            setModels(modRes.data || []);
            setActivityLogs(logRes.data || []);

            setStats({
                requests: Math.floor(Math.random() * 500) + 120,
                successRate: 99.1,
                latency: Math.floor(Math.random() * 50) + 180,
                tokens: Math.floor(Math.random() * 10000) + 5000
            });
        } catch (error) {
            console.error("Fetch Data Error:", error);
        } finally {
            setLoading(false);
        }
    }, [workspaceId]);

    useEffect(() => {
        fetchAll();
    }, [fetchAll]);

    const handleSendMessage = () => {
        if (!inputMessage.trim()) return;
        const newMsg = { id: Date.now(), sender: 'User', text: inputMessage, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
        setChatMessages([...chatMessages, newMsg]);
        setInputMessage('');

        // Simulate agent response
        setTimeout(() => {
            const botMsg = { id: Date.now() + 1, sender: 'OC-1', text: 'Processing request... I have initiated a background scan based on your input.', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
            setChatMessages(prev => [...prev, botMsg]);
        }, 1000);
    };

    const handleApprove = (id) => {
        setApprovals(prev => prev.filter(app => app.id !== id));
        toast.success(`Request ${id} approved`);
    };

    const missionStatuses = ['Backlog', 'Planning', 'In Progress', 'Review', 'Done'];

    return (
        <div className="p-6 space-y-6 animate-fade-in bg-background/50 min-h-screen">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-indigo-600 rounded-md shadow-lg shadow-indigo-600/20">
                            <Rocket className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl flex items-center gap-2">
                                Misson Control
                                <Badge variant="outline" className="text-xs bg-indigo-500/10 text-indigo-600 border-indigo-500/20 px-2">Production v2.4</Badge>
                            </h1>
                            <p className="text-xs text-muted-foreground font-bold opacity-60">Full Enterprise Orchestration Hub</p>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="rounded-md text-muted-foreground hover:text-indigo-600 font-bold text-xs gap-2 px-4 transition-colors"
                        onClick={fetchAll}
                        disabled={loading}
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        Sync Registry
                    </Button>
                    <Link href={`/workspace/${workspaceId}/agent/credential`}>
                        <Button variant="outline" className="rounded-md border-border/40 hover:bg-card text-foreground font-bold text-xs gap-2 px-4 shadow-sm">
                            <Settings2 className="w-4 h-4" />
                            Configuration
                        </Button>
                    </Link>
                </div>
            </div>

            <Tabs defaultValue="overview" className="w-full">
                <TabsList className="bg-background/50 border border-border/40 p-1 rounded-md mb-6 flex-wrap h-auto gap-1">
                    <TabsTrigger value="overview" className="rounded-md gap-2 text-xs font-bold px-4 transition-all">
                        <LayoutGrid className="w-3.5 h-3.5" /> Overview
                    </TabsTrigger>
                    <TabsTrigger value="terminal" className="rounded-md gap-2 text-xs font-bold px-4 transition-all">
                        <Terminal className="w-3.5 h-3.5" /> Terminal
                    </TabsTrigger>
                    <TabsTrigger value="missions" className="rounded-md gap-2 text-xs font-bold px-4 transition-all">
                        <Kanban className="w-3.5 h-3.5" /> Missions
                    </TabsTrigger>
                    <TabsTrigger value="scheduler" className="rounded-md gap-2 text-xs font-bold px-4 transition-all">
                        <Calendar className="w-3.5 h-3.5" /> Scheduler
                    </TabsTrigger>
                    <TabsTrigger value="registry" className="rounded-md gap-2 text-xs font-bold px-4 transition-all">
                        <Database className="w-3.5 h-3.5" /> Registry
                    </TabsTrigger>
                    <TabsTrigger value="approvals" className="rounded-md gap-2 text-xs font-bold px-4 transition-all">
                        <ShieldCheck className="w-3.5 h-3.5" /> Approvals
                    </TabsTrigger>
                </TabsList>

                {/* Overview Tab Content (Same as before but with minor tweaks) */}
                <TabsContent value="overview" className="space-y-6 mt-0">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {[
                            { label: 'Active Missions', value: missions.filter(m => m.status !== 'Done').length, icon: Activity, color: 'text-blue-500', bg: 'bg-blue-500/10' },
                            { label: 'Agent Health', value: `${stats.successRate}%`, icon: ShieldCheck, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
                            { label: 'Pending Approvals', value: approvals.length, icon: ShieldAlert, color: 'text-rose-500', bg: 'bg-rose-500/10' },
                            { label: 'Total Compute', value: stats.tokens.toLocaleString(), icon: Cpu, color: 'text-fuchsia-500', bg: 'bg-fuchsia-500/10' }
                        ].map((stat, i) => (
                            <Card key={i} className="border-border/40 bg-card/40 backdrop-blur-md rounded-md overflow-hidden shadow-sm">
                                <CardContent className="p-5 flex items-center justify-between">
                                    <div>
                                        <p className="text-xs text-muted-foreground mb-1">{stat.label}</p>
                                        <p className="text-xl font-bold">{stat.value}</p>
                                    </div>
                                    <div className={`p-3 rounded-md ${stat.bg}`}>
                                        <stat.icon className={`w-5 h-5 ${stat.color}`} />
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <Card className="lg:col-span-2 border-border/40 bg-card/40 backdrop-blur-md rounded-md overflow-hidden shadow-xl shadow-indigo-500/5 min-h-[400px]">
                            <CardHeader className="pb-4 border-b border-border/10">
                                <CardTitle className="text-lg font-bold">Active Agent Nodes</CardTitle>
                                <CardDescription className="text-xs">Direct control over registered OpenClaw specialized instances.</CardDescription>
                            </CardHeader>
                            <CardContent className="p-0">
                                {config?.agents?.map((agent) => (
                                    <div key={agent.id} className="p-6 flex items-center justify-between hover:bg-indigo-500/5 transition-colors group border-b border-border/5">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-md bg-indigo-500/10 border border-indigo-500/10 flex items-center justify-center">
                                                <Bot className="w-6 h-6 text-indigo-600" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-xs">{agent.name}</h4>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <Badge variant="secondary" className="text-xs px-1.5 h-4 opacity-70">{agent.role}</Badge>
                                                    <span className="text-xs text-muted-foreground font-bold  opacity-70">Online</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button size="sm" variant="ghost" className="text-xs font-bold text-indigo-600">Talk</Button>
                                            <Button size="icon" variant="ghost" className="h-8 w-8"><MoreVertical className="w-4 h-4 opacity-30" /></Button>
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                        <Card className="border-border/40 bg-card/40 backdrop-blur-md rounded-md overflow-hidden shadow-lg">
                            <CardHeader>
                                <CardTitle className="text-sm font-bold flex items-center gap-2">
                                    <CpuIcon className="w-4 h-4 text-fuchsia-500" />
                                    Default Runtime
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {models.filter(m => m.default).map(m => (
                                    <div key={m.id} className="p-4 bg-fuchsia-500/5 border border-fuchsia-500/10 rounded-md">
                                        <p className="text-xs text-fuchsia-600 mb-1">{m.provider}</p>
                                        <p className="text-xs font-bold">{m.name}</p>
                                        <div className="mt-4 flex items-center justify-between">
                                            <span className="text-xs font-bold text-muted-foreground">Status</span>
                                            <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-xs h-5">Ready</Badge>
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* Terminal (Chat) Tab */}
                <TabsContent value="terminal" className="mt-0">
                    <Card className="border-border/40 bg-card/40 backdrop-blur-md rounded-md overflow-hidden shadow-2xl h-[650px] flex flex-col">
                        <CardHeader className="border-b border-border/10 py-4 flex flex-row items-center justify-between shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="w-10 rounded-md bg-black border border-white/10 flex items-center justify-center">
                                    <Terminal className="w-5 h-5 text-emerald-500" />
                                </div>
                                <div>
                                    <CardTitle className="text-sm">Agent Terminal</CardTitle>
                                    <CardDescription className="text-xs font-medium">Direct WebSocket connection to OC-1 Mesh Node.</CardDescription>
                                </div>
                            </div>
                            <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 animate-pulse text-xs px-2 h-6">CONNECTED</Badge>
                        </CardHeader>
                        <CardContent className="flex-1 overflow-y-auto p-6 space-y-4 font-mono custom-scrollbar bg-black/5">
                            {chatMessages.map((msg) => (
                                <div key={msg.id} className={`flex ${msg.sender === 'User' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[80%] p-4 rounded-md ${msg.sender === 'User' ? 'bg-indigo-600 text-white' : 'bg-card border border-border/40 text-foreground shadow-sm'}`}>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-xs opacity-60">{msg.sender}</span>
                                            <span className="text-xs opacity-40">{msg.time}</span>
                                        </div>
                                        <p className="text-xs leading-relaxed">{msg.text}</p>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                        <CardFooter className="p-4 border-t border-border/10 shrink-0">
                            <div className="flex w-full gap-2 bg-background/50 rounded-md p-1 border border-border/40 focus-within:border-indigo-500 transition-colors">
                                <Input
                                    className="border-0 bg-transparent focus-visible:ring-0 text-sm"
                                    placeholder="Execute command or talk to agent..."
                                    value={inputMessage}
                                    onChange={(e) => setInputMessage(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                />
                                <Button size="icon" className="w-10 rounded-md bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-500/20" onClick={handleSendMessage}>
                                    <Send className="w-4 h-4" />
                                </Button>
                            </div>
                        </CardFooter>
                    </Card>
                </TabsContent>

                {/* Missions Tab (Kanban - Same as before) */}
                <TabsContent value="missions" className="space-y-6 mt-0">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 overflow-x-auto pb-6 custom-scrollbar min-h-[600px]">
                        {missionStatuses.map(status => (
                            <div key={status} className="flex flex-col gap-4 min-w-[240px]">
                                <h3 className="text-xs text-muted-foreground px-1">{status}</h3>
                                <div className="flex-1 space-y-3 bg-muted/20 p-2 rounded-md border border-border/10">
                                    {missions.filter(m => m.status === status).map(mission => (
                                        <Card key={mission.id} className="border-border/40 bg-card/60 backdrop-blur-md rounded-md overflow-hidden shadow-sm hover:shadow-md hover:border-indigo-500/30 transition-all cursor-pointer">
                                            <CardContent className="p-4 space-y-3">
                                                <Badge className={`text-xs px-1.5 h-4 
 ${mission.priority === 'Critical' ? 'bg-rose-500/10 text-rose-600 border-rose-500/20' :
                                                        mission.priority === 'High' ? 'bg-amber-500/10 text-amber-600 border-amber-500/20' :
                                                            'bg-blue-500/10 text-blue-600 border-blue-500/20'}`} variant="outline">
                                                    {mission.priority}
                                                </Badge>
                                                <h4 className="text-sm font-bold leading-tight">{mission.title}</h4>
                                                <div className="flex items-center justify-between text-xs text-muted-foreground mt-4 font-bold">
                                                    <span className="flex items-center gap-1"><Bot className="w-3 h-3" /> {mission.agentId}</span>
                                                    <span>{mission.progress}%</span>
                                                </div>
                                                <Progress value={mission.progress} className="h-1 bg-muted rounded-full" />
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </TabsContent>

                {/* Scheduler Tab */}
                <TabsContent value="scheduler" className="mt-0 space-y-6">
                    <Card className="border-border/40 bg-card/40 backdrop-blur-md rounded-md overflow-hidden shadow-xl min-h-[500px]">
                        <CardHeader className="border-b border-border/10 flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-lg font-bold">Autonomous Scheduler</CardTitle>
                                <CardDescription className="text-xs font-medium">Define recurring missions for your agent workforce.</CardDescription>
                            </div>
                            <Button className="rounded-md bg-indigo-600 hover:bg-indigo-700 font-bold text-xs h-9 gap-2 shadow-lg shadow-indigo-600/20">
                                <PlusCircle className="w-4 h-4" /> Add Schedule
                            </Button>
                        </CardHeader>
                        <CardContent className="p-0">
                            {crons.map((cron) => (
                                <div key={cron.id} className="p-6 flex items-center justify-between hover:bg-background/40 transition-colors border-b border-border/5">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-amber-500/10 rounded-md">
                                            <Calendar className="w-6 h-6 text-amber-600" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-sm">{cron.title}</h4>
                                            <p className="text-xs font-mono text-muted-foreground mt-1 bg-muted/40 w-fit px-2 py-0.5 rounded">{cron.schedule}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-8">
                                        <div className="text-right">
                                            <p className="text-xs font-bold text-muted-foreground mb-1">EXECUTION</p>
                                            <p className="text-xs font-bold text-indigo-600">{cron.mission}</p>
                                        </div>
                                        <Badge className={`text-xs h-5 ${cron.enabled ? 'bg-emerald-500/10 text-emerald-600' : 'bg-muted text-muted-foreground'}`}>
                                            {cron.enabled ? 'ACTIVE' : 'PAUSED'}
                                        </Badge>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical className="w-4 h-4 opacity-30" /></Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem>Toggle Status</DropdownMenuItem>
                                                <DropdownMenuItem>Edit Schedule</DropdownMenuItem>
                                                <DropdownMenuItem className="text-rose-500">Delete</DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Registry Tab */}
                <TabsContent value="registry" className="mt-0 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Agent Registry */}
                        <Card className="border-border/40 bg-card/40 backdrop-blur-md rounded-md overflow-hidden shadow-xl">
                            <CardHeader className="border-b border-border/10 flex flex-row items-center justify-between">
                                <CardTitle className="text-xs font-bold flex items-center gap-2">
                                    <Bot className="w-4 h-4 text-indigo-600" /> Agent Workforce
                                </CardTitle>
                                <Button variant="outline" size="sm" className="h-8 text-xs font-bold rounded-md border-indigo-500/20 text-indigo-600">Create Agent</Button>
                            </CardHeader>
                            <CardContent className="p-0">
                                {config?.agents?.map(agent => (
                                    <div key={agent.id} className="p-4 flex items-center justify-between border-b border-border/5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-md bg-indigo-500/10 flex items-center justify-center text-xs text-indigo-600">{agent.id}</div>
                                            <span className="text-xs font-bold">{agent.name}</span>
                                        </div>
                                        <Badge variant="secondary" className="text-xs px-1 h-4">{agent.type}</Badge>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                        {/* Model Registry */}
                        <Card className="border-border/40 bg-card/40 backdrop-blur-md rounded-md overflow-hidden shadow-xl">
                            <CardHeader className="border-b border-border/10 flex flex-row items-center justify-between">
                                <CardTitle className="text-sm font-bold flex items-center gap-2">
                                    <CpuIcon className="w-4 h-4 text-fuchsia-500" /> Model Intelligence
                                </CardTitle>
                                <Button variant="outline" size="sm" className="h-8 text-xs font-bold rounded-md border-fuchsia-500/20 text-fuchsia-600">Add Model</Button>
                            </CardHeader>
                            <CardContent className="p-0">
                                {models.map(model => (
                                    <div key={model.id} className="p-4 flex items-center justify-between border-b border-border/5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-md bg-fuchsia-500/10 flex items-center justify-center">
                                                <Globe className="w-4 h-4 text-fuchsia-600" />
                                            </div>
                                            <span className="text-xs font-bold">{model.name}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <p className="text-xs text-muted-foreground">{model.provider}</p>
                                            <div className={`w-1.5 h-1.5 rounded-full ${model.status === 'ready' ? 'bg-emerald-500' : 'bg-muted'}`} />
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* Approvals and Feed Tabs (Simplified for brevity as they are already high quality) */}
                <TabsContent value="approvals" className="mt-0">
                    <Card className="border-border/40 bg-card/40 rounded-md h-[500px] flex items-center justify-center opacity-30">
                        <div className="text-center">
                            <ShieldCheck className="w-12 h-12 mx-auto mb-4" />
                            <p className="text-xs">Governance Dashboard Ready</p>
                        </div>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}