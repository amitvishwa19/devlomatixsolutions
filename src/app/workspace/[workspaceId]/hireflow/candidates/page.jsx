'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useRouter } from 'next/navigation';
import {
    Search,
    Filter,
    Download,
    UserPlus,
    MoreHorizontal,
    Star,
    Mail,
    Phone,
    MapPin,
    ExternalLink,
    ChevronRight,
    Users,
    CheckCircle2,
    Clock,
    X,
    SlidersHorizontal,
    Briefcase,
    Building2,
    Layers,
    RotateCcw,
    Sparkles,
    LayoutGrid,
    List as ListIcon,
    FileText,
    Trash2,
    Loader2,
    Edit3,
    Zap,
    Check,
    CheckCheck,
    AlertCircle,
    Wand2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { CandidateModal } from '../_components/CandidateModal';
import { CandidateDetailsModal } from '../_components/CandidateDetailsModal';
import AddContactModal from '../_components/AddContactModal';
import {
    getCandidatesAction,
    deleteCandidateAction,
    aiParseResumeAction,
    updateCandidateAction,
    bulkUpdateCandidatesAiScoreAction
} from '../_actions/candidate-actions';
import { getDepartmentsAction } from '../departments/_actions/department-actions';
import { toast } from 'sonner';

import useSWR from 'swr';
import { ScrollArea } from '@/components/ui/scroll-area';

const STAGES = [
    { value: 'all', label: 'All Stages' },
    { value: 'APPLIED', label: 'Applied', dotColor: 'bg-blue-500' },
    { value: 'SCREENING', label: 'Screening', dotColor: 'bg-amber-500' },
    { value: 'INTERVIEW', label: 'Interview', dotColor: 'bg-indigo-500' },
    { value: 'OFFERED', label: 'Offered', dotColor: 'bg-emerald-500' },
    { value: 'HIRED', label: 'Hired', dotColor: 'bg-purple-500' },
    { value: 'REJECTED', label: 'Rejected', dotColor: 'bg-rose-500' },
];

const getInitials = (name) => {
    if (!name) return "";
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return "";
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

export default function TalentDatabasePage() {
    const { workspaceId } = useParams();
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedDepartment, setSelectedDepartment] = useState("all");
    const [selectedStatus, setSelectedStatus] = useState("all");
    const [selectedScoreFilter, setSelectedScoreFilter] = useState("all");
    const [viewMode, setViewMode] = useState("list");

    const { data: candidates, isLoading, mutate } = useSWR(
        workspaceId ? ['candidates', workspaceId] : null,
        () => getCandidatesAction(workspaceId).then(res => res.data)
    );

    const { data: departments } = useSWR(
        workspaceId ? ['departments', workspaceId] : null,
        () => getDepartmentsAction(workspaceId).then(res => res.data)
    );
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [isAddContactModalOpen, setIsAddContactModalOpen] = useState(false);
    const [candidateForContact, setCandidateForContact] = useState(null);
    const [selectedCandidateId, setSelectedCandidateId] = useState(null);
    const [candidateToDelete, setCandidateToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [parsingCandidateId, setParsingCandidateId] = useState(null);
    const [candidateForScore, setCandidateForScore] = useState(null);
    const [editScoreValue, setEditScoreValue] = useState(80);
    const [isSavingScore, setIsSavingScore] = useState(false);
    const [isAutoScoring, setIsAutoScoring] = useState(false);

    // Batch AI Score states for N/A candidates
    const [isBatchScoreModalOpen, setIsBatchScoreModalOpen] = useState(false);
    const [batchMode, setBatchMode] = useState('ai'); // 'ai' or 'manual'
    const [batchScoreValue, setBatchScoreValue] = useState(75);
    const [isBatchProcessing, setIsBatchProcessing] = useState(false);
    const [batchProgress, setBatchProgress] = useState({ current: 0, total: 0, candidateName: '' });

    const handleOpenScoreModal = (candidateItem) => {
        const fullCand = candidates?.find(c => c.id === candidateItem.id) || candidateItem;
        const currentScore = typeof fullCand.aiMatchScore === 'number'
            ? fullCand.aiMatchScore
            : (typeof candidateItem.rawScore === 'number' ? candidateItem.rawScore : 75);
        setCandidateForScore({ ...candidateItem, ...fullCand });
        setEditScoreValue(currentScore);
    };

    const handleSaveScore = async () => {
        if (!candidateForScore?.id) return;
        setIsSavingScore(true);
        const scoreNum = Math.min(100, Math.max(0, Math.round(Number(editScoreValue) || 0)));
        try {
            const res = await updateCandidateAction(workspaceId, candidateForScore.id, {
                aiMatchScore: scoreNum
            });
            if (!res.success) throw new Error(res.error);
            toast.success(`AI Score updated to ${scoreNum}% (${(scoreNum / 20).toFixed(1)}/5.0) for ${candidateForScore.name}`);
            setCandidateForScore(null);
            mutate();
        } catch (error) {
            console.error("[UPDATE_AI_SCORE_ERROR]", error);
            toast.error(error.message || "Failed to update AI score");
        } finally {
            setIsSavingScore(false);
        }
    };

    const handleAutoEvaluateScore = async () => {
        if (!candidateForScore?.id) return;
        setIsAutoScoring(true);
        const toastId = toast.loading(`FlowGenix AI evaluating ${candidateForScore.name}...`);
        try {
            const res = await aiParseResumeAction(workspaceId, { candidateId: candidateForScore.id });
            if (!res.success) throw new Error(res.error);
            const newScore = res.data?.aiMatchScore || 85;
            setEditScoreValue(newScore);
            toast.success(`FlowGenix evaluation: ${newScore}% (${(newScore / 20).toFixed(1)}/5.0)`, { id: toastId });
            mutate();
        } catch (error) {
            console.error("[AUTO_SCORE_ERROR]", error);
            toast.error(error.message || "FlowGenix evaluation failed", { id: toastId });
        } finally {
            setIsAutoScoring(false);
        }
    };

    const getScoreTierInfo = (score) => {
        if (score >= 90) return { label: 'Exceptional Match', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' };
        if (score >= 75) return { label: 'Strong Fit', color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30' };
        if (score >= 60) return { label: 'Moderate Fit', color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' };
        if (score > 0) return { label: 'Weak Fit', color: 'text-rose-400 bg-rose-500/10 border-rose-500/30' };
        return { label: 'Unrated', color: 'text-muted-foreground bg-muted/20 border-border/40' };
    };

    const handleRunBatchAiEvaluation = async () => {
        const unratedList = talents.filter(t => t.rawScore === null || t.rawScore === undefined);
        if (unratedList.length === 0) {
            toast.info("No candidates are currently showing N/A!");
            return;
        }

        setIsBatchProcessing(true);
        setBatchProgress({ current: 0, total: unratedList.length, candidateName: 'Starting evaluation...' });
        let successCount = 0;

        for (let i = 0; i < unratedList.length; i++) {
            const cand = unratedList[i];
            setBatchProgress({
                current: i + 1,
                total: unratedList.length,
                candidateName: cand.name
            });

            try {
                const res = await aiParseResumeAction(workspaceId, { candidateId: cand.id });
                if (res.success) {
                    successCount++;
                }
            } catch (err) {
                console.error(`[BATCH_AI_EVAL_ERROR] Candidate ${cand.name}:`, err);
            }
        }

        setIsBatchProcessing(false);
        setIsBatchScoreModalOpen(false);
        toast.success(`FlowGenix AI evaluated scores for ${successCount} of ${unratedList.length} candidate(s)!`);
        mutate();
    };

    const handleRunBatchManualCalibration = async () => {
        const unratedList = talents.filter(t => t.rawScore === null || t.rawScore === undefined);
        if (unratedList.length === 0) {
            toast.info("No candidates are currently showing N/A!");
            return;
        }

        setIsBatchProcessing(true);
        const scoreNum = Math.min(100, Math.max(0, Math.round(Number(batchScoreValue) || 75)));

        try {
            const res = await bulkUpdateCandidatesAiScoreAction(workspaceId, {
                candidateIds: unratedList.map(c => c.id),
                mode: 'manual',
                score: scoreNum
            });

            if (!res.success) throw new Error(res.error);
            toast.success(`Updated AI score to ${scoreNum}% (${(scoreNum / 20).toFixed(1)}/5.0) for ${res.count || unratedList.length} candidate(s)!`);
            setIsBatchScoreModalOpen(false);
            mutate();
        } catch (err) {
            console.error("[BATCH_MANUAL_CALIBRATION_ERROR]", err);
            toast.error(err.message || "Failed to batch update candidate scores");
        } finally {
            setIsBatchProcessing(false);
        }
    };

    const handleOpenAddContact = (candidateItem) => {
        const fullCand = candidates?.find(c => c.id === candidateItem.id) || candidateItem;
        setCandidateForContact({
            ...candidateItem,
            ...fullCand,
            phone: fullCand.phone || candidateItem.phone || '',
            role: candidateItem.role || fullCand.applications?.[0]?.job?.title || 'Candidate',
            departmentName: candidateItem.departmentName || fullCand.applications?.[0]?.job?.category?.name || '',
            location: fullCand.location || candidateItem.location || '',
            summary: fullCand.summary || fullCand.aiSummary || '',
            tags: fullCand.skills || candidateItem.tags || []
        });
        setIsAddContactModalOpen(true);
    };

    const handleParseResume = async (candidate) => {
        if (!candidate?.id) return;
        setParsingCandidateId(candidate.id);
        const toastId = toast.loading(`Parsing resume for ${candidate.name}...`);
        try {
            const res = await aiParseResumeAction(workspaceId, { candidateId: candidate.id });
            if (!res.success) throw new Error(res.error);
            toast.success(`Resume parsed successfully for ${candidate.name}!`, { id: toastId });
            mutate();
        } catch (error) {
            console.error("[PARSE_RESUME_ERROR]", error);
            toast.error(error.message || "Failed to parse resume", { id: toastId });
        } finally {
            setParsingCandidateId(null);
        }
    };

    const handleConfirmDelete = async () => {
        if (!candidateToDelete) return;
        setIsDeleting(true);
        try {
            const res = await deleteCandidateAction(workspaceId, candidateToDelete.id);
            if (!res.success) throw new Error(res.error);
            toast.success("Candidate deleted successfully");
            setCandidateToDelete(null);
            mutate();
        } catch (error) {
            console.error("[DELETE_CANDIDATE_ERROR]", error);
            toast.error(error.message || "Failed to delete candidate");
        } finally {
            setIsDeleting(false);
        }
    };


    const getStageBadgeStyle = (stage) => {
        const s = (stage || '').toUpperCase();
        if (s === 'HIRED' || s === 'OFFERED' || s === 'OFFER') {
            return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
        }
        if (s === 'REJECTED') {
            return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
        }
        if (s === 'INTERVIEW') {
            return 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20';
        }
        if (s === 'SCREENING') {
            return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
        }
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
    };

    const talents = candidates ? candidates.map(c => {
        const primaryApp = c.applications?.[0];
        const job = primaryApp?.job;
        const departmentName = job?.category?.name || job?.department || "General";
        const departmentId = job?.categoryId || job?.category?.id || null;

        return {
            id: c.id,
            name: c.name,
            role: job?.title || "Candidate",
            email: c.email,
            status: primaryApp?.stage || "APPLIED",
            rawScore: typeof c.aiMatchScore === 'number' ? c.aiMatchScore : null,
            score: typeof c.aiMatchScore === 'number' ? (c.aiMatchScore / 20).toFixed(1) : "N/A",
            location: c.location || "N/A",
            applied: new Date(c.createdAt).toLocaleDateString(),
            tags: c.skills || [],
            resumeUrl: c.resumeUrl || null,
            departmentName,
            departmentId,
            allDepartments: c.applications?.map(a => a.job?.category?.name || a.job?.department || "General").filter(Boolean) || [],
            allDepartmentIds: c.applications?.map(a => a.job?.categoryId || a.job?.category?.id).filter(Boolean) || [],
            allStages: c.applications?.map(a => (a.stage || '').toUpperCase()).filter(Boolean) || [primaryApp?.stage?.toUpperCase() || "APPLIED"]
        };
    }) : [];

    const filteredTalents = talents.filter(t => {
        const query = searchQuery.toLowerCase().trim();
        const matchesSearch = !query || (
            t.name.toLowerCase().includes(query) ||
            t.role.toLowerCase().includes(query) ||
            t.email.toLowerCase().includes(query) ||
            t.location.toLowerCase().includes(query) ||
            t.tags.some(tag => tag.toLowerCase().includes(query))
        );

        const matchesDepartment = selectedDepartment === 'all' || (
            t.departmentId === selectedDepartment ||
            t.allDepartmentIds.includes(selectedDepartment) ||
            t.departmentName.toLowerCase() === selectedDepartment.toLowerCase() ||
            t.allDepartments.some(d => d.toLowerCase() === selectedDepartment.toLowerCase())
        );

        const matchesStatus = selectedStatus === 'all' || (
            t.status.toUpperCase() === selectedStatus.toUpperCase() ||
            t.allStages.includes(selectedStatus.toUpperCase())
        );

        const matchesScore = selectedScoreFilter === 'all' || (
            selectedScoreFilter === 'unrated' ? (t.rawScore === null || t.rawScore === undefined) :
                selectedScoreFilter === 'rated' ? (typeof t.rawScore === 'number') :
                    selectedScoreFilter === 'high' ? (typeof t.rawScore === 'number' && t.rawScore >= 80) : true
        );

        return matchesSearch && matchesDepartment && matchesStatus && matchesScore;
    });

    const unratedCandidates = talents.filter(t => t.rawScore === null || t.rawScore === undefined);
    const unratedCount = unratedCandidates.length;

    const activeFilterCount = (selectedDepartment !== 'all' ? 1 : 0) +
        (selectedStatus !== 'all' ? 1 : 0) +
        (selectedScoreFilter !== 'all' ? 1 : 0) +
        (searchQuery.trim() ? 1 : 0);

    const activeDepartment = departments?.find(d => d.id === selectedDepartment);

    return (
        <div className="flex flex-col flex-1 gap-3.5 p-4 animate-in fade-in duration-500 overflow-hidden">


            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div className="space-y-0.5">
                    <h1 className="text-xl font-bold tracking-tight">Talent Database</h1>
                    <p className="text-xs text-muted-foreground font-medium">Manage, evaluate, and discover candidates across all job positions.</p>
                </div>
                <div className="flex items-center gap-2">
                    {unratedCount > 0 && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setIsBatchScoreModalOpen(true)}
                            className="h-9 rounded-lg px-3.5 font-semibold text-xs border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 hover:text-amber-400 transition-all flex items-center gap-2 shadow-xs cursor-pointer animate-in fade-in"
                            title="Update AI Match Score for all candidates showing N/A"
                        >
                            <Sparkles className="w-3.5 h-3.5 animate-pulse text-amber-500" />
                            <span>AI Score Missing Candidates</span>
                            <Badge className="ml-0.5 h-5 px-1.5 text-[10px] bg-amber-500 text-black font-extrabold hover:bg-amber-500">
                                {unratedCount}
                            </Badge>
                        </Button>
                    )}
                    <Button variant="outline" size="sm" className="h-9 rounded-lg px-4 font-semibold text-xs border-border/40 bg-card/40 backdrop-blur-xl hover:bg-card/80 transition-all">
                        <Download className="w-3.5 h-3.5 mr-1.5 opacity-70" />
                        Export Talent
                    </Button>
                    <Button
                        size="sm"
                        onClick={() => setIsAddModalOpen(true)}
                        className="h-9 rounded-lg px-4 bg-primary shadow-sm shadow-primary/20 font-semibold text-xs hover:bg-primary/90 transition-all"
                    >
                        <UserPlus className="w-3.5 h-3.5 mr-1.5" />
                        Add Candidate
                    </Button>
                </div>
            </div>

            {/* Compact Professional Filter Toolbar */}
            <div className="bg-card/40 backdrop-blur-xl border border-border/50 rounded-xl p-2 shadow-xs space-y-2 shrink-0">
                <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2">
                    {/* Search Input */}
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/60" />
                        <Input
                            placeholder="Search candidate name, role, email, skills..."
                            className="pl-9 pr-8 h-9 bg-background/60 border-border/50 rounded-lg text-xs font-medium focus-visible:ring-1 focus-visible:ring-primary/40 transition-all"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        {searchQuery && (
                            <button
                                type="button"
                                onClick={() => setSearchQuery('')}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-foreground p-0.5 rounded-sm transition-colors"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </div>

                    {/* Filter Controls */}
                    <div className="flex items-center  gap-2">
                        {/* Department Dropdown */}
                        <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                            <SelectTrigger className={`h-9 text-xs font-medium rounded-lg border-border/50 bg-background/60 min-w-[150px] max-w-[190px] gap-1.5 transition-all ${selectedDepartment !== 'all' ? 'border-primary/40 text-primary bg-primary/5 font-semibold' : 'text-muted-foreground'
                                }`}>
                                <Building2 className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                                <span className="truncate">{selectedDepartment === 'all' ? 'All Departments' : (activeDepartment?.name || selectedDepartment)}</span>
                            </SelectTrigger>
                            <SelectContent className="rounded-lg border-border/40 bg-card/95 backdrop-blur-xl max-h-[280px]">
                                <SelectItem value="all" className="text-xs font-medium">All Departments</SelectItem>
                                {departments && departments.length > 0 ? (
                                    departments.map(dept => (
                                        <SelectItem key={dept.id} value={dept.id} className="text-xs font-medium">
                                            <span className="flex items-center gap-2">
                                                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: dept.color || '#3b82f6' }} />
                                                <span className="truncate">{dept.name}</span>
                                            </span>
                                        </SelectItem>
                                    ))
                                ) : null}
                            </SelectContent>
                        </Select>

                        {/* Stage Dropdown */}
                        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                            <SelectTrigger className={`h-9 text-xs font-medium rounded-lg border-border/50 bg-background/60 min-w-[130px] max-w-[160px] gap-1.5 transition-all ${selectedStatus !== 'all' ? 'border-primary/40 text-primary bg-primary/5 font-semibold' : 'text-muted-foreground'
                                }`}>
                                <Layers className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                                <span className="truncate">{selectedStatus === 'all' ? 'All Stages' : STAGES.find(s => s.value === selectedStatus)?.label || selectedStatus}</span>
                            </SelectTrigger>
                            <SelectContent className="rounded-lg border-border/40 bg-card/95 backdrop-blur-xl">
                                {STAGES.map(stage => (
                                    <SelectItem key={stage.value} value={stage.value} className="text-xs font-medium">
                                        <span className="flex items-center gap-2">
                                            {stage.dotColor && <span className={`w-2 h-2 rounded-full ${stage.dotColor} shrink-0`} />}
                                            <span>{stage.label}</span>
                                        </span>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        {/* AI Score Filter Dropdown */}
                        <Select value={selectedScoreFilter} onValueChange={setSelectedScoreFilter}>
                            <SelectTrigger className={`h-9 text-xs font-medium rounded-lg border-border/50 bg-background/60 min-w-[130px] max-w-[170px] gap-1.5 transition-all ${selectedScoreFilter !== 'all' ? 'border-primary/40 text-primary bg-primary/5 font-semibold' : 'text-muted-foreground'
                                }`}>
                                <Sparkles className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                                <span className="truncate">
                                    {selectedScoreFilter === 'all' && 'All AI Scores'}
                                    {selectedScoreFilter === 'unrated' && `N/A Only (${unratedCount})`}
                                    {selectedScoreFilter === 'rated' && 'Scored Only'}
                                    {selectedScoreFilter === 'high' && 'High Fit (80%+)'}
                                </span>
                            </SelectTrigger>
                            <SelectContent className="rounded-lg border-border/40 bg-card/95 backdrop-blur-xl">
                                <SelectItem value="all" className="text-xs font-medium">All AI Scores</SelectItem>
                                <SelectItem value="unrated" className="text-xs font-medium">
                                    <span className="flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                                        <span>N/A / Unrated ({unratedCount})</span>
                                    </span>
                                </SelectItem>
                                <SelectItem value="rated" className="text-xs font-medium">
                                    <span className="flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
                                        <span>All Scored Candidates</span>
                                    </span>
                                </SelectItem>
                                <SelectItem value="high" className="text-xs font-medium">
                                    <span className="flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                                        <span>High Match (≥ 80%)</span>
                                    </span>
                                </SelectItem>
                            </SelectContent>
                        </Select>

                        {/* Reset Filters Button */}
                        {activeFilterCount > 0 && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                    setSelectedDepartment('all');
                                    setSelectedStatus('all');
                                    setSelectedScoreFilter('all');
                                    setSearchQuery('');
                                }}
                                className="h-9 px-2.5 text-xs font-semibold text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg gap-1.5 transition-colors"
                            >
                                <RotateCcw className="w-3 h-3" />
                                <span className="hidden sm:inline">Reset</span>
                                <Badge variant="secondary" className="px-1.5 py-0 h-4 text-[10px] font-bold rounded-full bg-primary/10 text-primary">
                                    {activeFilterCount}
                                </Badge>
                            </Button>
                        )}

                        <div className="w-px h-5 bg-border/60 mx-0.5 hidden md:block" />

                        {/* Segmented View Mode Toggle */}
                        <div className="flex items-center bg-muted/40 p-0.5 rounded-lg border border-border/40 shrink-0">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setViewMode('list')}
                                className={`h-8 px-2.5 rounded-md text-xs font-medium transition-all gap-1.5 ${viewMode === 'list'
                                    ? 'bg-background text-foreground shadow-xs'
                                    : 'text-muted-foreground hover:text-foreground'
                                    }`}
                            >
                                <ListIcon className="w-3.5 h-3.5" />
                                <span className="hidden lg:inline text-[11px]">List</span>
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setViewMode('grid')}
                                className={`h-8 px-2.5 rounded-md text-xs font-medium transition-all gap-1.5 ${viewMode === 'grid'
                                    ? 'bg-background text-foreground shadow-xs'
                                    : 'text-muted-foreground hover:text-foreground'
                                    }`}
                            >
                                <LayoutGrid className="w-3.5 h-3.5" />
                                <span className="hidden lg:inline text-[11px]">Grid</span>
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Secondary Bar: Result Count & Active Filter Tags */}
                <div className="flex items-center justify-between text-[11px] text-muted-foreground px-1 pt-0.5 border-t border-border/20">
                    <div className="flex items-center gap-2">
                        <span className="font-semibold text-foreground/80">
                            Showing {filteredTalents.length} of {talents.length} {talents.length === 1 ? 'candidate' : 'candidates'}
                        </span>
                        {activeFilterCount > 0 && (
                            <span className="text-[10px] text-muted-foreground opacity-60">
                                (filtered from total pool)
                            </span>
                        )}
                    </div>

                    {activeFilterCount > 0 && (
                        <div className="flex items-center gap-1.5 overflow-x-auto">
                            {searchQuery && (
                                <Badge variant="outline" className="text-[10px] h-5 px-1.5 gap-1 font-medium bg-background/50 border-border/40">
                                    "{searchQuery}"
                                    <button onClick={() => setSearchQuery('')} className="hover:text-destructive">
                                        <X className="w-2.5 h-2.5" />
                                    </button>
                                </Badge>
                            )}
                            {selectedDepartment !== 'all' && (
                                <Badge variant="outline" className="text-[10px] h-5 px-1.5 gap-1 font-medium bg-primary/5 border-primary/20 text-primary">
                                    Dept: {activeDepartment?.name || selectedDepartment}
                                    <button onClick={() => setSelectedDepartment('all')} className="hover:text-destructive">
                                        <X className="w-2.5 h-2.5" />
                                    </button>
                                </Badge>
                            )}
                            {selectedStatus !== 'all' && (
                                <Badge variant="outline" className="text-[10px] h-5 px-1.5 gap-1 font-medium bg-primary/5 border-primary/20 text-primary">
                                    Stage: {STAGES.find(s => s.value === selectedStatus)?.label || selectedStatus}
                                    <button onClick={() => setSelectedStatus('all')} className="hover:text-destructive">
                                        <X className="w-2.5 h-2.5" />
                                    </button>
                                </Badge>
                            )}
                        </div>
                    )}
                </div>
            </div>



            {/* Talent List/Grid */}
            <div className='flex-1 min-h-0 w-full'>
                <ScrollArea className='h-[72vh] rounded-md pr-1'>
                    <AnimatePresence mode="wait">
                        {viewMode === 'list' ? (
                            <motion.div
                                key="list"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                transition={{ duration: 0.2 }}
                                className="bg-card/30 backdrop-blur-xl rounded-md border border-border/40 overflow-hidden"
                            >
                                <Table>
                                    <TableHeader className="bg-muted/90 backdrop-blur-md sticky top-0 z-10">
                                        <TableRow className="border-border/40 hover:bg-transparent">
                                            <TableHead className="text-[10px] py-5 px-6">Candidate</TableHead>
                                            <TableHead className="text-[10px] py-5">Role</TableHead>
                                            <TableHead className="text-[10px] py-5 text-center">AI Score</TableHead>
                                            <TableHead className="text-[10px] py-5">Stage</TableHead>
                                            <TableHead className="text-[10px] py-5">Location</TableHead>
                                            <TableHead className="text-[10px] py-5">Applied</TableHead>
                                            <TableHead className="text-[10px] py-5 text-right px-6">Action</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredTalents.map((candidate) => (
                                            <TableRow key={candidate.id} className="border-border/20 group hover:bg-primary/5 transition-colors">
                                                <TableCell className="py-4 px-6">
                                                    <div className="flex items-center gap-3">
                                                        <Avatar className="h-9 w-9 border border-primary/20">
                                                            <AvatarFallback className="bg-primary/5 text-primary text-[10px]">
                                                                {getInitials(candidate.name)}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div>
                                                            <p className="text-xs">{candidate.name}</p>
                                                            <p className="text-[10px] text-muted-foreground font-bold truncate max-w-[150px] opacity-60">{candidate.email}</p>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div>
                                                        <p className="text-xs font-bold opacity-90">{candidate.role}</p>
                                                        <p className="text-[10px] text-muted-foreground font-medium opacity-60">{candidate.departmentName}</p>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleOpenScoreModal(candidate)}
                                                        className={`group/score inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-semibold border transition-all cursor-pointer shadow-xs ${candidate.rawScore === null
                                                            ? 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 border-amber-500/30 hover:border-amber-500/50'
                                                            : 'bg-primary/10 hover:bg-primary/20 text-primary border-primary/20 hover:border-primary/40'
                                                            }`}
                                                        title="Click to update AI Score"
                                                    >
                                                        <Sparkles size={11} className={`group-hover/score:scale-110 transition-transform ${candidate.rawScore === null ? 'text-amber-500 animate-pulse' : 'text-primary'}`} />
                                                        <span>{candidate.score}</span>
                                                        {candidate.rawScore !== null ? (
                                                            <span className="text-[9px] opacity-60">({candidate.rawScore}%)</span>
                                                        ) : (
                                                            <span className="text-[9px] opacity-75 underline decoration-amber-500/50">Rate</span>
                                                        )}
                                                        <Edit3 size={10} className="opacity-0 group-hover/score:opacity-100 transition-opacity ml-0.5" />
                                                    </button>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className={`${getStageBadgeStyle(candidate.status)} text-[9px] font-bold uppercase tracking-wider`}>
                                                        {candidate.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-muted-foreground/60">
                                                        <MapPin size={12} /> {candidate.location}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-muted-foreground/60">
                                                        <Clock size={12} /> {candidate.applied}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right px-6">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 rounded-md opacity-40 hover:opacity-100 hover:bg-primary hover:text-white transition-all shadow-none"
                                                            onClick={() => {
                                                                setSelectedCandidateId(candidate.id);
                                                                setIsDetailsModalOpen(true);
                                                            }}
                                                        >
                                                            <ExternalLink size={14} />
                                                        </Button>
                                                        {candidate.resumeUrl && (
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8 rounded-md opacity-40 hover:opacity-100 hover:bg-emerald-500 hover:text-white transition-all shadow-none"
                                                                onClick={() => window.open(candidate.resumeUrl, '_blank')}
                                                                title="View Resume"
                                                            >
                                                                <FileText size={14} />
                                                            </Button>
                                                        )}
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-md opacity-40 hover:opacity-100">
                                                                    <MoreHorizontal size={14} />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end" className="rounded-md border-border/40 bg-card/90 backdrop-blur-xl">
                                                                <DropdownMenuItem
                                                                    className="font-bold text-xs cursor-pointer"
                                                                    onClick={() => {
                                                                        setSelectedCandidateId(candidate.id);
                                                                        setIsDetailsModalOpen(true);
                                                                    }}
                                                                >
                                                                    <ExternalLink size={13} className="mr-2" /> View Profile
                                                                </DropdownMenuItem>
                                                                {candidate.resumeUrl && (
                                                                    <DropdownMenuItem
                                                                        className="font-bold text-xs cursor-pointer"
                                                                        onClick={() => window.open(candidate.resumeUrl, '_blank')}
                                                                    >
                                                                        <FileText size={13} className="mr-2" /> View Resume
                                                                    </DropdownMenuItem>
                                                                )}
                                                                <DropdownMenuItem
                                                                    className="font-bold text-xs cursor-pointer text-primary focus:text-primary"
                                                                    onClick={() => handleOpenScoreModal(candidate)}
                                                                >
                                                                    <Sparkles size={13} className="mr-2" /> Update AI Score
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem
                                                                    className="font-bold text-xs cursor-pointer"
                                                                    onClick={() => handleOpenAddContact(candidate)}
                                                                >
                                                                    <Users size={13} className="mr-2 text-primary" /> Add to Contact
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem
                                                                    className="font-bold text-xs text-destructive focus:text-destructive focus:bg-destructive/10 flex items-center cursor-pointer"
                                                                    onClick={() => setCandidateToDelete(candidate)}
                                                                >
                                                                    <Trash2 size={13} className="mr-2" /> Delete Candidate
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="grid"
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.98 }}
                                transition={{ duration: 0.2 }}
                                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3"
                            >
                                {filteredTalents.map((candidate, idx) => (
                                    <motion.div
                                        key={candidate.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.02 }}
                                    >
                                        <Card className="border-border/40 bg-card/30 backdrop-blur-xl rounded-xl overflow-hidden shadow-sm hover:border-primary/30 hover:shadow-md transition-all group cursor-default h-full flex flex-col">
                                            <CardHeader className="p-3 pb-2 flex flex-row items-center justify-between space-y-0 gap-2 border-b border-border/10">
                                                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                                    <Avatar className="h-9 w-9 border border-primary/20 shadow-xs shrink-0">
                                                        <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                                                            {getInitials(candidate.name)}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div className="min-w-0 flex-1">
                                                        <h3
                                                            className="text-xs font-bold text-foreground group-hover:text-primary transition-colors truncate cursor-pointer"
                                                            title={candidate.name}
                                                            onClick={() => {
                                                                setSelectedCandidateId(candidate.id);
                                                                setIsDetailsModalOpen(true);
                                                            }}
                                                        >
                                                            {candidate.name}
                                                        </h3>
                                                        <div className="flex items-center gap-1.5 mt-0.5 text-[10px] text-muted-foreground truncate">
                                                            <span className="truncate max-w-[90px] sm:max-w-[110px]" title={candidate.role}>{candidate.role}</span>
                                                            {candidate.departmentName && (
                                                                <>
                                                                    <span className="w-1 h-1 rounded-full bg-border shrink-0" />
                                                                    <span className="text-primary/90 font-medium truncate max-w-[80px]" title={candidate.departmentName}>
                                                                        {candidate.departmentName}
                                                                    </span>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col items-end gap-1 shrink-0">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleOpenScoreModal(candidate)}
                                                        className={`group/score flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold border transition-all cursor-pointer shadow-xs ${candidate.rawScore === null
                                                            ? 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 border-amber-500/30 hover:border-amber-500/50'
                                                            : 'bg-primary/10 hover:bg-primary/20 text-primary border-primary/20 hover:border-primary/40'
                                                            }`}
                                                        title="Click to update AI Score"
                                                    >
                                                        <Sparkles size={9} className={`group-hover/score:scale-110 transition-transform ${candidate.rawScore === null ? 'text-amber-500' : 'text-primary'}`} />
                                                        <span>{candidate.score}</span>
                                                        {candidate.rawScore !== null ? (
                                                            <span className="text-[9px] opacity-60">({candidate.rawScore}%)</span>
                                                        ) : (
                                                            <span className="text-[9px] opacity-75 underline decoration-amber-500/50">Rate</span>
                                                        )}
                                                        <Edit3 size={9} className="opacity-0 group-hover/score:opacity-100 transition-opacity ml-0.5" />
                                                    </button>
                                                    <Badge variant="outline" className={`${getStageBadgeStyle(candidate.status)} text-[9px] px-1.5 py-0 font-bold uppercase tracking-wider h-4 leading-none`}>
                                                        {candidate.status}
                                                    </Badge>
                                                </div>
                                            </CardHeader>
                                            <CardContent className="p-3 pt-2 flex-1 flex flex-col gap-2">
                                                <div className="flex items-center justify-between text-[10px] text-muted-foreground/70">
                                                    <div className="flex items-center gap-1 truncate max-w-[130px]" title={candidate.location}>
                                                        <MapPin size={11} className="shrink-0" />
                                                        <span className="truncate">{candidate.location}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1 shrink-0">
                                                        <Clock size={11} />
                                                        <span>{candidate.applied}</span>
                                                    </div>
                                                </div>

                                                <div className="flex flex-wrap gap-1 items-center min-h-[20px]">
                                                    {candidate.tags && candidate.tags.length > 0 ? (
                                                        <>
                                                            {candidate.tags.slice(0, 3).map((tag, i) => (
                                                                <Badge key={i} variant="outline" className="h-5 rounded px-1.5 py-0 text-[10px] font-medium border-border/40 bg-muted/20 text-muted-foreground truncate max-w-[100px]">
                                                                    {tag}
                                                                </Badge>
                                                            ))}
                                                            {candidate.tags.length > 3 && (
                                                                <span className="text-[9px] font-mono font-semibold text-muted-foreground bg-muted/30 px-1 py-0.5 rounded border border-border/30">
                                                                    +{candidate.tags.length - 3}
                                                                </span>
                                                            )}
                                                        </>
                                                    ) : (
                                                        <span className="text-[10px] text-muted-foreground/40 italic">No skills tagged</span>
                                                    )}
                                                </div>

                                                <div className="mt-auto pt-2 border-t border-border/20 flex items-center gap-1.5">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="flex-1 h-7 rounded-md text-[10px] font-semibold border-border/40 hover:bg-primary/10 hover:text-primary transition-all px-2"
                                                        onClick={() => {
                                                            setSelectedCandidateId(candidate.id);
                                                            setIsDetailsModalOpen(true);
                                                        }}
                                                    >
                                                        <span>View Profile</span>
                                                        <ExternalLink size={10} className="ml-1 opacity-50" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="w-7 h-7 rounded-md opacity-60 hover:opacity-100 hover:text-primary"
                                                        title={candidate.email}
                                                        onClick={() => {
                                                            setSelectedCandidateId(candidate.id);
                                                            setIsDetailsModalOpen(true);
                                                        }}
                                                    >
                                                        <Mail size={13} />
                                                    </Button>
                                                    {candidate.resumeUrl && (
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="w-7 h-7 rounded-md opacity-60 hover:opacity-100 hover:text-emerald-500"
                                                            title="View Resume"
                                                            onClick={() => window.open(candidate.resumeUrl, '_blank')}
                                                        >
                                                            <FileText size={13} />
                                                        </Button>
                                                    )}
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon" className="w-7 h-7 rounded-md opacity-60 hover:opacity-100">
                                                                <MoreHorizontal size={13} />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end" className="rounded-md border-border/40 bg-card/90 backdrop-blur-xl">
                                                            <DropdownMenuItem
                                                                className="font-bold text-xs cursor-pointer"
                                                                onClick={() => {
                                                                    setSelectedCandidateId(candidate.id);
                                                                    setIsDetailsModalOpen(true);
                                                                }}
                                                            >
                                                                <ExternalLink size={13} className="mr-2" /> View Profile
                                                            </DropdownMenuItem>
                                                            {candidate.resumeUrl && (
                                                                <DropdownMenuItem
                                                                    className="font-bold text-xs cursor-pointer"
                                                                    onClick={() => window.open(candidate.resumeUrl, '_blank')}
                                                                >
                                                                    <FileText size={13} className="mr-2" /> View Resume
                                                                </DropdownMenuItem>
                                                            )}
                                                            <DropdownMenuItem
                                                                className="font-bold text-xs cursor-pointer text-primary focus:text-primary"
                                                                onClick={() => handleOpenScoreModal(candidate)}
                                                            >
                                                                <Sparkles size={13} className="mr-2" /> Update AI Score
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                className="font-bold text-xs cursor-pointer"
                                                                onClick={() => handleOpenAddContact(candidate)}
                                                            >
                                                                <Users size={13} className="mr-2 text-primary" /> Add to Contact
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                className="font-bold text-xs text-destructive focus:text-destructive focus:bg-destructive/10 flex items-center cursor-pointer"
                                                                onClick={() => setCandidateToDelete(candidate)}
                                                            >
                                                                <Trash2 size={13} className="mr-2" /> Delete Candidate
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </ScrollArea>
            </div>


            {/* Empty State */}
            {!isLoading && filteredTalents.length === 0 && (
                <div className="flex flex-col items-center justify-center py-24 bg-card/10 rounded-md border border-border/10 border-dashed">
                    <Users className="w-16 h-16 text-muted-foreground opacity-20 mb-4" />
                    <h3 className="text-lg font-bold opacity-60">No candidates found</h3>
                    <p className="text-xs text-muted-foreground opacity-40">Try adjusting your filters or add a new candidate.</p>
                    <Button
                        onClick={() => setIsAddModalOpen(true)}
                        variant="ghost"
                        className="mt-6 text-[10px] text-primary"
                    >
                        <UserPlus className="w-4 h-4 mr-2" />
                        Add First Candidate
                    </Button>
                </div>
            )}

            <CandidateModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                workspaceId={workspaceId}
                onSuccess={() => mutate()}
            />

            <CandidateDetailsModal
                isOpen={isDetailsModalOpen}
                onClose={() => setIsDetailsModalOpen(false)}
                candidateId={selectedCandidateId}
                workspaceId={workspaceId}
                onDeleteSuccess={() => {
                    setIsDetailsModalOpen(false);
                    setSelectedCandidateId(null);
                    mutate();
                }}
            />

            <AddContactModal
                isOpen={isAddContactModalOpen}
                onOpenChange={setIsAddContactModalOpen}
                candidate={candidateForContact}
                workspaceId={workspaceId}
            />

            {/* Update AI Score Modal */}
            <Dialog open={!!candidateForScore} onOpenChange={(open) => !open && !isSavingScore && !isAutoScoring && setCandidateForScore(null)}>
                <DialogContent className="sm:max-w-[480px] bg-card/95 backdrop-blur-2xl border-border/60 shadow-2xl p-6">
                    <DialogHeader className="space-y-1">
                        <div className="flex items-center justify-between">
                            <DialogTitle className="text-base font-bold flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-primary" /> Update AI Match Score
                            </DialogTitle>
                            <Badge variant="outline" className={`text-[10px] font-semibold border ${getScoreTierInfo(editScoreValue).color}`}>
                                {getScoreTierInfo(editScoreValue).label}
                            </Badge>
                        </div>
                        <DialogDescription className="text-xs text-muted-foreground">
                            Calibrate the candidate's ATS match score manually or run automated evaluation via FlowGenix AI.
                        </DialogDescription>
                    </DialogHeader>

                    {candidateForScore && (
                        <div className="space-y-5 py-3">
                            {/* Candidate Identity Brief */}
                            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/20 border border-border/40">
                                <Avatar className="h-10 w-10 border border-primary/20 shrink-0">
                                    <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                                        {getInitials(candidateForScore.name)}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="min-w-0 flex-1">
                                    <p className="text-xs font-bold text-foreground truncate">{candidateForScore.name}</p>
                                    <p className="text-[11px] text-muted-foreground truncate">{candidateForScore.role || candidateForScore.email}</p>
                                </div>
                                <div className="text-right shrink-0">
                                    <div className="text-xs text-muted-foreground font-medium">Current</div>
                                    <div className="text-xs font-bold text-primary">
                                        {candidateForScore.rawScore !== null ? `${candidateForScore.rawScore}%` : 'Not set'}
                                    </div>
                                </div>
                            </div>

                            {/* Score Display Card */}
                            <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20">
                                <div>
                                    <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">AI Evaluation</div>
                                    <div className="flex items-baseline gap-2 mt-0.5">
                                        <span className="text-3xl font-extrabold text-foreground">{editScoreValue}%</span>
                                        <span className="text-xs font-semibold text-primary">
                                            ({(editScoreValue / 20).toFixed(1)} / 5.0)
                                        </span>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-1">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        disabled={isAutoScoring || isSavingScore}
                                        onClick={handleAutoEvaluateScore}
                                        className="h-8 text-[11px] font-semibold gap-1.5 border-primary/30 hover:bg-primary/10 text-primary shadow-xs"
                                    >
                                        {isAutoScoring ? (
                                            <>
                                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                <span>Analyzing...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Zap className="w-3.5 h-3.5 fill-current" />
                                                <span>Auto-Score AI</span>
                                            </>
                                        )}
                                    </Button>
                                    <span className="text-[9px] text-muted-foreground opacity-70">Powered by FlowGenix</span>
                                </div>
                            </div>

                            {/* Slider & Input Controls */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between text-xs">
                                    <span className="font-semibold text-foreground">Score Rating</span>
                                    <div className="flex items-center gap-1.5">
                                        <Input
                                            type="number"
                                            min={0}
                                            max={100}
                                            value={editScoreValue}
                                            onChange={(e) => {
                                                const val = parseInt(e.target.value, 10);
                                                if (isNaN(val)) setEditScoreValue(0);
                                                else setEditScoreValue(Math.min(100, Math.max(0, val)));
                                            }}
                                            className="h-7 w-16 text-center font-bold text-xs"
                                        />
                                        <span className="text-xs text-muted-foreground font-semibold">%</span>
                                    </div>
                                </div>

                                <Slider
                                    value={[editScoreValue]}
                                    min={0}
                                    max={100}
                                    step={1}
                                    onValueChange={(vals) => setEditScoreValue(vals[0])}
                                    className="py-2"
                                />

                                <div className="flex justify-between text-[10px] text-muted-foreground px-0.5">
                                    <span>0% (0.0)</span>
                                    <span>25% (1.3)</span>
                                    <span>50% (2.5)</span>
                                    <span>75% (3.8)</span>
                                    <span>100% (5.0)</span>
                                </div>
                            </div>

                            {/* Preset Buttons */}
                            <div className="space-y-1.5">
                                <div className="text-[11px] font-medium text-muted-foreground">Quick Presets</div>
                                <div className="grid grid-cols-5 gap-1.5">
                                    {[50, 65, 75, 85, 95].map((preset) => (
                                        <Button
                                            key={preset}
                                            type="button"
                                            variant={editScoreValue === preset ? "default" : "outline"}
                                            size="sm"
                                            onClick={() => setEditScoreValue(preset)}
                                            className="h-7 text-[10px] font-semibold border-border/50"
                                        >
                                            {preset}%
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    <DialogFooter className="gap-2 sm:gap-0 mt-2">
                        <Button
                            variant="outline"
                            onClick={() => setCandidateForScore(null)}
                            disabled={isSavingScore || isAutoScoring}
                            className="rounded-md font-semibold text-xs h-9"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSaveScore}
                            disabled={isSavingScore || isAutoScoring}
                            className="rounded-md font-semibold text-xs h-9 bg-primary hover:bg-primary/90 text-primary-foreground gap-1.5"
                        >
                            {isSavingScore ? (
                                <>
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    <span>Saving Score...</span>
                                </>
                            ) : (
                                <>
                                    <Check className="w-3.5 h-3.5" />
                                    <span>Save Score</span>
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Batch Update AI Score Modal for Unrated (N/A) Candidates */}
            <Dialog open={isBatchScoreModalOpen} onOpenChange={(open) => !open && !isBatchProcessing && setIsBatchScoreModalOpen(false)}>
                <DialogContent className="sm:max-w-[540px] bg-card/95 backdrop-blur-2xl border-border/60 shadow-2xl p-6">
                    <DialogHeader className="space-y-1">
                        <div className="flex items-center justify-between">
                            <DialogTitle className="text-base font-bold flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-amber-500" /> Update AI Score for All N/A Candidates
                            </DialogTitle>
                            <Badge variant="outline" className="text-[10px] font-bold border-amber-500/30 text-amber-500 bg-amber-500/10">
                                {unratedCount} Unrated
                            </Badge>
                        </div>
                        <DialogDescription className="text-xs text-muted-foreground">
                            Evaluate all candidates showing N/A with FlowGenix AI or batch calibrate a baseline score.
                        </DialogDescription>
                    </DialogHeader>

                    {/* Mode Selector Tabs */}
                    <div className="grid grid-cols-2 gap-2 p-1 bg-muted/30 rounded-lg border border-border/40 mt-1">
                        <button
                            type="button"
                            onClick={() => setBatchMode('ai')}
                            disabled={isBatchProcessing}
                            className={`flex items-center justify-center gap-2 py-2 px-3 rounded-md text-xs font-bold transition-all ${batchMode === 'ai'
                                ? 'bg-primary text-primary-foreground shadow-sm'
                                : 'text-muted-foreground hover:text-foreground'
                                }`}
                        >
                            <Zap size={13} className={batchMode === 'ai' ? 'fill-current' : ''} />
                            <span>FlowGenix AI Auto-Score</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setBatchMode('manual')}
                            disabled={isBatchProcessing}
                            className={`flex items-center justify-center gap-2 py-2 px-3 rounded-md text-xs font-bold transition-all ${batchMode === 'manual'
                                ? 'bg-primary text-primary-foreground shadow-sm'
                                : 'text-muted-foreground hover:text-foreground'
                                }`}
                        >
                            <SlidersHorizontal size={13} />
                            <span>Batch Calibrate Score</span>
                        </button>
                    </div>

                    <div className="space-y-4 py-2">
                        {/* List of unrated candidates target summary */}
                        <div className="p-3 rounded-lg bg-muted/20 border border-border/40 space-y-2">
                            <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
                                <span>Target Candidates ({unratedCandidates.length})</span>
                                <span className="text-[10px] text-amber-500 font-bold">Currently showing N/A</span>
                            </div>
                            <div className="max-h-[110px] overflow-y-auto space-y-1.5 pr-1">
                                {unratedCandidates.map((c) => (
                                    <div key={c.id} className="flex items-center justify-between text-[11px] p-1.5 rounded bg-background/50 border border-border/30">
                                        <div className="flex items-center gap-2 truncate">
                                            <Avatar className="h-5 w-5 border border-primary/20 shrink-0">
                                                <AvatarFallback className="text-[9px] bg-primary/10 text-primary">
                                                    {getInitials(c.name)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <span className="font-semibold text-foreground truncate">{c.name}</span>
                                            <span className="text-muted-foreground text-[10px] truncate">({c.role || c.email})</span>
                                        </div>
                                        <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4 border-amber-500/30 text-amber-500 bg-amber-500/10 shrink-0 font-bold">
                                            N/A
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Mode 1: AI Auto-Evaluation details */}
                        {batchMode === 'ai' && (
                            <div className="p-4 rounded-xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20 space-y-3">
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-primary/20 text-primary flex items-center justify-center shrink-0 mt-0.5">
                                        <Sparkles size={16} />
                                    </div>
                                    <div className="space-y-1">
                                        <h4 className="text-xs font-bold text-foreground">Multi-Model ATS Semantic Evaluation</h4>
                                        <p className="text-[11px] text-muted-foreground leading-relaxed">
                                            FlowGenix AI analyzes each candidate's experience, skills, and resume against target requisition requirements to generate an objective match score (0–100%) and 5-point rating.
                                        </p>
                                    </div>
                                </div>

                                {isBatchProcessing && (
                                    <div className="space-y-2 pt-2 border-t border-border/30">
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="font-semibold text-foreground flex items-center gap-2">
                                                <Loader2 size={13} className="animate-spin text-primary" />
                                                Evaluating: <span className="text-primary font-bold">{batchProgress.candidateName}</span>
                                            </span>
                                            <span className="font-bold text-muted-foreground">
                                                {batchProgress.current} / {batchProgress.total}
                                            </span>
                                        </div>
                                        <Progress value={(batchProgress.current / Math.max(1, batchProgress.total)) * 100} className="h-2" />
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Mode 2: Manual Calibration controls */}
                        {batchMode === 'manual' && (
                            <div className="space-y-3 p-4 rounded-xl bg-muted/20 border border-border/40">
                                <div className="flex items-center justify-between text-xs">
                                    <div>
                                        <div className="font-bold text-foreground">Uniform Match Score</div>
                                        <div className="text-[10px] text-muted-foreground">Assign this baseline score to all {unratedCandidates.length} unrated candidates</div>
                                    </div>
                                    <div className="flex items-baseline gap-1 text-right">
                                        <span className="text-2xl font-extrabold text-foreground">{batchScoreValue}%</span>
                                        <span className="text-xs text-primary font-bold">({(batchScoreValue / 20).toFixed(1)} / 5.0)</span>
                                    </div>
                                </div>

                                <Slider
                                    value={[batchScoreValue]}
                                    min={0}
                                    max={100}
                                    step={1}
                                    disabled={isBatchProcessing}
                                    onValueChange={(vals) => setBatchScoreValue(vals[0])}
                                    className="py-2"
                                />

                                <div className="space-y-1">
                                    <div className="text-[10px] font-semibold text-muted-foreground">Quick Presets</div>
                                    <div className="grid grid-cols-5 gap-1.5">
                                        {[50, 65, 75, 85, 95].map((preset) => (
                                            <Button
                                                key={preset}
                                                type="button"
                                                variant={batchScoreValue === preset ? "default" : "outline"}
                                                size="sm"
                                                disabled={isBatchProcessing}
                                                onClick={() => setBatchScoreValue(preset)}
                                                className="h-7 text-[10px] font-bold border-border/50"
                                            >
                                                {preset}%
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <DialogFooter className="gap-2 sm:gap-0 mt-2">
                        <Button
                            variant="outline"
                            onClick={() => setIsBatchScoreModalOpen(false)}
                            disabled={isBatchProcessing}
                            className="rounded-md font-semibold text-xs h-9"
                        >
                            Cancel
                        </Button>
                        {batchMode === 'ai' ? (
                            <Button
                                onClick={handleRunBatchAiEvaluation}
                                disabled={isBatchProcessing || unratedCandidates.length === 0}
                                className="rounded-md font-bold text-xs h-9 bg-primary hover:bg-primary/90 text-primary-foreground gap-1.5 shadow-sm shadow-primary/20"
                            >
                                {isBatchProcessing ? (
                                    <>
                                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                        <span>Evaluating with AI ({batchProgress.current}/{batchProgress.total})...</span>
                                    </>
                                ) : (
                                    <>
                                        <Zap className="w-3.5 h-3.5 fill-current" />
                                        <span>Auto-Score All ({unratedCandidates.length})</span>
                                    </>
                                )}
                            </Button>
                        ) : (
                            <Button
                                onClick={handleRunBatchManualCalibration}
                                disabled={isBatchProcessing || unratedCandidates.length === 0}
                                className="rounded-md font-bold text-xs h-9 bg-primary hover:bg-primary/90 text-primary-foreground gap-1.5 shadow-sm shadow-primary/20"
                            >
                                {isBatchProcessing ? (
                                    <>
                                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                        <span>Applying Scores...</span>
                                    </>
                                ) : (
                                    <>
                                        <CheckCheck className="w-3.5 h-3.5" />
                                        <span>Apply {batchScoreValue}% to All ({unratedCandidates.length})</span>
                                    </>
                                )}
                            </Button>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Candidate Confirmation Modal */}
            <Dialog open={!!candidateToDelete} onOpenChange={(open) => !open && !isDeleting && setCandidateToDelete(null)}>
                <DialogContent className="sm:max-w-[425px] bg-card/95 backdrop-blur-2xl border-destructive/20 shadow-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-lg font-bold text-destructive flex items-center gap-2">
                            <Trash2 className="w-5 h-5" /> Delete Candidate
                        </DialogTitle>
                        <DialogDescription className="text-xs font-medium text-muted-foreground mt-2">
                            Are you sure you want to delete <span className="font-bold text-foreground">{candidateToDelete?.name}</span>?
                            This will permanently remove their application records, scorecards, and notes. This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2 sm:gap-0 mt-4">
                        <Button
                            variant="outline"
                            onClick={() => setCandidateToDelete(null)}
                            disabled={isDeleting}
                            className="rounded-md font-bold"
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleConfirmDelete}
                            disabled={isDeleting}
                            className="rounded-md font-bold"
                        >
                            {isDeleting ? (
                                <span className="flex items-center gap-2">
                                    <Loader2 className="w-4 h-4 animate-spin" /> Deleting...
                                </span>
                            ) : (
                                "Delete Candidate"
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}