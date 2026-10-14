'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
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
    GripVertical,
    Sparkles,
    UserPlus,
    FileText,
    ExternalLink,
    Send,
    SlidersHorizontal,
    Plus,
    Trash2,
    CheckCircle2,
    XCircle,
    RotateCcw,
    Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { CandidateDetailsModal } from '../_components/CandidateDetailsModal';
import { CandidateModal } from '../_components/CandidateModal';
import { getJobByIdAction, getJobsAction } from '../_actions/job-actions';
import {
    getApplicationsAction,
    updateApplicationStageAction,
    getPipelineStagesAction,
    savePipelineStagesAction,
    rejectCandidateAction
} from '../_actions/pipeline-actions';
import { toast } from 'sonner';
import useSWR from 'swr';

const COLOR_OPTIONS = [
    { label: 'Blue', color: 'bg-blue-500', accent: 'border-blue-500/30' },
    { label: 'Amber', color: 'bg-amber-500', accent: 'border-amber-500/30' },
    { label: 'Indigo', color: 'bg-indigo-500', accent: 'border-indigo-500/30' },
    { label: 'Emerald', color: 'bg-emerald-500', accent: 'border-emerald-500/30' },
    { label: 'Violet', color: 'bg-violet-500', accent: 'border-violet-500/30' },
    { label: 'Cyan', color: 'bg-cyan-500', accent: 'border-cyan-500/30' },
    { label: 'Rose', color: 'bg-rose-500', accent: 'border-rose-500/30' },
];

const REJECTION_REASONS = [
    "Technical Skill Gap / Failed Tech Screen",
    "Culture / Values Mismatch",
    "Compensation Expectation Beyond Budget",
    "Candidate Withdrew / Accepted Another Offer",
    "Position Closed / Requisition Cancelled",
    "Location / Work Authorization Constraint",
    "Unresponsive / Ghosted"
];

