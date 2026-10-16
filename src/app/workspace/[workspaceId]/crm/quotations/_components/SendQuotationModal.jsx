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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { MessageCircle, Send, Loader2, Sparkles, Phone, FileText } from 'lucide-react';
import { sendCrmQuotationViaWhatsAppAction } from '../../_actions/quotation-actions';
import { CURRENCY_SYMBOLS } from './QuotationDocumentPreview';

export default function SendQuotationModal({
    isOpen,
    onClose,
    workspaceId,
    quotation,
    onSuccess
}) {
    const [recipientPhone, setRecipientPhone] = useState('');
    const [recipientName, setRecipientName] = useState('');
    const [messageText, setMessageText] = useState('');
    const [isSending, setIsSending] = useState(false);

    useEffect(() => {
        if (!quotation) return;

        const details = quotation.data || {};
        const client = details.client || {};
        const qInfo = details.quotation || {};
        const items = details.items || [];
        const currency = qInfo.currency || 'INR';
        const symbol = CURRENCY_SYMBOLS[currency] || '₹';

        const phone = client.phone || '';
        const name = client.contactPerson || client.name || quotation.clientName || 'Valued Client';

        setRecipientPhone(phone);
        setRecipientName(name);

        // Build itemized bullet list
        const itemsSummary = items
            .slice(0, 4)
            .map(i => `• ${i.name} (Qty: ${i.quantity || 1}) - ${symbol}${Number(i.total || i.unitPrice || 0).toLocaleString()}`)
            .join('\n');

        const moreItems = items.length > 4 ? `\n...and ${items.length - 4} more item(s)` : '';

        // Formulate professional message text
        const defaultMessage = `Hello ${name},

Please find our proposal details below:

📄 *${qInfo.title || 'Official Quotation'}*
🔢 Quotation No: *${quotation.quotationNumber}*
💰 Total Amount: *${symbol}${Number(quotation.total || 0).toLocaleString()}*
📅 Valid Until: ${qInfo.validUntil || '30 days from issue'}

*Scope of Items:*
${itemsSummary}${moreItems}

Please review the proposal and let us know if you have any questions or are ready to proceed.

Best regards,
${details.company?.name || 'Sales Team'}`;

        setMessageText(defaultMessage);
    }, [quotation, isOpen]);

    if (!quotation) return null;

    const handleSend = async (e) => {
        e.preventDefault();
        if (!recipientPhone.trim()) {
            toast.error("Please enter a valid WhatsApp phone number");
            return;
        }
        if (!messageText.trim()) {
            toast.error("Please enter a message to send");
            return;
        }

        setIsSending(true);
        try {
            const res = await sendCrmQuotationViaWhatsAppAction(workspaceId, {
                quotationId: quotation.id,
                recipientPhone: recipientPhone.trim(),
                recipientName: recipientName.trim(),
                customText: messageText.trim(),
                contactId: quotation.data?.client?.contactId,
                dealId: quotation.data?.quotation?.dealId
            });

            if (res.success) {
                toast.success(`Quotation sent to ${recipientName} via WhatsApp!`);
                onSuccess?.();
                onClose();
            } else {
                toast.error(res.error || "Failed to dispatch WhatsApp message");
            }
        } catch (error) {
            console.error("Send quotation error:", error);
            toast.error("An error occurred while sending quotation");
        } finally {
            setIsSending(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-lg p-5">
                <DialogHeader className="pb-3 border-b border-border text-left">
                    <div className="flex items-center justify-between gap-2">
                        <DialogTitle className="flex items-center gap-2 text-base font-bold text-foreground">
                            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                                <MessageCircle className="w-4 h-4" />
                            </div>
                            <span>Send Quotation to Client</span>
                        </DialogTitle>
                        <Badge variant="outline" className="font-mono text-[11px] font-bold text-primary">
                            {quotation.quotationNumber}
                        </Badge>
                    </div>
                    <DialogDescription className="text-xs text-muted-foreground mt-1">
                        Dispatch quotation proposal summary directly to client via WhatsApp.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSend} className="space-y-4 pt-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold">Recipient Name</Label>
                            <Input
                                value={recipientName}
                                onChange={(e) => setRecipientName(e.target.value)}
                                placeholder="Client contact name"
                                className="h-8 text-xs"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold">
                                WhatsApp Phone <span className="text-red-500">*</span>
                            </Label>
                            <div className="relative">
                                <Phone className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-muted-foreground" />
                                <Input
                                    value={recipientPhone}
                                    onChange={(e) => setRecipientPhone(e.target.value)}
                                    placeholder="+919876543210"
                                    className="h-8 text-xs pl-8 font-mono"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                            <Label className="text-xs font-semibold">WhatsApp Message Body</Label>
                            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                <Sparkles className="w-3 h-3 text-emerald-500" />
                                Auto-formatted summary
                            </span>
                        </div>
                        <Textarea
                            value={messageText}
                            onChange={(e) => setMessageText(e.target.value)}
                            rows={8}
                            className="text-xs font-mono leading-relaxed resize-none bg-muted/20"
                        />
                    </div>

                    <div className="p-3 bg-emerald-500/5 rounded-xl border border-emerald-500/20 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-medium">
                            <FileText className="w-4 h-4 shrink-0" />
                            <span>Quotation Value: ₹{Number(quotation.total || 0).toLocaleString()}</span>
                        </div>
                        <span className="text-[10px] text-muted-foreground">Status updates to "Sent"</span>
                    </div>

                    <DialogFooter className="pt-2 flex items-center justify-end gap-2">
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={onClose}
                            className="text-xs"
                            disabled={isSending}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            size="sm"
                            className="text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
                            disabled={isSending}
                        >
                            {isSending ? (
                                <>
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    <span>Sending WhatsApp...</span>
                                </>
                            ) : (
                                <>
                                    <Send className="w-3.5 h-3.5" />
                                    <span>Send via WhatsApp</span>
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
