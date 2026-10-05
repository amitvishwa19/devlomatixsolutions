'use client';

import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Sparkles,
    Copy,
    Check,
    MessageCircle,
    Mail,
    Send,
    Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { generateDcrAiFollowupAction } from '../../_actions/dcr-actions';

export default function AiFollowupModal({
    isOpen,
    onClose,
    workspaceId,
    record
}) {
    const [loading, setLoading] = useState(false);
    const [copiedWa, setCopiedWa] = useState(false);
    const [copiedEmail, setCopiedEmail] = useState(false);
    const [drafts, setDrafts] = useState({
        whatsAppMessage: '',
        emailSubject: '',
        emailBody: ''
    });

    useEffect(() => {
        if (isOpen && record) {
            fetchAiDrafts();
        }
    }, [isOpen, record]);

    const fetchAiDrafts = async () => {
        if (!record) return;
        setLoading(true);
        try {
            const res = await generateDcrAiFollowupAction(workspaceId, {
                clientName: record.clientName,
                contactPerson: record.contactPerson,
                conversation: record.description,
                outcome: record.outcome,
                nextAction: record.nextFollowUpAction
            });

            if (res.success) {
                setDrafts(res.data);
            } else {
                toast.error("Failed to generate AI follow-up draft");
            }
        } catch (err) {
            toast.error("Error connecting to AI service");
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = (text, type) => {
        if (!text) return;
        navigator.clipboard.writeText(text);
        if (type === 'wa') {
            setCopiedWa(true);
            setTimeout(() => setCopiedWa(false), 2000);
        } else {
            setCopiedEmail(true);
            setTimeout(() => setCopiedEmail(false), 2000);
        }
        toast.success("Draft copied to clipboard!");
    };

    const handleOpenWhatsApp = () => {
        if (!record?.phone) {
            toast.error("No phone number recorded for this client.");
            return;
        }
        const cleanPhone = record.phone.replace(/[^0-9]/g, '');
        const encodedText = encodeURIComponent(drafts.whatsAppMessage);
        window.open(`https://wa.me/${cleanPhone}?text=${encodedText}`, '_blank');
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-xl max-h-[85vh] overflow-y-auto p-6">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-lg">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-violet-500 text-white flex items-center justify-center">
                            <Sparkles className="w-4 h-4" />
                        </div>
                        AI Sales Follow-Up Generator
                    </DialogTitle>
                    <DialogDescription>
                        Auto-generated personalized outreach drafts based on your conversation with <strong>{record?.clientName || record?.contactPerson}</strong>.
                    </DialogDescription>
                </DialogHeader>

                {loading ? (
                    <div className="py-12 flex flex-col items-center justify-center gap-3 text-muted-foreground">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        <p className="text-xs font-medium">Synthesizing meeting points & crafting personalized follow-up...</p>
                    </div>
                ) : (
                    <div className="space-y-5 pt-2">
                        {/* WhatsApp Draft */}
                        <div className="space-y-2 p-4 bg-emerald-500/5 rounded-xl border border-emerald-500/20">
                            <div className="flex items-center justify-between">
                                <Label className="text-xs font-bold text-emerald-600 flex items-center gap-1.5">
                                    <MessageCircle className="w-4 h-4" /> WhatsApp Follow-Up Message
                                </Label>
                                <div className="flex items-center gap-1.5">
                                    <Button
                                        type="button"
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleCopy(drafts.whatsAppMessage, 'wa')}
                                        className="h-7 text-[11px] gap-1 px-2 border-emerald-500/30 text-emerald-700 hover:bg-emerald-500/10"
                                    >
                                        {copiedWa ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                        {copiedWa ? "Copied" : "Copy"}
                                    </Button>
                                    {record?.phone && (
                                        <Button
                                            type="button"
                                            size="sm"
                                            onClick={handleOpenWhatsApp}
                                            className="h-7 text-[11px] gap-1 px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
                                        >
                                            <Send className="w-3 h-3" />
                                            Send via WhatsApp
                                        </Button>
                                    )}
                                </div>
                            </div>
                            <Textarea
                                value={drafts.whatsAppMessage}
                                onChange={(e) => setDrafts({ ...drafts, whatsAppMessage: e.target.value })}
                                className="min-h-[110px] text-xs bg-background leading-relaxed"
                            />
                        </div>

                        {/* Email Draft */}
                        <div className="space-y-2.5 p-4 bg-indigo-500/5 rounded-xl border border-indigo-500/20">
                            <div className="flex items-center justify-between">
                                <Label className="text-xs font-bold text-indigo-600 flex items-center gap-1.5">
                                    <Mail className="w-4 h-4" /> Formal Email Summary
                                </Label>
                                <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleCopy(`${drafts.emailSubject}\n\n${drafts.emailBody}`, 'email')}
                                    className="h-7 text-[11px] gap-1 px-2 border-indigo-500/30 text-indigo-700 hover:bg-indigo-500/10"
                                >
                                    {copiedEmail ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                    {copiedEmail ? "Copied" : "Copy Email"}
                                </Button>
                            </div>
                            <div>
                                <Label className="text-[11px] text-muted-foreground font-semibold mb-1 block">Subject Line</Label>
                                <Input
                                    value={drafts.emailSubject}
                                    onChange={(e) => setDrafts({ ...drafts, emailSubject: e.target.value })}
                                    className="h-8 text-xs bg-background"
                                />
                            </div>
                            <div>
                                <Label className="text-[11px] text-muted-foreground font-semibold mb-1 block">Body</Label>
                                <Textarea
                                    value={drafts.emailBody}
                                    onChange={(e) => setDrafts({ ...drafts, emailBody: e.target.value })}
                                    className="min-h-[100px] text-xs bg-background leading-relaxed"
                                />
                            </div>
                        </div>
                    </div>
                )}

                <DialogFooter className="pt-2">
                    <Button type="button" variant="outline" onClick={onClose} size="sm">
                        Close
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
