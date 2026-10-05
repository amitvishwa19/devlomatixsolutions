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
import { MessageCircle, Send, Loader2, Sparkles, Phone } from 'lucide-react';
import { toast } from "sonner";
import { sendWhatsAppFromCrmAction } from "../../_actions/crm-bridge-actions";

export default function QuickWhatsAppModal({ isOpen, onClose, contact, workspaceId, onMessageSent }) {
    const [message, setMessage] = useState('');
    const [isSending, setIsSending] = useState(false);

    if (!contact) return null;

    const handleQuickTemplate = (templateType) => {
        const name = contact.name || 'there';
        if (templateType === 'greeting') {
            setMessage(`Hi ${name}, this is regarding our recent discussion at Devlomatix. Do you have 5 minutes for a quick catch up today?`);
        } else if (templateType === 'followup') {
            setMessage(`Hello ${name}, just following up on our proposal. Let me know if you have any questions or would like to schedule a walkthrough.`);
        } else if (templateType === 'ats') {
            setMessage(`Hi ${name}, congratulations on your interview progress! We would love to discuss the next steps with you.`);
        }
    };

    const handleSend = async () => {
        if (!message.trim()) {
            toast.error("Please type a message to send");
            return;
        }

        setIsSending(true);
        try {
            const res = await sendWhatsAppFromCrmAction(workspaceId, {
                contactId: contact.id,
                phone: contact.phone,
                message: message.trim()
            });

            if (res.success) {
                toast.success(`WhatsApp dispatched to ${contact.name || contact.phone}`);
                setMessage('');
                onClose();
                if (onMessageSent) onMessageSent();
            } else {
                toast.error(res.error || "Failed to send WhatsApp message");
            }
        } catch (error) {
            console.error("WhatsApp dispatch error:", error);
            toast.error("Error sending WhatsApp message");
        } finally {
            setIsSending(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-lg text-emerald-600 dark:text-emerald-400">
                        <div className="p-2 rounded-xl bg-emerald-500/10">
                            <MessageCircle className="w-5 h-5 text-emerald-500" />
                        </div>
                        <span>Quick WhatsApp Outreach</span>
                    </DialogTitle>
                    <DialogDescription className="text-xs">
                        Direct outreach to <span className="font-semibold text-foreground">{contact.name}</span> ({contact.phone}) via KonnectX WhatsApp Cloud.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-3 py-2">
                    {/* Quick Smart Templates */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-amber-500" /> Quick Starters:
                        </span>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-6 text-[10px] px-2"
                            onClick={() => handleQuickTemplate('greeting')}
                        >
                            Intro Catch-up
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-6 text-[10px] px-2"
                            onClick={() => handleQuickTemplate('followup')}
                        >
                            Proposal Follow-up
                        </Button>
                        {contact.candidateId && (
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="h-6 text-[10px] px-2 border-primary/40 text-primary"
                                onClick={() => handleQuickTemplate('ats')}
                            >
                                ATS Candidate
                            </Button>
                        )}
                    </div>

                    <Textarea
                        placeholder="Type WhatsApp message here..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        rows={5}
                        className="text-xs bg-muted/20 border-border/80 resize-none font-normal"
                    />

                    <p className="text-[11px] text-muted-foreground">
                        This message will be logged in the contact's CRM timeline and synced to KonnectX live inbox.
                    </p>
                </div>

                <DialogFooter>
                    <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isSending}>
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        size="sm"
                        onClick={handleSend}
                        disabled={isSending || !message.trim()}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold gap-1.5"
                    >
                        {isSending ? (
                            <>
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                Sending...
                            </>
                        ) : (
                            <>
                                <Send className="w-3.5 h-3.5" />
                                Send Message
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
