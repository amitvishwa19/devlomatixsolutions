'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
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
    Briefcase,
    GripVertical
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { CandidateDetailsModal } from '../_components/CandidateDetailsModal';
import { getJobByIdAction } from '../_actions/job-actions';
import { getApplicationsAction, updateApplicationStageAction } from '../_actions/pipeline-actions';
import { toast } from 'sonner';

import useSWR from 'swr';

const STAGE_MAP = [
    { id: 'APPLIED', title: 'Applied', color: 'bg-blue-500', accent: 'border-blue-500/30' },
    { id: 'SCREENING', title: 'Screening', color: 'bg-amber-500', accent: 'border-amber-500/30' },
    { id: 'INTERVIEW', title: 'Interview', color: 'bg-indigo-500', accent: 'border-indigo-500/30' },
    { id: 'OFFERED', title: 'Offered', color: 'bg-emerald-500', accent: 'border-emerald-500/30' },
    { id: 'HIRED', title: 'Hired', color: 'bg-violet-500', accent: 'border-violet-500/30' }
];

export default function CandidatePipelinePage() {
    const { workspaceId } = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    const jobId = searchParams.get('jobId');

    // SSR guard — @hello-pangea/dnd needs the DOM to exist before rendering
    const [isMounted, setIsMounted] = useState(false);
    useEffect(() => { setIsMounted(true); }, []);

    const { data: job } = useSWR(
        jobId && workspaceId ? ['job', workspaceId, jobId] : null,
        () => getJobByIdAction(workspaceId, jobId).then(res => res.data)
    );
    const { data: applications, mutate } = useSWR(
        workspaceId ? ['applications', workspaceId, jobId] : null,
        () => getApplicationsAction(workspaceId, jobId).then(res => res.data)
    );

    // Local optimistic state for instant drag feedback
    const [localApps, setLocalApps] = useState([]);
    const [selectedCandidateId, setSelectedCandidateId] = useState(null);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

    // Sync SWR data into local state
    useEffect(() => {
        if (applications) {
            setLocalApps(applications);
        }
    }, [applications]);

    const getStageCandidates = useCallback((stageId) => {
        return localApps
            .filter(app => app.stage === stageId)
            .map(app => ({
                id: app.id,
                candidateId: app.candidateId,
                name: app.candidate?.name || 'Unknown',
                role: app.job?.title || 'Position',
                score: app.candidate?.aiMatchScore ? (app.candidate.aiMatchScore / 20).toFixed(1) : "N/A",
                appliedAt: new Date(app.appliedAt).toLocaleDateString()
            }));
    }, [localApps]);

    const onDragEnd = useCallback(async (result) => {
        const { source, destination, draggableId } = result;

        // Dropped outside any droppable
        if (!destination) return;

        // Dropped in the same place
        if (source.droppableId === destination.droppableId && source.index === destination.index) return;

        const newStage = destination.droppableId;
        const oldStage = source.droppableId;

        // Optimistic update: instantly move the card in local state
        setLocalApps(prev => prev.map(app =>
            app.id === draggableId ? { ...app, stage: newStage } : app
        ));

        // If stage actually changed, persist to backend
        if (oldStage !== newStage) {
            const stageLabel = STAGE_MAP.find(s => s.id === newStage)?.title || newStage;
            toast.success(`Moved to ${stageLabel}`, { duration: 2000 });

            try {
                const res = await updateApplicationStageAction(workspaceId, draggableId, newStage);
                if (!res.success) throw new Error(res.error);
                mutate();
            } catch (error) {
                console.error("Failed to update stage:", error);
                toast.error("Failed to update stage. Reverting...");
                setLocalApps(prev => prev.map(app =>
                    app.id === draggableId ? { ...app, stage: oldStage } : app
                ));
            }
        }
    }, [workspaceId, mutate]);

    return (
        <div className="flex flex-col flex-1 overflow-hidden">
            {/* Header */}
            <div className="p-4  shrink-0 space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-[10px] tracking-[0.2em] text-muted-foreground opacity-40">
                            <span onClick={() => router.push(`/workspace/${workspaceId}/hireflow`)} className="hover:text-primary cursor-pointer transition-colors">Hireflow</span>
                            <ChevronRight size={10} />
                            <span onClick={() => router.push(`/workspace/${workspaceId}/hireflow/jobs`)} className="hover:text-primary cursor-pointer transition-colors">Jobs</span>
                            <ChevronRight size={10} />
                            <span className="text-primary/60">Pipeline</span>
                        </div>
                        <h1 className="text-xl tracking-tighter flex items-center gap-3">
                            {job?.title || "Recruitment Pipeline"}
                            <Badge variant="outline" className="h-6 rounded-md bg-primary/5 text-primary border-primary/20 text-[9px] px-3">
                                {job?.status || "Active"} Job
                            </Badge>
                        </h1>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="relative w-64">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground opacity-40" />
                            <Input
                                placeholder="Search candidates..."
                                className="pl-11 h-11 rounded-md bg-card/40 backdrop-blur-xl border-border/40 text-sm font-medium"
                            />
                        </div>
                        <Button variant="outline" className="h-11 rounded-md px-4 font-bold border-border/40 bg-card/40 backdrop-blur-xl">
                            <Filter className="w-4 h-4 mr-2 opacity-50" />
                            Filters
                        </Button>
                    </div>
                </div>
            </div>

            {/* Kanban Board with ScrollArea */}
            {isMounted ? (
                <DragDropContext onDragEnd={onDragEnd}>
                    <ScrollArea className="flex-1 min-h-0 w-full overflow-hidden p-4">
                        <div className="flex gap-6 h-full min-w-max pb-4">
                            {STAGE_MAP.map((stage) => {
                                const candidates = getStageCandidates(stage.id);
                                return (
                                    <div key={stage.id} className="w-[320px] shrink-0 flex flex-col gap-4">
                                        {/* Stage Header */}
                                        <div className="flex items-center justify-between px-2 shrink-0">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-3 h-3 rounded-full ${stage.color} shadow-lg shadow-black/20`} />
                                                <h3 className="text-sm opacity-60">
                                                    {stage.title}
                                                </h3>
                                                <Badge variant="ghost" className="h-5 px-2 bg-muted/40 text-[10px] opacity-40 rounded-md">
                                                    {candidates.length}
                                                </Badge>
                                            </div>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-md opacity-40 hover:opacity-100">
                                                <MoreHorizontal size={16} />
                                            </Button>
                                        </div>

                                        {/* Droppable Column with vertical ScrollArea */}
                                        <ScrollArea className="h-[74vh] rounded-md border  bg-muted/20">
                                            <Droppable droppableId={stage.id}>
                                                {(provided, snapshot) => (
                                                    <div
                                                        ref={provided.innerRef}
                                                        {...provided.droppableProps}
                                                        className={`p-3 space-y-3 min-h-[220px] transition-all duration-300 ${snapshot.isDraggingOver
                                                            ? `bg-muted/40 border-2 border-dashed ${stage.accent} rounded-md`
                                                            : ''
                                                            }`}
                                                    >
                                                        {candidates.map((candidate, i) => (
                                                            <Draggable
                                                                key={candidate.id}
                                                                draggableId={candidate.id}
                                                                index={i}
                                                            >
                                                                {(dragProvided, dragSnapshot) => (
                                                                    <div
                                                                        ref={dragProvided.innerRef}
                                                                        {...dragProvided.draggableProps}
                                                                        {...dragProvided.dragHandleProps}
                                                                        className={`p-5 rounded-md bg-card/60 backdrop-blur-xl border border-border/40 shadow-xl shadow-black/5 cursor-grab group hover:border-primary/40 transition-all select-none ${dragSnapshot.isDragging
                                                                            ? 'shadow-2xl shadow-primary/20 border-primary/40 scale-[1.03] rotate-1 ring-2 ring-primary/20'
                                                                            : ''
                                                                            }`}
                                                                    >
                                                                        <div className="flex items-start justify-between mb-4">
                                                                            <div className="flex items-center gap-3">
                                                                                <Avatar className="w-10 border-2 border-primary/20 shadow-lg">
                                                                                    <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                                                                        {candidate.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                                                                                    </AvatarFallback>
                                                                                </Avatar>
                                                                                <div>
                                                                                    <h4
                                                                                        className="text-sm font-bold group-hover:text-primary transition-colors cursor-pointer"
                                                                                        onClick={(e) => {
                                                                                            e.stopPropagation();
                                                                                            setSelectedCandidateId(candidate.candidateId);
                                                                                            setIsDetailsModalOpen(true);
                                                                                        }}
                                                                                    >
                                                                                        {candidate.name}
                                                                                    </h4>
                                                                                    <p className="text-[10px] text-muted-foreground opacity-40">Applied {candidate.appliedAt}</p>
                                                                                </div>
                                                                            </div>
                                                                            <CandidateDropdown candidate={candidate} />
                                                                        </div>

                                                                        <div className="flex items-center gap-4 mt-6">
                                                                            <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-amber-500/10 text-amber-500">
                                                                                <Star size={10} className="fill-current" />
                                                                                <span className="text-[10px]">{candidate.score}</span>
                                                                            </div>
                                                                            <Badge variant="outline" className="text-[9px] border-border/30 opacity-40">
                                                                                {candidate.role}
                                                                            </Badge>
                                                                        </div>

                                                                        <div className="flex items-center justify-between mt-6 pt-4 border-t border-border/10">
                                                                            <div className="flex items-center gap-3 opacity-40">
                                                                                <MessageSquare size={14} />
                                                                                <Calendar size={14} />
                                                                            </div>
                                                                            <Button
                                                                                variant="ghost"
                                                                                size="sm"
                                                                                className="h-7 text-[9px] opacity-0 group-hover:opacity-100 transition-all"
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    setSelectedCandidateId(candidate.candidateId);
                                                                                    setIsDetailsModalOpen(true);
                                                                                }}
                                                                            >
                                                                                Profile <ArrowRight size={10} className="ml-1" />
                                                                            </Button>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </Draggable>
                                                        ))}

                                                        {provided.placeholder}

                                                        {candidates.length === 0 && !snapshot.isDraggingOver && (
                                                            <div className="h-32 border-2 border-dashed border-border/20 rounded-md flex items-center justify-center">
                                                                <p className="text-[10px] opacity-20 italic">Drop candidates here</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </Droppable>
                                            <ScrollBar orientation="vertical" />
                                        </ScrollArea>
                                    </div>
                                );
                            })}
                        </div>
                        <ScrollBar orientation="horizontal" className="bg-muted/40" />
                    </ScrollArea>
                </DragDropContext>
            ) : (
                <div className="flex-1 flex items-center justify-center">
                    <p className="text-xs text-muted-foreground opacity-40">Loading pipeline...</p>
                </div>
            )}

            {/* Candidate Details Drawer Modal */}
            <CandidateDetailsModal
                isOpen={isDetailsModalOpen}
                onClose={() => {
                    setIsDetailsModalOpen(false);
                    setSelectedCandidateId(null);
                }}
                candidateId={selectedCandidateId}
                workspaceId={workspaceId}
                onDeleteSuccess={() => {
                    setIsDetailsModalOpen(false);
                    setSelectedCandidateId(null);
                    mutate();
                }}
            />
        </div>
    );
}

function CandidateDropdown({ candidate }) {
    return (
        <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 rounded-md opacity-20 hover:opacity-100"
            onClick={(e) => e.stopPropagation()}
        >
            <MoreHorizontal size={14} />
        </Button>
    );
}