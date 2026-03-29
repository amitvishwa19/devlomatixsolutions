'use client';

import { useState } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import {
 Search,
 Filter,
 ChevronRight,
 MoreHorizontal,
 Star,
 Calendar,
 MessageSquare,
 User,
 ArrowRight,
 Briefcase
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

import useSWR from 'swr';
import axios from 'axios';

const fetcher = url => axios.get(url).then(res => res.data);

const STAGE_MAP = [
 { id: 'APPLIED', title: 'Applied', color: 'bg-blue-500' },
 { id: 'SCREENING', title: 'Screening', color: 'bg-amber-500' },
 { id: 'INTERVIEW', title: 'Interview', color: 'bg-indigo-500' },
 { id: 'OFFERED', title: 'Offered', color: 'bg-emerald-500' },
 { id: 'HIRED', title: 'Hired', color: 'bg-violet-500' }
];

export default function CandidatePipelinePage() {
 const { workspaceId } = useParams();
 const router = useRouter();
 const searchParams = useSearchParams();
 const jobId = searchParams.get('jobId');

 const { data: job } = useSWR(jobId ? `/api/workspace/${workspaceId}/ats/jobs/${jobId}` : null, fetcher);
 const { data: applications, mutate } = useSWR(`/api/workspace/${workspaceId}/ats/applications${jobId ? `?jobId=${jobId}` : ''}`, fetcher);

 const updateStage = async (applicationId, newStage) => {
 try {
 await axios.put(`/api/workspace/${workspaceId}/ats/applications`, { applicationId, stage: newStage });
 mutate();
 } catch (error) {
 console.error("Failed to update stage:", error);
 }
 };

 const getStageCandidates = (stageId) => {
 if (!applications) return [];
 return applications
 .filter(app => app.stage === stageId)
 .map(app => ({
 id: app.id,
 candidateId: app.candidateId,
 name: app.candidate.name,
 role: app.job.title,
 score: app.candidate.aiMatchScore ? (app.candidate.aiMatchScore / 20).toFixed(1) : "N/A",
 appliedAt: new Date(app.createdAt).toLocaleDateString()
 }));
 };

 return (
 <div className="flex flex-col h-[calc(100vh-4rem)] ">
 {/* Header */}
 <div className="p-8 pb-4 shrink-0 space-y-6">
 <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
 <div className="space-y-1">
 <div className="flex items-center gap-2 text-[10px] tracking-[0.2em] text-muted-foreground opacity-40">
 <span onClick={() => router.push(`/workspace/${workspaceId}/ats`)} className="hover:text-primary cursor-pointer transition-colors">ATS</span>
 <ChevronRight size={10} />
 <span onClick={() => router.push(`/workspace/${workspaceId}/ats/jobs`)} className="hover:text-primary cursor-pointer transition-colors">Jobs</span>
 <ChevronRight size={10} />
 <span className="text-primary/60">Pipeline</span>
 </div>
 <h1 className="text-3xl tracking-tighter flex items-center gap-3">
 {job?.title || "Recruitment Pipeline"}
 <Badge variant="outline" className="h-6 rounded-lg bg-primary/5 text-primary border-primary/20 text-[9px] px-3">
 {job?.status || "Active"} Job
 </Badge>
 </h1>
 </div>
 <div className="flex items-center gap-3">
 <div className="relative w-64">
 <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground opacity-40" />
 <Input
 placeholder="Search candidates..."
 className="pl-11 h-11 rounded-xl bg-card/40 backdrop-blur-xl border-border/40 text-sm font-medium"
 />
 </div>
 <Button variant="outline" className="h-11 rounded-xl px-4 font-bold border-border/40 bg-card/40 backdrop-blur-xl">
 <Filter className="w-4 h-4 mr-2 opacity-50" />
 Filters
 </Button>
 </div>
 </div>
 </div>

 {/* Kanban Board */}
 <div className="flex-1 overflow-x-auto p-8 pt-0 custom-scrollbar">
 <div className="inline-flex gap-6 h-full min-w-full">
 {STAGE_MAP.map((stage) => (
 <div key={stage.id} className="w-[320px] shrink-0 flex flex-col gap-4">
 {/* Stage Header */}
 <div className="flex items-center justify-between px-2">
 <div className="flex items-center gap-3">
 <div className={`w-3 h-3 rounded-full ${stage.color} shadow-lg shadow-black/20`} />
 <h3 className="text-sm opacity-60">
 {stage.title}
 </h3>
 <Badge variant="ghost" className="h-5 px-2 bg-muted/40 text-[10px] opacity-40 rounded-md">
 {getStageCandidates(stage.id).length}
 </Badge>
 </div>
 <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg opacity-40 hover:opacity-100">
 <MoreHorizontal size={16} />
 </Button>
 </div>

 {/* Stage Content */}
 <div className="flex-1 bg-muted/20 border border-border/10 rounded-lg p-4 space-y-4 overflow-y-auto scrollbar-hide">
 {getStageCandidates(stage.id).map((candidate, i) => (
 <motion.div
 key={candidate.id}
 layoutId={candidate.id}
 initial={{ opacity: 0, scale: 0.95 }}
 animate={{ opacity: 1, scale: 1 }}
 whileHover={{ y: -4 }}
 className="p-5 rounded-lg bg-card/60 backdrop-blur-xl border border-border/40 shadow-xl shadow-black/5 cursor-pointer group hover:border-primary/40 transition-all"
 onClick={() => router.push(`/workspace/${workspaceId}/ats/candidates/${candidate.candidateId}`)}
 >
 <div className="flex items-start justify-between mb-4">
 <div className="flex items-center gap-3">
 <Avatar className="h-10 w-10 border-2 border-primary/20 shadow-lg">
 <AvatarFallback className="bg-primary/10 text-primary text-xs ">
 {candidate.name.split(' ').map(n => n[0]).join('')}
 </AvatarFallback>
 </Avatar>
 <div>
 <h4 className="text-sm font-bold group-hover:text-primary transition-colors">{candidate.name}</h4>
 <p className="text-[10px] text-muted-foreground opacity-40">Applied {candidate.appliedAt}</p>
 </div>
 </div>
 <Dropdown candidate={candidate} />
 </div>

 <div className="flex items-center gap-4 mt-6">
 <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-amber-500/10 text-amber-500">
 <Star size={10} className="fill-current" />
 <span className="text-[10px]">{candidate.score}</span>
 </div>
 <div className="flex -space-x-2">
 {[1, 2].map((_, i) => (
 <div key={i} className="w-6 h-6 rounded-full border-2 border-background bg-muted flex items-center justify-center">
 <User size={10} />
 </div>
 ))}
 </div>
 </div>

 <div className="flex items-center justify-between mt-6 pt-4 border-t border-border/10">
 <div className="flex items-center gap-3 opacity-40">
 <MessageSquare size={14} />
 <Calendar size={14} />
 </div>
 <Button variant="ghost" size="sm" className="h-7 text-[9px] opacity-0 group-hover:opacity-100 transition-all">
 Profile <ArrowRight size={10} className="ml-1" />
 </Button>
 </div>
 </motion.div>
 ))}

 {getStageCandidates(stage.id).length === 0 && (
 <div className="h-32 border-2 border-dashed border-border/20 rounded-lg flex items-center justify-center">
 <p className="text-[10px] opacity-20 italic">No candidates</p>
 </div>
 )}
 </div>
 </div>
 ))}
 </div>
 </div>
 </div>
 );
}

function Dropdown({ candidate }) {
 return (
 <Button variant="ghost" size="icon" className="h-6 w-6 rounded-md opacity-20 hover:opacity-100" onClick={(e) => e.stopPropagation()}>
 <MoreHorizontal size={14} />
 </Button>
 );
}
