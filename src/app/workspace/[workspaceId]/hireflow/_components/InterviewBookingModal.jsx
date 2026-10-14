'use client';

import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
    Calendar, 
    Copy, 
    Check, 
    Send, 
    Sparkles, 
    Loader2, 
    MessageSquare, 
    Clock, 
    Link as LinkIcon,
    Video
} from "lucide-react";
import { 
    generateCandidateBookingLinkAction,
    scheduleQuickInterviewAction 
} from '../_actions/pipeline-actions';
import { sendCandidateWhatsAppAction } from '../_actions/candidate-actions';
import { toast } from 'sonner';

export function InterviewBookingModal({ isOpen, onClose, candidate, workspaceId, onScheduled }) {
    const defaultJobTitle = candidate?.applications?.[0]?.job?.title || "Open Position";
    const [title, setTitle] = useState(`Technical Interview: ${defaultJobTitle}`);
    const [durationMin, setDurationMin] = useState("45");
    const [interviewers, setInterviewers] = useState("Amit Vishwakarma, Hiring Team");
    const [isGenerating, setIsGenerating] = useState(false);
    const [bookingLink, setBookingLink] = useState(null);
    const [copied, setCopied] = useState(false);
    const [isSendingWhatsApp, setIsSendingWhatsApp] = useState(false);

    if (!candidate) return null;
    const applicationId = candidate.applications?.[0]?.id;

    const handleGenerateLink = async () => {
        if (!applicationId) {
            toast.error("Candidate application context not found");
            return;
        }

        setIsGenerating(true);
        try {
            const res = await generateCandidateBookingLinkAction(workspaceId, {
                applicationId,
                title,
                durationMin: Number(durationMin),
                interviewers: interviewers.split(',').map(s => s.trim()).filter(Boolean)
            });

            if (res.success) {
                const fullUrl = `${window.location.origin}${res.bookingUrl}`;
                setBookingLink(fullUrl);
                toast.success("Self-service booking link created!");
                onScheduled?.();
            } else {
                toast.error(res.error || "Failed to generate link");
            }
        } catch (err) {
            console.error(err);
            toast.error("Error creating booking invitation");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleCopy = () => {
        if (!bookingLink) return;
        navigator.clipboard.writeText(bookingLink);
        setCopied(true);
        toast.success("Booking link copied to clipboard!");
        setTimeout(() => setCopied(false), 2000);
    };

    const handleSendWhatsApp = async () => {
        if (!candidate.phone) {
            toast.error("Candidate does not have a phone number on file");
            return;
        }
        if (!bookingLink) {
            toast.error("Please generate the booking link first");
            return;
        }

        setIsSendingWhatsApp(true);
        try {
            const message = `👋 Hi ${candidate.name},\n\nWe'd love to invite you to an interview for the *${defaultJobTitle}* role at Devlomatix Solutions.\n\n⏱ *Duration:* ${durationMin} minutes\n📍 *Platform:* Google Meet Video\n\nPlease choose a time slot that best fits your schedule using your personal booking link:\n🔗 ${bookingLink}\n\nLooking forward to speaking with you!\n— Devlomatix Talent Team`;

            const res = await sendCandidateWhatsAppAction({
                workspaceId,
                candidateId: candidate.id,
                text: message
            });

            if (res.success) {
                toast.success("Interview invite sent to candidate via WhatsApp!");
            } else {
                toast.error(res.error || "Failed to send WhatsApp message");
            }
        } catch (err) {
            console.error(err);
            toast.error("Error sending WhatsApp message");
        } finally {
            setIsSendingWhatsApp(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose?.()}>
            <DialogContent className="sm:max-w-[550px] bg-card/95 backdrop-blur-2xl border-primary/20 shadow-2xl">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-primary" />
                        <span>Schedule Interview</span>
                    </DialogTitle>
                    <DialogDescription className="text-xs font-medium text-muted-foreground mt-1">
                        Send a self-service Calendly-style booking invitation to <span className="font-bold text-foreground">{candidate.name}</span>.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 my-2">
                    <div className="space-y-1.5">
                        <Label className="text-xs font-bold">Interview Title / Round</Label>
                        <Input
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="h-9 rounded-md bg-muted/20 border-border/40 text-xs font-bold"
                            placeholder="e.g. Technical System Design Round"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label className="text-xs font-bold">Duration</Label>
                            <Select value={durationMin} onValueChange={setDurationMin}>
                                <SelectTrigger className="h-9 text-xs rounded-md bg-muted/20 border-border/40 font-bold">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="text-xs">
                                    <SelectItem value="30">30 Minutes (Screening)</SelectItem>
                                    <SelectItem value="45">45 Minutes (Technical)</SelectItem>
                                    <SelectItem value="60">60 Minutes (Deep Dive)</SelectItem>
                                    <SelectItem value="90">90 Minutes (Panel)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs font-bold">Conferencing Platform</Label>
                            <div className="h-9 rounded-md bg-muted/20 border border-border/40 px-3 flex items-center gap-2 text-xs font-bold text-emerald-500">
                                <Video className="w-3.5 h-3.5" /> Google Meet Video
                            </div>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label className="text-xs font-bold">Assigned Interviewer(s)</Label>
                        <Input
                            value={interviewers}
                            onChange={(e) => setInterviewers(e.target.value)}
                            className="h-9 rounded-md bg-muted/20 border-border/40 text-xs"
                            placeholder="Comma-separated interviewer names"
                        />
                    </div>

                    {bookingLink && (
                        <div className="p-3.5 rounded-xl bg-primary/10 border border-primary/20 space-y-2 animate-in fade-in duration-300">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                                <LinkIcon className="w-3 h-3" />
                                Candidate Self-Booking Link
                            </span>
                            <div className="flex items-center gap-2">
                                <Input
                                    value={bookingLink}
                                    readOnly
                                    className="h-8 rounded-md bg-background/80 border-primary/30 text-[11px] font-mono select-all"
                                />
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={handleCopy}
                                    className="h-8 rounded-md text-xs font-bold gap-1 shrink-0 bg-background hover:bg-muted"
                                >
                                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                                    <span>{copied ? "Copied" : "Copy"}</span>
                                </Button>
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter className="gap-2 sm:gap-2 mt-4 flex-col sm:flex-row">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        className="rounded-md font-bold text-xs"
                    >
                        Close
                    </Button>

                    {!bookingLink ? (
                        <Button
                            onClick={handleGenerateLink}
                            disabled={isGenerating}
                            className="rounded-md font-bold text-xs bg-primary text-primary-foreground flex items-center gap-2"
                        >
                            {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                            Generate Booking Link
                        </Button>
                    ) : (
                        <Button
                            onClick={handleSendWhatsApp}
                            disabled={isSendingWhatsApp || !candidate.phone}
                            className="rounded-md font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-2"
                        >
                            {isSendingWhatsApp ? <Loader2 className="w-4 h-4 animate-spin" /> : <MessageSquare className="w-4 h-4" />}
                            Send Invite via WhatsApp
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default InterviewBookingModal;
