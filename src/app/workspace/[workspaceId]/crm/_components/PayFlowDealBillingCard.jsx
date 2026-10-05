'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    Receipt,
    FileText,
    Plus,
    MessageCircle,
    Eye,
    Send,
    CheckCircle2,
    Clock,
    AlertCircle,
    Loader2,
    ExternalLink,
    Zap,
    ShieldCheck
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

import {
    getDealBillingRecordsAction,
    sendInvoicePaymentReminderAction,
    sendQuotationWhatsAppAction
} from '../_actions/crm-invoice-actions';

import GenerateQuotationModal from './GenerateQuotationModal';
import QuotationPreviewModal from './QuotationPreviewModal';

export default function PayFlowDealBillingCard({ workspaceId, deal, onUpdated }) {
    const [billingData, setBillingData] = useState({ quotations: [], invoices: [] });
    const [isLoading, setIsLoading] = useState(true);

    const [isGenerateOpen, setIsGenerateOpen] = useState(false);
    const [previewDoc, setPreviewDoc] = useState(null);
    const [isSendingReminderId, setIsSendingReminderId] = useState(null);

    const loadBilling = async () => {
        if (!deal?.id || !workspaceId) return;
        try {
            setIsLoading(true);
            const res = await getDealBillingRecordsAction(workspaceId, deal.id);
            if (res.success) {
                setBillingData(res.data);
            }
        } catch (error) {
            console.error("Error loading deal billing:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadBilling();
    }, [workspaceId, deal?.id]);

    const handleSendPaymentReminder = async (invoice) => {
        const phone = deal?.contact?.phone;
        if (!phone) {
            toast.error("Contact has no phone number on file.");
            return;
        }

        try {
            setIsSendingReminderId(invoice.id);
            const res = await sendInvoicePaymentReminderAction(workspaceId, {
                dealId: deal.id,
                invoiceId: invoice.id,
                phone,
                clientName: deal.contact?.name,
                amount: invoice.amount
            });

            if (res.success) {
                toast.success(`Payment link sent to ${phone} via KonnectX WhatsApp!`);
                loadBilling();
                if (onUpdated) onUpdated();
            } else {
                toast.error(res.error || "Failed to send payment link");
            }
        } catch (error) {
            toast.error("Error sending payment link");
        } finally {
            setIsSendingReminderId(null);
        }
    };

    const quotations = billingData.quotations || [];
    const invoices = billingData.invoices || [];

    return (
        <div className="p-4 rounded-2xl bg-card border border-border/80 space-y-4 shadow-xs">
            {/* Header */}
            <div className="flex items-center justify-between pb-2 border-b border-border/60">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-500">
                        <Receipt className="w-4 h-4" />
                    </div>
                    <div>
                        <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                            PayFlow Invoicing & Quotes
                            <Badge variant="outline" className="text-[10px] bg-blue-500/5 text-blue-500 border-blue-500/20 font-bold">
                                PayFlow Bridge
                            </Badge>
                        </h4>
                    </div>
                </div>

                <div className="flex items-center gap-1.5">
                    <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => setIsGenerateOpen(true)}
                        className="h-7 text-[11px] gap-1 bg-background font-semibold"
                    >
                        <Plus className="w-3 h-3" />
                        <span>New Quote / Invoice</span>
                    </Button>
                </div>
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center py-4 text-xs text-muted-foreground">
                    <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
                    <span>Loading billing history...</span>
                </div>
            ) : quotations.length === 0 && invoices.length === 0 ? (
                <div className="p-4 rounded-xl bg-muted/20 border border-dashed border-border/80 text-center space-y-2">
                    <p className="text-xs text-muted-foreground">
                        No quotations or PayFlow invoices generated for this deal yet.
                    </p>
                    <Button
                        type="button"
                        size="sm"
                        onClick={() => setIsGenerateOpen(true)}
                        className="h-7 text-xs font-bold gap-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white"
                    >
                        <Receipt className="w-3 h-3" />
                        <span>1-Click Generate Quotation</span>
                    </Button>
                </div>
            ) : (
                <div className="space-y-3">
                    {/* Invoices List */}
                    {invoices.length > 0 && (
                        <div className="space-y-1.5">
                            <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">
                                PayFlow Invoices ({invoices.length})
                            </span>
                            <div className="space-y-1.5">
                                {invoices.map((inv) => {
                                    const isSending = isSendingReminderId === inv.id;
                                    const isPaid = inv.status === 'Paid';

                                    return (
                                        <div
                                            key={inv.id}
                                            className="p-2.5 rounded-xl bg-muted/20 border border-border/80 flex items-center justify-between gap-2 text-xs"
                                        >
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-1.5">
                                                    <span className="font-bold text-foreground font-mono">{inv.id}</span>
                                                    <Badge className={`text-[9px] py-0 px-1 font-bold ${
                                                        isPaid
                                                            ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                                                            : inv.status === 'Overdue'
                                                            ? 'bg-rose-500/10 text-rose-500 border-rose-500/20'
                                                            : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                                                    }`}>
                                                        {inv.status}
                                                    </Badge>
                                                </div>
                                                <div className="text-[11px] font-black text-primary">
                                                    {inv.amount} <span className="text-[10px] font-normal text-muted-foreground">({inv.gateway || 'Razorpay'})</span>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-1 shrink-0">
                                                {deal?.contact?.phone && !isPaid && (
                                                    <Button
                                                        type="button"
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => handleSendPaymentReminder(inv)}
                                                        disabled={isSending}
                                                        className="h-7 text-[11px] gap-1 text-[#25D366] hover:bg-[#25D366]/10 px-2"
                                                        title="Send PayFlow Payment Link via WhatsApp"
                                                    >
                                                        {isSending ? <Loader2 className="w-3 h-3 animate-spin" /> : <MessageCircle className="w-3 h-3" />}
                                                        <span>Remind</span>
                                                    </Button>
                                                )}

                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => setPreviewDoc(inv)}
                                                    className="h-7 text-[11px] gap-1 px-2"
                                                    title="View & Print Invoice"
                                                >
                                                    <Eye className="w-3 h-3" />
                                                    <span>View</span>
                                                </Button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Quotations List */}
                    {quotations.length > 0 && (
                        <div className="space-y-1.5">
                            <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">
                                Quotations & Estimates ({quotations.length})
                            </span>
                            <div className="space-y-1.5">
                                {quotations.map((quo) => (
                                    <div
                                        key={quo.id}
                                        className="p-2.5 rounded-xl bg-muted/20 border border-border/80 flex items-center justify-between gap-2 text-xs"
                                    >
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-1.5">
                                                <span className="font-bold text-foreground font-mono">{quo.id}</span>
                                                <Badge className="text-[9px] py-0 px-1 bg-blue-500/10 text-blue-500 border-blue-500/20 font-bold">
                                                    {quo.status}
                                                </Badge>
                                            </div>
                                            <div className="text-[11px] font-black text-foreground">
                                                ₹{quo.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-1 shrink-0">
                                            <Button
                                                type="button"
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => setPreviewDoc(quo)}
                                                className="h-7 text-[11px] gap-1 px-2 font-semibold"
                                            >
                                                <Eye className="w-3 h-3 text-primary" />
                                                <span>Preview</span>
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Modals */}
            <GenerateQuotationModal
                isOpen={isGenerateOpen}
                onClose={() => setIsGenerateOpen(false)}
                deal={deal}
                workspaceId={workspaceId}
                onDocumentCreated={() => {
                    loadBilling();
                    if (onUpdated) onUpdated();
                }}
            />

            <QuotationPreviewModal
                isOpen={!!previewDoc}
                onClose={() => setPreviewDoc(null)}
                documentData={previewDoc}
                workspaceId={workspaceId}
                onWhatsAppSent={() => loadBilling()}
            />
        </div>
    );
}
