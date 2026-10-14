'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Smartphone,
    QrCode,
    CheckCircle2,
    RefreshCw,
    LogOut,
    AlertCircle,
    ShieldCheck,
    Send,
    Loader2,
    ExternalLink,
    MessageSquare,
    Zap,
    HelpCircle
} from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import {
    initiateWhatsAppConnectionAction,
    getWhatsAppConnectionStatusAction,
    disconnectWhatsAppAction,
    sendTestMessageAction
} from '../_actions/connection-actions';

export default function WhatsAppConnectionModal({
    isOpen,
    onClose,
    workspaceId,
    initialStatus = 'DISCONNECTED',
    onStatusChange,
    onConnected
}) {
    const [status, setStatus] = useState(initialStatus); // DISCONNECTED | CONNECTING | QR_REQUIRED | SCAN_QR | CONNECTED | LOGGED_OUT
    const [qrCode, setQrCode] = useState(null);
    const [phoneNumber, setPhoneNumber] = useState(null);
    const [deviceName, setDeviceName] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isDisconnecting, setIsDisconnecting] = useState(false);

    // Test Message State
    const [testRecipient, setTestRecipient] = useState('');
    const [testMessage, setTestMessage] = useState('Hello! This is a test message from Devlomatix Konnect.');
    const [isSendingTest, setIsSendingTest] = useState(false);

    // Poll status while waiting for scan or connecting
    const pollStatus = useCallback(async () => {
        if (!isOpen) return;
        try {
            const res = await getWhatsAppConnectionStatusAction(workspaceId);
            if (res.success) {
                setStatus(res.status);
                if (res.qrCode) {
                    setQrCode(res.qrCode);
                } else if (res.status === 'CONNECTED' || res.status === 'LOGGED_OUT' || res.status === 'LOGOUT') {
                    setQrCode(null);
                }
                if (res.phoneNumber) setPhoneNumber(res.phoneNumber);
                if (res.deviceName) setDeviceName(res.deviceName);

                if (res.status === 'CONNECTED' && onConnected) {
                    onConnected(res);
                }

                if (onStatusChange) {
                    onStatusChange(res);
                }
            }
        } catch (_) {}
    }, [workspaceId, isOpen, onStatusChange, onConnected]);

    useEffect(() => {
        let timer;
        if (isOpen && (status === 'SCAN_QR' || status === 'QR_REQUIRED' || status === 'CONNECTING' || isLoading)) {
            timer = setInterval(pollStatus, 2000);
        }
        return () => clearInterval(timer);
    }, [isOpen, status, isLoading, pollStatus]);

    // Initial check when opening modal
    useEffect(() => {
        if (isOpen) {
            pollStatus();
        }
    }, [isOpen, pollStatus]);

    // Trigger Connection / Generate QR
    const handleStartConnection = async (forceNewQr = true) => {
        setIsLoading(true);
        try {
            const res = await initiateWhatsAppConnectionAction(workspaceId, { forceNewQr });
            if (!res.success) throw new Error(res.error);

            setStatus(res.status);
            if (res.qrCode) setQrCode(res.qrCode);
            if (res.phoneNumber) setPhoneNumber(res.phoneNumber);
            if (res.deviceName) setDeviceName(res.deviceName);

            if (res.status === 'CONNECTED') {
                toast.success("WhatsApp is already connected!");
            } else if (res.qrCode) {
                toast.info("QR Code generated. Please scan using WhatsApp on your phone.");
            } else {
                toast.loading("Connecting to WhatsApp Multi-Device Gateway...", { duration: 3000 });
            }
        } catch (err) {
            console.error("[START_CONNECTION_ERROR]", err);
            toast.error(err.message || "Failed to start connection");
        } finally {
            setIsLoading(false);
        }
    };

    // Handle Disconnect
    const handleDisconnect = async (logout = false) => {
        setIsDisconnecting(true);
        try {
            const res = await disconnectWhatsAppAction(workspaceId, { logout });
            if (!res.success) throw new Error(res.error);

            setStatus(logout ? 'LOGOUT' : 'DISCONNECTED');
            setQrCode(null);
            if (logout) setPhoneNumber(null);

            toast.success(res.message);
            if (onStatusChange) onStatusChange({ status: logout ? 'LOGOUT' : 'DISCONNECTED' });
        } catch (err) {
            toast.error(err.message || "Failed to disconnect");
        } finally {
            setIsDisconnecting(false);
        }
    };

    // Send Test Message
    const handleSendTestMessage = async () => {
        if (!testRecipient.trim()) {
            toast.error("Please enter a recipient phone number");
            return;
        }

        setIsSendingTest(true);
        try {
            const res = await sendTestMessageAction(workspaceId, {
                recipient: testRecipient.trim(),
                text: testMessage.trim()
            });

            if (!res.success) throw new Error(res.error);

            toast.success(res.message);
            setTestRecipient('');
        } catch (err) {
            toast.error(err.message || "Failed to send test message");
        } finally {
            setIsSendingTest(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-3xl bg-card/95 border-border/50 backdrop-blur-2xl p-0 overflow-hidden shadow-2xl">
                <DialogHeader className="p-6 pb-4 border-b border-border/20 bg-muted/20">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shadow-inner">
                                <Smartphone size={20} />
                            </div>
                            <div>
                                <DialogTitle className="text-lg font-bold flex items-center gap-2">
                                    WhatsApp Multi-Device Connection
                                    <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
                                        Legacy Web Protocol
                                    </Badge>
                                </DialogTitle>
                                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                                    Link your WhatsApp account via QR code to enable two-way chats, broadcasts, and AI automation without Cloud API fees.
                                </DialogDescription>
                            </div>
                        </div>

                        {/* Live Status Pill */}
                        <Badge
                            className={`text-xs px-2.5 py-1 font-semibold flex items-center gap-1.5 border shadow-xs ${
                                status === 'CONNECTED'
                                    ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                                    : (status === 'SCAN_QR' || status === 'QR_REQUIRED')
                                    ? 'bg-blue-500/15 text-blue-400 border-blue-500/30 animate-pulse'
                                    : status === 'CONNECTING' || isLoading
                                    ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                                    : 'bg-muted/40 text-muted-foreground border-border/40'
                            }`}
                        >
                            <span className={`w-2 h-2 rounded-full ${
                                status === 'CONNECTED' ? 'bg-emerald-400 animate-pulse' :
                                (status === 'SCAN_QR' || status === 'QR_REQUIRED') ? 'bg-blue-400' :
                                status === 'CONNECTING' || isLoading ? 'bg-amber-400 animate-spin' : 'bg-muted-foreground'
                            }`} />
                            {status === 'CONNECTED' ? 'Linked & Active' :
                             (status === 'SCAN_QR' || status === 'QR_REQUIRED') ? 'Waiting for Scan' :
                             status === 'CONNECTING' || isLoading ? 'Connecting...' : 'Disconnected'}
                        </Badge>
                    </div>
                </DialogHeader>

                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left Column: QR Code or Connected Hero */}
                    <Card className="border-border/40 bg-background/50 rounded-xl p-6 flex flex-col items-center justify-center text-center shadow-sm relative overflow-hidden min-h-[320px]">
                        <AnimatePresence mode="wait">
                            {status === 'CONNECTED' ? (
                                <motion.div
                                    key="connected"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="space-y-4 my-auto"
                                >
                                    <div className="w-20 h-20 rounded-full bg-emerald-500/15 border-2 border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10">
                                        <CheckCircle2 size={40} />
                                    </div>
                                    <div>
                                        <h3 className="text-base font-bold text-foreground">Device Linked!</h3>
                                        <p className="text-xs text-muted-foreground mt-0.5">Your WhatsApp account is synchronized and ready.</p>
                                        {phoneNumber && (
                                            <Badge variant="outline" className="mt-2 text-xs font-mono font-bold bg-emerald-500/10 text-emerald-400 border-emerald-500/25">
                                                +{phoneNumber}
                                            </Badge>
                                        )}
                                        {deviceName && (
                                            <p className="text-[11px] text-muted-foreground mt-1">{deviceName}</p>
                                        )}
                                    </div>

                                    <div className="pt-2 flex flex-col gap-2 w-full">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handleStartConnection(true)}
                                            disabled={isLoading}
                                            className="text-xs h-8 gap-1.5 border-border/50 text-foreground"
                                        >
                                            <QrCode size={13} />
                                            Re-link / Scan Fresh QR Code
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="destructive"
                                            onClick={() => handleDisconnect(true)}
                                            disabled={isDisconnecting}
                                            className="text-xs h-8 gap-1.5"
                                        >
                                            {isDisconnecting ? <Loader2 size={13} className="animate-spin" /> : <LogOut size={13} />}
                                            Unlink Device / Log Out
                                        </Button>
                                    </div>
                                </motion.div>
                            ) : (isLoading || status === 'CONNECTING') && !qrCode ? (
                                <motion.div
                                    key="connecting"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="space-y-4 my-auto py-8 flex flex-col items-center justify-center text-center"
                                >
                                    <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto shadow-inner">
                                        <Loader2 size={32} className="animate-spin text-emerald-400" />
                                    </div>
                                    <div className="space-y-1">
                                        <h4 className="text-sm font-bold text-foreground">Generating QR Code...</h4>
                                        <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                                            Connecting to WhatsApp Multi-Device Gateway. Your QR code will appear here in a moment.
                                        </p>
                                    </div>
                                </motion.div>
                            ) : (status === 'QR_REQUIRED' || status === 'SCAN_QR' || qrCode) && qrCode ? (
                                <motion.div
                                    key="qr"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="space-y-3"
                                >
                                    <div className="p-3 bg-white rounded-xl shadow-xl inline-block border-2 border-emerald-500/40">
                                        <img
                                            src={qrCode}
                                            alt="WhatsApp Connection QR Code"
                                            className="w-56 h-56 object-contain"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-xs font-semibold text-foreground flex items-center justify-center gap-1.5">
                                            <QrCode size={14} className="text-emerald-400" />
                                            Scan QR code with your phone camera
                                        </p>
                                        <p className="text-[11px] text-muted-foreground">
                                            Code refreshes automatically. Keeps linked across restarts.
                                        </p>
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleStartConnection(true)}
                                        disabled={isLoading}
                                        className="h-7 text-[10px] gap-1 text-muted-foreground hover:text-foreground"
                                    >
                                        <RefreshCw size={11} className={isLoading ? "animate-spin" : ""} />
                                        Refresh QR Code
                                    </Button>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="idle"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="space-y-4 my-auto py-6"
                                >
                                    <div className="w-16 h-16 rounded-2xl bg-muted/40 border border-border/50 text-muted-foreground flex items-center justify-center mx-auto">
                                        <QrCode size={32} />
                                    </div>
                                    <div className="space-y-1">
                                        <h4 className="text-sm font-bold text-foreground">No Active Device Linked</h4>
                                        <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                                            Click below to initialize the Baileys multi-device engine and generate your link QR code.
                                        </p>
                                    </div>
                                    <Button
                                        onClick={() => handleStartConnection(true)}
                                        disabled={isLoading}
                                        className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs h-9 px-5 gap-2 font-semibold shadow-md shadow-emerald-600/20"
                                    >
                                        {isLoading ? (
                                            <>
                                                <Loader2 size={14} className="animate-spin" />
                                                Generating QR...
                                            </>
                                        ) : (
                                            <>
                                                <QrCode size={14} />
                                                Generate Connection QR
                                            </>
                                        )}
                                    </Button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </Card>


                    {/* Right Column: Connection Guide & Quick Test Message */}
                    <div className="space-y-4 flex flex-col justify-between">
                        {/* Step-by-Step Instructions */}
                        <div className="p-4 rounded-xl bg-card/40 border border-border/40 space-y-3">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                                <HelpCircle size={14} className="text-emerald-400" />
                                How to Link Your WhatsApp
                            </h4>
                            <ol className="space-y-2 text-xs text-muted-foreground">
                                <li className="flex items-start gap-2">
                                    <span className="w-5 h-5 rounded-full bg-emerald-500/15 text-emerald-400 font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">1</span>
                                    <span>Open <strong>WhatsApp</strong> on your mobile phone.</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="w-5 h-5 rounded-full bg-emerald-500/15 text-emerald-400 font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">2</span>
                                    <span>Tap <strong>Menu (⋮)</strong> on Android or <strong>Settings (⚙️)</strong> on iPhone.</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="w-5 h-5 rounded-full bg-emerald-500/15 text-emerald-400 font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">3</span>
                                    <span>Select <strong>Linked Devices</strong> and tap <strong>Link a Device</strong>.</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="w-5 h-5 rounded-full bg-emerald-500/15 text-emerald-400 font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">4</span>
                                    <span>Point your camera at the QR code displayed on this screen.</span>
                                </li>
                            </ol>
                        </div>

                        {/* Quick Test Message Dispatcher (Only when connected) */}
                        {status === 'CONNECTED' ? (
                            <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 space-y-3">
                                <div className="flex items-center gap-2 text-emerald-400">
                                    <Zap size={14} />
                                    <h4 className="text-xs font-bold">Quick Connection Test</h4>
                                </div>
                                <div className="space-y-2">
                                    <Input
                                        placeholder="Phone with country code (e.g. 919876543210)"
                                        value={testRecipient}
                                        onChange={(e) => setTestRecipient(e.target.value)}
                                        className="h-8 text-xs bg-background/50 border-border/40"
                                    />
                                    <div className="flex items-center gap-2">
                                        <Input
                                            placeholder="Message..."
                                            value={testMessage}
                                            onChange={(e) => setTestMessage(e.target.value)}
                                            className="h-8 text-xs bg-background/50 border-border/40 flex-1"
                                        />
                                        <Button
                                            size="sm"
                                            onClick={handleSendTestMessage}
                                            disabled={isSendingTest || !testRecipient.trim()}
                                            className="h-8 px-3 text-xs bg-emerald-600 hover:bg-emerald-500 text-white gap-1"
                                        >
                                            {isSendingTest ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
                                            Send
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            /* Security & Privacy Card */
                            <div className="p-3.5 rounded-xl bg-muted/20 border border-border/40 text-[11px] text-muted-foreground space-y-1.5">
                                <div className="flex items-center gap-1.5 font-bold text-foreground">
                                    <ShieldCheck size={14} className="text-emerald-400" />
                                    End-to-End Encryption & Key Storage
                                </div>
                                <p className="leading-relaxed">
                                    Your WhatsApp keys are protected using Baileys multi-device authentication and stored securely in PostgreSQL. Messages sync in real-time with your physical phone.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
