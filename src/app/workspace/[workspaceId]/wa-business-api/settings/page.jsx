"use client";

import React, { useState, useEffect } from "react";
import { 
    Settings, 
    Shield, 
    Bell, 
    Database, 
    Smartphone, 
    Cloud, 
    Lock, 
    Cpu, 
    Zap, 
    Globe, 
    Server, 
    ShieldCheck, 
    History, 
    CheckCircle2, 
    AlertCircle, 
    SmartphoneNfc 
} from "lucide-react";
import { useParams } from "next/navigation";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import DynamicIcon from "@/components/global/DynamicIcon";

export default function SettingsPage() {
    const { workspaceId } = useParams();
    const [loading, setLoading] = useState(false);

    return (
        <div className="flex flex-col h-full text-foreground overflow-hidden">
            {/* Header Section Mirror */}
            <div className="flex items-center justify-between p-6 border-b border-border/40 bg-background/50 backdrop-blur-md sticky top-0 z-20">
                <div className="flex items-center gap-5">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-[0_0_20px_rgba(var(--primary-rgb),0.1)]">
                        <Settings className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-linear-to-r from-foreground to-foreground/60">Business Engine</h1>
                            <Badge variant="outline" className="h-5 px-2 text-[9px] font-bold uppercase tracking-widest border-primary/20 text-primary bg-primary/5">
                                Protocol v2.0
                            </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground font-medium mt-0.5">Manage your local WhatsApp browser automation instance.</p>
                    </div>
                </div>

                <div className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 shadow-sm">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500/80">
                        Node Synchronized
                    </span>
                </div>
            </div>

            {/* Tabs Navigation Mirror */}
            <Tabs defaultValue="general" className="flex-1 flex flex-col p-2 overflow-hidden">
                <TabsList className="bg-muted/5 w-full justify-start rounded-xl h-auto p-1.5 gap-2 mb-6 border border-border/20 backdrop-blur-sm">
                    {['general', 'automation', 'webhooks', 'security', 'performance'].map((tab) => (
                        <TabsTrigger
                            key={tab}
                            value={tab}
                            className="rounded-lg px-6 py-2.5 text-xs font-bold capitalize data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:border-primary/20 data-[state=active]:shadow-lg transition-all border border-transparent hover:bg-muted/10 opacity-70 data-[state=active]:opacity-100"
                        >
                            {tab}
                        </TabsTrigger>
                    ))}
                </TabsList>

                <TabsContent value="general" className="flex-1 outline-none overflow-y-auto pr-2 custom-scrollbar">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pb-20">
                        {/* Main Content (Left) */}
                        <div className="md:col-span-8 space-y-6">
                            <Card className="bg-card/20 border-none shadow-none relative">
                                <CardHeader className="flex flex-row items-center justify-between pb-6">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-primary/5 rounded-lg border border-primary/20">
                                            <Globe className="w-4 h-4 text-primary" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-base font-bold tracking-tight">Active Instance</CardTitle>
                                            <CardDescription className="text-xs font-medium">Browser Automation Node Configuration</CardDescription>
                                        </div>
                                    </div>
                                    <Badge className="bg-primary/20 text-primary border-primary/20 font-black h-6">CONNECTED</Badge>
                                </CardHeader>

                                <CardContent className="space-y-4">
                                    <div className="p-5 bg-background/40 backdrop-blur-sm rounded-xl border border-border/20 hover:border-primary/30 transition-all group shadow-sm">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="w-14 h-14 rounded-2xl bg-muted/20 border border-border/40 flex items-center justify-center text-muted-foreground group-hover:text-primary transition-all shadow-inner">
                                                    <Smartphone className="w-6 h-6" />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm font-bold tracking-tight">Linked Device</span>
                                                        <CheckCircle2 className="w-4 h-4 text-emerald-500 fill-emerald-500/10" />
                                                    </div>
                                                    <p className="text-[10px] text-muted-foreground font-mono">ID: BAILEYS_SESSION_ID</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Button variant="outline" size="sm" className="h-9 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest gap-2">
                                                    <RefreshCw className="w-3 h-3" /> Reconnect
                                                </Button>
                                                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl text-destructive hover:bg-destructive/10">
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="bg-card/20 border-none shadow-none relative">
                                <CardHeader>
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-amber-500/5 rounded-lg border border-amber-500/20">
                                            <Zap className="w-4 h-4 text-amber-500" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-base font-bold tracking-tight">Handshake Preferences</CardTitle>
                                            <CardDescription className="text-xs font-medium">Fine-tune how the engine interacts with WhatsApp</CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center justify-between p-4 bg-muted/10 rounded-xl border border-border/10">
                                        <div className="space-y-1">
                                            <Label className="text-sm font-bold">Multi-Device Support</Label>
                                            <p className="text-[10px] text-muted-foreground font-medium">Enable simultaneous connections across devices</p>
                                        </div>
                                        <Switch checked={true} />
                                    </div>
                                    <div className="flex items-center justify-between p-4 bg-muted/10 rounded-xl border border-border/10">
                                        <div className="space-y-1">
                                            <Label className="text-sm font-bold">Full Message Sync</Label>
                                            <p className="text-[10px] text-muted-foreground font-medium">Download historical messages upon linking</p>
                                        </div>
                                        <Switch checked={false} />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Sidebar Content (Right) */}
                        <div className="md:col-span-4 space-y-6">
                            <Card className="bg-primary/5 border border-primary/10 shadow-none rounded-2xl overflow-hidden">
                                <CardHeader className="pb-3 px-6 pt-6">
                                    <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-primary/80">Instance Health</CardTitle>
                                </CardHeader>
                                <CardContent className="px-6 pb-6 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[11px] font-bold text-muted-foreground">Uptime</span>
                                        <Badge variant="outline" className="font-mono text-[10px] border-primary/20 text-primary">12h 45m</Badge>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-[11px] font-bold text-muted-foreground">Status</span>
                                        <span className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-500">
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                            Active
                                        </span>
                                    </div>
                                    <Separator className="bg-primary/10" />
                                    <Button className="w-full h-10 rounded-xl font-bold uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20">
                                        Download Logs
                                    </Button>
                                </CardContent>
                            </Card>

                            <Card className="bg-card/20 border-none shadow-none rounded-2xl">
                                <CardHeader className="px-6 pt-6 pb-2">
                                    <CardTitle className="text-xs font-black uppercase tracking-widest text-muted-foreground/60">Help & Support</CardTitle>
                                </CardHeader>
                                <CardContent className="px-6 pb-6 pt-0">
                                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                                        Need help with the Business Engine? View our documentation for protocol details and troubleshooting.
                                    </p>
                                    <Button variant="ghost" className="w-full justify-between h-9 text-[10px] px-2 mt-4 font-bold uppercase tracking-widest text-primary hover:bg-primary/5 group" asChild>
                                        <a href="#">
                                            Protocol Docs
                                            <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                                        </a>
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}

// Mock/Helper Components for Portability
function Trash2(props) { return <SmartphoneNfc {...props} /> }
function RefreshCw(props) { return <SmartphoneNfc {...props} /> }
function ChevronRight(props) { return <SmartphoneNfc {...props} /> }
