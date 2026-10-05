'use client';

import React, { useRef } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Receipt,
    Printer,
    Download,
    MessageCircle,
    Building2,
    CheckCircle2,
    Clock,
    QrCode,
    ShieldCheck,
    Send,
    Loader2
} from 'lucide-react';
import { toast } from "sonner";
import { sendQuotationWhatsAppAction } from '../_actions/crm-invoice-actions';

export default function QuotationPreviewModal({ isOpen, onClose, documentData, workspaceId, onWhatsAppSent }) {
    const printRef = useRef(null);
    const [isSendingWA, setIsSendingWA] = React.useState(false);

    if (!documentData) return null;

    const isInvoice = documentData.id?.startsWith('INV');
    const docTitle = isInvoice ? 'TAX INVOICE' : 'FORMAL QUOTATION & ESTIMATE';

    const handlePrint = () => {
        window.print();
    };

    const handleSendWhatsApp = async () => {
        if (!documentData.clientPhone) {
            toast.error("No client phone number available for WhatsApp dispatch.");
            return;
        }

        try {
            setIsSendingWA(true);
            const res = await sendQuotationWhatsAppAction(workspaceId, {
                dealId: documentData.dealId,
                quoteId: documentData.id,
                phone: documentData.clientPhone,
                clientName: documentData.clientName
            });

            if (res.success) {
                toast.success(`Quotation ${documentData.id} dispatched via WhatsApp!`);
                if (onWhatsAppSent) onWhatsAppSent();
                onClose();
            } else {
                toast.error(res.error || "Failed to dispatch WhatsApp");
            }
        } catch (error) {
            console.error("WhatsApp dispatch error:", error);
            toast.error("Error sending quotation");
        } finally {
            setIsSendingWA(false);
        }
    };

    const formattedTotal = typeof documentData.total === 'number'
        ? `₹${documentData.total.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
        : documentData.amount || `₹${(documentData.total || 0).toLocaleString()}`;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl max-h-[92vh] overflow-y-auto rounded-3xl p-6 sm:p-8 bg-card border-border shadow-2xl">
                <DialogHeader className="flex flex-row items-center justify-between pb-3 border-b border-border/70">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-sm">
                            <Receipt className="w-4 h-4" />
                        </div>
                        <div>
                            <DialogTitle className="text-base font-bold text-foreground">
                                {isInvoice ? 'PayFlow Invoice Document' : 'Commercial Quotation Document'}
                            </DialogTitle>
                            <p className="text-xs text-muted-foreground font-mono">
                                Reference: {documentData.id}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Badge className={`text-[10px] font-bold ${
                            documentData.status === 'Paid' || documentData.status === 'APPROVED'
                                ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                                : 'bg-blue-500/10 text-blue-500 border-blue-500/20'
                        }`}>
                            {documentData.status || 'Draft'}
                        </Badge>
                    </div>
                </DialogHeader>

                {/* Printable Document Paper */}
                <div ref={printRef} className="p-6 sm:p-8 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 rounded-2xl border border-border shadow-sm space-y-6 my-2 print:border-none print:shadow-none font-sans">
                    {/* Header: Company & Invoice Info */}
                    <div className="flex flex-col sm:flex-row justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-6">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-lg bg-blue-600 text-white font-black text-xs flex items-center justify-center">
                                    D
                                </div>
                                <h2 className="text-lg font-black tracking-tight text-blue-600 dark:text-blue-400">
                                    DEVLOMATIX SOLUTIONS
                                </h2>
                            </div>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                Enterprise SaaS & WhatsApp Cloud Ecosystem
                            </p>
                            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                                GSTIN: <span className="font-mono font-semibold">27AADCD1234F1Z8</span> | PAN: AADCD1234F
                            </p>
                            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                                billing@devlomatix.com • +91 (022) 4982-1100
                            </p>
                        </div>

                        <div className="sm:text-right space-y-1">
                            <h3 className="text-lg font-black uppercase text-zinc-800 dark:text-zinc-100 tracking-wider">
                                {docTitle}
                            </h3>
                            <div className="text-xs font-mono space-y-0.5 text-zinc-600 dark:text-zinc-400">
                                <div><strong className="text-zinc-800 dark:text-zinc-200">Document No:</strong> {documentData.id}</div>
                                <div><strong className="text-zinc-800 dark:text-zinc-200">Date:</strong> {new Date(documentData.createdAt || Date.now()).toLocaleDateString('en-IN', { dateStyle: 'medium' })}</div>
                                <div><strong className="text-zinc-800 dark:text-zinc-200">Due/Valid Date:</strong> {documentData.dueDate || new Date(documentData.validUntil || Date.now()).toLocaleDateString('en-IN', { dateStyle: 'medium' })}</div>
                            </div>
                        </div>
                    </div>

                    {/* Bill To Info */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800">
                        <div className="space-y-1">
                            <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider block">Billed To / Prepared For:</span>
                            <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{documentData.clientName || documentData.client || 'Client Account'}</h4>
                            {documentData.companyName && (
                                <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">{documentData.companyName}</p>
                            )}
                            <p className="text-xs text-zinc-500">{documentData.clientEmail}</p>
                            {documentData.clientPhone && (
                                <p className="text-xs text-zinc-500">{documentData.clientPhone}</p>
                            )}
                        </div>

                        <div className="space-y-1 sm:text-right">
                            <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider block">Payment Terms & Gateway:</span>
                            <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                                {documentData.gateway || 'PayFlow Razorpay Smart Link & UPI'}
                            </p>
                            <p className="text-xs text-zinc-500">
                                Currency: <span className="font-bold text-zinc-700 dark:text-zinc-300">{documentData.currency || 'INR'} (₹)</span>
                            </p>
                            <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-600 border-emerald-500/30">
                                <ShieldCheck className="w-3 h-3 mr-1" /> 256-bit Encrypted
                            </Badge>
                        </div>
                    </div>

                    {/* Scope of Work / Items Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-xs text-left">
                            <thead className="bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 uppercase text-[10px] tracking-wider border-b border-zinc-200 dark:border-zinc-800 font-bold">
                                <tr>
                                    <th className="py-2.5 px-3">#</th>
                                    <th className="py-2.5 px-3">Description / Deliverable</th>
                                    <th className="py-2.5 px-3 text-center">Qty</th>
                                    <th className="py-2.5 px-3 text-right">Unit Rate (₹)</th>
                                    <th className="py-2.5 px-3 text-right">Amount (₹)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                                {(documentData.items || [
                                    { desc: documentData.dealTitle || 'Professional Software Solutions', qty: 1, rate: documentData.subtotal || 50000 }
                                ]).map((item, idx) => (
                                    <tr key={idx} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30">
                                        <td className="py-2.5 px-3 text-zinc-400 font-mono">{idx + 1}</td>
                                        <td className="py-2.5 px-3 font-semibold text-zinc-800 dark:text-zinc-200">
                                            {item.desc}
                                        </td>
                                        <td className="py-2.5 px-3 text-center font-mono">{item.qty || 1}</td>
                                        <td className="py-2.5 px-3 text-right font-mono">
                                            ₹{(item.rate || 0).toLocaleString('en-IN')}
                                        </td>
                                        <td className="py-2.5 px-3 text-right font-mono font-bold">
                                            ₹{((item.qty || 1) * (item.rate || 0)).toLocaleString('en-IN')}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Calculations Summary */}
                    <div className="flex flex-col sm:flex-row justify-between gap-4 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                        <div className="space-y-2 max-w-sm">
                            <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider block">Bank Remittance & UPI:</span>
                            <div className="p-2.5 rounded-lg bg-zinc-100 dark:bg-zinc-900 text-[11px] font-mono space-y-0.5 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800">
                                <div><strong>Bank:</strong> HDFC Bank Ltd</div>
                                <div><strong>A/C:</strong> 50200088991234 (Current)</div>
                                <div><strong>IFSC:</strong> HDFC0000128</div>
                                <div><strong>UPI VPA:</strong> devlomatix@hdfcbank</div>
                            </div>
                        </div>

                        <div className="w-full sm:w-64 space-y-1.5 text-xs">
                            <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                                <span>Subtotal:</span>
                                <span className="font-mono font-semibold">
                                    ₹{(documentData.subtotal || documentData.total || 0).toLocaleString('en-IN')}
                                </span>
                            </div>
                            <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                                <span>GST (18% Integrated):</span>
                                <span className="font-mono font-semibold">
                                    ₹{(documentData.taxAmount || ((documentData.subtotal || 0) * 0.18)).toLocaleString('en-IN')}
                                </span>
                            </div>
                            {documentData.discount > 0 && (
                                <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                                    <span>Special Discount:</span>
                                    <span className="font-mono font-semibold">-₹{documentData.discount.toLocaleString('en-IN')}</span>
                                </div>
                            )}
                            <div className="flex justify-between text-sm font-black text-blue-600 dark:text-blue-400 pt-2 border-t border-zinc-200 dark:border-zinc-800">
                                <span>Total Payable:</span>
                                <span className="font-mono">{formattedTotal}</span>
                            </div>
                        </div>
                    </div>

                    {/* Notes & Terms Footer */}
                    <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 text-[11px] text-zinc-500 dark:text-zinc-400 space-y-1">
                        <p className="font-semibold text-zinc-700 dark:text-zinc-300">Terms & Conditions:</p>
                        <p>{documentData.notes || 'Payment due as per invoice terms. Late fee of 1.5% applies for delayed remittances. Thank you for your business.'}</p>
                    </div>
                </div>

                {/* Footer Controls */}
                <DialogFooter className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-2">
                    <div className="flex items-center gap-2">
                        {documentData.clientPhone && (
                            <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={handleSendWhatsApp}
                                disabled={isSendingWA}
                                className="h-8 text-xs gap-1.5 text-[#25D366] border-[#25D366]/40 hover:bg-[#25D366]/10 font-semibold"
                            >
                                {isSendingWA ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <MessageCircle className="w-3.5 h-3.5" />}
                                <span>Send via WhatsApp</span>
                            </Button>
                        )}
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handlePrint}
                            className="h-8 text-xs gap-1.5 bg-background"
                        >
                            <Printer className="w-3.5 h-3.5" />
                            <span>Print / PDF</span>
                        </Button>
                    </div>

                    <Button type="button" size="sm" onClick={onClose} className="h-8 text-xs w-full sm:w-auto">
                        Close
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
