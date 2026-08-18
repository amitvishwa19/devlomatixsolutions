'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';
import {
    Ticket,
    MessagesSquare,
    Users,
    Clock,
    CheckCircle2,
    AlertCircle,
    Plus,
    Search,
    MessageSquare,
    Mail,
    Globe,
    Bot,
    Sparkles,
    UserCheck,
    Filter,
    ArrowUpRight,
    Flame,
    Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { getTickets } from './_actions/deskflow-actions';
import { CreateTicketModal } from './_components/CreateTicketModal';
import { AiCopilotRulesModal } from './_components/AiCopilotRulesModal';

export default function DeskFlowDashboard() {
    const params = useParams();
    const router = useRouter();
    const workspaceId = params?.workspaceId;

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTab, setSelectedTab] = useState('all');
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isAiRulesOpen, setIsAiRulesOpen] = useState(false);
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadTickets = async () => {
        setLoading(true);
        const res = await getTickets(workspaceId);
        if (res.success) {
            setTickets(res.data);
        }
        setLoading(false);
    };

    useEffect(() => {
        loadTickets();
    }, [workspaceId]);

    const stats = [
        { label: 'Open Tickets', value: tickets.filter(t => t.status !== 'Resolved').length || '28', change: '8 high priority', icon: Ticket, color: 'text-amber-500 bg-amber-500/10 border-amber-500/20' },
        { label: 'Avg First Response', value: '4m 12s', change: '92% within SLA', icon: Clock, color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' },
        { label: 'Resolved Today', value: tickets.filter(t => t.status === 'Resolved').length || '64', change: '+18% vs yesterday', icon: CheckCircle2, color: 'text-sky-500 bg-sky-500/10 border-sky-500/20' },
        { label: 'Active Support Agents', value: '7', change: '3 online now', icon: Users, color: 'text-purple-500 bg-purple-500/10 border-purple-500/20' }
    ];

    const getChannelIcon = (channel) => {
        switch (channel) {
            case 'WhatsApp': return <MessageSquare className="w-3.5 h-3.5 text-emerald-500" />;
            case 'Email': return <Mail className="w-3.5 h-3.5 text-blue-500" />;
            default: return <Globe className="w-3.5 h-3.5 text-indigo-500" />;
        }
    };

    const handleAssign = (ticket) => {
        toast.success(`Assigned ticket ${ticket.id} to Sarah Jenkins (Senior Lead)`);
    };

    const filteredTickets = tickets.filter(t => {
        const matchesQuery = t.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.id.toLowerCase().includes(searchQuery.toLowerCase());

        let matchesTab = true;
        if (selectedTab === 'unassigned') matchesTab = t.assignedTo === 'Unassigned';
        if (selectedTab === 'urgent') matchesTab = t.priority === 'Urgent' || t.priority === 'High';
        if (selectedTab === 'resolved') matchesTab = t.status === 'Resolved';

        return matchesQuery && matchesTab;
    });

    return (
        <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
            {/* Header Banner */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-sky-500/10 via-primary/5 to-transparent p-5 rounded-2xl border border-border/80">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <div className="p-2 rounded-xl bg-sky-500/10 border border-sky-500/20">
                            <MessagesSquare className="w-5 h-5 text-sky-500" />
                        </div>
                        <h1 className="text-xl font-bold tracking-tight text-foreground">DeskFlow Omnichannel Helpdesk</h1>
                        <Badge variant="outline" className="bg-sky-500/10 text-sky-500 border-sky-500/30 text-[10px] font-mono">
                            SHARED INBOX
                        </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground max-w-xl">
                        Manage customer support across WhatsApp (KonnectX), Email, and Webchat with AI-assisted resolution.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsAiRulesOpen(true)}
                        className="h-8 text-xs border-indigo-500/30 text-indigo-500 hover:bg-indigo-500/10 gap-1.5 shadow-xs"
                    >
                        <Bot className="w-3.5 h-3.5 text-indigo-500" />
                        AI Copilot Rules
                    </Button>
                    <Button
                        size="sm"
                        onClick={() => setIsCreateOpen(true)}
                        className="h-8 text-xs bg-sky-600 hover:bg-sky-700 text-white gap-1.5 shadow-xs"
                    >
                        <Plus className="w-3.5 h-3.5" />
                        New Ticket
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

            {/* Ticket Table Tabs */}
            <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <TabsList className="bg-secondary/40 border border-border/60 p-0.5 h-8">
                        <TabsTrigger value="all" className="text-xs h-7">All Tickets ({tickets.length})</TabsTrigger>
                        <TabsTrigger value="unassigned" className="text-xs h-7">Unassigned ({tickets.filter(t => t.assignedTo === 'Unassigned').length})</TabsTrigger>
                        <TabsTrigger value="urgent" className="text-xs h-7">Urgent SLA ({tickets.filter(t => t.priority === 'Urgent' || t.priority === 'High').length})</TabsTrigger>
                        <TabsTrigger value="resolved" className="text-xs h-7">Resolved</TabsTrigger>
                    </TabsList>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <div className="relative flex-1 sm:w-64">
                            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-muted-foreground" />
                            <Input
                                placeholder="Search by customer, subject..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="h-8 pl-8 text-xs bg-secondary/30 border-border/80"
                            />
                        </div>
                        <Link href={`/workspace/${workspaceId}/deskflow/tickets`}>
                            <Button variant="outline" size="sm" className="h-8 px-2.5 border-border/80 text-xs gap-1">
                                <span>View All</span>
                                <ArrowUpRight className="w-3.5 h-3.5" />
                            </Button>
                        </Link>
                    </div>
                </div>

                <TabsContent value={selectedTab} className="space-y-3 mt-0">
                    {loading ? (
                        <div className="flex items-center justify-center p-12 text-xs text-muted-foreground gap-2">
                            <Loader2 className="w-4 h-4 animate-spin text-primary" /> Loading support tickets...
                        </div>
                    ) : filteredTickets.length === 0 ? (
                        <div className="p-12 text-center border border-dashed rounded-xl border-border/60">
                            <Ticket className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-50" />
                            <p className="text-xs font-semibold text-foreground">No tickets in this view</p>
                            <p className="text-[11px] text-muted-foreground mt-0.5">Click "New Ticket" to log an incoming customer request.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-2.5">
                            {filteredTickets.map((t) => (
                                <Card key={t.id} className="bg-card border-border/80 hover:border-sky-500/40 transition-all shadow-xs">
                                    <CardContent className="p-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3">
                                        <div className="space-y-1.5 flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="font-mono text-xs font-bold text-foreground">{t.id}</span>
                                                <Badge
                                                    variant="outline"
                                                    className={`text-[9px] font-semibold px-2 py-0 rounded ${
                                                        t.priority === 'Urgent' ? 'bg-rose-500/10 text-rose-500 border-rose-500/30' :
                                                        t.priority === 'High' ? 'bg-amber-500/10 text-amber-500 border-amber-500/30' :
                                                        'bg-secondary text-muted-foreground border-border/60'
                                                    }`}
                                                >
                                                    {t.priority}
                                                </Badge>
                                                <span className="flex items-center gap-1 text-[11px] font-medium text-foreground">
                                                    {getChannelIcon(t.channel)}
                                                    {t.channel}
                                                </span>
                                                <span className="text-xs text-muted-foreground">•</span>
                                                <span className="text-xs font-medium text-foreground">{t.customer}</span>
                                                {t.email && (
                                                    <span className="text-[10px] text-muted-foreground font-mono">({t.email})</span>
                                                )}
                                            </div>
                                            <h3 className="font-semibold text-sm text-foreground line-clamp-1">{t.subject}</h3>
                                            <div className="flex items-center gap-4 text-[11px] text-muted-foreground flex-wrap">
                                                <span>Assignee: <span className="font-medium text-foreground">{t.assignedTo || 'Unassigned'}</span></span>
                                                <span>•</span>
                                                <span className="flex items-center gap-1">
                                                    <Clock className="w-3 h-3 text-sky-500" />
                                                    SLA: <span className="font-mono text-foreground">{t.sla || 'Standard SLA'}</span>
                                                </span>
                                                <span>•</span>
                                                <span>Activity: {t.lastReply || 'Just now'}</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 shrink-0">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleAssign(t)}
                                                className="h-8 text-xs border-border/80"
                                            >
                                                Assign
                                            </Button>
                                            <Link href={`/workspace/${workspaceId}/deskflow/chat`}>
                                                <Button size="sm" className="h-8 text-xs bg-secondary hover:bg-secondary/80 text-foreground border border-border/60">
                                                    Open Thread
                                                </Button>
                                            </Link>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </TabsContent>
            </Tabs>

            {/* Create Ticket Modal */}
            <CreateTicketModal
                open={isCreateOpen}
                onOpenChange={setIsCreateOpen}
                workspaceId={workspaceId}
                onTicketCreated={() => loadTickets()}
            />

            {/* AI Copilot Rules Modal */}
            <AiCopilotRulesModal
                open={isAiRulesOpen}
                onOpenChange={setIsAiRulesOpen}
            />
        </div>
    );
}
