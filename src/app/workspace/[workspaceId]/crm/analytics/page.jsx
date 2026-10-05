'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
    TrendingUp,
    DollarSign,
    Target,
    Users,
    Trophy,
    Award,
    Flame,
    Zap,
    BarChart3,
    PieChart,
    ArrowUpRight,
    ArrowDownRight,
    CheckCircle2,
    AlertTriangle,
    Clock,
    Calendar,
    MessageCircle,
    Phone,
    Briefcase,
    Sparkles,
    Filter,
    RefreshCw,
    SlidersHorizontal,
    Crown,
    ChevronRight,
    Loader2
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

import { getRevenueForecastAction, getTeamSalesLeaderboardAction } from '../_actions/crm-analytics-actions';
import { getPipelinesAction } from '../_actions/pipeline-actions';

export default function CrmAnalyticsPage() {
    const params = useParams();
    const workspaceId = params?.workspaceId;

    const [forecastData, setForecastData] = useState(null);
    const [leaderboardData, setLeaderboardData] = useState([]);
    const [pipelines, setPipelines] = useState([]);
    const [selectedPipelineId, setSelectedPipelineId] = useState('ALL');
    const [timeframe, setTimeframe] = useState('CURRENT_QUARTER');
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const loadAnalytics = async () => {
        if (!workspaceId) return;
        try {
            setIsLoading(true);
            const [forecastRes, leaderboardRes, pipelinesRes] = await Promise.all([
                getRevenueForecastAction(workspaceId, { pipelineId: selectedPipelineId, timeframe }),
                getTeamSalesLeaderboardAction(workspaceId, { timeframe }),
                getPipelinesAction(workspaceId)
            ]);

            if (forecastRes.success) setForecastData(forecastRes.data);
            if (leaderboardRes.success) setLeaderboardData(leaderboardRes.data);
            if (pipelinesRes.success) setPipelines(pipelinesRes.data);
        } catch (error) {
            console.error("Error loading analytics:", error);
            toast.error("Failed to load forecasting analytics");
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    };

    useEffect(() => {
        loadAnalytics();
    }, [workspaceId, selectedPipelineId, timeframe]);

    const handleRefresh = () => {
        setIsRefreshing(true);
        loadAnalytics();
    };

    const formatINR = (val) => {
        return `₹${Number(val || 0).toLocaleString('en-IN')}`;
    };

    const summary = forecastData?.summary || {
        totalPipelineValue: 0,
        weightedExpectedRevenue: 0,
        committedRevenue: 0,
        bestCaseRevenue: 0,
        wonRevenue: 0,
        winRate: 0,
        openDealsCount: 0,
        wonDealsCount: 0,
        lostDealsCount: 0,
        averageDealSize: 0
    };

    const topThree = leaderboardData.slice(0, 3);

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-12">
            {/* Header Telemetry Hero */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-card via-card to-background border border-border/80 shadow-sm relative overflow-hidden">
                <div className="space-y-1.5 z-10">
                    <div className="flex items-center gap-2">
                        <Badge className="bg-primary/10 text-primary border-primary/20 text-xs font-semibold px-2.5 py-0.5">
                            <TrendingUp className="w-3.5 h-3.5 mr-1" />
                            Predictive Revenue Intelligence
                        </Badge>
                        <Badge variant="outline" className="text-amber-500 border-amber-500/30 text-[10px] font-bold">
                            <Sparkles className="w-3 h-3 mr-1 inline" />
                            FlowGenix AI Powered
                        </Badge>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
                        Revenue Forecasting & Team Leaderboard
                    </h1>
                    <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl">
                        Real-time probabilistic revenue projections, stage conversion velocity, and rep quota leaderboard.
                    </p>
                </div>

                <div className="flex items-center gap-2.5 z-10 flex-wrap">
                    {/* Pipeline Selector */}
                    <Select value={selectedPipelineId} onValueChange={setSelectedPipelineId}>
                        <SelectTrigger className="h-9 text-xs w-[160px] bg-background">
                            <SelectValue placeholder="All Pipelines" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">All Pipelines</SelectItem>
                            {pipelines.map(p => (
                                <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {/* Timeframe Selector */}
                    <Select value={timeframe} onValueChange={setTimeframe}>
                        <SelectTrigger className="h-9 text-xs w-[150px] bg-background font-semibold">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="THIS_MONTH">This Month</SelectItem>
                            <SelectItem value="CURRENT_QUARTER">Current Quarter (Q3)</SelectItem>
                            <SelectItem value="NEXT_QUARTER">Next Quarter (Q4)</SelectItem>
                            <SelectItem value="FY_2026">Full Year 2026</SelectItem>
                        </SelectContent>
                    </Select>

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleRefresh}
                        disabled={isRefreshing}
                        className="h-9 text-xs gap-1.5 bg-background border-border/80"
                    >
                        <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                        <span>Refresh</span>
                    </Button>
                </div>
            </div>

            {/* 4-Tier Scenario KPI Strip */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
                {/* 1. Weighted Expected Revenue */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-500/10 via-card to-card border border-blue-500/30 shadow-xs space-y-1">
                    <div className="flex items-center justify-between text-muted-foreground">
                        <span className="text-xs font-bold uppercase tracking-wider text-blue-500">Weighted Forecast</span>
                        <Zap className="w-4 h-4 text-blue-500" />
                    </div>
                    <div className="text-2xl font-black text-foreground">
                        {formatINR(summary.weightedExpectedRevenue)}
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                        Probability-adjusted pipeline value
                    </p>
                </div>

                {/* 2. Committed Revenue */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-card to-card border border-emerald-500/30 shadow-xs space-y-1">
                    <div className="flex items-center justify-between text-muted-foreground">
                        <span className="text-xs font-bold uppercase tracking-wider text-emerald-500">Committed Floor</span>
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    </div>
                    <div className="text-2xl font-black text-emerald-500">
                        {formatINR(summary.committedRevenue)}
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                        Won deals + &gt;60% high confidence
                    </p>
                </div>

                {/* 3. Best-Case Max */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-500/10 via-card to-card border border-purple-500/30 shadow-xs space-y-1">
                    <div className="flex items-center justify-between text-muted-foreground">
                        <span className="text-xs font-bold uppercase tracking-wider text-purple-500">Best-Case Ceiling</span>
                        <TrendingUp className="w-4 h-4 text-purple-500" />
                    </div>
                    <div className="text-2xl font-black text-foreground">
                        {formatINR(summary.bestCaseRevenue)}
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                        100% conversion of all active deals
                    </p>
                </div>

                {/* 4. Closed Won Actuals */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/10 via-card to-card border border-amber-500/30 shadow-xs space-y-1">
                    <div className="flex items-center justify-between text-muted-foreground">
                        <span className="text-xs font-bold uppercase tracking-wider text-amber-500">Closed Won (Actuals)</span>
                        <Trophy className="w-4 h-4 text-amber-500" />
                    </div>
                    <div className="text-2xl font-black text-foreground">
                        {formatINR(summary.wonRevenue)}
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                        <span className="text-muted-foreground">{summary.wonDealsCount} won deals</span>
                        <span className="text-emerald-500 font-bold">{summary.winRate}% Win Rate</span>
                    </div>
                </div>
            </div>

            {/* Main Tabs */}
            <Tabs defaultValue="forecast" className="space-y-4">
                <TabsList className="bg-muted/50 p-1 rounded-2xl border border-border/60">
                    <TabsTrigger value="forecast" className="rounded-xl text-xs font-bold gap-1.5 px-3 py-1.5">
                        <BarChart3 className="w-3.5 h-3.5" />
                        <span>Revenue Forecasting & Funnel</span>
                    </TabsTrigger>
                    <TabsTrigger value="leaderboard" className="rounded-xl text-xs font-bold gap-1.5 px-3 py-1.5">
                        <Trophy className="w-3.5 h-3.5 text-amber-500" />
                        <span>Sales Rep Leaderboard ({leaderboardData.length})</span>
                    </TabsTrigger>
                    <TabsTrigger value="slippage" className="rounded-xl text-xs font-bold gap-1.5 px-3 py-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                        <span>Deal Slippage Radar ({forecastData?.dealsAtRiskOfSlipping?.length || 0})</span>
                    </TabsTrigger>
                </TabsList>

                {/* Tab 1: Revenue Forecasting & Stage Funnel */}
                <TabsContent value="forecast" className="space-y-6 outline-none">
                    {isLoading ? (
                        <div className="flex items-center justify-center p-12 text-muted-foreground">
                            <Loader2 className="w-6 h-6 animate-spin mr-2" />
                            <span>Calculating forecast models...</span>
                        </div>
                    ) : (
                        <>
                            {/* Monthly Trajectory Projections Chart */}
                            <div className="p-6 rounded-3xl bg-card border border-border/80 shadow-xs space-y-4">
                                <div className="flex items-center justify-between pb-3 border-b border-border/60">
                                    <div>
                                        <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                                            <BarChart3 className="w-4 h-4 text-primary" />
                                            <span>Monthly Revenue Trajectory & Quota Target</span>
                                        </h3>
                                        <p className="text-xs text-muted-foreground">
                                            Comparison of historical actuals, weighted pipeline projections, and workspace revenue goals.
                                        </p>
                                    </div>
                                    <Badge variant="outline" className="text-xs font-bold font-mono">
                                        FY 2026 Pace: On Track
                                    </Badge>
                                </div>

                                <div className="space-y-4">
                                    {forecastData?.monthlyForecast?.map((m, idx) => {
                                        const isCurrent = m.month.includes('Current');
                                        const isPast = m.actual > 0 && !isCurrent;
                                        const displayVal = isPast ? m.actual : (isCurrent ? m.actual + m.projected : m.projected);
                                        const percentage = Math.min(100, Math.round((displayVal / (m.quota || 1000000)) * 100));

                                        return (
                                            <div key={idx} className="space-y-1.5">
                                                <div className="flex items-center justify-between text-xs">
                                                    <div className="flex items-center gap-2">
                                                        <span className={`font-bold ${isCurrent ? 'text-primary' : 'text-foreground'}`}>
                                                            {m.month}
                                                        </span>
                                                        {isCurrent && (
                                                            <Badge className="bg-primary/10 text-primary text-[9px] py-0">Current</Badge>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-3 font-mono">
                                                        <span className="text-muted-foreground">Target: {formatINR(m.quota)}</span>
                                                        <span className="font-bold text-foreground">{formatINR(displayVal)}</span>
                                                        <Badge variant="outline" className={`text-[10px] ${
                                                            percentage >= 100 ? 'text-emerald-500 border-emerald-500/30' : 'text-blue-500 border-blue-500/30'
                                                        }`}>
                                                            {percentage}%
                                                        </Badge>
                                                    </div>
                                                </div>

                                                <div className="h-3 w-full rounded-full bg-muted/60 overflow-hidden flex">
                                                    <div
                                                        className={`h-full transition-all duration-500 ${
                                                            isPast ? 'bg-emerald-500' : isCurrent ? 'bg-gradient-to-r from-emerald-500 to-blue-500' : 'bg-blue-500/80'
                                                        }`}
                                                        style={{ width: `${percentage}%` }}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Pipeline Funnel & Stage Drop-off Velocity */}
                            <div className="p-6 rounded-3xl bg-card border border-border/80 shadow-xs space-y-4">
                                <div className="flex items-center justify-between pb-3 border-b border-border/60">
                                    <div>
                                        <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                                            <TrendingUp className="w-4 h-4 text-emerald-500" />
                                            <span>Pipeline Stage Conversion Funnel</span>
                                        </h3>
                                        <p className="text-xs text-muted-foreground">
                                            Dwell value, deal volume, and progression win probabilities across pipeline stages.
                                        </p>
                                    </div>
                                    <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-[11px] font-semibold">
                                        {forecastData?.funnelStages?.length || 0} Active Stages
                                    </Badge>
                                </div>

                                <div className="space-y-3">
                                    {forecastData?.funnelStages?.map((stage, idx) => {
                                        const funnelWidth = Math.max(25, 100 - (idx * 12));

                                        return (
                                            <div
                                                key={stage.id}
                                                className="p-3.5 rounded-2xl bg-muted/20 border border-border/70 space-y-2 hover:border-primary/40 transition-all"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <span
                                                            className="w-3 h-3 rounded-full shrink-0"
                                                            style={{ backgroundColor: stage.color }}
                                                        />
                                                        <h4 className="font-bold text-xs text-foreground">{stage.name}</h4>
                                                        <Badge variant="outline" className="text-[10px] font-semibold">
                                                            {stage.dealsCount} Deal{stage.dealsCount !== 1 ? 's' : ''}
                                                        </Badge>
                                                    </div>

                                                    <div className="flex items-center gap-4 text-xs font-mono">
                                                        <span className="text-muted-foreground">Stage Value: <strong className="text-foreground">{formatINR(stage.totalValue)}</strong></span>
                                                        <span className="text-primary font-bold">Weighted: {formatINR(stage.weightedValue)}</span>
                                                        <Badge className="bg-primary/10 text-primary text-[10px]">
                                                            {stage.probability}% Prob
                                                        </Badge>
                                                    </div>
                                                </div>

                                                {/* Funnel Visual Bar */}
                                                <div className="w-full bg-muted/40 h-2 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full rounded-full transition-all"
                                                        style={{
                                                            width: `${stage.probability}%`,
                                                            backgroundColor: stage.color || '#3b82f6'
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </>
                    )}
                </TabsContent>

                {/* Tab 2: Sales Rep Leaderboard */}
                <TabsContent value="leaderboard" className="space-y-6 outline-none">
                    {/* Top 3 Podium Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {topThree.map((rep) => {
                            const isFirst = rep.rank === 1;
                            const isSecond = rep.rank === 2;

                            return (
                                <div
                                    key={rep.repId}
                                    className={`p-5 rounded-3xl bg-card border relative overflow-hidden flex flex-col justify-between shadow-xs transition-all ${
                                        isFirst
                                            ? 'border-amber-500/50 bg-gradient-to-b from-amber-500/10 via-card to-card shadow-amber-500/5'
                                            : isSecond
                                            ? 'border-zinc-400/40'
                                            : 'border-amber-700/30'
                                    }`}
                                >
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-9 h-9 rounded-2xl flex items-center justify-center font-black text-sm text-white shadow-sm ${
                                                    isFirst ? 'bg-gradient-to-tr from-amber-400 to-yellow-600' : isSecond ? 'bg-gradient-to-tr from-zinc-400 to-zinc-600' : 'bg-gradient-to-tr from-amber-700 to-amber-900'
                                                }`}>
                                                    {isFirst ? <Crown className="w-5 h-5 text-yellow-100" /> : `#${rep.rank}`}
                                                </div>
                                                <div>
                                                    <h3 className="text-sm font-bold text-foreground truncate">{rep.name}</h3>
                                                    <p className="text-[11px] text-muted-foreground">{rep.role}</p>
                                                </div>
                                            </div>

                                            <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px] font-bold">
                                                {rep.badge}
                                            </Badge>
                                        </div>

                                        {/* Revenue & Quota */}
                                        <div className="p-3 rounded-2xl bg-muted/20 border border-border/60 space-y-1.5">
                                            <div className="flex items-center justify-between text-xs">
                                                <span className="text-muted-foreground">Closed Revenue:</span>
                                                <span className="text-sm font-black text-foreground font-mono">{formatINR(rep.wonValue)}</span>
                                            </div>

                                            <div className="space-y-1">
                                                <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                                                    <span>Quota Attainment</span>
                                                    <strong className="text-emerald-500">{rep.quotaAttainment}% ({formatINR(rep.quota)})</strong>
                                                </div>
                                                <Progress value={Math.min(100, rep.quotaAttainment)} className="h-2" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Stats Strip */}
                                    <div className="grid grid-cols-3 gap-2 pt-3 border-t border-border/40 text-center text-[11px] mt-3">
                                        <div>
                                            <span className="text-muted-foreground block text-[10px]">Won Deals</span>
                                            <span className="font-bold text-foreground">{rep.wonCount}</span>
                                        </div>
                                        <div>
                                            <span className="text-muted-foreground block text-[10px]">Win Rate</span>
                                            <span className="font-bold text-emerald-500">{rep.winRate}%</span>
                                        </div>
                                        <div>
                                            <span className="text-muted-foreground block text-[10px]">WhatsApp</span>
                                            <span className="font-bold text-[#25D366]">{rep.whatsappSent}</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Complete Team Ranking Table */}
                    <div className="rounded-3xl bg-card border border-border/80 overflow-hidden shadow-xs">
                        <div className="p-4 sm:p-5 border-b border-border/80 flex items-center justify-between">
                            <div>
                                <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                                    <Trophy className="w-4 h-4 text-amber-500" />
                                    <span>Team Performance & Activity Velocity</span>
                                </h3>
                                <p className="text-xs text-muted-foreground">
                                    Comprehensive rankings across revenue, win percentage, and multi-channel customer touchpoints.
                                </p>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-xs text-left">
                                <thead className="bg-muted/40 text-muted-foreground border-b border-border/60 text-[11px] uppercase tracking-wider font-semibold">
                                    <tr>
                                        <th className="py-3 px-4">Rank & Sales Rep</th>
                                        <th className="py-3 px-4">Closed Revenue</th>
                                        <th className="py-3 px-4">Quota Target</th>
                                        <th className="py-3 px-4">Attainment %</th>
                                        <th className="py-3 px-4">Deals Won / Open</th>
                                        <th className="py-3 px-4">Win Rate</th>
                                        <th className="py-3 px-4">Touchpoints (WA / Calls / Meets)</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border/60">
                                    {leaderboardData.map((rep) => (
                                        <tr key={rep.repId} className="hover:bg-muted/30 transition-colors">
                                            <td className="py-3.5 px-4 font-bold text-foreground">
                                                <div className="flex items-center gap-2.5">
                                                    <span className={`w-6 h-6 rounded-lg text-xs font-black flex items-center justify-center ${
                                                        rep.rank === 1 ? 'bg-amber-500 text-white' : rep.rank === 2 ? 'bg-zinc-400 text-white' : rep.rank === 3 ? 'bg-amber-800 text-white' : 'bg-muted text-muted-foreground'
                                                    }`}>
                                                        {rep.rank}
                                                    </span>
                                                    <div>
                                                        <div className="font-bold text-foreground">{rep.name}</div>
                                                        <div className="text-[10px] text-muted-foreground">{rep.role}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-3.5 px-4 font-mono font-black text-sm text-foreground">
                                                {formatINR(rep.wonValue)}
                                            </td>
                                            <td className="py-3.5 px-4 font-mono text-muted-foreground">
                                                {formatINR(rep.quota)}
                                            </td>
                                            <td className="py-3.5 px-4">
                                                <div className="w-28 space-y-1">
                                                    <div className="flex justify-between text-[10px] font-bold">
                                                        <span className="text-emerald-500">{rep.quotaAttainment}%</span>
                                                    </div>
                                                    <Progress value={Math.min(100, rep.quotaAttainment)} className="h-1.5" />
                                                </div>
                                            </td>
                                            <td className="py-3.5 px-4 font-semibold text-foreground">
                                                <span className="text-emerald-500 font-bold">{rep.wonCount} won</span> / <span className="text-muted-foreground">{rep.openCount} open</span>
                                            </td>
                                            <td className="py-3.5 px-4 font-bold text-emerald-500">
                                                {rep.winRate}%
                                            </td>
                                            <td className="py-3.5 px-4">
                                                <div className="flex items-center gap-1.5 text-[11px]">
                                                    <Badge variant="outline" className="text-[#25D366] border-[#25D366]/30 py-0 text-[10px]">
                                                        {rep.whatsappSent} WA
                                                    </Badge>
                                                    <Badge variant="outline" className="text-blue-500 border-blue-500/30 py-0 text-[10px]">
                                                        {rep.callsLogged} Calls
                                                    </Badge>
                                                    <Badge variant="outline" className="text-purple-500 border-purple-500/30 py-0 text-[10px]">
                                                        {rep.meetingsHeld} Meets
                                                    </Badge>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </TabsContent>

                {/* Tab 3: Deal Slippage Radar */}
                <TabsContent value="slippage" className="space-y-4 outline-none">
                    <div className="p-6 rounded-3xl bg-card border border-border/80 space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-border/60">
                            <div>
                                <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                                    <AlertTriangle className="w-4 h-4 text-rose-500" />
                                    <span>High-Value Deals at Risk of Slipping</span>
                                </h3>
                                <p className="text-xs text-muted-foreground">
                                    Opportunities requiring immediate executive touchpoint or follow-up before quarter-end.
                                </p>
                            </div>
                            <Badge className="bg-rose-500/10 text-rose-500 border-rose-500/20 text-xs font-bold">
                                {forecastData?.dealsAtRiskOfSlipping?.length || 0} Risk Alerts
                            </Badge>
                        </div>

                        {forecastData?.dealsAtRiskOfSlipping?.length === 0 ? (
                            <div className="p-12 text-center text-xs text-muted-foreground">
                                No critical deal slippage detected. All opportunities are progressing on schedule.
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                                {forecastData?.dealsAtRiskOfSlipping?.map((deal) => (
                                    <div
                                        key={deal.id}
                                        className="p-4 rounded-2xl bg-muted/20 border border-rose-500/30 space-y-3 relative overflow-hidden"
                                    >
                                        <div className="flex items-start justify-between gap-2">
                                            <div>
                                                <Badge className="bg-rose-500/10 text-rose-500 border-rose-500/20 text-[10px] font-bold mb-1">
                                                    {deal.riskFactor}
                                                </Badge>
                                                <h4 className="font-bold text-xs text-foreground">{deal.title}</h4>
                                                <p className="text-[11px] text-muted-foreground">{deal.client} • Assigned to <strong>{deal.owner}</strong></p>
                                            </div>

                                            <div className="text-right">
                                                <span className="text-sm font-black text-foreground font-mono">{formatINR(deal.value)}</span>
                                                <p className="text-[10px] text-muted-foreground">{deal.probability}% Win Probability</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between pt-2 border-t border-border/40 text-xs">
                                            <span className="text-muted-foreground text-[11px]">Current Stage: <strong>{deal.stageName}</strong></span>
                                            <Link href={`/workspace/${workspaceId}/crm/pipeline`}>
                                                <Button size="sm" variant="outline" className="h-7 text-[11px] gap-1 bg-background font-semibold">
                                                    <span>Open in Pipeline</span>
                                                    <ChevronRight className="w-3 h-3" />
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
