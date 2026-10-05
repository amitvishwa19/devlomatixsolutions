'use client';

import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Sparkles,
    Loader2,
    FileText,
    CheckCircle2,
    Zap,
    AlertTriangle,
    ArrowRight,
    Send
} from 'lucide-react';
import { toast } from "sonner";
import { summarizeSalesCallNotesAction } from "../_actions/crm-ai-actions";
import { createActivityAction } from "../_actions/activity-actions";

export default function AiMeetingSummarizerModal({ isOpen, onClose, workspaceId, contactId, accountId, dealId, onActivityLogged }) {
    const [rawNotes, setRawNotes] = useState('');
    const [isSummarizing, setIsSummarizing] = useState(false);
    const [summaryResult, setSummaryResult] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    const handleRunSummary = async () => {
        if (!rawNotes.trim()) {
            toast.error("Please enter call notes or transcript to summarize.");
            return;
        }

        setIsSummarizing(true);
        try {
            const res = await summarizeSalesCallNotesAction(workspaceId, {
                rawNotes: rawNotes.trim(),
                contactId,
                dealId
            });

            if (res.success) {
                setSummaryResult(res.data);
                toast.success("Meeting structured by FlowGenix AI!");
            } else {
                toast.error(res.error || "Failed to summarize notes");
            }
        } catch (error) {
            console.error("AI summarization error:", error);
            toast.error("Error running AI summarizer");
        } finally {
            setIsSummarizing(false);
        }
    };

    const handleSaveToTimeline = async () => {
        if (!summaryResult) return;

        setIsSaving(true);
        try {
            const formattedDescription = `
${summaryResult.summary || ''}

📌 Key Takeaways:
${(summaryResult.keyPoints || []).map(p => `• ${p}`).join('\n')}

${summaryResult.objections?.length > 0 ? `⚠️ Objections / Concerns:\n${summaryResult.objections.map(o => `• ${o}`).join('\n')}\n` : ''}
💰 Commercials / Budget: ${summaryResult.budgetOrCommercials || 'N/A'}

🚀 Next Steps:
${(summaryResult.nextSteps || []).map(s => `• ${s}`).join('\n')}
            `.trim();

            const res = await createActivityAction(workspaceId, {
                contactId,
                accountId,
                dealId,
                type: "MEETING",
                title: summaryResult.title || "Client Meeting Notes (AI Summarized)",
                description: formattedDescription
            });

            if (res.success) {
                toast.success("Saved to CRM Timeline!");
                setRawNotes('');
                setSummaryResult(null);
                onClose();
                if (onActivityLogged) onActivityLogged(res.data);
            } else {
                toast.error(res.error || "Failed to log activity");
            }
        } catch (error) {
            toast.error("Error saving summary");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-lg">
                        <div className="p-2 rounded-xl bg-purple-500/10 text-purple-500">
                            <Sparkles className="w-5 h-5" />
                        </div>
                        <span>FlowGenix AI Meeting Summarizer</span>
                    </DialogTitle>
                    <DialogDescription className="text-xs">
                        Paste unstructured meeting notes or voice transcripts. The AI agent extracts key takeaways, objections, and action items.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-2">
                    {!summaryResult ? (
                        <div className="space-y-2">
                            <Label className="text-xs font-semibold">Raw Notes / Call Transcript</Label>
                            <Textarea
                                placeholder="Paste meeting minutes, call transcript, or quick bullet points here...
e.g. Discussed Enterprise annual plan with Sarah. They want 15% discount for 2-year commitment. Key objection was onboarding time. Agreed to send updated proposal by Thursday."
                                value={rawNotes}
                                onChange={(e) => setRawNotes(e.target.value)}
                                rows={8}
                                className="text-xs bg-muted/20 border-border/80 resize-none"
                            />
                        </div>
                    ) : (
                        /* AI Structured Results Preview */
                        <div className="p-4 rounded-2xl bg-muted/30 border border-border/80 space-y-3.5 text-xs">
                            <div className="flex items-center justify-between pb-2 border-b border-border/60">
                                <div>
                                    <span className="text-[10px] uppercase font-bold text-purple-500">AI Structured Note</span>
                                    <h4 className="font-bold text-sm text-foreground">{summaryResult.title}</h4>
                                </div>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 text-[10px]"
                                    onClick={() => setSummaryResult(null)}
                                >
                                    Edit Raw
                                </Button>
                            </div>

                            <p className="text-muted-foreground font-medium">{summaryResult.summary}</p>

                            {summaryResult.keyPoints?.length > 0 && (
                                <div className="space-y-1">
                                    <p className="font-bold text-foreground">📌 Key Takeaways</p>
                                    <ul className="list-disc list-inside space-y-0.5 text-muted-foreground">
                                        {summaryResult.keyPoints.map((p, i) => (
                                            <li key={i}>{p}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {summaryResult.objections?.length > 0 && (
                                <div className="space-y-1 text-amber-500">
                                    <p className="font-bold">⚠️ Objections Raised</p>
                                    <ul className="list-disc list-inside space-y-0.5 text-amber-600 dark:text-amber-400">
                                        {summaryResult.objections.map((o, i) => (
                                            <li key={i}>{o}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {summaryResult.nextSteps?.length > 0 && (
                                <div className="space-y-1">
                                    <p className="font-bold text-emerald-500">🚀 Agreed Next Steps</p>
                                    <ul className="list-disc list-inside space-y-0.5 text-muted-foreground">
                                        {summaryResult.nextSteps.map((s, i) => (
                                            <li key={i}>{s}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <DialogFooter className="pt-2">
                    <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isSummarizing || isSaving}>
                        Cancel
                    </Button>
                    {!summaryResult ? (
                        <Button
                            type="button"
                            size="sm"
                            onClick={handleRunSummary}
                            disabled={isSummarizing || !rawNotes.trim()}
                            className="bg-purple-600 hover:bg-purple-700 text-white font-semibold gap-1.5"
                        >
                            {isSummarizing ? (
                                <>
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    AI Structuring...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="w-3.5 h-3.5" />
                                    Structure with FlowGenix
                                </>
                            )}
                        </Button>
                    ) : (
                        <Button
                            type="button"
                            size="sm"
                            onClick={handleSaveToTimeline}
                            disabled={isSaving}
                            className="bg-primary hover:bg-primary/90 font-semibold gap-1.5"
                        >
                            {isSaving ? (
                                <>
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    Log to CRM Timeline
                                </>
                            )}
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
