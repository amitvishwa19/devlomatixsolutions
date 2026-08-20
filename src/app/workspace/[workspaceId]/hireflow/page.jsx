'use client';

import { motion } from 'framer-motion';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import {
    Users,
    Briefcase,
    Calendar,
    ArrowUpRight,
    Search,
    Filter,
    Plus,
    CheckCircle2,
    Clock,
    TrendingUp,
    BarChart3,
    PieChart,
    Target,
    Award,
    Download,
    Sparkles,
    ShieldCheck,
    Globe
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { StatCards } from './_components/StatCards';
import { RecentApplicants } from './_components/RecentApplicants';
import { PipelineSummary } from './_components/PipelineSummary';
import { getHireflowSummaryAction } from './_actions/summary-actions';

import useSWR from 'swr';

export default function AtsDashboard() {
    const { workspaceId } = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    const activeTab = searchParams.get('tab') || 'overview';

    const { data: summary, isLoading } = useSWR(
        workspaceId ? ['hireflow-summary', workspaceId] : null,
        () => getHireflowSummaryAction(workspaceId).then(res => res.data)
    );

    const handleTabChange = (value) => {
        const params = new URLSearchParams(searchParams);
        params.set('tab', value);
        router.push(`/workspace/${workspaceId}/hireflow?${params.toString()}`);
    };

    return (
        <div className="flex flex-col gap-6 p-4 animate-in fade-in duration-700">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-xl font-bold">Recruitment Hub</h1>
                    <p className="text-xs font-medium text-muted-foreground opacity-60">
                        Manage your talent pipeline and job openings from one central dashboard.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="rounded-md px-6 font-bold border-border/40 bg-card/40 backdrop-blur-xl">
                        <Filter className="w-4 h-4 opacity-50" />
                        Filters
                    </Button>
                    <Button
                        onClick={() => router.push(`/workspace/${workspaceId}/hireflow/jobs`)}
                        className="rounded-md px-6 bg-primary shadow-lg shadow-primary/20"
                    >
                        <Plus className="w-4 h-4" />
                        Create Job
                    </Button>
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
                <TabsList className="bg-card/40 backdrop-blur-xl border border-border/40 p-1 h-11 rounded-md">
                    <TabsTrigger value="overview" className="rounded-md px-6 text-[10px] font-bold uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                        Overview
                    </TabsTrigger>
                    <TabsTrigger value="analytics" className="rounded-md px-6 text-[10px] font-bold uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                        Analytics
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6 animate-in fade-in duration-500">
                    {/* Metrics Overview */}
                    <StatCards stats={summary?.stats} />

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">


                        {/* Main Content: Pipeline Summary */}
                        <div className="lg:col-span-2 space-y-4   rounded-md overflow-hidden shadow-2xl shadow-black/5">
                            <PipelineSummary
                                stats={summary?.pipelineStats}
                                nextInterview={summary?.interviews?.[0]}
                            />

                            {/* Active Jobs Card - Quick Peek */}
                            <Card className="border bg-card/30 backdrop-blur-xl rounded-md overflow-hidden shadow-2xl shadow-black/5 hover:border-primary/40 animate-in fade-in duration-700">
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-xl">Focus Positions</CardTitle>
                                    <Button variant="ghost" size="sm" className="text-[10px] tracking-[0.2em] opacity-40 hover:opacity-100" onClick={() => router.push(`/workspace/${workspaceId}/hireflow/jobs`)}>
                                        View All Jobs <ArrowUpRight className="ml-2 w-3 h-3" />
                                    </Button>
                                </CardHeader>
                                <CardContent className='border'>
                                    <div className="space-y-4">
                                        {(summary?.focusJobs || []).map((job, i) => (
                                            <div key={i} className="flex items-center justify-between p-4 rounded-md bg-muted/20 border border-border/10 hover:border-primary/20 transition-all cursor-pointer group" onClick={() => router.push(`/workspace/${workspaceId}/hireflow/jobs`)}>
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                                        <Briefcase size={20} />
                                                    </div>
                                                    <div>
                                                        <h4 className="text-sm font-bold group-hover:text-primary transition-colors">{job.title}</h4>
                                                        <p className="text-[10px] font-bold text-muted-foreground opacity-60">{job.dept}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-6">
                                                    <div className="text-right">
                                                        <p className="text-xs">{job.applicants}</p>
                                                        <p className="text-[10px] font-medium text-muted-foreground">Applicants</p>
                                                    </div>
                                                    <Badge className={job.status === 'Urgent' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 'bg-primary/5 text-primary border-primary/20'}>
                                                        {job.status}
                                                    </Badge>
                                                </div>
                                            </div>
                                        ))}
                                        {(!summary?.focusJobs || summary.focusJobs.length === 0) && (
                                            <p className="text-center py-8 text-xs font-bold opacity-40 italic">No active jobs to display.</p>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Sidebar: Recent Applicants */}
                        <div className="lg:col-span-1 space-y-8">
                            <RecentApplicants applicants={summary?.recentApplicants} />

                            {/* Interview Schedule - Quick Peek */}
                            <Card className="border bg-card/30 backdrop-blur-xl rounded-md shadow-2xl shadow-black/5 hover:border-primary/40 animate-in fade-in duration-700">
                                <CardHeader>
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <Calendar className="w-5 h-5 text-primary" />
                                        Today's Interviews
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {(summary?.interviews || []).map((int, i) => (
                                            <div key={i} className="flex gap-4 p-4 rounded-md bg-primary/5 border border-primary/10">
                                                <div className="flex flex-col items-center justify-center min-w-[60px] border-r border-primary/20 pr-4">
                                                    <span className="text-xs text-primary">{int.time.split('')[0]}</span>
                                                    <span className="text-[10px] font-bold opacity-60">{int.time.split('')[1]}</span>
                                                </div>
                                                <div>
                                                    <h4 className="text-xs font-bold">{int.name}</h4>
                                                    <p className="text-xs font-medium text-muted-foreground">{int.role} Interview</p>
                                                </div>
                                            </div>
                                        ))}
                                        {(!summary?.interviews || summary.interviews.length === 0) && (
                                            <p className="text-center py-4 text-[10px] font-bold opacity-40 italic">No interviews scheduled today.</p>
                                        )}
                                    </div>
                                    <Button variant="ghost" className="w-full mt-6 text-[10px] tracking-[0.2em] opacity-40 hover:opacity-100">
                                        View Full Schedule
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="analytics" className="space-y-6 animate-in fade-in duration-500">
                    <div className="flex items-center justify-between mb-2 px-2">
                        <div className="flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-primary" />
                            <h2 className="text-lg font-bold">Performance Analytics</h2>
                        </div>
                        <div className="flex items-center gap-3">
                            <Button variant="ghost" size="sm" className="text-[10px] font-bold tracking-widest uppercase opacity-60 hover:opacity-100">
                                <Calendar className="w-4 h-4 mr-2" />
                                Last 30 Days
                            </Button>
                            <Button variant="outline" size="sm" className="h-9 rounded-md px-4 text-[10px] font-bold border-border/40">
                                <Download className="w-4 h-4 mr-2" />
                                Export
                            </Button>
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {(summary?.analyticsStats || []).map((stat, i) => {
                            const IconCmp = {
                                'Clock': Clock,
                                'Target': Target,
                                'BarChart3': BarChart3,
                                'Users': Users
                            }[stat.icon] || Clock;

                            return (
                                <Card key={i} className="border-border/40 bg-card/30 backdrop-blur-xl rounded-md overflow-hidden shadow-2xl shadow-black/5 group hover:border-primary/20 transition-all">
                                    <CardContent className="p-8 space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div className={`w-12 h-12 rounded-md bg-muted/60 flex items-center justify-center ${stat.color} group-hover:scale-110 transition-transform`}>
                                                <IconCmp size={22} />
                                            </div>
                                            <div className={`flex items-center gap-1 text-[10px] ${stat.trendStatus === 'up' ? 'text-emerald-500' : 'text-muted-foreground'}`}>
                                                {stat.trendStatus === 'up' ? <ArrowUpRight size={12} /> : <div className="w-1.5 h-1.5 rounded-full bg-border" />}
                                            {stat.trend}
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="text-xl tracking-tighter">{stat.value}</h3>
                                        <p className="text-[10px] text-muted-foreground opacity-40">{stat.label}</p>
                                    </div>
                                </CardContent>
                            </Card>
                            );
                        })}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Hiring Funnel */}
                        <Card className="lg:col-span-2 border-border/40 bg-card/30 backdrop-blur-xl rounded-md overflow-hidden shadow-2xl shadow-black/5">
                            <CardHeader className="p-8 pb-4">
                                <CardTitle className="text-xl flex items-center gap-2">
                                    <TrendingUp className="w-5 h-5 text-primary" />
                                    Hiring Funnel Velocity
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-8 pt-4 space-y-8">
                                <div className="space-y-6">
                                    {(summary?.pipelineStats || []).map((stage, i) => (
                                        <div key={i} className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <span className="text-xs w-4 text-muted-foreground/40">{i + 1}</span>
                                                    <span className="text-xs font-bold">{stage.label}</span>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <span className="text-xs text-primary">{stage.count} <span className="text-muted-foreground opacity-40">Candidates</span></span>
                                                    <Badge variant="outline" className="text-[9px] border-border/40 opacity-40">{stage.percentage}%</Badge>
                                                </div>
                                            </div>
                                            <Progress value={stage.percentage} className="h-3 rounded-full bg-muted/30" />
                                        </div>
                                    ))}
                                </div>
                                <div className="p-6 rounded-md bg-primary/5 border border-primary/10 flex items-center gap-4">
                                    <Sparkles className="text-primary shrink-0" />
                                    <p className="text-xs font-medium text-muted-foreground leading-relaxed">
                                        <span className="text-primary mr-2 text-[10px]">AI insight</span>
                                        Your technical screening stage has a bottleneck. average time spent is <span className="font-bold text-foreground">5.2 days</span>, which is 30% higher than industry average.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Source Quality */}
                        <Card className="lg:col-span-1 border-border/40 bg-card/30 backdrop-blur-xl rounded-md overflow-hidden shadow-2xl shadow-black/5">
                            <CardHeader className="p-8 pb-4">
                                <CardTitle className="text-xl flex items-center gap-2">
                                    <PieChart className="w-5 h-5 text-primary" />
                                    Sourcing Mix
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-8 pt-4 space-y-8">
                                <div className="aspect-square rounded-full border-[20px] border-muted/20 relative flex items-center justify-center overflow-hidden group mx-auto max-w-[240px]">
                                    <div className="text-center">
                                        <h4 className="text-4xl tracking-tighter">{summary?.sourceMix?.[0]?.value || "100%"}</h4>
                                        <p className="text-[10px] text-muted-foreground opacity-40">{summary?.sourceMix?.[0]?.label || "Direct Applied"}</p>
                                    </div>
                                    <div className="absolute inset-0 border-[20px] border-primary border-t-transparent border-l-transparent rotate-45 opacity-60 group-hover:rotate-90 transition-transform duration-1000" />
                                    <div className="absolute inset-4 border-[10px] border-emerald-500 border-b-transparent border-r-transparent -rotate-12 opacity-40 group-hover:-rotate-45 transition-transform duration-1000" />
                                </div>
                                <div className="space-y-4 pt-4">
                                    {(summary?.sourceMix || []).map((source, i) => (
                                        <div key={i} className="flex items-center justify-between text-xs">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-2 h-2 rounded-full ${source.color.split(' ')[0]}`} />
                                                <span className="font-bold">{source.label}</span>
                                            </div>
                                            <span className="opacity-40">{source.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Diversity & Inclusion */}
                        <Card className="border-border/40 bg-card/30 backdrop-blur-xl rounded-md overflow-hidden shadow-2xl shadow-black/5 relative">
                            <div className="absolute top-2 right-4 z-10 flex items-center shrink-0">
                                <Badge className="text-[8px] bg-primary/20 text-primary uppercase p-1">Demo Widget</Badge>
                            </div>
                            <CardHeader className="p-8 pb-4">
                                <CardTitle className="text-xl flex items-center gap-2">
                                    <ShieldCheck className="w-5 h-5 text-primary" />
                                    Diversity & Inclusion
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-8 space-y-8">
                                <div className="grid grid-cols-2 gap-8">
                                    <div className="space-y-4">
                                        <p className="text-[10px] text-muted-foreground opacity-40 uppercase tracking-widest font-black">Gender Dist.</p>
                                        <div className="space-y-3">
                                            {[
                                                { label: "Male", value: 58, color: "bg-blue-500" },
                                                { label: "Female", value: 38, color: "bg-rose-500" },
                                                { label: "Non-binary", value: 4, color: "bg-amber-500" }
                                            ].map((item, i) => (
                                                <div key={i} className="space-y-1">
                                                    <div className="flex justify-between text-[10px] font-bold">
                                                        <span>{item.label}</span>
                                                        <span>{item.value}%</span>
                                                    </div>
                                                    <Progress value={item.value} className={`h-1.5 ${item.color}/10`} />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <p className="text-[10px] text-muted-foreground opacity-40 uppercase tracking-widest font-black">Ethnicity Mix</p>
                                        <div className="space-y-3">
                                            {[
                                                { label: "Asian", value: 65, color: "bg-emerald-500" },
                                                { label: "White", value: 20, color: "bg-slate-500" },
                                                { label: "Other", value: 15, color: "bg-purple-500" }
                                            ].map((item, i) => (
                                                <div key={i} className="space-y-1">
                                                    <div className="flex justify-between text-[10px] font-bold">
                                                        <span>{item.label}</span>
                                                        <span>{item.value}%</span>
                                                    </div>
                                                    <Progress value={item.value} className={`h-1.5 ${item.color}/10`} />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <div className="p-6 rounded-md bg-emerald-500/5 border border-emerald-500/10 flex items-center gap-4">
                                    <Globe className="text-emerald-500 shrink-0" />
                                    <p className="text-xs font-medium text-muted-foreground leading-relaxed italic">
                                        "Your recruitment funnel shows healthy diversity growth in technical roles (+12% YoY). Recommend increasing referral rewards for underrepresented groups."
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Team Performance */}
                        <Card className="border-border/40 bg-card/30 backdrop-blur-xl rounded-md overflow-hidden shadow-2xl shadow-black/5">
                            <CardHeader className="p-8 pb-4">
                                <CardTitle className="text-xl flex items-center gap-2">
                                    <Award className="w-5 h-5 text-primary" />
                                    Hiring Team Impact
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="overflow-hidden">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="border-b border-border/10 bg-muted/10">
                                                <th className="px-8 py-4 text-[10px] opacity-40 uppercase tracking-widest font-black">Interviewer</th>
                                                <th className="px-8 py-4 text-[10px] opacity-40 uppercase tracking-widest font-black">Interviews</th>
                                                <th className="px-8 py-4 text-[10px] opacity-40 uppercase tracking-widest font-black">Avg Score</th>
                                                <th className="px-8 py-4 text-[10px] opacity-40 uppercase tracking-widest font-black">Accept Rate</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border/10">
                                            {(summary?.teamPerformance || []).map((teammate, i) => (
                                                <tr key={i} className="hover:bg-primary/5 transition-colors cursor-default">
                                                    <td className="px-8 py-5 flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center text-primary text-[10px] font-bold">
                                                            {teammate.name.split('').map(n => n[0]).join('').substring(0,2)}
                                                        </div>
                                                        <span className="text-xs font-bold">{teammate.name}</span>
                                                    </td>
                                                    <td className="px-8 py-5 text-sm font-bold opacity-60">{teammate.count}</td>
                                                    <td className="px-8 py-5 text-sm text-primary font-bold">{teammate.score}</td>
                                                    <td className="px-8 py-5 text-[10px] font-bold opacity-40">{teammate.rate}</td>
                                                </tr>
                                            ))}
                                            {(!summary?.teamPerformance || summary.teamPerformance.length === 0) && (
                                                <tr>
                                                    <td colSpan="4" className="text-center py-6 text-xs text-muted-foreground italic">No scorecards submitted yet.</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid grid-cols-1 gap-8">
                        {/* Job Openings Focus */}
                        <Card className="border-border/40 bg-card/30 backdrop-blur-xl rounded-md overflow-hidden shadow-2xl shadow-black/5">
                            <CardHeader className="p-8 pb-4">
                                <CardTitle className="text-xl flex items-center gap-2">
                                    <Briefcase className="w-5 h-5 text-primary" />
                                    Position Health & Velocity
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-8 pt-4">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                    {(summary?.positionsHealth || []).map((job, i) => (
                                        <div key={i} className="p-6 rounded-md bg-muted/20 border border-border/10 group cursor-default hover:border-primary/20 transition-all flex flex-col justify-between">
                                            <div className="flex items-center justify-between mb-4">
                                                <h4 className="text-sm font-bold tracking-tight group-hover:text-primary transition-colors">{job.role}</h4>
                                                <Badge variant="outline" className={`text-[9px] border-border/40 ${job.velocity === 'Slow' ? 'text-amber-500 bg-amber-500/10 border-amber-500/20' : ''}`}>
                                                    {job.velocity}
                                                </Badge>
                                            </div>
                                            <div className="space-y-4">
                                                <div className="space-y-2">
                                                    <div className="flex justify-between text-[9px] font-bold opacity-40">
                                                        <span>PIPELINE HEALTH</span>
                                                        <span>{job.health}%</span>
                                                    </div>
                                                    <Progress value={job.health} className={`h-1.5 ${job.health < 50 ? 'bg-amber-500/10' : 'bg-primary/10'}`} />
                                                </div>
                                                <div className="flex items-center justify-between pt-2">
                                                    <p className="text-[10px] font-black opacity-40 uppercase tracking-widest">{job.candidates} Applicants</p>
                                                    <Button variant="ghost" className="h-6 text-[9px] p-0 font-bold uppercase tracking-widest hover:text-primary" onClick={() => router.push(`/workspace/${workspaceId}/hireflow/jobs`)}>Details <ArrowUpRight className="ml-1 w-3 h-3" /></Button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {(!summary?.positionsHealth || summary.positionsHealth.length === 0) && (
                                        <p className="col-span-3 text-center py-6 text-xs text-muted-foreground italic">No open jobs to analyze.</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}