'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    X,
    Building2,
    Users,
    MessageCircle,
    Calendar,
    Trash2,
    CheckCircle2,
    TrendingUp,
    Send,
    Loader2,
    Clock,
    Phone
} from 'lucide-react';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { getDealByIdAction, updateDealAction, updateDealStageAction, deleteDealAction } from "../../_actions/deal-actions";
import { createActivityAction } from "../../_actions/activity-actions";
import { sendWhatsAppFromCrmAction } from "../../_actions/crm-bridge-actions";

export default function DealDrawer({ isOpen, onClose, dealId, workspaceId, stages = [], onDealUpdated }) {
    const [deal, setDeal] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [noteText, setNoteText] = useState('');
    const [isLoggingNote, setIsLoggingNote] = useState(false);

    // Quick WhatsApp State
    const [showWhatsAppBox, setShowWhatsAppBox] = useState(false);
    const [waMessage, setWaMessage] = useState('');
    const [isSendingWA, setIsSendingWA] = useState(false);

    useEffect(() => {
        if (!isOpen || !dealId) return;

        async function fetchDeal() {
            setIsLoading(true);
            try {
                const res = await getDealByIdAction(workspaceId, dealId);
                if (res.success) {
                    setDeal(res.data);
                } else {
                    toast.error(res.error || "Failed to load deal");
                }
            } catch (error) {
                console.error("Error loading deal:", error);
            } finally {
                setIsLoading(false);
            }
        }

        fetchDeal();
    }, [isOpen, dealId, workspaceId]);

    const handleStageChange = async (newStageId) => {
        if (!deal) return;
        try {
            const res = await updateDealStageAction(workspaceId, deal.id, newStageId);
            if (res.success) {
                setDeal(prev => ({ ...prev, stageId: newStageId, stage: res.data.stage }));
                toast.success(`Stage updated to ${res.data.stage.name}`);
                onDealUpdated && onDealUpdated(res.data);
            } else {
                toast.error(res.error || "Failed to update stage");
            }
        } catch (error) {
            toast.error("Error updating stage");
        }
    };

    const handleSaveField = async (field, value) => {
        if (!deal) return;
        setIsSaving(true);
        try {
            const res = await updateDealAction(workspaceId, deal.id, { [field]: value });
            if (res.success) {
                setDeal(res.data);
                toast.success("Deal updated");
                onDealUpdated && onDealUpdated(res.data);
            }
        } catch (error) {
            toast.error("Failed to save changes");
        } finally {
            setIsSaving(false);
        }
    };

    const handleAddNote = async () => {
        if (!noteText.trim()) return;
        setIsLoggingNote(true);
        try {
            const res = await createActivityAction(workspaceId, {
                dealId: deal.id,
                contactId: deal.contactId,
                accountId: deal.accountId,
                type: "NOTE",
                title: "Deal Note",
                description: noteText.trim()
            });

            if (res.success) {
                setDeal(prev => ({
                    ...prev,
                    activities: [res.data, ...(prev.activities || [])]
                }));
                setNoteText('');
                toast.success("Note added");
            }
        } catch (error) {
            toast.error("Failed to log note");
        } finally {
            setIsLoggingNote(false);
        }
    };

    const handleSendWhatsApp = async () => {
        if (!deal?.contact?.phone || !waMessage.trim()) {
            toast.error("Phone number and message required");
            return;
        }
        setIsSendingWA(true);
        try {
            const res = await sendWhatsAppFromCrmAction(workspaceId, {
                contactId: deal.contactId,
                dealId: deal.id,
                phone: deal.contact.phone,
                message: waMessage.trim()
            });

            if (res.success) {
                toast.success("WhatsApp message dispatched via KonnectX!");
                setWaMessage('');
                setShowWhatsAppBox(false);
                // Refresh activities
                const updated = await getDealByIdAction(workspaceId, deal.id);
                if (updated.success) setDeal(updated.data);
            } else {
                toast.error(res.error || "Failed to send WhatsApp");
            }
        } catch (error) {
            toast.error("WhatsApp error");
        } finally {
            setIsSendingWA(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this deal?")) return;
        try {
            const res = await deleteDealAction(workspaceId, deal.id);
            if (res.success) {
                toast.success("Deal deleted");
                onClose();
                onDealUpdated && onDealUpdated(null, deal.id);
            }
        } catch (error) {
            toast.error("Failed to delete deal");
        }
    };

    return (
        <Sheet open={isOpen} onOpenChange={onClose}>
            <SheetContent className="w-full sm:max-w-[550px] p-0 flex flex-col bg-card border-l border-border">
                {isLoading || !deal ? (
                    <div className="flex-1 flex flex-col items-center justify-center gap-2">
                        <Loader2 className="w-6 h-6 animate-spin text-primary" />
                        <p className="text-xs text-muted-foreground">Loading deal dossier...</p>
                    </div>
                ) : (
                    <>
                        {/* Header */}
                        <SheetHeader className="p-5 pb-4 border-b border-border bg-muted/20">
                            <div className="flex items-start justify-between gap-3">
                                <div className="space-y-1 min-w-0 flex-1">
                                    <Input
                                        value={deal.title}
                                        onChange={(e) => setDeal({ ...deal, title: e.target.value })}
                                        onBlur={(e) => handleSaveField('title', e.target.value)}
                                        className="text-base font-bold text-foreground border-transparent hover:border-border focus:border-primary px-1.5 h-8 bg-transparent"
                                    />
                                    <div className="flex items-center gap-2 px-1.5">
                                        <Badge variant="outline" className="text-[10px] uppercase font-bold" style={{ borderColor: deal.stage?.color, color: deal.stage?.color }}>
                                            {deal.stage?.name}
                                        </Badge>
                                        <span className="text-xs font-semibold text-muted-foreground">
                                            {deal.stage?.probability}% Win Probability
                                        </span>
                                    </div>
                                </div>

                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0"
                                    onClick={handleDelete}
                                    title="Delete deal"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>

                            {/* Stage Stepper Bar */}
                            <div className="flex items-center gap-1.5 pt-3 overflow-x-auto hide-scrollbar">
                                {stages.map((stg) => {
                                    const isCurrent = stg.id === deal.stageId;
                                    return (
                                        <button
                                            key={stg.id}
                                            type="button"
                                            onClick={() => handleStageChange(stg.id)}
                                            className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all shrink-0 border ${
                                                isCurrent
                                                    ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                                                    : 'bg-background hover:bg-muted/80 text-muted-foreground border-border'
                                            }`}
                                        >
                                            {stg.name}
                                        </button>
                                    );
                                })}
                            </div>
                        </SheetHeader>

                        {/* Body Details & Timeline */}
                        <ScrollArea className="flex-1 p-5 space-y-6">
                            {/* Key Value & Properties Grid */}
                            <div className="grid grid-cols-2 gap-3 p-3.5 bg-muted/30 border border-border/70 rounded-xl">
                                <div className="space-y-1">
                                    <label className="text-[10px] uppercase font-bold text-muted-foreground">Deal Value</label>
                                    <div className="flex items-center gap-1.5">
                                        <span className="text-xs font-bold text-muted-foreground">₹</span>
                                        <Input
                                            type="number"
                                            value={deal.value}
                                            onChange={(e) => setDeal({ ...deal, value: e.target.value })}
                                            onBlur={(e) => handleSaveField('value', e.target.value)}
                                            className="h-7 text-xs font-bold bg-background"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[10px] uppercase font-bold text-muted-foreground">Priority</label>
                                    <Select
                                        value={deal.priority || 'MEDIUM'}
                                        onValueChange={(val) => handleSaveField('priority', val)}
                                    >
                                        <SelectTrigger className="h-7 text-xs bg-background">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="LOW">Low</SelectItem>
                                            <SelectItem value="MEDIUM">Medium</SelectItem>
                                            <SelectItem value="HIGH">High</SelectItem>
                                            <SelectItem value="URGENT">Urgent</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* Linked Contact & WhatsApp Bridge */}
                            <div className="space-y-2 pt-2">
                                <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
                                    <span>Associated Contact</span>
                                    {deal.contact && (
                                        <Link href={`/workspace/${workspaceId}/crm/contacts/${deal.contact.id}`} className="text-primary hover:underline text-[10px] font-semibold">
                                            View 360° Dossier &rarr;
                                        </Link>
                                    )}
                                </label>

                                {deal.contact ? (
                                    <div className="p-3 bg-muted/20 border border-border rounded-xl flex items-center justify-between gap-3">
                                        <div className="min-w-0">
                                            <p className="text-xs font-bold text-foreground truncate">{deal.contact.name}</p>
                                            <p className="text-[11px] text-muted-foreground truncate">{deal.contact.phone || deal.contact.email}</p>
                                        </div>

                                        {deal.contact.phone && (
                                            <Button
                                                type="button"
                                                size="sm"
                                                variant="outline"
                                                className="h-7 text-xs gap-1.5 text-[#25D366] border-[#25D366]/30 hover:bg-[#25D366]/10 shrink-0 font-semibold"
                                                onClick={() => setShowWhatsAppBox(!showWhatsAppBox)}
                                            >
                                                <MessageCircle className="w-3.5 h-3.5" />
                                                <span>WhatsApp</span>
                                            </Button>
                                        )}
                                    </div>
                                ) : (
                                    <div className="p-3 border border-dashed rounded-xl text-center text-xs text-muted-foreground">
                                        No contact attached.
                                    </div>
                                )}

                                {/* WhatsApp Outreach Drawer */}
                                {showWhatsAppBox && deal.contact?.phone && (
                                    <div className="p-3 bg-[#25D366]/5 border border-[#25D366]/20 rounded-xl space-y-2">
                                        <div className="flex items-center justify-between text-[11px] text-foreground font-semibold">
                                            <span className="flex items-center gap-1 text-[#25D366]">
                                                <MessageCircle className="w-3.5 h-3.5" />
                                                Send WhatsApp to {deal.contact.phone}
                                            </span>
                                            <button type="button" onClick={() => setShowWhatsAppBox(false)} className="text-muted-foreground hover:text-foreground">
                                                <X className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                        <Textarea
                                            placeholder="Type your message or proposal follow-up..."
                                            value={waMessage}
                                            onChange={(e) => setWaMessage(e.target.value)}
                                            className="text-xs resize-none h-16 bg-background"
                                        />
                                        <div className="flex justify-end">
                                            <Button
                                                size="sm"
                                                className="h-7 text-xs bg-[#25D366] hover:bg-[#20ba5a] text-white gap-1 font-bold"
                                                onClick={handleSendWhatsApp}
                                                disabled={isSendingWA || !waMessage.trim()}
                                            >
                                                {isSendingWA ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                                                <span>Send via KonnectX</span>
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Linked Company */}
                            {deal.account && (
                                <div className="space-y-1.5 pt-2">
                                    <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                                        Associated Company
                                    </label>
                                    <div className="p-3 bg-muted/20 border border-border rounded-xl flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Building2 className="w-4 h-4 text-primary" />
                                            <span className="text-xs font-semibold text-foreground">{deal.account.name}</span>
                                        </div>
                                        <Link href={`/workspace/${workspaceId}/crm/accounts/${deal.account.id}`} className="text-primary hover:underline text-[10px] font-semibold">
                                            Company Hub &rarr;
                                        </Link>
                                    </div>
                                </div>
                            )}

                            {/* Activity Log & Note Composer */}
                            <div className="space-y-3 pt-4 border-t border-border">
                                <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
                                    Deal Activity Timeline
                                </h4>

                                <div className="space-y-2">
                                    <Textarea
                                        placeholder="Add a call note, follow-up memo, or meeting notes..."
                                        value={noteText}
                                        onChange={(e) => setNoteText(e.target.value)}
                                        className="text-xs resize-none h-16 bg-background border-border"
                                    />
                                    <div className="flex justify-end">
                                        <Button
                                            size="sm"
                                            className="h-7 text-xs gap-1 font-semibold"
                                            onClick={handleAddNote}
                                            disabled={isLoggingNote || !noteText.trim()}
                                        >
                                            {isLoggingNote && <Loader2 className="w-3 h-3 animate-spin" />}
                                            <span>Post Note</span>
                                        </Button>
                                    </div>
                                </div>

                                {/* Timeline Stream */}
                                <div className="space-y-3 pt-2">
                                    {(deal.activities || []).map((act) => (
                                        <div key={act.id} className="p-3 rounded-lg border border-border/60 bg-muted/15 text-xs space-y-1">
                                            <div className="flex items-center justify-between gap-2">
                                                <span className="font-bold text-foreground">{act.title}</span>
                                                <span className="text-[10px] text-muted-foreground">
                                                    {new Date(act.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                                                </span>
                                            </div>
                                            {act.description && (
                                                <p className="text-muted-foreground whitespace-pre-wrap">{act.description}</p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </ScrollArea>
                    </>
                )}
            </SheetContent>
        </Sheet>
    );
}
