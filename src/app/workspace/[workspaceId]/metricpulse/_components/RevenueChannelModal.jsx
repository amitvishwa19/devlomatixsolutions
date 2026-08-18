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
    TrendingUp,
    IndianRupee,
    ShoppingBag,
    CreditCard,
    Repeat,
    ArrowUpRight
} from 'lucide-react';
import { toast } from 'sonner';

export function RevenueChannelModal({ open, onOpenChange, channel }) {
    if (!channel) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md bg-card border-border/80 p-0 overflow-hidden flex flex-col">
                <DialogHeader className="p-4 border-b border-border/60 bg-emerald-500/10">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-500">
                            <TrendingUp className="w-4 h-4" />
                        </div>
                        <div>
                            <DialogTitle className="text-sm font-bold text-foreground">
                                Revenue Channel: {channel.name}
                            </DialogTitle>
                            <DialogDescription className="text-xs text-muted-foreground">
                                Detailed stream attribution & settlement stats.
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="p-5 space-y-3.5 text-xs">
                    <div className="p-4 rounded-xl bg-secondary/30 border border-border/40 text-center space-y-1">
                        <span className="text-[10px] uppercase font-semibold text-muted-foreground">Channel Total Volume</span>
                        <div className="text-2xl font-black text-emerald-500">{channel.amount}</div>
                        <Badge variant="outline" className="text-[9px] font-mono mt-1">
                            {channel.pct} of Total Workspace GMV
                        </Badge>
                    </div>

                    <div className="space-y-2 pt-1">
                        <div className="flex justify-between py-1.5 border-b border-border/40 text-muted-foreground">
                            <span>Settled Transactions</span>
                            <span className="font-semibold text-foreground">{channel.orders} orders</span>
                        </div>
                        <div className="flex justify-between py-1.5 border-b border-border/40 text-muted-foreground">
                            <span>Primary Payment Route</span>
                            <span className="font-semibold text-foreground">Razorpay Auto-Collect (INR ₹)</span>
                        </div>
                        <div className="flex justify-between py-1.5 border-b border-border/40 text-muted-foreground">
                            <span>Average Settlement Window</span>
                            <span className="font-semibold text-foreground">T+1 Business Day</span>
                        </div>
                    </div>
                </div>

                <div className="p-3.5 border-t border-border/60 bg-secondary/15 flex justify-end">
                    <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)} className="h-8 text-xs">
                        Close
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
