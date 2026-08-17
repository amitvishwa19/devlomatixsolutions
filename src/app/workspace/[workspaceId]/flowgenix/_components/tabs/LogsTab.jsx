'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Activity, Search, RefreshCw, CheckCircle2, AlertTriangle, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { getTelemetryLogsAction, clearTelemetryLogsAction } from '../../_action/telemetry-actions';

export function LogsTab({ workspaceId }) {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [autoRefresh, setAutoRefresh] = useState(true);

    const loadLogs = useCallback(async () => {
        try {
            const res = await getTelemetryLogsAction(workspaceId || "default");
            if (res.success) {
                setLogs(res.logs || []);
            }
        } catch (err) {
            console.error("Error loading telemetry logs:", err);
        } finally {
            setLoading(false);
        }
    }, [workspaceId]);

    useEffect(() => {
        loadLogs();
        if (!autoRefresh) return;
        const interval = setInterval(loadLogs, 4000);
        return () => clearInterval(interval);
    }, [loadLogs, autoRefresh]);

    const handleClear = async () => {
        if (!confirm("Clear all recorded gateway telemetry logs?")) return;
        try {
            const res = await clearTelemetryLogsAction(workspaceId || "default");
            if (res.success) {
                setLogs([]);
                toast.success("Telemetry logs cleared");
            }
        } catch (err) {
            toast.error("Failed to clear telemetry");
        }
    };

    const filteredLogs = logs.filter(log => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
            (log.requestModel && log.requestModel.toLowerCase().includes(q)) ||
            (log.resolvedProvider && log.resolvedProvider.toLowerCase().includes(q)) ||
            (log.resolvedModel && log.resolvedModel.toLowerCase().includes(q)) ||
            (log.status && String(log.status).includes(q))
        );
    });

    return (
        <div className="space-y-6 pb-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl border border-border/50 bg-card/40 backdrop-blur-md">
                <div>
                    <h2 className="text-base font-bold flex items-center gap-2">
                        <Activity className="w-5 h-5 text-primary" /> Gateway Telemetry & Logs
                    </h2>
                    <p className="text-xs text-muted-foreground mt-0.5">
                        Live real-time request logs, provider resolution, latencies, and token savings.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button 
                        size="sm" 
                        variant={autoRefresh ? "default" : "outline"} 
                        onClick={() => setAutoRefresh(!autoRefresh)}
                        className="text-xs font-semibold gap-1.5 h-8"
                    >
                        <RefreshCw className={`w-3.5 h-3.5 ${autoRefresh ? 'animate-spin' : ''}`} />
                        {autoRefresh ? 'Live Polling ON' : 'Live Polling OFF'}
                    </Button>
                    <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={handleClear}
                        className="text-xs font-semibold gap-1.5 h-8 text-destructive hover:bg-destructive/10"
                    >
                        <Trash2 className="w-3.5 h-3.5" /> Clear Logs
                    </Button>
                </div>
            </div>

            {/* Table Card */}
            <Card className="border-border/50 bg-card/40 backdrop-blur-md overflow-hidden">
                <CardHeader className="p-4 pb-3 border-b border-border/40">
                    <div className="flex items-center justify-between gap-4">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                            <Input 
                                placeholder="Search request model, provider, or status..." 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9 bg-secondary/30 border-border/40 text-xs h-9" 
                            />
                        </div>
                        <Badge variant="outline" className="text-xs font-mono">
                            {filteredLogs.length} Total Events
                        </Badge>
                    </div>
                </CardHeader>

                <CardContent className="p-0">
                    {loading && logs.length === 0 ? (
                        <div className="flex items-center justify-center p-12 text-xs text-muted-foreground gap-2">
                            <Loader2 className="w-4 h-4 animate-spin text-primary" /> Loading telemetry...
                        </div>
                    ) : filteredLogs.length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-12 text-center text-xs text-muted-foreground gap-2">
                            <Activity className="w-8 h-8 opacity-40" />
                            <span>No gateway telemetry events found yet.</span>
                            <span className="text-[11px] opacity-70">Send requests via the Chat tab or API to see live traces here.</span>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow className="hover:bg-transparent text-[11px] uppercase tracking-wider font-bold">
                                    <TableHead className="w-[100px]">Time</TableHead>
                                    <TableHead>Request Target</TableHead>
                                    <TableHead>Resolved Provider</TableHead>
                                    <TableHead>Resolved Model</TableHead>
                                    <TableHead className="text-right">Tokens</TableHead>
                                    <TableHead className="text-right">Compression</TableHead>
                                    <TableHead className="text-right">Latency</TableHead>
                                    <TableHead className="text-center">Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredLogs.map((log) => (
                                    <TableRow key={log.id} className="text-xs font-mono hover:bg-secondary/20 transition-colors">
                                        <TableCell className="text-muted-foreground font-semibold">{log.time}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="text-[10px] bg-primary/10 text-primary border-primary/20">
                                                {log.requestModel}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="font-semibold text-foreground">{log.resolvedProvider}</TableCell>
                                        <TableCell className="text-muted-foreground">{log.resolvedModel}</TableCell>
                                        <TableCell className="text-right font-medium">{log.tokens}</TableCell>
                                        <TableCell className="text-right text-emerald-500 font-bold">{log.compressed}</TableCell>
                                        <TableCell className="text-right text-amber-500">{log.latency}</TableCell>
                                        <TableCell className="text-center">
                                            <Badge className={
                                                log.status >= 200 && log.status < 300
                                                    ? "bg-emerald-500/15 text-emerald-500 border-emerald-500/30 text-[9px]"
                                                    : "bg-destructive/15 text-destructive border-destructive/30 text-[9px]"
                                            }>
                                                {log.status} {log.status === 200 ? 'OK' : 'FAIL'}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
