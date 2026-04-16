'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Activity,
    ShieldCheck,
    ShieldAlert,
    Cpu,
    Bot,
    MoreVertical,
    Cpu as CpuIcon
} from 'lucide-react';

export const OverviewContent = ({ missions, stats, approvals, config, models }) => {
    return (
        <div className="space-y-4 mt-0">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                    { label: 'Active Missions', value: missions.filter(m => m.status !== 'Done').length, icon: Activity, color: 'text-blue-500', bg: 'bg-blue-500/10' },
                    { label: 'Agent Health', value: `${stats.successRate}%`, icon: ShieldCheck, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
                    { label: 'Pending Approvals', value: approvals.length, icon: ShieldAlert, color: 'text-rose-500', bg: 'bg-rose-500/10' },
                    { label: 'Total Compute', value: stats.tokens.toLocaleString(), icon: Cpu, color: 'text-fuchsia-500', bg: 'bg-fuchsia-500/10' }
                ].map((stat, i) => (
                    <Card key={i} className="border-border/40 bg-card/40 backdrop-blur-md rounded-md overflow-hidden shadow-sm">
                        <CardContent className="p-5 flex items-center justify-between">
                            <div>
                                <p className="text-xs text-muted-foreground mb-1">{stat.label}</p>
                                <p className="text-xl font-bold">{stat.value}</p>
                            </div>
                            <div className={`p-3 rounded-md ${stat.bg}`}>
                                <stat.icon className={`w-5 h-5 ${stat.color}`} />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2 border-border/40 bg-card/40 backdrop-blur-md rounded-md overflow-hidden shadow-md shadow-indigo-500/5 min-h-[400px]">
                    <CardHeader className="pb-4 border-b border-border/10">
                        <CardTitle className="text-lg font-bold">Active Agent Nodes</CardTitle>
                        <CardDescription className="text-xs">Direct control over registered OpenClaw specialized instances.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        {config?.agents?.map((agent) => (
                            <div key={agent.id} className="p-6 flex items-center justify-between hover:bg-indigo-500/5 transition-colors group border-b border-border/5">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-md bg-indigo-500/10 border border-indigo-500/10 flex items-center justify-center">
                                        <Bot className="w-6 h-6 text-indigo-600" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-xs">{agent.name}</h4>
                                        <div className="flex items-center gap-2 mt-1">
                                            <Badge variant="secondary" className="text-xs px-1.5 h-4 opacity-70">{agent.role}</Badge>
                                            <span className="text-xs text-muted-foreground font-bold  opacity-70">Online</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button size="sm" variant="ghost" className="text-xs font-bold text-indigo-600">Talk</Button>
                                    <Button size="icon" variant="ghost" className="h-8 w-8"><MoreVertical className="w-4 h-4 opacity-30" /></Button>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
                <Card className="border-border/40 bg-card/40 backdrop-blur-md rounded-md overflow-hidden shadow-lg">
                    <CardHeader>
                        <CardTitle className="text-sm font-bold flex items-center gap-2">
                            <CpuIcon className="w-4 h-4 text-fuchsia-500" />
                            Default Runtime
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {models.filter(m => m.isDefault).map(m => (
                            <div key={m.id} className="p-4 bg-fuchsia-500/5 border border-fuchsia-500/10 rounded-md">
                                <p className="text-xs text-fuchsia-600 mb-1">{m.provider}</p>
                                <p className="text-xs font-bold">{m.name}</p>
                                <div className="mt-4 flex items-center justify-between">
                                    <span className="text-xs font-bold text-muted-foreground">Status</span>
                                    <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-xs h-5">Ready</Badge>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};
