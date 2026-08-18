'use client';

import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    RotateCcw,
    AlertTriangle,
    IndianRupee,
    Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { refundTransaction } from '../_actions/payflow-actions';

export function PaymentRefundModal({ open, onOpenChange, workspaceId, transaction, onRefundComplete }) {
    if (!transaction) return null;

    const [refunding, setRefunding] = useState(false);
    const [reason, setReason] = useState('Customer Request');

    const handleRefund = async (e) => {
        e.preventDefault();
        setRefunding(true);

        const res = await refundTransaction(workspaceId, transaction.id, reason);
        if (res.success) {
            toast.success(`Refund of ${transaction.amount} processed for ${transaction.id}`);
            onOpenChange(false);
            if (onRefundComplete) onRefundComplete(res.data);
        } else {
            toast.error(res.error || "Failed to process refund");
        }
        setRefunding(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md bg-card border-border/80 p-0 overflow-hidden flex flex-col">
                <DialogHeader className="p-4 border-b border-border/60 bg-rose-500/10">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-500">
                            <RotateCcw className="w-4 h-4" />
                        </div>
                        <div>
                            <DialogTitle className="text-sm font-bold text-foreground">
                                Refund Transaction: {transaction.id}
                            </DialogTitle>
                            <DialogDescription className="text-xs text-muted-foreground">
                                Process full or partial reimbursement through the original payment gateway.
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <form onSubmit={handleRefund} className="p-5 space-y-3.5 text-xs">
                    <div className="p-3 rounded-lg bg-secondary/30 border border-border/40 space-y-1">
                        <div className="flex justify-between text-muted-foreground">
                            <span>Client:</span>
                            <span className="font-semibold text-foreground">{transaction.client}</span>
                        </div>
                        <div className="flex justify-between text-muted-foreground">
                            <span>Payment Method:</span>
                            <span className="font-mono text-foreground">{transaction.method}</span>
                        </div>
                        <div className="flex justify-between text-foreground font-bold pt-1 border-t border-border/40">
                            <span>Total Refundable Amount:</span>
                            <span className="text-rose-500">{transaction.amount}</span>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <Label className="text-xs font-semibold">Refund Reason</Label>
                        <Select value={reason} onValueChange={setReason}>
                            <SelectTrigger className="h-8 text-xs bg-secondary/30 border-border/80">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Customer Request">Customer Satisfaction / Request</SelectItem>
                                <SelectItem value="Duplicate Charge">Accidental Duplicate Charge</SelectItem>
                                <SelectItem value="Service Cancellation">Service Plan Cancellation</SelectItem>
                                <SelectItem value="Fraudulent Transaction">Fraud Prevention</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex items-center gap-2 p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[11px]">
                        <AlertTriangle className="w-4 h-4 shrink-0" />
                        <span>Funds will return to the customer card / bank account in 3-5 business days.</span>
                    </div>

                    <div className="flex justify-end gap-2 pt-2 border-t border-border/40">
                        <Button type="button" variant="ghost" size="sm" onClick={() => onOpenChange(false)} className="h-8 text-xs">
                            Cancel
                        </Button>
                        <Button type="submit" size="sm" disabled={refunding} className="h-8 text-xs bg-rose-600 hover:bg-rose-700 text-white shadow-xs">
                            {refunding ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Confirm Full Refund'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
