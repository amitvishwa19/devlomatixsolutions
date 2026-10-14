'use client';

import React from 'react';
import {
    Smartphone,
    CheckCircle2,
    QrCode,
    AlertCircle,
    RefreshCw,
    LogOut,
    ExternalLink,
    Shield,
    Zap,
    Send
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function DeviceStatusCard({
    status = 'DISCONNECTED',
    phoneNumber = null,
    deviceName = null,
    onOpenConnectModal,
    onRefreshStatus
}) {
    const isConnected = status === 'CONNECTED';

    return (
        <Card className="border-border/40 bg-gradient-to-br from-emerald-500/10 via-card/50 to-primary/10 backdrop-blur-xl rounded-xl overflow-hidden shadow-xl relative">
            <div className="absolute top-0 right-0 p-6 pointer-events-none opacity-15">
                <Smartphone className="w-32 h-32 text-emerald-400" />
            </div>

            <CardHeader className="p-6 pb-4 border-b border-border/10">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg shrink-0 ${
                            isConnected
                                ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-emerald-500/20'
                                : 'bg-muted/40 border border-border/40 text-muted-foreground'
                        }`}>
                            <Smartphone size={24} />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 flex-wrap">
                                <CardTitle className="text-xl font-bold">WhatsApp Device Connection</CardTitle>
                                <Badge variant="outline" className={`text-[10px] font-bold px-2 py-0.5 border ${
                                    isConnected
                                        ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                                        : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                                }`}>
                                    {isConnected ? 'Linked & Multi-Device Active' : 'QR Scan Required'}
                                </Badge>
                                <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-[9px] font-mono">
                                    Baileys Legacy Protocol
                                </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                {isConnected
                                    ? `Directly linked to your physical phone (${deviceName || 'Mobile Device'}). Messages sync 2-way in real-time.`
                                    : 'Link your phone with a 1-time QR scan to send broadcasts, chat 2-way, and run AI auto-responders.'}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
                        {onRefreshStatus && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={onRefreshStatus}
                                className="h-8 text-xs border-border/50 hover:bg-card/80 gap-1.5"
                                title="Refresh Device State"
                            >
                                <RefreshCw size={13} />
                                <span>Refresh</span>
                            </Button>
                        )}

                        <Button
                            size="sm"
                            onClick={onOpenConnectModal}
                            className={`h-8 text-xs font-semibold gap-1.5 shadow-md ${
                                isConnected
                                    ? 'bg-card border border-border/60 hover:bg-card/80 text-foreground'
                                    : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20'
                            }`}
                        >
                            {isConnected ? (
                                <>
                                    <CheckCircle2 size={14} className="text-emerald-400" />
                                    <span>Device Settings</span>
                                </>
                            ) : (
                                <>
                                    <QrCode size={14} />
                                    <span>Scan QR Code</span>
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="p-6 pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                <div className="flex items-center gap-6 flex-wrap">
                    <div>
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Connected Phone</span>
                        <span className="text-sm font-black font-mono text-foreground">
                            {phoneNumber ? `+${phoneNumber}` : 'None Linked'}
                        </span>
                    </div>

                    <div className="w-px h-8 bg-border/40 hidden sm:block" />

                    <div>
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Protocol & Mode</span>
                        <span className="text-xs font-semibold text-muted-foreground">
                            Multi-Device WebSocket (Zero Meta API Fees)
                        </span>
                    </div>

                    <div className="w-px h-8 bg-border/40 hidden sm:block" />

                    <div>
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Meta Template Approval</span>
                        <span className="text-xs font-bold text-emerald-400">
                            Bypassed (Freeform Text & Media Allowed)
                        </span>
                    </div>
                </div>

                {!isConnected && (
                    <div className="text-[11px] text-amber-400/90 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-lg flex items-center gap-2">
                        <AlertCircle size={14} className="shrink-0" />
                        <span>Scan QR code with your phone to start messaging</span>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
