'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import axios from "@/utils/axios";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
    Activity, Clock, Trash2, Edit2, Play, Plus, RefreshCcw, GitBranch
} from "lucide-react";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from "@/components/ui/dialog";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { format } from "date-fns";
import parser from "cron-parser";

// Helper for v5.5.0 ESM compatibility
const getCron = () => {
    const p = parser.default || parser;
    // v5.5.0 uses p.parse, previous versions use p.parseExpression
    const parseFn = p.parse || p.parseExpression;
    return { parseExpression: parseFn.bind(p) };
};
const cronHelper = getCron();

const CRON_PRESETS = [
    { label: "Every Minute", value: "* * * * *" },
    { label: "Every 5 Minutes", value: "*/5 * * * *" },
    { label: "Every 10 Minutes", value: "*/10 * * * *" },
    { label: "Every 30 Minutes", value: "*/30 * * * *" },
    { label: "Every Hour", value: "0 * * * *" },
    { label: "Daily at Midnight", value: "0 0 * * *" },
    { label: "Every Monday at 9AM", value: "0 9 * * 1" },
];

export default function CronPage() {
    const params = useParams();
    const workspaceId = params?.workspaceId;

    const [crons, setCrons] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // Dialog state
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        id: null,
        name: '',
        description: '',
        cronExpression: '* * * * *',
        targetId: ''
    });

    const [predictedNext, setPredictedNext] = useState('');

    const fetchData = useCallback(async () => {
        if (!workspaceId) return;
        setIsLoading(true);
        try {
            const res = await axios.get(`/api/workspace/${workspaceId}/system/cron`);
            setCrons(res.data.data || []);
        } catch (error) {
            console.error("CRON_FETCH_ERROR:", error.response?.data || error);
            toast.error("Failed to load cron jobs");
        } finally {
            setIsLoading(false);
        }
    }, [workspaceId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Live preview for cron expression inside dialog
    useEffect(() => {
        if (formData.cronExpression) {
            try {
                const interval = cronHelper.parseExpression(formData.cronExpression);
                setPredictedNext(interval.next().toString());
            } catch (err) {
                setPredictedNext('Invalid expression');
            }
        }
    }, [formData.cronExpression]);

    const handleSave = async () => {
        if (!formData.name || !formData.cronExpression || !formData.targetId) {
            toast.error("Please fill all required fields");
            return;
        }

        try {
            if (isEditing) {
                await axios.put(`/api/workspace/${workspaceId}/system/cron/${formData.id}`, {
                    name: formData.name,
                    description: formData.description,
                    cronExpression: formData.cronExpression,
                    targetId: formData.targetId
                });
                toast.success("Cron job updated successfully");
            } else {
                await axios.post(`/api/workspace/${workspaceId}/system/cron`, {
                    name: formData.name,
                    description: formData.description,
                    cronExpression: formData.cronExpression,
                    targetType: 'SYSTEM',
                    targetId: formData.targetId
                });
                toast.success("Cron job created successfully");
            }
            setIsDialogOpen(false);
            fetchData();
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || "Failed to save cron job");
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Are you sure you want to delete this cron job?")) return;
        try {
            await axios.delete(`/api/workspace/${workspaceId}/system/cron/${id}`);
            toast.success("Cron job deleted");
            fetchData();
        } catch (err) {
            toast.error("Failed to delete cron job");
        }
    };

    const toggleStatus = async (id, currentStatus) => {
        const newStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
        try {
            // Optimistic update
            setCrons(prev => prev.map(c => c.id === id ? { ...c, status: newStatus } : c));
            await axios.put(`/api/workspace/${workspaceId}/system/cron/${id}`, {
                status: newStatus
            });
            toast.success(`Job marked as ${newStatus}`);
            fetchData(); // Sync exact nextRunAt
        } catch (err) {
            toast.error("Failed to update status");
            fetchData(); // Rollback
        }
    };

    const openCreateDialog = () => {
        setIsEditing(false);
        setFormData({ id: null, name: '', description: '', cronExpression: '0 * * * *', targetId: '' });
        setIsDialogOpen(true);
    };

    const openEditDialog = (cron) => {
        setIsEditing(true);
        setFormData({
            id: cron.id,
            name: cron.name,
            description: cron.description || '',
            cronExpression: cron.cronExpression,
            targetId: cron.targetId
        });
        setIsDialogOpen(true);
    };

    const getStatusUI = (status) => {
        switch (status) {
            case 'ACTIVE': return <Badge variant="success" className="text-[10px] bg-green-500/10 text-green-600 border-green-500/20 uppercase font-bold tracking-wider rounded-md">ACTIVE</Badge>;
            case 'INACTIVE': return <Badge variant="secondary" className="text-[10px] uppercase font-bold tracking-wider rounded-md">INACTIVE</Badge>;
            case 'ERROR': return <Badge variant="destructive" className="text-[10px] uppercase font-bold tracking-wider rounded-md">ERROR</Badge>;
            default: return <Badge variant="outline">{status}</Badge>;
        }
    };

    return (
        <div className="p-4 space-y-4 animate-fade-in">


            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="text-xl font-bold flex items-center gap-3">
                        <Activity className="text-primary h-8 w-8" /> System Scheduling
                    </h1>
                    <p className="text-muted-foreground text-xs font-medium">
                        Configure regular automated routines and workflow triggers.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="hidden lg:flex items-center bg-muted/50 border border-border px-3 h-8 rounded-md mr-2">
                        <span className="text-[10px] font-bold text-muted-foreground mr-2 Uppercase">Webhook:</span>
                        <code className="text-[10px] font-mono text-primary truncate max-w-[200px]">/api/webhooks/cron</code>
                    </div>
                    <Button variant="outline" onClick={fetchData} disabled={isLoading} size="sm" className=" rounded-md">
                        <RefreshCcw className={` h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} /> Refresh
                    </Button>
                    <Button onClick={openCreateDialog} size="sm" className=" rounded-md bg-primary hover:bg-primary/90">
                        <Plus className=" h-3.5 w-3.5" /> New Schedule
                    </Button>
                </div>
            </div>

            {/* Table Area */}
            <Card className="border-border shadow-soft overflow-hidden rounded-md p-0">
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-background">
                            <TableRow className="hover:bg-transparent">
                                <TableHead className="w-[100px] text-[10px] py-4">Status</TableHead>
                                <TableHead className="w-[200px] text-[10px] py-4">Name</TableHead>
                                <TableHead className="w-[150px] text-[10px] py-4">Target Action</TableHead>
                                <TableHead className="w-[120px] text-[10px] py-4">Schedule Expression</TableHead>
                                <TableHead className="w-[160px] text-[10px] py-4 hidden md:table-cell">Last Run</TableHead>
                                <TableHead className="w-[160px] text-[10px] py-4 hidden md:table-cell">Next Run</TableHead>
                                <TableHead className="w-[120px] text-right py-4">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-48 text-center">
                                        <div className="flex flex-col items-center gap-3 opacity-40">
                                            <RefreshCcw className="h-8 w-8 animate-spin text-primary" />
                                            <span className="text-[10px] tracking-[0.3em]">Loading Schedules...</span>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : crons.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-48 text-center">
                                        <div className="flex flex-col items-center gap-3 opacity-30">
                                            <Clock className="w-10 h-10" />
                                            <span className="text-sm font-bold">No cron jobs configured yet</span>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                crons.map((cron) => (
                                    <TableRow key={cron.id} className="group hover:bg-muted/20 border-b border-border/30 transition-colors">
                                        <TableCell className="py-4 font-medium px-4">
                                            <div className="flex items-center gap-2">
                                                <Switch
                                                    checked={cron.status === 'ACTIVE'}
                                                    onCheckedChange={() => toggleStatus(cron.id, cron.status)}
                                                    className="scale-75"
                                                />
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-4">
                                            <div>
                                                <div className="font-bold text-[12px] flex items-center gap-1.5">
                                                    {cron.name}
                                                    {cron.status !== 'ACTIVE' && getStatusUI(cron.status)}
                                                </div>
                                                <div className="text-[10px] text-muted-foreground truncate max-w-[200px]">{cron.description || "No description"}</div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-4">
                                            <div className="flex items-center text-[10px] font-medium px-2 py-1 bg-muted rounded-md w-max max-w-[150px] truncate">
                                                <Activity size={12} className="mr-1.5 opacity-60 shrink-0" />
                                                <span className="truncate">{cron.targetId || "None"}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-4">
                                            <Badge variant="outline" className="font-mono text-[10px] rounded bg-muted/30">
                                                {cron.cronExpression}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="py-4 hidden md:table-cell text-[11px] font-mono text-muted-foreground">
                                            {cron.lastRunAt ? format(new Date(cron.lastRunAt), 'MMM dd, HH:mm:ss') : <span className="opacity-40">Never</span>}
                                        </TableCell>
                                        <TableCell className="py-4 hidden md:table-cell text-[11px] font-mono font-bold text-foreground/80">
                                            {cron.nextRunAt ? format(new Date(cron.nextRunAt), 'MMM dd, HH:mm:ss') : <span className="opacity-40">-</span>}
                                        </TableCell>
                                        <TableCell className="py-4 text-right pr-4">
                                            <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-8 w-8 p-0"
                                                    onClick={() => openEditDialog(cron)}
                                                >
                                                    <Edit2 size={14} />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                                                    onClick={() => handleDelete(cron.id)}
                                                >
                                                    <Trash2 size={14} />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Create/Edit Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[450px]">
                    <DialogHeader>
                        <DialogTitle>{isEditing ? 'Edit Schedule' : 'Create New Schedule'}</DialogTitle>
                        <DialogDescription>
                            Configure a cron job to automatically trigger a workflow at regular intervals.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name" className="text-xs font-bold text-muted-foreground uppercase flex items-center">
                                Schedule Name <span className="text-destructive ml-1">*</span>
                            </Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="e.g. Daily Data Sync"
                                className="h-9 rounded-md text-sm"
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="description" className="text-xs font-bold text-muted-foreground uppercase">Description <span className="opacity-40">(Optional)</span></Label>
                            <Textarea
                                id="description"
                                rows={4}
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="What does this schedule do?"
                                className="min-h-[60px] rounded-md text-sm resize-none"
                            />
                        </div>                        <div className="grid gap-2">
                            <Label htmlFor="targetId" className="text-xs font-bold text-muted-foreground uppercase flex items-center">
                                Target ID / Resource <span className="text-destructive ml-1">*</span>
                            </Label>
                            <Input
                                id="targetId"
                                value={formData.targetId}
                                onChange={(e) => setFormData({ ...formData, targetId: e.target.value })}
                                placeholder="Enter system target identifier..."
                                className="h-9 rounded-md text-sm"
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label className="text-xs font-bold text-muted-foreground uppercase">Quick Interval</Label>
                            <Select onValueChange={(val) => setFormData({ ...formData, cronExpression: val })}>
                                <SelectTrigger className="w-full h-9 text-sm rounded-md border-dashed border-primary/30 hover:border-primary/60 transition-colors">
                                    <SelectValue placeholder="Choose a common schedule..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {CRON_PRESETS.map((preset) => (
                                        <SelectItem key={preset.value} value={preset.value}>
                                            <div className="flex items-center justify-between w-full min-w-[200px]">
                                                <span>{preset.label}</span>
                                                <span className="text-[10px] font-mono opacity-50 ml-auto">{preset.value}</span>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>                        <div className="grid gap-2">
                            <Label htmlFor="cron" className="text-xs font-bold text-muted-foreground uppercase flex items-center justify-between">
                                <div className="flex items-center">
                                    Cron Expression <span className="text-destructive ml-1">*</span>
                                </div>
                                <a href="https://crontab.guru/" target="_blank" rel="noreferrer" className="text-[10px] text-primary hover:underline normal-case">Help me build this</a>
                            </Label>
                            <Input
                                id="cron"
                                value={formData.cronExpression}
                                onChange={(e) => setFormData({ ...formData, cronExpression: e.target.value })}
                                placeholder="0 * * * *"
                                className="h-9 rounded-md font-mono text-sm uppercase tracking-wider bg-muted/50"
                            />
                            <div className="flex items-center text-[10px] text-muted-foreground bg-card border border-border/50 px-2 py-1.5 rounded-md mt-1">
                                <Clock size={12} className="mr-1.5 opacity-70" />
                                Predicted Next Run: <span className="font-bold ml-1 font-mono text-primary/80">{predictedNext}</span>
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setIsDialogOpen(false)} className="h-9 px-4 text-xs font-bold rounded-md">Cancel</Button>
                        <Button onClick={handleSave} className="h-9 px-6 text-xs font-bold rounded-md bg-primary hover:bg-primary/90 text-primary-foreground">
                            {isEditing ? 'Save Changes' : 'Create Schedule'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
