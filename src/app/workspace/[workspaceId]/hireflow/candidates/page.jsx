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
    Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
import { getCandidatesAction, deleteCandidateAction, aiParseResumeAction } from '../_actions/candidate-actions';
import { getDepartmentsAction } from '../departments/_actions/department-actions';
import { toast } from 'sonner';

import useSWR from 'swr';

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
    const [selectedCandidateId, setSelectedCandidateId] = useState(null);
    const [candidateToDelete, setCandidateToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [parsingCandidateId, setParsingCandidateId] = useState(null);

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
            score: c.aiMatchScore ? (c.aiMatchScore / 20).toFixed(1) : "N/A",
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

        return matchesSearch && matchesDepartment && matchesStatus;
    });

    const activeFilterCount = (selectedDepartment !== 'all' ? 1 : 0) +
        (selectedStatus !== 'all' ? 1 : 0) +
        (searchQuery.trim() ? 1 : 0);

    const activeDepartment = departments?.find(d => d.id === selectedDepartment);

    return (
        <div className="flex flex-col gap-3.5 p-4 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-0.5">
                    <h1 className="text-xl font-bold tracking-tight">Talent Database</h1>
                    <p className="text-xs text-muted-foreground font-medium">Manage, evaluate, and discover candidates across all job positions.</p>
                </div>
                <div className="flex items-center gap-2">
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
            <div className="bg-card/40 backdrop-blur-xl border border-border/50 rounded-xl p-2 shadow-xs space-y-2">
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

                        {/* Reset Filters Button */}
                        {activeFilterCount > 0 && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                    setSelectedDepartment('all');
                                    setSelectedStatus('all');
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
                            <TableHeader className="bg-muted/50">
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
                                            <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-primary/10 text-primary text-[10px] italic">
                                                <Sparkles size={10} /> {candidate.score}
                                            </div>
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
                                                            className="font-bold text-xs cursor-pointer"
                                                            onClick={() => {
                                                                setSelectedCandidateId(candidate.id);
                                                                setIsDetailsModalOpen(true);
                                                            }}
                                                        >
                                                            <Users size={13} className="mr-2" /> Add to Contact
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
                        className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
                    >
                        {filteredTalents.map((candidate, idx) => (
                            <motion.div
                                key={candidate.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.02 }}
                            >
                                <Card className="border-border/40 bg-card/30 backdrop-blur-xl rounded-md overflow-hidden shadow-2xl shadow-black/5 hover:border-primary/20 transition-all group cursor-default h-full flex flex-col">
                                    <CardHeader className="p-6 pb-2 flex flex-row items-start justify-between space-y-0">
                                        <div className="flex items-center gap-4">
                                            <Avatar className="h-14 w-14 border-2 border-primary/20 shadow-lg">
                                                <AvatarFallback className="bg-primary/5 text-primary text-lg">
                                                    {getInitials(candidate.name)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <h3 className="text-lg group-hover:text-primary transition-colors">{candidate.name}</h3>
                                                <div className="flex items-center gap-1.5 mt-0.5">
                                                    <p className="text-[10px] font-bold text-muted-foreground opacity-70">{candidate.role}</p>
                                                    {candidate.departmentName && (
                                                        <>
                                                            <span className="w-1 h-1 rounded-full bg-border" />
                                                            <span className="text-[10px] text-primary font-medium">{candidate.departmentName}</span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-1">
                                            <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-primary/10 text-primary text-[10px] italic">
                                                <Sparkles size={10} /> {candidate.score}
                                            </div>
                                            <Badge variant="outline" className={`${getStageBadgeStyle(candidate.status)} text-[9px] font-bold uppercase tracking-wider`}>
                                                {candidate.status}
                                            </Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="p-6 pt-4 flex-1 flex flex-col gap-6">
                                        <div className="flex items-center justify-between text-[11px] font-bold text-muted-foreground/60">
                                            <div className="flex items-center gap-1.5">
                                                <MapPin size={12} /> {candidate.location}
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <Clock size={12} /> {candidate.applied}
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap gap-2">
                                            {candidate.tags.map((tag, i) => (
                                                <Badge key={i} variant="outline" className="h-7 rounded-md border-border/40 bg-muted/10 font-bold px-2 text-[10px] opacity-60">
                                                    {tag}
                                                </Badge>
                                            ))}
                                        </div>

                                        <div className="mt-auto pt-4 flex items-center gap-2">
                                            <Button
                                                variant="outline"
                                                className="flex-1 rounded-md text-[9px] border-border/40 hover:bg-primary/5 hover:border-primary/20 transition-all"
                                                onClick={() => {
                                                    setSelectedCandidateId(candidate.id);
                                                    setIsDetailsModalOpen(true);
                                                }}
                                            >
                                                View Profile <ExternalLink size={12} className="ml-2 opacity-50" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="w-10 rounded-md opacity-40 hover:opacity-100">
                                                <Mail size={16} />
                                            </Button>
                                            {candidate.resumeUrl && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="w-10 rounded-md opacity-40 hover:opacity-100 hover:text-emerald-500"
                                                    onClick={() => window.open(candidate.resumeUrl, '_blank')}
                                                >
                                                    <FileText size={16} />
                                                </Button>
                                            )}
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="w-10 rounded-md opacity-40 hover:opacity-100">
                                                        <MoreHorizontal size={16} />
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