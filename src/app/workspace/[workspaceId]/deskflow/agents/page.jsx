'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
    Users,
    UserCheck,
    Plus,
    Mail,
    Star,
    Ticket,
    Shield,
    Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { getAgents, createAgent } from '../_actions/deskflow-actions';

export default function DeskFlowAgentsPage() {
    const params = useParams();
    const workspaceId = params?.workspaceId;

    const [agents, setAgents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isInviteOpen, setIsInviteOpen] = useState(false);
    const [inviting, setInviting] = useState(false);

    const [newAgent, setNewAgent] = useState({
        name: '',
        email: '',
        role: 'Support Representative'
    });

    const loadAgents = async () => {
        setLoading(true);
        const res = await getAgents(workspaceId);
        if (res.success) setAgents(res.data);
        setLoading(false);
    };

    useEffect(() => {
        loadAgents();
    }, [workspaceId]);

    const handleInvite = async (e) => {
        e.preventDefault();
        if (!newAgent.name.trim() || !newAgent.email.trim()) {
            return toast.error("Please fill name and email");
        }

        setInviting(true);
        const res = await createAgent(workspaceId, newAgent);
        if (res.success) {
            toast.success(`Agent invitation dispatched to ${newAgent.email}!`);
            setIsInviteOpen(false);
            setNewAgent({ name: '', email: '', role: 'Support Representative' });
            loadAgents();
        } else {
            toast.error(res.error || "Failed to invite agent");
        }
        setInviting(false);
    };

    return (
        <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-sky-500/10 border border-sky-500/20">
                            <Users className="w-4 h-4 text-sky-500" />
                        </div>
                        <h1 className="text-lg font-bold text-foreground">Support Agents & Team Capacity</h1>
                    </div>
                    <p className="text-xs text-muted-foreground">Manage active human support reps, AI automated agents, and queue routing.</p>
                </div>

                <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
                    <DialogTrigger asChild>
                        <Button size="sm" className="h-8 text-xs bg-sky-600 hover:bg-sky-700 text-white gap-1.5 shadow-xs">
                            <Plus className="w-3.5 h-3.5" />
                            Invite Agent
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md bg-card border-border/80">
                        <DialogHeader>
                            <DialogTitle className="text-sm font-bold">Invite Support Team Member</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleInvite} className="space-y-3 pt-2">
                            <div className="space-y-1">
                                <Label className="text-xs">Full Name</Label>
                                <Input
                                    placeholder="Jane Smith"
                                    value={newAgent.name}
                                    onChange={(e) => setNewAgent({ ...newAgent, name: e.target.value })}
                                    className="h-8 text-xs bg-secondary/30 border-border/80"
                                    required
                                />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs">Work Email</Label>
                                <Input
                                    type="email"
                                    placeholder="jane@company.com"
                                    value={newAgent.email}
                                    onChange={(e) => setNewAgent({ ...newAgent, email: e.target.value })}
                                    className="h-8 text-xs bg-secondary/30 border-border/80"
                                    required
                                />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs">Support Role</Label>
                                <Select
                                    value={newAgent.role}
                                    onValueChange={(val) => setNewAgent({ ...newAgent, role: val })}
                                >
                                    <SelectTrigger className="h-8 text-xs bg-secondary/30 border-border/80">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Support Representative">Support Representative</SelectItem>
                                        <SelectItem value="Senior Support Lead">Senior Support Lead</SelectItem>
                                        <SelectItem value="WhatsApp Specialist">WhatsApp Specialist</SelectItem>
                                        <SelectItem value="Billing Specialist">Billing Specialist</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex justify-end gap-2 pt-2 border-t border-border/40">
                                <Button type="button" variant="ghost" size="sm" onClick={() => setIsInviteOpen(false)} className="h-8 text-xs">
                                    Cancel
                                </Button>
                                <Button type="submit" size="sm" disabled={inviting} className="h-8 text-xs bg-sky-600 hover:bg-sky-700 text-white gap-1">
                                    {inviting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Send Invite'}
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {loading ? (
                <div className="flex items-center justify-center p-12 text-xs text-muted-foreground gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-primary" /> Loading support team...
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {agents.map((ag) => (
                        <Card key={ag.id} className="bg-card border-border/80 p-4 space-y-3 shadow-xs hover:border-sky-500/40 transition-all">
                            <div className="flex items-start justify-between">
                                <div className="space-y-0.5">
                                    <div className="flex items-center gap-1.5">
                                        <span className="font-semibold text-xs text-foreground">{ag.name}</span>
                                        <span className={`w-2 h-2 rounded-full ${ag.status === 'online' ? 'bg-emerald-500' : 'bg-zinc-400'}`} />
                                    </div>
                                    <span className="text-[10px] text-muted-foreground block">{ag.role}</span>
                                </div>
                                <Badge variant="outline" className="text-[9px] font-mono">{ag.rating}</Badge>
                            </div>

                            <div className="pt-2 border-t border-border/40 space-y-1.5 text-[11px] text-muted-foreground">
                                <div className="flex items-center justify-between">
                                    <span>Active Tickets</span>
                                    <span className="font-bold text-foreground">{ag.activeTickets}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span>Email</span>
                                    <span className="font-mono text-[10px] text-foreground truncate max-w-[140px]">{ag.email}</span>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
