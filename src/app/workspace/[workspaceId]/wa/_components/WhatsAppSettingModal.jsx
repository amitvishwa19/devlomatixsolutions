// @ts-nocheck
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Shield, Smartphone, RefreshCcw, CheckCircle2, AlertCircle, LogOut, QrCode, Plus, Trash2, Send, X, Globe, Key } from 'lucide-react';
import { toast } from 'sonner';
import QRCode from 'qrcode';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useParams } from 'next/navigation';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import axios from '@/utils/axios';

export default function WhatsAppSettingModal({ open, onClose }) {
    const params = useParams();
    const workspaceId = params?.workspaceId || "testid";
    const [status, setStatus] = useState('welcome');
    const [testNumbers, setTestNumbers] = useState([]);
    const [newNumber, setNewNumber] = useState('');
    const [isSavingNumbers, setIsSavingNumbers] = useState(false);
    const [qrCode, setQrCode] = useState(null);
    const [qrDataUrl, setQrDataUrl] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    // Cloud API States
    const [cloudCredentials, setCloudCredentials] = useState([]);
    const [selectedCloudId, setSelectedCloudId] = useState('new');
    const [isTestingCloud, setIsTestingCloud] = useState(false);
    const [isSavingCloud, setIsSavingCloud] = useState(false);
    const [cloudVerified, setCloudVerified] = useState(false);
    const [hasAutoSelected, setHasAutoSelected] = useState(false);
    const [cloudForm, setCloudForm] = useState({
        profileName: 'BotBee Cloud API',
        phoneNumberId: '',
        wabaId: '',
        accessToken: ''
    });

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

            if (data.metadata?.testNumbers) {
                setTestNumbers(data.metadata.testNumbers);
            }
        } catch (error) {
            console.error('Failed to fetch WA status:', error);
        } finally {
            setLoading(false);
        }
    }, [qrCode]);

    const fetchCloudCredentials = useCallback(async () => {
        try {
            const workspaceId = window.location.pathname.split('/')[2];
            const res = await axios.get(`/api/workspace/${workspaceId}/social/accounts`);
            const filtered = res.data.filter(acc => acc.platform === 'WHATSAPP_CLOUD' || acc.platform === 'WHATSAPP');
            setCloudCredentials(filtered);

            // Only auto-select ONCE during the initial fetch if nothing is selected
            if (filtered.length > 0 && selectedCloudId === 'new' && !hasAutoSelected) {
                setSelectedCloudId(filtered[0].id);
                setHasAutoSelected(true);
            }
        } catch (error) {
            console.error('Failed to fetch Cloud credentials:', error);
        }
    }, [workspaceId, selectedCloudId, hasAutoSelected]);

    useEffect(() => {
        if (!open) {
            setHasAutoSelected(false); // Reset when modal closes
            return;
        }

        fetchStatus();
        fetchCloudCredentials();
        const interval = setInterval(fetchStatus, 10000);
        return () => clearInterval(interval);
    }, [open, fetchStatus, fetchCloudCredentials]);

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
        if (!confirm('Are you sure you want to disconnect? Your session will be cleared.')) return;
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

    const handleAddNumber = () => {
        let formatted = newNumber.trim();
        if (!formatted) return;

        if (!formatted.startsWith('+')) {
            formatted = '+91' + formatted.replace(/^0+/, '');
        }

        if (testNumbers.includes(formatted)) {
            toast.error('Number already exists in test list.');
            return;
        }

        if (testNumbers.length >= 4) {
            toast.error('Maximum of 5 test numbers allowed.');
            return;
        }

        const updated = [...testNumbers, formatted];
        setTestNumbers(updated);
        setNewNumber('');
        saveTestNumbers(updated);
    };

    const handleRemoveNumber = (num) => {
        const updated = testNumbers.filter(n => n !== num);
        setTestNumbers(updated);
        saveTestNumbers(updated);
    };

    const saveTestNumbers = async (numbers) => {
        setIsSavingNumbers(true);
        try {
            const res = await fetch('/api/wa/auth', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ testNumbers: numbers })
            });
            if (!res.ok) throw new Error('Failed to save');
            toast.success('Test numbers updated');
        } catch (error) {
            toast.error('Failed to save test numbers');
            console.error(error);
        } finally {
            setIsSavingNumbers(false);
        }
    };

    const handleTestCloudConnection = async () => {
        setIsTestingCloud(true);
        setCloudVerified(false);
        const toastId = toast.loading('Testing Cloud API connection...');
        try {
            const workspaceId = window.location.pathname.split('/')[2];
            const payload = {
                platform: 'WHATSAPP_CLOUD',
                credentials: {
                    accessToken: cloudForm.accessToken,
                    phoneNumberId: cloudForm.phoneNumberId,
                    wabaId: cloudForm.wabaId
                }
            };

            const res = await axios.post(`/api/workspace/${workspaceId}/social/accounts/undefined/test`, payload);

            if (res.data.success) {
                toast.success('Connection Successful!', { id: toastId });
                setCloudVerified(true);
            } else {
                toast.error(res.data.message || 'Connection failed', { id: toastId });
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Connection error', { id: toastId });
        } finally {
            setIsTestingCloud(false);
        }
    };

    const handleSaveCloudCredential = async () => {
        setIsSavingCloud(true);
        const toastId = toast.loading('Saving to system vault...');
        try {
            const workspaceId = window.location.pathname.split('/')[2];
            const payload = {
                platform: 'WHATSAPP_CLOUD',
                profile: cloudForm.profileName,
                credentials: {
                    accessToken: cloudForm.accessToken,
                    phoneNumberId: cloudForm.phoneNumberId,
                    wabaId: cloudForm.wabaId
                },
                status: 'connected'
            };

            await axios.post(`/api/workspace/${workspaceId}/social/accounts`, payload);
            toast.success('Credential saved and verified', { id: toastId });
            setCloudVerified(false); // Reset to allow standard flow
            fetchCloudCredentials();
            // Automatically select the new one?
        } catch (error) {
            toast.error('Failed to save credential', { id: toastId });
        } finally {
            setIsSavingCloud(false);
        }
    };

    const statusConfig = {
        welcome: { label: 'Not Connected', color: 'bg-zinc-500', icon: AlertCircle },
        connecting: { label: 'Connecting...', color: 'bg-yellow-500 animate-pulse', icon: RefreshCcw },
        qr: { label: 'Scan Required', color: 'bg-blue-500', icon: QrCode },
        open: { label: 'Connected', color: 'bg-green-500', icon: CheckCircle2 },
        close: { label: 'Disconnected', color: 'bg-red-500', icon: LogOut }
    };

    const currentStatus = statusConfig[status] || statusConfig.welcome;

    const onOpenChange = (isOpen) => {
        if (!isOpen) {
            onClose();
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="min-w-[70vw] min-h-[70vh]  p-0 bg-background overflow-hidden flex flex-col">
                <DialogHeader className="p-6 border-b border-border/10">
                    <div className="flex justify-between items-center pr-8">
                        <div>
                            <DialogTitle className="text-xl font-bold text-white mb-1">WhatsApp Settings</DialogTitle>
                            <DialogDescription className="text-xs text-muted-foreground">
                                Manage your WhatsApp instance connection and credentials
                            </DialogDescription>
                        </div>
                        <Badge variant="outline" className={`py-1 px-3 flex items-center gap-2 border-0 ${currentStatus.color}/20 text-white font-medium`}>
                            <currentStatus.icon className="w-3.5 h-3.5" />
                            {currentStatus.label}
                        </Badge>
                    </div>
                </DialogHeader>

                <Tabs defaultValue="browser" className="flex-1 flex flex-col overflow-hidden">
                    <div className="px-6 py-2 border-b border-border/10">
                        <TabsList className="bg-muted/50 p-1">
                            <TabsTrigger value="browser" className="gap-2 font-bold ">
                                <Smartphone size={14} /> WhatsApp Browser
                            </TabsTrigger>
                            <TabsTrigger value="cloud" className="gap-2 font-bold ">
                                <Globe size={14} /> WhatsApp Cloud API
                            </TabsTrigger>
                            <TabsTrigger value="test-numbers" className="gap-2 font-bold ">
                                <Send size={14} /> Test Numbers
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <TabsContent value="browser" className="flex-1 p-6 overflow-y-auto m-0">
                        <div className="grid md:grid-cols-5 gap-6 max-w-5xl mx-auto">


                            {/* Instance Connection Card */}
                            <Card className="md:col-span-3 bg-card/50 border-border/50 backdrop-blur-sm overflow-hidden flex flex-col">
                                <CardHeader className="border-b border-border/10 pb-6">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="p-2 bg-primary/10 rounded-md">
                                            <Smartphone className="w-5 h-5 text-primary" />
                                        </div>
                                        <CardTitle className="text-white">Instance Connection</CardTitle>
                                    </div>
                                    <CardDescription>Scan the QR code to securely link your WhatsApp account (Browser Session)</CardDescription>
                                </CardHeader>

                                <CardContent className="flex-1 flex flex-col items-center justify-center p-4 space-y-6 min-h-[300px]">
                                    <AnimatePresence mode="wait">
                                        {status === 'qr' && qrDataUrl ? (
                                            <motion.div
                                                key="qr"
                                                initial={{ opacity: 0, scale: 0.9 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.9 }}
                                                className="p-4 bg-white rounded-md shadow-2xl relative group"
                                            >
                                                <img src={qrDataUrl} alt="WhatsApp QR Code" className="w-60 h-60 border-0" />
                                                <div className="absolute inset-0 bg-white/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-md">
                                                    <div className="bg-black/80 text-white text-xs px-3 py-1.5 rounded-full flex items-center gap-2">
                                                        <RefreshCcw className="w-3 h-3 animate-spin" />
                                                        Refreshing automatically
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ) : status === 'open' ? (
                                            <motion.div
                                                key="connected"
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="flex flex-col items-center text-center space-y-4"
                                            >
                                                <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center border border-green-500/20">
                                                    <CheckCircle2 className="w-10 text-green-500" />
                                                </div>
                                                <div>
                                                    <h3 className="text-xl font-semibold text-white">Instance Active</h3>
                                                    <p className="text-xs text-muted-foreground mt-1">
                                                        Your account is successfully paired and ready to send messages.
                                                    </p>
                                                </div>
                                            </motion.div>
                                        ) : status === 'connecting' ? (
                                            <motion.div
                                                key="connecting"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                className="flex flex-col items-center space-y-4"
                                            >
                                                <div className="relative">
                                                    <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                                                    <Smartphone className="w-6 h-6 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                                                </div>
                                                <p className="text-xs text-muted-foreground">Initializing connection...</p>
                                            </motion.div>
                                        ) : (
                                            <motion.div
                                                key="idle"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                className="flex flex-col items-center text-center space-y-4"
                                            >
                                                <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center">
                                                    <MessageSquare className="w-8 h-8 text-zinc-500" />
                                                </div>
                                                <p className="text-xs text-muted-foreground">
                                                    No active connection. Click connect to get started.
                                                </p>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </CardContent>

                                <CardFooter className="bg-zinc-900/50 border-t border-border/10 p-6">
                                    {status === 'open' ? (
                                        <Button variant="destructive" className="w-full gap-2" onClick={handleDisconnect} disabled={actionLoading}>
                                            <LogOut className="w-4 h-4" />
                                            Disconnect Instance
                                        </Button>
                                    ) : (
                                        <Button className="w-full gap-2 gradient-wa border-0 text-white" onClick={handleConnect} disabled={actionLoading || status === 'connecting' || status === 'qr'}>
                                            {status === 'connecting' ? <RefreshCcw className="w-4 h-4 animate-spin" /> : <Smartphone className="w-4 h-4" />}
                                            {status === 'qr' ? 'Waiting for Scan' : 'Connect Now'}
                                        </Button>
                                    )}
                                </CardFooter>
                            </Card>

                            {/* Side Panel: Info */}
                            <div className="md:col-span-2 space-y-6">
                                <Card className="bg-card/50 border-border/50 backdrop-blur-sm border-l-4 border-l-primary h-full">
                                    <CardContent className="p-6">
                                        <h4 className="font-semibold text-white mb-4 flex items-center gap-2">
                                            <AlertCircle className="w-4 h-4 text-primary" />
                                            Connection Guide
                                        </h4>
                                        <ul className="text-sm text-muted-foreground space-y-4 list-decimal list-inside">
                                            <li>Open WhatsApp on your phone</li>
                                            <li>Tap Menu or Settings and select Linked Devices</li>
                                            <li>Tap on Link a Device</li>
                                            <li>Point your phone to this screen to capture QR code</li>
                                        </ul>
                                        <div className="mt-8 p-4 bg-primary/5 rounded-lg border border-primary/10">
                                            <p className="text-[10px] text-primary/70 font-medium leading-relaxed">
                                                Note: Link your business account for better performance. Keep your phone connected to a stable internet session for initial synchronization.
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="cloud" className="flex-1 p-6 overflow-y-auto m-0">
                        <div className="grid md:grid-cols-2 gap-6">
                            <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
                                <CardHeader className="border-b border-border/10 pb-6">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="p-2 bg-blue-500/10 rounded-md">
                                            <Globe className="w-5 h-5 text-blue-500" />
                                        </div>
                                        <CardTitle className="text-white font-bold">API Configuration</CardTitle>
                                    </div>
                                    <CardDescription>Setup your official WhatsApp Cloud API credentials</CardDescription>
                                </CardHeader>
                                <CardContent className="p-6 space-y-6">
                                    <RadioGroup
                                        value={selectedCloudId === 'new' ? 'new' : 'existing'}
                                        onValueChange={(val) => {
                                            if (val === 'new') setSelectedCloudId('new');
                                            else if (cloudCredentials.length > 0) setSelectedCloudId(cloudCredentials[0].id);
                                        }}
                                        className="flex gap-4 mb-4"
                                    >
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="existing" id="existing" disabled={cloudCredentials.length === 0} />
                                            <Label htmlFor="existing" className={`text-[10px] font-bold uppercase ${cloudCredentials.length === 0 ? 'opacity-30' : ''}`}>Use Saved</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="new" id="new" />
                                            <Label htmlFor="new" className="text-[10px] font-bold uppercase">Add Manual</Label>
                                        </div>
                                    </RadioGroup>

                                    {selectedCloudId !== 'new' ? (
                                        <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                                            <div className="space-y-2">
                                                <Label className="text-[10px] font-bold text-muted-foreground uppercase">Select Verified Account</Label>
                                                <Select value={selectedCloudId} onValueChange={setSelectedCloudId}>
                                                    <SelectTrigger className="bg-background border-border text-xs h-12">
                                                        <SelectValue placeholder="Select credential..." />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {cloudCredentials.map(acc => (
                                                            <SelectItem key={acc.id} value={acc.id} className="text-xs font-medium">
                                                                {acc.profileName} {acc.expired ? '(Expired)' : ''}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-md flex items-center gap-3">
                                                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                                <p className="text-[10px] font-medium text-emerald-500/70">Using existing system vault credential. Connection will be verified upon start.</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                                            <div className="space-y-2">
                                                <Label className="text-[10px] font-bold text-muted-foreground uppercase">Profile Name</Label>
                                                <Input
                                                    placeholder="e.g. Meta Cloud Account"
                                                    value={cloudForm.profileName}
                                                    onChange={(e) => setCloudForm({ ...cloudForm, profileName: e.target.value })}
                                                    className="bg-background border-border text-xs h-11"
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label className="text-[10px] font-bold text-muted-foreground uppercase">Phone Number ID</Label>
                                                    <Input
                                                        placeholder="Enter ID..."
                                                        value={cloudForm.phoneNumberId}
                                                        onChange={(e) => setCloudForm({ ...cloudForm, phoneNumberId: e.target.value })}
                                                        className="bg-background border-border text-xs font-mono h-11"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-[10px] font-bold text-muted-foreground uppercase">WABA ID</Label>
                                                    <Input
                                                        placeholder="Enter WABA..."
                                                        value={cloudForm.wabaId}
                                                        onChange={(e) => setCloudForm({ ...cloudForm, wabaId: e.target.value })}
                                                        className="bg-background border-border text-xs font-mono h-11"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-[10px] font-bold text-muted-foreground uppercase">Access Token</Label>
                                                <div className="relative">
                                                    <Input
                                                        type="password"
                                                        placeholder="EAAl..."
                                                        value={cloudForm.accessToken}
                                                        onChange={(e) => setCloudForm({ ...cloudForm, accessToken: e.target.value })}
                                                        className="bg-background border-border text-xs font-mono pr-10 h-11"
                                                    />
                                                    <Key className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/40" />
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                                <CardFooter className="bg-zinc-900/50 border-t border-border/10 p-6 flex flex-col gap-3">
                                    {selectedCloudId === 'new' ? (
                                        <div className="flex w-full gap-2">
                                            <Button
                                                onClick={handleTestCloudConnection}
                                                disabled={isTestingCloud || !cloudForm.accessToken}
                                                className={`flex-1 gap-2 font-bold text-xs uppercase tracking-widest ${cloudVerified ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-blue-600 hover:bg-blue-700'}`}
                                            >
                                                {isTestingCloud ? <RefreshCcw className="w-4 h-4 animate-spin" /> : cloudVerified ? <CheckCircle2 className="w-4 h-4" /> : <Smartphone className="w-4 h-4" />}
                                                {cloudVerified ? 'Verified' : 'Test Connection'}
                                            </Button>

                                            {cloudVerified && (
                                                <Button
                                                    onClick={handleSaveCloudCredential}
                                                    disabled={isSavingCloud}
                                                    variant="secondary"
                                                    className="flex-1 gap-2 border-emerald-500/20 text-emerald-500 font-bold text-xs uppercase tracking-widest"
                                                >
                                                    {isSavingCloud ? <RefreshCcw className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
                                                    Save to Vault
                                                </Button>
                                            )}
                                        </div>
                                    ) : (
                                        <Button className="w-full gap-2 bg-primary hover:bg-primary/90 text-white font-bold text-xs uppercase tracking-widest">
                                            Apply Selection
                                        </Button>
                                    )}
                                </CardFooter>
                            </Card>

                            <div className="space-y-6">
                                <Card className="bg-card/50 border-border/50 backdrop-blur-sm border-l-4 border-l-blue-500">
                                    <CardContent className="p-6">
                                        <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
                                            <Shield className="w-4 h-4 text-blue-500" />
                                            Setup Requirements
                                        </h4>
                                        <ul className="text-xs text-muted-foreground space-y-3 list-disc list-inside">
                                            <li>A Meta Developer Account is required</li>
                                            <li>Company must be Business Verified</li>
                                            <li>Requires a permanent access token from Meta Dashboard</li>
                                            <li>Dedicated phone number required (cannot be active on a phone)</li>
                                        </ul>
                                        <Button variant="link" className="text-[10px] text-blue-400 p-0 h-auto mt-4" asChild>
                                            <a href="https://developers.facebook.com/" target="_blank" rel="noreferrer">Open Meta for Developers &rarr;</a>
                                        </Button>
                                    </CardContent>
                                </Card>

                                <Card className="bg-card/50 border-border/50 border-dashed">
                                    <CardContent className="p-8 flex flex-col items-center justify-center text-center opacity-40">
                                        <div className="w-12 h-12 rounded-full border-2 border-border border-t-transparent animate-spin mb-4" />
                                        <p className="text-[10px] font-bold uppercase tracking-widest">Awaiting Verification</p>
                                        <p className="text-[10px] mt-1 shrink-0">BotBee will automatically verify your API status after saving credentials.</p>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="test-numbers" className="flex-1 p-4 overflow-y-auto m-0">
                        <div className="space-y-4 h-full flex flex-col">
                            <Card className="flex-1 bg-card/50 border-border/50 backdrop-blur-sm flex flex-col">
                                <CardHeader className="border-b border-border/10">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="p-2 bg-primary/10 rounded-md">
                                            <Send className="w-5 h-5 text-primary" />
                                        </div>
                                        <CardTitle className="text-white">Global Test Recipients</CardTitle>
                                    </div>
                                    <CardDescription>
                                        Manage your whitelist for quick testing across all WhatsApp channels ({testNumbers.length}/5)
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="p-8 space-y-8 flex-1 flex flex-col">
                                    <div className="space-y-4">
                                        <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Add New Number</Label>
                                        <div className="flex gap-3">
                                            <Input
                                                placeholder="e.g. 9876543210"
                                                value={newNumber}
                                                onChange={(e) => setNewNumber(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && handleAddNumber()}
                                                className="bg-background border-border text-sm h-12 flex-1 font-mono"
                                                disabled={testNumbers.length >= 5}
                                            />
                                            <Button
                                                size="lg"
                                                onClick={handleAddNumber}
                                                disabled={!newNumber.trim() || testNumbers.length >= 5 || isSavingNumbers}
                                                className="px-8 font-bold"
                                            >
                                                {isSavingNumbers ? <RefreshCcw className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                                                Add
                                            </Button>
                                        </div>
                                        <p className="text-[10px] text-muted-foreground">Numbers will be automatically prefixed with +91 if code is missing.</p>
                                    </div>

                                    <div className="flex-1 space-y-4 flex flex-col min-h-0">
                                        <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Registered Whitelist</Label>
                                        <ScrollArea className="flex-1 rounded-lg">
                                            {testNumbers.length === 0 ? (
                                                <div className="h-full flex flex-col items-center justify-center opacity-50 space-y-3 py-12">
                                                    <AlertCircle className="w-8 h-8 text-muted-foreground" />
                                                    <p className="text-xs text-muted-foreground italic">No test numbers saved in your profile.</p>
                                                </div>
                                            ) : (
                                                <div className="grid gap-3">
                                                    {testNumbers.map((num) => (
                                                        <motion.div
                                                            initial={{ opacity: 0, x: -10 }}
                                                            animate={{ opacity: 1, x: 0 }}
                                                            key={num}
                                                            className="flex items-center justify-between p-4 rounded-xl bg-background border border-border/30 group hover:bg-muted/50 transition-colors"
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-2 h-2 rounded-full bg-primary" />
                                                                <span className="text-sm font-mono text-white tracking-wider">{num}</span>
                                                            </div>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-all"
                                                                onClick={() => handleRemoveNumber(num)}
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </Button>
                                                        </motion.div>
                                                    ))}
                                                </div>
                                            )}
                                        </ScrollArea>
                                    </div>
                                </CardContent>
                                <CardFooter className="bg-zinc-900/50 border-t border-border/10 p-6 italic text-[10px] text-muted-foreground text-center flex justify-center">
                                    Changes are saved automatically to your workspace profile.
                                </CardFooter>
                            </Card>
                        </div>
                    </TabsContent>
                </Tabs>


            </DialogContent>
        </Dialog>
    );
}
