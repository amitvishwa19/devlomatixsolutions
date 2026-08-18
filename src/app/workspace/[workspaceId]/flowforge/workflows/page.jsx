'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { motion } from 'framer-motion';
import {
    Workflow,
    Plus,
    Search,
    Play,
    Pause,
    Trash2,
    Edit,
    Zap,
    Clock,
    GitBranch,
    ChevronRight,
    Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { getWorkflows, toggleWorkflowStatus, deleteWorkflow } from '../_actions/workflow-actions';
import { CreateWorkflowSheet } from '../_components/CreateWorkflowSheet';
import { WorkflowCanvasModal } from '../_components/WorkflowCanvasModal';

export default function FlowForgeWorkflowsPage() {
    const params = useParams();
    const workspaceId = params?.workspaceId;

    const [workflows, setWorkflows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [canvasWorkflow, setCanvasWorkflow] = useState(null);
    const [isCanvasOpen, setIsCanvasOpen] = useState(false);

    const loadData = async () => {
        setLoading(true);
        const res = await getWorkflows(workspaceId);
        if (res.success) {
            setWorkflows(res.data);
        } else {
            toast.error("Failed to load workflows");
        }
        setLoading(false);
    };

    useEffect(() => {
        loadData();
    }, [workspaceId]);

    const handleToggle = async (id) => {
        const res = await toggleWorkflowStatus(workspaceId, id);
        if (res.success) {
            toast.success(`Workflow ${res.data.status === 'active' ? 'activated' : 'paused'}`);
            loadData();
        }
    };

    const handleDelete = async (id) => {
        const res = await deleteWorkflow(workspaceId, id);
        if (res.success) {
            toast.success("Workflow deleted");
            loadData();
        }
    };

    const filtered = workflows.filter(w =>
        w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        w.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
                            <GitBranch className="w-4 h-4 text-indigo-500" />
                        </div>
                        <h1 className="text-lg font-bold text-foreground">Workflows Canvas & Pipelines</h1>
                    </div>
                    <p className="text-xs text-muted-foreground">Manage, build, and orchestrate automated business processes.</p>
                </div>

                <Button
                    size="sm"
                    onClick={() => setIsCreateOpen(true)}
                    className="h-8 text-xs bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5 shadow-xs"
                >
                    <Plus className="w-3.5 h-3.5" />
                    New Workflow
                </Button>
            </div>

            {/* Search */}
            <div className="relative max-w-md">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-muted-foreground" />
                <Input
                    placeholder="Search workflows by title or trigger..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-8 pl-8 text-xs bg-secondary/30 border-border/80"
                />
            </div>

            {/* List */}
            {loading ? (
                <div className="flex items-center justify-center p-12 text-muted-foreground text-xs gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-primary" /> Loading pipelines...
                </div>
            ) : filtered.length === 0 ? (
                <div className="p-12 text-center border border-dashed rounded-xl border-border/60">
                    <Workflow className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-50" />
                    <p className="text-xs font-semibold text-foreground">No workflows found</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">Create your first automated workflow to get started.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-3">
                    {filtered.map((wf) => (
                        <Card key={wf.id} className="bg-card border-border/80 hover:border-indigo-500/40 transition-all p-4 shadow-xs">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="space-y-1.5 flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <div className="p-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
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
                                        <Badge variant="secondary" className="text-[9px] font-mono">
                                            {wf.nodesCount || 4} steps
                                        </Badge>
                                    </div>
                                    <p className="text-xs text-muted-foreground">{wf.description}</p>
                                    <div className="flex items-center gap-4 text-[11px] text-muted-foreground pt-1 flex-wrap">
                                        <span className="flex items-center gap-1">
                                            <Zap className="w-3 h-3 text-amber-500" />
                                            Trigger: <span className="font-medium text-foreground">{wf.trigger}</span>
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
                                        <Edit className="w-3 h-3" />
                                        <span>Edit</span>
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-rose-500 hover:bg-rose-500/10"
                                        onClick={() => handleDelete(wf.id)}
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            {/* Create Workflow Sheet Modal */}
            <CreateWorkflowSheet
                open={isCreateOpen}
                onOpenChange={setIsCreateOpen}
                workspaceId={workspaceId}
                onWorkflowCreated={() => loadData()}
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
