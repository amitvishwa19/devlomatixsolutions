'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    Plus,
    GitBranch,
    Search,
    MoreVertical,
    Play,
    Clock,
    AlertCircle,
    ChevronRight,
    LayoutGrid,
    List,
    Trash2,
    Settings
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import axios from '@/utils/axios';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

export default function FlowBotDashboard() {
    const { workspaceId } = useParams();
    const router = useRouter();
    const [workflows, setWorkflows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState('grid');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [newFlow, setNewFlow] = useState({ name: '', description: '' });
    const [creating, setCreating] = useState(false);

    const fetchWorkflows = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`/api/workspace/${workspaceId}/flowbot`);
            if (res.data?.success) {
                setWorkflows(res.data.data);
            }
        } catch (err) {
            toast.error("Failed to load automation workflows");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWorkflows();
    }, [workspaceId]);

    const handleCreateWorkflow = async () => {
        if (!newFlow.name.trim()) return toast.error("Please enter a name for your flow");

        try {
            setCreating(true);
            const res = await axios.post(`/api/workspace/${workspaceId}/flowbot`, newFlow);
            if (res.data?.success) {
                toast.success("Flowbot created successfully");
                router.push(`/workspace/${workspaceId}/flowbot/${res.data.data.id}`);
            }
        } catch (err) {
            toast.error("Failed to create flowbot");
        } finally {
            setCreating(false);
            setIsCreateModalOpen(false);
        }
    };

    const handleDeleteWorkflow = async (id) => {
        if (!confirm("Are you sure you want to delete this workflow? This cannot be undone.")) return;

        try {
            const res = await axios.delete(`/api/workspace/${workspaceId}/flowbot/${id}`);
            if (res.data?.success) {
                toast.success("Workflow deleted");
                setWorkflows(workflows.filter(w => w.id !== id));
            }
        } catch (err) {
            toast.error("Failed to delete workflow");
        }
    };

    const filteredWorkflows = workflows.filter(w =>
        w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        w.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="flex flex-col h-full  overflow-auto p-4 space-y-4">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl font-bold ">Flow Bot</h1>
                    <p className="text-xs text-muted-foreground mt-1">Manage and monitor your visual automation workflows.</p>
                </div>

                <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 transition-all active:scale-95 px-6">
                            <Plus className="w-4 h-4 mr-2" />
                            Create New Flow
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Create Automation Flow</DialogTitle>
                            <DialogDescription>
                                Give your flowbot a name and short description to get started.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Name</label>
                                <Input
                                    placeholder="e.g. Lead Generation Webhook"
                                    value={newFlow.name}
                                    onChange={(e) => setNewFlow({ ...newFlow, name: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Description (Optional)</label>
                                <textarea
                                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    placeholder="Briefly describe what this flow does..."
                                    value={newFlow.description}
                                    onChange={(e) => setNewFlow({ ...newFlow, description: e.target.value })}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>Cancel</Button>
                            <Button onClick={handleCreateWorkflow} disabled={creating} className="min-w-[100px]">
                                {creating ? "Creating..." : "Start Building"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-card/50 backdrop-blur-sm border-primary/10 transition-colors hover:border-primary/20">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Automations</CardTitle>
                        <GitBranch className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{workflows.length}</div>
                        <p className="text-xs text-muted-foreground mt-1">Configured in this workspace</p>
                    </CardContent>
                </Card>
                <Card className="bg-card/50 backdrop-blur-sm border-emerald-500/10 transition-colors hover:border-emerald-500/20">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Flows</CardTitle>
                        <Play className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-emerald-500">{workflows.filter(w => w.status === 'ACTIVE').length}</div>
                        <p className="text-xs text-muted-foreground mt-1">Running in production</p>
                    </CardContent>
                </Card>
                <Card className="bg-card/50 backdrop-blur-sm border-amber-500/10 transition-colors hover:border-amber-500/20">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Drafts</CardTitle>
                        <AlertCircle className="h-4 w-4 text-amber-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-amber-500">{workflows.filter(w => w.status === 'DRAFT').length}</div>
                        <p className="text-xs text-muted-foreground mt-1">Work in progress</p>
                    </CardContent>
                </Card>
            </div>

            {/* Content Filters */}
            <div className="flex items-center gap-4 bg-card/30 p-2 rounded-lg border border-border/50">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Search workflows by name or description..."
                        className="pl-10 h-10 bg-background/50 border-none focus-within:ring-1 focus-within:ring-primary/20 transition-all"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2 px-2 border-l border-border/50">
                    <Button variant="ghost" size="icon" className={`h-9 w-9 ${viewMode === 'grid' ? '' : 'text-muted-foreground opacity-50'}`} onClick={() => setViewMode('grid')}>
                        <LayoutGrid className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className={`h-9 w-9 ${viewMode === 'list' ? '' : 'text-muted-foreground opacity-50'}`} onClick={() => setViewMode('list')}>
                        <List className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Grid Collection */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="space-y-4">
                            <Skeleton className="h-[200px] w-full rounded-xl" />
                        </div>
                    ))}
                </div>
            ) : filteredWorkflows.length > 0 ? (
                <div>
                    {viewMode === 'grid' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-12">
                            {filteredWorkflows.map(workflow => (
                                <Card key={workflow.id} className="group relative bg-card hover:bg-card/80 border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 cursor-pointer overflow-hidden flex flex-col h-[280px]">
                                    {/* Decorative Top Bar */}
                                    <div className={`h-1.5 w-full ${workflow.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-amber-500'}`} />

                                    <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <div className={`p-1.5 rounded-md ${workflow.status === 'ACTIVE' ? 'bg-emerald-500/10' : 'bg-amber-500/10'}`}>
                                                    <GitBranch className={`w-4 h-4 ${workflow.status === 'ACTIVE' ? 'text-emerald-500' : 'text-amber-500'}`} />
                                                </div>
                                                <CardTitle className="text-base truncate max-w-[180px]">{workflow.name}</CardTitle>
                                            </div>
                                            <CardDescription className="line-clamp-2 text-sm min-h-[40px]">
                                                {workflow.description || "No description set for this automation."}
                                            </CardDescription>
                                        </div>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-48">
                                                <DropdownMenuItem onClick={() => router.push(`/workspace/${workspaceId}/flowbot/${workflow.id}`)}>
                                                    <Settings className="w-4 h-4 mr-2" />
                                                    Edit Configuration
                                                </DropdownMenuItem>
                                                <DropdownMenuItem>
                                                    <Play className="w-4 h-4 mr-2" />
                                                    Run Test
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem className="text-rose-500 focus:text-rose-500" onClick={() => handleDeleteWorkflow(workflow.id)}>
                                                    <Trash2 className="w-4 h-4 mr-2" />
                                                    Delete Workflow
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </CardHeader>

                                    <CardContent className="flex-1">
                                        <div className="flex flex-wrap gap-2 mt-4">
                                            <Badge variant={workflow.status === 'ACTIVE' ? 'success' : 'secondary'} className="rounded-full text-[10px] font-bold uppercase tracking-wider px-2 py-0.5">
                                                {workflow.status}
                                            </Badge>
                                            <Badge variant="outline" className="rounded-full text-[10px] font-medium opacity-70">
                                                {workflow.nodes?.length || 0} Nodes
                                            </Badge>
                                        </div>
                                    </CardContent>

                                    <CardFooter className="pt-0 pb-6">
                                        <div className="w-full flex items-center justify-between border-t border-border/40 pt-4">
                                            <div className="flex items-center text-[11px] text-muted-foreground">
                                                <Clock className="w-3 h-3 mr-1" />
                                                Updated {formatDistanceToNow(new Date(workflow.updatedAt), { addSuffix: true })}
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-8 text-xs font-bold text-primary group-hover:bg-primary/10 transition-colors"
                                                onClick={() => router.push(`/workspace/${workspaceId}/flowbot/${workflow.id}`)}
                                            >
                                                Open Flow <ChevronRight className="w-3 h-3 ml-1" />
                                            </Button>
                                        </div>
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col gap-3 pb-12">
                            {filteredWorkflows.map(workflow => (
                                <div key={workflow.id} onClick={() => router.push(`/workspace/${workspaceId}/flowbot/${workflow.id}`)} className="group flex items-center justify-between p-4 bg-card border border-border/50 rounded-xl hover:bg-card/80 hover:border-primary/30 transition-all cursor-pointer">
                                    <div className="flex items-center gap-4">
                                        <div className={`p-2 rounded-lg ${workflow.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
                                            <GitBranch className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-semibold">{workflow.name}</h4>
                                            <p className="text-xs text-muted-foreground line-clamp-1 max-w-[500px]">
                                                {workflow.description || "No description set for this automation."}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <Badge variant={workflow.status === 'ACTIVE' ? 'success' : 'secondary'} className="rounded-full text-[10px] uppercase font-bold tracking-wider hidden md:inline-flex">
                                            {workflow.status}
                                        </Badge>
                                        <div className="hidden lg:flex items-center text-xs text-muted-foreground w-40 justify-end">
                                            <Clock className="w-3 h-3 mr-1" />
                                            {formatDistanceToNow(new Date(workflow.updatedAt), { addSuffix: true })}
                                        </div>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground relative z-10">
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-48">
                                                <DropdownMenuItem onClick={() => router.push(`/workspace/${workspaceId}/flowbot/${workflow.id}`)}>
                                                    <Settings className="w-4 h-4 mr-2" />
                                                    Edit Configuration
                                                </DropdownMenuItem>
                                                <DropdownMenuItem>
                                                    <Play className="w-4 h-4 mr-2" />
                                                    Run Test
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem className="text-rose-500 focus:text-rose-500" onClick={() => handleDeleteWorkflow(workflow.id)}>
                                                    <Trash2 className="w-4 h-4 mr-2" />
                                                    Delete Workflow
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-20 bg-card/20 rounded-2xl border border-dashed border-border/50 text-center">
                    <div className="bg-primary/5 p-6 rounded-full mb-4">
                        <GitBranch className="w-12 h-12 text-primary opacity-30" />
                    </div>
                    <h3 className="text-xl font-bold">No Automations Found</h3>
                    <p className="text-muted-foreground mt-2 max-w-sm">
                        You haven't created any automation flows yet. Start by creating a new flowbot to automate your tasks.
                    </p>
                    <Button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="mt-6 px-8"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Assemble Your First Flow
                    </Button>
                </div>
            )}
        </div>
    );
}