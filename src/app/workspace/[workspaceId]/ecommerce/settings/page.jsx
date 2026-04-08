"use client";

import React, { use, useState } from 'react';
import { Settings, ArrowLeft, RefreshCw, Plus, Trash2, ExternalLink, ShieldCheck, Database, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function EcommerceSettingsPage({ params: paramsPromise }) {
    const params = use(paramsPromise);
    const workspaceId = params.workspaceId;

    // Simulation of connected stores
    const [stores, setStores] = useState([
        { id: '1', name: 'Main Shopify Store', platform: 'shopify', url: 'devlomatix-main.myshopify.com', status: 'Connected', lastSync: '2 hours ago' },
        { id: '2', name: 'Secondary Woo', platform: 'woocommerce', url: 'shop.devlomatix.com', status: 'Sync Error', lastSync: '1 day ago' }
    ]);

    return (
        <div className="space-y-4 animate-in fade-in duration-700 pb-10 p-4">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Link href={`/workspace/${workspaceId}/ecommerce`}>
                        <Button variant="ghost" size="icon" className="rounded-full hover:bg-white/10">
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-xl font-bold text-white flex items-center gap-2">
                            eCommerce Settings
                        </h1>
                        <p className="text-xs text-muted-foreground font-semibold ">
                            Manage store connections and sync preferences
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button className="gap-2 shadow-lg shadow-primary/20">
                        <Plus className="w-4 h-4" /> Add New Store
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Store Connections */}
                <div className="lg:col-span-2 space-y-6">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2 px-2">
                        <Database className="w-5 h-5 text-primary" />
                        Connected Stores
                    </h3>

                    {stores.map((store) => (
                        <Card key={store.id} className="bg-card border-white/5 hover:border-white/10 transition-all overflow-hidden group">
                            <CardContent className="p-0">
                                <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-14 h-14 rounded-xl flex items-center justify-center shadow-inner ${store.platform === 'shopify' ? 'bg-[#95BF47]/10 border border-[#95BF47]/20 text-[#95BF47]' : 'bg-[#7F54B3]/10 border border-[#7F54B3]/20 text-[#7F54B3]'}`}>
                                            <ShoppingCart className="w-7 h-7" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h4 className="text-lg font-bold text-white">{store.name}</h4>
                                                <Badge className={`text-[10px] font-bold uppercase ${store.status === 'Connected' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-destructive/10 text-destructive border-destructive/20'}`}>
                                                    {store.status}
                                                </Badge>
                                            </div>
                                            <p className="text-sm text-muted-foreground flex items-center gap-1">
                                                {store.url} <ExternalLink className="w-3 h-3 text-muted-foreground" />
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Button variant="outline" size="sm" className="gap-2 border-white/5 hover:bg-white/5">
                                            <RefreshCw className="w-3.5 h-3.5" /> Sync Data
                                        </Button>
                                        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-white transition-colors">
                                            <Settings className="w-4 h-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="text-destructive/50 hover:text-destructive transition-colors">
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                                <div className="bg-white/2 p-3 px-6 border-t border-white/5 flex items-center justify-between">
                                    <p className="text-[10px] text-muted-foreground">
                                        Last successful sync: <span className="text-white">{store.lastSync}</span>
                                    </p>
                                    <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                                        <ShieldCheck className="w-3 h-3 text-emerald-500" /> Secure Token Active
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Integration Options */}
                <div className="space-y-6">
                    <h3 className="text-lg font-bold text-white px-2">Preferences</h3>

                    <Card className="bg-card border-white/5">
                        <CardHeader className="pb-3 italic">
                            <CardTitle className="text-sm">Auto-Syncing</CardTitle>
                            <CardDescription className="text-[10px]">How often we pull data from your stores.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between p-3 rounded-lg bg-black/20 border border-white/5">
                                <span className="text-sm text-white">Refresh Rate</span>
                                <Badge variant="outline" className="border-primary/50 text-primary">30 Minutes</Badge>
                            </div>
                            <div className="flex items-center justify-between p-3 rounded-lg bg-black/20 border border-white/5">
                                <span className="text-sm text-white">Webhooks</span>
                                <Badge variant="outline" className="text-emerald-500 border-emerald-500/30">Enabled</Badge>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-card border-white/5">
                        <CardHeader className="pb-3 italic">
                            <CardTitle className="text-sm">Advanced Automation</CardTitle>
                            <CardDescription className="text-[10px]">Smart features for growth.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between gap-4">
                                <div>
                                    <p className="text-sm text-white">AI Optimization</p>
                                    <p className="text-[10px] text-muted-foreground leading-tight">Automatically improve product tags using Gemini AI.</p>
                                </div>
                                <div className="w-10 h-5 bg-primary/20 rounded-full border border-primary/30 relative cursor-not-allowed">
                                    <div className="absolute top-0.5 left-0.5 w-3.5 h-3.5 bg-primary rounded-full shadow-lg" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
