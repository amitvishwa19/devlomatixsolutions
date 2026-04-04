// @ts-nocheck
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    MessageSquare, 
    Shield, 
    Smartphone, 
    RefreshCcw, 
    CheckCircle2, 
    AlertCircle, 
    LogOut, 
    QrCode, 
    Plus, 
    Trash2, 
    Send,
    Settings,
    Zap,
    Globe,
    Lock,
    Terminal,
    Clock,
    User,
    Copy,
    Check,
    Bot
} from 'lucide-react';
import { toast } from 'sonner';
import QRCode from 'qrcode';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { DynamicIcon } from "@/components/ui/dynamic-icon";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export default function SettingsPage() {
    const [status, setStatus] = useState('welcome');
    const [metadata, setMetadata] = useState({});
    const [newNumber, setNewNumber] = useState('');
    const [qrCode, setQrCode] = useState(null);
    const [qrDataUrl, setQrDataUrl] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [webhookUrl, setWebhookUrl] = useState('');
    const [copied, setCopied] = useState(false);

    const fetchStatus = useCallback(async () => {
        try {
            const res = await fetch('/api/wa/auth');
            const data = await res.json();

            setStatus(data.status);
            if (data.qr && data.qr !== qrCode) {
                setQrCode(data.qr);
                const dataUrl = await QRCode.toDataURL(data.qr);
                setQrDataUrl(dataUrl);
            } else if (!data.qr) {
                setQrCode(null);
                setQrDataUrl(null);
            }

            if (data.metadata) {
                setMetadata(data.metadata);
            }
        } catch (error) {
            console.error('Failed to fetch WA status:', error);
        } finally {
            setLoading(false);
        }
    }, [qrCode]);

    useEffect(() => {
        fetchStatus();
        const interval = setInterval(fetchStatus, 10000);
        
        if (typeof window !== 'undefined') {
            setWebhookUrl(`${window.location.origin}/api/wa/webhook`);
        }

        return () => clearInterval(interval);
    }, [fetchStatus]);

    const handleConnect = async () => {
        setActionLoading(true);
        try {
            const res = await fetch('/api/wa/auth', { method: 'POST' });
            if (res.ok) {
                toast.success('Connection process started');
                fetchStatus();
            } else {
                toast.error('Failed to start connection');
            }
        } catch (error) {
            toast.error('Connection error');
        } finally {
            setActionLoading(false);
        }
    };

    const handleDisconnect = async () => {
        setActionLoading(true);
        try {
            const res = await fetch('/api/wa/auth', { method: 'DELETE' });
            if (res.ok) {
                toast.success('Disconnected successfully');
                fetchStatus();
            } else {
                toast.error('Failed to disconnect');
            }
        } catch (error) {
            toast.error('Disconnect error');
        } finally {
            setActionLoading(false);
        }
    };

    const handleSaveMetadata = async (updates) => {
        const newMetadata = { ...metadata, ...updates };
        setMetadata(newMetadata);
        try {
            const res = await fetch('/api/wa/auth', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ metadata: newMetadata })
            });
            if (!res.ok) throw new Error('Failed to save');
            toast.success('Settings updated');
        } catch (error) {
            toast.error('Failed to save settings');
            console.error(error);
        }
    };

    const handleAddNumber = () => {
        let formatted = newNumber.trim();
        if (!formatted) return;

        if (!formatted.startsWith('+')) {
            formatted = '+' + formatted.replace(/[^0-9]/g, '');
        }

        const currentNumbers = metadata.testNumbers || [];
        if (currentNumbers.includes(formatted)) {
            toast.error('Number already exists.');
            return;
        }

        if (currentNumbers.length >= 5) {
            toast.error('Maximum 5 test numbers allowed.');
            return;
        }

        handleSaveMetadata({ testNumbers: [...currentNumbers, formatted] });
        setNewNumber('');
    };

    const handleRemoveNumber = (num) => {
        const updated = (metadata.testNumbers || []).filter(n => n !== num);
        handleSaveMetadata({ testNumbers: updated });
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        toast.success("Copied to clipboard");
        setTimeout(() => setCopied(false), 2000);
    };

    const statusConfig = {
        welcome: { label: 'Not Connected', color: 'bg-zinc-500', icon: AlertCircle },
        connecting: { label: 'Connecting...', color: 'bg-yellow-500 animate-pulse', icon: RefreshCcw },
        qr: { label: 'Scan Required', color: 'bg-blue-500', icon: QrCode },
        open: { label: 'Connected', color: 'bg-green-500', icon: CheckCircle2 },
        close: { label: 'Disconnected', color: 'bg-red-500', icon: LogOut }
    };

    const currentStatus = statusConfig[status] || statusConfig.welcome;

    return (
        <TooltipProvider>
            <div className="flex flex-col h-full gap-4 p-2 animate-in fade-in duration-500">
                
                {/* Header Section */}
                <div className="flex border border-border items-center justify-between bg-card p-4 rounded-xl shadow-sm">
                    <div className="flex flex-row gap-3 items-center">
                        <div className="p-2.5 bg-primary/10 rounded-xl">
                            <Settings className="w-6 h-6 text-primary" />
                        </div>
                        <div className='flex flex-col'>
                            <h2 className="text-xl font-bold text-foreground">WhatsApp Settings</h2>
                            <p className="text-xs text-muted-foreground">Configure your instance, automation, and API integrations.</p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        <Badge variant="outline" className={`py-1.5 px-4 flex items-center gap-2 border-0 ${currentStatus.color}/10 text-foreground font-bold shadow-sm`}>
                            <div className={`h-2 w-2 rounded-full ${currentStatus.color}`} />
                            {currentStatus.label}
                        </Badge>
                        {status === 'open' && (
                            <Button 
                                variant="destructive" 
                                size="sm" 
                                className="gap-2 h-9" 
                                onClick={handleDisconnect} 
                                disabled={actionLoading}
                            >
                                <LogOut className="w-4 h-4" />
                                Disconnect
                            </Button>
                        )}
                    </div>
                </div>

                {/* Main Content Area: Tabs */}
                <Tabs defaultValue="general" className="flex-1 flex flex-col gap-4 overflow-hidden">
                    <TabsList className="bg-card border border-border p-1 h-12 w-fit">
                        <TabsTrigger value="general" className="gap-2 px-6 h-full data-[state=active]:bg-primary/10 data-[state=active]:text-primary font-bold transition-all">
                            <Smartphone className="w-4 h-4" /> General
                        </TabsTrigger>
                        <TabsTrigger value="automation" className="gap-2 px-6 h-full data-[state=active]:bg-primary/10 data-[state=active]:text-primary font-bold transition-all">
                            <Zap className="w-4 h-4" /> Automation
                        </TabsTrigger>
                        <TabsTrigger value="api" className="gap-2 px-6 h-full data-[state=active]:bg-primary/10 data-[state=active]:text-primary font-bold transition-all">
                            <Terminal className="w-4 h-4" /> API & Webhook
                        </TabsTrigger>
                        <TabsTrigger value="advanced" className="gap-2 px-6 h-full data-[state=active]:bg-primary/10 data-[state=active]:text-primary font-bold transition-all">
                            <Shield className="w-4 h-4" /> Advanced
                        </TabsTrigger>
                    </TabsList>

                    {/* General Tab */}
                    <TabsContent value="general" className="flex-1 overflow-y-auto space-y-4 focus-visible:ring-0">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Connection Handler */}
                            <Card className="bg-card/50 border-border shadow-sm overflow-hidden flex flex-col">
                                <CardHeader className="border-b border-border/50 pb-4">
                                    <CardTitle className="text-base flex items-center gap-2">
                                        <QrCode className="w-4 h-4 text-primary" />
                                        Instance Authentication
                                    </CardTitle>
                                    <CardDescription className="text-[11px]">Securely link your WhatsApp account via QR code.</CardDescription>
                                </CardHeader>
                                <CardContent className="flex-1 flex flex-col items-center justify-center p-8 min-h-[350px]">
                                    <AnimatePresence mode="wait">
                                        {status === 'qr' && qrDataUrl ? (
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.9 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                className="p-6 bg-white rounded-2xl shadow-2xl relative group border-4 border-primary/20"
                                            >
                                                <img src={qrDataUrl} alt="QR Code" className="w-56 h-56" />
                                                <div className="absolute inset-0 bg-white/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-xl">
                                                    <Badge className="bg-primary hover:bg-primary gap-2">
                                                        <RefreshCcw className="w-3 h-3 animate-spin" /> Refreshing
                                                    </Badge>
                                                </div>
                                            </motion.div>
                                        ) : status === 'open' ? (
                                            <div className="text-center space-y-6">
                                                <div className="w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center border-2 border-emerald-500/20 mx-auto">
                                                    <CheckCircle2 className="w-12 h-12 text-emerald-500" />
                                                </div>
                                                <div className="space-y-2">
                                                    <h3 className="text-lg font-bold">Session Active</h3>
                                                    <p className="text-xs text-muted-foreground max-w-[200px] mx-auto">Your device is successfully linked and actively processing messages.</p>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="text-center space-y-6">
                                                <div className="w-20 h-20 bg-muted/30 rounded-full flex items-center justify-center mx-auto opacity-50">
                                                    <Smartphone className="w-10 h-10" />
                                                </div>
                                                <p className="text-xs text-muted-foreground">Ready to connect your first instance.</p>
                                                <Button 
                                                    className="bg-primary hover:bg-primary/90 gap-2 px-8 font-bold h-11" 
                                                    onClick={handleConnect} 
                                                    disabled={actionLoading || status === 'connecting'}
                                                >
                                                    {status === 'connecting' ? <RefreshCcw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                                                    Start Connection
                                                </Button>
                                            </div>
                                        )}
                                    </AnimatePresence>
                                </CardContent>
                            </Card>

                            {/* Instance Info */}
                            <div className="space-y-4">
                                <Card className="bg-card/50 border-border shadow-sm">
                                    <CardHeader className="pb-3 px-4 pt-4">
                                        <CardTitle className="text-sm font-bold flex items-center gap-2">
                                            <User className="w-4 h-4 text-primary" />
                                            Active Profile
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4 p-4 pt-0">
                                        <div className="flex items-center gap-4 p-3 bg-muted/20 border border-border/10 rounded-xl">
                                            <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-black text-xl">
                                                {status === 'open' ? 'W' : '?'}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold">{status === 'open' ? 'Connected User' : 'Unknown'}</span>
                                                <span className="text-xs text-muted-foreground">{status === 'open' ? 'Instance V2.0 (Stable)' : 'No active session'}</span>
                                            </div>
                                        </div>
                                        
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="p-3 bg-muted/10 border border-border/50 rounded-lg">
                                                <span className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">Platform</span>
                                                <span className="text-xs font-semibold">{status === 'open' ? 'Web/Baileys' : '-'}</span>
                                            </div>
                                            <div className="p-3 bg-muted/10 border border-border/50 rounded-lg">
                                                <span className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">Session ID</span>
                                                <span className="text-xs font-mono opacity-60">ID_928...</span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="bg-card/50 border-border shadow-sm border-l-4 border-l-primary">
                                    <CardContent className="p-4 flex gap-3">
                                        <Clock className="w-5 h-5 text-primary shrink-0" />
                                        <div>
                                            <h4 className="text-xs font-bold uppercase tracking-widest text-foreground mb-1">Uptime Monitoring</h4>
                                            <p className="text-[11px] text-muted-foreground leading-relaxed">Your instance is polled every 10 seconds to ensure high availability and automatic reconnection.</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </TabsContent>

                    {/* Automation Tab */}
                    <TabsContent value="automation" className="flex-1 overflow-y-auto space-y-4 focus-visible:ring-0">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Card className="bg-card/50 border-border shadow-sm">
                                <CardHeader className="pb-4 border-b border-border/50">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-base flex items-center gap-2">
                                            <Bot className="w-4 h-4 text-primary" />
                                            Auto-Responder
                                        </CardTitle>
                                        <Switch 
                                            checked={metadata.autoResponderEnabled || false} 
                                            onCheckedChange={(checked) => handleSaveMetadata({ autoResponderEnabled: checked })}
                                        />
                                    </div>
                                    <CardDescription className="text-xs">Automatically reply to all incoming messages when active.</CardDescription>
                                </CardHeader>
                                <CardContent className="p-4 space-y-6 pt-6">
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <Label className="text-sm font-semibold">AI Assistant Support</Label>
                                            <Switch 
                                                checked={metadata.aiAssistantEnabled || false} 
                                                onCheckedChange={(checked) => handleSaveMetadata({ aiAssistantEnabled: checked })}
                                            />
                                        </div>
                                        <p className="text-[11px] text-muted-foreground">When enabled, AI will generate human-like contextual replies for unknown queries.</p>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-sm font-semibold">Out-of-Office / Welcome Message</Label>
                                        <Textarea 
                                            className="min-h-[100px] text-xs bg-muted/20 border-border/50" 
                                            placeholder="Hello! Thanks for reaching out. We'll get back to you shortly."
                                            value={metadata.welcomeMessage || ''}
                                            onChange={(e) => setMetadata({ ...metadata, welcomeMessage: e.target.value })}
                                            onBlur={(e) => handleSaveMetadata({ welcomeMessage: e.target.value })}
                                        />
                                        <p className="text-[10px] text-muted-foreground italic">Sent to every first interaction from a new contact.</p>
                                    </div>
                                </CardContent>
                            </Card>

                            <div className="space-y-4">
                                <Card className="bg-card/50 border-border shadow-sm">
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-sm font-bold flex items-center gap-2">
                                            <Send className="w-4 h-4 text-primary" />
                                            Whitelisted Test Numbers
                                        </CardTitle>
                                        <CardDescription className="text-[11px]">Quick destinations for Builder test sends.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="flex gap-2">
                                            <Input
                                                placeholder="e.g. 919876543210"
                                                value={newNumber}
                                                onChange={(e) => setNewNumber(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && handleAddNumber()}
                                                className="bg-background border-border h-9 text-xs"
                                            />
                                            <Button size="sm" onClick={handleAddNumber} className="h-9 px-3">
                                                <Plus className="w-4 h-4" />
                                            </Button>
                                        </div>
                                        <div className="flex flex-wrap gap-2 min-h-[40px]">
                                            {(metadata.testNumbers || []).map((num) => (
                                                <Badge key={num} variant="secondary" className="pl-3 pr-1 py-1 gap-1.5 border border-border/50">
                                                    <span className="text-[10px] font-mono">{num}</span>
                                                    <Button 
                                                        variant="ghost" 
                                                        size="icon" 
                                                        className="h-4 w-4 hover:bg-destructive/20 hover:text-destructive transition-colors rounded-full" 
                                                        onClick={() => handleRemoveNumber(num)}
                                                    >
                                                        <Trash2 className="h-2.5 w-2.5" />
                                                    </Button>
                                                </Badge>
                                            ))}
                                            {(metadata.testNumbers || []).length === 0 && (
                                                <p className="text-[10px] text-muted-foreground italic w-full text-center">No numbers whitelisted yet.</p>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="bg-primary/5 border border-primary/20">
                                    <CardContent className="p-4 flex gap-3 text-primary">
                                        <Zap className="w-5 h-5 shrink-0" />
                                        <div className="space-y-1">
                                            <h4 className="text-xs font-bold uppercase tracking-wider">Priority Routing</h4>
                                            <p className="text-[10px] opacity-80 leading-relaxed font-medium">Test numbers bypass all global rate limits and queues for instant workflow validation.</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </TabsContent>

                    {/* API & Webhook Tab */}
                    <TabsContent value="api" className="flex-1 overflow-y-auto space-y-4 focus-visible:ring-0">
                        <Card className="bg-card/50 border-border shadow-sm">
                            <CardHeader className="border-b border-border/50 pb-4">
                                <CardTitle className="text-base flex items-center gap-2">
                                    <Globe className="w-4 h-4 text-primary" />
                                    Webhooks & External Integrations
                                </CardTitle>
                                <CardDescription className="text-xs font-medium">Connect external services (CRMs, ERPs) to your WhatsApp instance.</CardDescription>
                            </CardHeader>
                            <CardContent className="p-6 space-y-6">
                                <div className="space-y-3">
                                    <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Inbound Payload URL (JSON)</Label>
                                    <div className="flex gap-2">
                                        <div className="relative flex-1 group">
                                            <Input readOnly value={webhookUrl} className="bg-muted/30 border-border/50 font-mono text-[11px] pr-10 cursor-default focus:ring-0" />
                                            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                                                <Globe className="w-3.5 h-3.5 text-muted-foreground/30" />
                                            </div>
                                        </div>
                                        <Button 
                                            variant="outline" 
                                            size="icon" 
                                            className="border-border hover:bg-primary/10 hover:border-primary/30 transition-all font-bold"
                                            onClick={() => copyToClipboard(webhookUrl)}
                                        >
                                            {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                                        </Button>
                                    </div>
                                    <p className="text-[10px] text-muted-foreground bg-muted/20 p-2 rounded border border-border/5 dash-border">
                                        Use this endpoint in your Shopify, WooCommerce, or Custom Apps to trigger WhatsApp automations.
                                    </p>
                                </div>

                                <Separator className="bg-border/50" />

                                <div className="grid md:grid-cols-2 gap-8">
                                    <div className="space-y-4">
                                        <h4 className="text-xs font-black uppercase text-primary tracking-tighter">Connection Headers</h4>
                                        <div className="space-y-3">
                                            <div className="flex justify-between items-center text-xs">
                                                <span className="text-muted-foreground">Content-Type</span>
                                                <code className="text-foreground bg-muted/40 px-1.5 py-0.5 rounded">application/json</code>
                                            </div>
                                            <div className="flex justify-between items-center text-xs">
                                                <span className="text-muted-foreground">Auth Method</span>
                                                <code className="text-foreground bg-muted/40 px-1.5 py-0.5 rounded">Bearer Token</code>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <h4 className="text-xs font-black uppercase text-primary tracking-tighter">Events Supported</h4>
                                        <div className="flex flex-wrap gap-1.5">
                                            {['order_created', 'cart_abandoned', 'new_msg', 'status_update'].map(ev => (
                                                <Badge key={ev} variant="secondary" className="text-[9px] h-5 bg-primary/5 text-primary/70 border-0">{ev}</Badge>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Advanced Tab */}
                    <TabsContent value="advanced" className="flex-1 overflow-y-auto space-y-4 focus-visible:ring-0">
                        <div className="grid md:grid-cols-3 gap-4">
                            <Card className="bg-card/50 border-border group hover:border-blue-500/30 transition-all cursor-pointer">
                                <CardContent className="p-6 text-center space-y-3">
                                    <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                                        <Lock className="w-6 h-6 text-blue-500" />
                                    </div>
                                    <div className="space-y-1">
                                        <h3 className="text-sm font-bold">Session Security</h3>
                                        <p className="text-[10px] text-muted-foreground">Regenerate local encryption keys.</p>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="bg-card/50 border-border group hover:border-emerald-500/30 transition-all cursor-pointer">
                                <CardContent className="p-6 text-center space-y-3">
                                    <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                                        <Copy className="w-6 h-6 text-emerald-500" />
                                    </div>
                                    <div className="space-y-1">
                                        <h3 className="text-sm font-bold">Audit Logs</h3>
                                        <p className="text-[10px] text-muted-foreground">View connection history logs.</p>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="bg-card/50 border-border group hover:border-destructive/30 transition-all cursor-pointer" onClick={() => handleDisconnect()}>
                                <CardContent className="p-6 text-center space-y-3">
                                    <div className="w-12 h-12 bg-destructive/10 rounded-xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                                        <Trash2 className="w-6 h-6 text-destructive" />
                                    </div>
                                    <div className="space-y-1">
                                        <h3 className="text-sm font-bold text-destructive">Wipe Session</h3>
                                        <p className="text-[10px] text-muted-foreground">Remove all instance data.</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <Card className="bg-muted/5 border-dashed border-border/50">
                            <CardContent className="p-6 space-y-4">
                                <div className="flex items-center gap-2">
                                    <Terminal className="w-4 h-4 text-muted-foreground" />
                                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">System Metadata (Raw)</span>
                                </div>
                                <pre className="p-4 bg-black/40 rounded-lg text-[10px] font-mono text-emerald-500/80 max-h-[150px] overflow-y-auto overflow-x-hidden border border-white/5">
                                    {JSON.stringify(metadata, null, 2)}
                                </pre>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </TooltipProvider>
    );
}