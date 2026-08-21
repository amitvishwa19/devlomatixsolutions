"use client";

import React, { useState, useEffect, useCallback } from "react";
import { 
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
    PieChart, Pie, Cell 
} from "recharts";
import { 
    TrendingUp, Activity, CheckCircle2, Eye, Send, AlertTriangle, 
    Clock, RefreshCw, BarChart2, ShieldCheck, Zap, ArrowUpRight
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAction } from "@/hooks/use-action";
import { getAnalytics } from "../analytics/_actions/get-analytics";
import { toast } from "sonner";
import { motion } from "framer-motion";

const STATUS_COLORS = {
    Read: "#10b981",       // emerald-500
    Delivered: "#3b82f6",  // blue-500
    Sent: "#64748b",       // slate-500
    Failed: "#ef4444"      // red-500
};

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-popover/95 backdrop-blur-md border border-border/80 p-3 rounded-lg shadow-xl text-xs space-y-1.5 min-w-[150px]">
                <p className="font-semibold text-foreground border-b border-border/60 pb-1 mb-1">{label}</p>
                {payload.map((entry, index) => (
                    <div key={`item-${index}`} className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-1.5">
                            <div 
                                className="w-2 h-2 rounded-full" 
                                style={{ backgroundColor: entry.color || entry.stroke || entry.fill }}
                            />
                            <span className="text-muted-foreground capitalize">{entry.name}:</span>
                        </div>
                        <span className="font-bold text-foreground">{Number(entry.value).toLocaleString()}</span>
                    </div>
                ))}
            </div>
        );
    }
    return null;
};

