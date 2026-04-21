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
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

import { OverviewContent } from './_components/OverviewContent';
import { TerminalContent } from './_components/TerminalContent';
import { MissionsContent } from './_components/MissionsContent';
import { SchedulerContent } from './_components/SchedulerContent';
import { RegistryContent } from './_components/RegistryContent';
import { ApprovalsContent } from './_components/ApprovalsContent';
import { ModelMissionControl } from './_components/ModelMissionControl';
import { AddAgentModelModal } from './_components/AddAgentModelModal';
import { AddAgentPersonaModal } from './_components/AddAgentPersonaModal';
import { useModal } from "@/hooks/useModal";
import { useSession } from 'next-auth/react';

export default function AgentDashboard({ params: paramsPromise }) {
    const params = use(paramsPromise);
    const workspaceId = params?.workspaceId;

    const [activeTab, setActiveTab] = useState('overview');
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
    const [selectedAgentId, setSelectedAgentId] = useState(null);
    const [isThinking, setIsThinking] = useState(false);
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

    const handleSendMessage = async () => {
        if (!inputMessage.trim() || !selectedAgentId || isThinking) return;

        const userMsg = { 
            id: Date.now(), 
            sender: 'User', 
            text: inputMessage, 
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
        };
        
        setChatMessages(prev => [...prev, userMsg]);
        setInputMessage('');
        setIsThinking(true);

        try {
            const response = await axios.post(`/api/workspace/${workspaceId}/agent/chat`, {
                agentId: selectedAgentId,
                message: inputMessage,
                history: chatMessages.slice(-10).map(m => ({
                    role: m.sender === 'User' ? 'user' : 'model',
                    content: m.text
                }))
            });

            const botMsg = { 
                id: Date.now() + 1, 
                sender: response.data.node.name, 
                text: response.data.text, 
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                node: response.data.node
            };
            setChatMessages(prev => [...prev, botMsg]);
        } catch (error) {
            console.error("Chat Error:", error);
            toast.error(error.response?.data?.message || "Swarm execution failed");
        } finally {
            setIsThinking(false);
        }
    };

    const { onOpen } = useModal();
    const { data: session } = useSession();
    const userId = session?.user?.userId;

    const handleApprove = (id) => {
        setApprovals(prev => prev.filter(app => app.id !== id));
        toast.success(`Request ${id} approved`);
    };

    const missionStatuses = ['Backlog', 'Planning', 'In Progress', 'Review', 'Done'];

    return (
        <div className="p-4 space-y-4 animate-fade-in animate-in fade-in duration-500 ">
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
                    <Button
                        variant="outline"
                        onClick={() => setActiveTab('llm-models')}
                        className="rounded-md border-border/40 hover:bg-card text-foreground font-bold text-xs gap-2 px-4 shadow-sm"
                    >
                        <Settings2 className="w-4 h-4" />
                        Configuration
                    </Button>
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
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
                    <TabsTrigger value="llm-models" className="rounded-md gap-2 text-xs font-bold px-4 transition-all">
                        <Cpu className="w-3.5 h-3.5" /> LLM Models
                    </TabsTrigger>
                    <TabsTrigger value="approvals" className="rounded-md gap-2 text-xs font-bold px-4 transition-all">
                        <ShieldCheck className="w-3.5 h-3.5" /> Approvals
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="mt-0">
                    <OverviewContent
                        missions={missions}
                        stats={stats}
                        approvals={approvals}
                        config={config}
                        models={models}
                    />
                </TabsContent>

                <TabsContent value="terminal" className="mt-0">
                    <TerminalContent
                        chatMessages={chatMessages}
                        inputMessage={inputMessage}
                        setInputMessage={setInputMessage}
                        handleSendMessage={handleSendMessage}
                        agents={config || []}
                        selectedAgentId={selectedAgentId}
                        setSelectedAgentId={setSelectedAgentId}
                        isThinking={isThinking}
                    />
                </TabsContent>

                <TabsContent value="missions" className="mt-0">
                    <MissionsContent
                        missions={missions}
                        missionStatuses={missionStatuses}
                    />
                </TabsContent>

                <TabsContent value="scheduler" className="mt-0">
                    <SchedulerContent crons={crons} />
                </TabsContent>

                <TabsContent value="registry" className="mt-0">
                    <RegistryContent
                        config={config}
                        models={models}
                        onOpen={onOpen}
                        workspaceId={workspaceId}
                        userId={userId}
                        fetchAll={fetchAll}
                        setActiveTab={setActiveTab}
                        setSelectedAgentId={setSelectedAgentId}
                    />
                </TabsContent>

                <TabsContent value="llm-models" className="mt-0">
                    <Card className="border-border/40 bg-card/40 backdrop-blur-md rounded-md p-6">
                        <ModelMissionControl workspaceId={workspaceId} userId={userId} />
                    </Card>
                </TabsContent>

                <TabsContent value="approvals" className="mt-0">
                    <ApprovalsContent approvals={approvals} />
                </TabsContent>
            </Tabs>
            <AddAgentModelModal />
            <AddAgentPersonaModal />
        </div>
    );
}
