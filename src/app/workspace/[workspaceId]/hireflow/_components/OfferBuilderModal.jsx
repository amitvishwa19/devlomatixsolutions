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
import { FileCheck, Download, Send, Sparkles, Loader2, MessageSquare } from "lucide-react";
import { generateOfferLetter } from '@/lib/ats/pdf-generator';
import { sendCandidateWhatsAppAction } from '../_actions/candidate-actions';
import { toast } from 'sonner';

export function OfferBuilderModal({ isOpen, onClose, candidate, workspaceId }) {
    const [jobTitle, setJobTitle] = useState(candidate?.applications?.[0]?.job?.title || "Software Engineer");
    const [salary, setSalary] = useState("₹18,00,000 - ₹24,00,000 per annum");
    const [bonus, setBonus] = useState("₹2,00,000 Joining Bonus");
    const [startDate, setStartDate] = useState("June 1, 2026");
    const [workMode, setWorkMode] = useState("Hybrid (3 days in office)");
    const [recruiterName, setRecruiterName] = useState("The Hiring Team");
    const [isGenerating, setIsGenerating] = useState(false);
    const [isSendingWhatsApp, setIsSendingWhatsApp] = useState(false);

    if (!candidate) return null;

    const handleDownloadPdf = () => {
        setIsGenerating(true);
        try {
            const data = {
                candidateName: candidate.name,
                jobTitle,
                salary: `${salary}${bonus ? ` + ${bonus}` : ''}`,
                startDate,
                companyName: "Devlomatix Solutions",
                recruiterName
            };
            const doc = generateOfferLetter(data);
            doc.save(`Offer_Letter_${candidate.name.replace(/\s+/g, '_')}.pdf`);
            toast.success("Official Offer Letter generated and downloaded!");
        } catch (error) {
            console.error(error);
            toast.error("Failed to generate PDF offer letter");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleSendViaWhatsApp = async () => {
        if (!candidate.phone) {
            toast.error("Candidate does not have a phone number on file");
            return;
        }

        setIsSendingWhatsApp(true);
        try {
            const message = `🎉 Congratulations ${candidate.name}!\n\nWe are delighted to extend an offer for the position of *${jobTitle}* at Devlomatix Solutions.\n\n💼 *Role:* ${jobTitle}\n💰 *Compensation:* ${salary}\n📅 *Start Date:* ${startDate}\n📍 *Work Mode:* ${workMode}\n\nOur hiring team will share the complete official documents shortly. Please let us know your confirmation.\n\nWarm regards,\n${recruiterName}`;

            const res = await sendCandidateWhatsAppAction({
                workspaceId,
                candidateId: candidate.id,
                text: message
            });

            if (res.success) {
                toast.success("Offer notification sent via WhatsApp!");
            } else {
                toast.error(res.error || "Failed to send WhatsApp offer");
            }
        } catch (error) {
            console.error(error);
            toast.error("An error occurred while sending WhatsApp message");
        } finally {
            setIsSendingWhatsApp(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && !isGenerating && !isSendingWhatsApp && onClose?.()}>
            <DialogContent className="sm:max-w-[550px] bg-card/95 backdrop-blur-2xl border-primary/20 shadow-2xl">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold flex items-center gap-2">
                        <FileCheck className="w-5 h-5 text-primary" />
                        <span>Interactive Offer Builder</span>
                    </DialogTitle>
                    <DialogDescription className="text-xs font-medium text-muted-foreground mt-1">
                        Configure official terms for <span className="font-bold text-foreground">{candidate.name}</span>. Generate branded PDF and notify via KonnectX.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 my-2">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label className="text-xs font-bold">Position Title</Label>
                            <Input
                                value={jobTitle}
                                onChange={(e) => setJobTitle(e.target.value)}
                                className="h-9 rounded-md bg-muted/20 border-border/40 text-xs font-bold"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs font-bold">Target Start Date</Label>
                            <Input
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="h-9 rounded-md bg-muted/20 border-border/40 text-xs font-bold"
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label className="text-xs font-bold">Annual Compensation (CTC / Base)</Label>
                        <Input
                            value={salary}
                            onChange={(e) => setSalary(e.target.value)}
                            className="h-9 rounded-md bg-muted/20 border-border/40 text-xs font-bold"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label className="text-xs font-bold">Bonus / Incentives (Optional)</Label>
                            <Input
                                value={bonus}
                                onChange={(e) => setBonus(e.target.value)}
                                className="h-9 rounded-md bg-muted/20 border-border/40 text-xs"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs font-bold">Work Mode / Location</Label>
                            <Input
                                value={workMode}
                                onChange={(e) => setWorkMode(e.target.value)}
                                className="h-9 rounded-md bg-muted/20 border-border/40 text-xs"
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label className="text-xs font-bold">Signer / Recruiter Name</Label>
                        <Input
                            value={recruiterName}
                            onChange={(e) => setRecruiterName(e.target.value)}
                            className="h-9 rounded-md bg-muted/20 border-border/40 text-xs"
                        />
                    </div>
                </div>

                <DialogFooter className="gap-2 sm:gap-2 mt-4 flex-col sm:flex-row">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        disabled={isGenerating || isSendingWhatsApp}
                        className="rounded-md font-bold"
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="outline"
                        onClick={handleSendViaWhatsApp}
                        disabled={isGenerating || isSendingWhatsApp || !candidate.phone}
                        className="rounded-md font-bold text-emerald-500 border-emerald-500/30 hover:bg-emerald-500/10 flex items-center gap-2"
                    >
                        {isSendingWhatsApp ? <Loader2 className="w-4 h-4 animate-spin" /> : <MessageSquare className="w-4 h-4" />}
                        Send via WhatsApp
                    </Button>
                    <Button
                        onClick={handleDownloadPdf}
                        disabled={isGenerating || isSendingWhatsApp}
                        className="rounded-md font-bold bg-primary text-primary-foreground flex items-center gap-2"
                    >
                        {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                        Download PDF Offer
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default OfferBuilderModal;
