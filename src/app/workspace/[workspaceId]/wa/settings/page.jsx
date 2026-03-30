// @ts-nocheck
'use client';

import React, { useState, useEffect, useCallback } from'react';
import { motion, AnimatePresence } from'framer-motion';
import { MessageSquare, Shield, Smartphone, RefreshCcw, CheckCircle2, AlertCircle, LogOut, QrCode } from'lucide-react';
import { toast } from'sonner';
import QRCode from'qrcode';
import { Button } from"@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from"@/components/ui/card";
import { Badge } from"@/components/ui/badge";

export default function SettingsPage() {
 const [status, setStatus] = useState('welcome');
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
 } catch (error) {
 console.error('Failed to fetch WA status:', error);
 } finally {
 setLoading(false);
 }
 }, [qrCode]);

 useEffect(() => {
 fetchStatus();
 const interval = setInterval(fetchStatus, 10000);

 return () => clearInterval(interval);


 }, [fetchStatus]);

 const handleConnect = async () => {
 setActionLoading(true);
 try {
 const res = await fetch('/api/wa/auth', { method:'POST'});

 console.log('res', res);
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
 const res = await fetch('/api/wa/auth', { method:'DELETE'});
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

 const statusConfig = {
 welcome: { label:'Not Connected', color:'bg-zinc-500', icon: AlertCircle },
 connecting: { label:'Connecting...', color:'bg-yellow-500 animate-pulse', icon: RefreshCcw },
 qr: { label:'Scan Required', color:'bg-blue-500', icon: QrCode },
 open: { label:'Connected', color:'bg-green-500', icon: CheckCircle2 },
 close: { label:'Disconnected', color:'bg-red-500', icon: LogOut }
 };

 const currentStatus = statusConfig[status] || statusConfig.welcome;

 return (
 <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
 <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
 <div>
 <h1 className="text-3xl font-bold text-white mb-2">WhatsApp Settings</h1>
 <p className="text-muted-foreground">Manage your WhatsApp instance connection and credentials</p>
 </div>
 <Badge variant="outline"className={`py-1 px-3 flex items-center gap-2 border-0 text-green-800 ${currentStatus.color}/20 text-white shrink-0`}>
 <currentStatus.icon className="w-3.5 h-3.5"/>
 {currentStatus.label}
 </Badge>
 </div>

 <div className="grid md:grid-cols-2 gap-8">
 <Card className="bg-card/50 border-border/50 backdrop-blur-sm overflow-hidden flex flex-col">
 <CardHeader className="border-b border-border/10 pb-6">
 <div className="flex items-center gap-3 mb-2">
 <div className="p-2 bg-primary/10 rounded-md">
 <Smartphone className="w-5 h-5 text-primary"/>
 </div>
 <CardTitle>Instance Connection</CardTitle>
 </div>
 <CardDescription>Scan the QR code to securely link your WhatsApp account</CardDescription>
 </CardHeader>

 <CardContent className="flex-1 flex flex-col items-center justify-center p-8 space-y-6">
 <AnimatePresence mode="wait">
 {status ==='qr'&& qrDataUrl ?
 <motion.div
 key="qr"
 initial={{ opacity: 0, scale: 0.9 }}
 animate={{ opacity: 1, scale: 1 }}
 exit={{ opacity: 0, scale: 0.9 }}
 className="p-4 bg-white rounded-md shadow-2xl relative group">
 
 <img src={qrDataUrl} alt="WhatsApp QR Code"className="w-64 h-64 border-0"/>
 <div className="absolute inset-0 bg-white/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-md">
 <div className="bg-black/80 text-white text-xs px-3 py-1.5 rounded-full flex items-center gap-2">
 <RefreshCcw className="w-3 h-3 animate-spin"/>
 Refreshing automatically
 </div>
 </div>
 </motion.div> :
 status ==='open'?
 <motion.div
 key="connected"
 initial={{ opacity: 0, y: 10 }}
 animate={{ opacity: 1, y: 0 }}
 className="flex flex-col items-center text-center space-y-4 text-green-600">
 
 <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center border border-green-500/20">
 <CheckCircle2 className="w-10 text-green-500"/>
 </div>
 <div>
 <h3 className="text-xl font-semibold text-white">Instance Active</h3>
 <p className="text-sm text-muted-foreground mt-1">Your account is successfully paired and ready to send messages.</p>
 </div>
 </motion.div> :
 status ==='connecting'?
 <motion.div
 key="connecting"
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 className="flex flex-col items-center space-y-4">
 
 <div className="relative">
 <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
 <Smartphone className="w-6 h-6 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"/>
 </div>
 <p className="text-sm text-muted-foreground">Initializing connection...</p>
 </motion.div> :

 <motion.div
 key="idle"
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 className="flex flex-col items-center text-center space-y-4">
 
 <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center">
 <MessageSquare className="w-8 h-8 text-zinc-500"/>
 </div>
 <p className="text-sm text-muted-foreground">No active connection. Click connect to get started.</p>
 </motion.div>
 }
 </AnimatePresence>
 </CardContent>

 <CardFooter className="bg-zinc-900/50 border-t border-border/10 p-6 flex gap-3">
 {status ==='open'?
 <Button variant="destructive"className="w-full gap-2"onClick={handleDisconnect} disabled={actionLoading}>
 <LogOut className="w-4 h-4"/>
 Disconnect Instance
 </Button> :

 <Button className="w-full gap-2 gradient-wa border-0 text-white"onClick={handleConnect} disabled={actionLoading || status ==='connecting'|| status ==='qr'}>
 {status ==='connecting'? <RefreshCcw className="w-4 h-4 animate-spin"/> : <Smartphone className="w-4 h-4"/>}
 {status ==='qr'?'Waiting for Scan':'Connect Now'}
 </Button>
 }
 </CardFooter>
 </Card>

 <div className="space-y-6">
 <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
 <CardHeader>
 <div className="flex items-center gap-3 mb-2">
 <div className="p-2 bg-blue-500/10 rounded-md">
 <Shield className="w-5 h-5 text-blue-500"/>
 </div>
 <CardTitle>Security & Persistence</CardTitle>
 </div>
 <CardDescription>Your session details are stored securely in the PostgreSQL database.</CardDescription>
 </CardHeader>
 <CardContent className="space-y-4">
 <div className="flex justify-between items-center py-2 border-b border-border/10">
 <span className="text-sm text-muted-foreground">Encryption</span>
 <span className="text-sm font-medium text-white">AES-256-GCM</span>
 </div>
 <div className="flex justify-between items-center py-2 border-b border-border/10">
 <span className="text-sm text-muted-foreground">Storage Engine</span>
 <span className="text-sm font-medium text-white">PostgreSQL (Prisma)</span>
 </div>
 <div className="flex justify-between items-center py-2">
 <span className="text-sm text-muted-foreground">Multi-Device Support</span>
 <Badge variant="secondary"className="bg-blue-500/10 text-blue-400 border-0">Enabled</Badge>
 </div>
 </CardContent>
 </Card>

 <Card className="bg-card/50 border-border/50 backdrop-blur-sm border-l-4 border-l-primary">
 <CardContent className="p-6">
 <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
 <AlertCircle className="w-4 h-4 text-primary"/>
 Connection Guide
 </h4>
 <ul className="text-sm text-muted-foreground space-y-3 list-decimal list-inside">
 <li>Open WhatsApp on your phone</li>
 <li>Tap Menu or Settings and select Linked Devices</li>
 <li>Tap on Link a Device</li>
 <li>Point your phone to this screen to capture the QR code</li>
 </ul>
 </CardContent>
 </Card>
 </div>
 </div>
 </div>);

}