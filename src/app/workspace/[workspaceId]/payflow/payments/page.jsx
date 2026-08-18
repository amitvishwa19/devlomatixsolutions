'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
    CreditCard,
    IndianRupee,
    CheckCircle2,
    AlertCircle,
    RotateCcw,
    Receipt,
    Search,
    Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { getPaymentTransactions } from '../_actions/payflow-actions';
import { PaymentRefundModal } from '../_components/PaymentRefundModal';
import { PaymentReceiptModal } from '../_components/PaymentReceiptModal';

export default function PayFlowPaymentsPage() {
    const params = useParams();
    const workspaceId = params?.workspaceId;

    const [txns, setTxns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedRefundTxn, setSelectedRefundTxn] = useState(null);
    const [isRefundOpen, setIsRefundOpen] = useState(false);
    const [selectedReceiptTxn, setSelectedReceiptTxn] = useState(null);
    const [isReceiptOpen, setIsReceiptOpen] = useState(false);

    const loadData = async () => {
        setLoading(true);
        const res = await getPaymentTransactions(workspaceId);
        if (res.success) setTxns(res.data);
        setLoading(false);
    };

    useEffect(() => {
        loadData();
    }, [workspaceId]);

    const handleOpenReceipt = (txn) => {
        setSelectedReceiptTxn(txn);
        setIsReceiptOpen(true);
    };

    const handleOpenRefund = (txn) => {
        setSelectedRefundTxn(txn);
        setIsRefundOpen(true);
    };

    const filtered = txns.filter(t =>
        t.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.method.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                            <CreditCard className="w-4 h-4 text-emerald-500" />
                        </div>
                        <h1 className="text-lg font-bold text-foreground">Transactions & Settlement Logs</h1>
                    </div>
                    <p className="text-xs text-muted-foreground">Audit log of all incoming customer payments across Stripe, Razorpay, and manual bank transfers.</p>
                </div>

                <div className="relative w-full sm:w-64">
                    <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-muted-foreground" />
                    <Input
                        placeholder="Search transactions, clients..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="h-8 pl-8 text-xs bg-secondary/30 border-border/80"
                    />
                </div>
            </div>

            <Card className="bg-card border-border/80 shadow-xs overflow-hidden">
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-secondary/20">
                            <TableRow className="border-b border-border/40 hover:bg-transparent">
                                <TableHead className="h-9 text-[10px] font-semibold uppercase tracking-wider px-4 text-muted-foreground">Transaction ID</TableHead>
                                <TableHead className="h-9 text-[10px] font-semibold uppercase tracking-wider px-4 text-muted-foreground">Client</TableHead>
                                <TableHead className="h-9 text-[10px] font-semibold uppercase tracking-wider px-4 text-muted-foreground">Amount</TableHead>
                                <TableHead className="h-9 text-[10px] font-semibold uppercase tracking-wider px-4 text-muted-foreground">Payment Method</TableHead>
                                <TableHead className="h-9 text-[10px] font-semibold uppercase tracking-wider px-4 text-muted-foreground">Status</TableHead>
                                <TableHead className="h-9 text-[10px] font-semibold uppercase tracking-wider px-4 text-muted-foreground">Date / Time</TableHead>
                                <TableHead className="h-9 text-right text-[10px] font-semibold uppercase tracking-wider px-4 text-muted-foreground">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-8 text-xs text-muted-foreground">
                                        <Loader2 className="w-4 h-4 animate-spin mx-auto mb-1 text-primary" /> Loading transactions...
                                    </TableCell>
                                </TableRow>
                            ) : filtered.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-8 text-xs text-muted-foreground">
                                        No transactions found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filtered.map((t) => (
                                    <TableRow
                                        key={t.id}
                                        onClick={() => handleOpenReceipt(t)}
                                        className="border-b border-border/40 hover:bg-secondary/20 last:border-0 cursor-pointer transition-colors"
                                    >
                                        <TableCell className="py-2.5 px-4 font-mono text-xs font-semibold text-foreground">{t.id}</TableCell>
                                        <TableCell className="py-2.5 px-4 font-medium text-xs text-foreground">{t.client}</TableCell>
                                        <TableCell className="py-2.5 px-4 font-bold text-xs text-foreground">{t.amount}</TableCell>
                                        <TableCell className="py-2.5 px-4 text-xs text-muted-foreground font-mono">{t.method}</TableCell>
                                        <TableCell className="py-2.5 px-4">
                                            <Badge
                                                variant="outline"
                                                className={`text-[9px] font-semibold px-2 py-0.5 rounded ${
                                                    t.status === 'Succeeded' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                                                    t.status === 'Refunded' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                                                    'bg-rose-500/10 text-rose-500 border-rose-500/20'
                                                }`}
                                            >
                                                {t.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="py-2.5 px-4 text-xs font-mono text-muted-foreground">{t.date}</TableCell>
                                        <TableCell className="py-2.5 px-4 text-right">
                                            <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleOpenReceipt(t)}
                                                    className="h-7 text-xs text-muted-foreground hover:text-foreground gap-1"
                                                >
                                                    <Receipt className="w-3 h-3" />
                                                    Receipt
                                                </Button>
                                                {t.status === 'Succeeded' && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleOpenRefund(t)}
                                                        className="h-7 text-xs text-rose-500 hover:bg-rose-500/10 gap-1"
                                                    >
                                                        <RotateCcw className="w-3 h-3" />
                                                        Refund
                                                    </Button>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Payment Refund Modal */}
            <PaymentRefundModal
                open={isRefundOpen}
                onOpenChange={setIsRefundOpen}
                workspaceId={workspaceId}
                transaction={selectedRefundTxn}
                onRefundComplete={() => loadData()}
            />

            {/* Payment Receipt Modal */}
            <PaymentReceiptModal
                open={isReceiptOpen}
                onOpenChange={setIsReceiptOpen}
                transaction={selectedReceiptTxn}
            />
        </div>
    );
}
