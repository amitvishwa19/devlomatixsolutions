'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import {
    Activity,
    TrendingUp,
    IndianRupee,
    Users,
    MessageCircle,
    Bot,
    ShoppingBag,
    FileText,
    Download,
    Calendar,
    ArrowUpRight,
    Sparkles,
    CheckCircle2,
    PieChart,
    BarChart3,
    RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';
import { GenerateReportModal } from './_components/GenerateReportModal';

export default function MetricPulseDashboard() {
    const params = useParams();
    const workspaceId = params?.workspaceId;
    const [timeframe, setTimeframe] = useState('30d');
    const [isGenerateOpen, setIsGenerateOpen] = useState(false);

    const kpis = [
        { label: 'Total Revenue (MTD)', value: '₹64,92,000', change: '+18.4% vs last month', icon: IndianRupee, color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' },
        { label: 'Active Contacts / Users', value: '8,420', change: '+340 new this week', icon: Users, color: 'text-sky-500 bg-sky-500/10 border-sky-500/20' },
        { label: 'WhatsApp Broadcasts Sent', value: '42,800', change: '96.2% delivered', icon: MessageCircle, color: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20' },
        { label: 'FlowGenix AI Tokens', value: '1.84M', change: 'Avg ₹0.15 / query', icon: Bot, color: 'text-purple-500 bg-purple-500/10 border-purple-500/20' }
    ];

    const moduleSummaries = [
        {
            title: 'eCommerce Storefront',
            metric: '₹38,40,000',
            subtext: '482 orders placed this month',
            trend: '+12.5%',
            icon: ShoppingBag,
            color: 'text-amber-500 bg-amber-500/10',
            link: `/workspace/${workspaceId}/metricpulse/revenue`
        },
        {
            title: 'KonnectX WhatsApp Engagement',
            metric: '18,200 chats',
            subtext: '62% automated bot resolution',
            trend: '+24.1%',
            icon: MessageCircle,
            color: 'text-emerald-500 bg-emerald-500/10',
            link: `/workspace/${workspaceId}/metricpulse/activity`
        },
        {
            title: 'HireFlow Talent Pipeline',
            metric: '24 Hired',
            subtext: '14.2 days average time-to-hire',
            trend: '-3 days',
            icon: Users,
            color: 'text-sky-500 bg-sky-500/10',
            link: `/workspace/${workspaceId}/metricpulse/activity`
        },
        {
            title: 'DeskFlow Customer Support',
            metric: '98.2% CSAT',
            subtext: '3m 45s avg ticket resolution',
            trend: '+4.8%',
            icon: Activity,
            color: 'text-purple-500 bg-purple-500/10',
            link: `/workspace/${workspaceId}/metricpulse/reports`
        }
    ];

    return (
        <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
            {/* Header Banner */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-purple-500/10 via-primary/5 to-transparent p-5 rounded-2xl border border-border/80">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20">
                            <Activity className="w-5 h-5 text-purple-500" />
                        </div>
                        <h1 className="text-xl font-bold tracking-tight text-foreground">MetricPulse Unified Intelligence</h1>
                        <Badge variant="outline" className="bg-purple-500/10 text-purple-500 border-purple-500/30 text-[10px] font-mono">
                            EXECUTIVE BI
                        </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground max-w-xl">
                        Real-time cross-module metrics, revenue tracking, customer engagement scores, and AI resource consumption.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex items-center bg-secondary/40 border border-border/60 rounded-lg p-0.5">
                        {['7d', '30d', '90d', '1y'].map((t) => (
                            <button
                                key={t}
                                onClick={() => setTimeframe(t)}
                                className={`px-2.5 py-1 text-xs rounded-md font-medium transition-all ${
                                    timeframe === t ? 'bg-card text-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'
                                }`}
                            >
                                {t.toUpperCase()}
                            </button>
                        ))}
                    </div>
                    <Button
                        size="sm"
                        onClick={() => setIsGenerateOpen(true)}
                        className="h-8 text-xs bg-purple-600 hover:bg-purple-700 text-white gap-1.5 shadow-xs"
                    >
                        <FileText className="w-3.5 h-3.5" />
                        Generate Report
                    </Button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                {kpis.map((kpi, i) => (
                    <motion.div
                        key={kpi.label}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                    >
                        <Card className="bg-card border-border/80 shadow-xs hover:border-border transition-colors">
                            <CardHeader className="py-0 px-3 border-b border-border/40 space-y-0">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{kpi.label}</span>
                                    <div className={`w-7 h-7 rounded-md flex items-center justify-center border shrink-0 ${kpi.color}`}>
                                        <kpi.icon className="w-3.5 h-3.5" />
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-3 pt-2">
                                <div className="text-xl font-bold text-foreground">{kpi.value}</div>
                                <span className="text-[10px] text-muted-foreground">{kpi.change}</span>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* Cross Module Breakdown */}
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <h2 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                        <BarChart3 className="w-4 h-4 text-purple-500" />
                        Cross-Module Health & Performance
                    </h2>
                    <Link href={`/workspace/${workspaceId}/metricpulse/reports`}>
                        <Button variant="ghost" size="sm" className="h-7 text-xs text-purple-500 hover:bg-purple-500/10 gap-1">
                            <span>All Reports</span>
                            <ArrowUpRight className="w-3.5 h-3.5" />
                        </Button>
                    </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                    {moduleSummaries.map((mod) => (
                        <Link key={mod.title} href={mod.link}>
                            <Card className="bg-card border-border/80 p-4 space-y-2.5 shadow-xs hover:border-purple-500/40 transition-all cursor-pointer h-full flex flex-col justify-between">
                                <div>
                                    <div className="flex items-center justify-between">
                                        <div className={`p-2 rounded-lg ${mod.color}`}>
                                            <mod.icon className="w-4 h-4" />
                                        </div>
                                        <Badge variant="outline" className="text-[10px] text-emerald-500 bg-emerald-500/10 border-emerald-500/20 font-bold">
                                            {mod.trend}
                                        </Badge>
                                    </div>
                                    <div className="mt-2.5">
                                        <h3 className="font-semibold text-xs text-foreground">{mod.title}</h3>
                                        <div className="text-lg font-bold text-foreground mt-0.5">{mod.metric}</div>
                                        <p className="text-[10px] text-muted-foreground">{mod.subtext}</p>
                                    </div>
                                </div>
                            </Card>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Generate Report Modal */}
            <GenerateReportModal
                open={isGenerateOpen}
                onOpenChange={setIsGenerateOpen}
                workspaceId={workspaceId}
            />
        </div>
    );
}
