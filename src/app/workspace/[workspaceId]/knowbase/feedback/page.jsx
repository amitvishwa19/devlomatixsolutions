'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    ThumbsUp,
    ThumbsDown,
    MessageSquare,
    CheckCircle2,
    Star,
    Bot
} from 'lucide-react';

export default function KnowBaseFeedbackPage() {
    const params = useParams();
    const workspaceId = params?.workspaceId;

    const stats = [
        { label: 'Helpfulness Score', value: '94.8%', sub: '840 Positive / 46 Negative', icon: ThumbsUp, color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' },
        { label: 'Ticket Deflection Rate', value: '38.2%', sub: 'Avoided customer tickets', icon: Bot, color: 'text-purple-500 bg-purple-500/10 border-purple-500/20' },
        { label: 'User Feedback Comments', value: '62', sub: 'Actionable suggestions', icon: MessageSquare, color: 'text-sky-500 bg-sky-500/10 border-sky-500/20' }
    ];

    const feedbackItems = [
        { article: 'How to connect your Meta WhatsApp Cloud API credentials', user: 'Alex (CTO)', rating: 'Helpful', comment: 'Clear screenshots! Got WhatsApp configured in under 5 minutes.', time: 'Yesterday' },
        { article: 'Configuring custom domains and SSL certificates', user: 'Dev Team', rating: 'Helpful', comment: 'CNAME propagation details were super helpful.', time: '3 days ago' },
        { article: 'Internal Team Onboarding and Access Control Guidelines', user: 'HR Lead', rating: 'Helpful', comment: 'Well structured role-permission breakdown.', time: '1 week ago' }
    ];

    return (
        <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20">
                            <ThumbsUp className="w-4 h-4 text-blue-500" />
                        </div>
                        <h1 className="text-lg font-bold text-foreground">Article CSAT & Feedback Analytics</h1>
                    </div>
                    <p className="text-xs text-muted-foreground">Monitor reader satisfaction, helpfulness ratings, and qualitative user feedback.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {stats.map((s) => (
                    <Card key={s.label} className="bg-card border-border/80 p-4 space-y-2 shadow-xs">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] uppercase font-semibold text-muted-foreground">{s.label}</span>
                            <div className={`p-1.5 rounded-md ${s.color}`}>
                                <s.icon className="w-3.5 h-3.5" />
                            </div>
                        </div>
                        <div className="text-2xl font-bold text-foreground">{s.value}</div>
                        <span className="text-[11px] text-muted-foreground">{s.sub}</span>
                    </Card>
                ))}
            </div>

            <Card className="bg-card border-border/80 p-4 space-y-3 shadow-xs">
                <h3 className="font-bold text-xs text-foreground">Recent Reader Comments</h3>
                <div className="space-y-2.5">
                    {feedbackItems.map((f, i) => (
                        <div key={i} className="p-3 rounded-lg bg-secondary/30 border border-border/40 space-y-1 text-xs">
                            <div className="flex items-center justify-between">
                                <span className="font-semibold text-foreground">{f.article}</span>
                                <Badge variant="outline" className="text-[9px] text-emerald-500 bg-emerald-500/10 border-emerald-500/20 font-bold">{f.rating}</Badge>
                            </div>
                            <p className="text-muted-foreground italic">"{f.comment}"</p>
                            <span className="text-[10px] text-muted-foreground block pt-0.5">{f.user} • {f.time}</span>
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    );
}
