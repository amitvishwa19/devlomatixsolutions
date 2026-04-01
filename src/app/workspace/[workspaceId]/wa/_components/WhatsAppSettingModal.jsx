// @ts-nocheck
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Shield, Smartphone, RefreshCcw, CheckCircle2, AlertCircle, LogOut, QrCode, Plus, Trash2, Send, X } from 'lucide-react';
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

export default function WhatsAppSettingModal({ open, onClose }) {
    const [status, setStatus] = useState('welcome');
    const [testNumbers, setTestNumbers] = useState([]);
    const [newNumber, setNewNumber] = useState('');
    const [isSavingNumbers, setIsSavingNumbers] = useState(false);
    const [qrCode, setQrCode] = useState(null);
    const [qrDataUrl, setQrDataUrl] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

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

    useEffect(() => {
        if (open) {
            fetchStatus();
            const interval = setInterval(fetchStatus, 10000);
            return () => clearInterval(interval);
        }
    }, [open, fetchStatus]);

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
            <DialogContent className="min-w-[70vw]  p-0 bg-background overflow-hidden flex flex-col">
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

                <div className="flex-1 p-6">
                    <div className="grid md:grid-cols-2 gap-6">

                        {/* Instance Connection Card */}
                        <Card className="bg-card/50 border-border/50 backdrop-blur-sm overflow-hidden flex flex-col">
                            <CardHeader className="border-b border-border/10 pb-6">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="p-2 bg-primary/10 rounded-md">
                                        <Smartphone className="w-5 h-5 text-primary" />
                                    </div>
                                    <CardTitle className="text-white">Instance Connection</CardTitle>
                                </div>
                                <CardDescription>Scan the QR code to securely link your WhatsApp account</CardDescription>
                            </CardHeader>

                            <CardContent className="flex-1 flex flex-col items-center justify-center p-4 space-y-6 min-h-[150px]">
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

                        {/* Side Panel: Test numbers and Info */}
                        <div className="space-y-6">
                            <Card className="h-[48%] bg-card/50 border-border/50 backdrop-blur-sm">
                                <CardHeader>
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="p-2 bg-primary/10 rounded-md">
                                            <Send className="w-5 h-5 text-primary" />
                                        </div>
                                        <CardTitle className="text-white text-base">Test Recipients</CardTitle>
                                    </div>
                                    <CardDescription>Saved numbers for quick testing ({testNumbers.length}/5)</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex gap-2">
                                        <Input
                                            placeholder="e.g. 9876543210"
                                            value={newNumber}
                                            onChange={(e) => setNewNumber(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleAddNumber()}
                                            className="bg-background border-border text-xs"
                                            disabled={testNumbers.length >= 5}
                                        />
                                        <Button
                                            size="sm"
                                            onClick={handleAddNumber}
                                            disabled={!newNumber.trim() || testNumbers.length >= 5 || isSavingNumbers}
                                        >
                                            <Plus className="w-4 h-4" />
                                        </Button>
                                    </div>

                                    <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                                        {testNumbers.length === 0 ? (
                                            <p className="text-[10px] text-muted-foreground italic text-center py-4">No test numbers saved.</p>
                                        ) : (
                                            testNumbers.map((num) => (
                                                <div key={num} className="flex items-center justify-between p-2 rounded-md bg-muted/40 border border-border/30 group">
                                                    <span className="text-xs font-mono text-white">{num}</span>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-6 w-6 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                                                        onClick={() => handleRemoveNumber(num)}
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </Button>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="bg-card/50 h-[48%] border-border/50 backdrop-blur-sm border-l-4 border-l-primary">
                                <CardContent className="p-6">
                                    <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
                                        <AlertCircle className="w-4 h-4 text-primary" />
                                        Connection Guide
                                    </h4>
                                    <ul className="text-xs text-muted-foreground space-y-2 list-decimal list-inside">
                                        <li>Open WhatsApp on your phone</li>
                                        <li>Tap Menu or Settings and select Linked Devices</li>
                                        <li>Tap on Link a Device</li>
                                        <li>Point your phone to this screen to capture QR code</li>
                                    </ul>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>


            </DialogContent>
        </Dialog>
    );
}
