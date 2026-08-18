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
import {
    Receipt,
    Download,
    CheckCircle2,
    Send,
    Building2,
    Copy
} from 'lucide-react';
import { toast } from 'sonner';

export function PaymentReceiptModal({ open, onOpenChange, transaction }) {
    if (!transaction) return null;

    const handleDownload = () => {
        toast.success(`Receipt PDF downloaded for ${transaction.id}`);
    };

    const handleSend = () => {
        toast.success(`Receipt emailed to ${transaction.client}`);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md bg-card border-border/80 p-0 overflow-hidden flex flex-col">
                <DialogHeader className="p-4 border-b border-border/60 bg-emerald-500/10">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-500">
                            <Receipt className="w-4 h-4" />
                        </div>
                        <div>
                            <DialogTitle className="text-sm font-bold text-foreground">
                                Payment Receipt: {transaction.id}
                            </DialogTitle>
                            <DialogDescription className="text-xs text-muted-foreground">
                                Verified electronic receipt with gateway authorization proof.
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="p-6 space-y-4 text-xs">
                    {/* Status Badge */}
                    <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-secondary/30 border border-border/40 text-center space-y-1">
                        <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
                            <CheckCircle2 className="w-5 h-5" />
                        </div>
                        <span className="font-bold text-base text-foreground mt-1">{transaction.amount}</span>
                        <Badge variant="outline" className="text-[9px] bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
                            {transaction.status}
                        </Badge>
                    </div>

                    {/* Receipt Details */}
                    <div className="space-y-2 pt-1">
                        <div className="flex justify-between py-1.5 border-b border-border/40 text-muted-foreground">
                            <span>Transaction ID</span>
                            <span className="font-mono text-foreground font-semibold">{transaction.id}</span>
                        </div>
                        <div className="flex justify-between py-1.5 border-b border-border/40 text-muted-foreground">
                            <span>Billed Client</span>
                            <span className="text-foreground font-semibold">{transaction.client}</span>
                        </div>
                        <div className="flex justify-between py-1.5 border-b border-border/40 text-muted-foreground">
                            <span>Payment Method</span>
                            <span className="font-mono text-foreground">{transaction.method}</span>
                        </div>
                        <div className="flex justify-between py-1.5 border-b border-border/40 text-muted-foreground">
                            <span>Timestamp</span>
                            <span className="font-mono text-foreground">{transaction.date}</span>
                        </div>
                    </div>
                </div>

                <div className="p-3.5 border-t border-border/60 bg-secondary/15 flex items-center justify-between gap-2 shrink-0">
                    <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)} className="h-8 text-xs">
                        Close
                    </Button>
                    <div className="flex items-center gap-1.5">
                        <Button variant="outline" size="sm" onClick={handleSend} className="h-8 text-xs border-border/80 gap-1">
                            <Send className="w-3 h-3" /> Email Receipt
                        </Button>
                        <Button size="sm" onClick={handleDownload} className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white gap-1 shadow-xs">
                            <Download className="w-3.5 h-3.5" /> Download PDF
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
