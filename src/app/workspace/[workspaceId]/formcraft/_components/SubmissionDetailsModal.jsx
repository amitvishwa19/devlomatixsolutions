'use client';

import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Inbox,
    Download,
    Send,
    User,
    Calendar,
    CheckCircle2,
    Share2,
    Copy
} from 'lucide-react';
import { toast } from 'sonner';

export function SubmissionDetailsModal({ open, onOpenChange, submission }) {
    if (!submission) return null;

    const handleCopySummary = () => {
        navigator.clipboard.writeText(`Submission ID: ${submission.id}\nForm: ${submission.formTitle}\nSubmitter: ${submission.submitter}\nAnswers: ${submission.summary}`);
        toast.success("Submission summary copied to clipboard!");
    };

    const handleExportJSON = () => {
        const jsonStr = JSON.stringify(submission, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${submission.id}-response.json`;
        a.click();
        toast.success(`Exported ${submission.id} as JSON`);
    };

    const handlePushToDeskFlow = () => {
        toast.success(`Support ticket automatically created in DeskFlow for ${submission.submitter}!`);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg bg-card border-border/80 p-0 overflow-hidden flex flex-col max-h-[85vh]">
                <DialogHeader className="p-4 border-b border-border/60 bg-emerald-500/10">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-500">
                            <Inbox className="w-4 h-4" />
                        </div>
                        <div>
                            <DialogTitle className="text-sm font-bold text-foreground">
                                Submission Response: {submission.id}
                            </DialogTitle>
                            <DialogDescription className="text-xs text-muted-foreground">
                                Received from {submission.formTitle}
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
                    {/* Submitter Info Card */}
                    <div className="p-3.5 rounded-lg bg-secondary/30 border border-border/40 space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="font-semibold text-foreground flex items-center gap-1.5">
                                <User className="w-3.5 h-3.5 text-muted-foreground" />
                                {submission.submitter}
                            </span>
                            <Badge variant="outline" className="text-[9px] bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
                                Verified Intake
                            </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-[11px] text-muted-foreground">
                            <span>Timestamp: <span className="text-foreground font-mono">{submission.date}</span></span>
                            <span>•</span>
                            <span>Form: <span className="text-foreground">{submission.formTitle}</span></span>
                        </div>
                    </div>

                    {/* Answers Breakdown */}
                    <div className="space-y-2">
                        <span className="font-semibold text-xs text-foreground uppercase tracking-wider text-[10px]">
                            Parsed Answers & Form Payload
                        </span>

                        <div className="space-y-2">
                            {submission.answers ? (
                                Object.entries(submission.answers).map(([key, val], idx) => (
                                    <div key={idx} className="p-3 rounded-lg bg-secondary/20 border border-border/40 space-y-0.5">
                                        <span className="text-[10px] text-muted-foreground font-semibold uppercase">{key}</span>
                                        <div className="text-xs font-medium text-foreground">{String(val)}</div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-3 rounded-lg bg-secondary/20 border border-border/40 space-y-1">
                                    <span className="text-[10px] text-muted-foreground font-semibold uppercase">Response Content</span>
                                    <p className="text-xs text-foreground">{submission.summary}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="p-3.5 border-t border-border/60 bg-secondary/15 flex items-center justify-between gap-2 shrink-0">
                    <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)} className="h-8 text-xs">
                        Close
                    </Button>

                    <div className="flex items-center gap-1.5">
                        <Button variant="outline" size="sm" onClick={handleCopySummary} className="h-8 text-xs border-border/80 gap-1">
                            <Copy className="w-3 h-3" /> Copy
                        </Button>
                        <Button variant="outline" size="sm" onClick={handleExportJSON} className="h-8 text-xs border-border/80 gap-1">
                            <Download className="w-3 h-3" /> JSON
                        </Button>
                        <Button size="sm" onClick={handlePushToDeskFlow} className="h-8 text-xs bg-sky-600 hover:bg-sky-700 text-white gap-1 shadow-xs">
                            <Send className="w-3 h-3" /> Push to DeskFlow
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
