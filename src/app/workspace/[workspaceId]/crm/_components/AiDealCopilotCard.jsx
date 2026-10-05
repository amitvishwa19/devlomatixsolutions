'use client';

import React, { useState, useEffect } from 'react';
import {
    Sparkles,
    TrendingUp,
    AlertTriangle,
    CheckCircle2,
    Clock,
    RefreshCw,
    MessageCircle,
    Copy,
    Check,
    ChevronRight,
    Loader2,
    ShieldAlert,
    BrainCircuit,
    Zap
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { analyzeDealAiHealthAction } from "../_actions/crm-ai-actions";

export default function AiDealCopilotCard({ workspaceId, dealId, onUseWhatsAppDraft }) {
    const [analysis, setAnalysis] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isCopied, setIsCopied] = useState(false);

    const loadAiAnalysis = async () => {
        if (!workspaceId || !dealId) return;
        setIsLoading(true);
        try {
            const res = await analyzeDealAiHealthAction(workspaceId, dealId);
            if (res.success) {
                setAnalysis(res.data);
            } else {
                toast.error(res.error || "Failed to run AI analysis");
            }
        } catch (error) {
            console.error("AI Analysis error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadAiAnalysis();
    }, [workspaceId, dealId]);

    const handleCopyDraft = (text) => {
        if (!text) return;
        navigator.clipboard.writeText(text);
        setIsCopied(true);
        toast.success("AI WhatsApp draft copied to clipboard!");
        setTimeout(() => setIsCopied(false), 2000);
        if (onUseWhatsAppDraft) onUseWhatsAppDraft(text);
    };

    if (isLoading) {
        return (
            <div className="p-4 rounded-2xl bg-primary/5 border border-primary/20 flex flex-col items-center justify-center py-8 gap-2.5 text-center">
                <BrainCircuit className="w-7 h-7 animate-pulse text-primary" />
                <p className="text-xs font-semibold text-primary">FlowGenix AI Agent evaluating deal health...</p>
                <p className="text-[10px] text-muted-foreground">Analyzing timeline age, communication velocity, & win probability</p>
            </div>
        );
    }

    if (!analysis) return null;

    const statusBadge = {
        HEALTHY: { label: "Healthy Momentum", color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20", icon: CheckCircle2 },
        STALLED: { label: "Stalled Progress", color: "bg-amber-500/10 text-amber-500 border-amber-500/20", icon: Clock },
        AT_RISK: { label: "At Risk", color: "bg-red-500/10 text-red-500 border-red-500/20", icon: ShieldAlert }
    }[analysis.status] || { label: "Analyzing", color: "bg-muted text-muted-foreground", icon: Sparkles };

    const StatusIcon = statusBadge.icon;

    return (
        <div className="p-4 rounded-2xl bg-gradient-to-br from-primary/5 via-card to-card border border-primary/20 shadow-xs space-y-3.5">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                        <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                        <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                            FlowGenix Sales Copilot
                            <span className="text-[9px] px-1 py-0.2 rounded-full bg-primary/10 text-primary border border-primary/20">AI</span>
                        </h4>
                        <p className="text-[10px] text-muted-foreground">Predictive health & close recommendation</p>
                    </div>
                </div>

                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-muted-foreground hover:text-foreground"
                    title="Re-run AI Analysis"
                    onClick={loadAiAnalysis}
                >
                    <RefreshCw className="w-3 h-3" />
                </Button>
            </div>

            {/* Score & Prediction Bar */}
            <div className="grid grid-cols-2 gap-2.5">
                <div className="p-2.5 rounded-xl bg-background/80 border border-border/70 space-y-1">
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-semibold text-muted-foreground uppercase">Health Score</span>
                        <Badge variant="outline" className={`text-[9px] px-1.5 py-0 ${statusBadge.color}`}>
                            <StatusIcon className="w-2.5 h-2.5 mr-1" />
                            {statusBadge.label}
                        </Badge>
                    </div>
                    <div className="flex items-baseline gap-1">
                        <span className="text-xl font-black text-foreground">{analysis.healthScore}</span>
                        <span className="text-[10px] text-muted-foreground font-semibold">/ 100</span>
                    </div>
                </div>

                <div className="p-2.5 rounded-xl bg-background/80 border border-border/70 space-y-1">
                    <span className="text-[10px] font-semibold text-muted-foreground uppercase">AI Win Probability</span>
                    <div className="flex items-baseline gap-1">
                        <span className="text-xl font-black text-emerald-500">{analysis.predictedWinRate}%</span>
                        <span className="text-[10px] text-muted-foreground">estimated</span>
                    </div>
                </div>
            </div>

            {/* AI Summary */}
            {analysis.summary && (
                <p className="text-xs text-foreground/90 font-medium leading-relaxed bg-muted/30 p-2.5 rounded-xl border border-border/60">
                    💡 {analysis.summary}
                </p>
            )}

            {/* Next Best Actions */}
            {analysis.nextBestActions?.length > 0 && (
                <div className="space-y-1.5">
                    <p className="text-[11px] font-bold text-foreground flex items-center gap-1">
                        <Zap className="w-3 h-3 text-amber-500" />
                        Next Best Actions
                    </p>
                    <div className="space-y-1">
                        {analysis.nextBestActions.map((action, i) => (
                            <div key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                                <span className="text-primary font-bold">•</span>
                                <span>{action}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Risk Factors */}
            {analysis.riskFactors?.length > 0 && analysis.riskFactors[0] !== "No critical risks detected; keep active communication frequency." && (
                <div className="space-y-1">
                    <p className="text-[11px] font-bold text-red-500 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        Risk Factors
                    </p>
                    <div className="space-y-0.5">
                        {analysis.riskFactors.map((risk, i) => (
                            <div key={i} className="text-[11px] text-red-400 flex items-start gap-1.5">
                                <span>⚠️</span>
                                <span>{risk}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Recommended WhatsApp Follow-up */}
            {analysis.recommendedWhatsAppDraft && (
                <div className="pt-2 border-t border-border/60 space-y-1.5">
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-emerald-500 flex items-center gap-1">
                            <MessageCircle className="w-3 h-3" />
                            AI-Drafted WhatsApp Follow-up
                        </span>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-6 text-[10px] text-primary hover:text-primary gap-1 px-1.5"
                            onClick={() => handleCopyDraft(analysis.recommendedWhatsAppDraft)}
                        >
                            {isCopied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                            <span>{isCopied ? 'Copied' : 'Use Message'}</span>
                        </Button>
                    </div>

                    <div className="p-2.5 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-xs text-foreground italic whitespace-pre-wrap">
                        "{analysis.recommendedWhatsAppDraft}"
                    </div>
                </div>
            )}
        </div>
    );
}
