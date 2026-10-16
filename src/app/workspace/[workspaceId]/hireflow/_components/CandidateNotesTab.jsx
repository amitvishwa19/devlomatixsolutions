'use client';

import React, { useState } from 'react';
import {
    Send,
    User,
    Calendar,
    Briefcase,
    Clock,
    DollarSign,
    CheckCircle2,
    AlertCircle,
    Star,
    Lock,
    Sparkles,
    Shield,
    ThumbsUp,
    ThumbsDown,
    Building2,
    MapPin,
    FileText,
    HelpCircle,
    ChevronDown,
    Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { toast } from 'sonner';
import { createCandidateNoteAction } from '../_actions/candidate-actions';

const NOTICE_PERIOD_PRESETS = [
    'Immediate',
    '15 Days',
    '30 Days',
    '45 Days',
    '60 Days',
    '90 Days',
    'Serving Notice'
];

const RECOMMENDATION_OPTIONS = [
    { value: 'Strong Hire', label: 'Strong Hire', color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/40 hover:bg-emerald-500/25' },
    { value: 'Hire', label: 'Hire', color: 'bg-blue-500/15 text-blue-400 border-blue-500/40 hover:bg-blue-500/25' },
    { value: 'Hold', label: 'Hold / Borderline', color: 'bg-amber-500/15 text-amber-400 border-amber-500/40 hover:bg-amber-500/25' },
    { value: 'Reject', label: 'Reject', color: 'bg-rose-500/15 text-rose-400 border-rose-500/40 hover:bg-rose-500/25' }
];

const INTERVIEW_ROUNDS = [
    'Screening / HR Round',
    'Technical Round 1',
    'Technical Round 2',
    'System Design & Architecture',
    'Live Coding / Problem Solving',
    'Managerial & Cultural Fit',
    'Final / Executive Round',
    'Debrief / Follow-up'
];

const WORK_MODE_OPTIONS = ['Remote', 'Hybrid', 'On-site'];

export default function CandidateNotesTab({
    candidate,
    workspaceId,
    onNoteAdded,
    getInitials
}) {
    const [noteMode, setNoteMode] = useState('interview'); // 'interview' | 'quick'
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Interview specific state
    const [interviewRound, setInterviewRound] = useState('Technical Round 1');
    const [recommendation, setRecommendation] = useState('Hire');
    const [rating, setRating] = useState(4);
    const [noticePeriod, setNoticePeriod] = useState('');
    const [currentSalary, setCurrentSalary] = useState('');
    const [expectedSalary, setExpectedSalary] = useState('');
    const [salaryNegotiable, setSalaryNegotiable] = useState('Negotiable');
    const [totalExperience, setTotalExperience] = useState('');
    const [relevantExperience, setRelevantExperience] = useState('');
    const [workMode, setWorkMode] = useState('Hybrid');
    const [preferredLocation, setPreferredLocation] = useState('');
    const [strengths, setStrengths] = useState('');
    const [concerns, setConcerns] = useState('');
    const [detailedFeedback, setDetailedFeedback] = useState('');
    const [isPrivate, setIsPrivate] = useState(false);

    // Quick note state
    const [quickNoteText, setQuickNoteText] = useState('');

    const resolveInitials = (name) => {
        if (typeof getInitials === 'function') return getInitials(name);
        if (!name) return 'TM';
        const parts = name.trim().split(/\s+/).filter(Boolean);
        if (parts.length === 0) return 'TM';
        if (parts.length === 1) return parts[0][0].toUpperCase();
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    };

    const handleSelectPresetNotice = (preset) => {
        if (preset === 'Serving Notice') {
            setNoticePeriod('Serving Notice (LWD: )');
        } else {
            setNoticePeriod(preset);
        }
    };

    const resetForm = () => {
        setDetailedFeedback('');
        setQuickNoteText('');
        setStrengths('');
        setConcerns('');
        // Keep noticePeriod/salary if already filled or clear
    };

    const handlePostNote = async () => {
        const candidateId = candidate?.id;
        const applicationId = candidate?.applications?.[0]?.id;

        if (!candidateId) {
            toast.error('Invalid candidate');
            return;
        }

        if (noteMode === 'quick') {
            if (!quickNoteText.trim()) {
                toast.error('Please enter a note');
                return;
            }

            try {
                setIsSubmitting(true);
                const res = await createCandidateNoteAction(workspaceId, {
                    candidateId,
                    applicationId,
                    text: quickNoteText.trim(),
                    isPrivate
                });

                if (!res.success) throw new Error(res.error);
                toast.success('Quick note posted!');
                setQuickNoteText('');
                if (onNoteAdded) onNoteAdded();
            } catch (err) {
                toast.error(err.message || 'Failed to post note');
            } finally {
                setIsSubmitting(false);
            }
            return;
        }

        // Interview Evaluation Mode
        if (!detailedFeedback.trim() && !noticePeriod && !expectedSalary && !strengths && !concerns) {
            toast.error('Please provide interview feedback or fill key interview fields');
            return;
        }

        const metadata = {
            type: 'interview_debrief',
            interviewRound,
            recommendation,
            rating,
            noticePeriod: noticePeriod.trim(),
            currentSalary: currentSalary.trim(),
            expectedSalary: expectedSalary.trim(),
            salaryNegotiable,
            totalExperience: totalExperience.trim(),
            relevantExperience: relevantExperience.trim(),
            workMode,
            preferredLocation: preferredLocation.trim(),
            strengths: strengths.trim(),
            concerns: concerns.trim(),
            submittedAt: new Date().toISOString()
        };

        // Construct readable summary for fallback or text representation
        let textSummary = detailedFeedback.trim();
        if (!textSummary) {
            textSummary = `[${interviewRound.toUpperCase()} - ${recommendation.toUpperCase()}] Notice: ${noticePeriod || 'N/A'}, Expected CTC: ${expectedSalary || 'N/A'}`;
        }

        try {
            setIsSubmitting(true);
            const res = await createCandidateNoteAction(workspaceId, {
                candidateId,
                applicationId,
                text: textSummary,
                isPrivate,
                metadata
            });

            if (!res.success) throw new Error(res.error);
            toast.success('Interview evaluation note posted!');
            resetForm();
            if (onNoteAdded) onNoteAdded();
        } catch (err) {
            toast.error(err.message || 'Failed to post note');
        } finally {
            setIsSubmitting(false);
        }
    };

    const notesList = candidate?.notes || [];

    const getRecBadgeColor = (rec) => {
        switch (rec) {
            case 'Strong Hire':
                return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
            case 'Hire':
                return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
            case 'Hold':
                return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
            case 'Reject':
                return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
            default:
                return 'bg-muted/40 text-muted-foreground border-border/20';
        }
    };

    return (
        <Card className="border-border/40 bg-card/30 backdrop-blur-xl rounded-md overflow-hidden shadow-2xl shadow-black/5">
            <CardContent className="p-6 md:p-8 space-y-8">
                {/* Header & Mode Switcher */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/10">
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="text-base md:text-lg font-bold tracking-tight">Interviewer Notes & Evaluation</h3>
                            <Badge variant="outline" className="text-[10px] font-semibold bg-primary/10 text-primary border-primary/20">
                                {notesList.length} {notesList.length === 1 ? 'Note' : 'Notes'}
                            </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            Record interview feedback, notice period, compensation expectations, and hiring decisions.
                        </p>
                    </div>

                    <div className="flex items-center gap-1.5 p-1 rounded-lg bg-muted/40 border border-border/20 self-start sm:self-auto">
                        <button
                            type="button"
                            onClick={() => setNoteMode('interview')}
                            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 ${
                                noteMode === 'interview'
                                    ? 'bg-primary text-primary-foreground shadow-sm'
                                    : 'text-muted-foreground hover:text-foreground'
                            }`}
                        >
                            <Sparkles size={13} />
                            Interview Evaluation
                        </button>
                        <button
                            type="button"
                            onClick={() => setNoteMode('quick')}
                            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 ${
                                noteMode === 'quick'
                                    ? 'bg-primary text-primary-foreground shadow-sm'
                                    : 'text-muted-foreground hover:text-foreground'
                            }`}
                        >
                            <FileText size={13} />
                            Quick Note
                        </button>
                    </div>
                </div>

                {/* Note Form Section */}
                {noteMode === 'interview' ? (
                    <div className="space-y-6 p-5 md:p-6 rounded-xl bg-card/60 border border-border/40 shadow-sm animate-in fade-in duration-300">
                        {/* Section Header */}
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                                <Sparkles size={13} />
                                Interview Assessment Sheet
                            </span>
                            <div className="flex items-center gap-1.5">
                                <span className="text-[11px] font-medium text-muted-foreground mr-1">Overall Rating:</span>
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        onClick={() => setRating(star)}
                                        className="transition-transform hover:scale-125 focus:outline-none"
                                        title={`${star} Star${star > 1 ? 's' : ''}`}
                                    >
                                        <Star
                                            size={17}
                                            className={`${
                                                star <= rating
                                                    ? 'text-amber-400 fill-amber-400 drop-shadow-sm'
                                                    : 'text-muted-foreground/30 hover:text-amber-400/50'
                                            }`}
                                        />
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Row 1: Interview Round & Recommendation */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-foreground/80 flex items-center gap-1.5">
                                    <Calendar size={13} className="text-primary" />
                                    Interview Stage / Round
                                </label>
                                <Select value={interviewRound} onValueChange={setInterviewRound}>
                                    <SelectTrigger className="h-9 text-xs bg-muted/30 border-border/40">
                                        <SelectValue placeholder="Select interview round" />
                                    </SelectTrigger>
                                    <SelectContent className="text-xs">
                                        {INTERVIEW_ROUNDS.map((rnd) => (
                                            <SelectItem key={rnd} value={rnd}>
                                                {rnd}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-foreground/80 flex items-center gap-1.5">
                                    <CheckCircle2 size={13} className="text-primary" />
                                    Interviewer Recommendation
                                </label>
                                <div className="grid grid-cols-4 gap-1.5">
                                    {RECOMMENDATION_OPTIONS.map((rec) => (
                                        <button
                                            key={rec.value}
                                            type="button"
                                            onClick={() => setRecommendation(rec.value)}
                                            className={`h-9 rounded-md text-[11px] font-bold border transition-all flex items-center justify-center px-1 text-center ${
                                                recommendation === rec.value
                                                    ? `${rec.color} ring-2 ring-primary/40 shadow-sm scale-[1.02]`
                                                    : 'bg-muted/20 border-border/30 text-muted-foreground hover:bg-muted/40'
                                            }`}
                                        >
                                            {rec.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Row 2: Notice Period & Expected CTC (Crucial Interview Fields) */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                            {/* Notice Period */}
                            <div className="space-y-2 p-3.5 rounded-lg bg-muted/20 border border-border/30">
                                <div className="flex items-center justify-between">
                                    <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                                        <Clock size={13} className="text-cyan-400" />
                                        Notice Period
                                    </label>
                                    <span className="text-[10px] text-muted-foreground">Click quick preset or type</span>
                                </div>
                                <div className="flex flex-wrap gap-1">
                                    {NOTICE_PERIOD_PRESETS.map((preset) => (
                                        <button
                                            key={preset}
                                            type="button"
                                            onClick={() => handleSelectPresetNotice(preset)}
                                            className={`text-[10px] px-2 py-0.5 rounded font-medium transition-all ${
                                                noticePeriod === preset || (preset === 'Serving Notice' && noticePeriod.startsWith('Serving Notice'))
                                                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                                                    : 'bg-muted/40 text-muted-foreground hover:text-foreground hover:bg-muted/60'
                                            }`}
                                        >
                                            {preset}
                                        </button>
                                    ))}
                                </div>
                                <Input
                                    value={noticePeriod}
                                    onChange={(e) => setNoticePeriod(e.target.value)}
                                    placeholder="e.g. 30 Days (Serving notice, LWD: Nov 25)"
                                    className="h-8 text-xs bg-background/60 border-border/40 focus-visible:ring-1"
                                />
                            </div>

                            {/* Compensation: Expected & Current CTC */}
                            <div className="space-y-2 p-3.5 rounded-lg bg-muted/20 border border-border/30">
                                <div className="flex items-center justify-between">
                                    <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                                        <DollarSign size={13} className="text-emerald-400" />
                                        Compensation (CTC)
                                    </label>
                                    <div className="flex items-center gap-1">
                                        {['Negotiable', 'Fixed', 'Flexible'].map((mode) => (
                                            <button
                                                key={mode}
                                                type="button"
                                                onClick={() => setSalaryNegotiable(mode)}
                                                className={`text-[9px] px-1.5 py-0.5 rounded font-semibold transition-all ${
                                                    salaryNegotiable === mode
                                                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                                        : 'text-muted-foreground hover:text-foreground'
                                                }`}
                                            >
                                                {mode}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <span className="text-[10px] text-muted-foreground block mb-1">Expected Salary (CTC)</span>
                                        <Input
                                            value={expectedSalary}
                                            onChange={(e) => setExpectedSalary(e.target.value)}
                                            placeholder="e.g. ₹18 LPA or $120k"
                                            className="h-8 text-xs bg-background/60 border-border/40 focus-visible:ring-1"
                                        />
                                    </div>
                                    <div>
                                        <span className="text-[10px] text-muted-foreground block mb-1">Current Salary (CTC)</span>
                                        <Input
                                            value={currentSalary}
                                            onChange={(e) => setCurrentSalary(e.target.value)}
                                            placeholder="e.g. ₹12 LPA or $90k"
                                            className="h-8 text-xs bg-background/60 border-border/40 focus-visible:ring-1"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Row 3: Experience & Work Mode */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-foreground/80 flex items-center gap-1.5">
                                    <Briefcase size={13} className="text-primary" />
                                    Total Experience
                                </label>
                                <Input
                                    value={totalExperience}
                                    onChange={(e) => setTotalExperience(e.target.value)}
                                    placeholder="e.g. 5.5 Years"
                                    className="h-8 text-xs bg-muted/30 border-border/40"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-medium text-foreground/80 flex items-center gap-1.5">
                                    <Briefcase size={13} className="text-indigo-400" />
                                    Relevant Experience
                                </label>
                                <Input
                                    value={relevantExperience}
                                    onChange={(e) => setRelevantExperience(e.target.value)}
                                    placeholder="e.g. 3.5 Yrs (React / Node)"
                                    className="h-8 text-xs bg-muted/30 border-border/40"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-medium text-foreground/80 flex items-center gap-1.5">
                                    <Building2 size={13} className="text-primary" />
                                    Work Mode & Location
                                </label>
                                <div className="flex gap-1.5">
                                    <Select value={workMode} onValueChange={setWorkMode}>
                                        <SelectTrigger className="h-8 text-xs bg-muted/30 border-border/40 w-28">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="text-xs">
                                            {WORK_MODE_OPTIONS.map((mode) => (
                                                <SelectItem key={mode} value={mode}>
                                                    {mode}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <Input
                                        value={preferredLocation}
                                        onChange={(e) => setPreferredLocation(e.target.value)}
                                        placeholder="City / Relocate"
                                        className="h-8 text-xs bg-muted/30 border-border/40 flex-1"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Row 4: Key Strengths & Concerns */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-emerald-400 flex items-center gap-1.5">
                                    <ThumbsUp size={13} />
                                    Key Strengths / Standout Skills
                                </label>
                                <Input
                                    value={strengths}
                                    onChange={(e) => setStrengths(e.target.value)}
                                    placeholder="e.g. Strong problem solving, clean system design, proactive communication"
                                    className="h-8 text-xs bg-muted/30 border-border/40 placeholder:text-muted-foreground/40"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-medium text-rose-400 flex items-center gap-1.5">
                                    <AlertCircle size={13} />
                                    Concerns / Red Flags / Knowledge Gaps
                                </label>
                                <Input
                                    value={concerns}
                                    onChange={(e) => setConcerns(e.target.value)}
                                    placeholder="e.g. High notice period, limited AWS/DevOps depth, salary high vs budget"
                                    className="h-8 text-xs bg-muted/30 border-border/40 placeholder:text-muted-foreground/40"
                                />
                            </div>
                        </div>

                        {/* Detailed Interview Feedback */}
                        <div className="space-y-1.5 pt-1">
                            <label className="text-xs font-medium text-foreground/80 flex items-center justify-between">
                                <span>Detailed Interview Feedback & Question Answers</span>
                                <span className="text-[10px] text-muted-foreground">Markdown supported</span>
                            </label>
                            <Textarea
                                placeholder="Record interview questions asked, candidate responses, technical problem walkthrough, communication clarity, behavioral traits, and final remarks..."
                                className="min-h-[100px] rounded-md bg-muted/20 border-border/40 focus-visible:ring-1 focus-visible:ring-primary font-medium text-xs p-3 leading-relaxed"
                                value={detailedFeedback}
                                onChange={(e) => setDetailedFeedback(e.target.value)}
                            />
                        </div>

                        {/* Bottom Actions */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2 border-t border-border/20">
                            <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-muted-foreground">
                                <input
                                    type="checkbox"
                                    checked={isPrivate}
                                    onChange={(e) => setIsPrivate(e.target.checked)}
                                    className="rounded border-border/40 bg-muted/30 text-primary focus:ring-primary h-3.5 w-3.5"
                                />
                                <span className="flex items-center gap-1">
                                    <Lock size={11} />
                                    Private to hiring panel
                                </span>
                            </label>

                            <Button
                                onClick={handlePostNote}
                                disabled={isSubmitting}
                                className="h-9 px-6 rounded-md bg-primary text-xs font-semibold shadow-md shadow-primary/20 gap-1.5"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 size={13} className="animate-spin" />
                                        Submitting...
                                    </>
                                ) : (
                                    <>
                                        Save Interview Evaluation <Send size={12} />
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                ) : (
                    /* Quick Note Mode */
                    <div className="space-y-4 p-5 rounded-xl bg-card/60 border border-border/40 shadow-sm animate-in fade-in duration-300">
                        <Textarea
                            placeholder="Type a team note, quick update, or mention a colleague... (e.g. Spoke briefly over phone, scheduled Round 1 for tomorrow)"
                            className="min-h-[100px] rounded-md bg-muted/30 border-none focus-visible:ring-1 focus-visible:ring-primary font-medium text-xs p-4 leading-relaxed"
                            value={quickNoteText}
                            onChange={(e) => setQuickNoteText(e.target.value)}
                        />
                        <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-muted-foreground">
                                <input
                                    type="checkbox"
                                    checked={isPrivate}
                                    onChange={(e) => setIsPrivate(e.target.checked)}
                                    className="rounded border-border/40 bg-muted/30 text-primary focus:ring-primary h-3.5 w-3.5"
                                />
                                <span className="flex items-center gap-1">
                                    <Lock size={11} />
                                    Private note
                                </span>
                            </label>
                            <Button
                                onClick={handlePostNote}
                                disabled={isSubmitting || !quickNoteText.trim()}
                                className="h-9 px-6 rounded-md bg-primary text-xs shadow-md shadow-primary/20 gap-1.5"
                            >
                                {isSubmitting ? (
                                    <Loader2 size={13} className="animate-spin" />
                                ) : (
                                    <>
                                        Post Note <Send size={12} />
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                )}

                {/* Notes History List */}
                <div className="space-y-4 pt-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground opacity-60">
                        Historical Discussion & Evaluation Records
                    </h4>

                    <div className="space-y-4">
                        {notesList.map((note, i) => {
                            const meta = note.metadata || {};
                            const isInterviewEvaluation = meta.type === 'interview_debrief' || Boolean(meta.noticePeriod || meta.expectedSalary || meta.interviewRound);

                            return (
                                <div
                                    key={note.id || i}
                                    className={`p-5 rounded-xl border transition-all ${
                                        isInterviewEvaluation
                                            ? 'bg-card/70 border-border/40 shadow-sm hover:border-primary/30'
                                            : 'bg-muted/15 border-border/20'
                                    }`}
                                >
                                    {/* Author & Header */}
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-border/10">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="w-8 h-8 border border-border/30">
                                                <AvatarImage
                                                    src={note.user?.avatar || note.user?.image}
                                                    alt={note.user?.displayName || note.user?.username || note.user?.name || 'User'}
                                                />
                                                <AvatarFallback className="text-[10px] bg-primary/10 text-primary font-bold">
                                                    {resolveInitials(note.user?.displayName || note.user?.username || note.user?.name || note.author)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-bold text-foreground">
                                                        {note.user?.displayName || note.user?.username || note.user?.name || note.author || 'Team Member'}
                                                    </span>
                                                    {note.isPrivate && (
                                                        <Badge variant="outline" className="text-[9px] py-0 px-1.5 bg-muted/40 text-muted-foreground border-border/30 flex items-center gap-1">
                                                            <Lock size={9} /> Private
                                                        </Badge>
                                                    )}
                                                </div>
                                                <span className="text-[10px] text-muted-foreground">
                                                    {new Date(note.createdAt || Date.now()).toLocaleDateString(undefined, {
                                                        year: 'numeric',
                                                        month: 'short',
                                                        day: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Badges for interview notes */}
                                        {isInterviewEvaluation && (
                                            <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto">
                                                {meta.interviewRound && (
                                                    <Badge variant="outline" className="text-[10px] font-semibold bg-indigo-500/10 text-indigo-400 border-indigo-500/30">
                                                        {meta.interviewRound}
                                                    </Badge>
                                                )}
                                                {meta.recommendation && (
                                                    <Badge className={`text-[10px] font-bold border ${getRecBadgeColor(meta.recommendation)}`}>
                                                        {meta.recommendation}
                                                    </Badge>
                                                )}
                                                {meta.rating && (
                                                    <div className="flex items-center gap-0.5 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded text-[10px] font-bold text-amber-400">
                                                        <Star size={11} className="fill-amber-400 mr-0.5" />
                                                        {meta.rating}/5
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {/* Key Interview Highlights Pill Grid */}
                                    {isInterviewEvaluation && (meta.noticePeriod || meta.expectedSalary || meta.currentSalary || meta.totalExperience || meta.workMode) && (
                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 my-3 p-3 rounded-lg bg-muted/25 border border-border/20 text-xs">
                                            {meta.noticePeriod && (
                                                <div className="space-y-0.5">
                                                    <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground block flex items-center gap-1">
                                                        <Clock size={10} className="text-cyan-400" />
                                                        Notice Period
                                                    </span>
                                                    <p className="text-xs font-semibold text-cyan-400 truncate" title={meta.noticePeriod}>
                                                        {meta.noticePeriod}
                                                    </p>
                                                </div>
                                            )}

                                            {meta.expectedSalary && (
                                                <div className="space-y-0.5">
                                                    <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground block flex items-center gap-1">
                                                        <DollarSign size={10} className="text-emerald-400" />
                                                        Expected CTC
                                                    </span>
                                                    <p className="text-xs font-semibold text-emerald-400 truncate" title={`${meta.expectedSalary} (${meta.salaryNegotiable || ''})`}>
                                                        {meta.expectedSalary}
                                                    </p>
                                                </div>
                                            )}

                                            {meta.currentSalary && (
                                                <div className="space-y-0.5">
                                                    <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground block flex items-center gap-1">
                                                        <DollarSign size={10} className="text-muted-foreground" />
                                                        Current CTC
                                                    </span>
                                                    <p className="text-xs font-medium text-foreground/80 truncate" title={meta.currentSalary}>
                                                        {meta.currentSalary}
                                                    </p>
                                                </div>
                                            )}

                                            {meta.totalExperience && (
                                                <div className="space-y-0.5">
                                                    <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground block flex items-center gap-1">
                                                        <Briefcase size={10} className="text-primary" />
                                                        Experience
                                                    </span>
                                                    <p className="text-xs font-medium text-foreground/80 truncate" title={`${meta.totalExperience} ${meta.relevantExperience ? `(${meta.relevantExperience} rel)` : ''}`}>
                                                        {meta.totalExperience}
                                                    </p>
                                                </div>
                                            )}

                                            {meta.workMode && (
                                                <div className="space-y-0.5">
                                                    <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground block flex items-center gap-1">
                                                        <Building2 size={10} className="text-purple-400" />
                                                        Work Mode
                                                    </span>
                                                    <p className="text-xs font-medium text-purple-300 truncate" title={`${meta.workMode} ${meta.preferredLocation ? `- ${meta.preferredLocation}` : ''}`}>
                                                        {meta.workMode} {meta.preferredLocation ? `(${meta.preferredLocation})` : ''}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Strengths & Concerns callouts */}
                                    {isInterviewEvaluation && (meta.strengths || meta.concerns) && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 my-2.5">
                                            {meta.strengths && (
                                                <div className="p-2.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-xs">
                                                    <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1 mb-1">
                                                        <CheckCircle2 size={11} />
                                                        Key Strengths
                                                    </span>
                                                    <p className="text-xs text-foreground/90 font-medium leading-relaxed">
                                                        {meta.strengths}
                                                    </p>
                                                </div>
                                            )}
                                            {meta.concerns && (
                                                <div className="p-2.5 rounded-md bg-rose-500/10 border border-rose-500/20 text-xs">
                                                    <span className="text-[10px] font-bold text-rose-400 flex items-center gap-1 mb-1">
                                                        <AlertCircle size={11} />
                                                        Concerns / Red Flags
                                                    </span>
                                                    <p className="text-xs text-foreground/90 font-medium leading-relaxed">
                                                        {meta.concerns}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Feedback / Note Text */}
                                    <div className="mt-2.5">
                                        <p className="text-xs font-normal leading-relaxed text-foreground/80 whitespace-pre-wrap">
                                            {note.content || note.text}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}

                        {notesList.length === 0 && (
                            <div className="p-10 text-center text-muted-foreground text-xs border-dashed border border-border/40 rounded-xl space-y-2">
                                <Sparkles size={24} className="mx-auto text-primary/40 mb-1" />
                                <p className="font-semibold text-foreground/70">No notes or evaluations submitted yet.</p>
                                <p className="text-[11px] text-muted-foreground/60 max-w-sm mx-auto">
                                    Record the candidate's notice period, compensation expectations, strengths, and interview verdict using the assessment form above.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
