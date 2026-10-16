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
    DollarSign,
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
    History,
    Users,
    Columns,
    Bot,
    Zap,
    Copy,
    Check,
    RotateCcw,
    Brain
} from 'lucide-react';
import Scorecards from './Scorecards';
import InterviewKitTab from './InterviewKitTab';
import CandidateNotesTab from './CandidateNotesTab';
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
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
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
import AddContactModal from './AddContactModal';
import InterviewBookingModal from './InterviewBookingModal';
import {
    getCandidateByIdAction,
    deleteCandidateAction,
    createCandidateNoteAction,
    createCandidateScorecardAction,
    aiParseResumeAction,
    sendCandidateWhatsAppAction,
    getCandidateCommunicationsAction,
    generateAiInterviewQuestionsAction,
    chatCandidateCopilotAction,
    updateCandidateAction
} from '../_actions/candidate-actions';
import { updateApplicationStageAction } from '../_actions/pipeline-actions';

import useSWR from 'swr';

const getInitials = (name) => {
    if (!name) return "";
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return "";
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const SALES_RATING_CRITERIA = [
    {
        id: 'communication_confidence',
        label: 'Communication and confidence',
        description: 'Clarity, articulation, vocal tone, self-assurance, and articulate expression in conversation.',
        icon: MessageSquare,
        color: 'text-amber-500 bg-amber-500/10 border-amber-500/20'
    },
    {
        id: 'previous_sales_experience',
        label: 'Previous sales experience',
        description: 'Direct sales track record, quota achievement, dealing with objections, and revenue closing.',
        icon: Briefcase,
        color: 'text-blue-500 bg-blue-500/10 border-blue-500/20'
    },
    {
        id: 'find_new_customers',
        label: 'Ability to find new customers',
        description: 'Lead generation, cold outreach strategy, territory prospecting, and pipeline building.',
        icon: Users,
        color: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20'
    },
    {
        id: 'convince_customers',
        label: 'Ability to convince customers',
        description: 'Value proposition delivery, objection handling, persuasive negotiation, and closing capability.',
        icon: Zap,
        color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20'
    },
    {
        id: 'willingness_learn_it',
        label: 'Willingness to learn IT products',
        description: 'Aptitude and enthusiasm for understanding tech architecture, SaaS tools, and software solutions.',
        icon: GraduationCap,
        color: 'text-purple-500 bg-purple-500/10 border-purple-500/20'
    },
    {
        id: 'team_management',
        label: 'Team management',
        description: 'Collaboration, peer support, conflict resolution, leadership potential, and team alignment.',
        icon: Award,
        color: 'text-cyan-500 bg-cyan-500/10 border-cyan-500/20'
    },
    {
        id: 'practical_role_play',
        label: 'Practical role-play',
        description: 'On-the-spot mock customer pitch performance, handling unexpected hurdles, and adaptability.',
        icon: Play,
        color: 'text-rose-500 bg-rose-500/10 border-rose-500/20'
    }
];

const RATING_LEVEL_LABELS = {
    1: { label: 'Poor', desc: 'Unsatisfactory / clear red flags' },
    2: { label: 'Below Avg', desc: 'Needs significant coaching' },
    3: { label: 'Competent', desc: 'Meets role requirements' },
    4: { label: 'Strong', desc: 'Above average proficiency' },
    5: { label: 'Exceptional', desc: 'Role model / top 5% talent' }
};

const INITIAL_CANDIDATE_RATINGS = {
    communication_confidence: 3,
    previous_sales_experience: 3,
    find_new_customers: 3,
    convince_customers: 3,
    willingness_learn_it: 3,
    team_management: 3,
    practical_role_play: 3
};

export const CandidateDetailsModal = ({ isOpen, onClose, candidateId, workspaceId, onDeleteSuccess }) => {
    const [activeTab, setActiveTab] = useState('overview');
    const [isScorecardOpen, setIsScorecardOpen] = useState(false);
    const [isInterviewModalOpen, setIsInterviewModalOpen] = useState(false);
    const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
    const [isParsing, setIsParsing] = useState(false);
    const [isScoring, setIsScoring] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isAddContactOpen, setIsAddContactOpen] = useState(false);

    // Communication & WhatsApp State
    const [commChannel, setCommChannel] = useState('whatsapp');
    const [whatsAppText, setWhatsAppText] = useState('');
    const [isSendingWhatsApp, setIsSendingWhatsApp] = useState(false);
    const [communications, setCommunications] = useState([]);
    const [isLoadingComms, setIsLoadingComms] = useState(false);
    const [isSplitView, setIsSplitView] = useState(true);

    // Sales Competency Rating State (Communication, Sales Exp, New Customers, Convince, Learn IT, Team Mgmt, Role-play)
    const [candidateRatings, setCandidateRatings] = useState(INITIAL_CANDIDATE_RATINGS);
    const [candidateRatingRecommendation, setCandidateRatingRecommendation] = useState('yes');
    const [candidateRatingNotes, setCandidateRatingNotes] = useState('');
    const [isSubmittingRating, setIsSubmittingRating] = useState(false);
    const [ratingRound, setRatingRound] = useState('Interview Round 1');

    const handleRatingScoreChange = (id, score) => {
        setCandidateRatings(prev => ({
            ...prev,
            [id]: score
        }));
    };

    const ratingScoresArray = Object.values(candidateRatings);
    const ratingAverage = ratingScoresArray.reduce((acc, v) => acc + (Number(v) || 0), 0) / Math.max(1, ratingScoresArray.length);
    const ratingPercentage = Math.round((ratingAverage / 5) * 100);

    const handleSubmitCandidateRating = async () => {
        setIsSubmittingRating(true);
        try {
            const res = await createCandidateScorecardAction(workspaceId, {
                candidateId,
                applicationId: candidateData?.applications?.[0]?.id,
                stage: candidateData?.applications?.[0]?.stage || 'INTERVIEW',
                scores: candidateRatings,
                score: parseFloat(ratingAverage.toFixed(1)),
                overallScore: parseFloat(ratingAverage.toFixed(1)),
                feedback: candidateRatingNotes.trim() || `Sales Competency Evaluation completed (${ratingRound}) with rating ${ratingAverage.toFixed(1)}/5 (${ratingPercentage}%)`,
                recommendation: candidateRatingRecommendation
            });

            if (!res.success) throw new Error(res.error);

            // Also sync candidate aiMatchScore with percentage in DB
            await updateCandidateAction(workspaceId, candidateId, {
                aiMatchScore: ratingPercentage
            }).catch(() => null);

            toast.success(`Evaluation saved! Candidate rated ${ratingAverage.toFixed(1)}/5.0 (${ratingPercentage}%)`);
            setCandidateRatingNotes('');
            mutate();
        } catch (err) {
            console.error("[SUBMIT_CANDIDATE_RATING_ERROR]", err);
            toast.error(err.message || "Failed to submit candidate rating");
        } finally {
            setIsSubmittingRating(false);
        }
    };

    const handleStageChange = async (newStage) => {
        const appId = candidateData?.applications?.[0]?.id;
        if (!appId) return;
        try {
            const res = await updateApplicationStageAction(workspaceId, appId, newStage);
            if (!res.success) throw new Error(res.error);
            toast.success(`Candidate advanced to ${newStage}`);
            mutate();
        } catch (err) {
            toast.error(err.message || "Failed to update stage");
        }
    };

    // AI Interview Questions State
    const [aiQuestions, setAiQuestions] = useState([]);
    const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);

    // FlowGenix AI Recruiter Copilot State
    const [copilotMessages, setCopilotMessages] = useState([
        {
            id: 'init-msg',
            role: 'assistant',
            content: `👋 **Welcome to FlowGenix Recruiter Copilot!**\n\nI have loaded this candidate's background, parsed skills, and requisition context. You can ask me to evaluate their experience, highlight blind spots, draft outreach messages, or conduct interview prep.`,
            aiMeta: { resolvedModel: 'FlowGenix Auto/Smart', resolvedProvider: 'FLOWGENIX', latencyMs: 0 }
        }
    ]);
    const [copilotInput, setCopilotInput] = useState('');
    const [isCopilotTyping, setIsCopilotTyping] = useState(false);
    const [copilotModel, setCopilotModel] = useState('auto/smart');
    const [copiedId, setCopiedId] = useState(null);

    const handleSendCopilot = async (overridePrompt) => {
        const textToSend = typeof overridePrompt === 'string' ? overridePrompt : copilotInput;
        if (!textToSend.trim() || isCopilotTyping) return;

        const userMsg = {
            id: `user-${Date.now()}`,
            role: 'user',
            content: textToSend.trim()
        };

        const updatedHistory = [...copilotMessages, userMsg];
        setCopilotMessages(updatedHistory);
        setCopilotInput('');
        setIsCopilotTyping(true);

        try {
            const apiMessages = updatedHistory
                .filter(m => m.id !== 'init-msg')
                .map(m => ({ role: m.role, content: m.content }));

            const res = await chatCandidateCopilotAction(workspaceId, {
                candidateId,
                messages: apiMessages,
                model: copilotModel
            });

            if (!res.success) throw new Error(res.error);

            setCopilotMessages(prev => [
                ...prev,
                {
                    id: `assistant-${Date.now()}`,
                    role: 'assistant',
                    content: res.message.content,
                    aiMeta: res.aiMeta
                }
            ]);
        } catch (err) {
            toast.error(err.message || "Failed to get copilot answer");
            setCopilotMessages(prev => [
                ...prev,
                {
                    id: `error-${Date.now()}`,
                    role: 'assistant',
                    content: `⚠️ **Evaluation Error:** ${err.message || 'The AI gateway encountered a temporary timeout. Please try again.'}`,
                    isError: true
                }
            ]);
        } finally {
            setIsCopilotTyping(false);
        }
    };

    const handleCopyText = (id, text) => {
        if (!navigator?.clipboard) return;
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        toast.success("Copied to clipboard!");
        setTimeout(() => setCopiedId(null), 2000);
    };

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

    if (!isOpen) return null;

    return (
        <Sheet open={isOpen} onOpenChange={(val) => !val && onClose()}>
            <SheetContent className="sm:max-w-[94vw] w-[96vw] max-w-[1600px] h-full p-0 border-0 bg-transparent flex flex-col p-2">

                <div className='border bg-background/50 backdrop-blur-2xl rounded-md overflow-hidden h-full flex flex-col'>
                    <ScrollArea className="h-full w-full">
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
                            <div className="flex flex-col gap-6 p-6 max-w-[1550px] mx-auto animate-in fade-in duration-500 w-full">
                                {/* Header / Candidate Context */}
                                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-border/20">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-14 w-14 border-2 border-primary/20 shadow-md">
                                                <AvatarFallback className="bg-primary/10 text-primary text-lg font-bold">
                                                    {getInitials(candidateData.name)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <div className="flex items-center gap-2.5">
                                                    <SheetTitle className="text-2xl font-bold tracking-tight">{candidateData.name}</SheetTitle>
                                                    <div className="w-36">
                                                        <Select
                                                            value={candidateData.applications?.[0]?.stage || "APPLIED"}
                                                            onValueChange={handleStageChange}
                                                        >
                                                            <SelectTrigger className="h-7 text-[10px] font-bold rounded-md bg-emerald-500/10 text-emerald-500 border-emerald-500/20 px-2">
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent className="text-xs">
                                                                <SelectItem value="APPLIED">Stage: Applied</SelectItem>
                                                                <SelectItem value="SCREENING">Stage: Screening</SelectItem>
                                                                <SelectItem value="INTERVIEW">Stage: Interview</SelectItem>
                                                                <SelectItem value="OFFERED">Stage: Offered</SelectItem>
                                                                <SelectItem value="HIRED">Stage: Hired</SelectItem>
                                                                <SelectItem value="REJECTED">Stage: Archived / Rejected</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground flex-wrap">
                                                    <span className="font-semibold text-foreground/80">{candidateData.applications?.[0]?.job?.title || "Candidate"}</span>
                                                    <span>•</span>
                                                    <span>{candidateData.email}</span>
                                                    {candidateData.phone && (
                                                        <>
                                                            <span>•</span>
                                                            <span>{candidateData.phone}</span>
                                                        </>
                                                    )}
                                                    {candidateData.parsedData?.noticePeriod && (
                                                        <>
                                                            <span>•</span>
                                                            <Badge variant="outline" className="text-[10px] bg-cyan-500/10 text-cyan-400 border-cyan-500/30 py-0 h-5 font-semibold">
                                                                <Clock size={10} className="mr-1" /> Notice: {candidateData.parsedData.noticePeriod}
                                                            </Badge>
                                                        </>
                                                    )}
                                                    {candidateData.parsedData?.expectedSalary && (
                                                        <>
                                                            <span>•</span>
                                                            <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-400 border-emerald-500/30 py-0 h-5 font-semibold">
                                                                <DollarSign size={10} className="mr-1" /> Exp CTC: {candidateData.parsedData.expectedSalary}
                                                            </Badge>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 flex-wrap">
                                        {/* Split-Screen Toggle */}
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setIsSplitView(prev => !prev)}
                                            className={`h-8 rounded-md text-[10px] font-bold border-border/40 gap-1.5 transition-all ${
                                                isSplitView ? 'bg-primary/20 text-primary border-primary/40' : 'bg-card/40'
                                            }`}
                                            title="Toggle Split-Screen evaluation (Resume alongside notes)"
                                        >
                                            <Columns size={13} />
                                            <span>{isSplitView ? "Split Screen" : "Single View"}</span>
                                        </Button>

                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={handleAiParse}
                                            disabled={isParsing}
                                            className="h-8 rounded-md text-[10px] bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 transition-all font-bold gap-1"
                                        >
                                            {isParsing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                                            AI Parse
                                        </Button>

                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setActiveTab('interview_kit')}
                                            className={`h-8 rounded-md text-[10px] font-bold border-indigo-500/30 gap-1.5 transition-all ${
                                                activeTab === 'interview_kit'
                                                    ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/50'
                                                    : 'bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20'
                                            }`}
                                            title="Open AI Interview Kit & Question Rubric"
                                        >
                                            <Brain size={13} />
                                            <span>Interview Kit</span>
                                        </Button>

                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setIsAddContactOpen(true)}
                                            className="h-8 rounded-md text-[10px] bg-card/60 border-border/40 hover:bg-primary/10 hover:text-primary transition-all font-bold gap-1"
                                            title="Save Candidate as CRM Contact"
                                        >
                                            <Users className="w-3.5 h-3.5 text-primary" />
                                            <span>Add CRM</span>
                                        </Button>

                                        <Button
                                            onClick={() => setIsInterviewModalOpen(true)}
                                            size="sm"
                                            variant="outline"
                                            className="h-8 rounded-md px-3 text-[10px] bg-indigo-500/10 text-indigo-400 border-indigo-500/20 hover:bg-indigo-500/20 font-bold gap-1"
                                            title="Schedule Interview / Generate Candidate Self-Booking Link"
                                        >
                                            <Calendar className="w-3 h-3" />
                                            <span>Schedule</span>
                                        </Button>

                                        <Button
                                            onClick={() => setIsOfferModalOpen(true)}
                                            size="sm"
                                            className="h-8 rounded-md px-3 text-[10px] bg-primary font-bold shadow-md shadow-primary/20 gap-1"
                                        >
                                            <FileCheck className="w-3 h-3" />
                                            Offer
                                        </Button>

                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 rounded-md opacity-60 hover:opacity-100 hover:text-destructive hover:bg-destructive/10"
                                            onClick={() => setIsDeleteDialogOpen(true)}
                                            title="Delete Candidate"
                                        >
                                            <Trash2 size={15} />
                                        </Button>
                                    </div>
                                </div>

                                {/* Split Screen Grid Container */}
                                <div className={isSplitView ? "grid grid-cols-1 lg:grid-cols-12 gap-6 items-start" : "space-y-6"}>
                                    {isSplitView && (
                                        <div className="lg:col-span-6 xl:col-span-6 h-[calc(100vh-190px)] sticky top-0 flex flex-col">
                                            <ResumeViewerPane
                                                candidateData={candidateData}
                                                isParsing={isParsing}
                                                handleAiParse={handleAiParse}
                                            />
                                        </div>
                                    )}

                                    <div className={isSplitView ? "lg:col-span-6 xl:col-span-6 h-[calc(100vh-190px)] overflow-y-auto pr-1" : "w-full"}>
                                        {/* Hub Tabs */}
                                        <Tabs value={activeTab} className="space-y-6" onValueChange={setActiveTab}>
                                            <div className="flex items-center justify-between">
                                                <TabsList className="bg-muted/30 p-1 rounded-md h-10 backdrop-blur-xl border border-border/20 flex-wrap">
                                                    <TabsTrigger value="overview" className="rounded-md px-3 text-xs data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-xl">Overview</TabsTrigger>
                                                    <TabsTrigger value="copilot" className="rounded-md px-3 text-xs data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-sm font-bold flex items-center gap-1.5">
                                                        <Sparkles className="w-3.5 h-3.5 text-primary" />
                                                        AI Copilot
                                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                                    </TabsTrigger>
                                                    <TabsTrigger value="interview_kit" className="rounded-md px-3 text-xs data-[state=active]:bg-indigo-500/15 data-[state=active]:text-indigo-400 data-[state=active]:shadow-sm font-bold flex items-center gap-1.5">
                                                        <Brain className="w-3.5 h-3.5 text-indigo-400" />
                                                        Interview Kit
                                                        <span className="text-[9px] bg-indigo-500/20 text-indigo-300 px-1 py-0.2 rounded font-mono font-bold">AI</span>
                                                    </TabsTrigger>
                                                    <TabsTrigger value="rate" className="rounded-md px-3 text-xs data-[state=active]:bg-card data-[state=active]:text-amber-500 data-[state=active]:shadow-xl font-bold flex items-center gap-1.5">
                                                        <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500/20" />
                                                        Rate Candidate
                                                    </TabsTrigger>
                                                    <TabsTrigger value="scorecards" className="rounded-md px-3 text-xs data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-xl">Scorecards</TabsTrigger>
                                                    <TabsTrigger value="emails" className="rounded-md px-3 text-xs data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-xl">WhatsApp</TabsTrigger>
                                                    <TabsTrigger value="notes" className="rounded-md px-3 text-xs data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-xl">Notes</TabsTrigger>
                                                    <TabsTrigger value="timeline" className="rounded-md px-3 text-xs data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-xl">Activity</TabsTrigger>
                                                    {!isSplitView && (
                                                        <TabsTrigger value="resume" className="rounded-md px-3 text-xs data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-xl">Resume</TabsTrigger>
                                                    )}
                                                </TabsList>
                                            </div>

                                            <TabsContent value="overview" className="mt-0 outline-none animate-in fade-in slide-in-from-bottom-2 duration-500">
                                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                            <div className="lg:col-span-2 space-y-8">
                                                {/* AI Smart Summary Card */}
                                                {(() => {
                                                    const aiData = candidateData.parsedData || candidateData.aiInsights || {};
                                                    const scoreVal = candidateData.aiMatchScore !== null && candidateData.aiMatchScore !== undefined
                                                        ? candidateData.aiMatchScore
                                                        : (aiData.aiMatchScore || null);

                                                    return (
                                                        <Card className="border-border/40 bg-card/30 backdrop-blur-xl rounded-md overflow-hidden shadow-2xl shadow-black/5 relative hover:border-primary/20 transition-all cursor-default group">
                                                            <div className="absolute top-0 right-0 p-6">
                                                                <div className="text-right">
                                                                    <p className="text-[10px] text-primary mb-1 uppercase tracking-wider font-bold">FlowGenix AI Match</p>
                                                                    <h3 className="text-3xl font-black text-primary">
                                                                        {scoreVal !== null ? `${scoreVal}%` : 'N/A'}
                                                                    </h3>
                                                                    <p className="text-[10px] text-muted-foreground font-medium mt-0.5">
                                                                        {scoreVal !== null ? `${(scoreVal / 20).toFixed(1)} / 5.0 Rating` : 'Unrated'}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <CardHeader className="p-6 pb-4 border-b border-border/10">
                                                                <div className="flex items-center justify-between gap-4 pr-32">
                                                                    <div className="flex items-center gap-3">
                                                                        <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:scale-105 transition-transform shrink-0 shadow-inner">
                                                                            <Sparkles size={18} />
                                                                        </div>
                                                                        <div>
                                                                            <div className="flex items-center gap-2 flex-wrap">
                                                                                <CardTitle className="text-lg font-bold">AI Candidate Insight</CardTitle>
                                                                                <Badge variant="outline" className="text-[9px] bg-primary/10 text-primary border-primary/20 font-bold px-1.5 py-0">
                                                                                    FlowGenix AI
                                                                                </Badge>
                                                                                {aiData.seniorityLevel && (
                                                                                    <Badge variant="secondary" className="text-[9px] font-semibold">
                                                                                        {aiData.seniorityLevel}
                                                                                    </Badge>
                                                                                )}
                                                                            </div>
                                                                            <p className="text-[10px] text-muted-foreground mt-0.5">
                                                                                {aiData.aiProvider ? `Powered by FlowGenix Gateway (${aiData.aiProvider}/${aiData.aiModel || 'auto'})` : 'Powered by FlowGenix ATS Router'}
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                    <Button
                                                                        variant="outline"
                                                                        size="sm"
                                                                        onClick={handleAiParse}
                                                                        disabled={isParsing}
                                                                        className="h-8 rounded-md text-[10px] bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 transition-all font-bold gap-1 shrink-0"
                                                                    >
                                                                        {isParsing ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Sparkles className="h-3 w-3 mr-1" />}
                                                                        Analyze Resume
                                                                    </Button>
                                                                </div>
                                                            </CardHeader>
                                                            <CardContent className="p-6 space-y-5">
                                                                <p className="text-xs font-medium leading-relaxed text-foreground/90 bg-muted/20 p-3.5 rounded-lg border border-border/20">
                                                                    {aiData.summary || candidateData.aiSummary || candidateData.summary || "Deep analysis pending... Click 'Analyze Resume' above to run FlowGenix ATS evaluation."}
                                                                </p>

                                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                    <div className="space-y-2 p-3.5 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
                                                                        <h4 className="text-xs font-bold text-emerald-500 flex items-center gap-1.5">
                                                                            <CheckCircle2 size={14} /> Key Strengths
                                                                        </h4>
                                                                        <div className="space-y-1.5">
                                                                            {(aiData.pros && aiData.pros.length > 0) ? (
                                                                                aiData.pros.map((pro, i) => (
                                                                                    <div key={i} className="flex items-start gap-2 text-xs font-medium text-foreground/85">
                                                                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 mt-1.5" />
                                                                                        <span>{pro}</span>
                                                                                    </div>
                                                                                ))
                                                                            ) : (
                                                                                <p className="text-[11px] text-muted-foreground/60 italic">Run analysis to identify key candidate strengths</p>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                    <div className="space-y-2 p-3.5 rounded-lg bg-amber-500/5 border border-amber-500/20">
                                                                        <h4 className="text-xs font-bold text-amber-500 flex items-center gap-1.5">
                                                                            <AlertCircle size={14} /> Considerations & Gaps
                                                                        </h4>
                                                                        <div className="space-y-1.5">
                                                                            {(aiData.cons && aiData.cons.length > 0) ? (
                                                                                aiData.cons.map((con, i) => (
                                                                                    <div key={i} className="flex items-start gap-2 text-xs font-medium text-foreground/85">
                                                                                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0 mt-1.5" />
                                                                                        <span>{con}</span>
                                                                                    </div>
                                                                                ))
                                                                            ) : (
                                                                                <p className="text-[11px] text-muted-foreground/60 italic">Run analysis to identify potential resume gaps</p>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                {((aiData.matchedSkills && aiData.matchedSkills.length > 0) || (aiData.missingSkills && aiData.missingSkills.length > 0)) && (
                                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                                                                        {aiData.matchedSkills && aiData.matchedSkills.length > 0 && (
                                                                            <div className="space-y-1.5">
                                                                                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">Matched Job Requirements</span>
                                                                                <div className="flex flex-wrap gap-1.5">
                                                                                    {aiData.matchedSkills.map((s, idx) => (
                                                                                        <Badge key={idx} variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-400 border-emerald-500/30 font-semibold">
                                                                                            ✓ {s}
                                                                                        </Badge>
                                                                                    ))}
                                                                                </div>
                                                                            </div>
                                                                        )}
                                                                        {aiData.missingSkills && aiData.missingSkills.length > 0 && (
                                                                            <div className="space-y-1.5">
                                                                                <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider block">Missing / Unverified Skills</span>
                                                                                <div className="flex flex-wrap gap-1.5">
                                                                                    {aiData.missingSkills.map((s, idx) => (
                                                                                        <Badge key={idx} variant="outline" className="text-[10px] bg-rose-500/10 text-rose-400 border-rose-500/30 font-semibold">
                                                                                            ✕ {s}
                                                                                        </Badge>
                                                                                    ))}
                                                                                </div>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                )}

                                                                {aiData.recommendedAction && (
                                                                    <div className="flex items-center justify-between p-2.5 rounded-lg bg-card/60 border border-border/40 text-xs">
                                                                        <span className="text-muted-foreground font-semibold">Recommended ATS Action:</span>
                                                                        <Badge variant="outline" className="font-bold border-primary/30 text-primary bg-primary/10 text-xs">
                                                                            {aiData.recommendedAction}
                                                                        </Badge>
                                                                    </div>
                                                                )}
                                                            </CardContent>
                                                        </Card>
                                                    );
                                                })()}

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
                                                                        <div className="w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center text-primary font-bold">
                                                                            {getInitials(card.interviewer?.displayName || card.interviewer?.username || card.interviewer?.name) || "TM"}
                                                                        </div>
                                                                        <div>
                                                                            <CardTitle className="text-lg">{card.stage}</CardTitle>
                                                                            <p className="text-[10px] opacity-40">by {card.interviewer?.displayName || card.interviewer?.username || card.interviewer?.name || "Team Member"} • {new Date(card.createdAt).toLocaleDateString()}</p>
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
                                                            <ScrollArea className="h-[350px] pr-2">
                                                                <div className="space-y-3">
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
                                                            </ScrollArea>
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
                                                    <CardContent className="p-6 pt-2">
                                                        <ScrollArea className="h-[360px] pr-2">
                                                            <div className="space-y-3">
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
                                                            </div>
                                                        </ScrollArea>
                                                    </CardContent>
                                                </Card>
                                            </div>
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="notes" className="mt-0 outline-none animate-in fade-in slide-in-from-bottom-2 duration-500">
                                        <CandidateNotesTab
                                            candidate={candidateData}
                                            workspaceId={workspaceId}
                                            onNoteAdded={mutate}
                                            getInitials={getInitials}
                                        />
                                    </TabsContent>

                                    <TabsContent value="timeline" className="mt-0 outline-none animate-in fade-in slide-in-from-bottom-2 duration-500">
                                        <Card className="border-border/40 bg-card/30 backdrop-blur-xl rounded-md overflow-hidden shadow-2xl shadow-black/5">
                                            <CardContent className="p-12">
                                                <div className="relative space-y-12 before:absolute before:inset-0 before:left-0 before:w-[2px] before:bg-border/20 before:ml-1 mt-4 max-w-2xl mx-auto">
                                                    {[{ stage: "Applied", date: new Date(candidateData.createdAt).toLocaleDateString(), status: "completed" }].map((step, i) => (
                                                        <div key={i} className="relative pl-12 group">
                                                            <div className={`absolute left-[-7px] top-1 w-4 h-4 rounded-full border-4 border-background z-10 ${step.status === 'completed' ? 'bg-emerald-500 shadow-lg shadow-emerald-500/40 scale-110' :
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

                                    <TabsContent value="copilot" className="mt-0 outline-none animate-in fade-in slide-in-from-bottom-2 duration-500">
                                        <Card className="border-border/40 bg-card/40 backdrop-blur-xl rounded-xl overflow-hidden shadow-2xl flex flex-col h-[calc(100vh-210px)]">
                                            {/* Copilot Header */}
                                            <div className="p-4 border-b border-border/30 bg-background/50 backdrop-blur-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 via-primary/10 to-transparent border border-primary/30 flex items-center justify-center text-primary shadow-inner">
                                                        <Sparkles className="w-5 h-5 animate-pulse" />
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <h3 className="text-sm font-bold tracking-tight">FlowGenix Recruiter Copilot</h3>
                                                            <Badge variant="outline" className="h-5 px-1.5 text-[9px] font-bold border-primary/30 bg-primary/10 text-primary">
                                                                Multi-Agent Engine
                                                            </Badge>
                                                        </div>
                                                        <p className="text-[11px] text-muted-foreground font-medium">
                                                            Paired with {candidateData?.name} • {candidateData?.applications?.[0]?.job?.title || 'Open Requisition'}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <Select value={copilotModel} onValueChange={setCopilotModel}>
                                                        <SelectTrigger className="h-8 text-[11px] font-semibold rounded-lg bg-card/60 border-border/40 w-44">
                                                            <Zap className="w-3 h-3 mr-1.5 text-amber-400" />
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent className="text-xs">
                                                            <SelectItem value="auto/smart">Auto/Smart (Reasoning)</SelectItem>
                                                            <SelectItem value="auto/fast">Auto/Fast (Low Latency)</SelectItem>
                                                            <SelectItem value="auto/coding">Auto/Coding (Technical)</SelectItem>
                                                            <SelectItem value="auto/cheap">Auto/Cost-Effective</SelectItem>
                                                        </SelectContent>
                                                    </Select>

                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => setCopilotMessages([
                                                            {
                                                                id: 'init-msg',
                                                                role: 'assistant',
                                                                content: `👋 **Welcome to FlowGenix Recruiter Copilot!**\n\nI have loaded this candidate's background, parsed skills, and requisition context. You can ask me to evaluate their experience, highlight blind spots, draft outreach messages, or conduct interview prep.`,
                                                                aiMeta: { resolvedModel: 'FlowGenix Auto/Smart', resolvedProvider: 'FLOWGENIX', latencyMs: 0 }
                                                            }
                                                        ])}
                                                        className="h-8 w-8 p-0 rounded-lg border-border/40 hover:bg-muted/40"
                                                        title="Reset Conversation"
                                                    >
                                                        <RotateCcw className="w-3.5 h-3.5 text-muted-foreground" />
                                                    </Button>
                                                </div>
                                            </div>

                                            {/* Quick Suggestion Chips */}
                                            <div className="px-4 py-2.5 border-b border-border/20 bg-muted/10 shrink-0 overflow-x-auto flex items-center gap-2">
                                                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground shrink-0">Prompts:</span>
                                                {[
                                                    { label: "🎯 Analyze Skill Match", prompt: "Perform a detailed comparison between this candidate's resume/skills and the target job requirements. Highlight matched skills, missing skills, and key gaps." },
                                                    { label: "💬 Draft WhatsApp Outreach", prompt: "Draft a concise, high-converting WhatsApp outreach message to this candidate referencing their specific background and inviting them for an initial screen." },
                                                    { label: "❓ 5 Probe Questions", prompt: "Generate 5 tough, high-signal interview questions probing this candidate's resume gaps, architectural experience, and project scale with expected strong vs weak answers." },
                                                    { label: "⚖️ Pros & Red Flags", prompt: "List the top 3 objective strengths and top 3 potential risks or red flags for this candidate." },
                                                    { label: "💰 Seniority & Leveling", prompt: "Evaluate candidate's likely seniority level (Mid, Senior, Lead) and whether their profile aligns with this requisition's scope." }
                                                ].map((chip, idx) => (
                                                    <button
                                                        key={idx}
                                                        onClick={() => handleSendCopilot(chip.prompt)}
                                                        disabled={isCopilotTyping}
                                                        className="h-7 px-2.5 rounded-md text-[11px] font-medium bg-card/60 hover:bg-primary/10 hover:text-primary hover:border-primary/30 border border-border/40 whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 disabled:opacity-50"
                                                    >
                                                        {chip.label}
                                                    </button>
                                                ))}
                                            </div>

                                            {/* Messages Stream */}
                                            <div className="flex-1 min-h-0 overflow-hidden p-4">
                                                <ScrollArea className="h-full w-full pr-3">
                                                    <div className="space-y-4 pb-2">
                                                        {copilotMessages.map((msg) => (
                                                            <div
                                                                key={msg.id}
                                                                className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                                            >
                                                                {msg.role === 'assistant' && (
                                                                    <div className="w-7 h-7 rounded-lg bg-primary/15 border border-primary/25 flex items-center justify-center text-primary shrink-0 mt-0.5">
                                                                        <Bot className="w-4 h-4" />
                                                                    </div>
                                                                )}

                                                                <div className={`max-w-[85%] rounded-xl p-3.5 space-y-2 text-xs leading-relaxed ${
                                                                    msg.role === 'user'
                                                                        ? 'bg-primary text-primary-foreground font-medium rounded-tr-none'
                                                                        : msg.isError
                                                                            ? 'bg-destructive/10 border border-destructive/30 text-destructive'
                                                                            : 'bg-card/70 border border-border/50 backdrop-blur-md rounded-tl-none shadow-xs'
                                                                }`}>
                                                                    <div className="whitespace-pre-wrap selection:bg-primary/20">
                                                                        {msg.content}
                                                                    </div>

                                                                    {msg.role === 'assistant' && msg.aiMeta && (
                                                                        <div className="pt-2 mt-2 border-t border-border/20 flex items-center justify-between text-[10px] text-muted-foreground/70">
                                                                            <span className="flex items-center gap-1">
                                                                                <Zap className="w-3 h-3 text-primary/70" />
                                                                                {msg.aiMeta.resolvedModel || 'FlowGenix Smart Router'}
                                                                                {msg.aiMeta.latencyMs > 0 && ` • ${(msg.aiMeta.latencyMs / 1000).toFixed(1)}s`}
                                                                            </span>
                                                                            <button
                                                                                onClick={() => handleCopyText(msg.id, msg.content)}
                                                                                className="hover:text-foreground transition-colors flex items-center gap-1"
                                                                                title="Copy response"
                                                                            >
                                                                                {copiedId === msg.id ? (
                                                                                    <>
                                                                                        <Check className="w-3 h-3 text-emerald-500" />
                                                                                        <span className="text-emerald-500">Copied</span>
                                                                                    </>
                                                                                ) : (
                                                                                    <>
                                                                                        <Copy className="w-3 h-3" />
                                                                                        <span>Copy</span>
                                                                                    </>
                                                                                )}
                                                                            </button>
                                                                        </div>
                                                                    )}
                                                                </div>

                                                                {msg.role === 'user' && (
                                                                    <div className="w-7 h-7 rounded-lg bg-muted border border-border/50 flex items-center justify-center text-foreground font-bold text-[10px] shrink-0 mt-0.5">
                                                                        You
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ))}

                                                        {isCopilotTyping && (
                                                            <div className="flex gap-3 justify-start items-center text-xs text-muted-foreground">
                                                                <div className="w-7 h-7 rounded-lg bg-primary/15 border border-primary/25 flex items-center justify-center text-primary shrink-0">
                                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                                </div>
                                                                <div className="bg-card/70 border border-border/50 rounded-xl px-4 py-2.5 flex items-center gap-2">
                                                                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
                                                                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]" />
                                                                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary animate-bounce" />
                                                                    <span className="text-[11px] font-medium ml-1">FlowGenix evaluating candidate...</span>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </ScrollArea>
                                            </div>

                                            {/* Input Bar */}
                                            <div className="p-3 border-t border-border/30 bg-background/50 backdrop-blur-xl shrink-0 space-y-1.5">
                                                <div className="flex items-end gap-2">
                                                    <Textarea
                                                        placeholder="Ask Copilot anything about this candidate (e.g. 'Compare experience with requirements' or 'Draft rejection note')..."
                                                        value={copilotInput}
                                                        onChange={(e) => setCopilotInput(e.target.value)}
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                                e.preventDefault();
                                                                handleSendCopilot();
                                                            }
                                                        }}
                                                        rows={1}
                                                        className="min-h-[44px] max-h-[120px] resize-none bg-card/50 border-border/50 text-xs rounded-lg focus-visible:ring-1 focus-visible:ring-primary/40 py-3"
                                                    />
                                                    <Button
                                                        onClick={() => handleSendCopilot()}
                                                        disabled={!copilotInput.trim() || isCopilotTyping}
                                                        className="h-11 px-4 rounded-lg bg-primary font-bold text-xs shadow-md shadow-primary/20 shrink-0 hover:bg-primary/90 transition-all"
                                                    >
                                                        {isCopilotTyping ? (
                                                            <Loader2 className="w-4 h-4 animate-spin" />
                                                        ) : (
                                                            <Send className="w-4 h-4" />
                                                        )}
                                                    </Button>
                                                </div>
                                                <div className="flex items-center justify-between text-[10px] text-muted-foreground/60 px-1">
                                                    <span>Press <strong>Enter</strong> to send, <strong>Shift+Enter</strong> for newline</span>
                                                    <span>Powered by <strong>FlowGenix Gateway</strong></span>
                                                </div>
                                            </div>
                                        </Card>
                                    </TabsContent>

                                    {/* AI Interview Kit Generator & Live Evaluator Tab */}
                                    <TabsContent value="interview_kit" className="mt-0 outline-none animate-in fade-in slide-in-from-bottom-2 duration-500 space-y-6">
                                        <InterviewKitTab
                                            candidateData={candidateData}
                                            workspaceId={workspaceId}
                                            onScorecardSaved={mutate}
                                        />
                                    </TabsContent>

                                    {/* Rate Candidate Tab (Communication, Sales, Customers, IT Learn, Team, Role-play) */}
                                    <TabsContent value="rate" className="mt-0 outline-none animate-in fade-in slide-in-from-bottom-2 duration-500 space-y-6">
                                        <Card className="border-border/40 bg-card/30 backdrop-blur-xl rounded-md overflow-hidden shadow-2xl shadow-black/5">
                                            {/* Score Summary Header */}
                                            <CardHeader className="p-6 pb-4 border-b border-border/10">
                                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                                    <div className="flex items-center gap-3.5">
                                                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/20 to-primary/20 border border-amber-500/30 flex items-center justify-center text-amber-500 shadow-inner shrink-0">
                                                            <Star size={22} className="fill-amber-500/30" />
                                                        </div>
                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <CardTitle className="text-lg font-bold">Candidate Competency Rating</CardTitle>
                                                                <Badge variant="outline" className={`text-[10px] font-bold border ${
                                                                    ratingAverage >= 4.2 ? 'border-emerald-500/30 text-emerald-500 bg-emerald-500/10' :
                                                                    ratingAverage >= 3.4 ? 'border-blue-500/30 text-blue-500 bg-blue-500/10' :
                                                                    ratingAverage >= 2.6 ? 'border-amber-500/30 text-amber-500 bg-amber-500/10' :
                                                                    'border-rose-500/30 text-rose-500 bg-rose-500/10'
                                                                }`}>
                                                                    {ratingAverage >= 4.2 ? 'Exceptional Fit' :
                                                                     ratingAverage >= 3.4 ? 'Strong Fit' :
                                                                     ratingAverage >= 2.6 ? 'Moderate Fit' : 'Requires Review'}
                                                                </Badge>
                                                            </div>
                                                            <p className="text-xs text-muted-foreground mt-0.5">
                                                                Rate candidate on a 1–5 scale across core sales & role-play competencies.
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-5 shrink-0 self-end sm:self-center">
                                                        <div className="text-right">
                                                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Average Rating</span>
                                                            <div className="flex items-baseline gap-1 justify-end">
                                                                <span className="text-2xl font-black text-amber-500">{ratingAverage.toFixed(1)}</span>
                                                                <span className="text-xs font-semibold text-muted-foreground">/ 5.0</span>
                                                            </div>
                                                        </div>
                                                        <div className="w-px h-8 bg-border/40 hidden sm:block" />
                                                        <div className="text-right">
                                                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Score Match</span>
                                                            <span className="text-2xl font-black text-primary">{ratingPercentage}%</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </CardHeader>

                                            <CardContent className="p-6 space-y-6">
                                                {/* 7 Core Evaluation Criteria Cards with 1 2 3 4 5 Rating Buttons */}
                                                <div className="space-y-3">
                                                    <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground px-1 pb-1">
                                                        <span>Competency Dimensions (7)</span>
                                                        <span>Rating Scale (1 = Poor, 5 = Exceptional)</span>
                                                    </div>

                                                    {SALES_RATING_CRITERIA.map((criterion) => {
                                                        const currentScore = candidateRatings[criterion.id] || 3;
                                                        return (
                                                            <div
                                                                key={criterion.id}
                                                                className="p-3.5 rounded-xl bg-card/50 border border-border/40 hover:border-primary/25 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group shadow-xs"
                                                            >
                                                                <div className="flex items-start gap-3">
                                                                    <div className={`p-2 rounded-lg border shrink-0 ${criterion.color}`}>
                                                                        <criterion.icon size={16} />
                                                                    </div>
                                                                    <div>
                                                                        <h4 className="text-xs font-bold text-foreground group-hover:text-primary transition-colors flex items-center gap-2">
                                                                            {criterion.label}
                                                                            {currentScore >= 4 && (
                                                                                <span className="text-[10px] text-emerald-500 font-normal">★ Strong</span>
                                                                            )}
                                                                        </h4>
                                                                        <p className="text-[10px] text-muted-foreground leading-tight mt-0.5 max-w-[420px]">
                                                                            {criterion.description}
                                                                        </p>
                                                                    </div>
                                                                </div>

                                                                {/* 1 2 3 4 5 Rating Buttons */}
                                                                <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                                                                    <span className="text-[10px] text-muted-foreground mr-1 font-medium hidden md:inline">
                                                                        {RATING_LEVEL_LABELS[currentScore]?.label}:
                                                                    </span>
                                                                    {[1, 2, 3, 4, 5].map((num) => {
                                                                        const isSelected = currentScore === num;
                                                                        return (
                                                                            <button
                                                                                key={num}
                                                                                type="button"
                                                                                onClick={() => handleRatingScoreChange(criterion.id, num)}
                                                                                title={`${num} - ${RATING_LEVEL_LABELS[num]?.label} (${RATING_LEVEL_LABELS[num]?.desc})`}
                                                                                className={`h-8 w-8 rounded-lg text-xs font-bold transition-all flex items-center justify-center border cursor-pointer ${
                                                                                    isSelected
                                                                                        ? 'bg-amber-500 text-black border-amber-500 shadow-md shadow-amber-500/25 scale-105 ring-2 ring-amber-500/30'
                                                                                        : 'bg-background/60 text-muted-foreground hover:text-foreground hover:bg-muted/40 border-border/50'
                                                                                }`}
                                                                            >
                                                                                {num}
                                                                            </button>
                                                                        );
                                                                    })}
                                                                    <Badge variant="outline" className={`ml-2 h-7 px-2 font-mono text-xs font-bold border ${
                                                                        currentScore >= 4 ? 'border-emerald-500/30 text-emerald-500 bg-emerald-500/10' :
                                                                        currentScore === 3 ? 'border-amber-500/30 text-amber-500 bg-amber-500/10' :
                                                                        'border-rose-500/30 text-rose-500 bg-rose-500/10'
                                                                    }`}>
                                                                        {currentScore}/5
                                                                    </Badge>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>

                                                {/* Round & Recommendation Controls */}
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                                                    <div className="space-y-1.5">
                                                        <label className="text-xs font-bold text-foreground">Interview / Evaluation Round</label>
                                                        <Select value={ratingRound} onValueChange={setRatingRound}>
                                                            <SelectTrigger className="h-9 text-xs rounded-lg border-border/50 bg-background/60">
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="Recruiter Phone Screen">Recruiter Phone Screen</SelectItem>
                                                                <SelectItem value="Interview Round 1">Interview Round 1 (Sales Assessment)</SelectItem>
                                                                <SelectItem value="Technical & Role-Play Round">Technical & Role-Play Round</SelectItem>
                                                                <SelectItem value="Manager & Team Alignment">Manager & Team Alignment</SelectItem>
                                                                <SelectItem value="Final Culture & Offer Screen">Final Culture & Offer Screen</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>

                                                    <div className="space-y-1.5">
                                                        <label className="text-xs font-bold text-foreground">Hiring Recommendation</label>
                                                        <Select value={candidateRatingRecommendation} onValueChange={setCandidateRatingRecommendation}>
                                                            <SelectTrigger className="h-9 text-xs rounded-lg border-border/50 bg-background/60">
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="strong_yes">Strong Yes (Immediate Hire)</SelectItem>
                                                                <SelectItem value="yes">Yes (Proceed to Next Stage)</SelectItem>
                                                                <SelectItem value="maybe">Maybe (Borderline / Compare Others)</SelectItem>
                                                                <SelectItem value="no">No (Do Not Advance)</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                </div>

                                                {/* Feedback / Role-play Notes */}
                                                <div className="space-y-1.5">
                                                    <label className="text-xs font-bold text-foreground">Interviewer Role-Play Notes & Feedback</label>
                                                    <Textarea
                                                        placeholder="Detailed notes on candidate's sales pitch, customer handling, objection overcoming, product questions, and overall impressions..."
                                                        value={candidateRatingNotes}
                                                        onChange={(e) => setCandidateRatingNotes(e.target.value)}
                                                        rows={3}
                                                        className="text-xs rounded-lg border-border/50 bg-background/60 resize-none"
                                                    />
                                                </div>

                                                {/* Action Buttons */}
                                                <div className="flex items-center justify-between pt-2">
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => {
                                                            setCandidateRatings(INITIAL_CANDIDATE_RATINGS);
                                                            setCandidateRatingNotes('');
                                                            setCandidateRatingRecommendation('yes');
                                                        }}
                                                        className="text-xs font-semibold text-muted-foreground hover:text-foreground"
                                                    >
                                                        <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                                                        Reset Ratings
                                                    </Button>

                                                    <Button
                                                        type="button"
                                                        onClick={handleSubmitCandidateRating}
                                                        disabled={isSubmittingRating}
                                                        className="h-9 px-6 rounded-lg text-xs font-bold bg-primary hover:bg-primary/90 text-primary-foreground gap-2 shadow-md shadow-primary/20"
                                                    >
                                                        {isSubmittingRating ? (
                                                            <>
                                                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                                <span>Saving Evaluation...</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Check className="w-3.5 h-3.5" />
                                                                <span>Submit Rating ({ratingAverage.toFixed(1)}/5)</span>
                                                            </>
                                                        )}
                                                    </Button>
                                                </div>

                                                {/* Previous Evaluations History */}
                                                {candidateData?.scorecards && candidateData.scorecards.length > 0 && (
                                                    <div className="space-y-3 pt-6 border-t border-border/20">
                                                        <div className="flex items-center justify-between">
                                                            <h4 className="text-xs font-bold text-foreground flex items-center gap-2">
                                                                <History size={14} className="text-primary" />
                                                                Previous Scorecards & Evaluations ({candidateData.scorecards.length})
                                                            </h4>
                                                            <span className="text-[10px] text-muted-foreground">Historical interviewer feedback</span>
                                                        </div>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                            {candidateData.scorecards.map((card, i) => (
                                                                <div key={i} className="p-3.5 rounded-xl bg-card/40 border border-border/30 space-y-2">
                                                                    <div className="flex items-center justify-between">
                                                                        <div className="flex items-center gap-2">
                                                                            <Avatar className="h-6 w-6 border border-primary/20">
                                                                                <AvatarImage src={card.interviewer?.avatar || card.interviewer?.image} alt={card.interviewer?.displayName || card.interviewer?.username || "Interviewer"} />
                                                                                <AvatarFallback className="text-[9px] bg-primary/10 text-primary font-bold">
                                                                                    {getInitials(card.interviewer?.displayName || card.interviewer?.username || card.interviewer?.name) || "TM"}
                                                                                </AvatarFallback>
                                                                            </Avatar>
                                                                            <div>
                                                                                <span className="text-xs font-bold text-foreground block leading-tight">{card.interviewer?.displayName || card.interviewer?.username || card.interviewer?.name || "Team Member"}</span>
                                                                                <span className="text-[9px] text-muted-foreground">{new Date(card.createdAt).toLocaleDateString()} • {card.stage}</span>
                                                                            </div>
                                                                        </div>
                                                                        <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-500 border border-amber-500/20 font-bold text-xs">
                                                                            <Star size={11} className="fill-current" />
                                                                            <span>{card.score}/5</span>
                                                                        </div>
                                                                    </div>
                                                                    {card.feedback && (
                                                                        <p className="text-[11px] text-muted-foreground italic bg-muted/20 p-2 rounded border border-border/20">
                                                                            "{card.feedback}"
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </CardContent>
                                        </Card>
                                    </TabsContent>

                                            {!isSplitView && (
                                                <TabsContent value="resume" className="mt-0 outline-none animate-in fade-in slide-in-from-bottom-2 duration-500 h-[70vh]">
                                                    <ResumeViewerPane
                                                        candidateData={candidateData}
                                                        isParsing={isParsing}
                                                        handleAiParse={handleAiParse}
                                                    />
                                                </TabsContent>
                                            )}
                                        </Tabs>
                                    </div>
                                </div>
                            </div>
                        )}
                    </ScrollArea>

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

                    {/* Add Candidate to Contacts Modal */}
                    <AddContactModal
                        isOpen={isAddContactOpen}
                        onOpenChange={setIsAddContactOpen}
                        candidate={candidateData}
                        workspaceId={workspaceId}
                    />

                    {/* Interactive Scorecard Evaluation Dialog */}
                    <Dialog open={isScorecardOpen} onOpenChange={setIsScorecardOpen}>
                        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto bg-card/95 backdrop-blur-2xl border-primary/20 shadow-2xl p-6">
                            <DialogHeader className="sr-only">
                                <DialogTitle>Candidate Scorecard</DialogTitle>
                            </DialogHeader>
                            <Scorecards
                                candidate={candidateData}
                                onSubmit={handleSubmitScorecard}
                            />
                        </DialogContent>
                    </Dialog>

                    {/* Self-Service Interview Booking Modal */}
                    <InterviewBookingModal
                        isOpen={isInterviewModalOpen}
                        onClose={() => setIsInterviewModalOpen(false)}
                        candidate={candidateData}
                        workspaceId={workspaceId}
                        onScheduled={mutate}
                    />
                </div>
            </SheetContent>
        </Sheet>
    );
};

function ResumeViewerPane({ candidateData, isParsing, handleAiParse }) {
    const resumeUrl = candidateData?.resumeUrl || candidateData?.applications?.[0]?.resumeUrl;

    return (
        <Card className="border-border/40 bg-card/30 backdrop-blur-xl rounded-md overflow-hidden shadow-2xl shadow-black/5 h-full flex flex-col">
            <div className="p-3 border-b border-border/40 flex items-center justify-between bg-card/50 shrink-0">
                <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-primary" />
                    <span className="text-xs font-bold">Resume Document</span>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={handleAiParse}
                        disabled={isParsing}
                        className="h-7 rounded-md text-[10px] bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 gap-1 font-bold"
                    >
                        {isParsing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                        Re-Parse AI
                    </Button>
                    {resumeUrl && (
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => window.open(resumeUrl, '_blank')}
                            className="h-7 rounded-md text-[10px] gap-1 opacity-70 hover:opacity-100"
                        >
                            <ExternalLink className="w-3 h-3" />
                            Open
                        </Button>
                    )}
                </div>
            </div>
            <CardContent className="p-0 flex-1 h-full min-h-[400px] relative">
                {resumeUrl ? (
                    <iframe
                        src={`${resumeUrl}#toolbar=0`}
                        className="absolute inset-0 w-full h-full border-none rounded-b-md"
                        title="Candidate Resume"
                    />
                ) : (
                    <div className="flex flex-col h-full items-center justify-center text-muted-foreground p-8 text-xs italic space-y-2">
                        <FileText className="w-10 h-10 opacity-20" />
                        <p>No resume PDF document attached.</p>
                        <p className="text-[10px] opacity-60">Review parsed experience & education in Overview tab.</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}