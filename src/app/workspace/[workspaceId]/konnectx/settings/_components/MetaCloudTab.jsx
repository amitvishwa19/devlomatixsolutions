// @ts-nocheck
'use client';

import React, { useState, useEffect } from 'react';
import {
    Zap,
    RefreshCw,
    ChevronRight,
    Trash2,
    Info,
    Plus,
    List,
    ExternalLink,
    Globe,
    Printer,
    Download,
    QrCode,
    Search,
    Pencil
} from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";

import { useAction } from "@/hooks/use-action";
import { testMetaApi } from "../_actions/test-meta-api";
import { getDecryptedCredentials } from "../_actions/get-decrypted-credentials";
import html2canvas from 'html2canvas';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

export function MetaCloudTab({ workspaceId }) {
    const [metaCloudVersion, setMetaCloudVersion] = useState('v25.0');
    const [metaCloudAccessToken, setMetaCloudAccessToken] = useState('');
    const [phoneId, setPhoneId] = useState('');

    const [qrMessage, setQrMessage] = useState('');
    const [qrFormat, setQrFormat] = useState('PNG');
    const [qrTesting, setQrTesting] = useState(false);
    const [qrList, setQrList] = useState([]);
    const [qrListTesting, setQrListTesting] = useState(false);

    const [selectedQR, setSelectedQR] = useState(null);
    const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [deletingCode, setDeletingCode] = useState(null);
    const [editingQR, setEditingQR] = useState(null);
    const [editMessage, setEditMessage] = useState('');
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);

    const { execute: executeGetDecrypted } = useAction(getDecryptedCredentials, {
        onSuccess: (data) => {
            const token = data?.accessToken || data.data?.accessToken;
            const pid = data?.phoneNumberId ? data.phoneNumberId.toString() : data.data?.phoneNumberId?.toString();

            console.log("[QR Management] Decrypted credentials:", { hasToken: !!token, pid });

            if (token) setMetaCloudAccessToken(token);
            if (pid) {
                setPhoneId(pid);
                // Trigger auto-fetch of QR list
                fetchQrList(token, pid);
            } else {
                console.warn("[QR Management] No Phone Number ID found in credentials");
            }
        }
    });

    useEffect(() => {
        if (workspaceId) {
            executeGetDecrypted({ workspaceId });
        }
    }, [workspaceId]);

    const { execute: executeApi } = useAction(testMetaApi, {
        onSuccess: (data, context) => {
            console.log(`[QR Management] ${context.type} success:`, data);
            if (data.success) {
                if (context.type === 'qr_list') {
                    const list = data.apiData.data || [];
                    console.log(`[QR Management] Fetched ${list.length} QR codes`);
                    setQrList(list);
                } else if (context.type === 'qr_create') {
                    toast.success("QR Code created");
                    setQrMessage('');
                    fetchQrList();
                } else if (context.type === 'qr_delete') {
                    toast.success("QR Code deleted");
                    fetchQrList();
                } else if (context.type === 'qr_update') {
                    toast.success("QR Code updated");
                    setIsEditModalOpen(false);
                    setEditingQR(null);
                    fetchQrList();
                }
            } else {
                console.error(`[QR Management] ${context.type} error:`, data.error);
                toast.error(data.error || "Operation failed");
            }
            setQrTesting(false);
            setQrListTesting(false);
            setDeletingCode(null);
            setIsUpdating(false);
        },
        onError: (error) => {
            toast.error(error);
            setQrTesting(false);
            setQrListTesting(false);
            setDeletingCode(null);
            setIsUpdating(false);
        }
    });

    const fetchQrList = (tokenOverride, pidOverride) => {
        const activeToken = tokenOverride || metaCloudAccessToken;
        const activePid = pidOverride || phoneId;

        console.log("[QR Management] Attempting fetch with:", { hasToken: !!activeToken, hasPid: !!activePid });

        if (!activeToken || !activePid) {
            console.warn("[QR Management] Fetch aborted: Missing token or phoneId");
            return;
        }

        setQrListTesting(true);
        const url = `https://graph.facebook.com/${metaCloudVersion}/${activePid}/message_qrdls`;
        console.log("[QR Management] Fetching URL:", url);

        executeApi({
            workspaceId,
            url,
            headers: { 'Authorization': `Bearer ${activeToken}` }
        }, { type: 'qr_list' });
    };

    const handleCreateQR = () => {
        if (!qrMessage.trim()) return;
        setQrTesting(true);
        executeApi({
            workspaceId,
            url: `https://graph.facebook.com/${metaCloudVersion}/${phoneId}/message_qrdls`,
            method: 'POST',
            headers: { 'Authorization': `Bearer ${metaCloudAccessToken}` },
            body: { prefilled_message: qrMessage.trim(), generate_qr_image: qrFormat }
        }, { type: 'qr_create' });
    };

    const handleDeleteQR = (qr) => {
        setDeletingCode(qr.code);
        executeApi({
            workspaceId,
            url: `https://graph.facebook.com/${metaCloudVersion}/${phoneId}/message_qrdls/${qr.code}`,
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${metaCloudAccessToken}` }
        }, { type: 'qr_delete' });
    };

    const handleUpdateQR = () => {
        if (!editingQR || !editMessage.trim()) return;
        setIsUpdating(true);
        executeApi({
            workspaceId,
            url: `https://graph.facebook.com/${metaCloudVersion}/${phoneId}/message_qrdls/${editingQR.code}`,
            method: 'POST',
            headers: { 'Authorization': `Bearer ${metaCloudAccessToken}` },
            body: { prefilled_message: editMessage.trim() }
        }, { type: 'qr_update' });
    };

    const saveQR = async (qr, elementRef) => {
        const imageUrl = qr.qr_image_url || `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(qr.deep_link_url)}`;
        const fileName = `whatsapp-qr-${qr.code}.png`;

        const downloadBlob = (blob) => {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        };

        try {
            const response = await fetch(imageUrl);
            if (response.ok) {
                const blob = await response.blob();
                downloadBlob(blob);
                toast.success("QR Code saved");
                return;
            }
        } catch (error) {
            console.warn("QR image fetch failed, falling back to canvas capture:", error);
        }

        try {
            const node = typeof elementRef === 'string' ? document.getElementById(elementRef) : elementRef?.current;
            if (node) {
                const canvas = await html2canvas(node, { useCORS: true, backgroundColor: '#ffffff' });
                canvas.toBlob((blob) => {
                    if (blob) {
                        downloadBlob(blob);
                        toast.success("QR Code saved");
                    }
                }, 'image/png');
            } else {
                window.open(imageUrl, '_blank');
            }
        } catch (error) {
            console.error("Canvas capture failed:", error);
            window.open(imageUrl, '_blank');
        }
    };

    const filteredQRs = qrList.filter(qr =>
        qr.prefilled_message?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        qr.code?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handlePrint = () => {
        const printContent = document.getElementById('qr-print-area');
        const windowUrl = 'about:blank';
        const uniqueName = new Date();
        const windowName = 'Print' + uniqueName.getTime();
        const printWindow = window.open(windowUrl, windowName, 'left=500,top=500,width=900,height=900');

        printWindow.document.write(`
            <html>
                <head>
                    <title>Print QR Code</title>
                    <style>
                        body { font-family: sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 40px; }
                        .qr-title { font-size: 24px; font-weight: bold; margin-bottom: 20px; }
                        .qr-image { width: 300px; height: 300px; }
                        .qr-link { margin-top: 20px; color: #666; font-size: 12px; }
                    </style>
                </head>
                <body>
                    <div class="qr-title">${selectedQR?.prefilled_message || 'WhatsApp QR Code'}</div>
                    <img src="${selectedQR?.qr_image_url || `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(selectedQR?.deep_link_url || '')}`}" class="qr-image" />
                    <div class="qr-link">${selectedQR?.deep_link_url}</div>
                    <script>
                        setTimeout(() => {
                            window.print();
                            window.close();
                        }, 500);
                    </script>
                </body>
            </html>
        `);
        printWindow.document.close();
    };

    return (
        <ScrollArea className="h-full w-full">
            <div className="flex-1 outline-none  pb-20">
                <div className=" mx-auto space-y-4">

                    {/* Header Section */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card border rounded-2xl p-6 shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-primary/5 rounded-2xl border border-primary/10">
                                <QrCode className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold tracking-tight">QR Management</h2>
                                <p className="text-sm text-muted-foreground font-medium">Create and manage your WhatsApp deep-link QR codes</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Button variant="outline" size="sm" className="h-10 rounded-xl gap-2" onClick={() => fetchQrList()}>
                                <RefreshCw className={`w-4 h-4 ${qrListTesting ? 'animate-spin' : ''}`} />
                                Refresh List
                            </Button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                        {/* Create Form (Left/Top) */}
                        <Card className="md:col-span-4 border shadow-sm h-fit">
                            <CardHeader>
                                <CardTitle className="text-base font-bold">New QR Code</CardTitle>
                                <CardDescription className="text-xs">Generate a deep link with a pre-filled message</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label className="text-[11px] font-bold uppercase text-muted-foreground">Prefilled Message</Label>
                                    <Input
                                        placeholder="e.g. Hello, I want to inquire about..."
                                        value={qrMessage}
                                        onChange={(e) => setQrMessage(e.target.value)}
                                        className="bg-muted/5 text-sm h-11"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[11px] font-bold uppercase text-muted-foreground">Image Format</Label>
                                    <Select value={qrFormat} onValueChange={setQrFormat}>
                                        <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="SVG">SVG (Vector)</SelectItem>
                                            <SelectItem value="PNG">PNG (Image)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <Button
                                    onClick={handleCreateQR}
                                    disabled={qrTesting || !qrMessage.trim()}
                                    className="w-full h-11 gap-2 font-bold shadow-sm"
                                >
                                    {qrTesting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                                    Create QR Code
                                </Button>
                            </CardContent>
                        </Card>

                        {/* List (Right/Bottom) */}
                        <div className="md:col-span-8 space-y-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
                                <Input
                                    placeholder="Search by message or code..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10 h-11 bg-card shadow-sm border-muted-foreground/10"
                                />
                            </div>

                            {qrListTesting ? (
                                <div className="flex flex-col items-center justify-center py-20 bg-card border rounded-2xl gap-3">
                                    <RefreshCw className="w-8 h-8 text-primary animate-spin" />
                                    <p className="text-sm font-medium text-muted-foreground">Fetching QR codes...</p>
                                </div>
                            ) : filteredQRs.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {filteredQRs.map((qr) => (
                                        <Card key={qr.code} className="border shadow-sm hover:border-primary/20 transition-all group overflow-hidden bg-card">
                                            <div className="p-4 space-y-4">
                                                <div className="flex items-start justify-between gap-2">
                                                    <div className="flex-1 min-w-0">
                                                        <h3 className="text-sm font-bold truncate leading-tight">{qr.prefilled_message || 'No Message'}</h3>
                                                        <p className="text-[10px] font-mono text-muted-foreground/60 mt-1 uppercase tracking-tighter">ID: {qr.code}</p>
                                                    </div>
                                                    <Badge variant="secondary" className="bg-primary/5 text-primary border-none text-[9px] font-bold">ACTIVE</Badge>
                                                </div>

                                                <div className="aspect-square relative bg-muted/10 rounded-xl border border-dashed border-muted-foreground/20 flex items-center justify-center overflow-hidden group-hover:border-primary/30 transition-colors">
                                                    <img
                                                        src={qr.qr_image_url || `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(qr.deep_link_url)}`}
                                                        alt="QR Code"
                                                        className="w-full h-full object-contain p-4 transition-transform group-hover:scale-105"
                                                    />
                                                    <div className="absolute inset-0 bg-background/60 backdrop-blur-sm opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition-all">
                                                        <Button size="icon" variant="secondary" className="h-10 w-10 rounded-full shadow-lg" onClick={() => { setSelectedQR(qr); setIsPrintModalOpen(true); }}>
                                                            <Printer className="w-4 h-4" />
                                                        </Button>
                                                        <Button size="icon" variant="secondary" className="h-10 w-10 rounded-full shadow-lg" onClick={() => saveQR(qr)}>
                                                            <Download className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="flex-1 h-9 rounded-lg text-xs font-bold gap-2 text-muted-foreground hover:bg-muted/50 transition-colors"
                                                        onClick={() => { setSelectedQR(qr); setIsPrintModalOpen(true); }}
                                                    >
                                                        View & Print
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-9 w-9 rounded-lg text-muted-foreground hover:bg-muted/50 transition-colors"
                                                        onClick={() => { setEditingQR(qr); setEditMessage(qr.prefilled_message || ''); setIsEditModalOpen(true); }}
                                                    >
                                                        <Pencil className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-9 w-9 rounded-lg text-destructive hover:bg-destructive/10 transition-colors"
                                                        onClick={() => handleDeleteQR(qr)}
                                                        disabled={deletingCode === qr.code}
                                                    >
                                                        {deletingCode === qr.code ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                                    </Button>
                                                </div>
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-24 bg-card border border-dashed rounded-2xl gap-4 text-center">
                                    <div className="p-4 bg-muted/10 rounded-full">
                                        <QrCode className="w-8 h-8 text-muted-foreground/20" />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm font-bold text-muted-foreground">No QR codes found</p>
                                        <p className="text-[11px] text-muted-foreground/60">Create your first deep-link QR code to see it here</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Print Modal */}
                <Dialog open={isPrintModalOpen} onOpenChange={setIsPrintModalOpen}>
                    <DialogContent className="sm:max-w-[450px] rounded-3xl p-0 overflow-hidden">
                        <div id="qr-print-area" className="flex flex-col items-center p-10 bg-background">
                            <DialogHeader className="w-full text-center space-y-4 mb-8">
                                <div className="mx-auto p-3 bg-primary/5 rounded-2xl border border-primary/10 w-fit">
                                    <QrCode className="w-8 h-8 text-primary" />
                                </div>
                                <div className="space-y-1.5">
                                    <DialogTitle className="text-xl font-bold text-center">{selectedQR?.prefilled_message || 'WhatsApp QR'}</DialogTitle>
                                    <DialogDescription className="text-xs font-medium text-center">Scan to chat with us</DialogDescription>
                                </div>
                            </DialogHeader>

                            <div className="relative aspect-square w-64 bg-white p-4 rounded-3xl border-4 border-muted/20 shadow-xl mb-8 flex items-center justify-center" id="qr-save-area">
                                <img
                                    src={selectedQR?.qr_image_url || `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(selectedQR?.deep_link_url || '')}`}
                                    alt="QR Code"
                                    className="w-full h-full object-contain"
                                />
                            </div>

                            <div className="w-full bg-muted/5 p-4 rounded-2xl border border-dashed text-center">
                                <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest mb-1">Deep Link URL</p>
                                <p className="text-xs font-mono text-primary truncate max-w-full px-2">{selectedQR?.deep_link_url}</p>
                            </div>
                        </div>
                        <DialogFooter className="p-6 bg-muted/5 border-t gap-3 sm:gap-0">
                            <Button variant="ghost" className="flex-1 font-bold" onClick={() => setIsPrintModalOpen(false)}>Cancel</Button>
                            <Button variant="outline" className="flex-1 gap-2 font-bold" onClick={() => selectedQR && saveQR(selectedQR, 'qr-save-area')}>
                                <Download className="w-4 h-4" />
                                Save Image
                            </Button>
                            <Button className="flex-1 gap-2 font-bold shadow-md" onClick={handlePrint}>
                                <Printer className="w-4 h-4" />
                                Print Now
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Edit Modal */}
                <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                    <DialogContent className="sm:max-w-[425px] rounded-2xl">
                        <DialogHeader>
                            <DialogTitle>Edit QR Code</DialogTitle>
                            <DialogDescription>Update the prefilled message for this QR code.</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label>Prefilled Message</Label>
                                <Input
                                    value={editMessage}
                                    onChange={(e) => setEditMessage(e.target.value)}
                                    placeholder="Enter message..."
                                    className="h-11"
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="ghost" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
                            <Button onClick={handleUpdateQR} disabled={isUpdating || !editMessage.trim()} className="gap-2">
                                {isUpdating && <RefreshCw className="w-4 h-4 animate-spin" />}
                                Update Message
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </ScrollArea>
    );
}
