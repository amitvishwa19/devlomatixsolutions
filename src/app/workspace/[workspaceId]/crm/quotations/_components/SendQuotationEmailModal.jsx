'use client';

import React, { useState, useEffect, useRef } from 'react';
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
import { Mail, Send, Loader2, FileText, Paperclip, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';
import { sendCrmQuotationViaEmailAction } from '../../_actions/quotation-actions';
import { generateQuotationPdf } from '../_utils/quotation-pdf';
import QuotationDocumentPreview, { CURRENCY_SYMBOLS } from './QuotationDocumentPreview';

export default function SendQuotationEmailModal({
    isOpen,
    onClose,
    workspaceId,
    quotation,
    targetElementRef,
    onSuccess
}) {
    const offscreenRef = useRef(null);

    const [recipientEmail, setRecipientEmail] = useState('');
    const [recipientName, setRecipientName] = useState('');
    const [subject, setSubject] = useState('');
    const [customMessage, setCustomMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [sendingStep, setSendingStep] = useState('');

    useEffect(() => {
        if (!quotation) return;

        const details = quotation.data || {};
        const client = details.client || {};
        const qInfo = details.quotation || {};

        const defaultEmail = client.email || '';
        const defaultName = client.contactPerson || client.name || quotation.clientName || '';
        const defaultSubject = `Commercial Proposal: ${quotation.quotationNumber} - ${qInfo.title || 'Official Quotation'}`;
        const defaultMsg = `Dear ${defaultName || 'Valued Client'},\n\nPlease find attached our official commercial quotation for ${qInfo.title || 'the discussed scope of work'}.\n\nYou may review the complete itemized breakdown and terms in the attached PDF, or click the secure link inside the email to review and digitally sign online.\n\nPlease let us know if you have any questions or require modifications.`;

        setRecipientEmail(defaultEmail);
        setRecipientName(defaultName);
        setSubject(defaultSubject);
        setCustomMessage(defaultMsg);
        setSendingStep('');
    }, [quotation, isOpen]);

    if (!quotation) return null;

    const details = quotation.data || {};
    const currency = details.quotation?.currency || 'INR';
    const symbol = CURRENCY_SYMBOLS[currency] || '₹';
    const total = Number(quotation.total || 0).toLocaleString('en-IN');
    const pdfFilename = `Quotation_${quotation.quotationNumber}.pdf`;

    const handleSend = async (e) => {
        e.preventDefault();
        if (!recipientEmail?.trim()) {
            toast.error("Please enter a valid recipient email address.");
            return;
        }

        setIsSending(true);
        const toastId = toast.loading("Preparing quotation PDF attachment...");

        try {
            // 1. Identify which DOM node to convert to PDF
            setSendingStep("Generating official quotation PDF...");
            let elementToCapture = targetElementRef?.current;
            if (!elementToCapture && offscreenRef.current) {
                elementToCapture = offscreenRef.current.querySelector('#quotation-print-area') || offscreenRef.current;
            }

            if (!elementToCapture) {
                throw new Error("Unable to locate quotation document preview for PDF generation.");
            }

            // 2. Generate PDF and get base64 string
            const { base64 } = await generateQuotationPdf(elementToCapture);

            // 3. Dispatch server action with PDF attachment
            setSendingStep("Sending email with attached PDF...");
            const res = await sendCrmQuotationViaEmailAction(workspaceId, {
                quotationId: quotation.id,
                recipientEmail: recipientEmail.trim(),
                recipientName: recipientName.trim(),
                subject: subject.trim(),
                customMessage: customMessage.trim(),
                pdfBase64: base64,
                pdfFilename
            });

            if (res.success) {
                toast.success(`Quotation sent via email to ${recipientEmail} with PDF attached!`, { id: toastId });
                if (onSuccess) onSuccess(res.data?.quotation);
                onClose();
            } else {
                toast.error(res.error || "Failed to send email. Please try again.", { id: toastId });
            }
        } catch (error) {
            console.error("Error sending quotation email:", error);
            toast.error(error.message || "Failed to generate PDF or dispatch email.", { id: toastId });
        } finally {
            setIsSending(false);
            setSendingStep('');
        }
    };

    return (
        <>
            {/* Hidden container for rendering quotation preview when modal is triggered from table row */}
            {!targetElementRef && (
                <div
                    ref={offscreenRef}
                    style={{
                        position: 'fixed',
                        left: '-9999px',
                        top: 0,
                        width: '800px',
                        opacity: 0,
                        pointerEvents: 'none',
                        zIndex: -1
                    }}
                    aria-hidden="true"
                >
                    <QuotationDocumentPreview data={quotation} showActions={false} />
                </div>
            )}

            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center">
                                <Mail className="w-4 h-4" />
                            </div>
                            <div>
                                <DialogTitle className="text-base font-bold">
                                    Send Quotation via Email
                                </DialogTitle>
                                <DialogDescription className="text-xs">
                                    Email official commercial proposal to your client with the signed PDF document attached.
                                </DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>

                    {/* Quotation Summary Chip */}
                    <div className="bg-muted/40 p-3 rounded-xl border border-border/80 flex items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-md bg-background border flex items-center justify-center font-mono text-[11px] font-bold text-primary">
                                #
                            </div>
                            <div>
                                <p className="font-bold text-foreground">{quotation.quotationNumber}</p>
                                <p className="text-[11px] text-muted-foreground">{quotation.clientName || 'Client'}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="font-black font-mono text-sm text-foreground">{symbol}{total}</p>
                            <Badge variant="outline" className="text-[10px] font-semibold uppercase">
                                {quotation.status || 'draft'}
                            </Badge>
                        </div>
                    </div>

                    <form onSubmit={handleSend} className="space-y-3.5 mt-1">
                        {/* Recipient Details */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <Label className="text-xs font-semibold">Recipient Email *</Label>
                                <Input
                                    type="email"
                                    required
                                    value={recipientEmail}
                                    onChange={(e) => setRecipientEmail(e.target.value)}
                                    placeholder="client@company.com"
                                    className="h-8 text-xs"
                                    disabled={isSending}
                                />
                            </div>

                            <div className="space-y-1">
                                <Label className="text-xs font-semibold">Recipient Name</Label>
                                <Input
                                    type="text"
                                    value={recipientName}
                                    onChange={(e) => setRecipientName(e.target.value)}
                                    placeholder="Contact Person / Organization"
                                    className="h-8 text-xs"
                                    disabled={isSending}
                                />
                            </div>
                        </div>

                        {/* Subject */}
                        <div className="space-y-1">
                            <Label className="text-xs font-semibold">Subject Line</Label>
                            <Input
                                type="text"
                                required
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                className="h-8 text-xs font-medium"
                                disabled={isSending}
                            />
                        </div>

                        {/* Custom Message */}
                        <div className="space-y-1">
                            <div className="flex items-center justify-between">
                                <Label className="text-xs font-semibold">Message Body</Label>
                                <span className="text-[10px] text-muted-foreground">Will appear in executive email body</span>
                            </div>
                            <Textarea
                                rows={4}
                                value={customMessage}
                                onChange={(e) => setCustomMessage(e.target.value)}
                                className="text-xs resize-none"
                                placeholder="Write a personalized note to the client..."
                                disabled={isSending}
                            />
                        </div>

                        {/* Attachment Callout */}
                        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 flex items-start gap-3">
                            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                                <Paperclip className="w-3.5 h-3.5" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                                        PDF Attachment Included
                                    </span>
                                    <Badge className="bg-emerald-600 text-white text-[10px] h-4 px-1.5 font-mono">
                                        A4 PDF
                                    </Badge>
                                </div>
                                <p className="text-[11px] text-muted-foreground mt-0.5 font-mono truncate">
                                    📎 {pdfFilename}
                                </p>
                                <p className="text-[11px] text-muted-foreground mt-0.5">
                                    A high-resolution PDF document with full itemization, banking details, and terms will be generated and attached automatically.
                                </p>
                            </div>
                        </div>

                        {/* Live sending feedback status */}
                        {isSending && (
                            <div className="p-2.5 bg-blue-500/10 border border-blue-500/20 rounded-lg flex items-center gap-2.5 text-xs text-blue-600 animate-pulse">
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                <span className="font-semibold">{sendingStep || "Processing..."}</span>
                            </div>
                        )}

                        <DialogFooter className="pt-2 flex items-center justify-between sm:justify-between w-full">
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={onClose}
                                disabled={isSending}
                                className="text-xs h-8"
                            >
                                Cancel
                            </Button>

                            <Button
                                type="submit"
                                size="sm"
                                disabled={isSending || !recipientEmail}
                                className="text-xs h-8 font-semibold bg-blue-600 hover:bg-blue-500 text-white"
                            >
                                {isSending ? (
                                    <>
                                        <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                                        Sending with PDF...
                                    </>
                                ) : (
                                    <>
                                        <Send className="w-3.5 h-3.5 mr-1.5" />
                                        Send Email with Attached PDF
                                    </>
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}
