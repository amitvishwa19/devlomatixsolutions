'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    BarChart3,
    TrendingUp,
    Eye,
    Inbox,
    Clock,
    CheckCircle2
} from 'lucide-react';

export default function FormCraftAnalyticsPage() {
    const params = useParams();
    const workspaceId = params?.workspaceId;

    const stats = [
        { label: 'Total Form Views', value: '14,200', change: '+18% vs last month', icon: Eye, color: 'text-purple-500 bg-purple-500/10 border-purple-500/20' },
        { label: 'Completed Submissions', value: '3,840', change: '78.4% completion rate', icon: Inbox, color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' },
        { label: 'Avg Time to Complete', value: '1m 42s', change: 'Fast completion', icon: Clock, color: 'text-sky-500 bg-sky-500/10 border-sky-500/20' },
        { label: 'Drop-off Rate', value: '21.6%', change: '-4.2% drop-off', icon: TrendingUp, color: 'text-amber-500 bg-amber-500/10 border-amber-500/20' }
    ];

    const formRankings = [
        { name: 'Enterprise AI Consultation Request', views: '4,200', submissions: '1,410', rate: '33.6%', status: 'High Intent' },
        { name: 'Candidate Pre-Screening Survey', views: '1,100', submissions: '890', rate: '80.9%', status: 'Top Performer' },
        { name: 'Post-Purchase Customer CSAT', views: '2,400', submissions: '1,640', rate: '68.3%', status: 'Steady' }
    ];

    return (
        <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
                            <BarChart3 className="w-4 h-4 text-amber-500" />
                        </div>
                        <h1 className="text-lg font-bold text-foreground">Form Performance & Conversion Funnel</h1>
                    </div>
                    <p className="text-xs text-muted-foreground">Deep dive into user interaction metrics, drop-off rates, and submission conversion percentages.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                {stats.map((stat) => (
                    <Card key={stat.label} className="bg-card border-border/80 p-3.5 space-y-2 shadow-xs">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{stat.label}</span>
                            <div className={`w-7 h-7 rounded-md flex items-center justify-center border shrink-0 ${stat.color}`}>
                                <stat.icon className="w-3.5 h-3.5" />
                            </div>
                        </div>
                        <div className="text-xl font-bold text-foreground">{stat.value}</div>
                        <span className="text-[10px] text-muted-foreground">{stat.change}</span>
                    </Card>
                ))}
            </div>

            <Card className="bg-card border-border/80 p-4 space-y-3 shadow-xs">
                <h3 className="font-bold text-xs text-foreground">Top Converting Forms</h3>
                <div className="space-y-2">
                    {formRankings.map((f) => (
                        <div key={f.name} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-lg bg-secondary/30 border border-border/40 text-xs">
                            <div className="space-y-0.5">
                                <span className="font-semibold text-foreground">{f.name}</span>
                                <div className="text-[10px] text-muted-foreground">
                                    {f.views} Views • {f.submissions} Submissions
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="font-bold text-emerald-500">{f.rate} Conversion</span>
                                <Badge variant="outline" className="text-[9px] font-mono">{f.status}</Badge>
                            </div>
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    );
}
