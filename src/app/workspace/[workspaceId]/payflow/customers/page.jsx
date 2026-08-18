'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
    Users,
    IndianRupee,
    Plus,
    Receipt,
    Search,
    Send,
    Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { getCustomers } from '../_actions/payflow-actions';
import { AddCustomerModal } from '../_components/AddCustomerModal';

export default function PayFlowCustomersPage() {
    const params = useParams();
    const workspaceId = params?.workspaceId;

    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isCreateOpen, setIsCreateOpen] = useState(false);

    const loadData = async () => {
        setLoading(true);
        const res = await getCustomers(workspaceId);
        if (res.success) setCustomers(res.data);
        setLoading(false);
    };

    useEffect(() => {
        loadData();
    }, [workspaceId]);

    const handleSendStatement = (c) => {
        toast.success(`Consolidated account statement dispatched to ${c.email}!`);
    };

    const filtered = customers.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                            <Users className="w-4 h-4 text-emerald-500" />
                        </div>
                        <h1 className="text-lg font-bold text-foreground">Billing Customers & Accounts</h1>
                    </div>
                    <p className="text-xs text-muted-foreground">Directory of billing entities, lifetime spend, and active invoice counts.</p>
                </div>

                <Button
                    size="sm"
                    onClick={() => setIsCreateOpen(true)}
                    className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 shadow-xs"
                >
                    <Plus className="w-3.5 h-3.5" />
                    Add Customer
                </Button>
            </div>

            <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-muted-foreground" />
                <Input
                    placeholder="Search accounts..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-8 pl-8 text-xs bg-secondary/30 border-border/80"
                />
            </div>

            <Card className="bg-card border-border/80 shadow-xs overflow-hidden">
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-secondary/20">
                            <TableRow className="border-b border-border/40 hover:bg-transparent">
                                <TableHead className="h-9 text-[10px] font-semibold uppercase tracking-wider px-4 text-muted-foreground">Customer Name</TableHead>
                                <TableHead className="h-9 text-[10px] font-semibold uppercase tracking-wider px-4 text-muted-foreground">Billing Email</TableHead>
                                <TableHead className="h-9 text-[10px] font-semibold uppercase tracking-wider px-4 text-muted-foreground">Lifetime Revenue</TableHead>
                                <TableHead className="h-9 text-[10px] font-semibold uppercase tracking-wider px-4 text-muted-foreground">Total Invoices</TableHead>
                                <TableHead className="h-9 text-[10px] font-semibold uppercase tracking-wider px-4 text-muted-foreground">Status</TableHead>
                                <TableHead className="h-9 text-right text-[10px] font-semibold uppercase tracking-wider px-4 text-muted-foreground">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8 text-xs text-muted-foreground">
                                        <Loader2 className="w-4 h-4 animate-spin mx-auto mb-1 text-primary" /> Loading customers...
                                    </TableCell>
                                </TableRow>
                            ) : filtered.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8 text-xs text-muted-foreground">
                                        No billing customers found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filtered.map((c) => (
                                    <TableRow key={c.id} className="border-b border-border/40 hover:bg-secondary/20 last:border-0">
                                        <TableCell className="py-2.5 px-4 font-semibold text-xs text-foreground">{c.name}</TableCell>
                                        <TableCell className="py-2.5 px-4 text-xs font-mono text-muted-foreground">{c.email}</TableCell>
                                        <TableCell className="py-2.5 px-4 font-bold text-xs text-emerald-500">{c.totalSpent}</TableCell>
                                        <TableCell className="py-2.5 px-4 text-xs text-foreground">{c.invoicesCount} Invoices</TableCell>
                                        <TableCell className="py-2.5 px-4">
                                            <Badge
                                                variant="outline"
                                                className={`text-[9px] font-semibold px-2 py-0.5 rounded ${
                                                    c.status === 'Active Client' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                                                }`}
                                            >
                                                {c.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="py-2.5 px-4 text-right">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleSendStatement(c)}
                                                className="h-7 text-xs text-emerald-500 hover:bg-emerald-500/10 gap-1"
                                            >
                                                <Send className="w-3 h-3" />
                                                Statement
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Add Customer Modal */}
            <AddCustomerModal
                open={isCreateOpen}
                onOpenChange={setIsCreateOpen}
                workspaceId={workspaceId}
                onCustomerAdded={() => loadData()}
            />
        </div>
    );
}
