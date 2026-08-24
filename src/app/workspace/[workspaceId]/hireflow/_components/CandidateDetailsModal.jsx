'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    X, 
    User, 
    Mail, 
    Phone, 
    MapPin, 
    Calendar,
    Briefcase,
    GraduationCap,
    Download,
    Share2,
    Sparkles,
    CheckCircle2,
    Clock,
    AlertCircle,
    Star,
    Send,
    FileText,
    FileCheck,
    ChevronLeft,
    Loader2,
    Trash2,
    MessageSquare,
    ExternalLink,
    Award,
    Play,
    History
} from 'lucide-react';
import Scorecards from './Scorecards';
import { generateOfferLetter } from '@/lib/ats/pdf-generator';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from '@/components/ui/dialog';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle
} from '@/components/ui/sheet';
import { OfferBuilderModal } from './OfferBuilderModal';
import {
    getCandidateByIdAction,
    deleteCandidateAction,
    createCandidateNoteAction,
    createCandidateScorecardAction,
    aiParseResumeAction,
    sendCandidateWhatsAppAction,
    getCandidateCommunicationsAction,
    generateAiInterviewQuestionsAction
} from '../_actions/candidate-actions';

import useSWR from 'swr';

const getInitials = (name) => {
    if (!name) return "";
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return "";
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

export const CandidateDetailsModal = ({ isOpen, onClose, candidateId, workspaceId, onDeleteSuccess }) => {
    const [activeTab, setActiveTab] = useState('overview');
    const [isScorecardOpen, setIsScorecardOpen] = useState(false);
    const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
    const [isParsing, setIsParsing] = useState(false);
    const [isScoring, setIsScoring] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    // Communication & WhatsApp State
    const [commChannel, setCommChannel] = useState('whatsapp');
    const [whatsAppText, setWhatsAppText] = useState('');
    const [isSendingWhatsApp, setIsSendingWhatsApp] = useState(false);
    const [communications, setCommunications] = useState([]);
    const [isLoadingComms, setIsLoadingComms] = useState(false);

    // AI Interview Questions State
    const [aiQuestions, setAiQuestions] = useState([]);
    const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);

    const { data: candidateData, isLoading, mutate } = useSWR(
        candidateId && isOpen && workspaceId ? ['candidate', workspaceId, candidateId] : null, 
        () => getCandidateByIdAction(workspaceId, candidateId).then(res => res.data)
    );

    const loadCommunications = async () => {
        if (!candidateId || !workspaceId) return;
        setIsLoadingComms(true);
        try {
            const res = await getCandidateCommunicationsAction({ workspaceId, candidateId });
            if (res.success) {
                setCommunications(res.communications || []);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoadingComms(false);
        }
    };

    const handleSendWhatsApp = async () => {
        if (!whatsAppText.trim()) {
            toast.error("Please enter a message");
            return;
        }
        setIsSendingWhatsApp(true);
        try {
            const res = await sendCandidateWhatsAppAction({
                workspaceId,
                candidateId,
                text: whatsAppText.trim()
            });
            if (res.success) {
                toast.success("WhatsApp message sent successfully!");
                setWhatsAppText('');
                loadCommunications();
            } else {
                toast.error(res.error || "Failed to send WhatsApp message");
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to send WhatsApp message");
        } finally {
            setIsSendingWhatsApp(false);
        }
    };

    const handleGenerateAiQuestions = async () => {
        setIsGeneratingQuestions(true);
        try {
            const res = await generateAiInterviewQuestionsAction({
                workspaceId,
                candidateId,
                jobId: candidateData?.applications?.[0]?.jobId
            });
            if (res.success && res.questions) {
                setAiQuestions(res.questions);
                toast.success("AI Interview Questions generated!");
            } else {
                toast.error(res.error || "Failed to generate AI questions");
            }
        } catch (error) {
            console.error(error);
            toast.error("Error generating interview questions");
        } finally {
            setIsGeneratingQuestions(false);
        }
    };

    const handleDeleteCandidate = async () => {
        if (!candidateId) return;
        setIsDeleting(true);
        try {
            const res = await deleteCandidateAction(workspaceId, candidateId);
            if (!res.success) throw new Error(res.error);
            toast.success("Candidate deleted successfully");
            setIsDeleteDialogOpen(false);
            if (onDeleteSuccess) {
                onDeleteSuccess();
            } else {
                onClose();
            }
        } catch (error) {
            console.error("[DELETE_CANDIDATE_ERROR]", error);
            toast.error(error.message || "Failed to delete candidate");
        } finally {
            setIsDeleting(false);
        }
    };

    const handleAiParse = async () => {
        setIsParsing(true);
        try {
            const res = await aiParseResumeAction(workspaceId, { candidateId });
            if (res.success) {
                toast.success("AI Insights updated from resume!");
                mutate();
            } else {
                toast.error(res.error || "AI Parsing failed");
            }
        } catch (error) {
            toast.error("AI Parsing failed");
        } finally {
            setIsParsing(false);
        }
    };

    const [noteText, setNoteText] = useState("");

    const handleSubmitScorecard = async (data) => {
        try {
            const res = await createCandidateScorecardAction(workspaceId, {
                candidateId,
                applicationId: candidateData.applications?.[0]?.id,
                scores: data.scores,
                feedback: data.overallFeedback,
                overallScore: Object.values(data.scores).reduce((a, b) => (Number(a) || 0) + (Number(b) || 0), 0) / 5,
                recommendation: data.finalRecommendation
            });
            if (!res.success) throw new Error(res.error);
            toast.success("Scorecard submitted successfully!");
            setIsScorecardOpen(false);
            mutate();
        } catch (error) {
            toast.error(error.message || "Failed to submit scorecard");
        }
    };

    const handlePostNote = async () => {
        if (!noteText.trim()) return;
        try {
            const res = await createCandidateNoteAction(workspaceId, {
                candidateId,
                text: noteText
            });
            if (!res.success) throw new Error(res.error);
            setNoteText("");
            toast.success("Note posted!");
            mutate();
        } catch (error) {
            toast.error(error.message || "Failed to post note");
        }
    };

    if (!isOpen) return null;

    return (
        <Sheet open={isOpen} onOpenChange={(val) => !val && onClose()}>
            <SheetContent className="sm:max-w-[50vw] w-[50vw] h-full overflow-y-auto p-0 border-l border-border/40 bg-background">
                {!candidateData && isLoading ? (
                    <div className="flex h-full min-h-[400px] items-center justify-center">
                        <SheetTitle className="sr-only">Loading Details</SheetTitle>
                        <Loader2 className="animate-spin text-primary" />
                    </div>
                ) : !candidateData ? (
                    <div className="flex h-full min-h-[400px] items-center justify-center text-muted-foreground">
                        <SheetTitle className="sr-only">Candidate Not Found</SheetTitle>
                        Candidate not found
                    </div>
                ) : (
                    <div className="flex flex-col gap-8 p-8 max-w-[1400px] mx-auto animate-in fade-in duration-700 w-full">
                        {/* Header / Breadcrumbs */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div className="space-y-1">
                                <div className="flex items-center gap-4">
                                    <Avatar className="h-16 w-16 border-4 border-primary/20 shadow-2xl">
                                        <AvatarFallback className="bg-primary/10 text-primary text-xl">
                                            {getInitials(candidateData.name)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <SheetTitle className="text-4xl tracking-tighter">{candidateData.name}</SheetTitle>
                                        <div className="flex items-center gap-2 mt-1">
                                            <p className="text-xs font-bold text-muted-foreground">
                                                {candidateData.applications?.[0]?.job?.title || "Candidate"}
                                            </p>
                                            <span className="w-1 h-1 rounded-full bg-border" />
                                            <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-[9px]">
                                                {candidateData.applications?.[0]?.stage || "Applied"}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 bg-card/30 backdrop-blur-xl p-2 rounded-md border border-border/40">
                                <Button variant="ghost" size="icon" className="w-10 rounded-md opacity-60 hover:opacity-100" onClick={() => setActiveTab('emails')}>
                                    <Mail size={18} />
                                </Button>
                                <Button variant="ghost" size="icon" className="w-10 rounded-md opacity-60 hover:opacity-100">
                                    <Calendar size={18} />
                                </Button>
                                <Separator orientation="vertical" className="h-6" />
                                <Button 
                                    onClick={() => setIsOfferModalOpen(true)}
                                    className="rounded-md px-6 text-[10px] bg-primary shadow-lg shadow-primary/20"
                                >
                                    <FileCheck className="w-3 h-3 mr-2" />
                                    Generate Offer
                                </Button>
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="w-10 rounded-md opacity-60 hover:opacity-100 hover:text-destructive hover:bg-destructive/10"
                                    onClick={() => setIsDeleteDialogOpen(true)}
                                    title="Delete Candidate"
                                >
                                    <Trash2 size={18} />
                                </Button>
                            </div>
                        </div>

                        {/* Hub Tabs */}
                        <Tabs value={activeTab} className="space-y-8" onValueChange={setActiveTab}>
                            <div className="flex items-center justify-between">
                                <TabsList className="bg-muted/30 p-1 rounded-md h-12 backdrop-blur-xl border border-border/20">
                                    <TabsTrigger value="overview" className="rounded-md px-6 text-xs data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-xl">Overview</TabsTrigger>
                                    <TabsTrigger value="scorecards" className="rounded-md px-6 text-xs data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-xl">Scorecards</TabsTrigger>
                                    <TabsTrigger value="emails" className="rounded-md px-6 text-xs data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-xl">Communication</TabsTrigger>
                                    <TabsTrigger value="notes" className="rounded-md px-6 text-xs data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-xl">Team Notes</TabsTrigger>
                                    <TabsTrigger value="timeline" className="rounded-md px-6 text-xs data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-xl">Activity</TabsTrigger>
                                    <TabsTrigger value="resume" className="rounded-md px-6 text-xs data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-xl">Resume</TabsTrigger>
                                </TabsList>
                                
                                <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                                    <History size={12} />
                                    LAST ACTIVE 5M AGO
                                </div>
                            </div>

                            <TabsContent value="overview" className="mt-0 outline-none animate-in fade-in slide-in-from-bottom-2 duration-500">
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                    <div className="lg:col-span-2 space-y-8">
                                        {/* AI Smart Summary Card */}
                                        <Card className="border-border/40 bg-card/30 backdrop-blur-xl rounded-md overflow-hidden shadow-2xl shadow-black/5 relative hover:border-primary/20 transition-all cursor-default group">
                                            <div className="absolute top-0 right-0 p-6">
                                                <div className="text-right">
                                                    <p className="text-[10px] text-primary mb-1">AI Match</p>
                                                    <h3 className="text-4xl text-primary">{candidateData.aiMatchScore ? (candidateData.aiMatchScore / 20).toFixed(1) : 0}%</h3>
                                                </div>
                                            </div>
                                            <CardHeader className="p-8 pb-4">
                                                <div className="flex items-center justify-between gap-4">
                                                    <CardTitle className="text-2xl flex items-center gap-2">
                                                        <div className="w-10 rounded-md bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                                            <Sparkles size={20} />
                                                        </div>
                                                        AI Candidate Insight
                                                    </CardTitle>
                                                    <Button 
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={handleAiParse}
                                                        disabled={isParsing}
                                                        className="h-8 rounded-md text-[9px] bg-primary/5 hover:bg-primary/10 transition-all"
                                                    >
                                                        {isParsing ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Sparkles className="h-3 w-3 mr-1" />}
                                                        Analyze Resume
                                                    </Button>
                                                </div>
                                            </CardHeader>
                                            <CardContent className="p-8 pt-4 space-y-6">
                                                <p className="text-base font-medium leading-relaxed opacity-80">
                                                    {candidateData.aiInsights?.summary || "Deep analysis pending..."}
                                                </p>
                                                <div className="grid grid-cols-2 gap-8">
                                                    <div className="space-y-4">
                                                        <h4 className="text-[10px] text-emerald-500">Key Strengths</h4>
                                                        <div className="space-y-2">
                                                            {(candidateData.aiInsights?.pros || []).map((pro, i) => (
                                                                <div key={i} className="flex items-center gap-2 text-xs font-bold opacity-80">
                                                                    <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                                                                    {pro}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                    <div className="space-y-4">
                                                        <h4 className="text-[10px] text-amber-500">Considerations</h4>
                                                        <div className="space-y-2">
                                                            {(candidateData.aiInsights?.cons || []).map((con, i) => (
                                                                <div key={i} className="flex items-center gap-2 text-sm font-bold opacity-80">
                                                                    <AlertCircle size={16} className="text-amber-500 shrink-0" />
                                                                    {con}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>

                                        {/* Bio & History */}
                                        <Card className="border-border/40 bg-card/30 backdrop-blur-xl rounded-md overflow-hidden shadow-2xl shadow-black/5">
                                            <CardHeader className="p-8 pb-4">
                                                <CardTitle className="text-xl flex items-center gap-2 text-[10px] opacity-40">
                                                    Professional Profile
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className="p-8 pt-4 space-y-8">
                                                <div className="p-6 rounded-md bg-muted/20 border border-border/10">
                                                    <h4 className="text-sm opacity-40 mb-3">Executive Summary</h4>
                                                    <p className="text-xs font-medium leading-relaxed opacity-70 italic">
                                                        "{candidateData.summary || "No summary available."}"
                                                    </p>
                                                </div>
                                                
                                                <Separator className="bg-border/10" />

                                                <div className="space-y-8">
                                                    {(candidateData.experience || []).map((exp, i) => (
                                                        <div key={i} className="flex gap-6 group cursor-default">
                                                            <div className="w-12 h-12 rounded-md bg-card border border-border/40 flex items-center justify-center text-primary group-hover:scale-110 group-hover:bg-primary/5 transition-all">
                                                                <Briefcase size={20} />
                                                            </div>
                                                            <div className="space-y-1">
                                                                <h4 className="text-base group-hover:text-primary transition-colors">{exp.role}</h4>
                                                                <p className="text-xs font-bold text-primary">{exp.company}</p>
                                                                <p className="text-[10px] font-bold text-muted-foreground opacity-60 mt-1">{exp.period}</p>
                                                                <p className="text-xs font-medium leading-relaxed opacity-60 mt-3">{exp.description}</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>

                                    <div className="space-y-8">
                                        {/* Contact */}
                                        <Card className="border-border/40 bg-card/30 backdrop-blur-xl rounded-md overflow-hidden shadow-2xl shadow-black/5">
                                            <CardContent className="p-8 space-y-6">
                                                <div className="space-y-4">
                                                    <div className="flex items-center gap-3 group cursor-pointer" onClick={() => setActiveTab('emails')}>
                                                        <div className="w-10 rounded-md bg-muted/60 flex items-center justify-center opacity-40 group-hover:opacity-100 group-hover:text-primary transition-all">
                                                            <Mail size={16} />
                                                        </div>
                                                        <div>
                                                            <p className="text-[9px] text-muted-foreground opacity-40">Email Address</p>
                                                            <p className="text-xs font-bold">{candidateData.email}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-3 group cursor-pointer">
                                                        <div className="w-10 rounded-md bg-muted/60 flex items-center justify-center opacity-40 group-hover:opacity-100 group-hover:text-primary transition-all">
                                                            <Phone size={16} />
                                                        </div>
                                                        <div>
                                                            <p className="text-[9px] text-muted-foreground opacity-40">Phone Number</p>
                                                            <p className="text-xs font-bold">{candidateData.phone || "N/A"}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                                <Button 
                                                    variant="outline"
                                                    disabled={!candidateData.resumeUrl}
                                                    onClick={() => window.open(candidateData.resumeUrl, '_blank')}
                                                    className="w-full h-12 rounded-md text-[9px] gap-2 border-border/40 bg-muted/20 hover:bg-primary/5 hover:border-primary/20 transition-all"
                                                >
                                                    <Download size={14} /> Download Resume
                                                </Button>
                                                {candidateData.resumeUrl && (
                                                    <Button 
                                                        variant="ghost"
                                                        onClick={() => window.open(candidateData.resumeUrl, '_blank')}
                                                        className="w-full h-8 text-[9px] opacity-40 hover:opacity-100 mt-2"
                                                    >
                                                        <ExternalLink size={12} className="mr-2" /> View Resume In New Tab
                                                    </Button>
                                                )}
                                            </CardContent>
                                        </Card>
                                        
                                        {/* Skills Tag Card */}
                                        <Card className="border-border/40 bg-card/30 backdrop-blur-xl rounded-md overflow-hidden shadow-2xl shadow-black/5">
                                            <CardHeader>
                                                <CardTitle className="text-[10px] opacity-40">Top Skills</CardTitle>
                                            </CardHeader>
                                            <CardContent className="p-8 pt-0">
                                                <div className="flex flex-wrap gap-2">
                                                    {(candidateData.skills || []).map((skill, i) => (
                                                        <Badge key={i} variant="outline" className="h-8 rounded-md border-border/40 bg-muted/10 font-bold px-3 hover:bg-primary/10 hover:border-primary/40 transition-all cursor-default">
                                                            {skill}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent value="scorecards" className="mt-0 outline-none animate-in fade-in slide-in-from-bottom-2 duration-500">
                                {isScorecardOpen ? (
                                    <div className="space-y-6">
                                        <div className="flex items-center justify-between mb-2">
                                            <Button variant="ghost" onClick={() => setIsScorecardOpen(false)} className="text-[10px] opacity-40 hover:opacity-100">
                                                <ChevronLeft className="w-4 h-4 mr-2" /> Back to History
                                            </Button>
                                        </div>
                                        <Scorecards 
                                            candidate={candidateData} 
                                            onSubmit={handleSubmitScorecard} 
                                        />
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                        <div className="lg:col-span-2 space-y-6">
                                            {(candidateData.scorecards || []).map((card, i) => (
                                                <div key={i}>
                                                    <Card className="border-border/40 bg-card/30 backdrop-blur-xl rounded-md overflow-hidden shadow-2xl shadow-black/5">
                                                        <CardHeader className="flex flex-row items-center justify-between p-8 pb-4">
                                                            <div className="flex items-center gap-4">
                                                                <div className="w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center text-primary">
                                                                    {(card.interviewer?.name || "TM").split('').map(n => n[0]).join('')}
                                                                </div>
                                                                <div>
                                                                    <CardTitle className="text-lg">{card.stage}</CardTitle>
                                                                    <p className="text-[10px] opacity-40">by {card.interviewer?.name || "Team Member"} • {new Date(card.createdAt).toLocaleDateString()}</p>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-1.5 px-4 py-2 rounded-md bg-primary text-primary-foreground shadow-lg shadow-primary/20">
                                                                <Star size={14} className="fill-current" />
                                                                <span className="text-lg">{card.score}</span>
                                                            </div>
                                                        </CardHeader>
                                                        <CardContent className="p-8 pt-4">
                                                            <div className="p-6 rounded-md bg-muted/20 border border-border/10 italic text-xs font-medium leading-relaxed opacity-70">
                                                                "{card.feedback}"
                                                            </div>
                                                            <div className="grid grid-cols-3 gap-8 mt-8">
                                                                {Object.entries(card.attributes || {}).slice(0, 3).map(([key, val], idx) => (
                                                                    <div key={key} className="space-y-2">
                                                                        <div className="flex justify-between text-[9px] mb-1">
                                                                            <span className="capitalize">{key}</span>
                                                                            <span>{Number(val) * 20}%</span>
                                                                        </div>
                                                                        <Progress value={Number(val) * 20} className={`h-1.5 ${idx === 1 ? 'bg-emerald-500/10' : idx === 2 ? 'bg-blue-500/10' : 'bg-primary/10'}`} />
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                </div>
                                            ))}
                                            {(!candidateData.scorecards || candidateData.scorecards.length === 0) && (
                                                <div className="p-8 text-center text-muted-foreground border-dashed border border-border/40 rounded-xl">
                                                    No scorecards available.
                                                </div>
                                            )}
                                        </div>
                                        <div className="space-y-6">
                                            <Card className="border-border/40 bg-primary/5 backdrop-blur-xl rounded-md p-6 border-primary/20 text-center space-y-4 shadow-xl shadow-primary/5">
                                                <Award className="w-10 h-10 text-primary mx-auto opacity-60" />
                                                <div className="space-y-1">
                                                    <h3 className="text-base font-bold">Structured Feedback</h3>
                                                    <p className="text-xs font-medium text-muted-foreground leading-relaxed">
                                                        Ensure unbiased hiring by completing the structured scorecard for this round.
                                                    </p>
                                                </div>
                                                <Button 
                                                    onClick={() => setIsScorecardOpen(true)}
                                                    className="w-full h-10 rounded-md text-xs font-bold bg-primary shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all"
                                                >
                                                    Launch Scorecard
                                                </Button>
                                            </Card>

                                            {/* AI Interview Questions Copilot */}
                                            <Card className="border-border/40 bg-card/40 backdrop-blur-xl rounded-md p-6 border-border/40 space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <Sparkles className="w-4 h-4 text-primary" />
                                                        <h4 className="text-xs font-bold">AI Interview Questions</h4>
                                                    </div>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={handleGenerateAiQuestions}
                                                        disabled={isGeneratingQuestions}
                                                        className="h-7 text-[10px] font-bold bg-primary/5 border-primary/20 text-primary hover:bg-primary/10"
                                                    >
                                                        {isGeneratingQuestions ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Sparkles className="w-3 h-3 mr-1" />}
                                                        Generate
                                                    </Button>
                                                </div>
                                                
                                                {aiQuestions.length > 0 ? (
                                                    <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                                                        {aiQuestions.map((q, idx) => (
                                                            <div key={idx} className="p-3 rounded-md bg-muted/30 border border-border/20 space-y-1.5 text-left">
                                                                <div className="flex items-center justify-between gap-2">
                                                                    <Badge variant="outline" className="text-[9px] font-bold border-primary/30 text-primary">
                                                                        {q.category}
                                                                    </Badge>
                                                                    <Badge variant="secondary" className="text-[9px] font-bold">
                                                                        {q.difficulty}
                                                                    </Badge>
                                                                </div>
                                                                <p className="text-xs font-semibold text-foreground/90">{q.question}</p>
                                                                {q.objective && (
                                                                    <p className="text-[10px] text-muted-foreground"><span className="font-bold text-foreground/60">Objective:</span> {q.objective}</p>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <p className="text-[11px] text-muted-foreground/60 italic text-center py-2">
                                                        Click Generate to get tailored interview questions based on candidate resume and job requirements.
                                                    </p>
                                                )}
                                            </Card>
                                        </div>
                                    </div>
                                )}
                            </TabsContent>

                            <TabsContent value="emails" className="mt-0 outline-none animate-in fade-in slide-in-from-bottom-2 duration-500">
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                    <div className="lg:col-span-2 space-y-6">
                                        <Card className="border-border/40 bg-card/30 backdrop-blur-xl rounded-md overflow-hidden shadow-2xl shadow-black/5">
                                            <CardHeader className="p-6 pb-3 border-b border-border/10">
                                                <div className="flex items-center justify-between">
                                                    <CardTitle className="text-base font-bold">Candidate Outreach</CardTitle>
                                                    <div className="flex items-center gap-1 bg-muted/40 p-1 rounded-md border border-border/20">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => setCommChannel('whatsapp')}
                                                            className={`h-7 px-3 text-xs font-bold rounded-md transition-all ${commChannel === 'whatsapp' ? 'bg-emerald-500 text-white shadow-sm' : 'text-muted-foreground'}`}
                                                        >
                                                            <MessageSquare size={13} className="mr-1.5" /> WhatsApp
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => setCommChannel('email')}
                                                            className={`h-7 px-3 text-xs font-bold rounded-md transition-all ${commChannel === 'email' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground'}`}
                                                        >
                                                            <Mail size={13} className="mr-1.5" /> Email
                                                        </Button>
                                                    </div>
                                                </div>
                                            </CardHeader>
                                            <CardContent className="p-6 space-y-4">
                                                {commChannel === 'whatsapp' ? (
                                                    <>
                                                        <div className="flex items-center justify-between p-3 rounded-md bg-emerald-500/10 border border-emerald-500/20">
                                                            <div className="flex items-center gap-2">
                                                                <Phone className="w-4 h-4 text-emerald-500" />
                                                                <span className="text-xs font-bold text-foreground">{candidateData.phone || "No phone number available"}</span>
                                                            </div>
                                                            <Badge className="bg-emerald-500 text-white text-[9px]">KonnectX Cloud API</Badge>
                                                        </div>

                                                        {/* Quick Message Templates */}
                                                        <div className="space-y-1.5">
                                                            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Quick Templates</p>
                                                            <div className="flex flex-wrap gap-1.5">
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => setWhatsAppText(`Hi ${candidateData.name}, we loved your profile for ${candidateData.applications?.[0]?.job?.title || 'the open role'} and would like to schedule an interview. Please let us know your availability this week!`)}
                                                                    className="h-7 text-[10px] rounded-md border-border/30 hover:border-emerald-500/40 hover:bg-emerald-500/5"
                                                                >
                                                                    📅 Interview Invite
                                                                </Button>
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => setWhatsAppText(`Hello ${candidateData.name}, congratulations! Your application for ${candidateData.applications?.[0]?.job?.title || 'the role'} has been shortlisted for the next evaluation round.`)}
                                                                    className="h-7 text-[10px] rounded-md border-border/30 hover:border-emerald-500/40 hover:bg-emerald-500/5"
                                                                >
                                                                    ✨ Shortlisted
                                                                </Button>
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => setWhatsAppText(`Hi ${candidateData.name}, our hiring team is preparing your official offer letter for ${candidateData.applications?.[0]?.job?.title || 'the role'}. We will share the document shortly.`)}
                                                                    className="h-7 text-[10px] rounded-md border-border/30 hover:border-emerald-500/40 hover:bg-emerald-500/5"
                                                                >
                                                                    🎉 Offer Discussion
                                                                </Button>
                                                            </div>
                                                        </div>

                                                        <div className="space-y-1.5">
                                                            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">WhatsApp Message Body</p>
                                                            <Textarea 
                                                                value={whatsAppText}
                                                                onChange={(e) => setWhatsAppText(e.target.value)}
                                                                placeholder="Type your WhatsApp message..."
                                                                className="min-h-[160px] rounded-md bg-muted/20 border-border/30 font-medium text-xs p-4"
                                                            />
                                                        </div>

                                                        <div className="flex items-center justify-between pt-2">
                                                            <p className="text-[10px] text-muted-foreground">Direct 2-way message synced to KonnectX</p>
                                                            <Button 
                                                                onClick={handleSendWhatsApp}
                                                                disabled={isSendingWhatsApp || !candidateData.phone}
                                                                className="h-10 px-6 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-lg shadow-emerald-500/20"
                                                            >
                                                                {isSendingWhatsApp ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" /> : <Send size={13} className="mr-1.5" />}
                                                                Send WhatsApp
                                                            </Button>
                                                        </div>
                                                    </>
                                                ) : (
                                                    <>
                                                        <div className="space-y-2">
                                                            <p className="text-[10px] opacity-40">Recipient</p>
                                                            <Input value={candidateData.email} readOnly className="h-10 rounded-md bg-muted/20 border-border/20 font-bold text-xs" />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <p className="text-[10px] opacity-40">Subject</p>
                                                            <Input placeholder="Enter email subject..." className="h-10 rounded-md bg-muted/20 border-border/20 font-bold text-xs" />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <p className="text-[10px] opacity-40">Email Body</p>
                                                            <Textarea 
                                                                placeholder="Write your email message here..."
                                                                className="min-h-[160px] rounded-md bg-muted/20 border-border/20 font-medium text-xs p-4"
                                                            />
                                                        </div>
                                                        <div className="flex items-center justify-end pt-2">
                                                            <Button className="h-10 px-6 rounded-md bg-primary text-xs font-bold shadow-lg shadow-primary/20">
                                                                Send Email <Send size={13} className="ml-1.5" />
                                                            </Button>
                                                        </div>
                                                    </>
                                                )}
                                            </CardContent>
                                        </Card>
                                    </div>

                                    <div className="space-y-6">
                                        <Card className="border-border/40 bg-card/30 backdrop-blur-xl rounded-md overflow-hidden shadow-2xl shadow-black/5">
                                            <CardHeader className="p-6 pb-2">
                                                <div className="flex items-center justify-between">
                                                    <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Message History</CardTitle>
                                                    <Button variant="ghost" size="sm" onClick={loadCommunications} className="h-6 text-[10px] p-0">
                                                        Refresh
                                                    </Button>
                                                </div>
                                            </CardHeader>
                                            <CardContent className="p-6 pt-2 space-y-3 max-h-[360px] overflow-y-auto">
                                                {communications.length > 0 ? (
                                                    communications.map((comm) => (
                                                        <div key={comm.id} className="p-3 rounded-md bg-muted/20 border border-border/20 space-y-1">
                                                            <div className="flex items-center justify-between text-[10px]">
                                                                <Badge className={comm.direction === 'OUTBOUND' ? 'bg-primary/10 text-primary border-primary/20 text-[9px]' : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-[9px]'}>
                                                                    {comm.direction === 'OUTBOUND' ? 'Outgoing' : 'Incoming'} ({comm.channel})
                                                                </Badge>
                                                                <span className="text-muted-foreground opacity-60 text-[9px]">{comm.date}</span>
                                                            </div>
                                                            <p className="text-xs font-medium text-foreground/90 mt-1 whitespace-pre-wrap">{comm.body}</p>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <p className="text-[11px] text-muted-foreground/50 italic text-center py-6">
                                                        No recent communications logged.
                                                    </p>
                                                )}
                                            </CardContent>
                                        </Card>
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent value="notes" className="mt-0 outline-none animate-in fade-in slide-in-from-bottom-2 duration-500">
                                <Card className="border-border/40 bg-card/30 backdrop-blur-xl rounded-md overflow-hidden shadow-2xl shadow-black/5">
                                    <CardContent className="p-8 space-y-8">
                                        <div className="space-y-4">
                                            <h3 className="text-lg tracking-tighter opacity-40 text-[10px]">Collaborative Discussion</h3>
                                            <div className="space-y-4">
                                                {(candidateData.notes || []).map((note, i) => (
                                                    <div key={i} className="flex gap-4 p-6 rounded-md bg-muted/20 border border-border/10 items-start">
                                                        <Avatar className="w-10">
                                                            <AvatarFallback className="text-[10px] bg-primary/10 text-primary">AM</AvatarFallback>
                                                        </Avatar>
                                                        <div className="space-y-1">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-xs">{note.user?.name || note.author || "Team Member"}</span>
                                                                <span className="text-[10px] font-bold opacity-30">{new Date(note.createdAt || Date.now()).toLocaleDateString()}</span>
                                                            </div>
                                                            <p className="text-xs font-medium leading-relaxed opacity-70 italic">
                                                                "{note.content || note.text}"
                                                            </p>
                                                        </div>
                                                    </div>
                                                ))}
                                                {(!candidateData.notes || candidateData.notes.length === 0) && (
                                                    <div className="p-6 text-center text-muted-foreground text-sm border-dashed border border-border/40 rounded-xl">
                                                        No notes submitted yet.
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        
                                        <div className="space-y-4 pt-4 border-t border-border/10">
                                            <Textarea 
                                                placeholder="Type a team note... Use @ to mention colleagues"
                                                className="min-h-[120px] rounded-md bg-muted/30 border-none focus-visible:ring-1 focus-visible:ring-primary font-medium text-sm p-6"
                                                value={noteText}
                                                onChange={(e) => setNoteText(e.target.value)}
                                            />
                                            <div className="flex items-center justify-between">
                                                <p className="text-[10px] font-bold text-muted-foreground opacity-40 italic">Notes are only visible to the hiring team.</p>
                                                <Button 
                                                    onClick={handlePostNote}
                                                    className="h-12 px-8 rounded-md bg-primary text-[10px] shadow-lg shadow-primary/20"
                                                >
                                                    Post Note <Send size={12} className="ml-2" />
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="timeline" className="mt-0 outline-none animate-in fade-in slide-in-from-bottom-2 duration-500">
                                <Card className="border-border/40 bg-card/30 backdrop-blur-xl rounded-md overflow-hidden shadow-2xl shadow-black/5">
                                    <CardContent className="p-12">
                                        <div className="relative space-y-12 before:absolute before:inset-0 before:left-0 before:w-[2px] before:bg-border/20 before:ml-1 mt-4 max-w-2xl mx-auto">
                                            {[{ stage: "Applied", date: new Date(candidateData.createdAt).toLocaleDateString(), status: "completed" }].map((step, i) => (
                                                <div key={i} className="relative pl-12 group">
                                                    <div className={`absolute left-[-7px] top-1 w-4 h-4 rounded-full border-4 border-background z-10 ${
                                                        step.status === 'completed' ? 'bg-emerald-500 shadow-lg shadow-emerald-500/40 scale-110' : 
                                                        step.status === 'active' ? 'bg-primary shadow-lg shadow-primary/40 p-1 animate-pulse scale-150' : 
                                                        'bg-muted'
                                                    }`} />
                                                    <div className="space-y-1 p-6 rounded-md bg-muted/10 border border-transparent group-hover:bg-primary/5 group-hover:border-primary/20 transition-all cursor-default">
                                                        <div className="flex items-center justify-between">
                                                            <h4 className={`text-xl ${step.status === 'completed' ? 'opacity-40' : 'opacity-100'}`}>
                                                                {step.stage}
                                                            </h4>
                                                            {step.status === 'completed' && <CheckCircle2 size={20} className="text-emerald-500" />}
                                                            {step.status === 'active' && <Play size={16} className="text-primary fill-current" />}
                                                        </div>
                                                        {step.date && <p className="text-xs font-bold text-muted-foreground italic">{step.date}</p>}
                                                        <p className="text-xs font-medium opacity-40 mt-3 leading-relaxed">
                                                            System logged activity for {step.stage.toLowerCase()} stage. {step.status === 'completed' ? 'Successfully transitioned.' : 'Currently in progress.'}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="resume" className="mt-0 outline-none animate-in fade-in slide-in-from-bottom-2 duration-500 h-[70vh]">
                                <Card className="border-border/40 bg-card/30 backdrop-blur-xl rounded-md overflow-hidden shadow-2xl shadow-black/5 h-full flex flex-col">
                                    <CardContent className="p-0 flex-1 h-full relative">
                                        {candidateData.resumeUrl ? (
                                            <iframe 
                                                src={`${candidateData.resumeUrl}#toolbar=0`} 
                                                className="absolute inset-0 w-full h-full border-none" 
                                                title="Candidate Resume" 
                                            />
                                        ) : (
                                            <div className="flex flex-col h-full items-center justify-center text-muted-foreground p-12 text-sm italic">
                                                <FileText className="w-12 h-12 opacity-20 mb-4" />
                                                No resume file attached.
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </div>
                )}

                {/* Delete Candidate Confirmation Modal */}
                <Dialog open={isDeleteDialogOpen} onOpenChange={(open) => !open && !isDeleting && setIsDeleteDialogOpen(false)}>
                    <DialogContent className="sm:max-w-[425px] bg-card/95 backdrop-blur-2xl border-destructive/20 shadow-2xl">
                        <DialogHeader>
                            <DialogTitle className="text-lg font-bold text-destructive flex items-center gap-2">
                                <Trash2 className="w-5 h-5" /> Delete Candidate
                            </DialogTitle>
                            <DialogDescription className="text-xs font-medium text-muted-foreground mt-2">
                                Are you sure you want to delete <span className="font-bold text-foreground">{candidateData?.name}</span>? 
                                This will permanently remove their application records, scorecards, and notes. This action cannot be undone.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter className="gap-2 sm:gap-0 mt-4">
                            <Button
                                variant="outline"
                                onClick={() => setIsDeleteDialogOpen(false)}
                                disabled={isDeleting}
                                className="rounded-md font-bold"
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={handleDeleteCandidate}
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

                {/* Interactive Offer Builder Modal */}
                <OfferBuilderModal
                    isOpen={isOfferModalOpen}
                    onClose={() => setIsOfferModalOpen(false)}
                    candidate={candidateData}
                    workspaceId={workspaceId}
                />
            </SheetContent>
        </Sheet>
    );
};