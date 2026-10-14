'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    Smartphone,
    MessageSquare,
    Send,
    Users,
    Zap,
    QrCode,
    Sparkles,
    ShieldCheck,
    Clock,
    RefreshCw,
    AlertCircle,
    CheckCircle2,
    Layers,
    ArrowUpRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import DeviceStatusCard from './_components/DeviceStatusCard';
import WhatsAppConnectionModal from './_components/WhatsAppConnectionModal';
import KonnectSuiteLaunchpad from './_components/KonnectSuiteLaunchpad';
import { getWhatsAppConnectionStatusAction } from './_actions/connection-actions';
import { toast } from 'sonner';

export default function KonnectLegacyDashboardPage() {
    const params = useParams();
    const router = useRouter();
    const workspaceId = params.workspaceId;

    const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
    const [connectionState, setConnectionState] = useState({
        status: 'DISCONNECTED',
        phoneNumber: null,
        deviceName: null,
        qrCode: null
    });
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Fetch initial connection status
    const refreshStatus = useCallback(async () => {
        if (!workspaceId) return;
        setIsRefreshing(true);
        try {
            const res = await getWhatsAppConnectionStatusAction(workspaceId);
            if (res.success) {
                setConnectionState(res);
            }
        } catch (err) {
            console.error("[KONNECT_REFRESH_STATUS_ERROR]", err);
        } finally {
            setIsRefreshing(false);
        }
    }, [workspaceId]);

    useEffect(() => {
        refreshStatus();
    }, [refreshStatus]);

    const isConnected = connectionState.status === 'CONNECTED';

    return (
        <div className="p-6 space-y-6 max-w-7xl mx-auto">
            {/* Header with Dual-Engine Badge & Quick Switch */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/20">
                <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20 shrink-0">
                        <Smartphone size={22} />
                    </div>
                    <div>
                        <div className="flex items-center gap-2 flex-wrap">
                            <h1 className="text-2xl font-bold tracking-tight text-foreground">Konnect</h1>
                            <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-400 border-emerald-500/30 font-bold px-2 py-0.5">
                                Legacy Multi-Device QR Engine
                            </Badge>
                            <Badge className="bg-primary/10 text-primary border-primary/20 text-[9px] font-mono">
                                Zero Meta API Fees
                            </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            Connect your physical phone directly via QR code. Freeform broadcast messaging, 2-way inbox, and AI auto-replies.
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2.5">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/workspace/${workspaceId}/konnectx`)}
                        className="h-8 text-xs border-border/50 text-muted-foreground hover:text-foreground gap-1.5"
                        title="Switch to official Meta Cloud API engine"
                    >
                        <span>KonnectX (Cloud API)</span>
                        <ArrowUpRight size={13} />
                    </Button>

                    <Button
                        size="sm"
                        onClick={() => setIsConnectModalOpen(true)}
                        className="h-8 text-xs bg-emerald-600 hover:bg-emerald-500 text-white gap-1.5 font-semibold shadow-md shadow-emerald-600/20"
                    >
                        <QrCode size={14} />
                        <span>{isConnected ? "Device Linked" : "Scan QR Code"}</span>
                    </Button>
                </div>
            </div>

            {/* Device Status Hero Card */}
            <DeviceStatusCard
                status={connectionState.status}
                phoneNumber={connectionState.phoneNumber}
                deviceName={connectionState.deviceName}
                onOpenConnectModal={() => setIsConnectModalOpen(true)}
                onRefreshStatus={refreshStatus}
            />

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                <Card className="border-border/40 bg-card/40 backdrop-blur-xl p-4 rounded-xl shadow-xs">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Session State</span>
                    <div className="flex items-center gap-2 mt-1">
                        <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                        <span className="text-sm font-bold text-foreground">
                            {isConnected ? 'Linked' : 'Scan Required'}
                        </span>
                    </div>
                </Card>

                <Card className="border-border/40 bg-card/40 backdrop-blur-xl p-4 rounded-xl shadow-xs">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Connected Mobile</span>
                    <span className="text-sm font-bold font-mono text-foreground mt-1 block">
                        {connectionState.phoneNumber ? `+${connectionState.phoneNumber}` : 'None'}
                    </span>
                </Card>

                <Card className="border-border/40 bg-card/40 backdrop-blur-xl p-4 rounded-xl shadow-xs">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Template Requirement</span>
                    <span className="text-sm font-bold text-emerald-400 mt-1 block">
                        None (Freeform)
                    </span>
                </Card>

                <Card className="border-border/40 bg-card/40 backdrop-blur-xl p-4 rounded-xl shadow-xs">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Conversation Cost</span>
                    <span className="text-sm font-bold text-primary mt-1 block">
                        $0.00 / Free
                    </span>
                </Card>
            </div>

            {/* Konnect Suite Launchpad */}
            <KonnectSuiteLaunchpad
                workspaceId={workspaceId}
                isConnected={isConnected}
            />

            {/* Connection QR Modal */}
            <WhatsAppConnectionModal
                isOpen={isConnectModalOpen}
                onClose={() => setIsConnectModalOpen(false)}
                workspaceId={workspaceId}
                onStatusChange={(newState) => setConnectionState(prev => ({ ...prev, ...newState }))}
            />
        </div>
    );
}
