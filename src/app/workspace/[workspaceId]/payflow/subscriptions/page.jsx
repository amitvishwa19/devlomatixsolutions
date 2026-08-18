'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
    Repeat,
    Plus,
    Calendar,
    IndianRupee,
    CheckCircle2,
    PauseCircle,
    PlayCircle,
    Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { getSubscriptions, toggleSubscriptionStatus } from '../_actions/payflow-actions';
import { CreateSubscriptionModal } from '../_components/CreateSubscriptionModal';

export default function PayFlowSubscriptionsPage() {
    const params = useParams();
    const workspaceId = params?.workspaceId;

    const [subs, setSubs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isCreateOpen, setIsCreateOpen] = useState(false);

    const loadData = async () => {
        setLoading(true);
        const res = await getSubscriptions(workspaceId);
        if (res.success) setSubs(res.data);
        setLoading(false);
    };

    useEffect(() => {
        loadData();
    }, [workspaceId]);

    const handleToggle = async (id) => {
        const res = await toggleSubscriptionStatus(workspaceId, id);
        if (res.success) {
            toast.success(`Subscription status updated to: ${res.data.status}`);
            loadData();
        }
    };

    return (
        <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-sky-500/10 border border-sky-500/20">
                            <Repeat className="w-4 h-4 text-sky-500" />
                        </div>
                        <h1 className="text-lg font-bold text-foreground">Recurring Subscriptions & MRR</h1>
                    </div>
                    <p className="text-xs text-muted-foreground">Manage ongoing SaaS tiers, recurring retainer agreements, and automated billing cycles.</p>
                </div>

                <Button
                    size="sm"
                    onClick={() => setIsCreateOpen(true)}
                    className="h-8 text-xs bg-sky-600 hover:bg-sky-700 text-white gap-1.5 shadow-xs"
                >
                    <Plus className="w-3.5 h-3.5" />
                    New Subscription
                </Button>
            </div>

            <Card className="bg-card border-border/80 shadow-xs overflow-hidden">
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-secondary/20">
                            <TableRow className="border-b border-border/40 hover:bg-transparent">
                                <TableHead className="h-9 text-[10px] font-semibold uppercase tracking-wider px-4 text-muted-foreground">Subscription ID</TableHead>
                                <TableHead className="h-9 text-[10px] font-semibold uppercase tracking-wider px-4 text-muted-foreground">Client</TableHead>
                                <TableHead className="h-9 text-[10px] font-semibold uppercase tracking-wider px-4 text-muted-foreground">Plan / Tier</TableHead>
                                <TableHead className="h-9 text-[10px] font-semibold uppercase tracking-wider px-4 text-muted-foreground">Recurring Rate</TableHead>
                                <TableHead className="h-9 text-[10px] font-semibold uppercase tracking-wider px-4 text-muted-foreground">Next Renewal</TableHead>
                                <TableHead className="h-9 text-[10px] font-semibold uppercase tracking-wider px-4 text-muted-foreground">Status</TableHead>
                                <TableHead className="h-9 text-right text-[10px] font-semibold uppercase tracking-wider px-4 text-muted-foreground">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-8 text-xs text-muted-foreground">
                                        <Loader2 className="w-4 h-4 animate-spin mx-auto mb-1 text-primary" /> Loading subscriptions...
                                    </TableCell>
                                </TableRow>
                            ) : subs.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-8 text-xs text-muted-foreground">
                                        No recurring subscriptions found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                subs.map((s) => (
                                    <TableRow key={s.id} className="border-b border-border/40 hover:bg-secondary/20 last:border-0">
                                        <TableCell className="py-2.5 px-4 font-mono text-xs font-semibold text-foreground">{s.id}</TableCell>
                                        <TableCell className="py-2.5 px-4 font-medium text-xs text-foreground">{s.client}</TableCell>
                                        <TableCell className="py-2.5 px-4 text-xs text-muted-foreground">{s.plan}</TableCell>
                                        <TableCell className="py-2.5 px-4 font-bold text-xs text-foreground">{s.amount}</TableCell>
                                        <TableCell className="py-2.5 px-4 text-xs font-mono text-muted-foreground">{s.nextBilling}</TableCell>
                                        <TableCell className="py-2.5 px-4">
                                            <Badge
                                                variant="outline"
                                                className={`text-[9px] font-semibold px-2 py-0.5 rounded ${
                                                    s.status === 'Active' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20'
                                                }`}
                                            >
                                                {s.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="py-2.5 px-4 text-right">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleToggle(s.id)}
                                                className="h-7 text-xs text-muted-foreground hover:text-foreground gap-1"
                                            >
                                                {s.status === 'Active' ? (
                                                    <>
                                                        <PauseCircle className="w-3.5 h-3.5 text-amber-500" />
                                                        <span>Pause</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <PlayCircle className="w-3.5 h-3.5 text-emerald-500" />
                                                        <span>Resume</span>
                                                    </>
                                                )}
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Create Subscription Modal */}
            <CreateSubscriptionModal
                open={isCreateOpen}
                onOpenChange={setIsCreateOpen}
                workspaceId={workspaceId}
                onSubscriptionCreated={() => loadData()}
            />
        </div>
    );
}
