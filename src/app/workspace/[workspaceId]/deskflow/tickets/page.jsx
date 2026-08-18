'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    Ticket,
    Plus,
    Search,
    Clock,
    CheckCircle2,
    MessageSquare,
    Mail,
    Globe,
    Filter,
    Loader2,
    User
} from 'lucide-react';
import { toast } from 'sonner';
import { getTickets, createTicket, updateTicketStatus } from '../_actions/deskflow-actions';

export default function DeskFlowTicketsPage() {
    const params = useParams();
    const workspaceId = params?.workspaceId;

    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [creating, setCreating] = useState(false);

    const [newTicket, setNewTicket] = useState({
        subject: '',
        customer: '',
        email: '',
        channel: 'WhatsApp',
        priority: 'Medium',
        message: ''
    });

    const loadData = async () => {
        setLoading(true);
        const res = await getTickets(workspaceId);
        if (res.success) {
            setTickets(res.data);
        }
        setLoading(false);
    };

    useEffect(() => {
        loadData();
    }, [workspaceId]);

    const handleCreate = async (e) => {
        e.preventDefault();
        if (!newTicket.subject.trim()) return toast.error("Please enter a ticket subject");
        if (!newTicket.customer.trim()) return toast.error("Please enter customer name");

        setCreating(true);
        const res = await createTicket(workspaceId, newTicket);
        if (res.success) {
            toast.success("Support ticket created!");
            setIsCreateOpen(false);
            setNewTicket({ subject: '', customer: '', email: '', channel: 'WhatsApp', priority: 'Medium', message: '' });
            loadData();
        } else {
            toast.error(res.error || "Failed to create ticket");
        }
        setCreating(false);
    };

    const handleStatusChange = async (id, status) => {
        const res = await updateTicketStatus(workspaceId, id, status);
        if (res.success) {
            toast.success(`Ticket marked as ${status}`);
            loadData();
        }
    };

    const filtered = tickets.filter(t => {
        const matchesQuery = t.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.id.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = filterStatus === 'All' || t.status === filterStatus;
        return matchesQuery && matchesStatus;
    });

    return (
        <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-sky-500/10 border border-sky-500/20">
                            <Ticket className="w-4 h-4 text-sky-500" />
                        </div>
                        <h1 className="text-lg font-bold text-foreground">Support Ticket Queue</h1>
                    </div>
                    <p className="text-xs text-muted-foreground">Manage and resolve customer tickets across all integrated communication channels.</p>
                </div>

                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                        <Button size="sm" className="h-8 text-xs bg-sky-600 hover:bg-sky-700 text-white gap-1.5 shadow-xs">
                            <Plus className="w-3.5 h-3.5" />
                            Create Ticket
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md bg-card border-border/80">
                        <DialogHeader>
                            <DialogTitle className="text-sm font-bold">New Support Ticket</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleCreate} className="space-y-3 pt-2">
                            <div className="space-y-1">
                                <Label className="text-xs">Customer Name</Label>
                                <Input
                                    placeholder="e.g. Alex Rivera"
                                    value={newTicket.customer}
                                    onChange={(e) => setNewTicket({ ...newTicket, customer: e.target.value })}
                                    className="h-8 text-xs bg-secondary/30 border-border/80"
                                />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs">Customer Email / Phone</Label>
                                <Input
                                    placeholder="alex@example.com or +123456789"
                                    value={newTicket.email}
                                    onChange={(e) => setNewTicket({ ...newTicket, email: e.target.value })}
                                    className="h-8 text-xs bg-secondary/30 border-border/80"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div className="space-y-1">
                                    <Label className="text-xs">Channel</Label>
                                    <Select
                                        value={newTicket.channel}
                                        onValueChange={(val) => setNewTicket({ ...newTicket, channel: val })}
                                    >
                                        <SelectTrigger className="h-8 text-xs bg-secondary/30 border-border/80">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="WhatsApp">WhatsApp</SelectItem>
                                            <SelectItem value="Email">Email</SelectItem>
                                            <SelectItem value="Live Chat">Live Chat</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs">Priority</Label>
                                    <Select
                                        value={newTicket.priority}
                                        onValueChange={(val) => setNewTicket({ ...newTicket, priority: val })}
                                    >
                                        <SelectTrigger className="h-8 text-xs bg-secondary/30 border-border/80">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Urgent">Urgent</SelectItem>
                                            <SelectItem value="High">High</SelectItem>
                                            <SelectItem value="Medium">Medium</SelectItem>
                                            <SelectItem value="Low">Low</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs">Subject</Label>
                                <Input
                                    placeholder="Brief summary of the issue..."
                                    value={newTicket.subject}
                                    onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
                                    className="h-8 text-xs bg-secondary/30 border-border/80"
                                />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs">Initial Message / Details</Label>
                                <Textarea
                                    rows={2}
                                    placeholder="Customer inquiry details..."
                                    value={newTicket.message}
                                    onChange={(e) => setNewTicket({ ...newTicket, message: e.target.value })}
                                    className="text-xs bg-secondary/30 border-border/80 resize-none"
                                />
                            </div>
                            <div className="flex justify-end gap-2 pt-2">
                                <Button type="button" variant="ghost" size="sm" onClick={() => setIsCreateOpen(false)} className="h-8 text-xs">
                                    Cancel
                                </Button>
                                <Button type="submit" size="sm" disabled={creating} className="h-8 text-xs bg-sky-600 hover:bg-sky-700 text-white">
                                    {creating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Create Ticket'}
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-1.5 flex-wrap">
                    {['All', 'Open', 'In Progress', 'Resolved'].map((st) => (
                        <Button
                            key={st}
                            variant={filterStatus === st ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setFilterStatus(st)}
                            className={`h-7 text-xs ${filterStatus === st ? 'bg-sky-600 text-white' : 'border-border/80'}`}
                        >
                            {st}
                        </Button>
                    ))}
                </div>

                <div className="relative w-full sm:w-64">
                    <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-muted-foreground" />
                    <Input
                        placeholder="Search tickets..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="h-8 pl-8 text-xs bg-secondary/30 border-border/80"
                    />
                </div>
            </div>

            {/* Ticket List */}
            {loading ? (
                <div className="flex items-center justify-center p-12 text-muted-foreground text-xs gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-primary" /> Loading tickets...
                </div>
            ) : filtered.length === 0 ? (
                <div className="p-12 text-center border border-dashed rounded-xl border-border/60">
                    <Ticket className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-50" />
                    <p className="text-xs font-semibold text-foreground">No tickets in this view</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-2.5">
                    {filtered.map((t) => (
                        <Card key={t.id} className="bg-card border-border/80 hover:border-sky-500/40 transition-all p-3.5 shadow-xs">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
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
                                        <span className="text-xs font-medium text-foreground">{t.channel}</span>
                                        <span className="text-xs text-muted-foreground">•</span>
                                        <span className="text-xs font-medium text-foreground">{t.customer}</span>
                                    </div>
                                    <h3 className="font-semibold text-xs text-foreground line-clamp-1">{t.subject}</h3>
                                    <div className="flex items-center gap-4 text-[11px] text-muted-foreground flex-wrap">
                                        <span>Assignee: <span className="font-medium text-foreground">{t.assignedTo}</span></span>
                                        <span>•</span>
                                        <span>SLA: <span className="font-mono text-foreground">{t.sla}</span></span>
                                        <span>•</span>
                                        <span>Last reply: {t.lastReply}</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 shrink-0">
                                    <Select
                                        value={t.status}
                                        onValueChange={(val) => handleStatusChange(t.id, val)}
                                    >
                                        <SelectTrigger className="h-7 text-xs w-28 bg-secondary/40 border-border/80">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Open">Open</SelectItem>
                                            <SelectItem value="In Progress">In Progress</SelectItem>
                                            <SelectItem value="Resolved">Resolved</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <Link href={`/workspace/${workspaceId}/deskflow/chat`}>
                                        <Button size="sm" variant="secondary" className="h-7 text-xs border border-border/60 gap-1 hover:bg-sky-500/10 hover:text-sky-500">
                                            <span>Open Chat</span>
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
