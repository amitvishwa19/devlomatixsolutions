"use client";

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
 Save } from
"lucide-react";
import { toast } from "sonner";
import QRCode from "qrcode";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// LocalStorage keys for caching WhatsApp status
const WA_LOCAL_STORAGE_KEYS = {
 LAST_STATUS: 'wa_last_status',
 SESSION_CACHE: 'wa_session_cache'
};



// Load cached status from localStorage
const loadCachedStatus = () => {
 if (typeof window === 'undefined') return null;
 try {
 const stored = localStorage.getItem(WA_LOCAL_STORAGE_KEYS.LAST_STATUS);
 if (stored) {
 return JSON.parse(stored);
 }
 } catch (error) {
 console.error('[WA] Failed to load cached status:', error);
 }
 return null;
};

// Save status to localStorage
const saveCachedStatus = (data) => {
 if (typeof window === 'undefined') return;
 try {
 const cached = {
 ...data,
 timestamp: Date.now()
 };
 localStorage.setItem(WA_LOCAL_STORAGE_KEYS.LAST_STATUS, JSON.stringify(cached));
 } catch (error) {
 console.error('[WA] Failed to save cached status:', error);
 }
};

export default function WhatsAppConnectionModal({ open, onOpenChange }) {
 const [status, setStatus] = useState('welcome');
 const [qrCode, setQrCode] = useState(null);
 const [qrDataUrl, setQrDataUrl] = useState(null);
 const [loading, setLoading] = useState(true);
 const [actionLoading, setActionLoading] = useState(false);

 // Device info state
 const [deviceInfo, setDeviceInfo] = useState(null);

 // Load cached status on mount
 useEffect(() => {
 const cached = loadCachedStatus();
 if (cached && Date.now() - cached.timestamp < 60000) {// Use cache if less than 1 minute old
 setStatus(cached.status);
 setDeviceInfo({
 phoneNumber: cached.phoneNumber,
 deviceName: cached.deviceName,
 platform: cached.platform,
 connectedAt: cached.connectedAt
 });
 }
 }, []);

 const fetchStatus = useCallback(async () => {
 try {
 const res = await fetch('/api/wa/auth');
 if (!res.ok) return;
 const data = await res.json();

 if (data.status) setStatus(data.status);

 // Handle device info from API response
 if (data.deviceInfo) {
 const info = {
 phoneNumber: data.deviceInfo.phoneNumber,
 deviceName: data.deviceInfo.deviceName,
 platform: data.deviceInfo.platform,
 connectedAt: data.deviceInfo.connectedAt ? new Date(data.deviceInfo.connectedAt).toISOString() : undefined
 };
 setDeviceInfo(info);

 // Save to localStorage
 saveCachedStatus({
 status: data.status,
 ...info
 });
 }

 if (data.qr) {
 if (data.qr !== qrCode || !qrDataUrl) {
 setQrCode(data.qr);
 const dataUrl = await QRCode.toDataURL(data.qr);
 setQrDataUrl(dataUrl);
 }
 } else if (!data.qr) {
 setQrCode(null);
 setQrDataUrl(null);
 }
 } catch (error) {
 console.error('[WA] Failed to fetch status:', error);
 } finally {
 setLoading(false);
 }
 }, [qrCode, qrDataUrl]);

 useEffect(() => {
 if (open) {
 fetchStatus();
 // Poll faster when connecting or waiting for QR
 const intervalTime = status === 'connecting' || status === 'qr' ? 2000 : 10000;
 const interval = setInterval(fetchStatus, intervalTime);
 return () => clearInterval(interval);
 }
 }, [open, fetchStatus, status]);

 const handleConnect = async () => {
 setActionLoading(true);
 setStatus('connecting');
 setQrCode(null);
 setQrDataUrl(null);

 try {
 const res = await fetch('/api/wa/auth', {
 method: 'POST'
 });

 if (res.ok) {
 const data = await res.json();
 if (data.status) setStatus(data.status);
 if (data.qr) {
 setQrCode(data.qr);
 const dataUrl = await QRCode.toDataURL(data.qr);
 setQrDataUrl(dataUrl);
 }
 toast.success('Connection process started');
 fetchStatus();
 } else {
 let errorMsg = 'Failed to start connection';
 try {
 const data = await res.json();
 if (data.error) errorMsg = data.error;
 } catch (e) {}
 toast.error(errorMsg);
 setStatus('welcome');
 }
 } catch (error) {
 toast.error('Connection error');
 setStatus('welcome');
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

 const handleSaveToServer = async () => {
 setActionLoading(true);
 try {
 const res = await fetch('/api/wa/auth', {
 method: 'PUT',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({ deviceInfo })
 });
 if (res.ok) {
 toast.success('Connection info saved to server');
 } else {
 toast.error('Failed to save to server');
 }
 } catch (error) {
 toast.error('Save error');
 } finally {
 setActionLoading(false);
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


 const handleOnOpenchange = (newOpen) => {
 setActionLoading(false);
 onOpenChange(newOpen);
 };

 return (
 <Dialog open={open} onOpenChange={handleOnOpenchange}>
 <DialogContent className="min-w-[80vh] max-w-[80vh] max-h-[90vh] bg-card border text-white">
 <DialogTitle className="sr-only">WhatsApp Connection</DialogTitle>
 <DialogDescription className="sr-only">
 Manage your WhatsApp connection, scan QR code, and view connection status.
 </DialogDescription>
 <div className="p-6 space-y-6">
 {/* Header */}
 <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-[#1F2328] pb-4">
 <div>
 <h1 className="text-2xl font-bold text-white mb-1 flex items-center gap-2">
 <Smartphone className="w-6 h-6 text-emerald-500" />
 WhatsApp Connection
 </h1>
 <p className="text-muted-foreground text-sm">Connect your WhatsApp to start sending messages</p>
 </div>
 <Badge variant="outline" className={`py-1 px-3 flex items-center gap-2 border-0 ${currentStatus.color}/20 text-white shrink-0`}>
 <currentStatus.icon className="w-3.5 h-3.5" />
 {currentStatus.label}
 </Badge>
 </div>

 <div className="grid md:grid-cols-2 gap-6">
 {/* Connection Card */}
 <Card className="bg-[#1A1D21] border-[#2D3748] overflow-hidden">
 <CardHeader className="border-b border-[#2D3748] pb-4">
 <div className="flex items-center gap-3">
 <div className="p-2 bg-emerald-500/10 rounded-lg">
 <Smartphone className="w-5 h-5 text-emerald-500" />
 </div>
 <CardTitle className="text-white">Device Connection</CardTitle>
 </div>
 <CardDescription className="text-[#A0AEC0]">
 Scan the QR code to link your WhatsApp account
 </CardDescription>
 </CardHeader>

 <CardContent className="flex-1 flex flex-col items-center justify-center p-6 space-y-4">


 <AnimatePresence mode="wait">
 {status === 'qr' || status === 'connecting' ?
 <motion.div
 key="qr-container"
 initial={{ opacity: 0, scale: 0.9 }}
 animate={{ opacity: 1, scale: 1 }}
 exit={{ opacity: 0, scale: 0.9 }}
 className="p-4 bg-white rounded-xl shadow-lg min-w-[200px] min-h-[200px] flex items-center justify-center">
 
 {qrDataUrl ?
 <img src={qrDataUrl} alt="WhatsApp QR Code" className="w-48 h-48" /> :

 <div className="flex flex-col items-center justify-center space-y-3">
 <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
 <p className="text-xs text-zinc-500 font-medium">
 {status === 'connecting' ? 'Initializing...' : 'Generating QR...'}
 </p>
 </div>
 }
 </motion.div> :
 status === 'open' ?
 <motion.div
 key="connected"
 initial={{ opacity: 0, y: 10 }}
 animate={{ opacity: 1, y: 0 }}
 className="flex flex-col items-center text-center space-y-3">
 
 <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center border-2 border-emerald-500/20">
 <CheckCircle2 className="w-10 h-10 text-emerald-500" />
 </div>
 <div>
 <h3 className="text-xl font-semibold text-white">Connected!</h3>
 <p className="text-sm text-muted-foreground mt-1">Your WhatsApp is ready to use</p>
 {deviceInfo &&
 <div className="mt-2 text-xs text-muted-foreground">
 {deviceInfo.phoneNumber &&
 <p className="text-emerald-400">{deviceInfo.phoneNumber}</p>
 }
 {deviceInfo.deviceName &&
 <p>{deviceInfo.deviceName}</p>
 }
 </div>
 }
 </div>
 </motion.div> :

 <motion.div
 key="idle"
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 className="flex flex-col items-center text-center space-y-3">
 
 <div className="w-16 h-16 bg-[#2D3748] rounded-full flex items-center justify-center">
 <MessageSquare className="w-8 h-8 text-zinc-500" />
 </div>
 <p className="text-sm text-muted-foreground">Click connect to get started</p>
 </motion.div>
 }
 </AnimatePresence>
 </CardContent>

 <CardFooter className=" border-t border-[#2D3748] p-4 flex-col gap-3">
 {status === 'open' ?
 <div className="flex flex-col w-full gap-2">
 <Button
 variant="destructive"
 className="w-full gap-2"
 onClick={handleDisconnect}
 disabled={actionLoading}>
 
 <LogOut className="w-4 h-4" />
 Disconnect
 </Button>
 <Button
 variant="outline"
 className="w-full gap-2 border-emerald-500/50 text-emerald-500 hover:bg-emerald-500/10"
 onClick={handleSaveToServer}
 disabled={actionLoading}>
 
 <Save className="w-4 h-4" />
 Save to Server
 </Button>
 </div> :

 <>
 <Button
 className="w-full gap-2 bg-emerald-500 hover:bg-emerald-600 text-white"
 onClick={handleConnect}
 disabled={actionLoading || status === 'connecting' || status === 'qr'}>
 
 {status === 'connecting' ? <RefreshCcw className="w-4 h-4 animate-spin" /> : <Smartphone className="w-4 h-4" />}
 {status === 'qr' ? 'Waiting for Scan' : 'Connect Now'}
 </Button>
 
 {status === 'close' &&
 <Button
 variant="outline"
 className="w-full gap-2 text-destructive border-destructive/30 hover:bg-destructive/10"
 onClick={handleDisconnect}
 disabled={actionLoading}>
 
 <RefreshCcw className="w-4 h-4" />
 Force Reset Session
 </Button>
 }
 </>
 }
 </CardFooter>
 </Card>

 {/* Info Card */}
 <div className="space-y-4">
 {/* Security Info */}
 <Card className="bg-[#1A1D21] border-[#2D3748]">
 <CardHeader className="pb-3">
 <div className="flex items-center gap-3">
 <div className="p-2 bg-blue-500/10 rounded-lg">
 <Shield className="w-5 h-5 text-blue-500" />
 </div>
 <CardTitle className="text-white text-base">Security & Storage</CardTitle>
 </div>
 </CardHeader>
 <CardContent className="space-y-3">
 <div className="flex justify-between items-center py-2 border-b border-[#2D3748]">
 <span className="text-sm text-[#A0AEC0]">Encryption</span>
 <span className="text-sm font-medium text-white">AES-256-GCM</span>
 </div>
 <div className="flex justify-between items-center py-2 border-b border-[#2D3748]">
 <span className="text-sm text-[#A0AEC0]">Storage</span>
 <span className="text-sm font-medium text-white">PostgreSQL</span>
 </div>
 <div className="flex justify-between items-center py-2">
 <span className="text-sm text-[#A0AEC0]">Multi-Device</span>
 <Badge variant="secondary" className="bg-blue-500/10 text-blue-400 border-0 text-xs">Enabled</Badge>
 </div>
 </CardContent>
 </Card>

 {/* Connection Guide */}
 <Card className="bg-[#1A1D21] border-[#2D3748] border-l-4 border-l-emerald-500">
 <CardContent className="p-4">
 <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
 <AlertCircle className="w-4 h-4 text-emerald-500" />
 How to Connect
 </h4>
 <ol className="text-sm text-[#A0AEC0] space-y-2 list-decimal list-inside">
 <li>Open WhatsApp on your phone</li>
 <li>Tap Menu → Linked Devices</li>
 <li>Tap Link a Device</li>
 <li>Point camera at QR code</li>
 </ol>
 </CardContent>
 </Card>

 {/* Connection Status Info */}
 {status === 'qr' &&
 <Card className="bg-blue-500/5 border-blue-500/20">
 <CardContent className="p-4">
 <div className="flex items-start gap-3">
 <QrCode className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
 <div>
 <h4 className="font-semibold text-white text-sm">Scan QR Code</h4>
 <p className="text-xs text-[#A0AEC0] mt-1">
 The QR code refreshes automatically. If it expires, a new one will appear.
 </p>
 </div>
 </div>
 </CardContent>
 </Card>
 }

 {status === 'open' &&
 <Card className="bg-emerald-500/5 border-emerald-500/20">
 <CardContent className="p-4">
 <div className="flex items-start gap-3">
 <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
 <div>
 <h4 className="font-semibold text-white text-sm">All Set!</h4>
 <p className="text-xs text-[#A0AEC0] mt-1">
 You can now send messages, create campaigns, and manage your WhatsApp marketing.
 </p>
 </div>
 </div>
 </CardContent>
 </Card>
 }
 </div>
 </div>
 </div>
 </DialogContent>
 </Dialog>);

}