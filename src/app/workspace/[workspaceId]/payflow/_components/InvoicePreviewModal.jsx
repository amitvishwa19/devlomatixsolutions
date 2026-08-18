'use client';

import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
    FileText,
    Download,
    Printer,
    Send,
    CheckCircle2,
    Clock,
    AlertCircle,
    Building2,
    Mail,
    Share2,
    Copy,
    IndianRupee
} from 'lucide-react';
import { toast } from 'sonner';

export function InvoicePreviewModal({ open, onOpenChange, invoice, onStatusChange }) {
    if (!invoice) return null;

    const handlePrint = () => {
        toast.info("Preparing invoice for print...");
        window.print();
    };

    const handleDownload = () => {
        toast.success(`Downloaded official PDF for ${invoice.id}`);
    };

    const handleSendReminder = () => {
        toast.success(`Payment link reminder dispatched to ${invoice.clientEmail} & WhatsApp!`);
    };

    const handleCopyLink = () => {
        navigator.clipboard.writeText(`https://pay.devlomatix.com/invoice/${invoice.id}`);
        toast.success("Payment link copied to clipboard!");
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-2xl bg-card border-border/80 p-0 overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header Action Bar */}
                <div className="p-3 px-5 border-b border-border/60 bg-secondary/15 flex items-center justify-between gap-2 shrink-0">
                    <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-foreground">{invoice.id}</span>
                        <Badge
                            variant="outline"
                            className={`text-[9px] font-semibold px-2 py-0.5 rounded ${
                                invoice.status === 'Paid' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                                invoice.status === 'Pending' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                                'bg-rose-500/10 text-rose-500 border-rose-500/20'
                            }`}
                        >
                            {invoice.status}
                        </Badge>
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap">
                        <Button variant="outline" size="sm" onClick={handleCopyLink} className="h-7 text-xs border-border/80 gap-1">
                            <Copy className="w-3 h-3" /> Copy Link
                        </Button>
                        <Button variant="outline" size="sm" onClick={handleSendReminder} className="h-7 text-xs border-border/80 text-emerald-500 gap-1">
                            <Send className="w-3 h-3" /> Send Reminder
                        </Button>
                        <Button variant="outline" size="sm" onClick={handleDownload} className="h-7 text-xs border-border/80 gap-1">
                            <Download className="w-3 h-3" /> PDF
                        </Button>
                    </div>
                </div>

                {/* Printable Invoice Body */}
                <div className="p-6 md:p-8 space-y-6 overflow-y-auto flex-1 text-xs bg-card">
                    {/* Header Branding */}
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-border/40 pb-5">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-md bg-emerald-600 flex items-center justify-center text-white font-bold text-xs">
                                    D
                                </div>
                                <span className="font-bold text-sm text-foreground">Devlomatix Solutions Private Limited</span>
                            </div>
                            <p className="text-[11px] text-muted-foreground">Suite 400, Innovation Tower, Cyber City, Bangalore - 560100</p>
                            <p className="text-[11px] text-muted-foreground">GSTIN: 29AABCB1234F1Z0 | PAN: AABCB1234F</p>
                        </div>

                        <div className="text-left sm:text-right space-y-1">
                            <h2 className="text-base font-bold uppercase tracking-wider text-foreground">GST TAX INVOICE</h2>
                            <p className="font-mono text-xs font-semibold text-foreground">{invoice.id}</p>
                            <div className="text-[11px] text-muted-foreground space-y-0.5">
                                <div>Issued: <span className="text-foreground font-medium">{invoice.date || 'Aug 16, 2026'}</span></div>
                                <div>Due Date: <span className="text-foreground font-medium">{invoice.dueDate || 'In 14 Days'}</span></div>
                            </div>
                        </div>
                    </div>

                    {/* Billed To */}
                    <div className="p-3.5 rounded-lg bg-secondary/30 border border-border/40 space-y-1">
                        <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Billed To</span>
                        <div className="font-bold text-xs text-foreground">{invoice.client}</div>
                        <div className="text-muted-foreground font-mono text-[11px]">{invoice.clientEmail}</div>
                        <div className="text-muted-foreground text-[10px]">Payment Settlement: {invoice.gateway} (INR ₹)</div>
                    </div>

                    {/* Line Items Table */}
                    <div className="border border-border/40 rounded-lg overflow-hidden">
                        <Table>
                            <TableHeader className="bg-secondary/20">
                                <TableRow className="border-b border-border/40">
                                    <TableHead className="h-8 text-[10px] uppercase font-semibold text-muted-foreground">Description</TableHead>
                                    <TableHead className="h-8 text-[10px] uppercase font-semibold text-center text-muted-foreground w-16">Qty</TableHead>
                                    <TableHead className="h-8 text-[10px] uppercase font-semibold text-right text-muted-foreground w-32">Amount (₹)</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {invoice.items && invoice.items.length > 0 ? (
                                    invoice.items.map((it, idx) => (
                                        <TableRow key={idx} className="border-b border-border/40 last:border-0">
                                            <TableCell className="py-2.5 px-4 font-medium text-xs text-foreground">{it.desc}</TableCell>
                                            <TableCell className="py-2.5 px-4 text-center text-xs font-mono">{it.qty}</TableCell>
                                            <TableCell className="py-2.5 px-4 text-right text-xs font-mono font-semibold text-foreground">
                                                ₹{(Number(it.qty || 1) * Number(it.rate || 0)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow className="border-b border-border/40 last:border-0">
                                        <TableCell className="py-2.5 px-4 font-medium text-xs text-foreground">Professional SaaS Service Retainer</TableCell>
                                        <TableCell className="py-2.5 px-4 text-center text-xs font-mono">1</TableCell>
                                        <TableCell className="py-2.5 px-4 text-right text-xs font-mono font-semibold text-foreground">{invoice.amount}</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Totals Breakdown */}
                    <div className="flex justify-end">
                        <div className="w-64 space-y-1.5 text-xs">
                            <div className="flex justify-between text-muted-foreground">
                                <span>Subtotal</span>
                                <span className="font-mono text-foreground font-semibold">{invoice.amount}</span>
                            </div>
                            <div className="flex justify-between text-muted-foreground">
                                <span>GST (Included)</span>
                                <span className="font-mono text-foreground">{invoice.taxRate ? `${invoice.taxRate}%` : '18%'}</span>
                            </div>
                            <div className="flex justify-between text-sm font-bold text-foreground pt-1.5 border-t border-border/60">
                                <span>Total Payable</span>
                                <span className="text-emerald-500 font-mono">{invoice.amount}</span>
                            </div>
                        </div>
                    </div>

                    {/* Notes & Terms */}
                    <div className="p-3 rounded-lg bg-secondary/20 border border-border/40 space-y-1 text-[11px] text-muted-foreground">
                        <span className="font-semibold text-foreground">Payment Terms & Instructions:</span>
                        <p>{invoice.notes || 'Please remit payment via UPI, NetBanking, or Razorpay Smart Link within 14 days.'}</p>
                    </div>
                </div>

                {/* Footer Controls */}
                <div className="p-3.5 border-t border-border/60 bg-secondary/15 flex items-center justify-between gap-2 shrink-0">
                    <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)} className="h-8 text-xs">
                        Close Preview
                    </Button>
                    <div className="flex items-center gap-2">
                        {invoice.status !== 'Paid' && (
                            <Button
                                size="sm"
                                onClick={() => {
                                    if (onStatusChange) onStatusChange(invoice.id, 'Paid');
                                    toast.success(`Invoice ${invoice.id} marked as Paid!`);
                                    onOpenChange(false);
                                }}
                                className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white gap-1"
                            >
                                <CheckCircle2 className="w-3.5 h-3.5" /> Mark as Paid
                            </Button>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
