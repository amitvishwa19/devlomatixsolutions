'use client';

import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { toast } from 'sonner';
import {
    Flame,
    MessageCircle,
    Copy,
    Check,
    Clock,
    Loader2
} from 'lucide-react';

import { generateStalledDealRevivalAction } from '../_actions/crm-ai-actions';
import { sendWhatsAppFromCrmAction } from '../_actions/crm-bridge-actions';

export default function AiStalledDealRevivalModal({
    isOpen,
    onClose,
    workspaceId,
    deal,
    onRevivalSent
}) {
    const [isLoading, setIsLoading] = useState(false);
    const [revivalData, setRevivalData] = useState(null);
    const [activeStrategy, setActiveStrategy] = useState('friendlyCheckin');
    const [customizedMessage, setCustomizedMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (!isOpen || !deal?.id || !workspaceId) {
            setRevivalData(null);
            return;
        }

        async function fetchRevivalPlan() {
            setIsLoading(true);
            try {
                const res = await generateStalledDealRevivalAction(workspaceId, deal.id);
                if (res.success && res.data) {
                    setRevivalData(res.data);
                    const defaultStrategy = res.data.recommendedStrategy === 'POLITE_BREAKUP'
                        ? 'politeBreakup'
                        : res.data.recommendedStrategy === 'VALUE_ADD'
                            ? 'valueAdd'
                            : 'friendlyCheckin';
                    setActiveStrategy(defaultStrategy);
                    setCustomizedMessage(res.data.strategies[defaultStrategy] || '');
                } else {
                    toast.error(res.error || "Failed to generate revival plan");
                }
            } catch (err) {
                console.error("Revival fetch error:", err);
                toast.error("Failed to generate AI revival options");
            } finally {
                setIsLoading(false);
            }
        }

        fetchRevivalPlan();
    }, [isOpen, deal?.id, workspaceId]);

    const handleStrategyChange = (val) => {
        setActiveStrategy(val);
        if (revivalData?.strategies?.[val]) {
            setCustomizedMessage(revivalData.strategies[val]);
        }
    };

    const handleCopy = () => {
        if (!customizedMessage) return;
        navigator.clipboard.writeText(customizedMessage);
        setCopied(true);
        toast.success("Copied revival message to clipboard!");
        setTimeout(() => setCopied(false), 2000);
    };

    const handleSendWhatsApp = async () => {
        if (!deal?.contact?.phone) {
            toast.error("Contact does not have a phone number for WhatsApp dispatch.");
            return;
        }
        if (!customizedMessage.trim()) {
            toast.error("Message cannot be empty.");
            return;
        }

        setIsSending(true);
        const toastId = toast.loading("Dispatching AI revival touchpoint via KonnectX WhatsApp...");
        try {
            const res = await sendWhatsAppFromCrmAction(workspaceId, {
                contactId: deal.contactId,
                dealId: deal.id,
                phone: deal.contact.phone,
                message: customizedMessage
            });

            if (res.success) {
                toast.success("Revival message sent and logged to activity timeline!", { id: toastId });
                if (onRevivalSent) onRevivalSent();
                onClose();
            } else {
                toast.error(res.error || "Failed to dispatch WhatsApp message", { id: toastId });
            }
        } catch (err) {
            console.error("[REVIVAL_WHATSAPP_DISPATCH_ERROR]", err);
            toast.error("Error dispatching WhatsApp message", { id: toastId });
        } finally {
            setIsSending(false);
        }
    };

    if (!isOpen) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl bg-card border-border shadow-2xl p-6">
                <DialogHeader className="space-y-1">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-500 flex items-center justify-center">
                            <Flame className="w-4 h-4" />
                        </div>
                        <DialogTitle className="text-base font-bold text-foreground">
                            Ghosted Deal Revival Agent
                        </DialogTitle>
                        <Badge variant="outline" className="text-[10px] bg-rose-500/10 text-rose-500 border-rose-500/20 ml-auto">
                            {revivalData?.daysInactive || 7}+ Days Inactive
                        </Badge>
                    </div>
                    <DialogDescription className="text-xs text-muted-foreground">
                        FlowGenix analyzes past conversational cadence to deploy high-converting loss-aversion and re-engagement messaging.
                    </DialogDescription>
                </DialogHeader>

                {isLoading ? (
                    <div className="py-12 flex flex-col items-center justify-center gap-3">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        <p className="text-xs text-muted-foreground font-medium">
                            Analyzing past interactions & generating psychological revival drafts...
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4 py-2">
                        {/* Target Context Pill */}
                        <div className="flex items-center justify-between p-3 rounded-xl bg-muted/40 border border-border/80 text-xs">
                            <div>
                                <span className="font-bold text-foreground">{deal?.title}</span>
                                <p className="text-[11px] text-muted-foreground">
                                    Client: {deal?.contact?.name || 'Contact'} {deal?.account?.name ? `(${deal.account.name})` : ''}
                                </p>
                            </div>
                            <div className="text-right">
                                <span className="font-mono font-bold text-foreground">
                                    {deal?.currency || '₹'} {Number(deal?.value || 0).toLocaleString()}
                                </span>
                                <p className="text-[10px] text-rose-500 font-semibold">
                                    Stage: {deal?.stage?.name || 'In Progress'}
                                </p>
                            </div>
                        </div>

                        {/* Strategy Tabs */}
                        <Tabs value={activeStrategy} onValueChange={handleStrategyChange} className="w-full">
                            <TabsList className="grid grid-cols-3 h-9 bg-muted/60 p-1">
                                <TabsTrigger value="friendlyCheckin" className="text-xs">
                                    1. Friendly Pulse
                                </TabsTrigger>
                                <TabsTrigger value="valueAdd" className="text-xs">
                                    2. Value-Add Hook
                                </TabsTrigger>
                                <TabsTrigger value="politeBreakup" className="text-xs">
                                    3. Polite Breakup 🔥
                                </TabsTrigger>
                            </TabsList>

                            <div className="mt-3 space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-[11px] font-semibold text-muted-foreground">
                                        Personalized Message Draft (Editable):
                                    </span>
                                    <Badge variant="secondary" className="text-[10px] gap-1 font-normal">
                                        <Clock className="w-3 h-3 text-primary" />
                                        Optimal timing: {revivalData?.bestTimeToDispatch || 'Morning 10:30 AM'}
                                    </Badge>
                                </div>
                                <Textarea
                                    rows={5}
                                    value={customizedMessage}
                                    onChange={(e) => setCustomizedMessage(e.target.value)}
                                    className="text-xs font-mono leading-relaxed bg-background/80 resize-none border-border"
                                    placeholder="AI generated revival message..."
                                />
                            </div>
                        </Tabs>
                    </div>
                )}

                <DialogFooter className="flex items-center justify-between sm:justify-between w-full pt-2 border-t border-border">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleCopy}
                        disabled={isLoading || !customizedMessage}
                        className="h-8 text-xs gap-1.5"
                    >
                        {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copied ? 'Copied' : 'Copy Message'}</span>
                    </Button>

                    <div className="flex items-center gap-2">
                        <Button type="button" variant="ghost" size="sm" onClick={onClose} className="h-8 text-xs">
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            size="sm"
                            onClick={handleSendWhatsApp}
                            disabled={isLoading || isSending || !deal?.contact?.phone}
                            className="h-8 text-xs font-semibold gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm"
                        >
                            {isSending ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                                <MessageCircle className="w-3.5 h-3.5" />
                            )}
                            <span>Send via KonnectX</span>
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
