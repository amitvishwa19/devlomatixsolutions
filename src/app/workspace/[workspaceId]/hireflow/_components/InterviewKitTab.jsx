'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Brain,
    Sparkles,
    CheckCircle2,
    AlertTriangle,
    Target,
    HelpCircle,
    Play,
    Copy,
    Check,
    Save,
    RotateCcw,
    ChevronDown,
    ChevronUp,
    Sliders,
    Award,
    ShieldAlert,
    Clock,
    FileSpreadsheet,
    Loader2,
    Users,
    Zap,
    ThumbsUp,
    ThumbsDown,
    ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import {
    generateCandidateInterviewKitAction,
    saveInterviewKitScorecardAction
} from '../_actions/candidate-actions';

const ROUND_PRESETS = [
    "Round 2: Competency & Objection Handling",
    "Round 1: Initial Screening & Career Fit",
    "Round 3: Executive Deep-Dive & Closing",
    "Technical & Product Architecture Defense",
    "Practical Role-Play & Live Pitch Simulation",
    "Culture Alignment & Team Leadership"
];

const RIGOR_LEVELS = [
    { id: "Standard", label: "Standard", desc: "Balanced competency questions & standard scenarios" },
    { id: "In-Depth", label: "In-Depth", desc: "Drills into metrics, actual project outcomes & trade-offs" },
    { id: "Stress-Test", label: "Stress-Test", desc: "High rigor, tough customer objections & adversarial role-play" }
];

const POPULAR_FOCUS_AREAS = [
    "Ability to convince customers",
    "Practical role-play",
    "Objection handling",
    "Cold prospecting & lead gen",
    "Willingness to learn IT products",
    "Previous sales quota track record",
    "Team conflict & leadership",
    "Pricing & commercial negotiation"
];

