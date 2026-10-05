'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    Sparkles,
    BrainCircuit,
    Zap,
    AlertTriangle,
    ShieldAlert,
    CheckCircle2,
    Clock,
    Send,
    MessageCircle,
    Building2,
    User,
    TrendingUp,
    RefreshCw,
    Loader2,
    FileText,
    Bot,
    ArrowUpRight,
    Search,
    ChevronRight,
    Copy,
    Check,
    ListFilter
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

import {
    getPipelineAiRiskRadarAction,
    askSalesCopilotChatAction,
    summarizeSalesCallNotesAction,
    generateAiWhatsAppDraftAction
} from '../_actions/crm-ai-actions';
import { createActivityAction } from '../_actions/activity-actions';
import QuickWhatsAppModal from '../contacts/_components/QuickWhatsAppModal';

export default function CrmCopilotPage() {
    const params = useParams();
    const router = useRouter();
    const workspaceId = params?.workspaceId;

    const [activeTab, setActiveTab] = useState('radar');

    // Risk Radar State
    const [radarData, setRadarData] = useState(null);
    const [isLoadingRadar, setIsLoadingRadar] = useState(true);

    // Chat Copilot State
    const [chatMessages, setChatMessages] = useState([
        {
            role: 'assistant',
            content: "Hello! I am your **FlowGenix Sales Copilot**. I analyze your CRM pipeline, win probabilities, stalled deals, and lead communications in real time.\n\nHow can I help you accelerate your sales pipeline today?"
        }
    ]);
    const [userQuery, setUserQuery] = useState('');
    const [isSendingQuery, setIsSendingQuery] = useState(false);
    const chatEndRef = useRef(null);

    // Meeting Summarizer State
    const [rawMeetingText, setRawMeetingText] = useState('');
    const [isSummarizing, setIsSummarizing] = useState(false);
    const [summarizedNote, setSummarizedNote] = useState(null);
    const [isSavingNote, setIsSavingNote] = useState(false);

    // WhatsApp Modal
    const [waContact, setWaContact] = useState(null);
    const [isWaModalOpen, setIsWaModalOpen] = useState(false);

    const loadRiskRadar = async () => {
        if (!workspaceId) return;
        setIsLoadingRadar(true);
        try {
            const res = await getPipelineAiRiskRadarAction(workspaceId);
            if (res.success) {
                setRadarData(res.data);
            } else {
                toast.error(res.error || "Failed to load risk radar");
            }
        } catch (error) {
            console.error("Risk radar error:", error);
            toast.error("Error evaluating pipeline risks");
        } finally {
            setIsLoadingRadar(false);
        }
    };

    useEffect(() => {
        loadRiskRadar();
    }, [workspaceId]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatMessages]);

    const handleSendMessage = async (customPrompt = null) => {
        const query = customPrompt || userQuery;
        if (!query.trim()) return;

        const newHistory = [...chatMessages, { role: 'user', content: query.trim() }];
        setChatMessages(newHistory);
        setUserQuery('');
        setIsSendingQuery(true);

        try {
            const res = await askSalesCopilotChatAction(workspaceId, {
                message: query.trim(),
                chatHistory: newHistory
            });

            if (res.success && res.data?.reply) {
                setChatMessages([...newHistory, { role: 'assistant', content: res.data.reply }]);
            } else {
                toast.error(res.error || "Copilot response error");
                setChatMessages([
                    ...newHistory,
                    { role: 'assistant', content: "I encountered an issue processing your request. Please try again." }
                ]);
            }
        } catch (error) {
            toast.error("Failed to reach FlowGenix Copilot");
        } finally {
            setIsSendingQuery(false);
        }
    };

    const handleSummarizeNotes = async () => {
        if (!rawMeetingText.trim()) {
            toast.error("Please enter call notes or a voice transcript.");
            return;
        }

        setIsSummarizing(true);
        try {
            const res = await summarizeSalesCallNotesAction(workspaceId, {
                rawNotes: rawMeetingText.trim()
            });

            if (res.success) {
                setSummarizedNote(res.data);
                toast.success("Meeting structured by FlowGenix AI!");
            } else {
                toast.error(res.error || "Failed to structure meeting");
            }
        } catch (error) {
            toast.error("Error summarizing notes");
        } finally {
            setIsSummarizing(false);
        }
    };

    const handleLogSummarizedActivity = async () => {
        if (!summarizedNote) return;
        setIsSavingNote(true);
        try {
            const formatted = `
${summarizedNote.summary || ''}

📌 Key Points:
${(summarizedNote.keyPoints || []).map(p => `• ${p}`).join('\n')}

${summarizedNote.objections?.length > 0 ? `⚠️ Objections Raised:\n${summarizedNote.objections.map(o => `• ${o}`).join('\n')}\n` : ''}
💰 Commercials / Budget: ${summarizedNote.budgetOrCommercials || 'N/A'}

🚀 Next Steps:
${(summarizedNote.nextSteps || []).map(s => `• ${s}`).join('\n')}
            `.trim();

            const res = await createActivityAction(workspaceId, {
                type: "MEETING",
                title: summarizedNote.title || "Meeting Notes (AI Summarized)",
                description: formatted
            });

            if (res.success) {
                toast.success("Logged to CRM activity timeline!");
                setRawMeetingText('');
                setSummarizedNote(null);
            } else {
                toast.error(res.error || "Failed to log activity");
            }
        } catch (error) {
            toast.error("Error logging activity");
        } finally {
            setIsSavingNote(false);
        }
    };

    const formatCurrency = (val) => {
        return `₹ ${Number(val || 0).toLocaleString('en-IN')}`;
    };

    return (
        <div className="flex flex-col min-h-screen bg-background p-4 lg:p-8 space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-primary text-white shadow-md">
                        <BrainCircuit className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-xl lg:text-2xl font-black tracking-tight text-foreground">
                                FlowGenix Sales Copilot
                            </h1>
                            <Badge className="bg-purple-500/10 text-purple-500 border-purple-500/20 text-[10px] font-bold">
                                AI Intelligence
                            </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Predictive deal health scores, pipeline risk radar, and conversational sales strategy powered by FlowGenix.
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-9 gap-1.5 text-xs font-semibold"
                        onClick={loadRiskRadar}
                        disabled={isLoadingRadar}
                    >
                        <RefreshCw className={`w-3.5 h-3.5 ${isLoadingRadar ? 'animate-spin' : ''}`} />
                        <span>Refresh AI Radar</span>
                    </Button>
                </div>
            </div>

            {/* Radar Telemetry KPI Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                <div className="p-4 rounded-2xl border border-border/70 bg-card/60 backdrop-blur-sm space-y-1">
                    <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Deals Evaluated</p>
                    <p className="text-2xl font-black text-foreground">{radarData?.totalOpenDeals || 0}</p>
                    <p className="text-[10px] text-muted-foreground font-medium">Real-time pipeline scan</p>
                </div>
                <div className="p-4 rounded-2xl border border-border/70 bg-card/60 backdrop-blur-sm space-y-1">
                    <p className="text-[11px] font-semibold text-red-500 uppercase tracking-wider">⚠️ At-Risk / Stalled</p>
                    <p className="text-2xl font-black text-red-500">{radarData?.atRiskCount || 0}</p>
                    <p className="text-[10px] text-muted-foreground font-medium">Require immediate outreach</p>
                </div>
                <div className="p-4 rounded-2xl border border-border/70 bg-card/60 backdrop-blur-sm space-y-1">
                    <p className="text-[11px] font-semibold text-emerald-500 uppercase tracking-wider">Healthy Momentum</p>
                    <p className="text-2xl font-black text-emerald-500">{radarData?.healthyCount || 0}</p>
                    <p className="text-[10px] text-muted-foreground font-medium">Active touchpoint frequency</p>
                </div>
                <div className="p-4 rounded-2xl border border-border/70 bg-card/60 backdrop-blur-sm space-y-1">
                    <p className="text-[11px] font-semibold text-purple-500 uppercase tracking-wider">FlowGenix AI Agent</p>
                    <div className="flex items-center gap-1.5 mt-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-sm font-bold text-foreground">Online & Active</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground font-medium">Multi-model intelligence</p>
                </div>
            </div>

            {/* Main Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <TabsList className="bg-muted/70 p-1 rounded-xl">
                    <TabsTrigger value="radar" className="text-xs font-semibold gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                        AI Pipeline Risk Radar ({radarData?.atRiskCount || 0})
                    </TabsTrigger>
                    <TabsTrigger value="chat" className="text-xs font-semibold gap-1.5">
                        <Bot className="w-3.5 h-3.5 text-purple-500" />
                        Interactive Sales Copilot Chat
                    </TabsTrigger>
                    <TabsTrigger value="summarizer" className="text-xs font-semibold gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-blue-500" />
                        Smart Meeting Summarizer
                    </TabsTrigger>
                </TabsList>

                {/* Tab 1: AI Risk Radar */}
                <TabsContent value="radar" className="space-y-4">
                    <div className="p-5 rounded-3xl bg-card border border-border/80 space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-border/60">
                            <div>
                                <h3 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                                    <Sparkles className="w-4 h-4 text-purple-500" />
                                    <span>Opportunities Requiring Sales Team Intervention</span>
                                </h3>
                                <p className="text-[11px] text-muted-foreground">
                                    Deals flagged based on communication inactivity, overdue milestones, and missing stakeholder mappings.
                                </p>
                            </div>
                            <Button
                                size="sm"
                                variant="outline"
                                className="h-7 text-xs font-semibold"
                                onClick={() => router.push(`/workspace/${workspaceId}/crm/pipeline`)}
                            >
                                Open Pipeline Board
                                <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
                            </Button>
                        </div>

                        {isLoadingRadar ? (
                            <div className="py-16 flex flex-col items-center justify-center gap-3">
                                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                                <p className="text-xs font-semibold text-muted-foreground">Evaluating pipeline risks...</p>
                            </div>
                        ) : radarData?.atRiskDeals?.length === 0 ? (
                            <div className="p-12 text-center text-xs text-muted-foreground border border-dashed border-border rounded-2xl">
                                🎉 Outstanding! No deals are currently flagged as stalled or at-risk. All opportunities have healthy momentum.
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {radarData.atRiskDeals.map((deal) => (
                                    <div
                                        key={deal.id}
                                        className="p-4 rounded-2xl bg-muted/20 border border-border/70 hover:border-border transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs group"
                                    >
                                        <div className="space-y-1.5 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <h4 className="font-bold text-foreground text-sm">{deal.title}</h4>
                                                <Badge
                                                    variant="secondary"
                                                    className={`text-[9px] font-bold uppercase ${
                                                        deal.riskLevel === 'HIGH' ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                                                    }`}
                                                >
                                                    {deal.riskLevel === 'HIGH' ? '🚨 High Risk' : '⚠️ Stalled'}
                                                </Badge>
                                                <Badge
                                                    variant="outline"
                                                    className="text-[10px]"
                                                    style={{
                                                        borderColor: deal.stageColor ? `${deal.stageColor}60` : undefined,
                                                        backgroundColor: deal.stageColor ? `${deal.stageColor}15` : undefined
                                                    }}
                                                >
                                                    {deal.stageName}
                                                </Badge>
                                            </div>

                                            <div className="flex items-center gap-3 text-[11px] text-muted-foreground flex-wrap">
                                                <span className="font-bold text-foreground">{formatCurrency(deal.value)}</span>
                                                {deal.accountName && (
                                                    <span className="inline-flex items-center gap-1 font-medium text-foreground">
                                                        <Building2 className="w-3 h-3 text-muted-foreground" />
                                                        {deal.accountName}
                                                    </span>
                                                )}
                                                {deal.contactName && (
                                                    <span className="inline-flex items-center gap-1">
                                                        <User className="w-3 h-3 text-muted-foreground" />
                                                        {deal.contactName} ({deal.contactPhone || 'No phone'})
                                                    </span>
                                                )}
                                                <span className="text-amber-500 font-semibold">
                                                    ⏱️ {deal.daysInactive} days inactive
                                                </span>
                                            </div>

                                            {/* Risk Reasons */}
                                            <div className="flex items-center gap-1.5 flex-wrap pt-1">
                                                {deal.riskReasons.map((reason, i) => (
                                                    <span key={i} className="text-[10px] bg-red-500/5 text-red-500 border border-red-500/10 px-2 py-0.5 rounded-md font-medium">
                                                        ⚠️ {reason}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 shrink-0 justify-end">
                                            {deal.contactPhone && (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="h-8 text-xs font-semibold text-emerald-600 hover:text-emerald-700 hover:bg-emerald-500/10 gap-1"
                                                    onClick={() => {
                                                        setWaContact({ id: deal.id, name: deal.contactName, phone: deal.contactPhone });
                                                        setIsWaModalOpen(true);
                                                    }}
                                                >
                                                    <MessageCircle className="w-3.5 h-3.5 text-emerald-500" />
                                                    <span>Quick WhatsApp</span>
                                                </Button>
                                            )}

                                            <Button
                                                size="sm"
                                                className="h-8 text-xs font-semibold gap-1"
                                                onClick={() => router.push(`/workspace/${workspaceId}/crm/pipeline`)}
                                            >
                                                <span>Inspect Deal</span>
                                                <ChevronRight className="w-3.5 h-3.5" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </TabsContent>

                {/* Tab 2: Interactive FlowGenix Copilot Chat */}
                <TabsContent value="chat" className="space-y-4">
                    <div className="p-5 rounded-3xl bg-card border border-border/80 flex flex-col h-[580px] shadow-xs">
                        <div className="flex items-center justify-between pb-3 border-b border-border/60">
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 rounded-xl bg-purple-500/10 text-purple-500">
                                    <Bot className="w-4 h-4" />
                                </div>
                                <div>
                                    <h3 className="text-xs font-bold text-foreground">FlowGenix Conversational CRM Copilot</h3>
                                    <p className="text-[10px] text-muted-foreground">Ask anything about your deals, prospects, conversion strategies, or draft copy.</p>
                                </div>
                            </div>

                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 text-[11px] text-muted-foreground"
                                onClick={() => setChatMessages([chatMessages[0]])}
                            >
                                Clear Chat
                            </Button>
                        </div>

                        {/* Messages Stream */}
                        <div className="flex-1 overflow-y-auto py-4 space-y-3.5 pr-2">
                            {chatMessages.map((msg, i) => (
                                <div
                                    key={i}
                                    className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    {msg.role === 'assistant' && (
                                        <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center text-xs shrink-0 shadow-xs mt-0.5">
                                            <Sparkles className="w-3.5 h-3.5" />
                                        </div>
                                    )}

                                    <div
                                        className={`p-3.5 rounded-2xl text-xs max-w-[80%] leading-relaxed ${
                                            msg.role === 'user'
                                                ? 'bg-primary text-primary-foreground font-medium rounded-br-xs'
                                                : 'bg-muted/40 border border-border/70 text-foreground rounded-bl-xs'
                                        }`}
                                    >
                                        <div className="whitespace-pre-wrap">{msg.content}</div>
                                    </div>

                                    {msg.role === 'user' && (
                                        <div className="w-7 h-7 rounded-lg bg-muted text-muted-foreground flex items-center justify-center text-xs shrink-0 mt-0.5 font-bold">
                                            U
                                        </div>
                                    )}
                                </div>
                            ))}
                            {isSendingQuery && (
                                <div className="flex items-center gap-2 text-xs text-muted-foreground p-2">
                                    <Loader2 className="w-4 h-4 animate-spin text-purple-500" />
                                    <span>FlowGenix Copilot is analyzing CRM telemetry...</span>
                                </div>
                            )}
                            <div ref={chatEndRef} />
                        </div>

                        {/* Quick Prompt Starters */}
                        <div className="flex items-center gap-1.5 pb-2 overflow-x-auto hide-scrollbar pt-2 border-t border-border/60">
                            <span className="text-[10px] font-semibold text-muted-foreground whitespace-nowrap">Suggested:</span>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="h-6 text-[10px] px-2 whitespace-nowrap"
                                onClick={() => handleSendMessage("Which deals have the highest risk of stalling this week?")}
                            >
                                Stalled deals analysis
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="h-6 text-[10px] px-2 whitespace-nowrap"
                                onClick={() => handleSendMessage("Draft a persuasive WhatsApp discount objection response for enterprise clients.")}
                            >
                                Pricing objection script
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="h-6 text-[10px] px-2 whitespace-nowrap"
                                onClick={() => handleSendMessage("What are the top 3 tactical actions to improve our pipeline win rate?")}
                            >
                                Win rate strategies
                            </Button>
                        </div>

                        {/* Query Input */}
                        <div className="flex items-center gap-2 pt-2">
                            <Input
                                placeholder="Ask FlowGenix Copilot anything about your CRM opportunities..."
                                value={userQuery}
                                onChange={(e) => setUserQuery(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSendMessage();
                                    }
                                }}
                                className="text-xs bg-background h-10"
                                disabled={isSendingQuery}
                            />
                            <Button
                                size="sm"
                                onClick={() => handleSendMessage()}
                                disabled={isSendingQuery || !userQuery.trim()}
                                className="h-10 px-4 bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs gap-1.5"
                            >
                                {isSendingQuery ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                <span>Ask Copilot</span>
                            </Button>
                        </div>
                    </div>
                </TabsContent>

                {/* Tab 3: Smart Meeting Summarizer */}
                <TabsContent value="summarizer" className="space-y-4">
                    <div className="p-5 rounded-3xl bg-card border border-border/80 space-y-4">
                        <div className="pb-3 border-b border-border/60">
                            <h3 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                                <FileText className="w-4 h-4 text-blue-500" />
                                <span>Voice Transcript & Meeting Notes Summarizer</span>
                            </h3>
                            <p className="text-[11px] text-muted-foreground">
                                Paste messy meeting notes or transcripts; the AI extracts key takeaways, budget/commercials, and next action items.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            {/* Input Column */}
                            <div className="space-y-3">
                                <Textarea
                                    placeholder="Paste unstructured notes here...
e.g. Call with Vikram at Tata Tech. He loves the KonnectX WhatsApp integration. Budget is ₹2,50,000. He raised concern about SLA response times. Action: Send enterprise SLA document by tomorrow 3 PM."
                                    value={rawMeetingText}
                                    onChange={(e) => setRawMeetingText(e.target.value)}
                                    rows={10}
                                    className="text-xs bg-background resize-none"
                                />

                                <div className="flex justify-end">
                                    <Button
                                        size="sm"
                                        onClick={handleSummarizeNotes}
                                        disabled={isSummarizing || !rawMeetingText.trim()}
                                        className="bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs gap-1.5"
                                    >
                                        {isSummarizing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                                        <span>Structure with FlowGenix</span>
                                    </Button>
                                </div>
                            </div>

                            {/* Output Column */}
                            <div className="p-4 rounded-2xl bg-muted/30 border border-border/70 text-xs space-y-3 min-h-[250px] flex flex-col justify-between">
                                {!summarizedNote ? (
                                    <div className="flex-1 flex flex-col items-center justify-center text-center text-muted-foreground py-10">
                                        <FileText className="w-8 h-8 text-muted-foreground/50 mb-2" />
                                        <p className="font-semibold text-xs">AI Structured Output will appear here</p>
                                        <p className="text-[10px] max-w-xs mt-0.5">Paste raw text on the left and click "Structure with FlowGenix".</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        <div>
                                            <span className="text-[10px] uppercase font-bold text-purple-500">Structured Note</span>
                                            <h4 className="font-bold text-sm text-foreground">{summarizedNote.title}</h4>
                                            <p className="text-muted-foreground mt-1">{summarizedNote.summary}</p>
                                        </div>

                                        {summarizedNote.keyPoints?.length > 0 && (
                                            <div className="space-y-1">
                                                <p className="font-bold text-foreground">📌 Key Points</p>
                                                <ul className="list-disc list-inside space-y-0.5 text-muted-foreground">
                                                    {summarizedNote.keyPoints.map((p, i) => (
                                                        <li key={i}>{p}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        {summarizedNote.budgetOrCommercials && (
                                            <p className="text-muted-foreground">
                                                <span className="font-bold text-foreground">💰 Commercials: </span>
                                                {summarizedNote.budgetOrCommercials}
                                            </p>
                                        )}

                                        {summarizedNote.nextSteps?.length > 0 && (
                                            <div className="space-y-1">
                                                <p className="font-bold text-emerald-500">🚀 Next Steps</p>
                                                <ul className="list-disc list-inside space-y-0.5 text-muted-foreground">
                                                    {summarizedNote.nextSteps.map((s, i) => (
                                                        <li key={i}>{s}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        <div className="pt-2 border-t border-border/60 flex justify-end">
                                            <Button
                                                size="sm"
                                                onClick={handleLogSummarizedActivity}
                                                disabled={isSavingNote}
                                                className="font-semibold text-xs gap-1.5"
                                            >
                                                {isSavingNote ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                                                <span>Log to Timeline</span>
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </TabsContent>
            </Tabs>

            {/* Quick WhatsApp Outreach Modal */}
            <QuickWhatsAppModal
                isOpen={isWaModalOpen}
                onClose={() => setIsWaModalOpen(false)}
                contact={waContact}
                workspaceId={workspaceId}
                onMessageSent={() => loadRiskRadar()}
            />
        </div>
    );
}
