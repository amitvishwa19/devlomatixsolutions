'use client';

import { motion } from 'framer-motion';
import { useParams, useRouter } from 'next/navigation';
import {
    Users,
    Briefcase,
    Calendar,
    ArrowUpRight,
    MoreHorizontal,
    Search,
    Filter,
    Plus,
    UserPlus,
    CheckCircle2,
    Clock,
    TrendingUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatCards } from './_components/StatCards';
import { RecentApplicants } from './_components/RecentApplicants';
import { PipelineSummary } from './_components/PipelineSummary';

import useSWR from 'swr';
import axios from 'axios';

const fetcher = url => axios.get(url).then(res => res.data);

export default function AtsDashboard() {
    const { workspaceId } = useParams();
    const router = useRouter();

    const { data: summary, isLoading } = useSWR(`/api/workspace/${workspaceId}/ats/summary`, fetcher);

    return (
        <div className="flex flex-col gap-4 p-4 animate-in fade-in duration-700">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-xl font-bold">Recruitment Hub</h1>
                    <p className="text-sm font-medium text-muted-foreground opacity-60">
                        Manage your talent pipeline and job openings from one central dashboard.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="h-10 rounded-md px-6 font-bold border-border/40 bg-card/40 backdrop-blur-xl">
                        <Filter className="w-4 h-4 mr-2 opacity-50" />
                        Filters
                    </Button>
                    <Button
                        onClick={() => router.push(`/workspace/${workspaceId}/ats/jobs/create`)}
                        className="h-10 rounded-md px-6 font-black uppercase tracking-widest text-[10px] bg-primary shadow-lg shadow-primary/20"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Create Job
                    </Button>
                </div>
            </div>

            {/* Metrics Overview */}
            <StatCards stats={summary?.stats} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content: Pipeline Summary */}
                <div className="lg:col-span-2 space-y-8">
                    <PipelineSummary 
                        stats={summary?.pipelineStats} 
                        nextInterview={summary?.interviews?.[0]} 
                    />

                    {/* Active Jobs Card - Quick Peek */}
                    <Card className="border-border/40 bg-card/30 backdrop-blur-xl rounded-lg overflow-hidden shadow-2xl shadow-black/5">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-xl font-black tracking-tight">Focus Positions</CardTitle>
                            <Button variant="ghost" size="sm" className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 hover:opacity-100">
                                View All Jobs <ArrowUpRight className="ml-2 w-3 h-3" />
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {(summary?.focusJobs || []).map((job, i) => (
                                    <div key={i} className="flex items-center justify-between p-4 rounded-lg bg-muted/20 border border-border/10 hover:border-primary/20 transition-all cursor-pointer group" onClick={() => router.push(`/workspace/${workspaceId}/ats/jobs`)}>
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                                <Briefcase size={20} />
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-bold group-hover:text-primary transition-colors">{job.title}</h4>
                                                <p className="text-[10px] font-bold text-muted-foreground opacity-60 uppercase tracking-widest">{job.dept}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-6">
                                            <div className="text-right">
                                                <p className="text-xs font-black">{job.applicants}</p>
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
                    <Card className="border-border/40 bg-card/30 backdrop-blur-xl rounded-lg shadow-2xl shadow-black/5">
                        <CardHeader>
                            <CardTitle className="text-lg font-black tracking-tight flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-primary" />
                                Today's Interviews
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {(summary?.interviews || []).map((int, i) => (
                                    <div key={i} className="flex gap-4 p-4 rounded-lg bg-primary/5 border border-primary/10">
                                        <div className="flex flex-col items-center justify-center min-w-[60px] border-r border-primary/20 pr-4">
                                            <span className="text-xs font-black text-primary">{int.time.split(' ')[0]}</span>
                                            <span className="text-[10px] font-bold uppercase opacity-60">{int.time.split(' ')[1]}</span>
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold">{int.name}</h4>
                                            <p className="text-xs font-medium text-muted-foreground">{int.role} Interview</p>
                                        </div>
                                    </div>
                                ))}
                                {(!summary?.interviews || summary.interviews.length === 0) && (
                                    <p className="text-center py-4 text-[10px] font-bold opacity-40 italic">No interviews scheduled today.</p>
                                )}
                            </div>
                            <Button variant="ghost" className="w-full mt-6 text-[10px] font-black uppercase tracking-[0.2em] opacity-40 hover:opacity-100">
                                View Full Schedule
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
