'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
    Activity,
    ShoppingBag,
    MessageCircle,
    Users,
    Bot,
    IndianRupee,
    RefreshCw,
    Search,
    Eye,
    Loader2
} from 'lucide-react';
import { getActivityStream } from '../_actions/metricpulse-actions';
import { ActivityDetailModal } from '../_components/ActivityDetailModal';

export default function MetricPulseActivityPage() {
    const params = useParams();
    const workspaceId = params?.workspaceId;

    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedActivity, setSelectedActivity] = useState(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [moduleFilter, setModuleFilter] = useState('All');

    const loadData = async () => {
        setLoading(true);
        const res = await getActivityStream(workspaceId);
        if (res.success) setActivities(res.data);
        setLoading(false);
    };

    useEffect(() => {
        loadData();
    }, [workspaceId]);

    const handleInspect = (act) => {
        setSelectedActivity(act);
        setIsDetailOpen(true);
    };

    const getIcon = (module) => {
        switch (module) {
            case 'eCommerce': return <ShoppingBag className="w-3.5 h-3.5 text-amber-500" />;
            case 'KonnectX': return <MessageCircle className="w-3.5 h-3.5 text-emerald-500" />;
            case 'HireFlow': return <Users className="w-3.5 h-3.5 text-sky-500" />;
            case 'FlowGenix': return <Bot className="w-3.5 h-3.5 text-purple-500" />;
            default: return <IndianRupee className="w-3.5 h-3.5 text-emerald-500" />;
        }
    };

    const filtered = activities.filter(a => {
        const matchesQuery = a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            a.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
            a.module.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesModule = moduleFilter === 'All' || a.module === moduleFilter;
        return matchesQuery && matchesModule;
    });

    return (
        <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-purple-500/10 border border-purple-500/20">
                            <Activity className="w-4 h-4 text-purple-500" />
                        </div>
                        <h1 className="text-lg font-bold text-foreground">Real-Time Workspace Activity Stream</h1>
                    </div>
                    <p className="text-xs text-muted-foreground">Unified audit log of all system events, customer purchases, WhatsApp campaigns, and AI actions.</p>
                </div>

                <Button variant="outline" size="sm" onClick={loadData} className="h-8 text-xs border-border/80 gap-1.5 shadow-xs">
                    <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                    Refresh Feed
                </Button>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-1.5 flex-wrap">
                    {['All', 'eCommerce', 'KonnectX', 'HireFlow', 'FlowGenix', 'PayFlow'].map((mod) => (
                        <Button
                            key={mod}
                            variant={moduleFilter === mod ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setModuleFilter(mod)}
                            className={`h-7 text-xs ${
                                moduleFilter === mod
                                    ? 'bg-purple-600 text-white hover:bg-purple-700'
                                    : 'border-border/80'
                            }`}
                        >
                            {mod}
                        </Button>
                    ))}
                </div>

                <div className="relative w-full sm:w-64">
                    <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-muted-foreground" />
                    <Input
                        placeholder="Search event logs..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="h-8 pl-8 text-xs bg-secondary/30 border-border/80"
                    />
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center p-12 text-xs text-muted-foreground gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-primary" /> Loading live stream...
                </div>
            ) : filtered.length === 0 ? (
                <div className="py-12 text-center text-xs text-muted-foreground">
                    No activity logs match your filter
                </div>
            ) : (
                <div className="space-y-2.5">
                    {filtered.map((act) => (
                        <Card
                            key={act.id}
                            onClick={() => handleInspect(act)}
                            className="bg-card border-border/80 p-3.5 shadow-xs hover:border-purple-500/40 cursor-pointer transition-all"
                        >
                            <div className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-secondary/50 border border-border/60">
                                        {getIcon(act.module)}
                                    </div>
                                    <div className="space-y-0.5">
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold text-xs text-foreground">{act.title}</span>
                                            <Badge variant="outline" className="text-[9px] font-mono">{act.module}</Badge>
                                        </div>
                                        <p className="text-xs text-muted-foreground">{act.desc}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 shrink-0">
                                    <span className="text-[10px] text-muted-foreground font-mono">{act.time}</span>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleInspect(act);
                                        }}
                                        className="h-7 w-7 text-muted-foreground hover:text-foreground"
                                    >
                                        <Eye className="w-3.5 h-3.5" />
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            {/* Activity Detail Modal */}
            <ActivityDetailModal
                open={isDetailOpen}
                onOpenChange={setIsDetailOpen}
                activity={selectedActivity}
            />
        </div>
    );
}
