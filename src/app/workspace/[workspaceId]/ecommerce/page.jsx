"use client";

import React, { use } from 'react';
import { ShoppingCart, LayoutDashboard, Settings, Plus, RefreshCw, BarChart3, Package, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import EcommerceStats from "./_components/EcommerceStats";
import RecentOrders from "./_components/RecentOrders";
import AbandonedCarts from "./_components/AbandonedCarts";

export default function EcommercePage({ params: paramsPromise }) {
    const params = use(paramsPromise);
    const workspaceId = params.workspaceId;

    return (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-10 p-4">
            {/* Elegant Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-6">
                <div>
                    <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-3">
                        <ShoppingCart className="w-8 h-8 text-primary" />
                        eCommerce Lab
                    </h1>
                    <p className="text-xs text-muted-foreground">
                        Centralize your Shopify and WooCommerce stores. Analyze sales, optimize products with AI, and recover revenue automatically.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="gap-2 border-white/10 hover:bg-white/5 transition-all">
                        <RefreshCw className="w-4 h-4" />
                        Sync Stores
                    </Button>
                    <Button className="gap-2 shadow-lg shadow-primary/20">
                        <Plus className="w-4 h-4" />
                        Add Store
                    </Button>
                </div>
            </div>

            {/* Premium Stats Grid */}
            <EcommerceStats workspaceId={workspaceId} />

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Left Column: Orders and Products Overview */}
                <div className="xl:col-span-2 space-y-8">
                    <RecentOrders workspaceId={workspaceId} />

                    {/* Placeholder for Product Catalog/Analytics */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-6 rounded-xl border border-white/5 bg-card hover:bg-white/2 transition-all cursor-pointer group">
                            <Package className="w-8 h-8 text-blue-400 mb-4 group-hover:scale-110 transition-transform" />
                            <h3 className="text-lg font-semibold text-white">Product Catalog</h3>
                            <p className="text-xs text-muted-foreground mt-1">Manage 240+ synced products with AI optimization.</p>
                        </div>
                        <div className="p-6 rounded-xl border border-white/5 bg-card hover:bg-white/2 transition-all cursor-pointer group">
                            <BarChart3 className="w-8 h-8 text-purple-400 mb-4 group-hover:scale-110 transition-transform" />
                            <h3 className="text-lg font-semibold text-white">Sales Analytics</h3>
                            <p className="text-xs text-muted-foreground mt-1">Detailed revenue trends and customer behavior maps.</p>
                        </div>
                    </div>
                </div>

                {/* Right Column: Recovery and Quick Actions */}
                <div className="space-y-8">
                    <AbandonedCarts workspaceId={workspaceId} />

                    {/* Store Connections Quick View */}
                    <div className="p-5 rounded-xl border border-white/5 bg-card/50 backdrop-blur-sm">
                        <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                            <Settings className="w-4 h-4 text-muted-foreground" />
                            Connected Stores
                        </h3>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 rounded-lg bg-black/20 border border-white/5">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded bg-white/10 flex items-center justify-center p-1.5">
                                        <div className="w-full h-full bg-[#95BF47] rounded-sm" /> {/* Shopify Color */}
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-white uppercase">Shopify Main</p>
                                        <p className="text-[10px] text-green-400">Connected</p>
                                    </div>
                                </div>
                                <Button size="icon" variant="ghost" className="h-8 w-8 opacity-50 hover:opacity-100">
                                    <Settings className="w-4 h-4" />
                                </Button>
                            </div>
                            <div className="flex items-center justify-between p-3 rounded-lg bg-black/20 border border-white/5">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded bg-white/10 flex items-center justify-center p-1.5">
                                        <div className="w-full h-full bg-[#7F54B3] rounded-sm" /> {/* WooCommerce Color */}
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-white uppercase">Woo Store 2</p>
                                        <p className="text-[10px] text-amber-400">Sync Pending</p>
                                    </div>
                                </div>
                                <Button size="icon" variant="ghost" className="h-8 w-8 opacity-50 hover:opacity-100">
                                    <Settings className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
