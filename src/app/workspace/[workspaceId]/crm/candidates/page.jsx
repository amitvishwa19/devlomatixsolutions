'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    UserCheck,
    Search,
    Filter,
    Phone,
    Mail,
    MessageCircle,
    Calendar,
    Briefcase,
    FileText,
    ExternalLink,
    Clock,
    DollarSign,
    Sparkles,
    RefreshCw,
    TrendingUp,
    ChevronRight,
    Building2,
    CheckCircle2,
    XCircle,
    AlertCircle,
    UserPlus,
    Loader2
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from 'sonner';

import { getCrmCandidatesAction } from '../_actions/candidate-query-actions';
import { convertCandidateToLeadAction } from '../_actions/crm-bridge-actions';
import CrmWhatsAppOutreachSheet from '../_components/CrmWhatsAppOutreachSheet';

const STAGE_CONFIG = {
    APPLIED: { label: 'Applied', color: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
    SCREENING: { label: 'Screening', color: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
    INTERVIEW: { label: 'Interview', color: 'bg-purple-500/10 text-purple-600 border-purple-500/30' },
    OFFER: { label: 'Offer', color: 'bg-indigo-500/10 text-indigo-600 border-indigo-500/30' },
    HIRED: { label: 'Hired', color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30' },
    REJECTED: { label: 'Rejected', color: 'bg-rose-500/10 text-rose-600 border-rose-500/30' },
};

export default function CrmCandidatesPage() {
    const params = useParams();
    const router = useRouter();
    const workspaceId = params?.workspaceId;

    const [candidates, setCandidates] = useState([]);
    const [metrics, setMetrics] = useState({
        total: 0,
        applied: 0,
        screening: 0,
        interview: 0,
        offer: 0,
        hired: 0,
        rejected: 0,
        withPhoneCount: 0
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Filter states
    const [searchQuery, setSearchQuery] = useState('');
    const [stageFilter, setStageFilter] = useState('ALL');

    // WhatsApp Outreach Sheet
    const [isWaSheetOpen, setIsWaSheetOpen] = useState(false);
    const [selectedRecipient, setSelectedRecipient] = useState(null);

    // Converting state
    const [convertingId, setConvertingId] = useState(null);

    const fetchCandidates = async (showToast = false) => {
        if (!workspaceId) return;

        if (showToast) setIsRefreshing(true);
        else setIsLoading(true);

        try {
            const res = await getCrmCandidatesAction(workspaceId, {
                stage: stageFilter,
                search: searchQuery
            });

            if (res.success && res.data) {
                setCandidates(res.data.candidates || []);
                setMetrics(res.data.metrics || {});
                if (showToast) toast.success("Candidates list refreshed");
            } else {
                toast.error(res.error || "Failed to load candidates");
            }
        } catch (err) {
            console.error("Candidates fetch error:", err);
            toast.error("Failed to fetch candidates");
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    };

    useEffect(() => {
        fetchCandidates();
    }, [workspaceId, stageFilter]);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        fetchCandidates();
    };

    const handleOpenWhatsApp = (candidate) => {
        setSelectedRecipient({
            name: candidate.name,
            phone: candidate.phone,
            email: candidate.email,
            jobTitle: candidate.jobTitle,
            candidateId: candidate.id
        });
        setIsWaSheetOpen(true);
    };

    const handleConvertToDeal = async (candidate) => {
        setConvertingId(candidate.id);
        try {
            const res = await convertCandidateToLeadAction(workspaceId, candidate.id, {
                title: `Placement: ${candidate.name} (${candidate.jobTitle})`,
                createDeal: true
            });

            if (res.success) {
                toast.success(`Candidate ${candidate.name} bridged into CRM Deals!`);
                router.push(`/workspace/${workspaceId}/crm/pipeline`);
            } else {
                toast.error(res.error || "Failed to convert candidate");
            }
        } catch (err) {
            console.error("Convert candidate error:", err);
            toast.error("An unexpected error occurred");
        } finally {
            setConvertingId(null);
        }
    };

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-16">
            {/* Top Header Banner */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/80 pb-5">
                <div>
                    <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
                            <UserCheck className="w-5 h-5" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                                Applied Candidates
                                <Badge variant="outline" className="text-xs bg-indigo-500/10 text-indigo-600 border-indigo-500/20 font-medium">
                                    HireFlow ATS Stream
                                </Badge>
                            </h1>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                Review applicant profiles, notice periods, salary expectations, notes, and trigger WhatsApp outreach directly.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2.5">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => fetchCandidates(true)}
                        disabled={isRefreshing || isLoading}
                        className="h-8 text-xs gap-1.5"
                    >
                        <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                        <span>Refresh</span>
                    </Button>

                    <Link href={`/workspace/${workspaceId}/hireflow/candidates`}>
                        <Button
                            variant="secondary"
                            size="sm"
                            className="h-8 text-xs gap-1.5 shadow-xs font-semibold"
                            title="Open full HireFlow ATS module in a separate view"
                        >
                            <span>Open HireFlow ATS</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Telemetry Metric Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3.5">
                <div className="p-3.5 rounded-xl bg-card border border-border shadow-xs">
                    <span className="text-xs font-medium text-muted-foreground">Total Applicants</span>
                    <div className="text-2xl font-black text-foreground mt-1">{metrics.total || 0}</div>
                </div>
                <div className="p-3.5 rounded-xl bg-card border border-border shadow-xs">
                    <span className="text-xs font-medium text-muted-foreground">In Screening</span>
                    <div className="text-2xl font-black text-amber-600 mt-1">{metrics.screening || 0}</div>
                </div>
                <div className="p-3.5 rounded-xl bg-card border border-border shadow-xs">
                    <span className="text-xs font-medium text-muted-foreground">In Interview</span>
                    <div className="text-2xl font-black text-purple-600 mt-1">{metrics.interview || 0}</div>
                </div>
                <div className="p-3.5 rounded-xl bg-card border border-border shadow-xs">
                    <span className="text-xs font-medium text-muted-foreground">Offers Extended</span>
                    <div className="text-2xl font-black text-indigo-600 mt-1">{metrics.offer || 0}</div>
                </div>
                <div className="p-3.5 rounded-xl bg-card border border-border shadow-xs">
                    <span className="text-xs font-medium text-muted-foreground">Hired Candidates</span>
                    <div className="text-2xl font-black text-emerald-600 mt-1">{metrics.hired || 0}</div>
                </div>
                <div className="p-3.5 rounded-xl bg-card border border-border shadow-xs">
                    <span className="text-xs font-medium text-muted-foreground">WhatsApp Ready</span>
                    <div className="text-2xl font-black text-blue-600 mt-1">{metrics.withPhoneCount || 0}</div>
                </div>
            </div>

            {/* Filter Bar & Stage Selectors */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-card p-3 rounded-2xl border border-border">
                {/* Stage Filters */}
                <div className="flex items-center overflow-x-auto gap-1.5 pb-1 sm:pb-0">
                    {['ALL', 'APPLIED', 'SCREENING', 'INTERVIEW', 'OFFER', 'HIRED', 'REJECTED'].map((stg) => {
                        const active = stageFilter === stg;
                        return (
                            <button
                                key={stg}
                                onClick={() => setStageFilter(stg)}
                                className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-all ${
                                    active
                                        ? 'bg-primary text-primary-foreground shadow-xs'
                                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                }`}
                            >
                                {stg === 'ALL' ? 'All Stages' : STAGE_CONFIG[stg]?.label || stg}
                            </button>
                        );
                    })}
                </div>

                {/* Search Bar */}
                <form onSubmit={handleSearchSubmit} className="relative sm:w-72">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search candidate, role, skills..."
                        className="h-8 pl-8 text-xs bg-muted/40"
                    />
                </form>
            </div>

            {/* Candidates Feed */}
            {isLoading ? (
                <div className="p-16 text-center text-muted-foreground flex flex-col items-center justify-center gap-3 bg-card border border-border rounded-xl">
                    <Loader2 className="w-7 h-7 animate-spin text-primary" />
                    <p className="text-xs font-medium">Loading candidate applications from HireFlow...</p>
                </div>
            ) : candidates.length === 0 ? (
                <div className="p-16 text-center bg-card border border-dashed border-border rounded-2xl flex flex-col items-center justify-center">
                    <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center mb-3">
                        <UserCheck className="w-7 h-7" />
                    </div>
                    <h3 className="text-base font-bold text-foreground">No Candidates Found</h3>
                    <p className="text-xs text-muted-foreground max-w-sm mt-1 mb-4">
                        {searchQuery || stageFilter !== 'ALL'
                            ? "No candidates match your search or stage criteria. Try clearing the filter."
                            : "No candidates have applied to jobs in this workspace yet. When candidates apply via HireFlow, they will automatically appear here."}
                    </p>
                    <Link href={`/workspace/${workspaceId}/hireflow/jobs`}>
                        <Button size="sm" variant="outline" className="text-xs font-semibold gap-1.5">
                            <Briefcase className="w-3.5 h-3.5" />
                            <span>Manage Jobs & Postings</span>
                        </Button>
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {candidates.map((candidate) => {
                        const stageInfo = STAGE_CONFIG[candidate.stage] || STAGE_CONFIG.APPLIED;
                        const cleanPhone = candidate.phone ? candidate.phone.replace(/[^0-9]/g, '') : '';

                        return (
                            <div
                                key={candidate.id}
                                className="p-4 sm:p-5 rounded-2xl bg-card border border-border hover:border-primary/40 transition-all duration-200 shadow-xs hover:shadow-md flex flex-col justify-between space-y-4"
                            >
                                <div className="space-y-3">
                                    {/* Top Row: Name, Stage & Applied Date */}
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500/20 to-blue-500/20 border border-indigo-500/30 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                                                {candidate.name?.charAt(0)?.toUpperCase() || 'C'}
                                            </div>
                                            <div className="min-w-0">
                                                <h3 className="text-sm font-bold text-foreground truncate">
                                                    {candidate.name}
                                                </h3>
                                                <p className="text-xs text-primary font-medium truncate flex items-center gap-1.5 mt-0.5">
                                                    <Briefcase className="w-3 h-3 text-muted-foreground" />
                                                    <span>{candidate.jobTitle}</span>
                                                    <span className="text-muted-foreground text-[10px]">({candidate.jobCategory})</span>
                                                </p>
                                            </div>
                                        </div>

                                        <Badge variant="outline" className={`text-[10px] font-semibold border ${stageInfo.color}`}>
                                            {stageInfo.label}
                                        </Badge>
                                    </div>

                                    {/* Contact Information Row */}
                                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground pt-0.5">
                                        {candidate.email && (
                                            <span className="flex items-center gap-1 truncate max-w-[200px]">
                                                <Mail className="w-3 h-3 text-muted-foreground" />
                                                {candidate.email}
                                            </span>
                                        )}
                                        {candidate.phone && (
                                            <span className="flex items-center gap-1 font-medium text-foreground">
                                                <Phone className="w-3 h-3 text-blue-500" />
                                                {candidate.phone}
                                            </span>
                                        )}
                                        {candidate.location && (
                                            <span className="text-muted-foreground">
                                                📍 {candidate.location}
                                            </span>
                                        )}
                                    </div>

                                    {/* Highlight Badges: Notice Period & Expected Salary */}
                                    <div className="flex flex-wrap items-center gap-2 pt-1">
                                        {candidate.noticePeriod ? (
                                            <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 text-[11px] font-semibold">
                                                <Clock className="w-3 h-3" />
                                                <span>Notice: {candidate.noticePeriod}</span>
                                            </div>
                                        ) : (
                                            <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-muted text-muted-foreground text-[11px]">
                                                <Clock className="w-3 h-3" />
                                                <span>Notice: Not specified</span>
                                            </div>
                                        )}

                                        {candidate.expectedSalary ? (
                                            <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-[11px] font-bold">
                                                <DollarSign className="w-3 h-3" />
                                                <span>Expected: {candidate.expectedSalary}</span>
                                            </div>
                                        ) : null}

                                        {candidate.currentSalary ? (
                                            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-muted/60 text-muted-foreground text-[10px]">
                                                <span>Current: {candidate.currentSalary}</span>
                                            </div>
                                        ) : null}

                                        {candidate.aiMatchScore ? (
                                            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold border border-indigo-500/20">
                                                <Sparkles className="w-3 h-3" />
                                                <span>AI Match: {candidate.aiMatchScore}%</span>
                                            </div>
                                        ) : null}
                                    </div>

                                    {/* Interview Notes / Feedback Snippet */}
                                    {candidate.recentNotes && candidate.recentNotes.length > 0 && (
                                        <div className="p-2.5 bg-muted/40 rounded-xl border border-border/60 text-[11px] text-foreground/80 leading-relaxed">
                                            <div className="font-semibold text-primary mb-1 flex items-center justify-between">
                                                <span>Latest Interview Note:</span>
                                                <span className="text-[10px] text-muted-foreground font-normal">
                                                    by {candidate.recentNotes[0]?.user?.displayName || 'Interviewer'}
                                                </span>
                                            </div>
                                            <p className="line-clamp-2 text-muted-foreground">
                                                {candidate.recentNotes[0]?.content || candidate.recentNotes[0]?.note}
                                            </p>
                                        </div>
                                    )}

                                    {/* Skills tags */}
                                    {candidate.skills && candidate.skills.length > 0 && (
                                        <div className="flex flex-wrap items-center gap-1 pt-1">
                                            {candidate.skills.slice(0, 4).map((sk, idx) => (
                                                <Badge key={idx} variant="secondary" className="text-[10px] py-0 px-1.5 font-normal">
                                                    {sk}
                                                </Badge>
                                            ))}
                                            {candidate.skills.length > 4 && (
                                                <span className="text-[10px] text-muted-foreground">
                                                    +{candidate.skills.length - 4} more
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Bottom Actions Bar */}
                                <div className="pt-3 border-t border-border flex flex-wrap items-center justify-between gap-2">
                                    <div className="flex items-center gap-1.5">
                                        {candidate.resumeUrl && (
                                            <a
                                                href={candidate.resumeUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-border bg-background hover:bg-muted text-xs font-semibold text-foreground transition-colors"
                                                title="View candidate CV / Resume"
                                            >
                                                <FileText className="w-3 h-3 text-blue-500" />
                                                <span>Resume</span>
                                            </a>
                                        )}

                                        {cleanPhone && (
                                            <a
                                                href={`tel:${cleanPhone}`}
                                                className="p-1.5 rounded-lg border border-border bg-background hover:bg-muted text-blue-600 transition-colors"
                                                title="Direct Phone Call"
                                            >
                                                <Phone className="w-3.5 h-3.5" />
                                            </a>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-1.5 ml-auto">
                                        {/* Convert to Deal Button */}
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleConvertToDeal(candidate)}
                                            disabled={convertingId === candidate.id}
                                            className="h-8 text-xs gap-1 font-semibold"
                                            title="Convert to CRM Placement Deal"
                                        >
                                            {convertingId === candidate.id ? (
                                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                            ) : (
                                                <TrendingUp className="w-3.5 h-3.5 text-indigo-500" />
                                            )}
                                            <span className="hidden sm:inline">To Deal</span>
                                        </Button>

                                        {/* Send WhatsApp Button (KonnectX Cloud Templates) */}
                                        <Button
                                            size="sm"
                                            onClick={() => handleOpenWhatsApp(candidate)}
                                            disabled={!candidate.phone}
                                            className="h-8 text-xs gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-xs"
                                            title={candidate.phone ? "Send WhatsApp using KonnectX templates" : "No phone number available"}
                                        >
                                            <MessageCircle className="w-3.5 h-3.5" />
                                            <span>WhatsApp</span>
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Reusable KonnectX WhatsApp Outreach Drawer */}
            <CrmWhatsAppOutreachSheet
                isOpen={isWaSheetOpen}
                onClose={() => setIsWaSheetOpen(false)}
                workspaceId={workspaceId}
                recipient={selectedRecipient}
                onSuccess={() => fetchCandidates()}
            />
        </div>
    );
}
