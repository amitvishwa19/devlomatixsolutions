'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    TrendingUp,
    IndianRupee,
    ShoppingBag,
    CreditCard,
    Repeat,
    ArrowUpRight,
    Download,
    Eye
} from 'lucide-react';
import { toast } from 'sonner';
import { RevenueChannelModal } from '../_components/RevenueChannelModal';

export default function MetricPulseRevenuePage() {
    const params = useParams();
    const workspaceId = params?.workspaceId;
    const [timeframe, setTimeframe] = useState('30d');
    const [selectedChannel, setSelectedChannel] = useState(null);
    const [isChannelOpen, setIsChannelOpen] = useState(false);

    const revenueStreams = [
        { name: 'eCommerce Direct Store Sales', amount: '₹38,40,000.00', pct: '59.1%', orders: 482, color: 'text-amber-500 bg-amber-500/10' },
        { name: 'PayFlow B2B Invoices Collected', amount: '₹14,20,000.00', pct: '21.9%', orders: 12, color: 'text-emerald-500 bg-emerald-500/10' },
        { name: 'Recurring SaaS & Retainer MRR', amount: '₹12,32,000.00', pct: '19.0%', orders: 42, color: 'text-sky-500 bg-sky-500/10' }
    ];

    const handleInspectChannel = (stream) => {
        setSelectedChannel(stream);
        setIsChannelOpen(true);
    };

    return (
        <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                            <TrendingUp className="w-4 h-4 text-emerald-500" />
                        </div>
                        <h1 className="text-lg font-bold text-foreground">Revenue Analytics & Financial Growth (INR ₹)</h1>
                    </div>
                    <p className="text-xs text-muted-foreground">Consolidated revenue streams across eCommerce checkouts, B2B invoices, and recurring SaaS billing.</p>
                </div>

                <div className="flex items-center gap-2">
                    <div className="flex items-center bg-secondary/40 border border-border/60 rounded-lg p-0.5">
                        {['7d', '30d', '90d', 'YTD'].map((t) => (
                            <button
                                key={t}
                                onClick={() => setTimeframe(t)}
                                className={`px-2.5 py-1 text-xs rounded-md font-medium transition-all ${
                                    timeframe === t ? 'bg-card text-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'
                                }`}
                            >
                                {t}
                            </button>
                        ))}
                    </div>
                    <Button variant="outline" size="sm" onClick={() => toast.success("Exporting financial statement...")} className="h-8 text-xs border-border/80 gap-1.5 shadow-xs">
                        <Download className="w-3.5 h-3.5" />
                        Export
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card className="bg-card border-border/80 p-4 space-y-2 shadow-xs">
                    <span className="text-[10px] uppercase font-semibold text-muted-foreground">Gross Revenue ({timeframe})</span>
                    <div className="text-2xl font-black text-foreground">₹64,92,000.00</div>
                    <span className="text-[11px] text-emerald-500 font-medium">+18.4% compared to previous period</span>
                </Card>
                <Card className="bg-card border-border/80 p-4 space-y-2 shadow-xs">
                    <span className="text-[10px] uppercase font-semibold text-muted-foreground">Average Order Value (AOV)</span>
                    <div className="text-2xl font-black text-foreground">₹7,950.00</div>
                    <span className="text-[11px] text-emerald-500 font-medium">+4.2% higher cart value</span>
                </Card>
                <Card className="bg-card border-border/80 p-4 space-y-2 shadow-xs">
                    <span className="text-[10px] uppercase font-semibold text-muted-foreground">Net Profit Margin</span>
                    <div className="text-2xl font-black text-foreground">72.4%</div>
                    <span className="text-[11px] text-muted-foreground">After gateway fees & AI token costs</span>
                </Card>
            </div>

            <Card className="bg-card border-border/80 p-4 space-y-3 shadow-xs">
                <h3 className="font-bold text-xs text-foreground">Revenue Breakdown by Channel</h3>
                <div className="space-y-3">
                    {revenueStreams.map((stream) => (
                        <div
                            key={stream.name}
                            onClick={() => handleInspectChannel(stream)}
                            className="p-3 rounded-lg bg-secondary/30 border border-border/40 space-y-1.5 hover:border-emerald-500/40 cursor-pointer transition-colors"
                        >
                            <div className="flex items-center justify-between">
                                <span className="font-semibold text-xs text-foreground">{stream.name}</span>
                                <span className="font-bold text-xs text-foreground">{stream.amount}</span>
                            </div>
                            <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                                <span>{stream.orders} total transactions</span>
                                <div className="flex items-center gap-1.5">
                                    <Badge variant="outline" className="text-[9px] font-mono">{stream.pct} share</Badge>
                                    <Eye className="w-3 h-3 text-muted-foreground" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </Card>

            {/* Revenue Channel Modal */}
            <RevenueChannelModal
                open={isChannelOpen}
                onOpenChange={setIsChannelOpen}
                channel={selectedChannel}
            />
        </div>
    );
}
