'use client';

import React, { useState, useEffect } from 'react';
import {
    ShoppingBag,
    Store,
    TrendingUp,
    ShoppingCart,
    Package,
    Plus,
    ExternalLink,
    RefreshCcw,
    AlertCircle,
    CheckCircle2,
    Loader2,
    Zap
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAction } from "@/hooks/use-action";
import { getStores } from "./_actions/get-stores";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { ShopifyConnectModal } from "./_components/ShopifyConnectModal";
import { WooCommerceConnectModal } from "./_components/WooCommerceConnectModal";

const stats = [
    { label: "Total Revenue", value: "₹45,230", change: "+12.5%", icon: TrendingUp, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { label: "Total Orders", value: "142", change: "+8.2%", icon: Package, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "Abandoned Carts", value: "28", change: "-4.1%", icon: ShoppingCart, color: "text-amber-500", bg: "bg-amber-500/10" },
    { label: "Recovery Rate", value: "64.2%", change: "+2.4%", icon: ShoppingBag, color: "text-purple-500", bg: "bg-purple-500/10" }
];

export default function ECommercePage() {
    const params = useParams();
    const workspaceId = params.workspaceId;
    const [isLoading, setIsLoading] = useState(true);
    const [stores, setStores] = useState([]);
    const [isShopifyModalOpen, setIsShopifyModalOpen] = useState(false);
    const [isWooModalOpen, setIsWooModalOpen] = useState(false);

    const { execute: executeGetStores } = useAction(getStores, {
        onSuccess: (data) => {
            setStores(data.stores || []);
            setIsLoading(false);
        },
        onError: (err) => {
            toast.error(err || "Failed to load stores");
            setIsLoading(false);
        }
    });

    const fetchStores = () => {
        if (!workspaceId || workspaceId === '[workspaceId]') return;
        setIsLoading(true);
        executeGetStores({ workspaceId });
    };

    useEffect(() => {
        if (workspaceId && workspaceId !== '[workspaceId]') {
            fetchStores();
        }
    }, [workspaceId]);

    return (
        <div className="flex flex-col h-full text-foreground overflow-hidden">
            {/* Header Area - Matching Settings Page */}
            <div className="flex items-center justify-between p-6 border-b border-border/40 bg-background/50 backdrop-blur-md sticky top-0 z-20">
                <div className="flex items-center gap-5">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-[0_0_20px_rgba(var(--primary-rgb),0.1)]">
                        <ShoppingBag className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/60">eCommerce</h1>
                            <Badge variant="outline" className="h-5 px-2 text-[9px] font-bold uppercase tracking-widest border-primary/20 text-primary bg-primary/5">
                                Connect Hub
                            </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground font-medium mt-0.5">Manage your Shopify and WooCommerce integrations.</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={fetchStores}
                        className="h-9 px-4 rounded-xl text-xs font-bold transition-all border border-border/20 shadow-sm"
                    >
                        <RefreshCcw className="mr-2 h-3.5 w-3.5" />
                        Sync Data
                    </Button>
                    <Button
                        size="sm"
                        onClick={() => setIsShopifyModalOpen(true)}
                        className="h-9 px-4 rounded-xl text-xs font-bold bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 transition-all active:scale-95"
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        Connect Store
                    </Button>
                </div>
            </div>

            {/* Main Content Area - Scrollable */}
            <div className="flex-1 custom-scrollbar overflow-y-auto p-6 pt-2">
                {/* Stats Section - Using Settings-like Card Spacing */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    {stats.map((stat, i) => (
                        <Card key={i} className="p-4 bg-background/40 backdrop-blur-sm rounded-xl border border-border/20 hover:border-primary/30 transition-all shadow-sm">
                            <div className="flex items-center justify-between mb-3">
                                <div className={`p-2 rounded-lg ${stat.bg} border border-border/10`}>
                                    <stat.icon className={`h-4 w-4 ${stat.color}`} />
                                </div>
                                <Badge variant="outline" className="h-4 px-1.5 text-[8px] font-black uppercase tracking-tighter border-border/20">
                                    {stat.change}
                                </Badge>
                            </div>
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">{stat.label}</h3>
                            <div className="text-xl font-bold tracking-tight">{stat.value}</div>
                        </Card>
                    ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                    {/* Main Content (Left) - Store Management */}
                    <div className="md:col-span-8 space-y-6">
                        <Card className="p-0 bg-transparent shadow-none border-none">
                            <div className="flex items-center justify-between mb-4 px-2">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-primary/5 rounded-lg border border-primary/20">
                                        <Store className="w-4 h-4 text-primary" />
                                    </div>
                                    <div>
                                        <h2 className="text-sm font-bold tracking-tight">Connected Stores</h2>
                                        <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest">Active Integrations</p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                {isLoading ? (
                                    <div className="h-64 flex flex-col items-center justify-center bg-background/40 backdrop-blur-sm rounded-2xl border border-border/20 border-dashed">
                                        <Loader2 className="h-8 w-8 text-primary animate-spin mb-3" />
                                        <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Syncing Vault...</p>
                                    </div>
                                ) : stores.length === 0 ? (
                                    <div className="h-80 flex flex-col items-center justify-center bg-background/40 backdrop-blur-sm rounded-2xl border border-border/20 border-dashed relative overflow-hidden group">
                                        <div className="p-6 bg-primary/5 rounded-full mb-4 border border-primary/10">
                                            <Store size={32} className="text-primary/30" />
                                        </div>
                                        <h3 className="text-base font-bold mb-1">No Stores Linked</h3>
                                        <p className="text-muted-foreground text-xs max-w-xs text-center mb-6 font-medium">
                                            Connect your eCommerce platform to automate recovery flows.
                                        </p>
                                        <div className="flex gap-3">
                                            <Button
                                                variant="secondary"
                                                onClick={() => setIsShopifyModalOpen(true)}
                                                className="h-10 rounded-xl px-6 text-xs font-bold"
                                            >
                                                Shopify
                                            </Button>
                                            <Button
                                                variant="secondary"
                                                onClick={() => setIsWooModalOpen(true)}
                                                className="h-10 rounded-xl px-6 text-xs font-bold"
                                            >
                                                WooCommerce
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    stores.map((store) => (
                                        <div key={store.id} className="p-5 bg-background/40 backdrop-blur-sm rounded-xl border border-border/20 hover:border-primary/30 transition-all group shadow-sm">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-14 h-14 rounded-2xl bg-muted/20 border border-border/40 flex items-center justify-center group-hover:text-primary transition-all shadow-inner">
                                                        {store.platform === 'shopify' ? 
                                                            <span className="text-xl">🛍️</span> : 
                                                            <span className="text-xl">⚡</span>
                                                        }
                                                    </div>
                                                    <div className="space-y-1.5">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-sm font-bold tracking-tight">{store.name}</span>
                                                            <Badge className="h-4 text-[8px] font-black tracking-widest bg-emerald-500/10 text-emerald-500 border-0">
                                                                CONNECTED
                                                            </Badge>
                                                        </div>
                                                        <div className="flex items-center gap-4 text-[10px] text-muted-foreground uppercase font-black tracking-widest">
                                                            <span>{store.platform}</span>
                                                            <Separator orientation="vertical" className="h-3 bg-border/40" />
                                                            <span>{store._count?.orders || 0} Orders</span>
                                                            <Separator orientation="vertical" className="h-3 bg-border/40" />
                                                            <span>{store._count?.products || 0} Items</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-3">
                                                    <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl text-muted-foreground hover:bg-muted/30 hover:text-foreground transition-all">
                                                        <ExternalLink size={15} />
                                                    </Button>
                                                    <Button variant="secondary" className="h-9 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest border border-border/20 shadow-sm">
                                                        Manage
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </Card>
                    </div>

                    {/* Sidebar Area (Right) */}
                    <div className="md:col-span-4 space-y-6">
                        <Card className="bg-primary/5 border-primary/10 rounded-2xl overflow-hidden relative shadow-none">
                            <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12 bg-primary/20 blur-3xl w-40 h-40 rounded-full" />
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-bold flex items-center gap-2">
                                    <Zap className="text-primary h-4 w-4" />
                                    Quick Automations
                                </CardTitle>
                                <CardDescription className="text-[10px] font-medium">Pre-built commerce flows</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="p-3 bg-background/40 backdrop-blur-sm rounded-xl border border-border/20 hover:border-primary/20 transition-all cursor-pointer group">
                                    <h4 className="text-xs font-bold mb-1 group-hover:text-primary transition-colors">Abandoned Recovery</h4>
                                    <p className="text-[9px] text-muted-foreground leading-relaxed">Recover 15% more sales with automated reminders.</p>
                                </div>
                                <div className="p-3 bg-background/40 backdrop-blur-sm rounded-xl border border-border/20 hover:border-primary/20 transition-all cursor-pointer group">
                                    <h4 className="text-xs font-bold mb-1 group-hover:text-primary transition-colors">Order Feedback</h4>
                                    <p className="text-[9px] text-muted-foreground leading-relaxed">Automatically collect reviews after delivery.</p>
                                </div>
                                <Button variant="outline" className="w-full h-9 rounded-xl text-[9px] font-black uppercase tracking-widest bg-background/50 border-border/40">
                                    Explore Flow Templates
                                </Button>
                            </CardContent>
                        </Card>

                        <Card className="bg-background/40 backdrop-blur-sm border-border/20 rounded-2xl shadow-none p-5">
                            <h3 className="text-[10px] font-black text-muted-foreground tracking-widest uppercase mb-4 px-1">Infrastructure Status</h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between px-1">
                                    <div className="flex items-center gap-2.5">
                                        <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse" />
                                        <span className="text-[11px] font-bold">API Sync Service</span>
                                    </div>
                                    <Badge variant="outline" className="h-4 px-1.5 text-[8px] font-black uppercase border-emerald-500/20 text-emerald-500 bg-emerald-500/5">
                                        HEALTHY
                                    </Badge>
                                </div>
                                <div className="flex items-center justify-between px-1">
                                    <div className="flex items-center gap-2.5">
                                        <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse" />
                                        <span className="text-[11px] font-bold">Webhook Listener</span>
                                    </div>
                                    <Badge variant="outline" className="h-4 px-1.5 text-[8px] font-black uppercase border-emerald-500/20 text-emerald-500 bg-emerald-500/5">
                                        LISTENING
                                    </Badge>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>

            <ShopifyConnectModal
                isOpen={isShopifyModalOpen}
                workspaceId={workspaceId}
                onClose={() => setIsShopifyModalOpen(false)}
                onConnected={fetchStores}
            />
            <WooCommerceConnectModal
                isOpen={isWooModalOpen}
                workspaceId={workspaceId}
                onClose={() => setIsWooModalOpen(false)}
                onConnected={fetchStores}
            />
        </div>
    );
}