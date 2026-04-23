// @ts-nocheck
'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import {
    Key,
    Smartphone,
    LogOut,
    Plus,
    Trash2,
    Settings,
    Zap,
    Globe,
    Lock,
    Terminal,
    Clock,
    User,
    Server,
    ExternalLink,
    Cpu,
    Bell,
    ShieldCheck,
    Info,
    Share2,
    Database,
    Link as LinkIcon,
    Mail,
    BellRing,
    History
} from 'lucide-react';
import { toast } from 'sonner';

import SonarLoader from '@/components/global/SonarLoader';
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TooltipProvider } from "@/components/ui/tooltip";

import { useAction } from "@/hooks/use-action";
import { getWaMetadata } from "./_actions/get-wa-metadata";

// Modular Components
import { GeneralTab } from './_components/GeneralTab';
import { AutomationTab } from './_components/AutomationTab';
import { WebhooksTab } from './_components/WebhooksTab';
import { MessagingTab } from './_components/MessagingTab';
import { NotificationsTab } from './_components/NotificationsTab';
import { SecurityTab } from './_components/SecurityTab';
import { MetaCloudTab } from './_components/MetaCloudTab';

export default function SettingsPage() {
    const [metadata, setMetadata] = useState({});
    const [loading, setLoading] = useState(true);
    const [isSwitchingAccount, setIsSwitchingAccount] = useState(false);

    const params = useParams();
    const workspaceId = params?.workspaceId;

    const { execute: executeGetMetadata } = useAction(getWaMetadata, {
        onSuccess: (data) => {
            setMetadata(data.metadata || {});
            setLoading(false);
        },
        onError: () => setLoading(false)
    });

    useEffect(() => {
        if (workspaceId) {
            executeGetMetadata({ workspaceId });
        }
    }, [workspaceId]);

    // if (loading) {
    //     return (
    //         <div className="flex items-center justify-center h-full">
    //             <SonarLoader show={true} text="Initializing Engine..." />
    //         </div>
    //     );
    // }

    return (
        <TooltipProvider>
            <SonarLoader show={isSwitchingAccount} text="Switching account..." />
            <div className="flex flex-col h-full text-foreground overflow-hidden">

                {/* Header Section */}
                <div className="flex items-center justify-between p-6 border-b border-border/40 bg-background/50 backdrop-blur-md sticky top-0 z-20">
                    <div className="flex items-center gap-5">
                        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-[0_0_20px_rgba(var(--primary-rgb),0.1)]">
                            <DynamicIcon name="whatsapp" className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                            <div className="flex items-center justify-between shrink-0 mb-2">
                                <div className="space-y-1">
                                    <h1 className="text-2xl font-semibold tracking-tight text-foreground">WhatsApp Settings</h1>
                                    <p className="text-sm text-muted-foreground">Configure your WhatsApp Cloud API instance and automation rules.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/5 border border-primary/10">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-xs font-medium text-foreground/80">
                            Service Active
                        </span>
                    </div>
                </div>

                {/* Tabs Navigation */}
                <Tabs defaultValue="general" className="flex-1 flex flex-col overflow-hidden p-2">


                    <TabsList className="bg-card w-full  justify-start rounded-md h-auto  gap-1  border">
                        {[
                            { id: 'general', label: 'General', icon: Settings },
                            { id: 'automation', label: 'Automation', icon: Zap },
                            { id: 'webhooks', label: 'Webhooks', icon: LinkIcon },
                            { id: 'messaging', label: 'Messaging', icon: Smartphone },
                            { id: 'notifications', label: 'Notifications', icon: BellRing },
                            { id: 'security', label: 'Security', icon: ShieldCheck },
                            { id: 'meta-cloud', label: 'Meta Cloud', icon: Cpu }
                        ].map((tab) => (
                            <TabsTrigger
                                key={tab.id}
                                value={tab.id}
                                className="flex items-center w-32 gap-2 px-4 py-2 text-xs font-medium transition-all rounded-md data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm hover:bg-background/50"
                            >
                                <tab.icon size={14} />
                                {tab.label}
                            </TabsTrigger>
                        ))}
                    </TabsList>

                    <TabsContent value="general" className="flex-1 overflow-hidden flex flex-col outline-none">
                        <GeneralTab
                            workspaceId={workspaceId}
                            metaCloudVersion="v25.0"
                            metadata={metadata}
                            setMetadata={setMetadata}
                        />
                    </TabsContent>

                    <TabsContent value="automation" className="flex-1 overflow-hidden flex flex-col outline-none">
                        <AutomationTab
                            workspaceId={workspaceId}
                            metadata={metadata}
                            setMetadata={setMetadata}
                        />
                    </TabsContent>

                    <TabsContent value="webhooks" className="flex-1 overflow-hidden flex flex-col outline-none">
                        <WebhooksTab
                            workspaceId={workspaceId}
                            metadata={metadata}
                            setMetadata={setMetadata}
                        />
                    </TabsContent>

                    <TabsContent value="messaging" className="flex-1 overflow-hidden flex flex-col outline-none">
                        <MessagingTab
                            workspaceId={workspaceId}
                            metadata={metadata}
                            setMetadata={setMetadata}
                        />
                    </TabsContent>

                    <TabsContent value="notifications" className="flex-1 overflow-hidden flex flex-col outline-none">
                        <NotificationsTab
                            workspaceId={workspaceId}
                            metadata={metadata}
                            setMetadata={setMetadata}
                        />
                    </TabsContent>

                    <TabsContent value="security" className="flex-1 overflow-hidden flex flex-col outline-none">
                        <SecurityTab />
                    </TabsContent>

                    <TabsContent value="meta-cloud" className="flex-1 overflow-hidden flex flex-col outline-none">
                        <MetaCloudTab workspaceId={workspaceId} />
                    </TabsContent>
                </Tabs>
            </div>
        </TooltipProvider>
    );
}

function DynamicIcon({ name, className }) {
    if (name === 'whatsapp') {
        return (
            <svg className={className} viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
            </svg>
        );
    }
    return <Key className={className} />;
}
