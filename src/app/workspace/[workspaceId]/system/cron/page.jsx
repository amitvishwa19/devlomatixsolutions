'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams } from 'next/navigation';
import axios from "@/utils/axios";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
    Activity,
    Clock,
    Trash2,
    Edit2,
    Play,
    Plus,
    RefreshCcw,
    CheckCircle2,
    XCircle,
    AlertTriangle,
    ShieldAlert,
    Send,
    Terminal,
    Search,
    Filter,
    ArrowUpDown,
    ExternalLink,
    Server,
    Layers,
    Copy,
    ChevronLeft,
    ChevronRight,
    Zap,
    Cpu,
    Eye
} from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { toast } from "sonner";
import { format, formatDistanceToNow } from "date-fns";
import parser from "cron-parser";

// Helper for v5.5.0 ESM compatibility
const getCron = () => {
    const p = parser.default || parser;
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

export default function SystemCronManagementPage() {
    const params = useParams();
    const workspaceId = params?.workspaceId;

    const [activeTab, setActiveTab] = useState('logs'); // 'logs' | 'schedules'

    // ==========================================
    // 📊 CRON LOGS STATE
    // ==========================================
    const [logs, setLogs] = useState([]);
    const [stats, setStats] = useState(null);
    const [isLogsLoading, setIsLogsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [sourceFilter, setSourceFilter] = useState('ALL');
    const [scopeFilter, setScopeFilter] = useState('all'); // 'all' | 'workspace'
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalLogsCount, setTotalLogsCount] = useState(0);
    const [autoRefresh, setAutoRefresh] = useState(false);
    const [selectedLog, setSelectedLog] = useState(null);

    // Test Trigger Modal State
    const [isTestTriggerOpen, setIsTestTriggerOpen] = useState(false);
    const [testTriggerForm, setTestTriggerForm] = useState({
        jobName: 'render-manual-test-ping',
        source: 'RENDER',
        method: 'GET',
        payload: '{\n  "test": true,\n  "action": "keepalive"\n}'
    });
    const [isTriggering, setIsTriggering] = useState(false);

    // ==========================================
    // ⏰ SCHEDULED CRONS (SYSTEM CRON) STATE
    // ==========================================
    const [crons, setCrons] = useState([]);
    const [isCronsLoading, setIsCronsLoading] = useState(true);
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

    // 1. Fetch Cron Logs
    const fetchLogs = useCallback(async (showToast = false) => {
        setIsLogsLoading(true);
        try {
            const queryParams = new URLSearchParams({
                page: currentPage.toString(),
                limit: '25',
                scope: scopeFilter,
                ...(workspaceId ? { workspaceId } : {}),
                ...(statusFilter !== 'ALL' ? { status: statusFilter } : {}),
                ...(sourceFilter !== 'ALL' ? { source: sourceFilter } : {}),
                ...(searchQuery.trim() ? { jobName: searchQuery.trim() } : {})
            });

            const res = await axios.get(`/api/v5/cron/history?${queryParams.toString()}`);
            if (res.data?.success) {
                setLogs(res.data.data || []);
                setTotalPages(res.data.pagination?.totalPages || 1);
                setTotalLogsCount(res.data.pagination?.total || 0);
                if (showToast) toast.success("Cron logs updated");
            }
        } catch (error) {
            console.error("CRON_LOGS_FETCH_ERROR:", error);
            if (showToast) toast.error("Failed to load cron logs");
        } finally {
            setIsLogsLoading(false);
        }
    }, [currentPage, scopeFilter, workspaceId, statusFilter, sourceFilter, searchQuery]);

    // 2. Fetch Stats
    const fetchStats = useCallback(async () => {
        try {
            const res = await axios.get('/api/v5/cron/stats');
            if (res.data?.success) {
                setStats(res.data.stats);
            }
        } catch (error) {
            console.error("CRON_STATS_FETCH_ERROR:", error);
        }
    }, []);

    // 3. Fetch Scheduled Crons
    const fetchCrons = useCallback(async () => {
        if (!workspaceId) return;
        setIsCronsLoading(true);
        try {
            const res = await axios.get(`/api/workspace/${workspaceId}/system/cron`);
            setCrons(res.data.data || []);
        } catch (error) {
            console.error("CRON_FETCH_ERROR:", error.response?.data || error);
        } finally {
            setIsCronsLoading(false);
        }
    }, [workspaceId]);

    // Load initial data
    useEffect(() => {
        fetchLogs();
        fetchStats();
        fetchCrons();
    }, [fetchLogs, fetchStats, fetchCrons]);

    // Auto-refresh interval (5s)
    useEffect(() => {
        if (!autoRefresh) return;
        const interval = setInterval(() => {
            fetchLogs();
            fetchStats();
        }, 5000);
        return () => clearInterval(interval);
    }, [autoRefresh, fetchLogs, fetchStats]);

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

    // Execute Immediate Test Cron Trigger
    const handleExecuteTestTrigger = async () => {
        setIsTriggering(true);
        try {
            let parsedBody = null;
            if (testTriggerForm.method !== 'GET' && testTriggerForm.payload.trim()) {
                try {
                    parsedBody = JSON.parse(testTriggerForm.payload);
                } catch {
                    toast.error("Invalid JSON format in payload");
                    setIsTriggering(false);
                    return;
                }
            }

            const url = `/api/v5/cron/${encodeURIComponent(testTriggerForm.jobName.trim() || 'manual-test')}?source=${testTriggerForm.source}&workspaceId=${workspaceId || ''}`;

            let res;
            if (testTriggerForm.method === 'POST') {
                res = await axios.post(url, parsedBody || {});
            } else if (testTriggerForm.method === 'PUT') {
                res = await axios.put(url, parsedBody || {});
            } else {
                res = await axios.get(url);
            }

            if (res.data?.success) {
                toast.success(`Cron executed and recorded! (Log ID: ${res.data.logId || 'Saved'})`);
                setIsTestTriggerOpen(false);
                fetchLogs(true);
                fetchStats();
            } else {
                toast.error(res.data?.message || "Execution returned an error");
            }
        } catch (err) {
            toast.error(err.response?.data?.message || err.message || "Failed to trigger cron");
        } finally {
            setIsTriggering(false);
        }
    };

    // Purge Logs
    const handleClearLogs = async () => {
        if (!confirm("Are you sure you want to clear all logged cron records from the database?")) return;
        try {
            const res = await axios.delete('/api/v5/cron/history?clearAll=true');
            if (res.data?.success) {
                toast.success("Cron logs table cleared");
                fetchLogs();
                fetchStats();
            }
        } catch (err) {
            toast.error("Failed to clear logs");
        }
    };

    // Save Scheduled Cron
    const handleSaveSchedule = async () => {
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
                toast.success("Cron schedule updated successfully");
            } else {
                await axios.post(`/api/workspace/${workspaceId}/system/cron`, {
                    name: formData.name,
                    description: formData.description,
                    cronExpression: formData.cronExpression,
                    targetType: 'SYSTEM',
                    targetId: formData.targetId
                });
                toast.success("Cron schedule created successfully");
            }
            setIsDialogOpen(false);
            fetchCrons();
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to save schedule");
        }
    };

    // Toggle status
    const toggleScheduleStatus = async (id, currentStatus) => {
        const newStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
        try {
            setCrons(prev => prev.map(c => c.id === id ? { ...c, status: newStatus } : c));
            await axios.put(`/api/workspace/${workspaceId}/system/cron/${id}`, {
                status: newStatus
            });
            toast.success(`Schedule set to ${newStatus}`);
            fetchCrons();
        } catch (err) {
            toast.error("Failed to update status");
            fetchCrons();
        }
    };

    // Delete schedule
    const handleDeleteSchedule = async (id) => {
        if (!confirm("Are you sure you want to delete this scheduled cron job?")) return;
        try {
            await axios.delete(`/api/workspace/${workspaceId}/system/cron/${id}`);
            toast.success("Cron job deleted");
            fetchCrons();
        } catch (err) {
            toast.error("Failed to delete cron job");
        }
    };

    const copyToClipboard = (text, label) => {
        navigator.clipboard.writeText(text);
        toast.success(`Copied ${label} to clipboard!`);
    };

    const getStatusBadge = (status, statusCode) => {
        switch (status) {
            case 'SUCCESS':
                return (
                    <Badge className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/30 text-[11px] font-semibold gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-500" /> {statusCode || 200} OK
                    </Badge>
                );
            case 'UNAUTHORIZED':
                return (
                    <Badge className="bg-amber-500/10 text-amber-600 border border-amber-500/30 text-[11px] font-semibold gap-1">
                        <ShieldAlert className="w-3 h-3 text-amber-500" /> 401 Unauthorized
                    </Badge>
                );
            case 'FAILED':
            case 'ERROR':
                return (
                    <Badge className="bg-rose-500/10 text-rose-600 border border-rose-500/30 text-[11px] font-semibold gap-1">
                        <XCircle className="w-3 h-3 text-rose-500" /> {statusCode || 500} Failed
                    </Badge>
                );
            default:
                return <Badge variant="outline" className="text-[11px]">{status}</Badge>;
        }
    };

    const getSourceBadge = (source) => {
        switch (source) {
            case 'RENDER':
                return <Badge variant="outline" className="bg-indigo-500/10 text-indigo-600 border-indigo-500/30 font-bold text-[10px]">RENDER</Badge>;
            case 'VERCEL':
                return <Badge variant="outline" className="bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-bold text-[10px]">VERCEL</Badge>;
            case 'CRON_JOB_ORG':
                return <Badge variant="outline" className="bg-cyan-500/10 text-cyan-600 border-cyan-500/30 font-bold text-[10px]">CRON-JOB.ORG</Badge>;
            case 'GITHUB_ACTIONS':
                return <Badge variant="outline" className="bg-purple-500/10 text-purple-600 border-purple-500/30 font-bold text-[10px]">GITHUB</Badge>;
            default:
                return <Badge variant="outline" className="bg-muted text-muted-foreground text-[10px]">{source || 'WEBHOOK'}</Badge>;
        }
    };

    return (
        <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto animate-in fade-in-50">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
                        <div className="p-2 rounded-xl bg-primary/10 text-primary">
                            <Activity className="w-6 h-6" />
                        </div>
                        Cron & Automated Tasks Hub
                    </h1>
                    <p className="text-xs text-muted-foreground mt-1">
                        Real-time execution monitoring, incoming request auditing, and system routines.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                    {/* Live Auto-Refresh Switch */}
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-card">
                        <Switch
                            id="auto-refresh"
                            checked={autoRefresh}
                            onCheckedChange={setAutoRefresh}
                            className="scale-75"
                        />
                        <Label htmlFor="auto-refresh" className="text-xs font-semibold cursor-pointer select-none">
                            Live Stream (5s)
                        </Label>
                    </div>

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => { fetchLogs(true); fetchStats(); fetchCrons(); }}
                        disabled={isLogsLoading}
                        className="h-9 gap-1.5 text-xs font-semibold"
                    >
                        <RefreshCcw className={`w-3.5 h-3.5 ${isLogsLoading ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsTestTriggerOpen(true)}
                        className="h-9 gap-1.5 text-xs font-semibold border-primary/40 text-primary hover:bg-primary/10"
                    >
                        <Zap className="w-3.5 h-3.5 text-primary" />
                        Test Trigger Ping
                    </Button>

                    <Button
                        size="sm"
                        onClick={() => {
                            setIsEditing(false);
                            setFormData({ id: null, name: '', description: '', cronExpression: '0 * * * *', targetId: '' });
                            setIsDialogOpen(true);
                        }}
                        className="h-9 gap-1.5 text-xs font-semibold shadow-sm"
                    >
                        <Plus className="w-3.5 h-3.5" />
                        New Schedule
                    </Button>
                </div>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                <Card className="p-4 bg-card border-border shadow-xs">
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Total Recorded Logs</span>
                        <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                            <Layers className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="text-2xl font-bold text-foreground mt-2">
                        {stats ? stats.totalExecutions : totalLogsCount}
                    </div>
                    <div className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
                        <span>Stored in PostgreSQL</span>
                        <code className="font-mono text-primary font-bold">CronLog</code>
                    </div>
                </Card>

                <Card className="p-4 bg-card border-border shadow-xs">
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Success Rate</span>
                        <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600">
                            <CheckCircle2 className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="text-2xl font-bold text-emerald-600 mt-2">
                        {stats ? `${stats.successRatePercent}%` : '100%'}
                    </div>
                    <div className="text-[10px] text-muted-foreground mt-1">
                        {stats ? `${stats.successfulExecutions} successful runs` : 'All requests healthy'}
                    </div>
                </Card>

                <Card className="p-4 bg-card border-border shadow-xs">
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Failed / Unauthorized</span>
                        <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-600">
                            <AlertTriangle className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="text-2xl font-bold text-rose-600 mt-2">
                        {stats ? stats.failedExecutions : 0}
                    </div>
                    <div className="text-[10px] text-muted-foreground mt-1">
                        {stats && stats.failedExecutions > 0 ? 'Requires attention' : 'Zero failure errors'}
                    </div>
                </Card>

                <Card className="p-4 bg-card border-border shadow-xs">
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Active Routines</span>
                        <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-600">
                            <Clock className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="text-2xl font-bold text-indigo-600 mt-2">
                        {crons.filter(c => c.status === 'ACTIVE').length} / {crons.length}
                    </div>
                    <div className="text-[10px] text-muted-foreground mt-1">
                        Scheduled background tasks
                    </div>
                </Card>
            </div>

            {/* Endpoints Reference Bar */}
            <div className="p-3.5 bg-muted/40 border border-border rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-foreground flex items-center gap-1.5">
                        <Server className="w-3.5 h-3.5 text-primary" /> Active Cron Endpoints:
                    </span>
                    <Badge variant="outline" className="font-mono text-[11px] bg-background gap-1 cursor-pointer hover:border-primary" onClick={() => copyToClipboard('/api/v5/cron', 'Path')}>
                        <code>/api/v5/cron</code>
                        <Copy className="w-2.5 h-2.5 text-muted-foreground" />
                    </Badge>
                    <Badge variant="outline" className="font-mono text-[11px] bg-background gap-1 cursor-pointer hover:border-primary" onClick={() => copyToClipboard('/api/v5/cron/[jobName]', 'Path')}>
                        <code>/api/v5/cron/:jobName</code>
                        <Copy className="w-2.5 h-2.5 text-muted-foreground" />
                    </Badge>
                    <Badge variant="outline" className="font-mono text-[11px] bg-background gap-1 cursor-pointer hover:border-primary" onClick={() => copyToClipboard('/cron (Render/Socket Server)', 'Path')}>
                        <code>https://socket.devlomatix.in/cron</code>
                        <Copy className="w-2.5 h-2.5 text-muted-foreground" />
                    </Badge>
                </div>
                <div className="text-[11px] text-muted-foreground">
                    All incoming requests automatically log to <span className="font-mono font-bold text-foreground">CronLog</span>
                </div>
            </div>

            {/* Main Tabs Navigation */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-4">
                <div className="flex items-center justify-between border-b border-border pb-2">
                    <TabsList className="h-9 p-1 bg-muted/60">
                        <TabsTrigger value="logs" className="text-xs font-bold gap-1.5 px-3">
                            <Activity className="w-3.5 h-3.5 text-primary" />
                            Incoming Cron Logs ({totalLogsCount})
                        </TabsTrigger>
                        <TabsTrigger value="schedules" className="text-xs font-bold gap-1.5 px-3">
                            <Clock className="w-3.5 h-3.5 text-indigo-500" />
                            Configured Schedules ({crons.length})
                        </TabsTrigger>
                    </TabsList>

                    {activeTab === 'logs' && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleClearLogs}
                            className="h-8 text-xs text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 gap-1"
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                            Clear Logs
                        </Button>
                    )}
                </div>

                {/* ========================================== */}
                {/* TAB 1: INCOMING CRON LOGS TABLE */}
                {/* ========================================== */}
                <TabsContent value="logs" className="space-y-4 mt-0">
                    {/* Filters and Search Bar */}
                    <div className="flex flex-wrap items-center justify-between gap-3 bg-card p-3 rounded-xl border border-border">
                        <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[280px]">
                            <div className="relative flex-1 max-w-xs">
                                <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-muted-foreground" />
                                <Input
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search job name or endpoint..."
                                    className="h-8 pl-8 text-xs bg-background"
                                />
                            </div>

                            {/* Status Filter */}
                            <Select value={statusFilter} onValueChange={(val) => { setStatusFilter(val); setCurrentPage(1); }}>
                                <SelectTrigger className="h-8 text-xs w-[130px] bg-background">
                                    <SelectValue placeholder="All Statuses" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL" className="text-xs">All Statuses</SelectItem>
                                    <SelectItem value="SUCCESS" className="text-xs">SUCCESS (200)</SelectItem>
                                    <SelectItem value="UNAUTHORIZED" className="text-xs">UNAUTHORIZED (401)</SelectItem>
                                    <SelectItem value="FAILED" className="text-xs">FAILED (500)</SelectItem>
                                </SelectContent>
                            </Select>

                            {/* Source Filter */}
                            <Select value={sourceFilter} onValueChange={(val) => { setSourceFilter(val); setCurrentPage(1); }}>
                                <SelectTrigger className="h-8 text-xs w-[140px] bg-background">
                                    <SelectValue placeholder="All Sources" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL" className="text-xs">All Sources</SelectItem>
                                    <SelectItem value="RENDER" className="text-xs">Render</SelectItem>
                                    <SelectItem value="VERCEL" className="text-xs">Vercel</SelectItem>
                                    <SelectItem value="CRON_JOB_ORG" className="text-xs">Cron-Job.org</SelectItem>
                                    <SelectItem value="GITHUB_ACTIONS" className="text-xs">GitHub Actions</SelectItem>
                                    <SelectItem value="EXTERNAL_WEBHOOK" className="text-xs">Webhook / External</SelectItem>
                                </SelectContent>
                            </Select>

                            {/* Scope Filter */}
                            <Select value={scopeFilter} onValueChange={(val) => { setScopeFilter(val); setCurrentPage(1); }}>
                                <SelectTrigger className="h-8 text-xs w-[140px] bg-background">
                                    <SelectValue placeholder="Scope" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all" className="text-xs">All System Logs</SelectItem>
                                    <SelectItem value="workspace" className="text-xs">Workspace Only</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Table View */}
                    <Card className="border-border shadow-xs overflow-hidden rounded-xl">
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader className="bg-muted/40">
                                    <TableRow className="hover:bg-transparent">
                                        <TableHead className="text-xs py-3 w-[140px]">Status & Code</TableHead>
                                        <TableHead className="text-xs py-3 w-[220px]">Job Name & Endpoint</TableHead>
                                        <TableHead className="text-xs py-3 w-[120px]">Source</TableHead>
                                        <TableHead className="text-xs py-3 w-[80px]">Method</TableHead>
                                        <TableHead className="text-xs py-3 w-[100px]">Duration</TableHead>
                                        <TableHead className="text-xs py-3 w-[140px] hidden md:table-cell">Caller IP</TableHead>
                                        <TableHead className="text-xs py-3 w-[160px]">Executed At</TableHead>
                                        <TableHead className="text-xs py-3 text-right pr-4">Inspect</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {isLogsLoading ? (
                                        <TableRow>
                                            <TableCell colSpan={8} className="h-48 text-center">
                                                <div className="flex flex-col items-center justify-center gap-2">
                                                    <RefreshCcw className="w-6 h-6 animate-spin text-primary" />
                                                    <span className="text-xs text-muted-foreground font-medium">Loading CronLog table records...</span>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) : logs.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={8} className="h-48 text-center">
                                                <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                                                    <div className="p-3 rounded-2xl bg-muted/60">
                                                        <Activity className="w-8 h-8 opacity-40" />
                                                    </div>
                                                    <span className="text-sm font-bold text-foreground">No cron execution records found</span>
                                                    <p className="text-xs max-w-sm">
                                                        Incoming requests from Render, Vercel, or Cron-Job.org will appear here automatically in real time.
                                                    </p>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => setIsTestTriggerOpen(true)}
                                                        className="mt-2 text-xs gap-1.5"
                                                    >
                                                        <Play className="w-3 h-3" /> Test Trigger Now
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        logs.map((log) => (
                                            <TableRow
                                                key={log.id}
                                                className="hover:bg-muted/40 transition-colors border-b border-border/60 cursor-pointer"
                                                onClick={() => setSelectedLog(log)}
                                            >
                                                <TableCell className="py-3 font-medium">
                                                    {getStatusBadge(log.status, log.statusCode)}
                                                </TableCell>
                                                <TableCell className="py-3">
                                                    <div>
                                                        <div className="font-bold text-xs text-foreground line-clamp-1">
                                                            {log.jobName || 'Cron Execution'}
                                                        </div>
                                                        <div className="text-[10px] font-mono text-muted-foreground truncate max-w-[240px]">
                                                            {log.endpoint || '/api/v5/cron'}
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="py-3">
                                                    {getSourceBadge(log.source)}
                                                </TableCell>
                                                <TableCell className="py-3">
                                                    <Badge variant="outline" className="font-mono text-[10px] uppercase font-bold">
                                                        {log.method || 'GET'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="py-3 text-xs font-mono text-muted-foreground">
                                                    {log.durationMs !== null ? `${log.durationMs}ms` : '<1ms'}
                                                </TableCell>
                                                <TableCell className="py-3 hidden md:table-cell text-xs font-mono text-muted-foreground">
                                                    {log.ipAddress || '127.0.0.1'}
                                                </TableCell>
                                                <TableCell className="py-3 text-xs text-muted-foreground whitespace-nowrap">
                                                    <div>{format(new Date(log.createdAt), 'MMM dd, HH:mm:ss')}</div>
                                                    <div className="text-[10px] text-muted-foreground/70">
                                                        {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="py-3 text-right pr-4">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={(e) => { e.stopPropagation(); setSelectedLog(log); }}
                                                        className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                                                        title="Inspect Payload & Headers"
                                                    >
                                                        <Eye className="w-3.5 h-3.5" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between pt-2">
                            <span className="text-xs text-muted-foreground">
                                Showing page <strong>{currentPage}</strong> of <strong>{totalPages}</strong> ({totalLogsCount} total logs)
                            </span>
                            <div className="flex items-center gap-1.5">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={currentPage <= 1 || isLogsLoading}
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    className="h-8 px-2.5 text-xs gap-1"
                                >
                                    <ChevronLeft className="w-3.5 h-3.5" /> Prev
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={currentPage >= totalPages || isLogsLoading}
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                    className="h-8 px-2.5 text-xs gap-1"
                                >
                                    Next <ChevronRight className="w-3.5 h-3.5" />
                                </Button>
                            </div>
                        </div>
                    )}
                </TabsContent>

                {/* ========================================== */}
                {/* TAB 2: SCHEDULED CRONS (SYSTEM CRON) */}
                {/* ========================================== */}
                <TabsContent value="schedules" className="space-y-4 mt-0">
                    <Card className="border-border shadow-xs overflow-hidden rounded-xl">
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader className="bg-muted/40">
                                    <TableRow className="hover:bg-transparent">
                                        <TableHead className="w-[100px] text-xs py-3">Status</TableHead>
                                        <TableHead className="w-[220px] text-xs py-3">Routine Name</TableHead>
                                        <TableHead className="w-[150px] text-xs py-3">Target Action</TableHead>
                                        <TableHead className="w-[140px] text-xs py-3">Schedule Expression</TableHead>
                                        <TableHead className="w-[160px] text-xs py-3 hidden md:table-cell">Last Run</TableHead>
                                        <TableHead className="w-[160px] text-xs py-3 hidden md:table-cell">Next Run</TableHead>
                                        <TableHead className="w-[100px] text-right py-3 pr-4">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {isCronsLoading ? (
                                        <TableRow>
                                            <TableCell colSpan={7} className="h-48 text-center">
                                                <div className="flex flex-col items-center justify-center gap-2">
                                                    <RefreshCcw className="w-6 h-6 animate-spin text-primary" />
                                                    <span className="text-xs text-muted-foreground font-medium">Loading schedules...</span>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) : crons.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={7} className="h-48 text-center">
                                                <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                                                    <Clock className="w-8 h-8 opacity-40" />
                                                    <span className="text-sm font-bold text-foreground">No recurring schedules configured</span>
                                                    <Button
                                                        size="sm"
                                                        onClick={() => {
                                                            setIsEditing(false);
                                                            setFormData({ id: null, name: '', description: '', cronExpression: '0 * * * *', targetId: '' });
                                                            setIsDialogOpen(true);
                                                        }}
                                                        className="mt-2 text-xs"
                                                    >
                                                        <Plus className="w-3.5 h-3.5" /> Add Schedule
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        crons.map((cron) => (
                                            <TableRow key={cron.id} className="hover:bg-muted/40 transition-colors border-b border-border/60">
                                                <TableCell className="py-3">
                                                    <Switch
                                                        checked={cron.status === 'ACTIVE'}
                                                        onCheckedChange={() => toggleScheduleStatus(cron.id, cron.status)}
                                                        className="scale-75"
                                                    />
                                                </TableCell>
                                                <TableCell className="py-3">
                                                    <div>
                                                        <div className="font-bold text-xs text-foreground flex items-center gap-1.5">
                                                            {cron.name}
                                                            {cron.status !== 'ACTIVE' && (
                                                                <Badge variant="secondary" className="text-[9px] uppercase">
                                                                    {cron.status}
                                                                </Badge>
                                                            )}
                                                        </div>
                                                        <div className="text-[10px] text-muted-foreground truncate max-w-[220px]">
                                                            {cron.description || "No description provided"}
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="py-3">
                                                    <Badge variant="outline" className="text-[10px] font-mono gap-1">
                                                        <Activity className="w-3 h-3 text-primary" />
                                                        {cron.targetId || "SYSTEM"}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="py-3">
                                                    <Badge variant="outline" className="font-mono text-[11px] bg-muted/40">
                                                        {cron.cronExpression}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="py-3 hidden md:table-cell text-xs font-mono text-muted-foreground">
                                                    {cron.lastRunAt ? format(new Date(cron.lastRunAt), 'MMM dd, HH:mm:ss') : <span className="opacity-40">Never</span>}
                                                </TableCell>
                                                <TableCell className="py-3 hidden md:table-cell text-xs font-mono font-bold text-foreground">
                                                    {cron.nextRunAt ? format(new Date(cron.nextRunAt), 'MMM dd, HH:mm:ss') : <span className="opacity-40">-</span>}
                                                </TableCell>
                                                <TableCell className="py-3 text-right pr-4">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-7 w-7 p-0"
                                                            onClick={() => {
                                                                setIsEditing(true);
                                                                setFormData({
                                                                    id: cron.id,
                                                                    name: cron.name,
                                                                    description: cron.description || '',
                                                                    cronExpression: cron.cronExpression,
                                                                    targetId: cron.targetId
                                                                });
                                                                setIsDialogOpen(true);
                                                            }}
                                                        >
                                                            <Edit2 className="w-3.5 h-3.5" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-7 w-7 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                                                            onClick={() => handleDeleteSchedule(cron.id)}
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
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
                </TabsContent>
            </Tabs>

            {/* ========================================== */}
            {/* 🔍 LOG DETAILS INSPECT MODAL */}
            {/* ========================================== */}
            {selectedLog && (
                <Dialog open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
                    <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto p-6 bg-card border-border shadow-2xl">
                        <DialogHeader>
                            <div className="flex items-center justify-between pr-6">
                                <DialogTitle className="text-lg font-bold flex items-center gap-2">
                                    <Terminal className="w-5 h-5 text-primary" />
                                    Cron Request Details
                                </DialogTitle>
                                {getStatusBadge(selectedLog.status, selectedLog.statusCode)}
                            </div>
                            <DialogDescription className="text-xs font-mono text-muted-foreground">
                                Log ID: {selectedLog.id}
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4 pt-2 text-xs">
                            {/* Key Metadata Grid */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded-xl bg-muted/40 border border-border">
                                <div>
                                    <span className="text-[10px] text-muted-foreground uppercase font-bold block">Job Name</span>
                                    <span className="font-bold text-foreground">{selectedLog.jobName || 'N/A'}</span>
                                </div>
                                <div>
                                    <span className="text-[10px] text-muted-foreground uppercase font-bold block">Source</span>
                                    <span className="font-bold text-foreground">{selectedLog.source || 'EXTERNAL'}</span>
                                </div>
                                <div>
                                    <span className="text-[10px] text-muted-foreground uppercase font-bold block">Duration</span>
                                    <span className="font-mono font-bold text-foreground">{selectedLog.durationMs !== null ? `${selectedLog.durationMs}ms` : '0ms'}</span>
                                </div>
                                <div>
                                    <span className="text-[10px] text-muted-foreground uppercase font-bold block">Caller IP</span>
                                    <span className="font-mono font-bold text-foreground">{selectedLog.ipAddress || '127.0.0.1'}</span>
                                </div>
                            </div>

                            {/* Endpoint & Method */}
                            <div className="p-3 rounded-xl bg-muted/40 border border-border space-y-1">
                                <span className="text-[10px] text-muted-foreground uppercase font-bold block">Endpoint URL</span>
                                <div className="flex items-center justify-between font-mono text-xs bg-background p-2 rounded-lg border border-border">
                                    <span className="text-primary font-bold">{selectedLog.method} {selectedLog.endpoint}</span>
                                    <Copy className="w-3.5 h-3.5 cursor-pointer text-muted-foreground hover:text-foreground" onClick={() => copyToClipboard(selectedLog.endpoint, 'Endpoint')} />
                                </div>
                            </div>

                            {/* Error Details if any */}
                            {selectedLog.errorMessage && (
                                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 space-y-1">
                                    <span className="text-[10px] uppercase font-bold flex items-center gap-1">
                                        <AlertTriangle className="w-3.5 h-3.5" /> Error Message
                                    </span>
                                    <pre className="font-mono text-xs whitespace-pre-wrap">{selectedLog.errorMessage}</pre>
                                </div>
                            )}

                            {/* Response Payload */}
                            {selectedLog.response && (
                                <div className="space-y-1.5">
                                    <span className="text-[10px] text-muted-foreground uppercase font-bold block">Server Response JSON</span>
                                    <pre className="p-3 rounded-xl bg-muted/60 border border-border font-mono text-[11px] overflow-x-auto max-h-40">
                                        {JSON.stringify(selectedLog.response, null, 2)}
                                    </pre>
                                </div>
                            )}

                            {/* Query Parameters */}
                            {selectedLog.queryParams && Object.keys(selectedLog.queryParams).length > 0 && (
                                <div className="space-y-1.5">
                                    <span className="text-[10px] text-muted-foreground uppercase font-bold block">Query Parameters</span>
                                    <pre className="p-3 rounded-xl bg-muted/60 border border-border font-mono text-[11px] overflow-x-auto max-h-32">
                                        {JSON.stringify(selectedLog.queryParams, null, 2)}
                                    </pre>
                                </div>
                            )}

                            {/* Request Headers */}
                            {selectedLog.headers && (
                                <div className="space-y-1.5">
                                    <span className="text-[10px] text-muted-foreground uppercase font-bold block">Incoming Request Headers</span>
                                    <pre className="p-3 rounded-xl bg-muted/60 border border-border font-mono text-[11px] overflow-x-auto max-h-40">
                                        {JSON.stringify(selectedLog.headers, null, 2)}
                                    </pre>
                                </div>
                            )}
                        </div>

                        <DialogFooter className="pt-2">
                            <Button onClick={() => setSelectedLog(null)} size="sm">Close</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}

            {/* ========================================== */}
            {/* ⚡ TEST TRIGGER DIALOG */}
            {/* ========================================== */}
            <Dialog open={isTestTriggerOpen} onOpenChange={setIsTestTriggerOpen}>
                <DialogContent className="sm:max-w-[480px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-base font-bold">
                            <Zap className="w-5 h-5 text-primary" />
                            Dispatch Test Cron Trigger
                        </DialogTitle>
                        <DialogDescription className="text-xs">
                            Simulate an incoming ping to <code className="text-primary font-mono font-bold">/api/v5/cron</code> and verify that it records directly to the <code className="font-mono font-bold">CronLog</code> table.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-3.5 py-2 text-xs">
                        <div>
                            <Label className="text-xs font-semibold mb-1 block">Job Identifier</Label>
                            <Input
                                value={testTriggerForm.jobName}
                                onChange={(e) => setTestTriggerForm({ ...testTriggerForm, jobName: e.target.value })}
                                placeholder="e.g. render-keepalive-ping"
                                className="h-9 text-xs"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <Label className="text-xs font-semibold mb-1 block">Source Platform</Label>
                                <Select
                                    value={testTriggerForm.source}
                                    onValueChange={(val) => setTestTriggerForm({ ...testTriggerForm, source: val })}
                                >
                                    <SelectTrigger className="h-9 text-xs">
                                        <SelectValue placeholder="Source" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="RENDER" className="text-xs">Render (Render Cron)</SelectItem>
                                        <SelectItem value="VERCEL" className="text-xs">Vercel (Vercel Cron)</SelectItem>
                                        <SelectItem value="CRON_JOB_ORG" className="text-xs">Cron-Job.org</SelectItem>
                                        <SelectItem value="GITHUB_ACTIONS" className="text-xs">GitHub Actions</SelectItem>
                                        <SelectItem value="EXTERNAL_WEBHOOK" className="text-xs">External Webhook</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label className="text-xs font-semibold mb-1 block">HTTP Method</Label>
                                <Select
                                    value={testTriggerForm.method}
                                    onValueChange={(val) => setTestTriggerForm({ ...testTriggerForm, method: val })}
                                >
                                    <SelectTrigger className="h-9 text-xs">
                                        <SelectValue placeholder="Method" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="GET" className="text-xs">GET</SelectItem>
                                        <SelectItem value="POST" className="text-xs">POST</SelectItem>
                                        <SelectItem value="PUT" className="text-xs">PUT</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {testTriggerForm.method !== 'GET' && (
                            <div>
                                <Label className="text-xs font-semibold mb-1 block">JSON Request Body Payload</Label>
                                <Textarea
                                    rows={3}
                                    value={testTriggerForm.payload}
                                    onChange={(e) => setTestTriggerForm({ ...testTriggerForm, payload: e.target.value })}
                                    className="font-mono text-xs"
                                />
                            </div>
                        )}
                    </div>

                    <DialogFooter className="pt-2">
                        <Button variant="ghost" onClick={() => setIsTestTriggerOpen(false)} size="sm">Cancel</Button>
                        <Button onClick={handleExecuteTestTrigger} disabled={isTriggering} size="sm" className="gap-1.5 font-semibold">
                            {isTriggering ? <RefreshCcw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                            Dispatch & Log
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ========================================== */}
            {/* ⏰ CREATE / EDIT SCHEDULE DIALOG */}
            {/* ========================================== */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[460px]">
                    <DialogHeader>
                        <DialogTitle>{isEditing ? 'Edit Cron Schedule' : 'Create Recurring Schedule'}</DialogTitle>
                        <DialogDescription className="text-xs">
                            Configure an automated routine to trigger workflows or system tasks.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-3.5 py-2 text-xs">
                        <div className="grid gap-1.5">
                            <Label className="text-xs font-semibold">Schedule Name *</Label>
                            <Input
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="e.g. Daily Pipeline Sync"
                                className="h-9 text-xs"
                            />
                        </div>

                        <div className="grid gap-1.5">
                            <Label className="text-xs font-semibold">Description</Label>
                            <Textarea
                                rows={2}
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Routine purpose..."
                                className="text-xs resize-none"
                            />
                        </div>

                        <div className="grid gap-1.5">
                            <Label className="text-xs font-semibold">Target Action / Identifier *</Label>
                            <Input
                                value={formData.targetId}
                                onChange={(e) => setFormData({ ...formData, targetId: e.target.value })}
                                placeholder="e.g. sync-contacts or workflow ID"
                                className="h-9 text-xs"
                            />
                        </div>

                        <div className="grid gap-1.5">
                            <Label className="text-xs font-semibold">Quick Interval Presets</Label>
                            <Select onValueChange={(val) => setFormData({ ...formData, cronExpression: val })}>
                                <SelectTrigger className="h-9 text-xs">
                                    <SelectValue placeholder="Choose standard schedule..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {CRON_PRESETS.map((preset) => (
                                        <SelectItem key={preset.value} value={preset.value} className="text-xs">
                                            <div className="flex items-center justify-between w-full min-w-[220px]">
                                                <span>{preset.label}</span>
                                                <span className="text-[10px] font-mono opacity-60 ml-auto">{preset.value}</span>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid gap-1.5">
                            <div className="flex items-center justify-between">
                                <Label className="text-xs font-semibold">Cron Expression *</Label>
                                <a href="https://crontab.guru/" target="_blank" rel="noreferrer" className="text-[10px] text-primary hover:underline flex items-center gap-0.5">
                                    crontab.guru <ExternalLink className="w-2.5 h-2.5" />
                                </a>
                            </div>
                            <Input
                                value={formData.cronExpression}
                                onChange={(e) => setFormData({ ...formData, cronExpression: e.target.value })}
                                placeholder="0 * * * *"
                                className="h-9 font-mono text-xs bg-muted/40"
                            />
                            <div className="flex items-center text-[10px] text-muted-foreground bg-muted/40 px-2 py-1 rounded-md mt-1">
                                <Clock className="w-3 h-3 mr-1.5 opacity-70" />
                                Next Run: <span className="font-bold ml-1 font-mono text-foreground">{predictedNext}</span>
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="pt-2">
                        <Button variant="ghost" onClick={() => setIsDialogOpen(false)} size="sm">Cancel</Button>
                        <Button onClick={handleSaveSchedule} size="sm" className="font-semibold">
                            {isEditing ? 'Save Changes' : 'Create Schedule'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
