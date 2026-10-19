"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { 
    ShoppingCart, 
    RefreshCw, 
    Plus, 
    Package, 
    Truck, 
    Ticket, 
    Settings, 
    Store,
    Calendar,
    ChevronDown,
    CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from 'sonner';

export default function EcommerceHeader({ 
    workspaceId, 
    stores = [], 
    selectedStore, 
    setSelectedStore, 
    period, 
    setPeriod, 
    onRefresh, 
    isRefreshing 
}) {
    const [lastSyncedText, setLastSyncedText] = useState("Just now");

    const currentStoreObj = stores.find(s => s.id === selectedStore);
    const storeLabel = selectedStore === "all" 
        ? "All Connected Stores" 
        : currentStoreObj?.name || "Select Store";

    const periods = [
        { label: "Today", value: "today" },
        { label: "Last 7 Days", value: "7d" },
        { label: "Last 30 Days", value: "30d" },
        { label: "Last 90 Days", value: "90d" }
    ];

    const currentPeriodLabel = periods.find(p => p.value === period)?.label || "Last 30 Days";

    const handleSync = async () => {
        if (onRefresh) {
            await onRefresh();
            setLastSyncedText("Just now");
            toast.success("Stores & telemetry synchronized successfully!");
        }
    };

    return (
        <div className="flex flex-col gap-4 border-b border-border/60 pb-5">
            {/* Top Row: Title, Store Switcher, Date Range, Sync */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary/20 via-emerald-500/20 to-teal-500/20 border border-primary/30 flex items-center justify-center shadow-sm">
                            <ShoppingCart className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-xl font-bold tracking-tight text-foreground">
                                    eCommerce Command Center
                                </h1>
                                <Badge variant="outline" className="text-[10px] font-semibold text-emerald-500 border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse mr-1" />
                                    Live Sync
                                </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                Omni-channel sales velocity, fulfillment operations, and automated revenue recovery.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Controls: Store Switcher, Period Filter, Actions */}
                <div className="flex flex-wrap items-center gap-2">
                    {/* Store Selector Dropdown */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="h-9 gap-2 border-border/80 bg-card/60 backdrop-blur-sm text-xs font-medium">
                                <Store className="w-3.5 h-3.5 text-primary" />
                                <span className="max-w-[140px] truncate">{storeLabel}</span>
                                <ChevronDown className="w-3.5 h-3.5 text-muted-foreground ml-1" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuLabel className="text-xs text-muted-foreground">Store Scope</DropdownMenuLabel>
                            <DropdownMenuItem 
                                onClick={() => setSelectedStore("all")}
                                className={`text-xs cursor-pointer ${selectedStore === "all" ? "font-bold text-primary" : ""}`}
                            >
                                <span className="w-2 h-2 rounded-full bg-primary mr-2" />
                                All Connected Stores
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {stores.length === 0 ? (
                                <div className="p-2 text-center text-xs text-muted-foreground">No stores configured yet</div>
                            ) : (
                                stores.map(store => (
                                    <DropdownMenuItem 
                                        key={store.id} 
                                        onClick={() => setSelectedStore(store.id)}
                                        className={`text-xs cursor-pointer flex items-center justify-between ${selectedStore === store.id ? "font-bold text-primary" : ""}`}
                                    >
                                        <div className="flex items-center gap-2 truncate">
                                            <span className={`w-2 h-2 rounded-full ${
                                                store.platform === 'shopify' ? 'bg-[#95BF47]' : 
                                                store.platform === 'woocommerce' ? 'bg-[#7F54B3]' : 'bg-blue-400'
                                            }`} />
                                            <span className="truncate">{store.name}</span>
                                        </div>
                                        <span className="text-[10px] uppercase text-muted-foreground">{store.platform}</span>
                                    </DropdownMenuItem>
                                ))
                            )}
                            <DropdownMenuSeparator />
                            <Link href={`/workspace/${workspaceId}/ecommerce/settings`}>
                                <DropdownMenuItem className="text-xs cursor-pointer text-muted-foreground hover:text-foreground">
                                    <Settings className="w-3.5 h-3.5 mr-2" />
                                    Manage Store Fleets
                                </DropdownMenuItem>
                            </Link>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Period Selector Dropdown */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="h-9 gap-2 border-border/80 bg-card/60 backdrop-blur-sm text-xs font-medium">
                                <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                                <span>{currentPeriodLabel}</span>
                                <ChevronDown className="w-3.5 h-3.5 text-muted-foreground ml-1" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                            <DropdownMenuLabel className="text-xs text-muted-foreground">Time Window</DropdownMenuLabel>
                            {periods.map(p => (
                                <DropdownMenuItem
                                    key={p.value}
                                    onClick={() => setPeriod(p.value)}
                                    className={`text-xs cursor-pointer ${period === p.value ? "font-bold text-primary" : ""}`}
                                >
                                    {p.label}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Sync Stores Button */}
                    <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={handleSync}
                        disabled={isRefreshing}
                        className="h-9 gap-2 border-border/80 bg-card/60 backdrop-blur-sm text-xs font-medium hover:bg-card/90"
                    >
                        <RefreshCw className={`w-3.5 h-3.5 text-muted-foreground ${isRefreshing ? "animate-spin text-primary" : ""}`} />
                        <span className="hidden sm:inline">Sync Stores</span>
                    </Button>

                    {/* Quick CTA: Add Product */}
                    <Link href={`/workspace/${workspaceId}/ecommerce/products?action=new`}>
                        <Button size="sm" className="h-9 gap-1.5 shadow-sm text-xs font-semibold">
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add Product</span>
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