export default function InterviewKitTab({ candidateData, workspaceId, onScorecardSaved }) {
    // Current kit from candidate parsedData
    const existingKit = candidateData?.parsedData?.latestInterviewKit || null;
    const kitHistory = candidateData?.parsedData?.interviewKits || [];

    const [currentKit, setCurrentKit] = useState(existingKit);
    const [selectedRound, setSelectedRound] = useState(existingKit?.round || ROUND_PRESETS[0]);
    const [difficulty, setDifficulty] = useState(existingKit?.difficulty || "In-Depth");
    const [selectedFocusAreas, setSelectedFocusAreas] = useState([]);
    const [customInstructions, setCustomInstructions] = useState("");
    const [showConfig, setShowConfig] = useState(!existingKit);
    const [isGenerating, setIsGenerating] = useState(false);
    const [copied, setCopied] = useState(false);

    // Live Interview Scoring State
    const [questionRatings, setQuestionRatings] = useState({});
    const [rolePlayRating, setRolePlayRating] = useState(null);
    const [interviewerNotes, setInterviewerNotes] = useState("");
    const [recommendation, setRecommendation] = useState("yes");
    const [isSavingScorecard, setIsSavingScorecard] = useState(false);
    const [expandedQuestions, setExpandedQuestions] = useState({});

    // Sync if parent candidateData changes
    useEffect(() => {
        if (candidateData?.parsedData?.latestInterviewKit) {
            setCurrentKit(candidateData.parsedData.latestInterviewKit);
        }
    }, [candidateData?.parsedData?.latestInterviewKit]);

    // Extract prior scorecard weaknesses for display
    const priorScorecardWeaknesses = React.useMemo(() => {
        const weaknesses = [];
        const seen = new Set();
        if (Array.isArray(candidateData?.scorecards)) {
            for (const sc of candidateData.scorecards) {
                if (sc.score != null && sc.score <= 3.0 && !seen.has('sc_' + sc.id)) {
                    weaknesses.push({
                        label: `${sc.stage || 'Interview'} Rating`,
                        score: sc.score,
                        feedback: sc.feedback || "Scored below 3.5 benchmark"
                    });
                    seen.add('sc_' + sc.id);
                }
                if (sc.attributes && typeof sc.attributes === 'object') {
                    for (const [k, v] of Object.entries(sc.attributes)) {
                        const num = parseFloat(v);
                        if (!isNaN(num) && num <= 3.0 && !seen.has(k)) {
                            seen.add(k);
                            const label = k.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                            weaknesses.push({
                                label,
                                score: num,
                                feedback: `Rated ${num}/5 in previous review`
                            });
                        }
                    }
                }
            }
        }
        return weaknesses;
    }, [candidateData?.scorecards]);

    const toggleFocusArea = (area) => {
        setSelectedFocusAreas(prev =>
            prev.includes(area) ? prev.filter(a => a !== area) : [...prev, area]
        );
    };

    const toggleQuestionExpand = (qId) => {
        setExpandedQuestions(prev => ({
            ...prev,
            [qId]: !prev[qId]
        }));
    };

    const handleRatingChange = (qId, rating) => {
        setQuestionRatings(prev => ({
            ...prev,
            [qId]: rating
        }));
    };

    // Calculate live score average
    const calculatedOverall = React.useMemo(() => {
        const scores = [];
        Object.values(questionRatings).forEach(r => {
            const num = parseFloat(r);
            if (!isNaN(num) && num > 0) scores.push(num);
        });
        if (rolePlayRating != null) {
            scores.push(parseFloat(rolePlayRating));
        }
        if (scores.length === 0) return null;
        return parseFloat((scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1));
    }, [questionRatings, rolePlayRating]);

    // Handle Generation
    const handleGenerateKit = async () => {
        if (!candidateData?.id) {
            toast.error("Candidate record not loaded");
            return;
        }

        setIsGenerating(true);
        try {
            const res = await generateCandidateInterviewKitAction(workspaceId, {
                candidateId: candidateData.id,
                round: selectedRound,
                difficulty,
                focusAreas: selectedFocusAreas,
                customInstructions: customInstructions.trim()
            });

            if (!res.success) {
                throw new Error(res.error || "Failed to generate interview kit");
            }

            setCurrentKit(res.kit);
            setShowConfig(false);
            // Reset ratings for new kit
            setQuestionRatings({});
            setRolePlayRating(null);
            setInterviewerNotes("");
            // Expand all questions by default for quick viewing
            const initialExpanded = {};
            (res.kit.questions || []).forEach(q => { initialExpanded[q.id] = true; });
            setExpandedQuestions(initialExpanded);

            toast.success(
                `Interview Kit generated for ${res.kit.round || selectedRound}! (${res.aiMeta?.resolvedModel || 'FlowGenix AI'})`
            );
        } catch (error) {
            console.error("[GENERATE_KIT_CLIENT_ERROR]", error);
            toast.error(error.message || "Failed to generate interview kit");
        } finally {
            setIsGenerating(false);
        }
    };

    // Handle Save Scorecard
    const handleSaveScorecard = async () => {
        if (!currentKit) return;
        setIsSavingScorecard(true);
        try {
            const res = await saveInterviewKitScorecardAction(workspaceId, {
                candidateId: candidateData.id,
                kitId: currentKit.id,
                round: currentKit.round || selectedRound,
                questionRatings,
                rolePlayRating,
                overallScore: calculatedOverall,
                feedback: interviewerNotes.trim() || `AI Interview Kit evaluation (${currentKit.round || selectedRound}) with score ${calculatedOverall || 3.0}/5.`,
                recommendation
            });

            if (!res.success) {
                throw new Error(res.error);
            }

            toast.success(res.message || "Interview Scorecard recorded successfully!");
            if (onScorecardSaved) onScorecardSaved();
        } catch (error) {
            console.error("[SAVE_KIT_SCORECARD_ERROR]", error);
            toast.error(error.message || "Failed to save scorecard");
        } finally {
            setIsSavingScorecard(false);
        }
    };

    // Copy Kit to Clipboard as Markdown
    const handleCopyKit = () => {
        if (!currentKit) return;
        let text = `# Interview Kit: ${currentKit.targetRole || 'Candidate'} — ${currentKit.round || selectedRound}\n`;
        text += `Candidate: ${candidateData?.name || 'Candidate'}\nRigor: ${currentKit.difficulty || difficulty}\n\n`;
        text += `## Executive Briefing\n${currentKit.executiveBriefing || 'N/A'}\n\n`;

        if (currentKit.flaggedGaps && currentKit.flaggedGaps.length > 0) {
            text += `## Flagged Vulnerabilities / Gaps to Confirm\n`;
            currentKit.flaggedGaps.forEach(g => {
                text += `- **${g.area}**: ${g.concern} (Probe Angle: ${g.suggestedProbeAngle})\n`;
            });
            text += `\n`;
        }

        text += `## Tailored Interview Questions\n\n`;
        (currentKit.questions || []).forEach((q, idx) => {
            text += `### Q${idx + 1}: ${q.competency} (${q.category})\n`;
            text += `**Question:** "${q.question}"\n\n`;
            text += `*Context:* ${q.context || ''}\n\n`;
            text += `*Strong 5/5 Answer:* \n${(q.strongAnswerRubric || []).map(r => `  - ${r}`).join('\n')}\n\n`;
            text += `*Red Flags (1-2/5):* \n${(q.redFlags || []).map(r => `  - ${r}`).join('\n')}\n\n`;
            text += `*Follow-Up Probe:* "${q.probingFollowUp || ''}"\n\n---\n\n`;
        });

        if (currentKit.practicalRolePlay) {
            const rp = currentKit.practicalRolePlay;
            text += `## Practical Role-Play Scenario: ${rp.title || 'Role-Play'} (${rp.durationMinutes || 5} min)\n`;
            text += `**Interviewer Persona:** ${rp.interviewerPersona}\n`;
            text += `**Candidate Objective:** ${rp.candidateTask}\n`;
            text += `**Scenario:** ${rp.scenario}\n`;
            text += `**Evaluation Checklist:**\n${(rp.evaluationChecklist || []).map(c => `  - [ ] ${c}`).join('\n')}\n\n`;
        }

        navigator.clipboard.writeText(text);
        setCopied(true);
        toast.success("Interview Kit copied to clipboard in formatted Markdown!");
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="space-y-6">
            {/* Header Hero Banner */}
            <Card className="border-border/40 bg-gradient-to-br from-indigo-500/10 via-card/50 to-primary/10 backdrop-blur-xl rounded-xl overflow-hidden shadow-2xl relative">
                <div className="absolute top-0 right-0 p-6 pointer-events-none opacity-20">
                    <Brain className="w-36 h-36 text-indigo-400" />
                </div>
                <CardHeader className="p-6 pb-4 border-b border-border/10">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="flex items-center gap-3.5">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-primary text-white flex items-center justify-center shadow-lg shadow-indigo-500/20 shrink-0">
                                <Brain size={24} />
                            </div>
                            <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                    <CardTitle className="text-xl font-bold">AI Interview Kit Generator</CardTitle>
                                    <Badge className="bg-indigo-500/20 text-indigo-400 border-indigo-500/30 text-[10px] font-mono font-bold px-2">
                                        FlowGenix Engine
                                    </Badge>
                                    {currentKit && (
                                        <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                                            Ready for {currentKit.round || 'Interview'}
                                        </Badge>
                                    )}
                                </div>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                    Synthesizes candidate resume, target role metrics, and prior scorecard gaps into high-signal questions, rubrics, and role-plays.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
                            {currentKit && (
                                <>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleCopyKit}
                                        className="h-8 text-xs border-border/50 hover:bg-card/80 gap-1.5"
                                    >
                                        {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-muted-foreground" />}
                                        {copied ? "Copied!" : "Copy Kit"}
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setShowConfig(!showConfig)}
                                        className="h-8 text-xs border-border/50 hover:bg-card/80 gap-1.5"
                                    >
                                        <Sliders className="w-3.5 h-3.5 text-indigo-400" />
                                        {showConfig ? "Hide Generator" : "New Round / Customize"}
                                    </Button>
                                </>
                            )}
                            <Button
                                size="sm"
                                onClick={handleGenerateKit}
                                disabled={isGenerating}
                                className="h-8 text-xs bg-gradient-to-r from-indigo-600 to-primary hover:from-indigo-500 hover:to-primary/90 text-white shadow-md gap-1.5 font-semibold"
                            >
                                {isGenerating ? (
                                    <>
                                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                        Crafting Kit with AI...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="w-3.5 h-3.5" />
                                        {currentKit ? "Regenerate Kit" : "Generate Interview Kit"}
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </CardHeader>

                {/* Scorecard Weaknesses Alert Banner */}
                {priorScorecardWeaknesses.length > 0 && (
                    <div className="px-6 py-2.5 bg-amber-500/10 border-b border-amber-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                        <div className="flex items-center gap-2 text-amber-400 font-medium">
                            <ShieldAlert className="w-4 h-4 shrink-0" />
                            <span>Auto-detected prior scorecard gaps ({priorScorecardWeaknesses.length}): FlowGenix has tailored questions to stress-test these areas.</span>
                        </div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                            {priorScorecardWeaknesses.slice(0, 4).map((w, i) => (
                                <Badge key={i} variant="outline" className="bg-amber-500/15 text-amber-300 border-amber-500/30 text-[10px] font-mono">
                                    {w.label}: {w.score}/5
                                </Badge>
                            ))}
                        </div>
                    </div>
                )}
            </Card>

            {/* Generator Configuration Drawer / Card */}
            <AnimatePresence>
                {showConfig && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.25 }}
                    >
                        <Card className="border-border/40 bg-card/40 backdrop-blur-xl rounded-xl p-5 shadow-lg space-y-4">
                            <div className="flex items-center justify-between">
                                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                    <Sliders className="w-3.5 h-3.5 text-indigo-400" />
                                    Interview Kit Parameters
                                </h4>
                                <span className="text-[11px] text-muted-foreground">Select interview stage & rigor to shape the assessment</span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-semibold text-foreground mb-1.5 block">
                                        Target Interview Round
                                    </label>
                                    <Select value={selectedRound} onValueChange={setSelectedRound}>
                                        <SelectTrigger className="h-9 text-xs bg-background/50 border-border/50">
                                            <SelectValue placeholder="Select round" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {ROUND_PRESETS.map(r => (
                                                <SelectItem key={r} value={r} className="text-xs">{r}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <label className="text-xs font-semibold text-foreground mb-1.5 block">
                                        Rigor & Depth Level
                                    </label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {RIGOR_LEVELS.map(lvl => (
                                            <button
                                                key={lvl.id}
                                                type="button"
                                                onClick={() => setDifficulty(lvl.id)}
                                                className={`p-2 rounded-lg border text-left transition-all ${
                                                    difficulty === lvl.id
                                                        ? 'bg-indigo-500/15 border-indigo-500/50 text-indigo-300 shadow-sm'
                                                        : 'bg-background/40 border-border/40 text-muted-foreground hover:border-border'
                                                }`}
                                            >
                                                <div className="text-xs font-bold">{lvl.label}</div>
                                                <div className="text-[10px] text-muted-foreground line-clamp-1">{lvl.desc}</div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-foreground mb-1.5 block">
                                    Competency Focus Areas (Click to Toggle)
                                </label>
                                <div className="flex flex-wrap gap-1.5">
                                    {POPULAR_FOCUS_AREAS.map(area => {
                                        const isSelected = selectedFocusAreas.includes(area);
                                        return (
                                            <button
                                                key={area}
                                                type="button"
                                                onClick={() => toggleFocusArea(area)}
                                                className={`px-2.5 py-1 rounded-md text-xs border font-medium transition-all ${
                                                    isSelected
                                                        ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                                                        : 'bg-background/40 text-muted-foreground border-border/40 hover:border-border'
                                                }`}
                                            >
                                                {isSelected ? '✓ ' : '+ '} {area}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-foreground mb-1.5 block">
                                    Custom Interviewer Instructions (Optional)
                                </label>
                                <Input
                                    value={customInstructions}
                                    onChange={(e) => setCustomInstructions(e.target.value)}
                                    placeholder="e.g. Press hard on why they left their last company after only 8 months; test if they can sell to technical CTOs..."
                                    className="h-9 text-xs bg-background/50 border-border/50"
                                />
                            </div>

                            <div className="flex justify-end pt-2">
                                <Button
                                    size="sm"
                                    onClick={handleGenerateKit}
                                    disabled={isGenerating}
                                    className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs h-8 px-4 gap-1.5"
                                >
                                    {isGenerating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                                    Generate Tailored Kit
                                </Button>
                            </div>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Current Generated Kit View */}
            {currentKit ? (
                <div className="space-y-6">
                    {/* Executive Briefing & Flagged Vulnerabilities */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                        <Card className="lg:col-span-2 border-border/40 bg-card/30 backdrop-blur-xl rounded-xl p-5 shadow-sm space-y-3">
                            <div className="flex items-center gap-2">
                                <Target className="w-4 h-4 text-indigo-400" />
                                <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
                                    Executive Recruiter Briefing
                                </h4>
                            </div>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                {currentKit.executiveBriefing || "Comprehensive briefing generated based on candidate's background and target role competency requirements."}
                            </p>
                            <div className="pt-2 flex items-center gap-3 text-[11px] text-muted-foreground border-t border-border/20">
                                <span>Round: <strong className="text-foreground">{currentKit.round}</strong></span>
                                <span>•</span>
                                <span>Rigor: <strong className="text-foreground">{currentKit.difficulty}</strong></span>
                                <span>•</span>
                                <span>Generated: <strong className="text-foreground">{new Date(currentKit.createdAt || Date.now()).toLocaleDateString()}</strong></span>
                            </div>
                        </Card>

                        {/* Flagged Risks / Probe Angles */}
                        <Card className="border-border/40 bg-card/30 backdrop-blur-xl rounded-xl p-5 shadow-sm space-y-3">
                            <div className="flex items-center gap-2 text-rose-400">
                                <AlertTriangle className="w-4 h-4 shrink-0" />
                                <h4 className="text-xs font-bold uppercase tracking-wider">
                                    Vulnerabilities to Confirm
                                </h4>
                            </div>
                            <div className="space-y-2.5">
                                {currentKit.flaggedGaps && currentKit.flaggedGaps.length > 0 ? (
                                    currentKit.flaggedGaps.map((gap, i) => (
                                        <div key={i} className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs">
                                            <div className="font-bold text-rose-300">{gap.area}</div>
                                            <div className="text-[11px] text-muted-foreground mt-0.5">{gap.concern}</div>
                                            {gap.suggestedProbeAngle && (
                                                <div className="text-[10px] text-rose-400/90 mt-1 font-mono">
                                                    Probe: {gap.suggestedProbeAngle}
                                                </div>
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-xs text-muted-foreground italic">
                                        No critical red flags detected. Focus on verifying high-impact metrics.
                                    </div>
                                )}
                            </div>
                        </Card>
                    </div>

                    {/* Questions Accordion / List */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <HelpCircle className="w-4 h-4 text-primary" />
                                <h3 className="text-sm font-bold tracking-tight text-foreground">
                                    Targeted Interview Questions & Live Scoring ({currentKit.questions?.length || 0})
                                </h3>
                            </div>
                            <span className="text-[11px] text-muted-foreground">Rate candidate responses 1 to 5 directly during the interview</span>
                        </div>

                        {currentKit.questions && currentKit.questions.map((q, idx) => {
                            const isExpanded = expandedQuestions[q.id] !== false;
                            const rating = questionRatings[q.id] || null;

                            return (
                                <Card
                                    key={q.id || idx}
                                    className="border-border/40 bg-card/30 backdrop-blur-xl rounded-xl overflow-hidden shadow-sm transition-all hover:border-border/80"
                                >
                                    <div
                                        className="p-4 flex items-start justify-between gap-4 cursor-pointer hover:bg-card/40 transition-colors"
                                        onClick={() => toggleQuestionExpand(q.id)}
                                    >
                                        <div className="flex items-start gap-3 flex-1">
                                            <div className="w-7 h-7 rounded-lg bg-primary/10 border border-primary/20 text-primary flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                                                Q{idx + 1}
                                            </div>
                                            <div className="space-y-1 flex-1">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <Badge variant="outline" className="text-[10px] font-semibold bg-indigo-500/10 text-indigo-300 border-indigo-500/20">
                                                        {q.competency || 'Competency'}
                                                    </Badge>
                                                    <span className="text-[10px] text-muted-foreground font-mono">
                                                        {q.category}
                                                    </span>
                                                </div>
                                                <h4 className="text-sm font-semibold text-foreground leading-snug">
                                                    "{q.question}"
                                                </h4>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3 shrink-0" onClick={e => e.stopPropagation()}>
                                            {/* Live Rating Buttons (1 to 5) */}
                                            <div className="flex items-center gap-1 bg-background/50 p-1 rounded-lg border border-border/40">
                                                {[1, 2, 3, 4, 5].map(num => (
                                                    <button
                                                        key={num}
                                                        type="button"
                                                        onClick={() => handleRatingChange(q.id, num)}
                                                        className={`w-6 h-6 rounded text-xs font-bold transition-all ${
                                                            rating === num
                                                                ? num >= 4
                                                                    ? 'bg-emerald-500 text-white shadow-xs'
                                                                    : num === 3
                                                                    ? 'bg-amber-500 text-white shadow-xs'
                                                                    : 'bg-rose-500 text-white shadow-xs'
                                                                : 'text-muted-foreground hover:bg-card hover:text-foreground'
                                                        }`}
                                                    >
                                                        {num}
                                                    </button>
                                                ))}
                                            </div>

                                            <button
                                                type="button"
                                                onClick={() => toggleQuestionExpand(q.id)}
                                                className="p-1 text-muted-foreground hover:text-foreground"
                                            >
                                                {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Expanded Details: Context, 5/5 Strong Rubric, Red Flags, Probing Follow-Up */}
                                    {isExpanded && (
                                        <div className="px-4 pb-4 pt-1 border-t border-border/20 space-y-3 bg-muted/5">
                                            {q.context && (
                                                <div className="text-[11px] text-muted-foreground italic">
                                                    <strong>Interviewer Rationale:</strong> {q.context}
                                                </div>
                                            )}

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                                                {/* 5/5 Strong Rubric */}
                                                <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 space-y-1.5">
                                                    <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                                                        <CheckCircle2 size={14} />
                                                        <span>5/5 Exceptional Answer Indicators</span>
                                                    </div>
                                                    <ul className="space-y-1 text-[11px] text-emerald-200/90 pl-4 list-disc">
                                                        {(q.strongAnswerRubric || []).map((r, i) => (
                                                            <li key={i}>{r}</li>
                                                        ))}
                                                    </ul>
                                                </div>

                                                {/* Red Flags 1-2/5 */}
                                                <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 space-y-1.5">
                                                    <div className="flex items-center gap-1.5 text-xs font-bold text-rose-400">
                                                        <AlertTriangle size={14} />
                                                        <span>1-2/5 Red Flags / Warning Signs</span>
                                                    </div>
                                                    <ul className="space-y-1 text-[11px] text-rose-200/90 pl-4 list-disc">
                                                        {(q.redFlags || []).map((rf, i) => (
                                                            <li key={i}>{rf}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </div>

                                            {/* Probing Follow-up */}
                                            {q.probingFollowUp && (
                                                <div className="p-2.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-xs flex items-start gap-2">
                                                    <Zap size={14} className="text-indigo-400 shrink-0 mt-0.5" />
                                                    <div>
                                                        <span className="font-bold text-indigo-300">If answer sounds rehearsed, probe with: </span>
                                                        <span className="text-foreground">"{q.probingFollowUp}"</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </Card>
                            );
                        })}
                    </div>

                    {/* Practical 5-Minute Role-Play Scenario */}
                    {currentKit.practicalRolePlay && (
                        <Card className="border-border/40 bg-gradient-to-br from-card/60 via-card/40 to-rose-500/5 backdrop-blur-xl rounded-xl p-5 shadow-sm space-y-4">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/20 pb-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
                                        <Play size={20} className="fill-rose-500/20" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h4 className="text-sm font-bold text-foreground">
                                                Practical Role-Play: {currentKit.practicalRolePlay.title}
                                            </h4>
                                            <Badge variant="outline" className="text-[10px] bg-rose-500/10 text-rose-400 border-rose-500/20 flex items-center gap-1">
                                                <Clock size={10} />
                                                {currentKit.practicalRolePlay.durationMinutes || 5} min
                                            </Badge>
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-0.5">
                                            Test live adaptability, customer empathy, and objection handling under pressure.
                                        </p>
                                    </div>
                                </div>

                                {/* Role Play Score */}
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-semibold text-muted-foreground">Role-Play Score:</span>
                                    <div className="flex items-center gap-1 bg-background/50 p-1 rounded-lg border border-border/40">
                                        {[1, 2, 3, 4, 5].map(num => (
                                            <button
                                                key={num}
                                                type="button"
                                                onClick={() => setRolePlayRating(num)}
                                                className={`w-7 h-7 rounded text-xs font-bold transition-all ${
                                                    rolePlayRating === num
                                                        ? num >= 4
                                                            ? 'bg-emerald-500 text-white shadow-xs'
                                                            : num === 3
                                                            ? 'bg-amber-500 text-white shadow-xs'
                                                            : 'bg-rose-500 text-white shadow-xs'
                                                        : 'text-muted-foreground hover:bg-card hover:text-foreground'
                                                }`}
                                            >
                                                {num}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-3">
                                    <div className="p-3 rounded-lg bg-card/60 border border-border/40 text-xs space-y-1">
                                        <div className="font-bold text-foreground flex items-center gap-1.5">
                                            <Users size={14} className="text-primary" />
                                            Interviewer Persona
                                        </div>
                                        <p className="text-muted-foreground">{currentKit.practicalRolePlay.interviewerPersona}</p>
                                    </div>

                                    <div className="p-3 rounded-lg bg-card/60 border border-border/40 text-xs space-y-1">
                                        <div className="font-bold text-foreground flex items-center gap-1.5">
                                            <Target size={14} className="text-indigo-400" />
                                            Candidate Task & Scenario
                                        </div>
                                        <p className="text-muted-foreground">{currentKit.practicalRolePlay.scenario}</p>
                                        <div className="mt-2 text-primary font-medium">
                                            Goal: {currentKit.practicalRolePlay.candidateTask}
                                        </div>
                                    </div>
                                </div>

                                <div className="p-3.5 rounded-lg bg-card/60 border border-border/40 text-xs space-y-2">
                                    <div className="font-bold text-foreground flex items-center gap-1.5">
                                        <Award size={14} className="text-amber-400" />
                                        Evaluation Checklist
                                    </div>
                                    <ul className="space-y-1.5 text-muted-foreground pl-1">
                                        {(currentKit.practicalRolePlay.evaluationChecklist || []).map((item, i) => (
                                            <li key={i} className="flex items-start gap-2">
                                                <input type="checkbox" className="mt-0.5 rounded border-border" />
                                                <span>{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </Card>
                    )}

                    {/* Official Scorecard Conversion Card */}
                    <Card className="border-border/40 bg-gradient-to-r from-card/60 via-card/80 to-primary/5 backdrop-blur-xl rounded-xl p-6 shadow-xl space-y-5">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/20 pb-4">
                            <div>
                                <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                                    <Save className="w-4 h-4 text-primary" />
                                    Save Evaluation to Official ATS Scorecard
                                </h3>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                    Converts live question ratings and role-play score into candidate profile rating & audit trail.
                                </p>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="text-right">
                                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Computed Score</span>
                                    <span className="text-2xl font-black text-primary">
                                        {calculatedOverall !== null ? `${calculatedOverall} / 5.0` : '— / 5.0'}
                                    </span>
                                </div>
                                <div className="w-px h-8 bg-border/40" />
                                <div className="text-right">
                                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Evaluated Questions</span>
                                    <span className="text-sm font-bold text-foreground">
                                        {Object.keys(questionRatings).length} of {currentKit.questions?.length || 0}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-foreground">
                                    Hiring Recommendation
                                </label>
                                <Select value={recommendation} onValueChange={setRecommendation}>
                                    <SelectTrigger className="h-9 text-xs bg-background/50 border-border/50">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="strong_yes" className="text-emerald-400 font-bold text-xs">Strong Yes (Top 5%)</SelectItem>
                                        <SelectItem value="yes" className="text-emerald-300 text-xs">Yes (Meets Bar)</SelectItem>
                                        <SelectItem value="maybe" className="text-amber-400 text-xs">Maybe / Conditional</SelectItem>
                                        <SelectItem value="no" className="text-rose-400 text-xs">No / Pass</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="md:col-span-2 space-y-1.5">
                                <label className="text-xs font-semibold text-foreground">
                                    Interviewer Summary Feedback & Takeaways
                                </label>
                                <Textarea
                                    value={interviewerNotes}
                                    onChange={(e) => setInterviewerNotes(e.target.value)}
                                    placeholder="Key observations on role-play, depth of objection handling, executive presence, and culture fit..."
                                    rows={2}
                                    className="text-xs bg-background/50 border-border/50 resize-none"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-2">
                            <Button
                                size="sm"
                                onClick={handleSaveScorecard}
                                disabled={isSavingScorecard}
                                className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs h-9 px-5 gap-2 font-bold shadow-md"
                            >
                                {isSavingScorecard ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                                Commit Scorecard to Candidate Profile
                            </Button>
                        </div>
                    </Card>
                </div>
            ) : (
                /* Empty State: No kit generated yet */
                <Card className="border-dashed border-2 border-border/60 bg-card/20 rounded-xl p-12 text-center space-y-4">
                    <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto shadow-inner">
                        <Brain size={32} />
                    </div>
                    <div className="max-w-md mx-auto space-y-1.5">
                        <h3 className="text-base font-bold text-foreground">No Interview Kit Generated Yet</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                            Generate an AI-tailored assessment kit for <strong>{candidateData?.name || 'this candidate'}</strong>. FlowGenix cross-references their resume, target role, and past performance scorecards to formulate precision questions and role-plays.
                        </p>
                    </div>
                    <Button
                        onClick={handleGenerateKit}
                        disabled={isGenerating}
                        className="bg-gradient-to-r from-indigo-600 to-primary hover:from-indigo-500 hover:to-primary text-white text-xs h-9 px-5 gap-2 font-semibold shadow-lg shadow-indigo-500/10"
                    >
                        {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                        Generate Round 2 Kit Now
                    </Button>
                </Card>
            )}
        </div>
    );
}
