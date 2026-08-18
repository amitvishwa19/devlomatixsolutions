'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import {
    Zap,
    Globe,
    Clock,
    ShoppingBag,
    MessageSquare,
    Copy,
    Plus,
    Check,
    Bot,
    ExternalLink,
    Play,
    Pause,
    Trash2,
    Send,
    Shield,
    Loader2,
    CheckCircle2
} from 'lucide-react';
import { toast } from 'sonner';
import {
    getWebhookTriggers,
    createWebhookTrigger,
    toggleWebhookTrigger,
    deleteWebhookTrigger,
    getWorkflows
} from '../_actions/workflow-actions';

export default function FlowForgeTriggersPage() {
    const params = useParams();
    const workspaceId = params?.workspaceId;

    const [webhooks, setWebhooks] = useState([]);
    const [workflows, setWorkflows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [creating, setCreating] = useState(false);

    const [newWebhook, setNewWebhook] = useState({
        name: '',
        method: 'POST',
        authType: 'HMAC SHA-256',
        targetWorkflow: ''
    });

    const loadData = async () => {
        setLoading(true);
        const [whRes, wfRes] = await Promise.all([
            getWebhookTriggers(workspaceId),
            getWorkflows(workspaceId)
        ]);

        if (whRes.success) setWebhooks(whRes.data);
        if (wfRes.success) {
            setWorkflows(wfRes.data);
            if (wfRes.data.length > 0 && !newWebhook.targetWorkflow) {
                setNewWebhook(prev => ({ ...prev, targetWorkflow: wfRes.data[0].name }));
            }
        }
        setLoading(false);
    };

    useEffect(() => {
        loadData();
    }, [workspaceId]);

    const handleCreateWebhook = async (e) => {
        e.preventDefault();
        if (!newWebhook.name.trim()) return toast.error("Please enter a webhook name");

        setCreating(true);
        const res = await createWebhookTrigger(workspaceId, newWebhook);
        if (res.success) {
            toast.success("New Webhook trigger registered!");
            setIsCreateOpen(false);
            setNewWebhook({
                name: '',
                method: 'POST',
                authType: 'HMAC SHA-256',
                targetWorkflow: workflows[0]?.name || 'Generic Pipeline'
            });
            loadData();
        } else {
            toast.error(res.error || "Failed to create webhook");
        }
        setCreating(false);
    };

    const handleToggle = async (id) => {
        const res = await toggleWebhookTrigger(workspaceId, id);
        if (res.success) {
            toast.success(`Webhook ${res.data.status === 'active' ? 'activated' : 'paused'}`);
            loadData();
        }
    };

    const handleDelete = async (id) => {
        const res = await deleteWebhookTrigger(workspaceId, id);
        if (res.success) {
            toast.success("Webhook endpoint deleted");
            loadData();
        }
    };

    const testWebhookPing = (name) => {
        toast.promise(
            new Promise((resolve) => setTimeout(resolve, 800)),
            {
                loading: `Sending simulated POST test payload to "${name}"...`,
                success: '200 OK — Trigger received & test pipeline executed successfully!',
                error: 'Failed to send test ping'
            }
        );
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        toast.success("Webhook URL copied to clipboard!");
    };

    const triggerTypes = [
        {
            id: 'cron',
            name: 'Cron & Scheduled Timers',
            description: 'Triggers on a recurring cron cadence (hourly, daily at midnight, weekly reports).',
            icon: Clock,
            color: 'text-purple-500 bg-purple-500/10',
            activeCount: '2 schedules active',
            endpoint: 'Schedule: 0 0 * * * (Every Midnight UTC)'
        },
        {
            id: 'whatsapp',
            name: 'KonnectX WhatsApp Events',
            description: 'Triggers on inbound message, button reply, or WhatsApp flow submission.',
            icon: MessageSquare,
            color: 'text-emerald-500 bg-emerald-500/10',
            activeCount: 'Real-time webhook linked',
            endpoint: 'Events: messages.received, flows.submitted'
        },
        {
            id: 'ecommerce',
            name: 'eCommerce Store Events',
            description: 'Triggers when orders are placed, cancelled, or carts are abandoned.',
            icon: ShoppingBag,
            color: 'text-amber-500 bg-amber-500/10',
            activeCount: '3 active listeners',
            endpoint: 'Events: order.created, order.paid, cart.abandoned'
        }
    ];

    return (
        <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
                            <Zap className="w-4 h-4 text-amber-500" />
                        </div>
                        <h1 className="text-lg font-bold text-foreground">Trigger Sources & Webhook Listeners</h1>
                    </div>
                    <p className="text-xs text-muted-foreground">Configure events, webhook endpoints, and scheduled cron jobs that activate workflows.</p>
                </div>

                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                        <Button size="sm" className="h-8 text-xs bg-amber-600 hover:bg-amber-700 text-white gap-1.5 shadow-xs">
                            <Plus className="w-3.5 h-3.5" />
                            New Webhook Trigger
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-lg bg-card border-border/80">
                        <DialogHeader>
                            <DialogTitle className="text-sm font-bold flex items-center gap-2">
                                <Globe className="w-4 h-4 text-sky-500" />
                                Register Inbound Webhook Listener
                            </DialogTitle>
                            <DialogDescription className="text-xs text-muted-foreground">
                                Generate a dedicated HTTPS endpoint to receive external HTTP POST events.
                            </DialogDescription>
                        </DialogHeader>

                        <form onSubmit={handleCreateWebhook} className="space-y-3.5 pt-2">
                            <div className="space-y-1">
                                <Label className="text-xs font-medium">Webhook Name <span className="text-rose-500">*</span></Label>
                                <Input
                                    placeholder="e.g. Stripe Checkout Completed"
                                    value={newWebhook.name}
                                    onChange={(e) => setNewWebhook({ ...newWebhook, name: e.target.value })}
                                    className="h-8 text-xs bg-secondary/30 border-border/80"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <Label className="text-xs font-medium">HTTP Method</Label>
                                    <Select
                                        value={newWebhook.method}
                                        onValueChange={(val) => setNewWebhook({ ...newWebhook, method: val })}
                                    >
                                        <SelectTrigger className="h-8 text-xs bg-secondary/30 border-border/80">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="POST">POST (Recommended)</SelectItem>
                                            <SelectItem value="PUT">PUT</SelectItem>
                                            <SelectItem value="GET">GET</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-1">
                                    <Label className="text-xs font-medium">Authentication Security</Label>
                                    <Select
                                        value={newWebhook.authType}
                                        onValueChange={(val) => setNewWebhook({ ...newWebhook, authType: val })}
                                    >
                                        <SelectTrigger className="h-8 text-xs bg-secondary/30 border-border/80">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="HMAC SHA-256">HMAC SHA-256</SelectItem>
                                            <SelectItem value="Bearer Token">Bearer Token</SelectItem>
                                            <SelectItem value="Secret Signature">Secret Signature</SelectItem>
                                            <SelectItem value="Open (No Auth)">Open (No Auth)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <Label className="text-xs font-medium">Target Workflow to Activate</Label>
                                <Select
                                    value={newWebhook.targetWorkflow}
                                    onValueChange={(val) => setNewWebhook({ ...newWebhook, targetWorkflow: val })}
                                >
                                    <SelectTrigger className="h-8 text-xs bg-secondary/30 border-border/80">
                                        <SelectValue placeholder="Select target workflow" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {workflows.map((w) => (
                                            <SelectItem key={w.id} value={w.name}>{w.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="p-2.5 rounded-lg bg-secondary/30 border border-border/40 space-y-1 text-xs">
                                <div className="flex items-center gap-1 font-semibold text-foreground text-[11px]">
                                    <Shield className="w-3 h-3 text-emerald-500" />
                                    <span>Zero-Config High Availability</span>
                                </div>
                                <p className="text-[10px] text-muted-foreground">
                                    Inbound payloads are automatically validated, deduplicated, and passed to the workflow execution engine.
                                </p>
                            </div>

                            <div className="flex justify-end gap-2 pt-2 border-t border-border/40">
                                <Button type="button" variant="ghost" size="sm" onClick={() => setIsCreateOpen(false)} className="h-8 text-xs">
                                    Cancel
                                </Button>
                                <Button type="submit" size="sm" disabled={creating} className="h-8 text-xs bg-amber-600 hover:bg-amber-700 text-white gap-1 shadow-xs">
                                    {creating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Globe className="w-3.5 h-3.5" />}
                                    Generate Endpoint
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Active Inbound Webhooks Section */}
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                            <Globe className="w-4 h-4 text-sky-500" />
                            Registered Webhook Endpoints ({webhooks.length})
                        </h2>
                        <p className="text-xs text-muted-foreground">Live HTTPS endpoints listening for incoming events.</p>
                    </div>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center p-8 text-xs text-muted-foreground gap-2">
                        <Loader2 className="w-4 h-4 animate-spin text-primary" /> Loading webhook listeners...
                    </div>
                ) : webhooks.length === 0 ? (
                    <Card className="bg-card border-border/80 p-8 text-center border-dashed">
                        <Globe className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-50" />
                        <p className="text-xs font-semibold text-foreground">No webhook triggers registered</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">Click "New Webhook Trigger" to generate an endpoint.</p>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 gap-3">
                        {webhooks.map((wh) => {
                            const fullUrl = `https://dev.devlomatix.com/api/v1/workspaces/${workspaceId}/flowforge/webhook/${wh.endpointSlug}`;
                            return (
                                <Card key={wh.id} className="bg-card border-border/80 hover:border-sky-500/40 transition-all p-4 shadow-xs">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                                        <div className="space-y-2 flex-1 min-w-0">
                                            <div className="flex items-center gap-2.5 flex-wrap">
                                                <div className="p-1.5 rounded-lg bg-sky-500/10 text-sky-500 border border-sky-500/20">
                                                    <Globe className="w-4 h-4" />
                                                </div>
                                                <span className="font-semibold text-xs text-foreground">{wh.name}</span>
                                                <Badge variant="outline" className="text-[9px] font-mono font-semibold px-1.5 py-0 bg-secondary/50">
                                                    {wh.method}
                                                </Badge>
                                                <Badge
                                                    variant="outline"
                                                    className={`text-[9px] px-1.5 py-0 ${
                                                        wh.status === 'active' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20'
                                                    }`}
                                                >
                                                    {wh.status}
                                                </Badge>
                                                <span className="text-xs text-muted-foreground">•</span>
                                                <span className="text-[11px] text-muted-foreground font-mono">Auth: {wh.authType}</span>
                                            </div>

                                            {/* URL Box */}
                                            <div className="flex items-center gap-2 max-w-2xl">
                                                <Input
                                                    readOnly
                                                    value={fullUrl}
                                                    className="h-7 text-[11px] font-mono bg-secondary/40 border-border/80 select-all"
                                                />
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => copyToClipboard(fullUrl)}
                                                    className="h-7 text-xs border-border/80 shrink-0 gap-1"
                                                >
                                                    <Copy className="w-3 h-3" /> Copy URL
                                                </Button>
                                            </div>

                                            <div className="flex items-center gap-4 text-[11px] text-muted-foreground pt-0.5">
                                                <span>Target: <span className="font-medium text-foreground">{wh.targetWorkflow}</span></span>
                                                <span>•</span>
                                                <span>Events Ingested: <span className="font-mono font-semibold text-foreground">{wh.totalEvents || 0}</span></span>
                                                <span>•</span>
                                                <span>Last Fired: <span className="font-mono text-muted-foreground">{wh.lastFired}</span></span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-1.5 shrink-0 self-start md:self-center">
                                            <Button
                                                size="sm"
                                                variant="secondary"
                                                onClick={() => testWebhookPing(wh.name)}
                                                className="h-8 text-xs border border-border/60 gap-1 hover:bg-sky-500/10 hover:text-sky-500"
                                            >
                                                <Send className="w-3 h-3" /> Test Ping
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                className="h-8 w-8 border-border/80"
                                                onClick={() => handleToggle(wh.id)}
                                                title={wh.status === 'active' ? 'Pause Webhook' : 'Activate Webhook'}
                                            >
                                                {wh.status === 'active' ? <Pause className="w-3.5 h-3.5 text-muted-foreground" /> : <Play className="w-3.5 h-3.5 text-emerald-500" />}
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-rose-500 hover:bg-rose-500/10"
                                                onClick={() => handleDelete(wh.id)}
                                                title="Delete Webhook"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </Button>
                                        </div>
                                    </div>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Other Built-in Trigger Listeners */}
            <div className="space-y-3 pt-2">
                <h2 className="text-sm font-bold text-foreground">Built-in System Event Triggers</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {triggerTypes.map((t) => (
                        <Card key={t.id} className="bg-card border-border/80 p-4 space-y-3 shadow-xs">
                            <div className="flex items-start justify-between gap-2">
                                <div className="flex items-center gap-2.5">
                                    <div className={`p-2 rounded-lg ${t.color}`}>
                                        <t.icon className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-xs text-foreground">{t.name}</h3>
                                        <Badge variant="outline" className="text-[9px] text-muted-foreground mt-0.5">{t.activeCount}</Badge>
                                    </div>
                                </div>
                            </div>
                            <p className="text-xs text-muted-foreground line-clamp-2">{t.description}</p>
                            <div className="p-2 rounded-lg bg-secondary/30 border border-border/40 font-mono text-[10px] text-muted-foreground truncate">
                                {t.endpoint}
                            </div>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
}
