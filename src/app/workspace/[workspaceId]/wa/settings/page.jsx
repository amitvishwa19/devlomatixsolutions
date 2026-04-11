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
    Bot,
    Server,
    ExternalLink,
    ChevronRight,
    Cpu
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
import {
    SelectValue
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

export default function SettingsPage() {
    // Connection Method State
    const [method, setMethod] = useState('cloud'); // 'cloud' | 'browser'

    // Baileys / Browser States
    const [status, setStatus] = useState('welcome');
    const [metadata, setMetadata] = useState({});
    const [newNumber, setNewNumber] = useState('');
    const [qrCode, setQrCode] = useState(null);
    const [qrDataUrl, setQrDataUrl] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [waUser, setWaUser] = useState(null);

    // Cloud API States
    const [cloudCreds, setCloudCreds] = useState(null);
    const [cloudLoading, setCloudLoading] = useState(false);

    // Shared States
    const [webhookUrl, setWebhookUrl] = useState('');
    const [copied, setCopied] = useState(false);

    // Cloud Modal States
    const [isCredsModalOpen, setIsCredsModalOpen] = useState(false);
    const [tempCreds, setTempCreds] = useState({
        phoneNumberId: '',
        wabaId: '',
        accessToken: ''
    });

    // Fetch Browser Status (Baileys)
    const fetchBrowserStatus = useCallback(async () => {
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
            if (data.user) {
                setWaUser(data.user);
            }
        } catch (error) {
            console.error('Failed to fetch WA status:', error);
        } finally {
            setLoading(false);
        }
    }, [qrCode]);

    // Fetch Cloud API Credentials
    const fetchCloudCreds = async () => {
        setCloudLoading(true);
        try {
            const res = await fetch('/api/wa/credentials');
            const data = await res.json();
            if (data?.data) {
                setCloudCreds(data.data);
                // Pre-fill modal for editing
                setTempCreds({
                    phoneNumberId: data.data.phoneNumberId || '',
                    wabaId: data.data.wabaId || '',
                    accessToken: '' // Don't pre-fill masked token
                });
            }
        } catch (error) {
            console.error('Failed to fetch Cloud API creds:', error);
        } finally {
            setCloudLoading(false);
        }
    };

    const handleSaveCloudCreds = async () => {
        if (!tempCreds.phoneNumberId || !tempCreds.wabaId || !tempCreds.accessToken) {
            toast.error('All fields are required');
            return;
        }

        setCloudLoading(true);
        try {
            const res = await fetch('/api/wa/credentials', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(tempCreds)
            });

            if (res.ok) {
                toast.success('Cloud credentials updated');
                setIsCredsModalOpen(false);
                fetchCloudCreds();
            } else {
                const data = await res.json();
                toast.error(data.error || 'Failed to update credentials');
            }
        } catch (error) {
            toast.error('Network error updating credentials');
        } finally {
            setCloudLoading(false);
        }
    };

    useEffect(() => {
        fetchBrowserStatus();
        fetchCloudCreds();

        const interval = setInterval(() => {
            if (method === 'browser') fetchBrowserStatus();
        }, 10000);

        if (typeof window !== 'undefined') {
            setWebhookUrl(`${window.location.origin}/api/wa/webhook`);
        }

        return () => clearInterval(interval);
    }, [fetchBrowserStatus, method]);

    const handleConnect = async () => {
        setActionLoading(true);
        try {
            const res = await fetch('/api/wa/auth', { method: 'POST' });
            if (res.ok) {
                toast.success('Connection process started');
                fetchBrowserStatus();
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
                fetchBrowserStatus();
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

                {/* Unified Header with Connection Selector */}
                <div className="flex border border-border items-center justify-between bg-card p-4 rounded-xl shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32 opacity-20" />

                    <div className="flex flex-row gap-4 items-center z-10">
                        <div className="p-3 bg-primary/10 rounded-2xl border border-primary/20 shadow-inner">
                            {method === 'cloud' ? <Globe className="w-6 h-6 text-primary" /> : <Smartphone className="w-6 h-6 text-primary" />}
                        </div>
                        <div className='flex flex-col'>
                            <div className="flex items-center gap-3">
                                <h2 className="text-xl font-black text-foreground tracking-tight">WhatsApp Instance</h2>
                                <Badge variant="secondary" className="bg-primary/10 text-primary border-0 text-[10px] h-5 uppercase tracking-widest font-black">
                                    {method} Engine
                                </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground font-medium">Manage your {method === 'cloud' ? 'Meta Cloud API' : 'Browser Session'} configuration and status.</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-6 z-10">
                        <div className="flex flex-col items-end gap-2">
                            <Label className="text-[10px] uppercase font-black text-muted-foreground tracking-tighter">Connection Method</Label>
                            <div className="flex items-center gap-3 bg-muted/40 p-1.5 px-3 rounded-full border border-border/50 shadow-inner">
                                <span className={`text-[10px] font-bold uppercase tracking-tight transition-opacity ${method === 'browser' ? 'text-primary' : 'text-muted-foreground/40'}`}>Browser</span>
                                <Switch
                                    checked={method === 'cloud'}
                                    onCheckedChange={(checked) => setMethod(checked ? 'cloud' : 'browser')}
                                    className="data-[state=checked]:bg-primary h-5 w-9"
                                />
                                <span className={`text-[10px] font-bold uppercase tracking-tight transition-opacity ${method === 'cloud' ? 'text-primary' : 'text-muted-foreground/40'}`}>Cloud API</span>
                            </div>
                        </div>

                        <Separator orientation="vertical" className="h-10 mx-1 bg-border/50" />

                        <div className="flex flex-col items-end">
                            <Badge variant="outline" className={`py-1.5 px-4 flex items-center gap-2 border-0 ${method === 'cloud' ? (cloudCreds ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500') : (`${currentStatus.color}/10 text-foreground`)} font-bold shadow-sm h-10`}>
                                <div className={`h-2 w-2 rounded-full ${method === 'cloud' ? (cloudCreds ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-red-500') : currentStatus.color}`} />
                                {method === 'cloud' ? (cloudCreds ? 'Cloud Link Active' : 'Credentials Missing') : currentStatus.label}
                            </Badge>
                        </div>
                    </div>
                </div>

                {/* Main Content Area */}
                <Tabs defaultValue="general" className="flex-1 flex flex-col gap-4 overflow-hidden">
                    <TabsList className="bg-card border border-border p-1 h-12 w-fit">
                        <TabsTrigger value="general" className="gap-2 px-6 h-full data-[state=active]:bg-primary/10 data-[state=active]:text-primary font-bold transition-all uppercase text-[10px] tracking-widest">
                            <Cpu className="w-4 h-4" /> Core Status
                        </TabsTrigger>
                        <TabsTrigger value="automation" className="gap-2 px-6 h-full data-[state=active]:bg-primary/10 data-[state=active]:text-primary font-bold transition-all uppercase text-[10px] tracking-widest">
                            <Zap className="w-4 h-4" /> Automation
                        </TabsTrigger>
                        <TabsTrigger value="api" className="gap-2 px-6 h-full data-[state=active]:bg-primary/10 data-[state=active]:text-primary font-bold transition-all uppercase text-[10px] tracking-widest">
                            <Terminal className="w-4 h-4" /> Webhooks
                        </TabsTrigger>
                    </TabsList>

                    {/* General Tab */}
                    <TabsContent value="general" className="flex-1 overflow-y-auto space-y-4 focus-visible:ring-0">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

                            {/* Primary Connection Card */}
                            <Card className="lg:col-span-2 bg-card/50 border-border shadow-sm overflow-hidden flex flex-col min-h-[400px]">
                                <CardHeader className="border-b border-border/50 pb-4 bg-muted/5">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-1">
                                            <CardTitle className="text-base flex items-center gap-2">
                                                {method === 'cloud' ? <Globe className="w-4 h-4 text-primary" /> : <QrCode className="w-4 h-4 text-primary" />}
                                                {method === 'cloud' ? 'Cloud API Integration' : 'Browser Session Management'}
                                            </CardTitle>
                                            <CardDescription className="text-[10px] uppercase font-bold tracking-tight text-muted-foreground/60">
                                                {method === 'cloud' ? 'Official Meta Business Platform Connectivity' : 'High-Speed Web Instance Virtualization'}
                                            </CardDescription>
                                        </div>
                                        {method === 'browser' && status === 'open' && (
                                            <Button variant="ghost" size="sm" className="h-8 text-destructive hover:bg-destructive/10 font-bold gap-2" onClick={handleDisconnect}>
                                                <LogOut size={14} /> Kill Session
                                            </Button>
                                        )}
                                    </div>
                                </CardHeader>

                                <CardContent className="flex-1 flex flex-col items-center justify-center p-8">
                                    {method === 'cloud' ? (
                                        <AnimatePresence mode="wait">
                                            {cloudCreds ? (
                                                <motion.div
                                                    initial={{ opacity: 0, scale: 0.95 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    className="w-full space-y-8"
                                                >
                                                    <div className="flex flex-col items-center text-center space-y-4">
                                                        <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center border-2 border-emerald-500/30 text-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                                                            <CheckCircle2 className="w-8 h-8" />
                                                        </div>
                                                        <div>
                                                            <h3 className="text-lg font-black tracking-tight">Cloud Connection Verified</h3>
                                                            <p className="text-xs text-muted-foreground">Your Meta Business identifiers are correctly synchronized.</p>
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                        <div className="p-4 bg-muted/20 border border-border/50 rounded-xl space-y-2 group hover:border-primary/30 transition-colors">
                                                            <span className="text-[9px] uppercase font-black text-muted-foreground">Phone Number ID</span>
                                                            <code className="text-xs font-mono block truncate opacity-80 group-hover:opacity-100">{cloudCreds.phoneNumberId}</code>
                                                        </div>
                                                        <div className="p-4 bg-muted/20 border border-border/50 rounded-xl space-y-2 group hover:border-primary/30 transition-colors">
                                                            <span className="text-[9px] uppercase font-black text-muted-foreground">WABA ID</span>
                                                            <code className="text-xs font-mono block truncate opacity-80 group-hover:opacity-100">{cloudCreds.wabaId}</code>
                                                        </div>
                                                        <div className="p-4 bg-muted/20 border border-border/50 rounded-xl space-y-2 group hover:border-primary/30 transition-colors">
                                                            <span className="text-[9px] uppercase font-black text-muted-foreground">Access Token</span>
                                                            <code className="text-xs font-mono block truncate opacity-80 group-hover:opacity-100">{cloudCreds.accessToken}</code>
                                                        </div>
                                                    </div>

                                                    <div className="flex justify-center pt-4">
                                                        <Button
                                                            variant="outline"
                                                            className="gap-2 font-bold h-10 px-8 border-border hover:bg-primary/5 hover:border-primary/30"
                                                            onClick={() => setIsCredsModalOpen(true)}
                                                        >
                                                            <Settings size={14} /> Update Credentials
                                                        </Button>
                                                    </div>
                                                </motion.div>
                                            ) : (
                                                <div className="text-center space-y-6">
                                                    <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center border-2 border-red-500/20 text-red-500 mx-auto opacity-50">
                                                        <AlertCircle className="w-10 h-10" />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <h3 className="text-lg font-bold">Incomplete Configuration</h3>
                                                        <p className="text-xs text-muted-foreground max-w-xs mx-auto">Please provide your Meta Cloud API credentials to enable messaging.</p>
                                                    </div>
                                                    <Button variant="default" className="bg-primary hover:bg-primary/90 h-11 px-10 font-black gap-2">
                                                        <Plus size={16} /> Link Meta Account
                                                    </Button>
                                                </div>
                                            )}
                                        </AnimatePresence>
                                    ) : (
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
                                                            <RefreshCcw className="w-3 h-3 animate-spin" /> Auto-Refreshing
                                                        </Badge>
                                                    </div>
                                                </motion.div>
                                            ) : status === 'open' ? (
                                                <div className="text-center space-y-6">
                                                    <div className="w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center border-2 border-emerald-500/20 mx-auto group">
                                                        <CheckCircle2 className="w-12 h-12 text-emerald-500 group-hover:scale-110 transition-transform" />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <h3 className="text-lg font-black tracking-tight">Handshake Successful</h3>
                                                        <p className="text-xs text-muted-foreground max-w-[250px] mx-auto">Your browser session is virtualized and actively processing webhooks.</p>
                                                    </div>

                                                    {waUser && (
                                                        <div className="flex items-center gap-3 bg-muted/30 p-2 pr-4 rounded-full border border-border/50 max-w-fit mx-auto">
                                                            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-black text-sm">
                                                                {waUser.name?.charAt(0) || 'W'}
                                                            </div>
                                                            <div className="text-left">
                                                                <p className="text-[10px] font-black uppercase text-muted-foreground leading-none mb-1">Authenticated as</p>
                                                                <p className="text-xs font-bold leading-none">{waUser.name || 'WhatsApp Device'}</p>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="text-center space-y-6">
                                                    <div className="w-20 h-20 bg-muted/40 rounded-full flex items-center justify-center mx-auto border-2 border-dashed border-border opacity-50">
                                                        <Smartphone className="w-10 h-10 text-muted-foreground" />
                                                    </div>
                                                    <p className="text-xs text-muted-foreground font-medium">Capture a new session to begin self-hosted sync.</p>
                                                    <Button
                                                        className="bg-primary hover:bg-primary/90 h-11 px-10 font-black gap-2 shadow-[0_0_20px_rgba(var(--primary),0.3)] transition-all hover:scale-105"
                                                        onClick={handleConnect}
                                                        disabled={actionLoading || status === 'connecting'}
                                                    >
                                                        {status === 'connecting' ? <RefreshCcw className="w-4 h-4 animate-spin" /> : <Zap size={16} />}
                                                        Generate QR Sync
                                                    </Button>
                                                </div>
                                            )}
                                        </AnimatePresence>
                                    )}
                                </CardContent>

                                <CardFooter className="bg-muted/5 border-t border-border/50 px-6 py-4 flex justify-between items-center overflow-hidden">
                                    <div className="flex items-center gap-4">
                                        <div className="flex -space-x-2">
                                            {[1, 2, 3].map(i => <div key={i} className="w-6 h-6 rounded-full bg-card border-2 border-primary shadow-sm" />)}
                                        </div>
                                        <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">Active nodes supporting this method</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Badge variant="outline" className="text-[9px] border-border/50 h-6 px-3 bg-muted/20">v3.4.0 Engine</Badge>
                                        <Badge variant="outline" className="text-[9px] border-emerald-500/20 text-emerald-500 h-6 px-3 bg-emerald-500/5">Encrypted</Badge>
                                    </div>
                                </CardFooter>
                            </Card>

                            {/* Secondary Info Stack */}
                            <div className="space-y-4">
                                <Card className="bg-card/50 border-border shadow-sm p-5 space-y-6">
                                    <h4 className="text-xs font-black uppercase tracking-tighter flex items-center gap-2 text-primary">
                                        <Server size={14} /> Instance Metadata
                                    </h4>

                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between group">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500">
                                                    <Shield size={16} />
                                                </div>
                                                <span className="text-xs font-bold">App Security</span>
                                            </div>
                                            <Badge variant="outline" className="text-[9px] font-black border-blue-500/20 text-blue-500 bg-blue-500/5 uppercase">High-Grade</Badge>
                                        </div>

                                        <div className="flex items-center justify-between group">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                                                    <Clock size={16} />
                                                </div>
                                                <span className="text-xs font-bold">Latency Pool</span>
                                            </div>
                                            <Badge variant="outline" className="text-[9px] font-black border-emerald-500/20 text-emerald-500 bg-emerald-500/5 uppercase">0.4ms</Badge>
                                        </div>

                                        <div className="flex items-center justify-between group">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500">
                                                    <Globe size={16} />
                                                </div>
                                                <span className="text-xs font-bold">API Version</span>
                                            </div>
                                            <Badge variant="outline" className="text-[9px] font-black border-amber-500/20 text-amber-500 bg-amber-500/5 uppercase">v21.0</Badge>
                                        </div>
                                    </div>

                                    <Separator className="bg-border/50" />

                                    <Button variant="ghost" className="w-full justify-between text-xs font-bold group hover:bg-primary/5 hover:text-primary transition-all">
                                        Developer Documentation
                                        <ExternalLink size={14} className="opacity-40 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                                    </Button>
                                </Card>

                                <Card className="bg-primary/5 border border-primary/20 p-5 shadow-[inset_0_0_20px_rgba(0,0,0,0.1)]">
                                    <div className="flex gap-4">
                                        <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center shrink-0 border border-primary/30">
                                            <Zap size={20} className="text-primary" />
                                        </div>
                                        <div className="space-y-1">
                                            <h4 className="text-xs font-black uppercase tracking-widest text-primary">Priority Mode Enabled</h4>
                                            <p className="text-[11px] text-muted-foreground leading-relaxed font-medium">Your current {method} node is hosted on a priority bypass server, ensuring zero-queue delivery for critical transactional alerts.</p>
                                        </div>
                                    </div>
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
                                            Unified Responder
                                        </CardTitle>
                                        <Switch
                                            checked={metadata.autoResponderEnabled || false}
                                            onCheckedChange={(checked) => handleSaveMetadata({ autoResponderEnabled: checked })}
                                        />
                                    </div>
                                    <CardDescription className="text-xs">Automatically reply to all incoming messages across both Cloud & Browser methods.</CardDescription>
                                </CardHeader>
                                <CardContent className="p-4 space-y-6 pt-6">
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <Label className="text-sm font-semibold">AI Assistant Analysis</Label>
                                            <Switch
                                                checked={metadata.aiAssistantEnabled || false}
                                                onCheckedChange={(checked) => handleSaveMetadata({ aiAssistantEnabled: checked })}
                                            />
                                        </div>
                                        <p className="text-[11px] text-muted-foreground font-medium">Enable real-time intent analysis using LLMs before generating an automated response payload.</p>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between mb-1">
                                            <Label className="text-sm font-bold uppercase tracking-tight text-primary/80">Default Response Protocol</Label>
                                            <Badge variant="outline" className="text-[9px] h-5 opacity-40">Markdown Support Only</Badge>
                                        </div>
                                        <Textarea
                                            className="min-h-[140px] text-xs bg-muted/20 border-border/50 font-medium leading-relaxed"
                                            placeholder="Hello! Thanks for reaching out to Devlomatix. We've received your inquiry and our team will get back to you shortly."
                                            value={metadata.welcomeMessage || ''}
                                            onChange={(e) => setMetadata({ ...metadata, welcomeMessage: e.target.value })}
                                            onBlur={(e) => handleSaveMetadata({ welcomeMessage: e.target.value })}
                                        />
                                        <p className="text-[10px] text-muted-foreground italic bg-primary/5 p-2 rounded flex gap-2">
                                            <Info size={12} className="shrink-0" /> Shared Logic: This message is triggered for both official Cloud and custom BrowserSync instances.
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>

                            <div className="space-y-4">
                                <Card className="bg-card/50 border-border shadow-sm">
                                    <CardHeader className="pb-3 px-5">
                                        <CardTitle className="text-sm font-black flex items-center gap-2 uppercase tracking-tighter">
                                            <Send className="w-4 h-4 text-primary" />
                                            Developer Test Pool
                                        </CardTitle>
                                        <CardDescription className="text-[11px] font-medium italic opacity-70">Numbers whitelisted for direct server-to-client priority delivery.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4 px-5">
                                        <div className="flex gap-2 p-1.5 bg-muted/20 border border-border/50 rounded-xl">
                                            <Input
                                                placeholder="e.g. 919876543210"
                                                value={newNumber}
                                                onChange={(e) => setNewNumber(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && handleAddNumber()}
                                                className="bg-transparent border-0 h-9 text-xs focus-visible:ring-0 shadow-none font-bold"
                                            />
                                            <Button size="sm" onClick={handleAddNumber} className="h-9 px-4 bg-primary hover:bg-primary/90 font-black shadow-lg">
                                                ADD
                                            </Button>
                                        </div>
                                        <div className="flex flex-wrap gap-2 min-h-[60px] p-2 bg-muted/10 rounded-lg">
                                            {(metadata.testNumbers || []).map((num) => (
                                                <Badge key={num} variant="secondary" className="pl-4 pr-1.5 py-1.5 gap-2 border border-border/50 bg-card hover:border-primary/50 transition-all font-mono text-[10px] shadow-sm">
                                                    {num}
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-5 w-5 hover:bg-destructive/20 hover:text-destructive transition-colors rounded-full"
                                                        onClick={() => handleRemoveNumber(num)}
                                                    >
                                                        <Trash2 className="h-3 w-3" />
                                                    </Button>
                                                </Badge>
                                            ))}
                                            {(metadata.testNumbers || []).length === 0 && (
                                                <div className="w-full flex flex-col items-center justify-center py-4 space-y-1 opacity-20">
                                                    <Smartphone size={24} />
                                                    <p className="text-[10px] font-black uppercase tracking-widest">No active test targets</p>
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>

                                <div className="grid grid-cols-2 gap-4">
                                    <Card className="bg-card/50 border-border p-4 space-y-2">
                                        <Clock size={16} className="text-primary/50" />
                                        <h5 className="text-[10px] font-black uppercase text-muted-foreground">Rate Limit</h5>
                                        <p className="text-xs font-bold">No Limit (Test)</p>
                                    </Card>
                                    <Card className="bg-card/50 border-border p-4 space-y-2">
                                        <Shield size={16} className="text-primary/50" />
                                        <h5 className="text-[10px] font-black uppercase text-muted-foreground">Protocol</h5>
                                        <p className="text-xs font-bold">HTTPS/GCM</p>
                                    </Card>
                                </div>
                            </div>
                        </div>
                    </TabsContent>

                    {/* API & Webhook Tab */}
                    <TabsContent value="api" className="flex-1 overflow-y-auto space-y-4 focus-visible:ring-0">
                        <Card className="bg-card/50 border-border shadow-sm">
                            <CardHeader className="border-b border-border/50 pb-4 bg-muted/5">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <CardTitle className="text-base flex items-center gap-3">
                                            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center border border-primary/20">
                                                <Globe className="w-4 h-4 text-primary" />
                                            </div>
                                            Ingress Gateway Configuration
                                        </CardTitle>
                                        <CardDescription className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 px-11">Unified Event Polling Interface (Webhook)</CardDescription>
                                    </div>
                                    <Badge variant="outline" className="border-emerald-500/20 text-emerald-500 bg-emerald-500/5 h-6 px-4 font-black text-[9px] uppercase tracking-widest">Global Endpoint</Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="p-8 space-y-8">
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <Label className="text-[11px] font-black uppercase tracking-widest text-primary/80">Production Webhook Absolute URL</Label>
                                        <span className="text-[9px] font-bold opacity-30 italic">POST Requests Only</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <div className="relative flex-1 group">
                                            <Input readOnly value={webhookUrl} className="bg-muted/30 border-border/50 font-mono text-[11px] pr-12 h-12 cursor-default focus:ring-0 font-bold opacity-70 group-hover:opacity-100 transition-opacity" />
                                            <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                                                <Globe className="w-4 h-4 text-primary/30 group-hover:text-primary transition-colors" />
                                            </div>
                                        </div>
                                        <Button
                                            variant="outline"
                                            className="h-12 w-12 border-border hover:bg-primary/5 hover:border-primary/50 transition-all shadow-lg"
                                            onClick={() => copyToClipboard(webhookUrl)}
                                        >
                                            {copied ? <Check className="w-5 h-5 text-emerald-500" /> : <Copy className="w-5 h-5" />}
                                        </Button>
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-3 gap-6">
                                    <div className="p-5 bg-card border border-border/50 rounded-2xl space-y-4 shadow-sm group hover:border-primary/30 transition-all">
                                        <h5 className="text-[10px] font-black uppercase text-primary tracking-widest flex items-center gap-2">
                                            <Lock size={12} /> Payload Security
                                        </h5>
                                        <p className="text-[11px] text-muted-foreground leading-relaxed font-medium">Incoming request bodies are automatically decrypted using your project-wide symmetric keys.</p>
                                        <div className="p-2 bg-muted/60 rounded-lg text-[9px] font-mono opacity-60">AES-256-GCM / IV</div>
                                    </div>

                                    <div className="p-5 bg-card border border-border/50 rounded-2xl space-y-4 shadow-sm group hover:border-primary/30 transition-all">
                                        <h5 className="text-[10px] font-black uppercase text-primary tracking-widest flex items-center gap-2">
                                            <Smartphone size={12} /> JID Translation
                                        </h5>
                                        <p className="text-[11px] text-muted-foreground leading-relaxed font-medium">The engine automatically translates standard phone numbers into WhatsApp Identifiers (JIDs).</p>
                                        <div className="p-2 bg-muted/60 rounded-lg text-[9px] font-mono opacity-60">format: number@s.wa.net</div>
                                    </div>

                                    <div className="p-5 bg-card border border-border/50 rounded-2xl space-y-4 shadow-sm group hover:border-primary/30 transition-all">
                                        <h5 className="text-[10px] font-black uppercase text-primary tracking-widest flex items-center gap-2">
                                            <Zap size={12} /> Event Routing
                                        </h5>
                                        <p className="text-[11px] text-muted-foreground leading-relaxed font-medium">Webhooks are processed through the Bot Flow Builder logic in real-time with zero queue lag.</p>
                                        <div className="p-2 bg-muted/60 rounded-lg text-[9px] font-mono opacity-60">Latency: ~40ms - 150ms</div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>

                {/* Cloud Credentials Modal */}
                <Dialog open={isCredsModalOpen} onOpenChange={setIsCredsModalOpen}>
                    <DialogContent className="sm:max-w-[425px] bg-card border-border shadow-2xl">
                        <DialogHeader>
                            <DialogTitle className="text-xl font-black flex items-center gap-2">
                                <Globe className="text-primary h-5 w-5" />
                                Meta Cloud API Setup
                            </DialogTitle>
                            <DialogDescription className="text-xs font-medium">
                                Provide your official Meta Business credentials to enable Cloud messaging.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="phoneId" className="text-xs font-bold uppercase tracking-tighter opacity-70">Phone Number ID</Label>
                                <Input
                                    id="phoneId"
                                    placeholder="e.g. 10492837482"
                                    value={tempCreds.phoneNumberId}
                                    onChange={(e) => setTempCreds({ ...tempCreds, phoneNumberId: e.target.value })}
                                    className="bg-muted/30 border-border/50 h-10 text-xs font-mono"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="wabaId" className="text-xs font-bold uppercase tracking-tighter opacity-70">WABA ID (Business Account ID)</Label>
                                <Input
                                    id="wabaId"
                                    placeholder="e.g. 92837465019"
                                    value={tempCreds.wabaId}
                                    onChange={(e) => setTempCreds({ ...tempCreds, wabaId: e.target.value })}
                                    className="bg-muted/30 border-border/50 h-10 text-xs font-mono"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="token" className="text-xs font-bold uppercase tracking-tighter opacity-70">Permanent Access Token</Label>
                                <Textarea
                                    id="token"
                                    placeholder="EAAGz..."
                                    value={tempCreds.accessToken}
                                    onChange={(e) => setTempCreds({ ...tempCreds, accessToken: e.target.value })}
                                    className="bg-muted/30 border-border/50 min-h-[100px] text-xs font-mono"
                                />
                                <p className="text-[10px] text-muted-foreground italic">Use a Permanent System User token from Meta Developer Portal.</p>
                            </div>
                        </div>
                        <DialogFooter className="pt-4 border-t border-border/50">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setIsCredsModalOpen(false)}
                                className="font-bold h-10 border border-transparent hover:border-border"
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="default"
                                size="sm"
                                onClick={handleSaveCloudCreds}
                                disabled={cloudLoading}
                                className="bg-primary hover:bg-primary/90 font-black h-10 px-8 shadow-lg"
                            >
                                {cloudLoading ? <RefreshCcw className="w-4 h-4 animate-spin" /> : 'Save Credentials'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </TooltipProvider>
    );
}

function Info(props) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <circle cx="12" cy="12" r="10" />
            <path d="M12 16v-4" />
            <path d="M12 8h.01" />
        </svg>
    )
}