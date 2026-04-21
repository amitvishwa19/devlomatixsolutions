"use client";

import { useParams } from "next/navigation";
import { useEffect, useState, useCallback, useRef } from "react";
import { CheckCircle2, MessageCircleDashed, Users, MessageSquare, AlertCircle, RefreshCcw, Power, Zap, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAction } from "@/hooks/use-action";
import { toast } from "sonner";
import QRCode from "react-qr-code";

import DashboardStats from "./_components/DashboardStats";
import RecentActivity from "./_components/RecentActivity";
import { getStatus } from "./_actions/get-status";
import { connectWa } from "./_actions/connect-wa";
import { disconnectWa } from "./_actions/disconnect-wa";
import { getActivities } from "./_actions/get-activities";

export default function DashboardPage() {
    const params = useParams();
    const workspaceId = params.workspaceId;
    const [statusData, setStatusData] = useState(null);
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pollingActive, setPollingActive] = useState(true);
    const pollInterval = useRef(null);
    const activityInterval = useRef(null);

    const { execute: executeGetStatus } = useAction(getStatus, {
        onSuccess: (data) => {
            setStatusData(data);
            if (data.status === 'open') {
                setPollingActive(false);
            }
        },
        onError: (err) => console.error("Poll Error:", err)
    });

    const { execute: executeGetActivities } = useAction(getActivities, {
        onSuccess: (data) => {
            setActivities(data.data || []);
        },
        onError: (err) => console.error("Activity Error:", err)
    });

    const { execute: executeConnect, isLoading: isConnecting } = useAction(connectWa, {
        onSuccess: () => {
            toast.success("Initializing engine...", { id: 'wa-init' });
            setPollingActive(true);
        }
    });

    const { execute: executeDisconnect, isLoading: isDisconnecting } = useAction(disconnectWa, {
        onSuccess: () => {
            toast.success("Engine terminated", { id: 'wa-term' });
            setStatusData(prev => ({ ...prev, status: 'close' }));
            setPollingActive(false);
        }
    });

    const fetchStatus = useCallback(() => {
        executeGetStatus({ workspaceId });
        executeGetActivities({ workspaceId });
    }, [workspaceId, executeGetStatus, executeGetActivities]);

    useEffect(() => {
        // Status polling (when connecting/qr)
        if (pollingActive) {
            fetchStatus();
            pollInterval.current = setInterval(fetchStatus, 8000);
        } else {
            if (pollInterval.current) clearInterval(pollInterval.current);
        }
        
        // Activity polling (always while dashboard is open)
        activityInterval.current = setInterval(() => executeGetActivities({ workspaceId }), 10000);

        return () => {
            if (pollInterval.current) clearInterval(pollInterval.current);
            if (activityInterval.current) clearInterval(activityInterval.current);
        };
    }, [pollingActive, fetchStatus, workspaceId, executeGetActivities]);

    useEffect(() => {
        if (workspaceId) {
            fetchStatus();
        }
    }, [workspaceId, fetchStatus]);

    const status = statusData?.status || 'close';

    return (
        <div className="space-y-4 animate-in fade-in duration-500 p-4">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-foreground">Dashboard</h2>
                    <p className="text-xs text-muted-foreground mt-1">Overview of your WhatsApp automation</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        className="gap-2"
                        asChild>
                        <a href={`/workspace/${workspaceId}/wa-business-api/contacts`}>
                            <Users className="w-4 h-4" />
                            <span className="hidden sm:inline">Contacts</span>
                        </a>
                    </Button>

                    {status === 'open' ? (
                         <Button
                            variant="destructive"
                            className="gap-2 cursor-pointer border"
                            onClick={() => executeDisconnect({ workspaceId })}
                            disabled={isDisconnecting}
                        >
                            <Power className="w-4 h-4" />
                            <span className="hidden sm:inline">Disconnect WA</span>
                        </Button>
                    ) : (
                        <Button
                            variant="default"
                            className="gap-2 cursor-pointer border bg-primary text-primary-foreground"
                            onClick={() => executeConnect({ workspaceId })}
                            disabled={isConnecting}
                        >
                            <MessageCircleDashed className="w-4 h-4" />
                            <span className="hidden sm:inline">Connect WA</span>
                        </Button>
                    )}
                </div>
            </div>

            <DashboardStats stats={statusData ? {
                campaigns: { total: 0, active: status === 'open' ? 1 : 0 },
                messages: { sent: statusData.messages?.length || 0, readRate: 0 },
                contacts: { total: "Synced" },
                templates: { approved: status.toUpperCase(), pending: status }
            } : null} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-base font-semibold text-foreground">
                            Browser Control <span className="text-sm text-muted-foreground">({status})</span>
                        </h3>
                    </div>

                    <div className="flex flex-col items-center justify-center py-12 px-4 text-center border rounded-lg border-dashed border-border bg-card/50 min-h-[400px]">
                        {status === 'qr' && statusData?.qr ? (
                            <div className="flex flex-col items-center space-y-6">
                                <div className="p-4 bg-white rounded-xl shadow-xl">
                                    <QRCode value={statusData.qr} size={250} />
                                </div>
                                <div className="max-w-sm">
                                    <h3 className="text-lg font-medium text-foreground">Scan QR Code</h3>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Open WhatsApp on your phone and scan this code to link your account.
                                    </p>
                                </div>
                            </div>
                        ) : status === 'open' ? (
                            <div className="flex flex-col items-center space-y-6">
                                <div className="p-6 bg-emerald-500/10 rounded-full border border-emerald-500/20 relative">
                                    <CheckCircle2 className="w-16 h-16 text-emerald-500" />
                                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full border-4 border-card flex items-center justify-center">
                                        <Zap className="w-3 h-3 text-white fill-current" />
                                    </div>
                                </div>
                                <div className="max-w-md w-full space-y-4">
                                    <div className="text-center">
                                        <h3 className="text-lg font-bold text-foreground">Protocol Synchronized</h3>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            The WhatsApp browser engine is active and broadcasting.
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-1 gap-2">
                                        <div className="flex items-center justify-between p-3 bg-muted/10 rounded-xl border border-border/40">
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">Account Name</span>
                                            <span className="text-xs font-bold text-foreground">{statusData?.user?.name || "WA Business"}</span>
                                        </div>
                                        <div className="flex items-center justify-between p-3 bg-muted/10 rounded-xl border border-border/40">
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">Identification</span>
                                            <span className="text-xs font-mono font-bold text-primary">{statusData?.user?.id?.split(':')[0] || "Unknown"}</span>
                                        </div>
                                        <div className="flex items-center justify-between p-3 bg-muted/10 rounded-xl border border-border/40">
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">Session Duration</span>
                                            <div className="flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                                <span className="text-xs font-bold text-emerald-500">
                                                    {statusData?.user?.connectedAt 
                                                        ? `${Math.floor((Date.now() - statusData.user.connectedAt) / 60000)}m active` 
                                                        : "Live"
                                                    }
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 pt-2">
                                        <Button variant="outline" className="flex-1 rounded-xl h-11" asChild>
                                            <a href={`/workspace/${workspaceId}/wa-business-api/chats`}>Go to Messenger</a>
                                        </Button>
                                        <Button 
                                            variant="ghost" 
                                            className="px-4 h-11 rounded-xl text-destructive hover:bg-destructive/10"
                                            onClick={() => executeDisconnect({ workspaceId })}
                                            disabled={isDisconnecting}
                                        >
                                            {isDisconnecting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Power className="w-4 h-4" />}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ) : isConnecting ? (
                            <div className="flex flex-col items-center space-y-4">
                                <Loader2 className="w-12 h-12 text-primary animate-spin" />
                                <p className="text-sm text-muted-foreground">Establishing handshake...</p>
                            </div>
                        ) : (
                            <>
                                <MessageCircleDashed className="w-12 h-12 text-muted-foreground/50 mb-4" />
                                <h3 className="text-lg font-medium text-foreground">Engine Hibernating</h3>
                                <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                                    The WhatsApp browser engine is currently offline. Wake it up to start sending messages.
                                </p>
                                <Button variant="outline" className="mt-6" onClick={() => executeConnect({ workspaceId })} disabled={isConnecting}>
                                    Wake Engine
                                </Button>
                            </>
                        )}
                    </div>
                </div>

                <div className="lg:col-span-1 space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-base font-semibold text-foreground">
                            Recent Activity <span className="text-sm text-muted-foreground">({activities.length})</span>
                        </h3>
                    </div>
                    <RecentActivity 
                        activities={activities} 
                    />
                </div>
            </div>
        </div>
    );
}
