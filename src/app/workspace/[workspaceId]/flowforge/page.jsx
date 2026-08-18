'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';
import {
    Workflow,
    Zap,
    Play,
    Pause,
    Plus,
    Search,
    CheckCircle2,
    Clock,
    AlertCircle,
    ArrowUpRight,
    Sparkles,
    Layers,
    GitBranch,
    Bot,
    Send,
    MessageSquare,
    ShoppingBag,
    Database,
    ChevronRight,
    Activity,
    MoreVertical,
    Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { CreateWorkflowSheet } from './_components/CreateWorkflowSheet';
import { WorkflowCanvasModal } from './_components/WorkflowCanvasModal';
import { getWorkflows, toggleWorkflowStatus } from './_actions/workflow-actions';

export default function FlowForgeDashboard() {
    const params = useParams();
    const workspaceId = params?.workspaceId;
    const [searchQuery, setSearchQuery] = useState('');
    const [isCreateSheetOpen, setIsCreateSheetOpen] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [canvasWorkflow, setCanvasWorkflow] = useState(null);
    const [isCanvasOpen, setIsCanvasOpen] = useState(false);
    const [workflowList, setWorkflowList] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadWorkflows = async () => {
        setLoading(true);
        const res = await getWorkflows(workspaceId);
        if (res.success) {
            setWorkflowList(res.data);
        }
        setLoading(false);
    };

    useEffect(() => {
        loadWorkflows();
    }, [workspaceId]);

    const handleToggle = async (id) => {
        const res = await toggleWorkflowStatus(workspaceId, id);
        if (res.success) {
            toast.success(`Workflow ${res.data.status === 'active' ? 'resumed' : 'paused'}`);
            loadWorkflows();
        }
    };

    const handleUseBlueprint = (tpl) => {
        setSelectedTemplate({
            name: tpl.title,
            description: tpl.desc,
            category: tpl.category,
            trigger: tpl.trigger || 'eCommerce Order Created'
        });
        setIsCreateSheetOpen(true);
    };

    const stats = [
        { label: 'Active Workflows', value: workflowList.filter(w => w.status === 'active').length.toString(), change: '+3 this week', icon: Workflow, color: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20' },
        { label: 'Executions (24h)', value: '12,480', change: '99.4% success rate', icon: Zap, color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' },
        { label: 'Avg Execution Time', value: '340ms', change: '-12ms faster', icon: Clock, color: 'text-sky-500 bg-sky-500/10 border-sky-500/20' },
        { label: 'Failed Runs', value: '6', change: 'Auto-retried 5', icon: AlertCircle, color: 'text-rose-500 bg-rose-500/10 border-rose-500/20' }
    ];

    const templates = [
        { title: 'AI Support Auto-Responder', desc: 'Classifies incoming inquiries & sends instant smart answers.', category: 'Customer Support', trigger: 'Inbound WhatsApp Message', badge: 'Popular' },
        { title: 'Abandoned Cart WhatsApp Recovery', desc: 'Sends dynamic coupon 1 hr after cart abandonment.', category: 'Marketing', trigger: 'eCommerce Order Created', badge: 'High ROI' },
        { title: 'Automated Stripe Payment Sync', desc: 'Syncs successful transactions to customer records & accounts.', category: 'Finance & Billing', trigger: 'Custom Inbound Webhook', badge: 'Essential' }
    ];

    const filteredWorkflows = workflowList.filter(w =>
        w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        w.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        w.trigger.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
            {/* Header Banner */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-indigo-500/10 via-primary/5 to-transparent p-5 rounded-2xl border border-border/80">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                            <Workflow className="w-5 h-5 text-indigo-500" />
                        </div>
                        <h1 className="text-xl font-bold tracking-tight text-foreground">FlowForge Automation Engine</h1>
                        <Badge variant="outline" className="bg-indigo-500/10 text-indigo-500 border-indigo-500/30 text-[10px] font-mono">
                            WORKFLOW v1.0
                        </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground max-w-xl">
                        Design visual, multi-step automated pipelines across WhatsApp, AI, eCommerce, Forms, and external webhooks.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Link href={`/workspace/${workspaceId}/flowforge/templates`}>
                        <Button variant="outline" size="sm" className="h-8 text-xs border-border/80 gap-1.5 shadow-xs">
                            <Layers className="w-3.5 h-3.5" />
                            Templates
                        </Button>
                    </Link>
                    <Button
                        size="sm"
                        onClick={() => {
                            setSelectedTemplate(null);
                            setIsCreateSheetOpen(true);
                        }}
                        className="h-8 text-xs bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5 shadow-xs"
                    >
                        <Plus className="w-3.5 h-3.5" />
                        Create Workflow
                    </Button>
                </div>
            </div>

            {/* KPI Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                {stats.map((stat, i) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                    >
                        <Card className="bg-card border-border/80 shadow-xs hover:border-border transition-colors">
                            <CardHeader className="py-0 px-3 border-b border-border/40 space-y-0">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{stat.label}</span>
                                    <div className={`w-7 h-7 rounded-md flex items-center justify-center border shrink-0 ${stat.color}`}>
                                        <stat.icon className="w-3.5 h-3.5" />
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-3 pt-2">
                                <div className="text-xl font-bold text-foreground">{stat.value}</div>
                                <span className="text-[10px] text-muted-foreground">{stat.change}</span>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* Main Tabs */}
            <Tabs defaultValue="all" className="space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <TabsList className="bg-secondary/40 border border-border/60 p-0.5 h-8">
                        <TabsTrigger value="all" className="text-xs h-7">All Workflows (4)</TabsTrigger>
                        <TabsTrigger value="active" className="text-xs h-7">Active (3)</TabsTrigger>
                        <TabsTrigger value="paused" className="text-xs h-7">Paused (1)</TabsTrigger>
                        <TabsTrigger value="executions" className="text-xs h-7">Live Runs</TabsTrigger>
                    </TabsList>

                    <div className="relative w-full sm:w-64">
                        <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-muted-foreground" />
                        <Input
                            placeholder="Filter workflows..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="h-8 pl-8 text-xs bg-secondary/30 border-border/80"
                        />
                    </div>
                </div>

                <TabsContent value="all" className="space-y-3 mt-0">
                    {loading ? (
                        <div className="flex items-center justify-center p-12 text-xs text-muted-foreground gap-2">
                            <Loader2 className="w-4 h-4 animate-spin text-primary" /> Loading pipelines...
                        </div>
                    ) : filteredWorkflows.length === 0 ? (
                        <div className="p-12 text-center border border-dashed rounded-xl border-border/60">
                            <Workflow className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-50" />
                            <p className="text-xs font-semibold text-foreground">No workflows found</p>
                            <p className="text-[11px] text-muted-foreground mt-0.5">Click "Create Workflow" to build your first automation.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-3">
                            {filteredWorkflows.map((wf) => (
                                <Card key={wf.id} className="bg-card border-border/80 hover:border-indigo-500/40 transition-all shadow-xs">
                                    <CardContent className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <div className="space-y-1.5 flex-1 min-w-0">
                                            <div className="flex items-center gap-2.5 flex-wrap">
                                                <div className="p-1.5 rounded-lg bg-secondary/60 border border-border/60">
                                                    <Workflow className="w-4 h-4 text-indigo-500" />
                                                </div>
                                                <span className="font-semibold text-sm text-foreground">{wf.name}</span>
                                                <Badge
                                                    variant="outline"
                                                    className={`text-[9px] font-semibold uppercase px-2 py-0.5 rounded-full ${
                                                        wf.status === 'active'
                                                            ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                                                            : 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20'
                                                    }`}
                                                >
                                                    {wf.status}
                                                </Badge>
                                            </div>
                                            <p className="text-xs text-muted-foreground line-clamp-1">{wf.description}</p>
                                            <div className="flex items-center gap-4 text-[11px] text-muted-foreground pt-1 flex-wrap">
                                                <span className="flex items-center gap-1">
                                                    <Zap className="w-3 h-3 text-amber-500" /> Trigger: <span className="font-medium text-foreground">{wf.trigger}</span>
                                                </span>
                                                <span>•</span>
                                                <span>24h Runs: <span className="font-medium text-foreground">{wf.runs24h || 0}</span></span>
                                                <span>•</span>
                                                <span>Success: <span className="font-medium text-emerald-500">{wf.successRate || '100%'}</span></span>
                                                <span>•</span>
                                                <span>Last run: <span className="font-mono text-foreground">{wf.lastRun || 'Never'}</span></span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 shrink-0">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="h-8 text-xs border-border/80 gap-1"
                                                onClick={() => handleToggle(wf.id)}
                                            >
                                                {wf.status === 'active' ? <Pause className="w-3 h-3 text-muted-foreground" /> : <Play className="w-3 h-3 text-emerald-500" />}
                                                <span>{wf.status === 'active' ? 'Pause' : 'Resume'}</span>
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="secondary"
                                                onClick={() => {
                                                    setCanvasWorkflow(wf);
                                                    setIsCanvasOpen(true);
                                                }}
                                                className="h-8 text-xs border border-border/60 gap-1 hover:bg-indigo-500/10 hover:text-indigo-500"
                                            >
                                                <span>Edit Canvas</span>
                                                <ChevronRight className="w-3.5 h-3.5" />
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </TabsContent>
            </Tabs>

            {/* Template Gallery */}
            <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                            <Sparkles className="w-4 h-4 text-amber-500" />
                            Popular Automation Blueprints
                        </h2>
                        <p className="text-xs text-muted-foreground">Get started in seconds with pre-configured multi-channel workflows.</p>
                    </div>
                    <Link href={`/workspace/${workspaceId}/flowforge/templates`}>
                        <Button variant="ghost" size="sm" className="text-xs text-primary gap-1">
                            Explore all templates <ArrowUpRight className="w-3.5 h-3.5" />
                        </Button>
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {templates.map((tpl) => (
                        <Card key={tpl.title} className="bg-card border-border/80 hover:border-indigo-500/30 transition-all p-4 space-y-2.5">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-semibold text-muted-foreground uppercase">{tpl.category}</span>
                                <Badge className="text-[9px] bg-primary/10 text-primary border-primary/20">{tpl.badge}</Badge>
                            </div>
                            <div>
                                <h3 className="font-semibold text-xs text-foreground">{tpl.title}</h3>
                                <p className="text-[11px] text-muted-foreground mt-0.5">{tpl.desc}</p>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleUseBlueprint(tpl)}
                                className="w-full text-xs h-7 border-border/80 mt-1"
                            >
                                Use Blueprint
                            </Button>
                        </Card>
                    ))}
                </div>
            </div>

            {/* Create Workflow Sheet Modal */}
            <CreateWorkflowSheet
                open={isCreateSheetOpen}
                onOpenChange={setIsCreateSheetOpen}
                workspaceId={workspaceId}
                initialData={selectedTemplate}
                onWorkflowCreated={() => loadWorkflows()}
            />

            {/* Workflow Canvas Modal */}
            <WorkflowCanvasModal
                open={isCanvasOpen}
                onOpenChange={setIsCanvasOpen}
                workflow={canvasWorkflow}
            />
        </div>
    );
}
