'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { motion } from 'framer-motion';
import {
    CreditCard,
    Receipt,
    Repeat,
    IndianRupee,
    Plus,
    Search,
    Download,
    Send,
    CheckCircle2,
    Clock,
    AlertCircle,
    TrendingUp,
    ArrowUpRight,
    Building2,
    Calendar,
    Loader2,
    Eye
} from 'lucide-react';
import { toast } from 'sonner';
import { getInvoices, markInvoiceStatus } from './_actions/payflow-actions';
import { CreateInvoiceModal } from './_components/CreateInvoiceModal';
import { InvoicePreviewModal } from './_components/InvoicePreviewModal';

export default function PayFlowDashboard() {
    const params = useParams();
    const workspaceId = params?.workspaceId;

    const [searchQuery, setSearchQuery] = useState('');
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);

    const loadData = async () => {
        setLoading(true);
        const res = await getInvoices(workspaceId);
        if (res.success) {
            setInvoices(res.data);
        }
        setLoading(false);
    };

    useEffect(() => {
        loadData();
    }, [workspaceId]);

    const stats = [
        { label: 'Total Billed (MTD)', value: '₹48,25,000.00', change: '+14.2% vs last month', icon: IndianRupee, color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' },
        { label: 'Outstanding Invoices', value: `₹${(invoices.filter(i => i.status !== 'Paid').length * 150000).toLocaleString('en-IN')}.00`, change: `${invoices.filter(i => i.status !== 'Paid').length} pending payments`, icon: Clock, color: 'text-amber-500 bg-amber-500/10 border-amber-500/20' },
        { label: 'Active MRR', value: '₹12,80,000.00', change: '42 subscribers', icon: Repeat, color: 'text-sky-500 bg-sky-500/10 border-sky-500/20' },
        { label: 'Payment Success Rate', value: '99.1%', change: 'Razorpay UPI & Cards', icon: CreditCard, color: 'text-purple-500 bg-purple-500/10 border-purple-500/20' }
    ];

    const handleSendReminder = (inv) => {
        toast.success(`Payment link reminder dispatched to ${inv.clientEmail} & WhatsApp!`);
    };

    const handleInspect = (inv) => {
        setSelectedInvoice(inv);
        setIsPreviewOpen(true);
    };

    const filtered = invoices.filter(i =>
        i.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
        i.id.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
            {/* Header Banner */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-emerald-500/10 via-primary/5 to-transparent p-5 rounded-2xl border border-border/80">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                            <CreditCard className="w-5 h-5 text-emerald-500" />
                        </div>
                        <h1 className="text-xl font-bold tracking-tight text-foreground">PayFlow Invoicing & Payments</h1>
                        <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/30 text-[10px] font-mono">
                            PAYMENTS & MRR
                        </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground max-w-xl">
                        Generate professional invoices, track recurring subscriptions, and collect payments with automated WhatsApp & Email reminders.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Link href={`/workspace/${workspaceId}/payflow/subscriptions`}>
                        <Button variant="outline" size="sm" className="h-8 text-xs border-border/80 gap-1.5 shadow-xs">
                            <Repeat className="w-3.5 h-3.5" />
                            Subscriptions
                        </Button>
                    </Link>
                    <Button
                        size="sm"
                        onClick={() => setIsCreateOpen(true)}
                        className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 shadow-xs"
                    >
                        <Plus className="w-3.5 h-3.5" />
                        Create Invoice
                    </Button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                {stats.map((stat, i) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                    >
                        <Card className="bg-card border-border/80 shadow-xs hover:border-border transition-colors">
                            <CardHeader className="py-0 px-3 border-b border-border/40 space-y-0">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{stat.label}</span>
                                    <div className={`w-7 h-7 rounded-md flex items-center justify-center border shrink-0 ${stat.color}`}>
                                        <stat.icon className="w-3.5 h-3.5" />
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-3 pt-2">
                                <div className="text-xl font-bold text-foreground">{stat.value}</div>
                                <span className="text-[10px] text-muted-foreground">{stat.change}</span>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* Invoices Table */}
            <Card className="bg-card border-border/80 shadow-xs overflow-hidden">
                <CardHeader className="py-0 px-3 border-b border-border/40 space-y-0 bg-secondary/15">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 py-2">
                        <div className="flex items-center gap-2">
                            <Receipt className="w-4 h-4 text-emerald-500" />
                            <CardTitle className="text-xs font-bold text-foreground">Recent Invoices & Transactions</CardTitle>
                        </div>
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                            <div className="relative flex-1 sm:w-64">
                                <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-muted-foreground" />
                                <Input
                                    placeholder="Search invoices, clients..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="h-8 pl-8 text-xs bg-secondary/40 border-border/80"
                                />
                            </div>
                            <Link href={`/workspace/${workspaceId}/payflow/invoices`}>
                                <Button variant="outline" size="sm" className="h-8 px-2.5 border-border/80 text-xs gap-1">
                                    <span>All Invoices</span>
                                    <ArrowUpRight className="w-3.5 h-3.5" />
                                </Button>
                            </Link>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-secondary/20">
                            <TableRow className="border-b border-border/40 hover:bg-transparent">
                                <TableHead className="h-9 text-[10px] font-semibold uppercase tracking-wider px-4 text-muted-foreground">Invoice ID</TableHead>
                                <TableHead className="h-9 text-[10px] font-semibold uppercase tracking-wider px-4 text-muted-foreground">Client</TableHead>
                                <TableHead className="h-9 text-[10px] font-semibold uppercase tracking-wider px-4 text-muted-foreground">Amount</TableHead>
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
                                        No invoices found
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
                                            <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
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
                                                    onClick={() => handleSendReminder(inv)}
                                                    className="h-7 w-7 text-emerald-500 hover:bg-emerald-500/10"
                                                >
                                                    <Send className="w-3.5 h-3.5" />
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
                    await markInvoiceStatus(workspaceId, id, status);
                    loadData();
                }}
            />
        </div>
    );
}
