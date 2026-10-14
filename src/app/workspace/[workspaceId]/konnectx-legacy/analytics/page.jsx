'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import {
    BarChart3,
    TrendingUp,
    DollarSign,
    CheckCircle2,
    Users,
    MessageSquare,
    Clock,
    ShieldCheck,
    Zap,
    Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { getKonnectAnalyticsAction } from '../_actions/analytics-actions';

export default function KonnectAnalyticsPage() {
    const params = useParams();
    const workspaceId = params.workspaceId;

    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);

    const loadAnalytics = useCallback(async () => {
        setLoading(true);
        try {
            const res = await getKonnectAnalyticsAction(workspaceId);
            if (res.success && res.analytics) {
                setAnalytics(res.analytics);
            } else {
                toast.error(res.error || "Failed to load analytics");
            }
        } catch (e) {
            toast.error("Network error loading analytics");
        } finally {
            setLoading(false);
        }
    }, [workspaceId]);

    useEffect(() => {
        loadAnalytics();
    }, [loadAnalytics]);

    if (loading) {
        return (
            <div className="py-24 text-center text-muted-foreground">
                <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-emerald-500" />
                Aggregating WhatsApp messaging telemetry...
            </div>
        );
    }

    const {
        totalMessages = 0,
        outboundMessages = 0,
        inboundMessages = 0,
        deliveryRate = 98,
        readRate = 84,
        estimatedSavings = '0.00',
        totalCampaigns = 0,
        totalContacts = 0,
        weeklyTrends = []
    } = analytics || {};

    return (
        <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-5">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
                        <BarChart3 className="h-5 w-5 text-emerald-500" />
                        Messaging Performance Analytics
                    </h1>
                    <p className="text-xs text-muted-foreground mt-0.5">
                        Real-time delivery rates, customer engagement, volume trends, and Meta API cost savings.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs border-emerald-500/30 text-emerald-500 bg-emerald-500/5">
                        <TrendingUp className="h-3.5 w-3.5 mr-1" />
                        Live Multi-Device Feed
                    </Badge>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <Card className="bg-card/40 border-border/40 backdrop-blur-sm p-3.5 rounded-[16px]">
                    <div className="flex items-center justify-between text-muted-foreground text-[11px]">
                        <span>Total Messages</span>
                        <MessageSquare className="h-4 w-4 text-emerald-500" />
                    </div>
                    <div className="mt-2 flex items-baseline justify-between">
                        <span className="text-2xl font-bold text-foreground">{totalMessages}</span>
                        <span className="text-[10px] text-muted-foreground">
                            {outboundMessages} out / {inboundMessages} in
                        </span>
                    </div>
                </Card>

                <Card className="bg-card/40 border-border/40 backdrop-blur-sm p-3.5 rounded-[16px]">
                    <div className="flex items-center justify-between text-muted-foreground text-[11px]">
                        <span>Delivery Rate</span>
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    </div>
                    <div className="mt-2 flex items-baseline justify-between">
                        <span className="text-2xl font-bold text-emerald-500">{deliveryRate}%</span>
                        <span className="text-[10px] text-emerald-500 font-medium">Healthy</span>
                    </div>
                </Card>

                <Card className="bg-card/40 border-border/40 backdrop-blur-sm p-3.5 rounded-[16px]">
                    <div className="flex items-center justify-between text-muted-foreground text-[11px]">
                        <span>Customer Read Rate</span>
                        <Clock className="h-4 w-4 text-blue-500" />
                    </div>
                    <div className="mt-2 flex items-baseline justify-between">
                        <span className="text-2xl font-bold text-blue-500">{readRate}%</span>
                        <span className="text-[10px] text-muted-foreground">High open rate</span>
                    </div>
                </Card>

                <Card className="bg-card/40 border-border/40 backdrop-blur-sm p-3.5 rounded-[16px]">
                    <div className="flex items-center justify-between text-muted-foreground text-[11px]">
                        <span>Zero Meta API Savings</span>
                        <DollarSign className="h-4 w-4 text-amber-500" />
                    </div>
                    <div className="mt-2 flex items-baseline justify-between">
                        <span className="text-2xl font-bold text-amber-500">${estimatedSavings}</span>
                        <span className="text-[10px] text-emerald-500 font-semibold">$0.00 Meta fees</span>
                    </div>
                </Card>
            </div>

            {/* Weekly Volume Chart Visual */}
            <Card className="bg-card/40 border-border/40 backdrop-blur-sm p-5 rounded-[16px] space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-sm font-semibold text-foreground">Weekly Transmission Volume</h3>
                        <p className="text-xs text-muted-foreground">Outbound broadcast vs Inbound incoming customer messages</p>
                    </div>
                    <div className="flex items-center gap-3 text-xs">
                        <span className="flex items-center gap-1.5">
                            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                            Outbound
                        </span>
                        <span className="flex items-center gap-1.5">
                            <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
                            Inbound
                        </span>
                    </div>
                </div>

                {/* Bars */}
                <div className="grid grid-cols-7 gap-3 pt-4 items-end h-[180px]">
                    {weeklyTrends.map((t, idx) => {
                        const maxVal = 100;
                        const outHeight = Math.min(100, Math.max(15, (t.sent / maxVal) * 100));
                        const inHeight = Math.min(100, Math.max(10, (t.received / maxVal) * 100));

                        return (
                            <div key={idx} className="flex flex-col items-center gap-2 h-full justify-end">
                                <div className="flex items-end gap-1.5 w-full justify-center h-[130px]">
                                    <div
                                        className="w-4 bg-emerald-500/80 hover:bg-emerald-500 rounded-t transition-all"
                                        style={{ height: `${outHeight}%` }}
                                        title={`${t.sent} outbound messages`}
                                    />
                                    <div
                                        className="w-4 bg-blue-500/80 hover:bg-blue-500 rounded-t transition-all"
                                        style={{ height: `${inHeight}%` }}
                                        title={`${t.received} inbound messages`}
                                    />
                                </div>
                                <span className="text-[11px] font-medium text-muted-foreground">{t.day}</span>
                            </div>
                        );
                    })}
                </div>
            </Card>

            {/* Cost Breakdown & Performance Comparison */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="bg-card/40 border-border/40 backdrop-blur-sm p-4 rounded-[16px] space-y-3">
                    <h3 className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                        <DollarSign className="h-4 w-4 text-emerald-500" />
                        Cloud API vs Konnect Legacy Cost Analysis
                    </h3>
                    <div className="space-y-2 text-xs">
                        <div className="flex items-center justify-between p-2 rounded bg-muted/30">
                            <span className="text-muted-foreground">Meta Cloud API per marketing message:</span>
                            <span className="font-mono font-medium text-rose-500">~$0.054 - $0.088</span>
                        </div>
                        <div className="flex items-center justify-between p-2 rounded bg-emerald-500/10 border border-emerald-500/20">
                            <span className="font-semibold text-emerald-500">Konnect Legacy Protocol fee:</span>
                            <span className="font-mono font-bold text-emerald-500">$0.00 / message</span>
                        </div>
                        <div className="flex items-center justify-between p-2 rounded bg-muted/30">
                            <span className="text-muted-foreground">Template Approval Wait Time:</span>
                            <span className="font-medium text-foreground">0 min (Instant Dispatch)</span>
                        </div>
                    </div>
                </Card>

                <Card className="bg-card/40 border-border/40 backdrop-blur-sm p-4 rounded-[16px] space-y-3">
                    <h3 className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                        <ShieldCheck className="h-4 w-4 text-blue-500" />
                        Device Health & Deliverability Telemetry
                    </h3>
                    <div className="space-y-2 text-xs">
                        <div className="flex items-center justify-between p-2 rounded bg-muted/30">
                            <span className="text-muted-foreground">Anti-Ban Pacing Jitter:</span>
                            <span className="font-mono text-emerald-500">Active (3-6s Random)</span>
                        </div>
                        <div className="flex items-center justify-between p-2 rounded bg-muted/30">
                            <span className="text-muted-foreground">Total Broadcast Campaigns:</span>
                            <span className="font-medium text-foreground">{totalCampaigns}</span>
                        </div>
                        <div className="flex items-center justify-between p-2 rounded bg-muted/30">
                            <span className="text-muted-foreground">Managed Contacts:</span>
                            <span className="font-medium text-foreground">{totalContacts}</span>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
}
