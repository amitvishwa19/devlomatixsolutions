'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
    Receipt,
    Plus,
    Search,
    Download,
    Send,
    CheckCircle2,
    Clock,
    IndianRupee,
    Loader2,
    Eye,
    Trash2
} from 'lucide-react';
import { toast } from 'sonner';
import { getInvoices, markInvoiceStatus, deleteInvoice } from '../_actions/payflow-actions';
import { CreateInvoiceModal } from '../_components/CreateInvoiceModal';
import { InvoicePreviewModal } from '../_components/InvoicePreviewModal';

export default function PayFlowInvoicesPage() {
    const params = useParams();
    const workspaceId = params?.workspaceId;

    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [statusFilter, setStatusFilter] = useState('All');

    const loadData = async () => {
        setLoading(true);
        const res = await getInvoices(workspaceId);
        if (res.success) setInvoices(res.data);
        setLoading(false);
    };

    useEffect(() => {
        loadData();
    }, [workspaceId]);

    const handleInspect = (inv) => {
        setSelectedInvoice(inv);
        setIsPreviewOpen(true);
    };

    const handleDelete = async (id) => {
        const res = await deleteInvoice(workspaceId, id);
        if (res.success) {
            toast.success("Invoice removed");
            loadData();
        }
    };

    const handleStatus = async (id, status) => {
        const res = await markInvoiceStatus(workspaceId, id, status);
        if (res.success) {
            toast.success(`Invoice marked as ${status}`);
            loadData();
        }
    };

    const filtered = invoices.filter(i => {
        const matchesQuery = i.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
            i.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (i.clientEmail && i.clientEmail.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesStatus = statusFilter === 'All' || i.status === statusFilter;
        return matchesQuery && matchesStatus;
    });

    return (
        <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                            <Receipt className="w-4 h-4 text-emerald-500" />
                        </div>
                        <h1 className="text-lg font-bold text-foreground">Invoices & Billing Statements</h1>
                    </div>
                    <p className="text-xs text-muted-foreground">Create, dispatch, and track digital invoices with Stripe/Razorpay automated settlement.</p>
                </div>

                <Button
                    size="sm"
                    onClick={() => setIsCreateOpen(true)}
                    className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 shadow-xs"
                >
                    <Plus className="w-3.5 h-3.5" />
                    Create Invoice
                </Button>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-1.5 flex-wrap">
                    {['All', 'Paid', 'Pending', 'Overdue'].map((st) => (
                        <Button
                            key={st}
                            variant={statusFilter === st ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setStatusFilter(st)}
                            className={`h-7 text-xs ${
                                statusFilter === st
                                    ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                                    : 'border-border/80'
                            }`}
                        >
                            {st}
                        </Button>
                    ))}
                </div>

                <div className="relative w-full sm:w-64">
                    <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-muted-foreground" />
                    <Input
                        placeholder="Search invoices, clients..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="h-8 pl-8 text-xs bg-secondary/30 border-border/80"
                    />
                </div>
            </div>

            {/* Invoices Ledger Table */}
            <Card className="bg-card border-border/80 shadow-xs overflow-hidden">
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-secondary/20">
                            <TableRow className="border-b border-border/40 hover:bg-transparent">
                                <TableHead className="h-9 text-[10px] font-semibold uppercase tracking-wider px-4 text-muted-foreground">Invoice ID</TableHead>
                                <TableHead className="h-9 text-[10px] font-semibold uppercase tracking-wider px-4 text-muted-foreground">Client / Account</TableHead>
                                <TableHead className="h-9 text-[10px] font-semibold uppercase tracking-wider px-4 text-muted-foreground">Total Due</TableHead>
                                <TableHead className="h-9 text-[10px] font-semibold uppercase tracking-wider px-4 text-muted-foreground">Due Date</TableHead>
                                <TableHead className="h-9 text-[10px] font-semibold uppercase tracking-wider px-4 text-muted-foreground">Status</TableHead>
                                <TableHead className="h-9 text-right text-[10px] font-semibold uppercase tracking-wider px-4 text-muted-foreground">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8 text-xs text-muted-foreground">
                                        <Loader2 className="w-4 h-4 animate-spin mx-auto mb-1 text-primary" /> Loading invoices...
                                    </TableCell>
                                </TableRow>
                            ) : filtered.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8 text-xs text-muted-foreground">
                                        No invoices found in this view
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filtered.map((inv) => (
                                    <TableRow
                                        key={inv.id}
                                        onClick={() => handleInspect(inv)}
                                        className="border-b border-border/40 hover:bg-secondary/20 last:border-0 cursor-pointer transition-colors"
                                    >
                                        <TableCell className="py-2.5 px-4 font-mono text-xs font-semibold text-foreground">{inv.id}</TableCell>
                                        <TableCell className="py-2.5 px-4">
                                            <div className="font-medium text-xs text-foreground">{inv.client}</div>
                                            <div className="text-[10px] text-muted-foreground font-mono">{inv.clientEmail}</div>
                                        </TableCell>
                                        <TableCell className="py-2.5 px-4 font-bold text-xs text-foreground">{inv.amount}</TableCell>
                                        <TableCell className="py-2.5 px-4 text-xs text-muted-foreground font-mono">{inv.dueDate}</TableCell>
                                        <TableCell className="py-2.5 px-4">
                                            <Badge
                                                variant="outline"
                                                className={`text-[9px] font-semibold px-2 py-0.5 rounded ${
                                                    inv.status === 'Paid' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                                                    inv.status === 'Pending' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                                                    'bg-rose-500/10 text-rose-500 border-rose-500/20'
                                                }`}
                                            >
                                                {inv.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="py-2.5 px-4 text-right">
                                            <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-7 text-xs text-emerald-500 hover:bg-emerald-500/10 gap-1"
                                                    onClick={() => toast.success(`Payment link dispatched to ${inv.clientEmail} & WhatsApp!`)}
                                                >
                                                    <Send className="w-3 h-3" />
                                                    Send Link
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleInspect(inv)}
                                                    className="h-7 w-7 text-muted-foreground hover:text-foreground"
                                                >
                                                    <Eye className="w-3.5 h-3.5" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleDelete(inv.id)}
                                                    className="h-7 w-7 text-rose-500 hover:bg-rose-500/10"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Create Invoice Modal */}
            <CreateInvoiceModal
                open={isCreateOpen}
                onOpenChange={setIsCreateOpen}
                workspaceId={workspaceId}
                onInvoiceCreated={() => loadData()}
            />

            {/* Invoice Preview Modal */}
            <InvoicePreviewModal
                open={isPreviewOpen}
                onOpenChange={setIsPreviewOpen}
                invoice={selectedInvoice}
                onStatusChange={async (id, status) => {
                    await handleStatus(id, status);
                }}
            />
        </div>
    );
}
