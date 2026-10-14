'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutGrid,
    MessageSquare,
    Users,
    Megaphone,
    Zap,
    Workflow,
    Bot,
    FileSpreadsheet,
    BarChart3,
    Settings2,
    Smartphone,
    QrCode,
    CheckCircle2,
    AlertCircle
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import WhatsAppConnectionModal from './WhatsAppConnectionModal';
import { getWhatsAppConnectionStatusAction } from '../_actions/connection-actions';

export default function KonnectSubNav({ workspaceId }) {
    const pathname = usePathname();
    const [isConnected, setIsConnected] = useState(false);
    const [devicePhone, setDevicePhone] = useState(null);
    const [isQrModalOpen, setIsQrModalOpen] = useState(false);

    const basePath = `/workspace/${workspaceId}/konnectx-legacy`;

    const navItems = [
        { label: "Dashboard", href: basePath, icon: LayoutGrid, exact: true },
        { label: "Messages", href: `${basePath}/chats`, icon: MessageSquare },
        { label: "Contacts", href: `${basePath}/contacts`, icon: Users },
        { label: "Templates", href: `${basePath}/template`, icon: Zap },
        { label: "Campaigns", href: `${basePath}/campaigns`, icon: Megaphone },
        { label: "Bulk Sender", href: `${basePath}/bulk-sender`, icon: Zap },
        { label: "Flows", href: `${basePath}/flows`, icon: Workflow },
        { label: "Chatbot", href: `${basePath}/chatbot`, icon: Bot },
        { label: "Reports", href: `${basePath}/reports`, icon: FileSpreadsheet },
        { label: "Analytics", href: `${basePath}/analytics`, icon: BarChart3 },
        { label: "Settings", href: `${basePath}/settings`, icon: Settings2 },
    ];

    useEffect(() => {
        let isMounted = true;
        const checkStatus = async () => {
            const res = await getWhatsAppConnectionStatusAction(workspaceId);
            if (isMounted && res.success) {
                setIsConnected(res.status === 'CONNECTED');
                setDevicePhone(res.phoneNumber);
            }
        };
        checkStatus();
        const interval = setInterval(checkStatus, 10000);
        return () => {
            isMounted = false;
            clearInterval(interval);
        };
    }, [workspaceId]);

    return (
        <div className="w-full border-b border-border/40 bg-card/40 backdrop-blur-md sticky top-0 z-30">
            <div className="px-4 py-2.5 flex items-center justify-between gap-4">
                {/* Brand / Header */}
                <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
                        <Smartphone className="h-4 w-4" />
                    </div>
                    <div>
                        <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-sm tracking-tight text-foreground">Konnect</span>
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-emerald-500/30 text-emerald-500 bg-emerald-500/5">
                                QR Multi-Device
                            </Badge>
                        </div>
                    </div>
                </div>

                {/* Sub Nav Links */}
                {/* <div className="flex items-center gap-1 overflow-x-auto py-0.5 scrollbar-none">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = item.exact
                            ? pathname === item.href
                            : pathname.startsWith(item.href);

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all whitespace-nowrap ${isActive
                                        ? "bg-primary text-primary-foreground shadow-sm"
                                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                                    }`}
                            >
                                <Icon className="h-3.5 w-3.5" />
                                <span>{item.label}</span>
                            </Link>
                        );
                    })}
                </div> */}

                {/* Connection Pill */}
                <div className="flex items-center gap-2 flex-shrink-0">
                    <Button
                        size="sm"
                        variant={isConnected ? "outline" : "default"}
                        onClick={() => setIsQrModalOpen(true)}
                        className={`h-7 px-2.5 text-xs gap-1.5 rounded-full ${isConnected
                            ? "border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/10"
                            : "bg-emerald-600 hover:bg-emerald-700 text-white animate-pulse"
                            }`}
                    >
                        {isConnected ? (
                            <>
                                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                                <span className="hidden sm:inline font-mono text-[11px]">{devicePhone ? `+${devicePhone}` : 'Connected'}</span>
                            </>
                        ) : (
                            <>
                                <QrCode className="h-3.5 w-3.5" />
                                <span>Scan QR</span>
                            </>
                        )}
                    </Button>
                </div>
            </div>

            <WhatsAppConnectionModal
                isOpen={isQrModalOpen}
                onClose={() => setIsQrModalOpen(false)}
                workspaceId={workspaceId}
                initialStatus={isConnected ? 'CONNECTED' : 'DISCONNECTED'}
                onConnected={() => setIsConnected(true)}
            />
        </div>
    );
}
