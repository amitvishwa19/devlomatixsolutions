'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
    BarChart3, 
    TrendingDown, 
    Zap, 
    Clock, 
    Layers, 
    RefreshCw, 
    Download, 
    Trash2, 
    DollarSign, 
    Cpu, 
    Activity, 
    CheckCircle2, 
    AlertCircle,
    ArrowUpRight,
    PieChart,
    FileSpreadsheet,
    FileCode,
    Sparkles,
    ShieldCheck
} from 'lucide-react';
import { toast } from 'sonner';
import { 
    getComprehensiveAnalyticsAction, 
    getTelemetryLogsAction, 
    clearTelemetryLogsAction 
} from '../../_action/telemetry-actions';

export function AnalyticsTab({ workspaceId }) {
    const [data, setData] = useState(null);
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [timeWindow, setTimeWindow] = useState('all'); // 'all' | '1h' | '24h'

    const fetchAnalytics = useCallback(async (isManual = false) => {
        if (!workspaceId) return;
        if (isManual) setRefreshing(true);
        try {
            const [analyticsRes, logsRes] = await Promise.all([
                getComprehensiveAnalyticsAction(workspaceId),
                getTelemetryLogsAction(workspaceId)
            ]);

            if (analyticsRes.success) {
                setData(analyticsRes.data);
            }
            if (logsRes.success) {
                setLogs(logsRes.logs || []);
            }
        } catch (err) {
            console.error("Analytics fetch error:", err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [workspaceId]);

    useEffect(() => {
        fetchAnalytics();
        const interval = setInterval(() => fetchAnalytics(), 6000);
        return () => clearInterval(interval);
    }, [fetchAnalytics]);

    const handleClearLogs = async () => {
        if (!confirm("Are you sure you want to reset telemetry logs and analytics?")) return;
        const res = await clearTelemetryLogsAction(workspaceId);
        if (res.success) {
            toast.success("Telemetry logs cleared");
            fetchAnalytics();
        }
    };

    const handleExportCSV = () => {
        if (!logs || logs.length === 0) {
            return toast.error("No telemetry logs available to export.");
        }

        const headers = ["Timestamp", "Hour", "RequestModel", "ResolvedProvider", "ResolvedModel", "TokensIn", "TokensOut", "TotalTokens", "LatencyMs", "Status", "CompressionSavings", "CostUSD", "CostSavedUSD", "HasAttachments", "Error"];
        const csvRows = [headers.join(",")];

        logs.forEach(log => {
            const row = [
                `"${log.timestamp}"`,
                `"${log.hour || ''}"`,
                `"${log.requestModel || ''}"`,
                `"${log.resolvedProvider || ''}"`,
                `"${log.resolvedModel || ''}"`,
                log.tokensIn || 0,
                log.tokensOut || 0,
                log.tokens || 0,
                log.latencyMs || 0,
                log.status || 200,
                `"${log.compressed || '0%'}"`,
                log.cost || 0,
                log.costSaved || 0,
                log.hasAttachments ? "true" : "false",
                `"${(log.error || '').replace(/"/g, '""')}"`
            ];
            csvRows.push(row.join(","));
        });

        const blob = new Blob([csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `flowgenix-analytics-${Date.now()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success("Exported analytics report to CSV!");
    };

    const handleExportJSON = () => {
        if (!logs || logs.length === 0) {
            return toast.error("No telemetry logs available to export.");
        }

        const exportPayload = {
            exportedAt: new Date().toISOString(),
            workspaceId,
            summary: data?.summary,
            providerBreakdown: data?.providerBreakdown,
            modelBreakdown: data?.modelBreakdown,
            logs
        };

        const blob = new Blob([JSON.stringify(exportPayload, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `flowgenix-telemetry-dump-${Date.now()}.json`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success("Exported telemetry dump to JSON!");
    };

    const summary = data?.summary || {
        totalRequests: 0,
        successRate: 100,
        totalTokensIn: 0,
        totalTokensOut: 0,
        totalTokens: 0,
        avgLatencyMs: 0,
        totalCostUsd: "0.0000",
        totalCostSavedUsd: "0.0000",
        avgCompressionRate: "0%"
    };

    const providerBreakdown = data?.providerBreakdown || [];
    const modelBreakdown = data?.modelBreakdown || [];
    const timeline = data?.timeline || [];
    const latencyDistribution = data?.latencyDistribution || [];

    const maxTimelineTokens = Math.max(...timeline.map(t => (t.tokensIn + t.tokensOut)), 1);

    return (
        <div className="space-y-4 pb-6">
            {/* Header Control Banner */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 p-4 rounded-xl border border-border/50 bg-card/40 backdrop-blur-md">
                <div>
                    <div className="flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-primary" />
                        <h2 className="text-sm font-bold tracking-tight">Real-Time Gateway Analytics & Cost Intelligence</h2>
                        <Badge className="bg-emerald-500/15 text-emerald-500 border-emerald-500/30 text-[9px] font-mono px-1.5 py-0">
                            LIVE TELEMETRY
                        </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                        Token volumes, multi-provider cost tracking, failover efficiency, and compression analytics.
                    </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                    <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => fetchAnalytics(true)} 
                        disabled={refreshing}
                        className="h-8 text-xs font-semibold gap-1.5 bg-secondary/30 border-border/40"
                    >
                        <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-primary" : ""}`} />
                        Refresh
                    </Button>

                    <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={handleExportCSV}
                        className="h-8 text-xs font-semibold gap-1.5 bg-secondary/30 border-border/40 hover:text-emerald-400"
                    >
                        <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-500" />
                        Export CSV
                    </Button>

                    <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={handleExportJSON}
                        className="h-8 text-xs font-semibold gap-1.5 bg-secondary/30 border-border/40 hover:text-purple-400"
                    >
                        <FileCode className="w-3.5 h-3.5 text-purple-500" />
                        Export JSON
                    </Button>

                    <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={handleClearLogs}
                        className="h-8 text-xs text-destructive hover:bg-destructive/10"
                        title="Clear all logs"
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                </div>
            </div>

            {/* Top Stat Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {/* Total Requests */}
                <Card className="border border-border/50 bg-card/40 shadow-xs p-3.5 rounded-xl">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Total Requests</span>
                        <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
                            <Activity className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="mt-2 flex items-baseline gap-2">
                        <span className="text-2xl font-black tracking-tight">{summary.totalRequests}</span>
                        <Badge className="text-[10px] font-mono bg-emerald-500/15 text-emerald-400">
                            {summary.successRate}% Success
                        </Badge>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-1">
                        {summary.successfulRequests || 0} ok • {summary.failedRequests || 0} failover
                    </p>
                </Card>

                {/* Total Token Volume */}
                <Card className="border border-border/50 bg-card/40 shadow-xs p-3.5 rounded-xl">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Total Tokens</span>
                        <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
                            <Zap className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="mt-2 flex items-baseline gap-2">
                        <span className="text-2xl font-black tracking-tight font-mono">
                            {summary.totalTokens > 1000 ? `${(summary.totalTokens / 1000).toFixed(1)}k` : summary.totalTokens}
                        </span>
                        <span className="text-xs text-muted-foreground font-mono">tokens</span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-1 font-mono">
                        <span>In: <b>{summary.totalTokensIn}</b></span>
                        <span>•</span>
                        <span>Out: <b>{summary.totalTokensOut}</b></span>
                    </div>
                </Card>

                {/* Estimated LLM Spend */}
                <Card className="border border-border/50 bg-card/40 shadow-xs p-3.5 rounded-xl">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Estimated Spend</span>
                        <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <DollarSign className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="mt-2 flex items-baseline gap-2">
                        <span className="text-2xl font-black tracking-tight font-mono text-foreground">${summary.totalCostUsd}</span>
                        <Badge className="text-[10px] font-mono bg-purple-500/15 text-purple-400">
                            USD
                        </Badge>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-1 font-mono">
                        Saved via free tiers: <b>${summary.totalCostSavedUsd}</b>
                    </p>
                </Card>

                {/* Avg Latency & Token Compression */}
                <Card className="border border-border/50 bg-card/40 shadow-xs p-3.5 rounded-xl">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Avg Latency & RTK</span>
                        <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            <Clock className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="mt-2 flex items-baseline gap-2">
                        <span className="text-2xl font-black tracking-tight font-mono">{summary.avgLatencyMs}ms</span>
                        <Badge className="text-[10px] font-mono bg-emerald-500/15 text-emerald-400">
                            {summary.avgCompressionRate} Saved
                        </Badge>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-1">
                        Inflation Guard active on all streams
                    </p>
                </Card>
            </div>

            {/* Visual Timeline & Provider Share Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                {/* Timeline Histogram Chart (2 cols) */}
                <Card className="lg:col-span-2 border border-border/50 bg-card/40 shadow-xs p-4 rounded-xl flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <div>
                                <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">Token Throughput Over Time</h3>
                                <p className="text-[11px] text-muted-foreground">Hourly request distribution and token traffic</p>
                            </div>
                            <Badge variant="outline" className="text-[10px] font-mono">
                                {timeline.length} Time Buckets
                            </Badge>
                        </div>

                        {timeline.length === 0 ? (
                            <div className="h-44 flex flex-col items-center justify-center text-muted-foreground text-xs gap-2">
                                <Activity className="w-6 h-6 opacity-40 animate-pulse" />
                                <span>No request activity logged yet. Send prompts in Chat or Overview to view live charts.</span>
                            </div>
                        ) : (
                            <div className="space-y-3 pt-2">
                                {timeline.slice(-6).map((bucket, idx) => {
                                    const total = bucket.tokensIn + bucket.tokensOut;
                                    const inPercent = Math.round((bucket.tokensIn / (total || 1)) * 100);
                                    const widthPercent = Math.max(Math.round((total / maxTimelineTokens) * 100), 8);

                                    return (
                                        <div key={idx} className="space-y-1">
                                            <div className="flex items-center justify-between text-xs font-mono">
                                                <span className="font-bold text-foreground">{bucket.hour}</span>
                                                <span className="text-muted-foreground">
                                                    <b>{bucket.requests}</b> reqs • <b>{total}</b> tokens (${bucket.cost}) • <b>{bucket.avgLatency}ms</b>
                                                </span>
                                            </div>
                                            <div className="h-4 w-full bg-secondary/30 rounded-md overflow-hidden flex">
                                                <div 
                                                    style={{ width: `${widthPercent}%` }} 
                                                    className="h-full bg-linear-to-r from-purple-500 via-indigo-500 to-primary rounded-md flex items-center justify-end px-1.5 text-[9px] font-bold text-white font-mono transition-all duration-500"
                                                >
                                                    {total > 100 ? `${total}t` : ''}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    <div className="pt-3 mt-3 border-t border-border/30 flex items-center justify-between text-[11px] text-muted-foreground font-mono">
                        <div className="flex items-center gap-2">
                            <span className="inline-block w-2.5 h-2.5 rounded-full bg-purple-500" />
                            <span>Prompt Tokens (In)</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="inline-block w-2.5 h-2.5 rounded-full bg-primary" />
                            <span>Completion Tokens (Out)</span>
                        </div>
                    </div>
                </Card>

                {/* Provider Share Donut / Bar List (1 col) */}
                <Card className="border border-border/50 bg-card/40 shadow-xs p-4 rounded-xl flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <div>
                                <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">Provider Share</h3>
                                <p className="text-[11px] text-muted-foreground">Traffic distributed by active LLM engine</p>
                            </div>
                            <Cpu className="w-4 h-4 text-primary" />
                        </div>

                        {providerBreakdown.length === 0 ? (
                            <div className="h-44 flex flex-col items-center justify-center text-muted-foreground text-xs gap-2">
                                <PieChart className="w-6 h-6 opacity-40" />
                                <span>No provider metrics recorded.</span>
                            </div>
                        ) : (
                            <div className="space-y-2.5 pt-1">
                                {providerBreakdown.map((prov, idx) => (
                                    <div key={idx} className="space-y-1">
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="font-bold text-foreground capitalize">{prov.provider}</span>
                                            <span className="font-mono text-muted-foreground text-[11px]">
                                                <b>{prov.count}</b> reqs ({prov.percentage}%) • <b>${prov.cost}</b>
                                            </span>
                                        </div>
                                        <div className="h-2 w-full bg-secondary/40 rounded-full overflow-hidden">
                                            <div 
                                                style={{ width: `${prov.percentage}%` }} 
                                                className="h-full bg-linear-to-r from-emerald-500 to-primary rounded-full transition-all duration-500"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="pt-3 mt-3 border-t border-border/30 text-[10px] text-muted-foreground font-mono">
                        Automatic cascading failover enabled across {providerBreakdown.length} active providers.
                    </div>
                </Card>
            </div>

            {/* Top Models Performance Table */}
            <Card className="border border-border/50 bg-card/40 shadow-xs p-4 rounded-xl">
                <div className="flex items-center justify-between mb-3">
                    <div>
                        <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">Top Models & Endpoints</h3>
                        <p className="text-[11px] text-muted-foreground">Breakdown of throughput, latency, and estimated cost per model</p>
                    </div>
                    <Badge variant="secondary" className="text-[10px] font-mono">
                        {modelBreakdown.length} Models Active
                    </Badge>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                        <thead>
                            <tr className="border-b border-border/40 text-[10px] font-bold uppercase tracking-wider text-muted-foreground font-mono">
                                <th className="py-2 px-3">Model Name</th>
                                <th className="py-2 px-3">Provider</th>
                                <th className="py-2 px-3">Requests</th>
                                <th className="py-2 px-3">Tokens</th>
                                <th className="py-2 px-3">Avg Latency</th>
                                <th className="py-2 px-3 text-right">Est. Spend</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/20 font-mono">
                            {modelBreakdown.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="py-8 text-center text-muted-foreground text-xs font-sans">
                                        No model traffic recorded yet.
                                    </td>
                                </tr>
                            ) : (
                                modelBreakdown.map((m, idx) => (
                                    <tr key={idx} className="hover:bg-secondary/20 transition-colors">
                                        <td className="py-2.5 px-3 font-bold text-foreground">
                                            {m.model}
                                        </td>
                                        <td className="py-2.5 px-3">
                                            <Badge variant="outline" className="text-[10px] uppercase font-mono px-1.5 py-0">
                                                {m.provider}
                                            </Badge>
                                        </td>
                                        <td className="py-2.5 px-3 text-foreground font-semibold">{m.count}</td>
                                        <td className="py-2.5 px-3 text-muted-foreground">{m.tokens}</td>
                                        <td className="py-2.5 px-3 text-emerald-400">{m.avgLatency}ms</td>
                                        <td className="py-2.5 px-3 text-right text-foreground font-bold">${m.cost}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Latency Distribution Breakdown */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                {latencyDistribution.map((item, idx) => (
                    <Card key={idx} className="border border-border/40 bg-card/30 p-2.5 rounded-lg text-center">
                        <span className="text-[10px] font-mono text-muted-foreground block">{item.range}</span>
                        <span className="text-base font-black text-foreground font-mono mt-0.5 block">{item.count}</span>
                        <span className="text-[9px] text-muted-foreground">requests</span>
                    </Card>
                ))}
            </div>
        </div>
    );
}
