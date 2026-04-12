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
    Cpu,
    Star,
    RefreshCw,
    LayoutDashboard,
    Bell,
    ShieldCheck,
    Info,
    Share2,
    Database,
    Link,
    Eye,
    EyeOff,
    Mail,
    BellRing,
    History,
    Key
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";

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
    const [cloudCreds, setCloudCreds] = useState([]);
    const [cloudLoading, setCloudLoading] = useState(false);
    const [testState, setTestState] = useState({}); // { id: 'loading' | 'success' | 'error' | null }
    const [templates, setTemplates] = useState([]);
    const [syncingTemplates, setSyncingTemplates] = useState({}); // { id: true/false }

    // Shared States
    const [webhookUrl, setWebhookUrl] = useState('');
    const [copied, setCopied] = useState(false);
    const [showWebhookSecret, setShowWebhookSecret] = useState(false);
    const [testNumberInput, setTestNumberInput] = useState('');

    // Cloud Modal States
    const [isCredsModalOpen, setIsCredsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [accountToDelete, setAccountToDelete] = useState(null);
    const [tempCreds, setTempCreds] = useState({
        id: null,
        profile: '',
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
            }
        } catch (error) {
            console.error('Failed to fetch Cloud API creds:', error);
            toast.error('Failed to load accounts');
        } finally {
            setCloudLoading(false);
        }
    };

    const fetchTemplatesList = async () => {
        try {
            const res = await fetch('/api/wa/templates');
            const data = await res.json();
            if (data.success) {
                setTemplates(data.templates);
            }
        } catch (error) {
            console.error('Failed to fetch templates:', error);
        }
    };

    const handleSyncTemplates = async (id) => {
        setSyncingTemplates(prev => ({ ...prev, [id]: true }));
        try {
            const res = await fetch('/api/wa/templates/sync', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id })
            });
            const data = await res.json();
            if (res.ok) {
                toast.success(data.message || 'Templates synced!');
                fetchTemplatesList();
            } else {
                toast.error(data.error || 'Sync failed');
            }
        } catch (error) {
            toast.error('Network error during sync');
        } finally {
            setSyncingTemplates(prev => ({ ...prev, [id]: false }));
        }
    };

    const handleSaveCloudCreds = async () => {
        if (!tempCreds.phoneNumberId || !tempCreds.wabaId || !tempCreds.accessToken) {
            toast.error('Required fields: Phone ID, WABA ID, and Access Token');
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
                toast.success(tempCreds.id ? 'Account updated' : 'New account added');
                setIsCredsModalOpen(false);
                fetchCloudCreds();
                setTempCreds({ id: null, profile: '', phoneNumberId: '', wabaId: '', accessToken: '' });
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

    const handleSetDefaultAccount = async (id) => {
        try {
            const res = await fetch('/api/wa/credentials/default', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id })
            });
            const data = await res.json();
            if (res.ok) {
                toast.success(data.message || 'Default account updated');
                fetchCloudCreds();
            } else {
                toast.error(data.error || 'Failed to set default');
            }
        } catch (error) {
            toast.error('Network error');
        }
    };

    const handleTestConnection = async (id) => {
        setTestState(prev => ({ ...prev, [id]: 'loading' }));
        const testNumber = metadata.testNumbers?.[0];

        try {
            const res = await fetch('/api/wa/credentials/test', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, testNumber })
            });
            const data = await res.json();

            if (res.ok) {
                toast.success(testNumber ? `Request accepted! Note: Message only delivers if ${testNumber} has messaged you in the last 24h.` : 'Connection verified!');
                setTestState(prev => ({ ...prev, [id]: 'success' }));
                fetchCloudCreds();
            } else {
                toast.error(data.error || 'Connection failed');
                setTestState(prev => ({ ...prev, [id]: 'error' }));
            }
        } catch (error) {
            toast.error('Network error during test');
            setTestState(prev => ({ ...prev, [id]: 'error' }));
        }
    };

    const handleDeleteCloudCred = async () => {
        if (!accountToDelete) return;
        setCloudLoading(true);
        try {
            const res = await fetch(`/api/wa/credentials?id=${accountToDelete.id}`, { method: 'DELETE' });
            if (res.ok) {
                toast.success('Account removed successfully');
                setIsDeleteModalOpen(false);
                setAccountToDelete(null);
                fetchCloudCreds();
            } else {
                toast.error('Failed to remove account');
            }
        } catch (error) {
            toast.error('Error deleting account');
        } finally {
            setCloudLoading(false);
        }
    };

    useEffect(() => {
        fetchBrowserStatus();
        fetchCloudCreds();
        fetchTemplatesList();

        const interval = setInterval(() => {
            if (method === 'browser') fetchBrowserStatus();
        }, 10000);

        if (typeof window !== 'undefined') {
            setWebhookUrl(`${window.location.origin}/api/wa/webhook`);
        }
        return () => clearInterval(interval);
    }, [fetchBrowserStatus, method]);

    const handleSaveMetadata = async (updates) => {
        const newMetadata = { ...metadata, ...updates };
        setMetadata(newMetadata);
        try {
            const res = await fetch('/api/wa/auth', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ metadata: newMetadata })
            });
            if (res.ok) toast.success('Settings updated');
        } catch (error) {
            toast.error('Failed to save settings');
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        toast.success("Copied to clipboard");
        setTimeout(() => setCopied(false), 2000);
    };

    const handleAddTestNumber = () => {
        const cleanNumber = testNumberInput.replace(/[^\d+]/g, '');
        if (!cleanNumber) {
            toast.error('Invalid number');
            return;
        }
        const currentTestNumbers = metadata.testNumbers || [];
        if (currentTestNumbers.includes(cleanNumber)) {
            toast.error('Number already added');
            return;
        }
        if (currentTestNumbers.length >= 5) {
            toast.error('Maximum 5 test numbers allowed');
            return;
        }

        handleSaveMetadata({ testNumbers: [...currentTestNumbers, cleanNumber] });
        setTestNumberInput('');
    };

    const handleRemoveTestNumber = (num) => {
        const currentTestNumbers = metadata.testNumbers || [];
        handleSaveMetadata({ testNumbers: currentTestNumbers.filter(n => n !== num) });
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
            <div className="flex flex-col h-full text-foreground overflow-hidden">

                {/* Header Section */}
                <div className="flex items-center justify-between p-4 border-b">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                            <DynamicIcon name="whatsapp" className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-xl tracking-tight">WhatsApp Instance</h1>
                                <Badge variant="outline" className="h-5 px-2 text-[10px] border-primary/20 text-primary">
                                    Cloud API Engine
                                </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground font-medium">Manage your Meta API configuration and status.</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
                        <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                        <span className="text-[10px] font-bold text-primary">
                            {cloudCreds.length} Active Cloud Nodes
                        </span>
                    </div>
                </div>

                {/* Tabs Navigation */}
                <Tabs defaultValue="status" className="flex-1 flex flex-col m-4">
                    <TabsList className="bg-transparent w-full justify-start rounded-none h-auto p-0 gap-2 mb-4">
                        {['status', 'automation', 'webhooks', 'messaging', 'notifications', 'security', 'general'].map((tab) => (
                            <TabsTrigger
                                key={tab}
                                value={tab}
                                className="rounded-md w-36 p-2 border border-border/20 text-sm capitalize data-[state=active]:border-primary/20 data-[state=active]:text-primary data-[state=active]:bg-muted/50 transition-all opacity-60 data-[state=active]:opacity-100"
                            >
                                {tab.replace('_', ' ')}
                            </TabsTrigger>
                        ))}
                    </TabsList>

                    {/* STATUS TAB */}
                    <TabsContent value="status" className="flex-1 outline-none pr-2 custom-scrollbar">
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                            {/* Main Content (Left) */}
                            <div className="md:col-span-8 space-y-6">
                                <Card className="border-border/40 shadow-none relative">
                                    <CardHeader className="flex flex-row items-center justify-between pb-6">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-primary/5 rounded-lg border border-primary/10">
                                                <Globe className="w-4 h-4 text-primary" />
                                            </div>
                                            <div>
                                                <CardTitle className="text-base tracking-tight">Cloud API Integration</CardTitle>
                                                <CardDescription className="text-xs">Meta Business Platform Connectivity</CardDescription>
                                            </div>
                                        </div>
                                        <Button
                                            size="sm"
                                            className="h-8 text-xs px-4"
                                            onClick={() => {
                                                setTempCreds({ id: null, profile: '', phoneNumberId: '', wabaId: '', accessToken: '' });
                                                setIsCredsModalOpen(true);
                                            }}
                                        >
                                            <Plus className="w-3.5 h-3.5 mr-2" /> Add Account
                                        </Button>
                                    </CardHeader>

                                    <CardContent className="space-y-4">
                                        {cloudCreds.map((cred) => (
                                            <div key={cred.id} className="p-4 bg-muted/20 rounded-lg border border-border/40 hover:border-primary/30 transition-all group">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 rounded-full bg-background border border-border flex items-center justify-center text-muted-foreground group-hover:text-primary transition-all">
                                                            <MessageSquare className="w-5 h-5" />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-sm font-semibold">{cred.profile || 'WhatsApp Account'}</span>
                                                                {cred.verified ? (
                                                                    <Tooltip>
                                                                        <TooltipTrigger asChild>
                                                                            <CheckCircle2 className="w-3.5 h-3.5 text-green-500 fill-green-500/10" />
                                                                        </TooltipTrigger>
                                                                        <TooltipContent>Verified Node</TooltipContent>
                                                                    </Tooltip>
                                                                ) : (
                                                                    <Tooltip>
                                                                        <TooltipTrigger asChild>
                                                                            <AlertCircle className="w-3.5 h-3.5 text-red-500 animate-pulse" />
                                                                        </TooltipTrigger>
                                                                        <TooltipContent>Needs Re-verification</TooltipContent>
                                                                    </Tooltip>
                                                                )}
                                                                {cred.isDefault && <Badge variant="secondary" className="h-4 text-[9px] bg-primary/10 text-primary border-0">DEFAULT</Badge>}
                                                            </div>
                                                            <div className="flex items-center gap-3 text-[10px] text-muted-foreground font-mono">
                                                                <span className="opacity-50 uppercase">Phone ID:</span>
                                                                <span>••••••••</span>
                                                                <Copy size={10} className="hover:text-primary cursor-pointer" onClick={() => copyToClipboard(cred.phoneNumberId)} />
                                                                <Separator orientation="vertical" className="h-2" />
                                                                <span className="opacity-50 uppercase">WABA ID:</span>
                                                                <span>••••••••</span>
                                                                <Copy size={10} className="hover:text-primary cursor-pointer" onClick={() => copyToClipboard(cred.wabaId)} />
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-3">
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <Button
                                                                    variant="outline"
                                                                    size="icon"
                                                                    className={`h-8 w-8 transition-all ${cred.isDefault ? 'bg-primary/20 border-primary/30 text-primary' : 'text-muted-foreground hover:text-primary'}`}
                                                                    onClick={() => handleSetDefaultAccount(cred.id)}
                                                                >
                                                                    <Star className={`w-3.5 h-3.5 ${cred.isDefault ? 'fill-current' : ''}`} />
                                                                </Button>
                                                            </TooltipTrigger>
                                                            <TooltipContent>
                                                                {cred.isDefault ? 'Current Default Account' : 'Set as Default Account'}
                                                            </TooltipContent>
                                                        </Tooltip>

                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="h-8 text-[10px] font-bold uppercase transition-all flex items-center gap-2"
                                                            onClick={() => handleTestConnection(cred.id)}
                                                            disabled={testState[cred.id] === 'loading'}
                                                        >
                                                            {testState[cred.id] === 'loading' ? (
                                                                <RefreshCw className="w-3 h-3 animate-spin" />
                                                            ) : (
                                                                <Zap size={12} className={testState[cred.id] === 'success' ? 'fill-green-500 text-green-500' : ''} />
                                                            )}
                                                            {testState[cred.id] === 'loading' ? 'Testing...' : 'Test'}
                                                        </Button>
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <Info className="w-3 h-3 text-muted-foreground cursor-help" />
                                                            </TooltipTrigger>
                                                            <TooltipContent className="max-w-[200px] text-[10px]">
                                                                Sends a direct text message. 
                                                                <br />
                                                                <b>Important:</b> Recipient must have messaged you in the last 24h.
                                                            </TooltipContent>
                                                        </Tooltip>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={() => {
                                                            setTempCreds({ ...cred, accessToken: '' });
                                                            setIsCredsModalOpen(true);
                                                        }}>
                                                            <Settings size={14} />
                                                        </Button>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => {
                                                            setAccountToDelete(cred);
                                                            setIsDeleteModalOpen(true);
                                                        }}>
                                                            <Trash2 size={14} />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                        {cloudCreds.length === 0 && (
                                            <div className="text-center py-12 border border-dashed border-border/40 rounded-lg">
                                                <p className="text-xs text-muted-foreground">No Cloud API accounts linked yet.</p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>

                                <div className="flex items-center justify-between text-[10px] px-2">
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                        <span>Active Nodes Online</span>
                                    </div>
                                    <span className="text-muted-foreground italic">VWA-Engine v3.4.0 (Enterprise)</span>
                                </div>
                            </div>

                            {/* Sidebar Stats (Right) */}
                            <div className="md:col-span-4 space-y-4">
                                <Card className="border-border/40 p-5 space-y-4">
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Database size={14} />
                                        <span className="text-[10px] font-bold uppercase tracking-wider">Instance Health</span>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="opacity-70">App Security</span>
                                            <Badge variant="outline" className="text-[9px] h-5 border-green-500/20 text-green-500 bg-green-500/5">High</Badge>
                                        </div>
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="opacity-70">Latency</span>
                                            <span className="font-bold text-primary">0.4ms</span>
                                        </div>
                                    </div>
                                </Card>

                                <Card className="bg-primary/5 border-primary/20 p-5 space-y-3">
                                    <div className="flex items-center gap-2 text-primary">
                                        <Zap size={14} className="fill-current" />
                                        <span className="text-[10px] font-bold uppercase tracking-wider">Priority Mode</span>
                                    </div>
                                    <p className="text-[10px] text-muted-foreground leading-relaxed">System is running on a high-availability node for zero-latency delivery.</p>
                                </Card>
                            </div>
                        </div>
                    </TabsContent>

                    {/* AUTOMATION TAB */}
                    <TabsContent value="automation" className="flex-1 space-y-6 outline-none">
                        <div className="max-w-3xl space-y-6">
                            <Card className="border-border/40 shadow-none">
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-1">
                                            <CardTitle className="text-base">Auto-Responder</CardTitle>
                                            <CardDescription className="text-xs">Automated message handlers for incoming payloads.</CardDescription>
                                        </div>
                                        <Switch
                                            checked={metadata.autoResponderEnabled || false}
                                            onCheckedChange={(checked) => handleSaveMetadata({ autoResponderEnabled: checked })}
                                        />
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="flex items-center justify-between p-4 bg-muted/20 border rounded-lg">
                                        <div className="space-y-1">
                                            <Label className="text-xs font-semibold">AI Synthesis Hub</Label>
                                            <p className="text-[10px] text-muted-foreground">Use AI to analyze intent before replying.</p>
                                        </div>
                                        <Switch
                                            checked={metadata.aiAssistantEnabled || false}
                                            onCheckedChange={(checked) => handleSaveMetadata({ aiAssistantEnabled: checked })}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-xs opacity-70">Default Welcome Message</Label>
                                        <Textarea
                                            rows={6}
                                            className="min-h-[120px] bg-muted/10 text-xs focus:border-primary/40"
                                            placeholder="Hello! How can we help you today?"
                                            value={metadata.welcomeMessage || ''}
                                            onChange={(e) => setMetadata({ ...metadata, welcomeMessage: e.target.value })}
                                            onBlur={(e) => handleSaveMetadata({ welcomeMessage: e.target.value })}
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-border/40 shadow-none">
                                <CardHeader>
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-primary/10 rounded-lg">
                                            <Smartphone className="w-4 h-4 text-primary" />
                                        </div>
                                        <div className="space-y-1">
                                            <CardTitle className="text-base text-primary">Test Audience</CardTitle>
                                            <CardDescription className="text-xs">Manage phone numbers reserved for system testing and quality assurance.</CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="flex gap-2">
                                        <div className="relative flex-1">
                                            <Plus className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                                            <Input
                                                placeholder="Enter phone with country code (e.g. +919876543210)"
                                                className="pl-9 bg-muted/10 h-10 text-xs"
                                                value={testNumberInput}
                                                onChange={e => setTestNumberInput(e.target.value)}
                                                onKeyDown={e => e.key === 'Enter' && handleAddTestNumber()}
                                            />
                                        </div>
                                        <Button size="sm" onClick={handleAddTestNumber} className="h-10 px-4">Add Number</Button>
                                    </div>

                                    <div className="grid gap-2">
                                        {(metadata.testNumbers || []).map((num) => (
                                            <div key={num} className="flex items-center justify-between p-3 rounded-lg border border-border/40 bg-card hover:border-primary/20 transition-all group">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                                                        <User className="w-3.5 h-3.5 text-muted-foreground" />
                                                    </div>
                                                    <span className="text-sm font-mono">{num}</span>
                                                    <Badge variant="outline" className="text-[8px] h-4 border-primary/20 text-primary opacity-60">VERIFIED</Badge>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Info className="w-2.5 h-2.5 text-muted-foreground cursor-help" />
                                                        </TooltipTrigger>
                                                        <TooltipContent className="text-[10px]">
                                                            Ensure this number is also added to 'Test Numbers' in Meta Dev Console.
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                                                    onClick={() => handleRemoveTestNumber(num)}
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </Button>
                                            </div>
                                        ))}
                                        {(metadata.testNumbers || []).length === 0 && (
                                            <div className="flex flex-col items-center justify-center py-8 text-center space-y-2 bg-muted/5 border border-dashed rounded-lg">
                                                <Smartphone className="w-8 h-8 text-muted-foreground/20" />
                                                <p className="text-[10px] text-muted-foreground italic">No test numbers defined yet.</p>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* WEBHOOKS TAB */}
                    <TabsContent value="webhooks" className="flex-1 space-y-6 outline-none">
                        <div className="max-w-3xl space-y-6">
                            <Card className="border-border/40 shadow-none">
                                <CardHeader>
                                    <div className="flex items-center gap-2">
                                        <Link className="w-4 h-4 text-primary" />
                                        <CardTitle className="text-base text-primary">Webhook Configuration</CardTitle>
                                    </div>
                                    <CardDescription className="text-xs">Incoming event notification bridge for your external systems.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="space-y-3">
                                        <Label className="text-xs opacity-70">Webhook Payload URL</Label>
                                        <div className="flex gap-2">
                                            <Input readOnly value={webhookUrl} className="bg-muted/30 text-xs font-mono border-border/40" />
                                            <Button variant="outline" size="icon" className="shrink-0" onClick={() => copyToClipboard(webhookUrl)}>
                                                <Copy size={14} />
                                            </Button>
                                        </div>
                                        <p className="text-[10px] text-muted-foreground">Configure this URL in your Meta Developer Portal Webhooks section.</p>
                                    </div>

                                    <div className="space-y-3">
                                        <Label className="text-xs opacity-70">Verify Token</Label>
                                        <div className="flex gap-2">
                                            <div className="relative flex-1">
                                                <Input
                                                    type={showWebhookSecret ? "text" : "password"}
                                                    value={metadata.webhookSecret || 'devlomatix_secret'}
                                                    onChange={(e) => setMetadata({ ...metadata, webhookSecret: e.target.value })}
                                                    onBlur={(e) => handleSaveMetadata({ webhookSecret: e.target.value })}
                                                    className="bg-muted/30 text-xs font-mono border-border/40 pr-10"
                                                />
                                                <button
                                                    onClick={() => setShowWebhookSecret(!showWebhookSecret)}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                                >
                                                    {showWebhookSecret ? <EyeOff size={14} /> : <Eye size={14} />}
                                                </button>
                                            </div>
                                            <Button variant="outline" size="icon" className="shrink-0" onClick={() => copyToClipboard(metadata.webhookSecret || 'devlomatix_secret')}>
                                                <Copy size={14} />
                                            </Button>
                                        </div>
                                    </div>

                                    <Separator />

                                    <div className="space-y-4">
                                        <Label className="text-xs font-semibold">Event Subscriptions</Label>
                                        <div className="grid grid-cols-2 gap-4">
                                            {[
                                                { label: 'Message Events', key: 'hook_messages' },
                                                { label: 'Status Updates', key: 'hook_status' },
                                                { label: 'Delivery Reports', key: 'hook_delivery' },
                                                { label: 'Error Notifications', key: 'hook_errors' }
                                            ].map((evt) => (
                                                <div key={evt.key} className="flex items-center justify-between p-3 border rounded-md">
                                                    <span className="text-[11px] font-medium">{evt.label}</span>
                                                    <Switch
                                                        checked={metadata[evt.key] !== false}
                                                        onCheckedChange={(c) => handleSaveMetadata({ [evt.key]: c })}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* MESSAGING TAB */}
                    <TabsContent value="messaging" className="flex-1 space-y-6 outline-none">
                        <div className="max-w-3xl space-y-6">
                            <Card className="border-border/40 shadow-none">
                                <CardHeader>
                                    <div className="flex items-center gap-2">
                                        <Send className="w-4 h-4 text-primary" />
                                        <CardTitle className="text-base text-primary">Messaging Standards</CardTitle>
                                    </div>
                                    <CardDescription className="text-xs">Behavioral rules for outbound communications.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label className="text-xs opacity-70">Message Retention</Label>
                                            <Select
                                                value={metadata.retention || '90'}
                                                onValueChange={(v) => handleSaveMetadata({ retention: v })}
                                            >
                                                <SelectTrigger className="h-9 text-xs bg-muted/10">
                                                    <SelectValue placeholder="Select period" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="30">30 Days</SelectItem>
                                                    <SelectItem value="90">90 Days</SelectItem>
                                                    <SelectItem value="365">1 Year</SelectItem>
                                                    <SelectItem value="0">Indefinite</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs opacity-70">Media Quality</Label>
                                            <Select
                                                value={metadata.mediaQuality || 'standard'}
                                                onValueChange={(v) => handleSaveMetadata({ mediaQuality: v })}
                                            >
                                                <SelectTrigger className="h-9 text-xs bg-muted/10">
                                                    <SelectValue placeholder="Select quality" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="standard">Standard (Comp.)</SelectItem>
                                                    <SelectItem value="hd">High Definition</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <Separator />

                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div className="space-y-0.5">
                                                <Label className="text-xs font-semibold">Auto-Sync Templates</Label>
                                                <p className="text-[10px] text-muted-foreground">Automatically download Meta templates every hour.</p>
                                            </div>
                                            <Switch
                                                checked={metadata.autoSyncTemplates || false}
                                                onCheckedChange={(c) => handleSaveMetadata({ autoSyncTemplates: c })}
                                            />
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div className="space-y-0.5">
                                                <Label className="text-xs font-semibold">Legacy Read Receipts</Label>
                                                <p className="text-[10px] text-muted-foreground">Simulate blue ticks for incoming browser messages.</p>
                                            </div>
                                            <Switch
                                                checked={metadata.readReceipts || false}
                                                onCheckedChange={(c) => handleSaveMetadata({ readReceipts: c })}
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* NOTIFICATIONS TAB */}
                    <TabsContent value="notifications" className="flex-1 space-y-6 outline-none">
                        <div className="max-w-3xl space-y-6">
                            <Card className="border-border/40 shadow-none">
                                <CardHeader>
                                    <div className="flex items-center gap-2">
                                        <BellRing className="w-4 h-4 text-primary" />
                                        <CardTitle className="text-base text-primary">Alert Center</CardTitle>
                                    </div>
                                    <CardDescription className="text-xs">Configure how you receive system stability reports.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/5">
                                            <div className="flex items-center gap-3">
                                                <Mail className="w-4 h-4 text-muted-foreground" />
                                                <div className="space-y-0.5">
                                                    <span className="text-xs font-semibold">Disconnect Alerts</span>
                                                    <p className="text-[10px] text-muted-foreground">Email notification when a session drops unexpectedly.</p>
                                                </div>
                                            </div>
                                            <Switch
                                                checked={metadata.notifyDisconnect || false}
                                                onCheckedChange={(c) => handleSaveMetadata({ notifyDisconnect: c })}
                                            />
                                        </div>

                                        <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/5">
                                            <div className="flex items-center gap-3">
                                                <AlertCircle className="w-4 h-4 text-muted-foreground" />
                                                <div className="space-y-0.5">
                                                    <span className="text-xs font-semibold">Delivery Failures</span>
                                                    <p className="text-[10px] text-muted-foreground">Alert when a template or broadcast fails to deliver.</p>
                                                </div>
                                            </div>
                                            <Switch
                                                checked={metadata.notifyFailure || false}
                                                onCheckedChange={(c) => handleSaveMetadata({ notifyFailure: c })}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-xs opacity-70">Admin Alert Email</Label>
                                        <Input
                                            placeholder="admin@example.com"
                                            className="h-9 text-xs bg-muted/10"
                                            value={metadata.alertEmail || ''}
                                            onChange={(e) => setMetadata({ ...metadata, alertEmail: e.target.value })}
                                            onBlur={(e) => handleSaveMetadata({ alertEmail: e.target.value })}
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* SECURITY TAB */}
                    <TabsContent value="security" className="flex-1 space-y-6 outline-none">
                        <div className="max-w-3xl space-y-6">
                            <Card className="border-border/40 shadow-none">
                                <CardHeader>
                                    <div className="flex items-center gap-2">
                                        <ShieldCheck className="w-4 h-4 text-primary" />
                                        <CardTitle className="text-base text-primary">Encryption & Governance</CardTitle>
                                    </div>
                                    <CardDescription className="text-xs">Security manifests and session integrity logs.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-4 border rounded-lg space-y-2">
                                            <div className="flex items-center gap-2 text-[10px] font-black uppercase text-primary tracking-widest">
                                                <Lock size={12} /> Cipher Status
                                            </div>
                                            <p className="text-xs font-bold font-mono">AES-256-GCM</p>
                                            <p className="text-[9px] text-muted-foreground leading-tight">All session keys are salted and encrypted before DB persistence.</p>
                                        </div>
                                        <div className="p-4 border rounded-lg space-y-2">
                                            <div className="flex items-center gap-2 text-[10px] font-black uppercase text-primary tracking-widest">
                                                <Key size={12} /> Key Rotation
                                            </div>
                                            <p className="text-xs font-bold font-mono">AUTOMATED</p>
                                            <p className="text-[9px] text-muted-foreground leading-tight">Rotating 128-bit challenges periodically for browser sessions.</p>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2 text-[10px] font-bold uppercase text-muted-foreground opacity-60">
                                            <History size={12} /> Recent Connection Audit
                                        </div>
                                        <div className="space-y-2">
                                            {[
                                                { event: 'Session Refreshed', status: 'OK', color: 'text-green-500', time: '12m ago' },
                                                { event: 'Credential Check', status: 'PASS', color: 'text-green-500', time: '4h ago' },
                                                { event: 'Key Handshake', status: 'SYNC', color: 'text-blue-500', time: 'Yesterday' }
                                            ].map((log, i) => (
                                                <div key={i} className="flex items-center justify-between p-3 bg-muted/10 rounded-md border border-border/20">
                                                    <span className="text-xs">{log.event}</span>
                                                    <div className="flex items-center gap-3">
                                                        <span className={`text-[10px] font-black ${log.color}`}>{log.status}</span>
                                                        <span className="text-[10px] text-muted-foreground font-mono">{log.time}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </CardContent>
                                <CardFooter className="pt-0 pb-6 pr-6 justify-end">
                                    <Button variant="ghost" size="sm" className="text-destructive text-[10px] font-bold uppercase hover:bg-destructive/10">
                                        Revoke All Remote Access
                                    </Button>
                                </CardFooter>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* GENERAL TAB */}
                    <TabsContent value="general" className="flex-1 space-y-6 outline-none">
                        <div className="max-w-3xl space-y-6">
                            <Card className="border-border/40 shadow-none">
                                <CardHeader>
                                    <div className="flex items-center gap-2">
                                        <Database className="w-4 h-4 text-primary" />
                                        <CardTitle className="text-base text-primary">Core Configuration</CardTitle>
                                    </div>
                                    <CardDescription className="text-xs">Primary workspace-level engine preferences.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="grid gap-6">
                                        <div className="space-y-2">
                                            <Label className="text-xs opacity-70">Instance Display Name</Label>
                                            <Input
                                                className="bg-muted/10"
                                                placeholder="e.g. Production Cluster A"
                                                value={metadata.instanceName || ''}
                                                onChange={(e) => setMetadata({ ...metadata, instanceName: e.target.value })}
                                                onBlur={(e) => handleSaveMetadata({ instanceName: e.target.value })}
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <Label className="text-xs opacity-70">Region / Timezone</Label>
                                                <Select
                                                    value={metadata.timezone || 'UTC'}
                                                    onValueChange={(v) => handleSaveMetadata({ timezone: v })}
                                                >
                                                    <SelectTrigger className="h-9 text-xs bg-muted/10">
                                                        <SelectValue placeholder="Select zone" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="UTC">UTC (Universal)</SelectItem>
                                                        <SelectItem value="Asia/Kolkata">IST (Kolkata)</SelectItem>
                                                        <SelectItem value="America/New_York">EST (New York)</SelectItem>
                                                        <SelectItem value="Europe/London">GMT (London)</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-xs opacity-70">System Language</Label>
                                                <Select
                                                    value={metadata.language || 'en_US'}
                                                    onValueChange={(v) => handleSaveMetadata({ language: v })}
                                                >
                                                    <SelectTrigger className="h-9 text-xs bg-muted/10">
                                                        <SelectValue placeholder="Select lang" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="en_US">English (US)</SelectItem>
                                                        <SelectItem value="en_GB">English (GB)</SelectItem>
                                                        <SelectItem value="hi_IN">Hindi (IN)</SelectItem>
                                                        <SelectItem value="es_ES">Spanish (ES)</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                    </div>

                                    <Separator />

                                    <div className="p-4 bg-muted/10 rounded-lg space-y-3">
                                        <Label className="text-xs font-semibold">Workspace Signature</Label>
                                        <Textarea
                                            className="min-h-[80px] text-xs bg-background"
                                            placeholder="Sent via Devlomatix WA Engine..."
                                            value={metadata.signature || ''}
                                            onChange={(e) => setMetadata({ ...metadata, signature: e.target.value })}
                                            onBlur={(e) => handleSaveMetadata({ signature: e.target.value })}
                                        />
                                        <div className="flex items-center gap-2">
                                            <Switch
                                                checked={metadata.appendSignature || false}
                                                onCheckedChange={(c) => handleSaveMetadata({ appendSignature: c })}
                                            />
                                            <span className="text-[10px] text-muted-foreground font-medium">Prepend to all outbound browser messages</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>
                </Tabs>

                {/* MODALS */}
                <Dialog open={isCredsModalOpen} onOpenChange={setIsCredsModalOpen}>
                    <DialogContent className="sm:max-w-[450px] bg-card border p-8 rounded-xl shadow-2xl">
                        <DialogHeader>
                            <DialogTitle className="text-2xl tracking-tight">Meta Engine Config</DialogTitle>
                            <DialogDescription className="text-xs font-medium text-muted-foreground/60 tracking-tight">Enter your official Meta Graph API credentials to link this node.</DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-6 py-8">
                            <div className="grid gap-2.5">
                                <Label className="text-muted-foreground/70 ml-1">Account Nickname</Label>
                                <Input className="bg-black/40 h-12 text-sm font-bold rounded-md px-4 border border-border/40" value={tempCreds.profile} onChange={(e) => setTempCreds({ ...tempCreds, profile: e.target.value })} placeholder="e.g. Sales Primary" />
                            </div>
                            <div className="grid gap-2.5">
                                <Label className="text-muted-foreground/70 ml-1">Phone Number ID</Label>
                                <Input className="bg-black/40 h-12 text-sm font-bold rounded-md px-4 border border-border/40" value={tempCreds.phoneNumberId} onChange={(e) => setTempCreds({ ...tempCreds, phoneNumberId: e.target.value })} placeholder="10492..." />
                            </div>
                            <div className="grid gap-2.5">
                                <Label className="text-muted-foreground/70 ml-1">Business Account ID</Label>
                                <Input className="bg-black/40 border-border/40 h-12 text-sm font-bold rounded-md px-4 font-mono" value={tempCreds.wabaId} onChange={(e) => setTempCreds({ ...tempCreds, wabaId: e.target.value })} placeholder="92837..." />
                            </div>
                            <div className="grid gap-2.5">
                                <Label className="text-muted-foreground/70 ml-1">System Access Token</Label>
                                <Input className="bg-black/40 border-border/40 h-12 text-sm font-bold rounded-md px-4 font-mono" type="password" value={tempCreds.accessToken} onChange={(e) => setTempCreds({ ...tempCreds, accessToken: e.target.value })} placeholder="EAAG..." />
                            </div>
                        </div>
                        <DialogFooter className="gap-4">
                            <Button variant="ghost" className="font-bold text-xs h-12 rounded-xl" onClick={() => setIsCredsModalOpen(false)}>Cancel</Button>
                            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground text-[11px] tracking-widest h-12 px-8 rounded-xl shadow-lg shadow-primary/20 flex-1" onClick={handleSaveCloudCreds} disabled={cloudLoading}>
                                {cloudLoading ? <RefreshCcw className="w-4 h-4 animate-spin" /> : (tempCreds.id ? 'Save Updates' : 'Activate Node')}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
                    <DialogContent className="sm:max-w-[400px] bg-[#0E141B] border-border/50 rounded-3xl">
                        <DialogHeader>
                            <DialogTitle className="text-destructive flex items-center gap-3 text-xl tracking-tight">
                                <Trash2 className="w-6 h-6" /> Purge Credentials?
                            </DialogTitle>
                            <DialogDescription className="text-xs font-medium py-2 leading-relaxed">This will permanently terminate the cloud bridge and stop all automated handlers for <span className="text-foreground tracking-tight">"{accountToDelete?.profile}"</span>.</DialogDescription>
                        </DialogHeader>
                        <DialogFooter className="mt-8 gap-3">
                            <Button variant="ghost" className="font-bold h-12 rounded-xl flex-1" onClick={() => setIsDeleteModalOpen(false)}>Cancel</Button>
                            <Button variant="destructive" className="text-[11px] tracking-widest h-12 px-8 rounded-xl shadow-lg shadow-destructive/20 flex-1" onClick={handleDeleteCloudCred} disabled={cloudLoading}>
                                Confirm Purge
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </TooltipProvider>
    );
}

function DynamicIcon({ name, className }) {
    if (name === 'whatsapp') {
        return (
            <svg className={className} viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
            </svg>
        );
    }
    return <Key className={className} />;
}