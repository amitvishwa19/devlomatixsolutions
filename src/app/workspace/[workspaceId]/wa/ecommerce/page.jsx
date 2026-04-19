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
    Loader2
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAction } from "@/hooks/use-action";
import { getStores } from "./_actions/get-stores";
import { toast } from "sonner";
import { DynamicIcon } from "@/components/ui/dynamic-icon";
import { ShopifyConnectModal } from "./_components/ShopifyConnectModal";
import { WooCommerceConnectModal } from "./_components/WooCommerceConnectModal";

const stats = [
    { label: "Total Revenue", value: "₹45,230", change: "+12.5%", icon: TrendingUp, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { label: "Total Orders", value: "142", change: "+8.2%", icon: Package, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "Abandoned Carts", value: "28", change: "-4.1%", icon: ShoppingCart, color: "text-amber-500", bg: "bg-amber-500/10" },
    { label: "Recovery Rate", value: "64.2%", change: "+2.4%", icon: ShoppingBag, color: "text-purple-500", bg: "bg-purple-500/10" }
];

import { use } from "react";

export default function ECommercePage({ params: paramsPromise }) {
    const params = use(paramsPromise);
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
        setIsLoading(true);
        executeGetStores({ workspaceId });
    };

    useEffect(() => {
        // We'll need workspaceId here ideally, but for now matching legacy behavior
        fetchStores();
    }, []);

    return (
        <div className="p-6 space-y-8 animate-in fade-in duration-700">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary/10 rounded-2xl border border-primary/20 shadow-lg shadow-primary/5">
                        <ShoppingBag className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold">eCommerce <span className="text-primary/50 text-xl italic font-light ml-1">Connect</span></h1>
                        <p className="text-muted-foreground text-xs flex items-center gap-1.5 font-medium">
                            Unified Dashboard for Shopify & WooCommerce
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        onClick={fetchStores}
                        className="glass-button border-white/10  rounded-md  px-6 font-bold shadow-2xl active:scale-95 transition-all"
                    >
                        <RefreshCcw className="mr-2 h-4 w-4" />
                        Sync Data
                    </Button>
                    <Button
                        onClick={() => setIsShopifyModalOpen(true)}
                        className="bg-primary hover:bg-primary/90 text-white border-0 shadow-lg shadow-primary/20  rounded-md  font-bold active:scale-95 transition-all group overflow-hidden relative"
                    >
                        <div className="absolute inset-0 bg-white/10 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 skew-x-12" />
                        <Plus className="mr-2 h-5 w-5" />
                        Connect New Store
                    </Button>
                </div>
            </div>

            {/* Stats Perspective */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, i) => (
                    <Card key={i} className="glassmorphism border bg-card backdrop-blur-3xl group hover:border-primary/50 transition-all duration-500 overflow-hidden relative">
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                            <stat.icon size={64} />
                        </div>
                        <CardContent className="p-2">
                            <div className="flex items-center justify-between mb-4">
                                <div className={`p-2.5 rounded-xl ${stat.bg}`}>
                                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                                </div>
                                <Badge variant="outline" className="bg-white/5 border-white/10 text-[10px] font-black uppercase text-white/50 tracking-widest">
                                    {stat.change}
                                </Badge>
                            </div>
                            <h3 className="text-sm font-bold text-muted-foreground mb-1">{stat.label}</h3>
                            <div className="text-2xl font-black ">{stat.value}</div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Store Management Section */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <h2 className="text-xl font-bold  flex items-center gap-2">
                            <Store className="text-primary h-5 w-5" />
                            Connected Stores
                        </h2>
                    </div>

                    {isLoading ? (
                        <div className="h-64 flex flex-col items-center justify-center glassmorphism border-white/5 rounded-3xl">
                            <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
                            <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Fetching Integrations...</p>
                        </div>
                    ) : stores.length === 0 ? (
                        <div className="h-80 flex flex-col items-center justify-center glassmorphism border-white/5 bg-white/[0.01] rounded-3xl border-dashed border-2 relative overflow-hidden group">
                            <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                            <div className="p-6 bg-white/5 rounded-full mb-6 border border-white/10 group-hover:scale-110 transition-transform duration-500">
                                <RefreshCcw size={48} className="text-muted-foreground/30 group-hover:text-primary/50 transition-colors" />
                            </div>
                            <h3 className="text-xl font-black mb-2 ">No Stores Linked Yet</h3>
                            <p className="text-muted-foreground text-sm max-w-sm text-center mb-8 font-medium leading-relaxed">
                                Unlock the power of WhatsApp commerce by connecting your Shopify or WooCommerce store instantly.
                            </p>
                            <div className="flex gap-4">
                                <Button
                                    onClick={() => setIsShopifyModalOpen(true)}
                                    className="bg-primary text-white rounded-xl px-8 font-bold h-12 shadow-xl shadow-primary/20 transition-all active:scale-95"
                                >
                                    Connect Shopify
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => setIsWooModalOpen(true)}
                                    className="border-white/10 text-white hover:bg-white/5 rounded-xl px-8 font-bold h-12 transition-all active:scale-95"
                                >
                                    WooCommerce Setup
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {stores.map((store) => (
                                <Card key={store.id} className="glassmorphism border-white/10 bg-[#1e1e2e]/40 p-6 group hover:border-primary/30 transition-all rounded-3xl">
                                    <div className="flex items-start justify-between mb-6">
                                        <div className="flex items-center gap-4">
                                            <div className="h-14 w-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                                                {store.platform === 'shopify' ?
                                                    <span className="text-2xl">🛍️</span> :
                                                    <span className="text-2xl">⚡</span>
                                                }
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-black text-white mb-1 group-hover:text-primary transition-colors">{store.name}</h3>
                                                <Badge className="bg-emerald-500/10 text-emerald-500 border-0 text-[9px] uppercase font-bold tracking-wider rounded-md">Connected</Badge>
                                            </div>
                                        </div>
                                        <Button variant="ghost" size="icon" className="text-white/20 hover:text-white hover:bg-white/5">
                                            <ExternalLink size={18} />
                                        </Button>
                                    </div>

                                    <div className="grid grid-cols-3 gap-3 mb-6">
                                        <div className="p-3 rounded-2xl bg-white/5 border border-white/5 text-center">
                                            <div className="text-[9px] font-black uppercase text-muted-foreground tracking-widest mb-1">Orders</div>
                                            <div className="text-lg font-black text-white">{store._count?.orders || 0}</div>
                                        </div>
                                        <div className="p-3 rounded-2xl bg-white/5 border border-white/5 text-center">
                                            <div className="text-[9px] font-black uppercase text-muted-foreground tracking-widest mb-1">Items</div>
                                            <div className="text-lg font-black text-white">{store._count?.products || 0}</div>
                                        </div>
                                        <div className="p-3 rounded-2xl bg-white/5 border border-white/5 text-center">
                                            <div className="text-[9px] font-black uppercase text-muted-foreground tracking-widest mb-1">Carts</div>
                                            <div className="text-lg font-black text-white">{store._count?.abandonedCarts || 0}</div>
                                        </div>
                                    </div>

                                    <Button variant="outline" className="w-full border-white/10 text-white text-xs font-bold rounded-xl h-10 hover:bg-primary hover:border-0 transition-all">
                                        Manage Integration
                                    </Button>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>

                {/* Right Sidebar Utilities */}
                <div className="space-y-6">
                    <Card className="glassmorphism border-white/10 bg-primary/5 rounded-3xl overflow-hidden relative border-0">
                        <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12 bg-primary/20 blur-3xl w-40 h-40 rounded-full" />
                        <CardHeader>
                            <CardTitle className="text-lg font-black text-white tracking-tight flex items-center gap-2">
                                <AlertCircle className="text-primary h-5 w-5" />
                                Recovery Quick-Actions
                            </CardTitle>
                            <CardDescription className="text-xs font-medium text-muted-foreground">Automate your abandoned cart reminders</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-primary/20 transition-all cursor-pointer group">
                                <h4 className="text-sm font-bold text-white mb-2 group-hover:text-primary transition-colors italic">High Intent Recovery</h4>
                                <p className="text-[10px] text-muted-foreground leading-relaxed font-medium">Send a WhatsApp message 30 mins after cart abandonment with a 10% coupon code.</p>
                            </div>
                            <div className="p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-primary/20 transition-all cursor-pointer group">
                                <h4 className="text-sm font-bold text-white mb-2 group-hover:text-primary transition-colors italic">Order Follow-up</h4>
                                <p className="text-[10px] text-muted-foreground leading-relaxed font-medium">Ask for a product review 7 days after order fulfillment automatically.</p>
                            </div>
                            <Button className="w-full bg-white/5 hover:bg-white/10 text-white rounded-xl h-11 font-black text-[10px] uppercase tracking-widest border border-white/10">
                                Browse All Flow Templates
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="glassmorphism border-white/10 bg-[#0f0f1a]/60 rounded-3xl p-6">
                        <h3 className="text-sm font-black text-white/50 tracking-widest uppercase mb-4 px-2">Integration Health</h3>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between px-2">
                                <div className="flex items-center gap-3">
                                    <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/100 animate-pulse" />
                                    <span className="text-xs font-bold text-white">Webhook Listener</span>
                                </div>
                                <Badge className="bg-emerald-500/20 text-emerald-500 border-0 text-[10px] font-black uppercase tracking-widest">Active</Badge>
                            </div>
                            <div className="flex items-center justify-between px-2">
                                <div className="flex items-center gap-3">
                                    <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/100 animate-pulse" />
                                    <span className="text-xs font-bold text-white">Prisma Sync Engine</span>
                                </div>
                                <Badge className="bg-emerald-500/20 text-emerald-500 border-0 text-[10px] font-black uppercase tracking-widest">Running</Badge>
                            </div>
                        </CardContent>
                    </Card>
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