export default function CandidatePipelinePage() {
    const { workspaceId } = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    const initialJobId = searchParams.get('jobId') || 'ALL';

    const [currentJobId, setCurrentJobId] = useState(initialJobId);
    const [searchTerm, setSearchTerm] = useState('');

    // SSR guard
    const [isMounted, setIsMounted] = useState(false);
    useEffect(() => { setIsMounted(true); }, []);

    // Fetch jobs for quick switcher
    const { data: jobs } = useSWR(
        workspaceId ? ['jobs-selector', workspaceId] : null,
        () => getJobsAction(workspaceId).then(res => res.data || [])
    );

    const activeJob = useMemo(() => {
        if (!jobs || currentJobId === 'ALL') return null;
        return jobs.find(j => j.id === currentJobId) || null;
    }, [jobs, currentJobId]);

    // Fetch dynamic pipeline stages
    const { data: stagesData, mutate: mutateStages } = useSWR(
        workspaceId ? ['pipeline-stages', workspaceId, currentJobId] : null,
        () => getPipelineStagesAction(workspaceId, currentJobId === 'ALL' ? null : currentJobId).then(res => res.data)
    );

    const stages = stagesData || [];

    // Fetch applications
    const { data: applications, mutate: mutateApps } = useSWR(
        workspaceId ? ['applications', workspaceId, currentJobId] : null,
        () => getApplicationsAction(workspaceId, currentJobId === 'ALL' ? null : currentJobId).then(res => res.data)
    );

    const [localApps, setLocalApps] = useState([]);
    const [selectedCandidateId, setSelectedCandidateId] = useState(null);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    // Manage Stages Modal State
    const [isManageStagesOpen, setIsManageStagesOpen] = useState(false);
    const [editableStages, setEditableStages] = useState([]);
    const [isSavingStages, setIsSavingStages] = useState(false);
    const [newStageName, setNewStageName] = useState('');
    const [newStageColor, setNewStageColor] = useState(COLOR_OPTIONS[0]);

    // Rejection Modal State
    const [rejectCandidateTarget, setRejectCandidateTarget] = useState(null);
    const [rejectReason, setRejectReason] = useState(REJECTION_REASONS[0]);
    const [rejectFeedback, setRejectFeedback] = useState('');
    const [isRejecting, setIsRejecting] = useState(false);

    useEffect(() => {
        if (applications) {
            setLocalApps(applications);
        }
    }, [applications]);

    useEffect(() => {
        if (stages.length > 0) {
            setEditableStages(stages);
        }
    }, [stages]);

    // Handle job filter change
    const handleJobChange = (newId) => {
        setCurrentJobId(newId);
        const params = new URLSearchParams(window.location.search);
        if (newId === 'ALL') {
            params.delete('jobId');
        } else {
            params.set('jobId', newId);
        }
        router.push(`/workspace/${workspaceId}/hireflow/pipeline?${params.toString()}`);
    };

    // Filtered candidates by search term
    const getStageCandidates = useCallback((stageId) => {
        return localApps
            .filter(app => {
                const matchesStage = app.stage === stageId;
                if (!matchesStage) return false;
                if (!searchTerm.trim()) return true;
                const search = searchTerm.toLowerCase();
                const nameMatch = app.candidate?.name?.toLowerCase().includes(search);
                const roleMatch = app.job?.title?.toLowerCase().includes(search);
                const emailMatch = app.candidate?.email?.toLowerCase().includes(search);
                return nameMatch || roleMatch || emailMatch;
            })
            .map(app => ({
                id: app.id,
                candidateId: app.candidateId,
                name: app.candidate?.name || 'Unknown Candidate',
                role: app.job?.title || 'Open Position',
                score: app.candidate?.aiMatchScore ? (app.candidate.aiMatchScore / 20).toFixed(1) : "N/A",
                appliedAt: new Date(app.appliedAt).toLocaleDateString(),
                avatarUrl: app.candidate?.avatarUrl,
                stage: app.stage
            }));
    }, [localApps, searchTerm]);

    // Drag-and-drop handler
    const onDragEnd = useCallback(async (result) => {
        const { source, destination, draggableId } = result;
        if (!destination) return;
        if (source.droppableId === destination.droppableId && source.index === destination.index) return;

        const newStage = destination.droppableId;
        const oldStage = source.droppableId;

        // If moved to REJECTED column, trigger rejection modal
        if (newStage === 'REJECTED') {
            const targetApp = localApps.find(a => a.id === draggableId);
            setRejectCandidateTarget(targetApp || { id: draggableId });
            return;
        }

        // Optimistic local state update
        setLocalApps(prev => prev.map(app =>
            app.id === draggableId ? { ...app, stage: newStage } : app
        ));

        if (oldStage !== newStage) {
            const stageLabel = stages.find(s => s.id === newStage)?.title || newStage;
            toast.success(`Advanced to ${stageLabel}`);

            try {
                const res = await updateApplicationStageAction(workspaceId, draggableId, newStage);
                if (!res.success) throw new Error(res.error);
                mutateApps();
            } catch (error) {
                console.error("Failed to update stage:", error);
                toast.error("Failed to update stage. Reverting...");
                setLocalApps(prev => prev.map(app =>
                    app.id === draggableId ? { ...app, stage: oldStage } : app
                ));
            }
        }
    }, [workspaceId, mutateApps, localApps, stages]);

    // Rejection confirm
    const handleConfirmRejection = async () => {
        if (!rejectCandidateTarget) return;
        setIsRejecting(true);
        try {
            const res = await rejectCandidateAction(workspaceId, {
                applicationId: rejectCandidateTarget.id,
                reason: rejectReason,
                feedback: rejectFeedback
            });
            if (!res.success) throw new Error(res.error);
            toast.success("Candidate archived with rejection reason recorded.");
            setRejectCandidateTarget(null);
            setRejectFeedback('');
            mutateApps();
        } catch (error) {
            toast.error(error.message || "Failed to record rejection");
        } finally {
            setIsRejecting(false);
        }
    };

    // Stage Management Handlers
    const handleAddStage = () => {
        if (!newStageName.trim()) {
            toast.error("Please enter a stage name");
            return;
        }
        const stageId = newStageName.trim().toUpperCase().replace(/[^A-Z0-9]/g, '_');
        if (editableStages.some(s => s.id === stageId)) {
            toast.error("A stage with this ID already exists");
            return;
        }
        const newStage = {
            id: stageId,
            title: newStageName.trim(),
            color: newStageColor.color,
            accent: newStageColor.accent,
            type: 'CUSTOM'
        };
        setEditableStages(prev => [...prev, newStage]);
        setNewStageName('');
    };

    const handleRemoveStage = (id) => {
        if (editableStages.length <= 2) {
            toast.error("You must keep at least 2 stages in the pipeline");
            return;
        }
        setEditableStages(prev => prev.filter(s => s.id !== id));
    };

    const handleSaveStages = async () => {
        setIsSavingStages(true);
        try {
            const res = await savePipelineStagesAction(workspaceId, {
                jobId: currentJobId === 'ALL' ? null : currentJobId,
                stages: editableStages
            });
            if (!res.success) throw new Error(res.error);
            toast.success("Pipeline stages saved successfully!");
            setIsManageStagesOpen(false);
            mutateStages();
        } catch (error) {
            toast.error(error.message || "Failed to save stages");
        } finally {
            setIsSavingStages(false);
        }
    };

    return (
        <div className="flex flex-col flex-1 h-[calc(100vh-64px)] overflow-hidden">
            {/* Header / Top Navigation */}
            <div className="p-4 shrink-0 space-y-3 border-b border-border/20 bg-background/50 backdrop-blur-xl">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-0.5">
                        <div className="flex items-center gap-2 text-[10px] tracking-widest uppercase text-muted-foreground opacity-60">
                            <span onClick={() => router.push(`/workspace/${workspaceId}/hireflow`)} className="hover:text-primary cursor-pointer transition-colors">HireFlow</span>
                            <ChevronRight size={10} />
                            <span onClick={() => router.push(`/workspace/${workspaceId}/hireflow/jobs`)} className="hover:text-primary cursor-pointer transition-colors">Positions</span>
                            <ChevronRight size={10} />
                            <span className="text-primary font-bold">Pipeline Kanban</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-xl font-bold tracking-tight">
                                {activeJob ? activeJob.title : "All Candidates Pipeline"}
                            </h1>
                            <Badge variant="outline" className="h-5 rounded-md bg-primary/5 text-primary border-primary/20 text-[10px]">
                                {localApps.length} Candidates
                            </Badge>
                        </div>
                    </div>

                    <div className="flex items-center gap-2.5 flex-wrap">
                        {/* Job Switcher Dropdown */}
                        <Select value={currentJobId} onValueChange={handleJobChange}>
                            <SelectTrigger className="w-[200px] h-9 text-xs rounded-md bg-card/40 backdrop-blur-xl border-border/40 font-medium">
                                <Briefcase className="w-3.5 h-3.5 mr-2 text-primary opacity-60" />
                                <SelectValue placeholder="Filter by Job" />
                            </SelectTrigger>
                            <SelectContent className="text-xs">
                                <SelectItem value="ALL">All Requisitions ({localApps.length})</SelectItem>
                                {(jobs || []).map(j => (
                                    <SelectItem key={j.id} value={j.id}>
                                        {j.title} ({j._count?.applications || 0})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        {/* Search Input */}
                        <div className="relative w-48 md:w-60">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground opacity-50" />
                            <Input
                                placeholder="Search candidates..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9 h-9 rounded-md bg-card/40 backdrop-blur-xl border-border/40 text-xs font-medium"
                            />
                        </div>

                        {/* Manage Pipeline Stages Button */}
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                setEditableStages(stages);
                                setIsManageStagesOpen(true);
                            }}
                            className="h-9 rounded-md px-3 text-xs font-bold border-border/40 bg-card/40 backdrop-blur-xl gap-1.5"
                            title="Customize stages for this requisition"
                        >
                            <SlidersHorizontal size={13} className="opacity-60" />
                            Stages
                        </Button>

                        {/* Add Candidate Button */}
                        <Button
                            onClick={() => setIsAddModalOpen(true)}
                            size="sm"
                            className="h-9 rounded-md px-4 bg-primary text-xs font-bold shadow-lg shadow-primary/20 gap-1.5"
                        >
                            <UserPlus size={14} />
                            Add Candidate
                        </Button>
                    </div>
                </div>
            </div>

            {/* Kanban Drag-and-Drop Columns */}
            {isMounted ? (
                <DragDropContext onDragEnd={onDragEnd}>
                    <ScrollArea className="flex-1 min-h-0 p-4">
                        <div className="flex gap-4 h-full min-w-max pb-4">
                            {stages.map((stage) => {
                                const candidates = getStageCandidates(stage.id);
                                return (
                                    <div key={stage.id} className="w-[300px] shrink-0 flex flex-col gap-3">
                                        {/* Column Header */}
                                        <div className="flex items-center justify-between px-2 shrink-0">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-2.5 h-2.5 rounded-full ${stage.color} shadow-xs`} />
                                                <h3 className="text-xs font-bold tracking-tight text-foreground/80">
                                                    {stage.title}
                                                </h3>
                                                <Badge variant="ghost" className="h-4 px-1.5 bg-muted/60 text-[10px] opacity-60 rounded">
                                                    {candidates.length}
                                                </Badge>
                                            </div>
                                        </div>

                                        {/* Column Body Droppable */}
                                        <ScrollArea className="h-[calc(100vh-210px)] rounded-md border border-border/30 bg-muted/10 p-2">
                                            <Droppable droppableId={stage.id}>
                                                {(provided, snapshot) => (
                                                    <div
                                                        ref={provided.innerRef}
                                                        {...provided.droppableProps}
                                                        className={`space-y-2.5 min-h-[160px] p-1 transition-all rounded-md ${
                                                            snapshot.isDraggingOver
                                                                ? `bg-muted/40 border-2 border-dashed ${stage.accent || 'border-primary/40'}`
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
                                                                        onClick={() => {
                                                                            setSelectedCandidateId(candidate.candidateId);
                                                                            setIsDetailsModalOpen(true);
                                                                        }}
                                                                        className={`p-3.5 rounded-md bg-card/60 backdrop-blur-xl border border-border/40 shadow-xs cursor-pointer group hover:border-primary/40 transition-all select-none ${
                                                                            dragSnapshot.isDragging
                                                                                ? 'shadow-2xl shadow-primary/20 border-primary/50 scale-[1.02] ring-2 ring-primary/20'
                                                                                : ''
                                                                        }`}
                                                                    >
                                                                        <div className="flex items-start justify-between gap-2">
                                                                            <div className="flex items-center gap-2.5 min-w-0">
                                                                                <Avatar className="h-8 w-8 border border-primary/20">
                                                                                    <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-bold">
                                                                                        {candidate.name.split(' ').filter(Boolean).map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                                                                                    </AvatarFallback>
                                                                                </Avatar>
                                                                                <div className="min-w-0">
                                                                                    <h4 className="text-xs font-bold truncate group-hover:text-primary transition-colors">
                                                                                        {candidate.name}
                                                                                    </h4>
                                                                                    <p className="text-[10px] text-muted-foreground opacity-60 truncate">
                                                                                        {candidate.role}
                                                                                    </p>
                                                                                </div>
                                                                            </div>

                                                                            <DropdownMenu>
                                                                                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                                                                    <Button variant="ghost" size="icon" className="h-6 w-6 opacity-40 hover:opacity-100">
                                                                                        <MoreHorizontal size={13} />
                                                                                    </Button>
                                                                                </DropdownMenuTrigger>
                                                                                <DropdownMenuContent align="end" className="w-48 text-xs" onClick={(e) => e.stopPropagation()}>
                                                                                    <DropdownMenuItem onClick={() => {
                                                                                        setSelectedCandidateId(candidate.candidateId);
                                                                                        setIsDetailsModalOpen(true);
                                                                                    }}>
                                                                                        <Sparkles size={13} className="mr-2 text-primary" />
                                                                                        Evaluation Workspace
                                                                                    </DropdownMenuItem>
                                                                                    <DropdownMenuItem onClick={() => {
                                                                                        setSelectedCandidateId(candidate.candidateId);
                                                                                        setIsDetailsModalOpen(true);
                                                                                    }}>
                                                                                        <Send size={13} className="mr-2 text-emerald-500" />
                                                                                        WhatsApp Message
                                                                                    </DropdownMenuItem>
                                                                                    <DropdownMenuItem onClick={() => {
                                                                                        setSelectedCandidateId(candidate.candidateId);
                                                                                        setIsDetailsModalOpen(true);
                                                                                    }}>
                                                                                        <Star size={13} className="mr-2 text-amber-500" />
                                                                                        Submit Scorecard
                                                                                    </DropdownMenuItem>
                                                                                    <DropdownMenuSeparator />
                                                                                    <DropdownMenuItem
                                                                                        onClick={() => setRejectCandidateTarget(candidate)}
                                                                                        className="text-rose-500 focus:text-rose-500"
                                                                                    >
                                                                                        <XCircle size={13} className="mr-2" />
                                                                                        Reject Candidate
                                                                                    </DropdownMenuItem>
                                                                                </DropdownMenuContent>
                                                                            </DropdownMenu>
                                                                        </div>

                                                                        {/* Bottom Card Bar: Score + Quick Buttons */}
                                                                        <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-border/10 text-[10px]">
                                                                            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-primary/10 text-primary font-bold">
                                                                                <Sparkles size={9} className="fill-current" />
                                                                                <span>{candidate.score} fit</span>
                                                                            </div>
                                                                            <span className="text-muted-foreground opacity-50 font-mono">
                                                                                {candidate.appliedAt}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </Draggable>
                                                        ))}

                                                        {provided.placeholder}

                                                        {candidates.length === 0 && !snapshot.isDraggingOver && (
                                                            <div className="h-28 border border-dashed border-border/20 rounded-md flex items-center justify-center">
                                                                <p className="text-[10px] text-muted-foreground opacity-30 italic">No candidates</p>
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
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
            )}

            {/* Manage Stages Modal */}
            <Dialog open={isManageStagesOpen} onOpenChange={setIsManageStagesOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle className="text-base font-bold flex items-center gap-2">
                            <SlidersHorizontal size={16} className="text-primary" />
                            Customize Pipeline Stages
                        </DialogTitle>
                        <DialogDescription className="text-xs">
                            Define the sequential evaluation stages for {activeJob ? `"${activeJob.title}"` : "this workspace"}.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-2">
                        {/* Stage List */}
                        <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
                            {editableStages.map((stage, idx) => (
                                <div key={stage.id} className="flex items-center justify-between p-2.5 rounded-md bg-muted/20 border border-border/20 text-xs">
                                    <div className="flex items-center gap-2.5">
                                        <span className="w-4 font-mono text-[10px] opacity-40">{idx + 1}</span>
                                        <div className={`w-3 h-3 rounded-full ${stage.color}`} />
                                        <span className="font-semibold text-foreground">{stage.title}</span>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleRemoveStage(stage.id)}
                                        className="h-7 w-7 text-muted-foreground hover:text-rose-500 opacity-60 hover:opacity-100"
                                    >
                                        <Trash2 size={13} />
                                    </Button>
                                </div>
                            ))}
                        </div>

                        {/* Add New Stage Row */}
                        <div className="pt-3 border-t border-border/20 space-y-2">
                            <Label className="text-xs font-semibold">Add New Stage</Label>
                            <div className="flex items-center gap-2">
                                <Input
                                    placeholder="e.g. System Design Round"
                                    value={newStageName}
                                    onChange={(e) => setNewStageName(e.target.value)}
                                    className="h-8 text-xs"
                                />
                                <Select
                                    value={newStageColor.label}
                                    onValueChange={(val) => {
                                        const found = COLOR_OPTIONS.find(c => c.label === val);
                                        if (found) setNewStageColor(found);
                                    }}
                                >
                                    <SelectTrigger className="w-24 h-8 text-xs">
                                        <div className="flex items-center gap-1.5">
                                            <div className={`w-2.5 h-2.5 rounded-full ${newStageColor.color}`} />
                                            <span>{newStageColor.label}</span>
                                        </div>
                                    </SelectTrigger>
                                    <SelectContent>
                                        {COLOR_OPTIONS.map(c => (
                                            <SelectItem key={c.label} value={c.label}>
                                                <div className="flex items-center gap-2 text-xs">
                                                    <div className={`w-2 h-2 rounded-full ${c.color}`} />
                                                    <span>{c.label}</span>
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Button
                                    size="sm"
                                    onClick={handleAddStage}
                                    className="h-8 px-3 text-xs bg-primary shrink-0 gap-1 font-bold"
                                >
                                    <Plus size={13} />
                                    Add
                                </Button>
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="ghost" size="sm" onClick={() => setIsManageStagesOpen(false)} className="text-xs">
                            Cancel
                        </Button>
                        <Button
                            size="sm"
                            onClick={handleSaveStages}
                            disabled={isSavingStages}
                            className="text-xs bg-primary font-bold shadow-md shadow-primary/20"
                        >
                            {isSavingStages ? <Loader2 size={13} className="mr-1.5 animate-spin" /> : null}
                            Save Stages
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Rejection Modal with Taxonomy */}
            <Dialog open={!!rejectCandidateTarget} onOpenChange={(open) => !open && setRejectCandidateTarget(null)}>
                <DialogContent className="sm:max-w-[460px]">
                    <DialogHeader>
                        <DialogTitle className="text-base font-bold flex items-center gap-2 text-rose-500">
                            <XCircle size={18} />
                            Archive & Reject Candidate
                        </DialogTitle>
                        <DialogDescription className="text-xs">
                            Record a structured rejection reason to maintain recruitment analytics and compliance.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-2 text-xs">
                        <div className="p-3 rounded-md bg-muted/20 border border-border/20">
                            <span className="font-semibold text-foreground">{rejectCandidateTarget?.name || "Selected Candidate"}</span>
                            <p className="text-[11px] text-muted-foreground mt-0.5">Moving to Archived / Rejected stage</p>
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold">Primary Rejection Reason</Label>
                            <Select value={rejectReason} onValueChange={setRejectReason}>
                                <SelectTrigger className="text-xs h-9">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="text-xs">
                                    {REJECTION_REASONS.map((r, i) => (
                                        <SelectItem key={i} value={r}>{r}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold">Internal Notes / Interview Feedback (Optional)</Label>
                            <Textarea
                                placeholder="Specific feedback or notes from interviewers..."
                                value={rejectFeedback}
                                onChange={(e) => setRejectFeedback(e.target.value)}
                                className="text-xs min-h-[80px]"
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="ghost" size="sm" onClick={() => setRejectCandidateTarget(null)} className="text-xs">
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={handleConfirmRejection}
                            disabled={isRejecting}
                            className="text-xs font-bold"
                        >
                            {isRejecting ? <Loader2 size={13} className="mr-1.5 animate-spin" /> : null}
                            Confirm Rejection
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Candidate Details Modal */}
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
                    mutateApps();
                }}
            />

            {/* Add Candidate Modal */}
            <CandidateModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                workspaceId={workspaceId}
                onSuccess={mutateApps}
            />
        </div>
    );
}