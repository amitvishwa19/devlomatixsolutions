'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
    TrendingUp,
    DollarSign,
    Target,
    Users,
    Building2,
    Activity,
    Plus,
    ArrowUpRight,
    MessageCircle,
    Sparkles,
    CheckCircle2,
    Clock,
    XCircle,
    ChevronRight,
    Loader2
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getDealStatsAction, getDealsAction } from "./_actions/deal-actions";
import { getActivitiesAction } from "./_actions/activity-actions";
import { getPipelinesAction } from "./_actions/pipeline-actions";

export default function CrmDashboardPage() {
    const params = useParams();
    const workspaceId = params?.workspaceId;

    const [isLoading, setIsLoading] = useState(true);
    const [stats, setStats] = useState({
        totalDeals: 0,
        totalValue: 0,
        weightedValue: 0,
        openDealsCount: 0,
        wonDealsCount: 0,
        lostDealsCount: 0,
        wonValue: 0,
        winRate: 0
    });
    const [recentDeals, setRecentDeals] = useState([]);
    const [recentActivities, setRecentActivities] = useState([]);
    const [pipelines, setPipelines] = useState([]);

    useEffect(() => {
        if (!workspaceId) return;

        async function loadDashboardData() {
            setIsLoading(true);
            try {
                const [statsRes, dealsRes, activitiesRes, pipelinesRes] = await Promise.all([
                    getDealStatsAction(workspaceId),
                    getDealsAction(workspaceId),
                    getActivitiesAction(workspaceId, { limit: 8 }),
                    getPipelinesAction(workspaceId)
                ]);

                if (statsRes.success) setStats(statsRes.data);
                if (dealsRes.success) setRecentDeals(dealsRes.data.slice(0, 5));
                if (activitiesRes.success) setRecentActivities(activitiesRes.data);
                if (pipelinesRes.success) setPipelines(pipelinesRes.data);
            } catch (error) {
                console.error("Failed to load CRM dashboard:", error);
            } finally {
                setIsLoading(false);
            }
        }

        loadDashboardData();
    }, [workspaceId]);

    const formatCurrency = (val, currency = "INR") => {
        const symbol = currency === "USD" ? "$" : "₹";
        return `${symbol} ${Number(val || 0).toLocaleString('en-IN')}`;
    };

    const getActivityIcon = (type) => {
        switch (type) {
            case 'WHATSAPP_MSG':
                return <MessageCircle className="w-3.5 h-3.5 text-[#25D366]" />;
            case 'ATS_INTERVIEW':
                return <Sparkles className="w-3.5 h-3.5 text-indigo-500" />;
            case 'DEAL_STAGE_CHANGE':
                return <TrendingUp className="w-3.5 h-3.5 text-blue-500" />;
            default:
                return <Activity className="w-3.5 h-3.5 text-amber-500" />;
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <p className="text-xs text-muted-foreground font-medium">Aggregating CRM Telemetry & Pipelines...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-7xl mx-auto w-full">
            {/* Header Banner */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gradient-to-r from-blue-600/10 via-indigo-600/10 to-violet-600/10 border border-border/80 p-5 rounded-2xl">
                <div>
                    <h2 className="text-xl font-bold tracking-tight text-foreground">
                        CRM Executive Command Center
                    </h2>
                    <p className="text-xs text-muted-foreground mt-0.5">
                        Real-time revenue forecast, deal conversion velocity, and cross-channel interactions.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Link href={`/workspace/${workspaceId}/crm/pipeline`}>
                        <Button className="h-8 text-xs font-semibold gap-1.5 shadow-sm">
                            <span>Open Pipeline Board</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                        </Button>
                    </Link>
                </div>
            </div>

            {/* KPI Telemetry Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-card/70 backdrop-blur border-border shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-xs font-medium text-muted-foreground">Total Pipeline Value</CardTitle>
                        <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center">
                            <DollarSign className="w-4 h-4" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-foreground">
                            {formatCurrency(stats.totalValue)}
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1">
                            <span className="font-semibold text-foreground">{stats.totalDeals}</span> total deals tracked
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-card/70 backdrop-blur border-border shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-xs font-medium text-muted-foreground">Weighted Forecast</CardTitle>
                        <div className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                            <Target className="w-4 h-4" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                            {formatCurrency(stats.weightedValue)}
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-1">
                            Probability-adjusted pipeline revenue
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-card/70 backdrop-blur border-border shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-xs font-medium text-muted-foreground">Win Rate & Revenue</CardTitle>
                        <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                            <CheckCircle2 className="w-4 h-4" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                            {stats.winRate}%
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-1">
                            <span className="font-semibold text-emerald-600">{formatCurrency(stats.wonValue)}</span> won ({stats.wonDealsCount} deals)
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-card/70 backdrop-blur border-border shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-xs font-medium text-muted-foreground">Active Deals In Flight</CardTitle>
                        <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
                            <Clock className="w-4 h-4" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-foreground">
                            {stats.openDealsCount}
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-1">
                            {stats.lostDealsCount} closed lost deals
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Main Grid: Pipeline Summary & Live Activity Feed */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left (2 cols): High Value Deals & Pipeline Health */}
                <div className="lg:col-span-2 space-y-6">
                    <Card className="border-border bg-card/60 shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between pb-3">
                            <div>
                                <CardTitle className="text-sm font-semibold">Active Opportunities</CardTitle>
                                <p className="text-xs text-muted-foreground mt-0.5">Top deals currently progressing through the sales cycle</p>
                            </div>
                            <Link href={`/workspace/${workspaceId}/crm/pipeline`}>
                                <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 text-primary">
                                    View All <ChevronRight className="w-3.5 h-3.5" />
                                </Button>
                            </Link>
                        </CardHeader>
                        <CardContent>
                            {recentDeals.length === 0 ? (
                                <div className="text-center py-8 text-xs text-muted-foreground border border-dashed rounded-xl">
                                    No deals created yet. Click <strong>&quot;New Deal&quot;</strong> to start tracking revenue opportunities.
                                </div>
                            ) : (
                                <div className="divide-y divide-border/60">
                                    {recentDeals.map((deal) => (
                                        <div key={deal.id} className="py-3 flex items-center justify-between gap-4 hover:bg-muted/30 transition-colors px-2 rounded-lg">
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center gap-2">
                                                    <h4 className="text-xs font-semibold text-foreground truncate">{deal.title}</h4>
                                                    <Badge variant="outline" className="text-[9px] px-1.5 py-0 font-medium" style={{ borderColor: deal.stage?.color, color: deal.stage?.color }}>
                                                        {deal.stage?.name}
                                                    </Badge>
                                                </div>
                                                <div className="flex items-center gap-3 text-[11px] text-muted-foreground mt-1">
                                                    {deal.contact && (
                                                        <span className="flex items-center gap-1">
                                                            <Users className="w-3 h-3" /> {deal.contact.name}
                                                        </span>
                                                    )}
                                                    {deal.account && (
                                                        <span className="flex items-center gap-1">
                                                            <Building2 className="w-3 h-3" /> {deal.account.name}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="text-right shrink-0">
                                                <span className="text-xs font-bold text-foreground block">
                                                    {formatCurrency(deal.value, deal.currency)}
                                                </span>
                                                <span className="text-[10px] text-muted-foreground">
                                                    {deal.stage?.probability}% prob
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Ecosystem Bridge Quick Launch */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="p-4 rounded-xl border border-[#25D366]/20 bg-[#25D366]/5 flex items-start gap-3">
                            <div className="p-2 rounded-lg bg-[#25D366]/10 text-[#25D366] shrink-0">
                                <MessageCircle className="w-5 h-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="text-xs font-bold text-foreground">WhatsApp CRM Campaigns</h4>
                                <p className="text-[11px] text-muted-foreground mt-0.5">
                                    Trigger automated WhatsApp outreach directly from stage movements.
                                </p>
                                <Link href={`/workspace/${workspaceId}/konnectx/campaigns`} className="mt-2 inline-flex items-center text-[11px] font-semibold text-[#25D366] hover:underline">
                                    Launch WhatsApp Broadcast <ArrowUpRight className="w-3 h-3 ml-0.5" />
                                </Link>
                            </div>
                        </div>

                        <div className="p-4 rounded-xl border border-indigo-500/20 bg-indigo-500/5 flex items-start gap-3">
                            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-500 shrink-0">
                                <Sparkles className="w-5 h-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="text-xs font-bold text-foreground">Hireflow Placement Sync</h4>
                                <p className="text-[11px] text-muted-foreground mt-0.5">
                                    Convert successful job applicants into CRM placement billing deals.
                                </p>
                                <Link href={`/workspace/${workspaceId}/hireflow/candidates`} className="mt-2 inline-flex items-center text-[11px] font-semibold text-indigo-500 hover:underline">
                                    View Candidates <ArrowUpRight className="w-3 h-3 ml-0.5" />
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right (1 col): Live Activity Stream */}
                <div className="space-y-6">
                    <Card className="border-border bg-card/60 shadow-sm h-full flex flex-col">
                        <CardHeader className="flex flex-row items-center justify-between pb-3">
                            <div>
                                <CardTitle className="text-sm font-semibold">Live 360° Activity Stream</CardTitle>
                                <p className="text-xs text-muted-foreground mt-0.5">Real-time interactions across all channels</p>
                            </div>
                            <Link href={`/workspace/${workspaceId}/crm/activities`}>
                                <Button variant="ghost" size="sm" className="h-7 text-xs text-primary">
                                    View All
                                </Button>
                            </Link>
                        </CardHeader>
                        <CardContent className="flex-1">
                            {recentActivities.length === 0 ? (
                                <div className="text-center py-8 text-xs text-muted-foreground border border-dashed rounded-xl">
                                    No recent activity recorded.
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {recentActivities.map((act) => (
                                        <div key={act.id} className="flex items-start gap-3 text-xs">
                                            <div className="mt-0.5 p-1 rounded-md bg-muted/60 border border-border shrink-0">
                                                {getActivityIcon(act.type)}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="font-semibold text-foreground truncate">{act.title}</p>
                                                {act.description && (
                                                    <p className="text-[11px] text-muted-foreground line-clamp-2 mt-0.5">{act.description}</p>
                                                )}
                                                <span className="text-[9px] text-muted-foreground/70 block mt-1">
                                                    {new Date(act.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
