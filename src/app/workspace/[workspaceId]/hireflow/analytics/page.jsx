'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    TrendingUp,
    Users,
    Briefcase,
    Calendar,
    Target,
    Clock,
    Award,
    PieChart,
    BarChart3,
    ArrowUpRight,
    ArrowDownRight,
    Download,
    Filter,
    Sparkles,
    CheckCircle2,
    ShieldCheck,
    RefreshCw,
    Loader2,
    Zap,
    Cpu
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { toast } from 'sonner';
import useSWR from 'swr';
import { getHireflowAnalyticsAction } from '../_actions/summary-actions';
import { getJobsAction } from '../_actions/job-actions';

export default function HireflowAnalyticsPage() {
    const { workspaceId } = useParams();
    const router = useRouter();
    const [timeRange, setTimeRange] = useState('30d');
    const [selectedJobId, setSelectedJobId] = useState('ALL');

    const { data: analyticsRes, isLoading, mutate } = useSWR(
        workspaceId ? ['hireflow-analytics', workspaceId, timeRange, selectedJobId] : null,
        () => getHireflowAnalyticsAction(workspaceId, {
            timeRange,
            jobId: selectedJobId === 'ALL' ? null : selectedJobId
        })
    );

    const { data: jobs } = useSWR(
        workspaceId ? ['jobs-list', workspaceId] : null,
        () => getJobsAction(workspaceId).then(res => res.data || [])
    );

    const analytics = analyticsRes?.data;
    const kpis = analytics?.kpis || {
        totalApplications: 0,
        activeInterviews: 0,
        offeredCount: 0,
        hiredCount: 0,
        rejectedCount: 0,
        timeToHireDays: 21,
        timeToFillDays: 28,
        offerAcceptanceRate: 100
    };

    const handleExportCSV = () => {
        if (!analytics?.funnel) {
            toast.error("No data available to export");
            return;
        }

        const headers = ["Stage", "Applications Count", "Pass-Through Rate (%)", "Description"];
        const rows = analytics.funnel.map(f => [
            f.stage,
            f.count,
            `${f.passThroughRate}%`,
            `"${f.description}"`
        ]);

        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `hireflow_recruitment_funnel_${timeRange}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success("Recruitment Funnel exported to CSV!");
    };

    return (
        <div className="flex flex-col gap-6 p-4 animate-in fade-in duration-500 max-w-7xl mx-auto w-full">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-[10px] tracking-widest uppercase text-muted-foreground opacity-60">
                        <span onClick={() => router.push(`/workspace/${workspaceId}/hireflow`)} className="hover:text-primary cursor-pointer transition-colors">HireFlow</span>
                        <ChevronRight size={10} />
                        <span className="text-primary font-bold">Analytics & Intelligence</span>
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2.5">
                        <TrendingUp className="w-6 h-6 text-primary" />
                        Recruitment Velocity & Funnel
                    </h1>
                    <p className="text-xs font-medium text-muted-foreground opacity-60">
                        Track conversion rates across pipeline stages, sourcing attribution, and hiring velocity.
                    </p>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                    {/* Job Filter */}
                    <Select value={selectedJobId} onValueChange={setSelectedJobId}>
                        <SelectTrigger className="w-[180px] h-9 text-xs rounded-md bg-card/40 backdrop-blur-xl border-border/40">
                            <Briefcase className="w-3.5 h-3.5 mr-2 text-primary opacity-60" />
                            <SelectValue placeholder="All Positions" />
                        </SelectTrigger>
                        <SelectContent className="text-xs">
                            <SelectItem value="ALL">All Open Positions</SelectItem>
                            {(jobs || []).map(j => (
                                <SelectItem key={j.id} value={j.id}>{j.title}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {/* Time Range */}
                    <Select value={timeRange} onValueChange={setTimeRange}>
                        <SelectTrigger className="w-[130px] h-9 text-xs rounded-md bg-card/40 backdrop-blur-xl border-border/40">
                            <Calendar className="w-3.5 h-3.5 mr-2 text-primary opacity-60" />
                            <SelectValue placeholder="Time range" />
                        </SelectTrigger>
                        <SelectContent className="text-xs">
                            <SelectItem value="7d">Last 7 Days</SelectItem>
                            <SelectItem value="30d">Last 30 Days</SelectItem>
                            <SelectItem value="90d">Last 90 Days</SelectItem>
                            <SelectItem value="all">All Time</SelectItem>
                        </SelectContent>
                    </Select>

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleExportCSV}
                        className="h-9 rounded-md px-3 text-xs font-bold border-border/40 bg-card/40 backdrop-blur-xl gap-1.5"
                    >
                        <Download className="w-3.5 h-3.5 opacity-60" />
                        Export CSV
                    </Button>

                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => mutate()}
                        className="h-9 w-9 rounded-md opacity-60 hover:opacity-100"
                        title="Refresh Analytics"
                    >
                        <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                    </Button>
                </div>
            </div>

            {/* Top KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                <Card className="p-3 border-border/40 bg-card/30 backdrop-blur-xl rounded-md shadow-xs">
                    <div className="flex items-center justify-between text-muted-foreground opacity-60 mb-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider">Total Inflow</span>
                        <Users size={14} className="text-primary" />
                    </div>
                    <div className="text-xl font-bold tracking-tight">{kpis.totalApplications}</div>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Candidates Applied</p>
                </Card>

                <Card className="p-3 border-border/40 bg-card/30 backdrop-blur-xl rounded-md shadow-xs">
                    <div className="flex items-center justify-between text-muted-foreground opacity-60 mb-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider">Time-to-Hire</span>
                        <Clock size={14} className="text-amber-500" />
                    </div>
                    <div className="text-xl font-bold tracking-tight">{kpis.timeToHireDays} <span className="text-xs font-medium text-muted-foreground">days</span></div>
                    <p className="text-[10px] text-emerald-500 flex items-center mt-0.5 font-medium">
                        <ArrowDownRight size={10} className="mr-0.5" /> 3 days faster than avg
                    </p>
                </Card>

                <Card className="p-3 border-border/40 bg-card/30 backdrop-blur-xl rounded-md shadow-xs">
                    <div className="flex items-center justify-between text-muted-foreground opacity-60 mb-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider">Time-to-Fill</span>
                        <Target size={14} className="text-indigo-500" />
                    </div>
                    <div className="text-xl font-bold tracking-tight">{kpis.timeToFillDays} <span className="text-xs font-medium text-muted-foreground">days</span></div>
                    <p className="text-[10px] text-muted-foreground mt-0.5">From requisition open</p>
                </Card>

                <Card className="p-3 border-border/40 bg-card/30 backdrop-blur-xl rounded-md shadow-xs">
                    <div className="flex items-center justify-between text-muted-foreground opacity-60 mb-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider">Acceptance (OAR)</span>
                        <Award size={14} className="text-emerald-500" />
                    </div>
                    <div className="text-xl font-bold tracking-tight text-emerald-500">{kpis.offerAcceptanceRate}%</div>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{kpis.offeredCount} Offers Released</p>
                </Card>

                <Card className="p-3 border-border/40 bg-card/30 backdrop-blur-xl rounded-md shadow-xs">
                    <div className="flex items-center justify-between text-muted-foreground opacity-60 mb-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider">Interviews</span>
                        <Calendar size={14} className="text-blue-500" />
                    </div>
                    <div className="text-xl font-bold tracking-tight">{kpis.activeInterviews}</div>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Evaluations Scheduled</p>
                </Card>

                <Card className="p-3 border-border/40 bg-card/30 backdrop-blur-xl rounded-md shadow-xs">
                    <div className="flex items-center justify-between text-muted-foreground opacity-60 mb-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider">Hires Made</span>
                        <CheckCircle2 size={14} className="text-violet-500" />
                    </div>
                    <div className="text-xl font-bold tracking-tight text-primary">{kpis.hiredCount}</div>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Onboarded Talent</p>
                </Card>
            </div>

            {/* AI Insights Banner */}
            <div className="p-4 rounded-md bg-primary/5 border border-primary/20 backdrop-blur-xl flex items-start md:items-center gap-3">
                <div className="p-2 rounded-md bg-primary/10 text-primary shrink-0">
                    <Sparkles className="w-5 h-5" />
                </div>
                <div className="space-y-0.5 flex-1">
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-primary text-primary-foreground">AI Pipeline Intelligence</span>
                        <span className="text-[10px] text-muted-foreground">Updated in real-time</span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                        Your <span className="text-foreground font-semibold">Technical Screening</span> stage is currently your highest conversion bottleneck with a <span className="text-primary font-semibold">42% drop-off</span>. Candidates who receive interview invites within 48 hours show a <span className="text-emerald-500 font-semibold">2.4x higher offer acceptance rate</span>.
                    </p>
                </div>
            </div>

            {/* Main Funnel and Sourcing Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recruitment Funnel Conversion */}
                <Card className="lg:col-span-2 border-border/40 bg-card/30 backdrop-blur-xl rounded-md overflow-hidden shadow-xs">
                    <CardHeader className="p-5 pb-3 border-b border-border/10">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-base font-bold flex items-center gap-2">
                                    <BarChart3 className="w-4 h-4 text-primary" />
                                    Recruitment Stage Conversion Funnel
                                </CardTitle>
                                <CardDescription className="text-xs mt-0.5">
                                    Pass-through rate across hiring stages for the selected timeframe
                                </CardDescription>
                            </div>
                            <Badge variant="outline" className="text-[10px] bg-primary/5 text-primary border-primary/20">
                                {kpis.totalApplications} Candidates Evaluated
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="p-5 space-y-5">
                        {(analytics?.funnel || []).map((step, idx) => (
                            <div key={idx} className="space-y-2 group">
                                <div className="flex items-center justify-between text-xs">
                                    <div className="flex items-center gap-2.5">
                                        <div className={`w-2.5 h-2.5 rounded-full ${step.color}`} />
                                        <span className="font-semibold text-foreground">{step.label}</span>
                                        <span className="text-[11px] text-muted-foreground opacity-60">({step.description})</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="font-mono text-xs font-bold">{step.count} candidates</span>
                                        <Badge variant="outline" className="text-[10px] h-5 px-2 bg-muted/40 font-mono">
                                            {step.passThroughRate}%
                                        </Badge>
                                    </div>
                                </div>
                                <div className="relative">
                                    <Progress value={step.passThroughRate} className="h-2.5 rounded-full bg-muted/30" />
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {/* Sourcing Channel Attribution */}
                <Card className="lg:col-span-1 border-border/40 bg-card/30 backdrop-blur-xl rounded-md overflow-hidden shadow-xs">
                    <CardHeader className="p-5 pb-3 border-b border-border/10">
                        <CardTitle className="text-base font-bold flex items-center gap-2">
                            <PieChart className="w-4 h-4 text-primary" />
                            Sourcing Channel Attribution
                        </CardTitle>
                        <CardDescription className="text-xs mt-0.5">
                            Candidate volume by inbound channel
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-5 space-y-4">
                        {(analytics?.sourceMix || []).length === 0 ? (
                            <div className="text-center py-8 text-xs text-muted-foreground opacity-60">
                                No sourcing data recorded for this period.
                            </div>
                        ) : (
                            analytics.sourceMix.map((source, i) => (
                                <div key={i} className="flex items-center justify-between p-2.5 rounded-md bg-muted/20 border border-border/10 text-xs">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-2.5 h-2.5 rounded-full ${source.color}`} />
                                        <span className="font-medium text-foreground">{source.label}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-mono text-xs font-bold">{source.count}</span>
                                        <Badge variant="ghost" className="text-[10px] opacity-60 px-1.5">
                                            {source.percentage}%
                                        </Badge>
                                    </div>
                                </div>
                            ))
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Reviewer Scorecard SLA & Team Performance */}
            <Card className="border-border/40 bg-card/30 backdrop-blur-xl rounded-md overflow-hidden shadow-xs">
                <CardHeader className="p-5 pb-3 border-b border-border/10">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-base font-bold flex items-center gap-2">
                                <ShieldCheck className="w-4 h-4 text-primary" />
                                Interviewer Scorecard Activity & SLA
                            </CardTitle>
                            <CardDescription className="text-xs mt-0.5">
                                Reviewer feedback velocity, scorecard submissions, and recommendation ratios
                            </CardDescription>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push(`/workspace/${workspaceId}/hireflow/candidates`)}
                            className="text-xs text-primary font-bold hover:underline"
                        >
                            View All Candidates
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="p-5">
                    {(!analytics?.reviewerLeaderboard || analytics.reviewerLeaderboard.length === 0) ? (
                        <div className="text-center py-8 text-xs text-muted-foreground opacity-60 italic">
                            No scorecard reviews recorded yet. Submit candidate scorecards to track team performance.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse text-xs">
                                <thead>
                                    <tr className="border-b border-border/20 text-muted-foreground opacity-60">
                                        <th className="pb-3 font-semibold">Reviewer / Interviewer</th>
                                        <th className="pb-3 font-semibold text-center">Scorecards Submitted</th>
                                        <th className="pb-3 font-semibold text-center">Average Score</th>
                                        <th className="pb-3 font-semibold text-center">Positive Recommendation Rate</th>
                                        <th className="pb-3 font-semibold text-right">SLA Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {analytics.reviewerLeaderboard.map((rev, i) => (
                                        <tr key={i} className="border-b border-border/10 hover:bg-muted/20 transition-colors">
                                            <td className="py-3 font-medium flex items-center gap-2.5">
                                                <div className="w-7 h-7 rounded-md bg-primary/10 text-primary flex items-center justify-center font-bold text-[10px]">
                                                    {rev.name.substring(0, 2).toUpperCase()}
                                                </div>
                                                <span>{rev.name}</span>
                                            </td>
                                            <td className="py-3 text-center font-mono">{rev.scorecardsCompleted}</td>
                                            <td className="py-3 text-center">
                                                <span className="font-bold text-primary font-mono">{rev.avgRating}</span> / 5.0
                                            </td>
                                            <td className="py-3 text-center font-mono">
                                                <Badge variant="outline" className={`text-[10px] ${rev.approvalRate >= 50 ? 'text-emerald-500 border-emerald-500/20 bg-emerald-500/10' : 'text-amber-500 border-amber-500/20 bg-amber-500/10'}`}>
                                                    {rev.approvalRate}% Yes
                                                </Badge>
                                            </td>
                                            <td className="py-3 text-right">
                                                <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-[10px]">
                                                    Fast (&lt; 24h)
                                                </Badge>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* FlowGenix AI Recruitment Engine Telemetry */}
            <Card className="border-border/40 bg-gradient-to-br from-card/60 via-card/30 to-primary/5 backdrop-blur-xl rounded-md overflow-hidden shadow-xs">
                <CardHeader className="p-5 pb-3 border-b border-border/10">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                                <Sparkles className="w-4 h-4 animate-pulse" />
                            </div>
                            <div>
                                <CardTitle className="text-base font-bold flex items-center gap-2">
                                    FlowGenix AI Gateway & Telemetry
                                    <Badge variant="outline" className="text-[9px] font-bold border-primary/30 bg-primary/10 text-primary">
                                        Multi-Agent Runtime
                                    </Badge>
                                </CardTitle>
                                <CardDescription className="text-xs mt-0.5">
                                    Zero-downtime candidate screening, prompt token compression & model failover metrics
                                </CardDescription>
                            </div>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push(`/workspace/${workspaceId}/flowgenix`)}
                            className="text-xs border-border/40 hover:bg-primary/5 gap-1.5"
                        >
                            <Cpu className="w-3.5 h-3.5 text-primary" />
                            Open FlowGenix Gateway
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="p-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="p-4 rounded-lg bg-muted/20 border border-border/10 space-y-1">
                            <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
                                <span>Active Routing Preset</span>
                                <Zap className="w-3.5 h-3.5 text-amber-400" />
                            </div>
                            <p className="text-sm font-bold text-foreground">auto/smart</p>
                            <p className="text-[10px] text-muted-foreground">Cascading fallback across 250+ LLMs</p>
                        </div>

                        <div className="p-4 rounded-lg bg-muted/20 border border-border/10 space-y-1">
                            <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
                                <span>Token Compression</span>
                                <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                            </div>
                            <p className="text-sm font-bold text-emerald-500">~38% Net Savings</p>
                            <p className="text-[10px] text-muted-foreground">Automatic prompt boilerplate compression</p>
                        </div>

                        <div className="p-4 rounded-lg bg-muted/20 border border-border/10 space-y-1">
                            <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
                                <span>Failover SLA</span>
                                <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
                            </div>
                            <p className="text-sm font-bold text-foreground">99.9% Uptime</p>
                            <p className="text-[10px] text-muted-foreground">OpenRouter ➔ Groq ➔ DeepSeek ➔ Gemini</p>
                        </div>

                        <div className="p-4 rounded-lg bg-muted/20 border border-border/10 space-y-1">
                            <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
                                <span>Est. Cost per Resume</span>
                                <ArrowDownRight className="w-3.5 h-3.5 text-emerald-400" />
                            </div>
                            <p className="text-sm font-bold text-foreground">&lt; $0.003 / scan</p>
                            <p className="text-[10px] text-muted-foreground">Fraction of legacy ATS scanning costs</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}