export default function DashboardAnalyticsVisualizer({ workspaceId }) {
    const [range, setRange] = useState("7");
    const [analyticsData, setAnalyticsData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const { execute: executeFetchAnalytics } = useAction(getAnalytics, {
        onSuccess: (res) => {
            setAnalyticsData(res);
            setIsLoading(false);
            setIsRefreshing(false);
        },
        onError: (err) => {
            console.error("Dashboard analytics error:", err);
            setIsLoading(false);
            setIsRefreshing(false);
        }
    });

    const refreshData = useCallback(() => {
        if (!workspaceId || workspaceId === "[workspaceId]") return;
        setIsRefreshing(true);
        executeFetchAnalytics({ workspaceId, range });
    }, [workspaceId, range, executeFetchAnalytics]);

    useEffect(() => {
        refreshData();

        const handleAccountSwitch = () => {
            refreshData();
        };

        window.addEventListener("wa-account-switched", handleAccountSwitch);
        return () => window.removeEventListener("wa-account-switched", handleAccountSwitch);
    }, [refreshData]);

    const timeSeries = analyticsData?.timeSeries || [];
    const distribution = analyticsData?.distribution || [];
    const totalMessages = analyticsData?.totalMessages || 0;
    const overallReadRate = analyticsData?.overallReadRate || "0.0";

    // Calculate sum of delivered & sent
    const totalDelivered = distribution.find(d => d.name === "Delivered")?.value || 0;
    const totalRead = distribution.find(d => d.name === "Read")?.value || 0;
    const totalFailed = distribution.find(d => d.name === "Failed")?.value || 0;
    const deliveryRate = totalMessages > 0 ? (((totalDelivered + totalRead) / totalMessages) * 100).toFixed(1) : "100";

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Main Delivery & Engagement Velocity Chart */}
            <Card className="lg:col-span-2 bg-card border-border/70 shadow-xs flex flex-col justify-between overflow-hidden">
                <CardHeader className="p-4 pb-2 border-b border-border/50 flex flex-row items-center justify-between flex-wrap gap-2">
                    <div>
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 rounded-md bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                                <Activity className="w-4 h-4" />
                            </div>
                            <div>
                                <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                                    Message Deliverability & Engagement Trends
                                </CardTitle>
                                <CardDescription className="text-[11px] text-muted-foreground">
                                    Dispatches, delivery acknowledgments, and customer reads over time
                                </CardDescription>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Range Toggle */}
                        <div className="flex items-center bg-secondary/50 rounded-lg p-0.5 border border-border/60 text-xs">
                            {["7", "14", "30"].map((r) => (
                                <button
                                    key={r}
                                    type="button"
                                    onClick={() => setRange(r)}
                                    className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-all ${
                                        range === r
                                            ? "bg-background text-foreground shadow-2xs font-semibold"
                                            : "text-muted-foreground hover:text-foreground"
                                    }`}
                                >
                                    {r}D
                                </button>
                            ))}
                        </div>

                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-foreground"
                            onClick={refreshData}
                            disabled={isRefreshing}
                        >
                            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
                        </Button>
                    </div>
                </CardHeader>

                <CardContent className="p-4 pt-3 flex-1 flex flex-col justify-between">
                    {isLoading ? (
                        <div className="h-64 w-full flex items-center justify-center">
                            <div className="space-y-2 text-center">
                                <div className="h-32 w-full bg-muted/40 animate-pulse rounded-lg" />
                                <p className="text-xs text-muted-foreground animate-pulse">Loading telemetry trends...</p>
                            </div>
                        </div>
                    ) : timeSeries.length === 0 || totalMessages === 0 ? (
                        <div className="h-64 w-full flex flex-col items-center justify-center text-center p-6 border border-dashed border-border/60 rounded-xl bg-background/50">
                            <BarChart2 className="w-10 h-10 text-muted-foreground/30 mb-2" />
                            <p className="text-xs font-semibold text-foreground">No Message Activity in Selected Window</p>
                            <p className="text-[11px] text-muted-foreground max-w-sm mt-1">
                                Dispatches and webhook delivery updates will appear in this real-time graph once campaigns or chat messages are sent.
                            </p>
                        </div>
                    ) : (
                        <div className="h-64 w-full pt-2">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={timeSeries} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorSent" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                                        </linearGradient>
                                        <linearGradient id="colorRead" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.5} />
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                                        </linearGradient>
                                        <linearGradient id="colorDelivered" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-border/40" />
                                    <XAxis 
                                        dataKey="date" 
                                        stroke="currentColor" 
                                        className="text-muted-foreground text-[10px]" 
                                        tickLine={false} 
                                    />
                                    <YAxis 
                                        stroke="currentColor" 
                                        className="text-muted-foreground text-[10px]" 
                                        tickLine={false}
                                        allowDecimals={false}
                                    />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Area 
                                        type="monotone" 
                                        dataKey="sent" 
                                        name="Sent"
                                        stroke="#3b82f6" 
                                        strokeWidth={2}
                                        fillOpacity={1} 
                                        fill="url(#colorSent)" 
                                    />
                                    <Area 
                                        type="monotone" 
                                        dataKey="delivered" 
                                        name="Delivered"
                                        stroke="#6366f1" 
                                        strokeWidth={2}
                                        fillOpacity={1} 
                                        fill="url(#colorDelivered)" 
                                    />
                                    <Area 
                                        type="monotone" 
                                        dataKey="read" 
                                        name="Read"
                                        stroke="#10b981" 
                                        strokeWidth={2}
                                        fillOpacity={1} 
                                        fill="url(#colorRead)" 
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    )}

                    {/* Chart Legend and Summary Bar */}
                    <div className="pt-3 border-t border-border/40 flex items-center justify-between flex-wrap gap-2 text-[11px]">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1.5">
                                <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                                <span className="text-muted-foreground">Dispatched</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <div className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                                <span className="text-muted-foreground">Delivered</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                                <span className="text-muted-foreground">Read by User</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                                {deliveryRate}% Delivery Rate
                            </Badge>
                            <Badge variant="outline" className="text-[10px] font-mono bg-blue-500/10 text-blue-400 border-blue-500/20">
                                {overallReadRate}% Read Rate
                            </Badge>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Distribution & Meta 24-Hour Window Health */}
            <div className="space-y-4 flex flex-col justify-between">
                {/* Delivery Status Distribution */}
                <Card className="bg-card border-border/70 shadow-xs flex-1">
                    <CardHeader className="p-4 pb-2 border-b border-border/50">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-xs font-bold text-foreground flex items-center gap-2">
                                <Zap className="w-4 h-4 text-amber-400" /> Deliverability Breakdown
                            </CardTitle>
                            <span className="text-[10px] font-mono text-muted-foreground">
                                {totalMessages.toLocaleString()} Total
                            </span>
                        </div>
                    </CardHeader>

                    <CardContent className="p-4 space-y-3">
                        {/* Segmented Status Progress Bar */}
                        <div className="h-3 w-full rounded-full bg-secondary/60 overflow-hidden flex shadow-inner">
                            {totalMessages === 0 ? (
                                <div className="h-full w-full bg-muted/40" />
                            ) : (
                                <>
                                    <div 
                                        className="h-full bg-emerald-500 transition-all duration-500" 
                                        style={{ width: `${(totalRead / totalMessages) * 100}%` }}
                                        title={`Read: ${totalRead}`}
                                    />
                                    <div 
                                        className="h-full bg-blue-500 transition-all duration-500" 
                                        style={{ width: `${(totalDelivered / totalMessages) * 100}%` }}
                                        title={`Delivered: ${totalDelivered}`}
                                    />
                                    <div 
                                        className="h-full bg-slate-500 transition-all duration-500" 
                                        style={{ width: `${Math.max(0, 100 - (((totalRead + totalDelivered + totalFailed) / totalMessages) * 100))}%` }}
                                        title="Sent / Pending"
                                    />
                                    <div 
                                        className="h-full bg-rose-500 transition-all duration-500" 
                                        style={{ width: `${(totalFailed / totalMessages) * 100}%` }}
                                        title={`Failed: ${totalFailed}`}
                                    />
                                </>
                            )}
                        </div>

                        {/* Status Metrics List */}
                        <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="p-2.5 rounded-lg bg-emerald-500/5 border border-emerald-500/15 flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                                        <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Read
                                    </p>
                                    <p className="text-sm font-bold text-foreground">{totalRead.toLocaleString()}</p>
                                </div>
                                <span className="text-[10px] font-mono font-bold text-emerald-400">
                                    {totalMessages > 0 ? ((totalRead / totalMessages) * 100).toFixed(0) : 0}%
                                </span>
                            </div>

                            <div className="p-2.5 rounded-lg bg-blue-500/5 border border-blue-500/15 flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                                        <Send className="w-3 h-3 text-blue-500" /> Delivered
                                    </p>
                                    <p className="text-sm font-bold text-foreground">{totalDelivered.toLocaleString()}</p>
                                </div>
                                <span className="text-[10px] font-mono font-bold text-blue-400">
                                    {totalMessages > 0 ? ((totalDelivered / totalMessages) * 100).toFixed(0) : 0}%
                                </span>
                            </div>

                            <div className="p-2.5 rounded-lg bg-slate-500/5 border border-slate-500/15 flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                                        <Clock className="w-3 h-3 text-slate-400" /> In Transit
                                    </p>
                                    <p className="text-sm font-bold text-foreground">
                                        {Math.max(0, totalMessages - (totalRead + totalDelivered + totalFailed)).toLocaleString()}
                                    </p>
                                </div>
                                <span className="text-[10px] font-mono font-bold text-slate-400">
                                    {totalMessages > 0 ? (Math.max(0, 100 - (((totalRead + totalDelivered + totalFailed) / totalMessages) * 100))).toFixed(0) : 0}%
                                </span>
                            </div>

                            <div className="p-2.5 rounded-lg bg-rose-500/5 border border-rose-500/15 flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                                        <AlertTriangle className="w-3 h-3 text-rose-500" /> Failed
                                    </p>
                                    <p className="text-sm font-bold text-foreground">{totalFailed.toLocaleString()}</p>
                                </div>
                                <span className="text-[10px] font-mono font-bold text-rose-400">
                                    {totalMessages > 0 ? ((totalFailed / totalMessages) * 100).toFixed(0) : 0}%
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* 24-Hour Meta Service Window Banner */}
                <Card className="bg-gradient-to-br from-card to-secondary/30 border-border/70 shadow-xs">
                    <CardContent className="p-3.5 flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0 border border-primary/20">
                            <ShieldCheck className="w-4 h-4" />
                        </div>
                        <div className="space-y-1 flex-1">
                            <div className="flex items-center justify-between">
                                <p className="text-xs font-bold text-foreground">Meta 24h Customer Service Window</p>
                                <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                            </div>
                            <p className="text-[10px] text-muted-foreground leading-relaxed">
                                Free 2-way sessions active for all user-initiated incoming messages. Outbound broadcasts outside the 24h window utilize verified Meta Utility/Marketing templates.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
