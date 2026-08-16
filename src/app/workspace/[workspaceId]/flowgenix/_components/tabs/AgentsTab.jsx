'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
    Bot, 
    Plus, 
    Sparkles, 
    Search, 
    RefreshCw, 
    Trash2, 
    Edit3, 
    Play, 
    Cpu, 
    Layers, 
    Globe, 
    Calculator, 
    Brain, 
    Zap, 
    CheckCircle2, 
    AlertCircle, 
    Loader2, 
    MessageSquare, 
    ShieldCheck, 
    Terminal, 
    Database, 
    Code, 
    Workflow,
    ArrowRight,
    X,
    Check,
    Radio
} from 'lucide-react';
import { toast } from 'sonner';
import { 
    getAgentsAction, 
    upsertAgentAction, 
    toggleAgentStatusAction, 
    deleteAgentAction 
} from '../../_action/agent-actions';
import { getProvidersAction } from '../../_action/provider-actions';

export function AgentsTab({ workspaceId }) {
    const [agents, setAgents] = useState([]);
    const [providers, setProviders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [typeFilter, setTypeFilter] = useState('all');

    // Create / Edit modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [editingAgent, setEditingAgent] = useState(null);

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        role: 'Specialist Agent',
        type: 'OpenClaw',
        status: 'online',
        strategy: 'SEQUENTIAL',
        description: '',
        isMain: false,
        systemPrompt: 'You are an autonomous AI agent. Assist the user with precise execution and tool usage.',
        temperature: 0.2,
        maxIterations: 6,
        tools: ['web_search', 'calculator'],
        modelAssignments: []
    });

    // Test runner modal state
    const [testAgent, setTestAgent] = useState(null);
    const [testPrompt, setTestPrompt] = useState('');
    const [testOutput, setTestOutput] = useState('');
    const [testingAgent, setTestingAgent] = useState(false);

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const [agentsRes, providersRes] = await Promise.all([
                getAgentsAction(workspaceId),
                getProvidersAction(workspaceId)
            ]);

            if (agentsRes.success) {
                setAgents(agentsRes.data || []);
            } else {
                toast.error(agentsRes.error || "Failed to load agents");
            }

            if (providersRes.success) {
                setProviders(providersRes.data || []);
            }
        } catch (err) {
            console.error("Error loading agent data:", err);
            toast.error("Failed to load workspace data");
        } finally {
            setLoading(false);
        }
    }, [workspaceId]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleOpenCreate = () => {
        setEditingAgent(null);
        setFormData({
            name: '',
            role: 'Specialist Agent',
            type: 'OpenClaw',
            status: 'online',
            strategy: 'SEQUENTIAL',
            description: '',
            isMain: false,
            systemPrompt: 'You are an autonomous AI agent. Assist the user with precise execution and tool usage.',
            temperature: 0.2,
            maxIterations: 6,
            tools: ['web_search', 'calculator'],
            modelAssignments: providers.length > 0 ? [providers[0].id] : []
        });
        setIsModalOpen(true);
    };

    const handleOpenEdit = (agent) => {
        setEditingAgent(agent);
        const config = agent.config || {};
        const assignedModelIds = agent.models?.map(m => m.modelId || m.model?.id).filter(Boolean) || [];

        setFormData({
            name: agent.name || '',
            role: agent.role || 'Specialist Agent',
            type: agent.type || 'OpenClaw',
            status: agent.status || 'online',
            strategy: agent.strategy || 'SEQUENTIAL',
            description: agent.description || '',
            isMain: Boolean(agent.isMain),
            systemPrompt: config.systemPrompt || '',
            temperature: config.temperature ?? 0.2,
            maxIterations: config.maxIterations ?? 6,
            tools: Array.isArray(config.tools) ? config.tools : ['web_search', 'calculator'],
            modelAssignments: assignedModelIds.length > 0 ? assignedModelIds : (providers.length > 0 ? [providers[0].id] : [])
        });
        setIsModalOpen(true);
    };

    const handleSaveAgent = async (e) => {
        e.preventDefault();
        if (!formData.name.trim()) {
            toast.error("Please enter an agent name");
            return;
        }

        setSubmitting(true);
        try {
            const res = await upsertAgentAction({
                workspaceId,
                id: editingAgent?.id,
                name: formData.name.trim(),
                role: formData.role,
                type: formData.type,
                status: formData.status,
                description: formData.description,
                isMain: formData.isMain,
                strategy: formData.strategy,
                config: {
                    systemPrompt: formData.systemPrompt,
                    temperature: parseFloat(formData.temperature) || 0.2,
                    maxIterations: parseInt(formData.maxIterations) || 6,
                    tools: formData.tools
                },
                modelAssignments: formData.modelAssignments
            });

            if (res.success) {
                toast.success(editingAgent ? "Agent updated successfully" : "Agent created successfully");
                setIsModalOpen(false);
                loadData();
            } else {
                toast.error(res.error || "Failed to save agent");
            }
        } catch (error) {
            console.error("Save Agent Error:", error);
            toast.error("An unexpected error occurred");
        } finally {
            setSubmitting(false);
        }
    };

    const handleToggleStatus = async (agent) => {
        const nextStatus = agent.status === 'online' ? 'offline' : 'online';
        try {
            const res = await toggleAgentStatusAction({
                id: agent.id,
                status: nextStatus,
                workspaceId
            });

            if (res.success) {
                setAgents(prev => prev.map(a => a.id === agent.id ? { ...a, status: nextStatus } : a));
                toast.success(`Agent is now ${nextStatus}`);
            } else {
                toast.error(res.error || "Failed to toggle status");
            }
        } catch (err) {
            toast.error("Failed to update status");
        }
    };

    const handleDelete = async (agentId) => {
        if (!confirm("Are you sure you want to delete this agent?")) return;

        try {
            const res = await deleteAgentAction({ id: agentId, workspaceId });
            if (res.success) {
                setAgents(prev => prev.filter(a => a.id !== agentId));
                toast.success("Agent removed");
            } else {
                toast.error(res.error || "Failed to delete agent");
            }
        } catch (err) {
            toast.error("Failed to delete agent");
        }
    };

    const toggleTool = (toolKey) => {
        setFormData(prev => {
            const tools = prev.tools.includes(toolKey)
                ? prev.tools.filter(t => t !== toolKey)
                : [...prev.tools, toolKey];
            return { ...prev, tools };
        });
    };

    const handleRunQuickTest = async (e) => {
        e.preventDefault();
        if (!testPrompt.trim() || !testAgent) return;

        setTestingAgent(true);
        setTestOutput('');

        try {
            // Find configured model or default gateway
            const assignedModel = testAgent.models?.[0]?.model?.name || 'openrouter/auto';
            const res = await fetch(`/api/workspace/${workspaceId}/flowgenix/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: assignedModel,
                    messages: [
                        { role: 'system', content: testAgent.config?.systemPrompt || 'You are an AI Agent.' },
                        { role: 'user', content: testPrompt }
                    ],
                    stream: true
                })
            });

            if (!res.ok) {
                const err = await res.text();
                setTestOutput(`[Error]: ${err}`);
                setTestingAgent(false);
                return;
            }

            const reader = res.body.getReader();
            const decoder = new TextDecoder('utf-8');
            let accumulated = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                const lines = chunk.split('\n');

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const dataStr = line.replace('data: ', '').trim();
                        if (dataStr === '[DONE]') continue;
                        try {
                            const parsed = JSON.parse(dataStr);
                            const content = parsed.choices?.[0]?.delta?.content || '';
                            accumulated += content;
                            setTestOutput(accumulated);
                        } catch (e) {
                            // Raw text chunk fallback
                            accumulated += dataStr;
                            setTestOutput(accumulated);
                        }
                    }
                }
            }
        } catch (err) {
            console.error("Test execution failed:", err);
            setTestOutput(`[Execution Failure]: ${err.message}`);
        } finally {
            setTestingAgent(false);
        }
    };

    // Filtered agents
    const filteredAgents = agents.filter(agent => {
        const matchesQuery = 
            agent.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            agent.role?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            agent.description?.toLowerCase().includes(searchQuery.toLowerCase());
        
        const matchesStatus = statusFilter === 'all' || agent.status === statusFilter;
        const matchesType = typeFilter === 'all' || agent.type === typeFilter;

        return matchesQuery && matchesStatus && matchesType;
    });

    const onlineCount = agents.filter(a => a.status === 'online').length;
    const masterCount = agents.filter(a => a.isMain || a.type === 'Master Coordinator').length;

    const availableToolsList = [
        { id: 'web_search', label: 'Web Search', icon: Globe, desc: 'Real-time live internet grounding' },
        { id: 'calculator', label: 'Calculator', icon: Calculator, desc: 'Math parser & expression evaluator' },
        { id: 'code_sandbox', label: 'Code Execution', icon: Code, desc: 'Python & JS code sandbox runner' },
        { id: 'memory_rag', label: 'Vector Memory', icon: Database, desc: 'Context retrieval & episodic store' },
        { id: 'model_router', label: 'Gateway Router', icon: Zap, desc: 'Dynamic model sub-delegation' }
    ];

    return (
        <div className="space-y-6 pb-6">
            {/* Header & Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl border border-border/50 bg-card/40">
                <div>
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400">
                            <Bot className="w-5 h-5" />
                        </div>
                        <h2 className="text-base font-bold">AI Agents & Autonomous Swarms</h2>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                        Deploy specialized AI agents with fallback model chains, tool privileges, and coordinated swarm execution.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button onClick={loadData} variant="outline" size="sm" className="text-xs h-9 gap-1.5" disabled={loading}>
                        <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                    <Button 
                        onClick={handleOpenCreate} 
                        size="sm" 
                        className="bg-linear-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-semibold text-xs h-9 gap-1.5 shadow-sm shadow-purple-500/20"
                    >
                        <Plus className="w-4 h-4" /> Create Agent
                    </Button>
                </div>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <Card className="p-3.5 border-border/40 bg-card/30">
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Configured Agents</span>
                        <Bot className="w-4 h-4 text-purple-400" />
                    </div>
                    <p className="text-2xl font-bold mt-2 font-mono">{agents.length}</p>
                    <span className="text-[10px] text-muted-foreground">Ready for orchestration</span>
                </Card>

                <Card className="p-3.5 border-border/40 bg-card/30">
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Active & Online</span>
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    </div>
                    <p className="text-2xl font-bold mt-2 font-mono text-emerald-400">{onlineCount}</p>
                    <span className="text-[10px] text-muted-foreground">Serving requests</span>
                </Card>

                <Card className="p-3.5 border-border/40 bg-card/30">
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Master Coordinators</span>
                        <Workflow className="w-4 h-4 text-indigo-400" />
                    </div>
                    <p className="text-2xl font-bold mt-2 font-mono text-indigo-400">{masterCount}</p>
                    <span className="text-[10px] text-muted-foreground">Swarm root nodes</span>
                </Card>

                <Card className="p-3.5 border-border/40 bg-card/30">
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Gateway Providers</span>
                        <Cpu className="w-4 h-4 text-sky-400" />
                    </div>
                    <p className="text-2xl font-bold mt-2 font-mono">{providers.length}</p>
                    <span className="text-[10px] text-muted-foreground">Available for binding</span>
                </Card>
            </div>

            {/* Filter and Search Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="relative flex-1 w-full sm:max-w-md">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search agents by name, role, or description..."
                        className="pl-9 bg-secondary/30 border-border/40 text-xs h-9"
                    />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-[120px] text-xs h-9 bg-secondary/30 border-border/40">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Statuses</SelectItem>
                            <SelectItem value="online">Online</SelectItem>
                            <SelectItem value="standby">Standby</SelectItem>
                            <SelectItem value="offline">Offline</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                        <SelectTrigger className="w-[140px] text-xs h-9 bg-secondary/30 border-border/40">
                            <SelectValue placeholder="Type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Types</SelectItem>
                            <SelectItem value="OpenClaw">OpenClaw</SelectItem>
                            <SelectItem value="Swarm Worker">Swarm Worker</SelectItem>
                            <SelectItem value="Research Agent">Research Agent</SelectItem>
                            <SelectItem value="Custom">Custom</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Agent Grid */}
            {loading ? (
                <div className="py-20 flex flex-col items-center justify-center gap-3">
                    <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
                    <p className="text-xs font-mono text-muted-foreground">Loading workspace agents...</p>
                </div>
            ) : filteredAgents.length === 0 ? (
                <Card className="p-12 text-center border-dashed border-border/60 bg-card/20 flex flex-col items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-400 mb-3 border border-purple-500/20">
                        <Bot className="w-6 h-6" />
                    </div>
                    <h3 className="text-sm font-bold">No Agents Found</h3>
                    <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                        {searchQuery ? "No agents match your active search filters." : "Create your first AI Agent to automate workflows, route complex tasks, and run multi-agent swarms."}
                    </p>
                    <Button onClick={handleOpenCreate} size="sm" className="mt-4 text-xs bg-purple-600 hover:bg-purple-700">
                        <Plus className="w-4 h-4 mr-1.5" /> Create Agent
                    </Button>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredAgents.map((agent) => {
                        const config = agent.config || {};
                        const tools = Array.isArray(config.tools) ? config.tools : [];
                        const isOnline = agent.status === 'online';

                        return (
                            <Card key={agent.id} className="border-border/50 bg-card hover:border-purple-500/40 transition-all flex flex-col justify-between group">
                                <div>
                                    {/* Header */}
                                    <CardHeader className="p-4 pb-3">
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="flex items-center gap-2.5">
                                                <div className="relative">
                                                    <div className="w-9 h-9 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                                                        <Bot className="w-5 h-5" />
                                                    </div>
                                                    <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-card ${
                                                        isOnline ? 'bg-emerald-500' : agent.status === 'standby' ? 'bg-amber-500' : 'bg-zinc-500'
                                                    }`} />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-1.5">
                                                        <CardTitle className="text-sm font-bold truncate max-w-[160px]">
                                                            {agent.name}
                                                        </CardTitle>
                                                        {agent.isMain && (
                                                            <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 text-[9px] px-1 py-0 font-semibold">
                                                                MASTER
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <CardDescription className="text-[11px] text-muted-foreground truncate max-w-[160px]">
                                                        {agent.role || 'Autonomous Agent'}
                                                    </CardDescription>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-1">
                                                <Switch 
                                                    checked={isOnline} 
                                                    onCheckedChange={() => handleToggleStatus(agent)}
                                                    className="scale-75 data-[state=checked]:bg-emerald-500"
                                                />
                                            </div>
                                        </div>
                                    </CardHeader>

                                    {/* Content & Capabilities */}
                                    <CardContent className="p-4 pt-0 space-y-3">
                                        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 min-h-[32px]">
                                            {agent.description || config.systemPrompt || "Autonomous agent ready for multi-step reasoning and tool calls."}
                                        </p>

                                        {/* Strategy & Model Info */}
                                        <div className="space-y-1.5 p-2 rounded-lg bg-secondary/30 border border-border/30 text-[11px]">
                                            <div className="flex items-center justify-between text-muted-foreground">
                                                <span className="font-semibold text-foreground/80 flex items-center gap-1">
                                                    <Workflow className="w-3 h-3 text-purple-400" /> Strategy:
                                                </span>
                                                <Badge variant="outline" className="text-[9px] uppercase font-mono px-1.5 py-0 bg-background/50">
                                                    {agent.strategy || "SEQUENTIAL"}
                                                </Badge>
                                            </div>
                                            <div className="flex items-center justify-between text-muted-foreground">
                                                <span className="font-semibold text-foreground/80 flex items-center gap-1">
                                                    <Cpu className="w-3 h-3 text-sky-400" /> Assigned Models:
                                                </span>
                                                <span className="font-mono text-[10px] text-foreground/90 truncate max-w-[120px]">
                                                    {agent.models?.length > 0 ? `${agent.models.length} model(s)` : 'Gateway Auto'}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Enabled Tools */}
                                        <div className="space-y-1">
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                                Active Tools ({tools.length})
                                            </span>
                                            <div className="flex flex-wrap gap-1">
                                                {tools.length === 0 ? (
                                                    <span className="text-[10px] text-muted-foreground italic">No tools attached</span>
                                                ) : (
                                                    tools.map(toolKey => (
                                                        <Badge key={toolKey} variant="secondary" className="text-[9px] font-mono px-1.5 py-0 bg-secondary/50 border border-border/40 text-foreground/80">
                                                            {toolKey.replace('_', ' ')}
                                                        </Badge>
                                                    ))
                                                )}
                                            </div>
                                        </div>
                                    </CardContent>
                                </div>

                                {/* Card Footer Actions */}
                                <CardFooter className="p-3 border-t border-border/40 flex items-center justify-between gap-2 bg-secondary/10">
                                    <div className="flex items-center gap-1">
                                        <Button 
                                            onClick={() => {
                                                setTestAgent(agent);
                                                setTestPrompt('');
                                                setTestOutput('');
                                            }}
                                            size="sm" 
                                            variant="outline" 
                                            className="text-xs h-8 px-2.5 gap-1.5 text-purple-400 hover:text-purple-300 hover:bg-purple-500/10 border-purple-500/30"
                                        >
                                            <Play className="w-3 h-3" /> Quick Test
                                        </Button>
                                    </div>
                                    
                                    <div className="flex items-center gap-1">
                                        <Button 
                                            onClick={() => handleOpenEdit(agent)}
                                            size="icon" 
                                            variant="ghost" 
                                            className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                        >
                                            <Edit3 className="w-3.5 h-3.5" />
                                        </Button>
                                        <Button 
                                            onClick={() => handleDelete(agent.id)}
                                            size="icon" 
                                            variant="ghost" 
                                            className="h-8 w-8 text-rose-500 hover:text-rose-400 hover:bg-rose-500/10"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </Button>
                                    </div>
                                </CardFooter>
                            </Card>
                        );
                    })}
                </div>
            )}

            {/* Create / Edit Agent Dialog */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="sm:max-w-2xl bg-card border-border max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-base font-bold flex items-center gap-2">
                            <Bot className="w-5 h-5 text-purple-500" />
                            {editingAgent ? `Edit Agent: ${editingAgent.name}` : "Configure New AI Agent"}
                        </DialogTitle>
                        <DialogDescription className="text-xs text-muted-foreground">
                            Specify behavior, fallback models, execution strategy, and capability tools.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSaveAgent} className="space-y-4 py-2">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold">Agent Name</label>
                                <Input 
                                    value={formData.name}
                                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                    placeholder="e.g. Code Review Architect"
                                    className="h-9 text-xs bg-secondary/30"
                                    required
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold">Role / Domain</label>
                                <Input 
                                    value={formData.role}
                                    onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                                    placeholder="e.g. Software Engineering"
                                    className="h-9 text-xs bg-secondary/30"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold">Agent Type</label>
                                <Select value={formData.type} onValueChange={(val) => setFormData(prev => ({ ...prev, type: val }))}>
                                    <SelectTrigger className="h-9 text-xs bg-secondary/30">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="OpenClaw">OpenClaw</SelectItem>
                                        <SelectItem value="Swarm Worker">Swarm Worker</SelectItem>
                                        <SelectItem value="Master Coordinator">Master Coordinator</SelectItem>
                                        <SelectItem value="Research Agent">Research Agent</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold">Execution Strategy</label>
                                <Select value={formData.strategy} onValueChange={(val) => setFormData(prev => ({ ...prev, strategy: val }))}>
                                    <SelectTrigger className="h-9 text-xs bg-secondary/30">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="SEQUENTIAL">Sequential (Fallback)</SelectItem>
                                        <SelectItem value="PARALLEL">Parallel (Race)</SelectItem>
                                        <SelectItem value="ROUND_ROBIN">Round Robin</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold">Temperature ({formData.temperature})</label>
                                <Input 
                                    type="number"
                                    step="0.05"
                                    min="0"
                                    max="1"
                                    value={formData.temperature}
                                    onChange={(e) => setFormData(prev => ({ ...prev, temperature: e.target.value }))}
                                    className="h-9 text-xs bg-secondary/30"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold">Description</label>
                            <Input 
                                value={formData.description}
                                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                placeholder="Brief overview of agent responsibilities..."
                                className="h-9 text-xs bg-secondary/30"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold">System Prompt / Instructions</label>
                            <Textarea 
                                rows={4}
                                value={formData.systemPrompt}
                                onChange={(e) => setFormData(prev => ({ ...prev, systemPrompt: e.target.value }))}
                                placeholder="Define persona, goals, output format, and constraint guidelines..."
                                className="text-xs bg-secondary/30 resize-none font-mono"
                            />
                        </div>

                        {/* Model Binding Selection */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold flex items-center justify-between">
                                <span>Primary Model Binding</span>
                                <span className="text-[10px] text-muted-foreground">From configured providers</span>
                            </label>
                            {providers.length === 0 ? (
                                <p className="text-[11px] text-amber-500/80 bg-amber-500/10 p-2.5 rounded-lg border border-amber-500/20">
                                    No providers configured yet. The agent will default to the global OmniRoute Gateway.
                                </p>
                            ) : (
                                <Select 
                                    value={formData.modelAssignments[0] || 'default'} 
                                    onValueChange={(val) => setFormData(prev => ({ ...prev, modelAssignments: val === 'default' ? [] : [val] }))}
                                >
                                    <SelectTrigger className="h-9 text-xs bg-secondary/30">
                                        <SelectValue placeholder="Select primary model" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="default">Default Gateway Auto-Router</SelectItem>
                                        {providers.map(p => (
                                            <SelectItem key={p.id} value={p.id}>
                                                {p.label || p.name} ({p.provider})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        </div>

                        {/* Tools Selection Grid */}
                        <div className="space-y-2">
                            <label className="text-xs font-semibold">Tool Privileges</label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {availableToolsList.map(tool => {
                                    const isChecked = formData.tools.includes(tool.id);
                                    return (
                                        <div 
                                            key={tool.id}
                                            onClick={() => toggleTool(tool.id)}
                                            className={`p-2.5 rounded-lg border cursor-pointer transition-all flex items-start gap-2.5 ${
                                                isChecked 
                                                    ? 'bg-purple-500/10 border-purple-500/40 text-purple-300' 
                                                    : 'bg-secondary/20 border-border/40 text-muted-foreground hover:bg-secondary/40'
                                            }`}
                                        >
                                            <div className={`p-1 rounded mt-0.5 ${isChecked ? 'bg-purple-500/20 text-purple-400' : 'bg-secondary text-muted-foreground'}`}>
                                                <tool.icon className="w-3.5 h-3.5" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs font-bold text-foreground">{tool.label}</span>
                                                    {isChecked && <Check className="w-3 h-3 text-purple-400" />}
                                                </div>
                                                <p className="text-[10px] text-muted-foreground leading-tight mt-0.5">{tool.desc}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Master Agent Toggle */}
                        <div className="flex items-center justify-between p-3 rounded-lg border border-border/40 bg-secondary/20">
                            <div>
                                <label className="text-xs font-bold text-foreground">Designate as Master Coordinator</label>
                                <p className="text-[10px] text-muted-foreground">Allows this agent to delegate tasks to sub-agents in a swarm.</p>
                            </div>
                            <Switch 
                                checked={formData.isMain}
                                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isMain: checked }))}
                                className="data-[state=checked]:bg-purple-600"
                            />
                        </div>

                        <DialogFooter className="pt-2">
                            <Button type="button" variant="outline" size="sm" onClick={() => setIsModalOpen(false)} disabled={submitting}>
                                Cancel
                            </Button>
                            <Button type="submit" size="sm" className="bg-purple-600 hover:bg-purple-700 text-white font-semibold" disabled={submitting}>
                                {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                {editingAgent ? "Update Agent" : "Create Agent"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Quick Test Runner Modal */}
            <Dialog open={Boolean(testAgent)} onOpenChange={(open) => !open && setTestAgent(null)}>
                <DialogContent className="sm:max-w-xl bg-card border-border max-h-[85vh] flex flex-col">
                    <DialogHeader>
                        <DialogTitle className="text-base font-bold flex items-center gap-2">
                            <Play className="w-4 h-4 text-purple-400" />
                            Quick Test: {testAgent?.name}
                        </DialogTitle>
                        <DialogDescription className="text-xs text-muted-foreground">
                            Execute a test prompt through this agent to verify behavior and tool execution.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex-1 min-h-0 space-y-3 py-2 flex flex-col">
                        <form onSubmit={handleRunQuickTest} className="space-y-2">
                            <label className="text-xs font-semibold">Test Prompt</label>
                            <div className="flex gap-2">
                                <Input 
                                    value={testPrompt}
                                    onChange={(e) => setTestPrompt(e.target.value)}
                                    placeholder="e.g. Explain how to optimize Redis cache eviction strategies..."
                                    className="text-xs h-10 bg-secondary/30 flex-1"
                                    disabled={testingAgent}
                                />
                                <Button 
                                    type="submit" 
                                    disabled={testingAgent || !testPrompt.trim()}
                                    className="h-10 px-4 bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs"
                                >
                                    {testingAgent ? <Loader2 className="w-4 h-4 animate-spin" /> : "Run"}
                                </Button>
                            </div>
                        </form>

                        <div className="flex-1 min-h-[220px] rounded-lg border border-border/40 bg-black/40 p-3 overflow-y-auto font-mono text-xs text-foreground/90 space-y-2">
                            {testingAgent && !testOutput && (
                                <div className="flex items-center gap-2 text-muted-foreground animate-pulse py-6 justify-center">
                                    <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
                                    <span>Agent reasoning and generating response...</span>
                                </div>
                            )}

                            {testOutput ? (
                                <div className="whitespace-pre-wrap leading-relaxed">
                                    {testOutput}
                                </div>
                            ) : !testingAgent && (
                                <div className="h-full flex flex-col items-center justify-center text-center opacity-40 py-12">
                                    <Terminal className="w-8 h-8 mb-2" />
                                    <p className="text-xs">Prompt the agent to see live output stream here.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" size="sm" onClick={() => setTestAgent(null)}>
                            Close
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
