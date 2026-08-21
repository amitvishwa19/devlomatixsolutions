"use client";

import React, { useState } from "react";
import { 
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Send, Phone, MessageSquare, Sparkles, AlertCircle, CheckCircle2, ShieldCheck } from "lucide-react";
import { useAction } from "@/hooks/use-action";
import { sendBrowserMessage } from "../_actions/send-browser-message";
import { toast } from "sonner";

export default function QuickTestMessageModal({ open, onOpenChange, workspaceId, onSentSuccess }) {
    const [recipient, setRecipient] = useState("");
    const [messageText, setMessageText] = useState("Hello! 👋 This is a test message from your KonnectX WhatsApp Business Cloud API integration.");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { execute: executeSendMessage } = useAction(sendBrowserMessage, {
        onSuccess: () => {
            setIsSubmitting(false);
            toast.success("Test message dispatched successfully via Meta Cloud API!", {
                description: `Sent to ${recipient}`
            });
            onOpenChange(false);
            if (onSentSuccess) onSentSuccess();
        },
        onError: (err) => {
            setIsSubmitting(false);
            toast.error(err || "Failed to send test message via Meta API");
        }
    });

    const handleSend = (e) => {
        e?.preventDefault();
        const cleanedPhone = recipient.replace(/\D/g, "");
        if (!cleanedPhone || cleanedPhone.length < 8) {
            toast.error("Please enter a valid recipient phone number with country code (e.g., +14155552671 or 919876543210)");
            return;
        }
        if (!messageText.trim()) {
            toast.error("Please enter a message to send.");
            return;
        }

        setIsSubmitting(true);
        executeSendMessage({
            workspaceId,
            to: cleanedPhone,
            text: messageText.trim()
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md bg-card border-border/80 p-0 overflow-hidden shadow-2xl">
                <div className="bg-gradient-to-r from-emerald-500/15 via-primary/10 to-transparent p-5 pb-4 border-b border-border/60">
                    <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                            <Send className="w-5 h-5" />
                        </div>
                        <div>
                            <DialogTitle className="text-base font-bold text-foreground">
                                Quick Test WhatsApp Message
                            </DialogTitle>
                            <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                                Verify live Meta Cloud API delivery and webhook responsiveness
                            </DialogDescription>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSend} className="p-5 space-y-4">
                    {/* Recipient Phone */}
                    <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="test-phone" className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                                <Phone className="w-3.5 h-3.5 text-muted-foreground" /> Recipient Phone Number
                            </Label>
                            <span className="text-[10px] text-muted-foreground font-mono">Include country code</span>
                        </div>
                        <Input
                            id="test-phone"
                            placeholder="e.g. +14155552671 or 919876543210"
                            value={recipient}
                            onChange={(e) => setRecipient(e.target.value)}
                            className="bg-background border-border text-sm h-9"
                            required
                        />
                    </div>

                    {/* Message Body */}
                    <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="test-message" className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                                <MessageSquare className="w-3.5 h-3.5 text-muted-foreground" /> Message Content
                            </Label>
                            <span className="text-[10px] font-mono text-muted-foreground">
                                {messageText.length}/1024 chars
                            </span>
                        </div>
                        <Textarea
                            id="test-message"
                            placeholder="Type test message content..."
                            value={messageText}
                            onChange={(e) => setMessageText(e.target.value)}
                            className="bg-background border-border text-xs min-h-[90px] resize-none"
                            maxLength={1024}
                            required
                        />
                    </div>

                    {/* Meta Cloud API Notice */}
                    <div className="p-3 rounded-lg bg-secondary/40 border border-border/60 text-[11px] text-muted-foreground space-y-1">
                        <div className="flex items-center gap-1.5 font-semibold text-foreground">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                            <span>Meta Cloud API Production Sender</span>
                        </div>
                        <p className="leading-relaxed">
                            Plain text messages require an open 24h conversation window with the recipient. If sending outside a 24h window, ensure the test number has initiated a conversation or use approved templates.
                        </p>
                    </div>

                    <DialogFooter className="pt-2 flex items-center justify-end gap-2 border-t border-border/40">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => onOpenChange(false)}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            size="sm"
                            className="bg-emerald-600 hover:bg-emerald-500 text-white gap-1.5 shadow-sm"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    <span>Dispatching...</span>
                                </>
                            ) : (
                                <>
                                    <Send className="w-3.5 h-3.5" />
                                    <span>Send Live Message</span>
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
