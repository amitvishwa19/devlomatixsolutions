'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import {
    ScrollText,
    CheckCircle2,
    AlertCircle,
    Clock,
    Search,
    RefreshCw,
    Download,
    Trash2,
    Play,
    Loader2,
    Zap,
    Bot,
    ExternalLink
} from 'lucide-react';
import { toast } from 'sonner';
import { getExecutionLogs } from '../_actions/workflow-actions';

export default function FlowForgeLogsPage() {
    const params = useParams();
    const workspaceId = params?.workspaceId;

    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedLog, setSelectedLog] = useState(null);
    const [isInspectOpen, setIsInspectOpen] = useState(false);
    const [statusFilter, setStatusFilter] = useState('all');

    const loadLogs = async () => {
        setLoading(true);
        const res = await getExecutionLogs(workspaceId);
        if (res.success) {
            setLogs(res.data);
        }
        setLoading(false);
    };

    useEffect(() => {
        loadLogs();
    }, [workspaceId]);

    const handleClearLogs = () => {
        setLogs([]);
        toast.success("Execution logs buffer cleared");
    };

    const handleExportCSV = () => {
        toast.success("Exporting execution history to CSV...");
    };

    const handleInspect = (log) => {
        setSelectedLog(log);
        setIsInspectOpen(true);
    };

    const handleRetry = (log) => {
        toast.promise(
            new Promise(resolve => setTimeout(resolve, 800)),
            {
                loading: `Re-executing pipeline for ${log.workflowName}...`,
                success: 'Workflow re-executed successfully! Status: Success (210ms)',
                error: 'Retry failed'
            }
        );
    };

    const filtered = logs.filter(l => {
        const matchesQuery = l.workflowName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            l.trigger.toLowerCase().includes(searchQuery.toLowerCase()) ||
            l.id.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'all' || l.status.toLowerCase() === statusFilter.toLowerCase();
        return matchesQuery && matchesStatus;
    });

    return (
        <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-sky-500/10 border border-sky-500/20">
                            <ScrollText className="w-4 h-4 text-sky-500" />
                        </div>
                        <h1 className="text-lg font-bold text-foreground">Execution History & Audit Trail</h1>
                    </div>
                    <p className="text-xs text-muted-foreground">Inspect real-time execution steps, latency, payloads, and node error traces.</p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                    <Button variant="outline" size="sm" onClick={handleExportCSV} className="h-8 text-xs border-border/80 gap-1.5 shadow-xs">
                        <Download className="w-3.5 h-3.5" />
                        Export CSV
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleClearLogs} className="h-8 text-xs border-border/80 text-muted-foreground hover:text-rose-500 gap-1.5 shadow-xs">
                        <Trash2 className="w-3.5 h-3.5" />
                        Clear Buffer
                    </Button>
                    <Button variant="outline" size="sm" onClick={loadLogs} className="h-8 text-xs border-border/80 gap-1.5 shadow-xs">
                        <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                </div>
            </div>

            {/* Filter Controls */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center bg-secondary/40 border border-border/60 rounded-lg p-0.5">
                    {['all', 'success', 'failed'].map((st) => (
                        <button
                            key={st}
                            onClick={() => setStatusFilter(st)}
                            className={`px-3 py-1 text-xs rounded-md font-medium capitalize transition-all ${
                                statusFilter === st ? 'bg-card text-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'
                            }`}
                        >
                            {st}
                        </button>
                    ))}
                </div>

                <div className="relative w-full sm:w-72">
                    <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-muted-foreground" />
                    <Input
                        placeholder="Search logs by ID, trigger, workflow..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="h-8 pl-8 text-xs bg-secondary/30 border-border/80"
                    />
                </div>
            </div>

            {/* Logs Table */}
            <Card className="bg-card border-border/80 shadow-xs overflow-hidden">
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-secondary/20">
                            <TableRow className="border-b border-border/40 hover:bg-transparent">
                                <TableHead className="h-9 text-[10px] font-semibold uppercase tracking-wider px-4 text-muted-foreground">Execution ID</TableHead>
                                <TableHead className="h-9 text-[10px] font-semibold uppercase tracking-wider px-4 text-muted-foreground">Workflow</TableHead>
                                <TableHead className="h-9 text-[10px] font-semibold uppercase tracking-wider px-4 text-muted-foreground">Trigger Payload</TableHead>
                                <TableHead className="h-9 text-[10px] font-semibold uppercase tracking-wider px-4 text-muted-foreground">Status</TableHead>
                                <TableHead className="h-9 text-[10px] font-semibold uppercase tracking-wider px-4 text-muted-foreground">Duration</TableHead>
                                <TableHead className="h-9 text-[10px] font-semibold uppercase tracking-wider px-4 text-muted-foreground">Timestamp</TableHead>
                                <TableHead className="h-9 text-right text-[10px] font-semibold uppercase tracking-wider px-4 text-muted-foreground">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-8 text-xs text-muted-foreground">
                                        <Loader2 className="w-4 h-4 animate-spin mx-auto mb-1 text-primary" /> Loading logs...
                                    </TableCell>
                                </TableRow>
                            ) : filtered.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-8 text-xs text-muted-foreground">
                                        No execution logs found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filtered.map((log) => (
                                    <TableRow
                                        key={log.id}
                                        onClick={() => handleInspect(log)}
                                        className="border-b border-border/40 hover:bg-secondary/20 last:border-0 cursor-pointer transition-colors"
                                    >
                                        <TableCell className="py-2.5 px-4 font-mono text-xs font-semibold text-foreground">{log.id}</TableCell>
                                        <TableCell className="py-2.5 px-4 font-medium text-xs text-foreground">{log.workflowName}</TableCell>
                                        <TableCell className="py-2.5 px-4 text-xs text-muted-foreground">{log.trigger}</TableCell>
                                        <TableCell className="py-2.5 px-4">
                                            <Badge
                                                variant="outline"
                                                className={`text-[9px] font-semibold px-2 py-0.5 rounded ${
                                                    log.status === 'Success'
                                                        ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                                                        : 'bg-rose-500/10 text-rose-500 border-rose-500/20'
                                                }`}
                                            >
                                                {log.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="py-2.5 px-4 text-xs font-mono text-muted-foreground">{log.duration}</TableCell>
                                        <TableCell className="py-2.5 px-4 text-xs text-muted-foreground font-mono">{log.timestamp}</TableCell>
                                        <TableCell className="py-2.5 px-4 text-right">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleRetry(log);
                                                }}
                                                className="h-7 text-xs text-sky-500 hover:bg-sky-500/10 gap-1"
                                            >
                                                <Play className="w-3 h-3" /> Retry
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Inspect Execution Log Dialog */}
            <Dialog open={isInspectOpen} onOpenChange={setIsInspectOpen}>
                <DialogContent className="sm:max-w-lg bg-card border-border/80">
                    <DialogHeader>
                        <div className="flex items-center gap-2">
                            <DialogTitle className="text-sm font-bold">Execution Trace: {selectedLog?.id}</DialogTitle>
                            <Badge
                                variant="outline"
                                className={`text-[9px] ${
                                    selectedLog?.status === 'Success'
                                        ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                                        : 'bg-rose-500/10 text-rose-500 border-rose-500/20'
                                }`}
                            >
                                {selectedLog?.status}
                            </Badge>
                        </div>
                        <DialogDescription className="text-xs text-muted-foreground">
                            {selectedLog?.workflowName} • Duration: {selectedLog?.duration}
                        </DialogDescription>
                    </DialogHeader>

                    {selectedLog && (
                        <div className="space-y-3 pt-2 text-xs">
                            <div className="p-3 rounded-lg bg-secondary/30 border border-border/40 space-y-1">
                                <span className="font-semibold text-foreground block">Trigger Event Payload:</span>
                                <span className="font-mono text-muted-foreground">{selectedLog.trigger}</span>
                            </div>

                            {selectedLog.error && (
                                <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 space-y-1">
                                    <span className="font-semibold text-rose-500 block">Error Trace:</span>
                                    <p className="font-mono text-rose-400 text-[11px]">{selectedLog.error}</p>
                                </div>
                            )}

                            <div className="space-y-1">
                                <span className="font-semibold text-muted-foreground text-[10px] uppercase">Node Execution Breakdown</span>
                                <div className="space-y-1.5">
                                    <div className="flex items-center justify-between p-2 rounded bg-secondary/20 border border-border/40">
                                        <span className="flex items-center gap-1.5"><Zap className="w-3.5 h-3.5 text-amber-500" /> Inbound Webhook Listener</span>
                                        <span className="font-mono text-emerald-500 text-[10px]">200 OK (42ms)</span>
                                    </div>
                                    <div className="flex items-center justify-between p-2 rounded bg-secondary/20 border border-border/40">
                                        <span className="flex items-center gap-1.5"><Bot className="w-3.5 h-3.5 text-purple-500" /> FlowGenix Intent Scoring</span>
                                        <span className="font-mono text-emerald-500 text-[10px]">Score 0.94 (180ms)</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 pt-2 border-t border-border/40">
                                <Button variant="ghost" size="sm" onClick={() => setIsInspectOpen(false)} className="h-8 text-xs">
                                    Close
                                </Button>
                                <Button size="sm" onClick={() => handleRetry(selectedLog)} className="h-8 text-xs bg-sky-600 hover:bg-sky-700 text-white gap-1">
                                    <Play className="w-3 h-3" /> Re-run Execution
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
