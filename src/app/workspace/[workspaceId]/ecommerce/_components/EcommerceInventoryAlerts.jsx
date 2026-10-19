"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
    AlertTriangle, 
    ArrowRight, 
    Package, 
    CheckCircle2, 
    Layers, 
    PlusCircle
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export default function EcommerceInventoryAlerts({ workspaceId, selectedStore }) {
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;
        const fetchAlerts = async () => {
            setLoading(true);
            try {
                const res = await fetch(`/api/workspace/${workspaceId}/ecommerce/inventory/alerts?storeId=${selectedStore}&limit=5`);
                const data = await res.json();
                if (isMounted && data.success) {
                    setAlerts(data.alerts || []);
                }
            } catch (err) {
                console.error("Failed to load inventory alerts:", err);
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        if (workspaceId) {
            fetchAlerts();
        }

        return () => { isMounted = false; };
    }, [workspaceId, selectedStore]);

    return (
        <Card className="bg-card/70 backdrop-blur-md border-border/80 shadow-sm flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-border/40">
                <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                    </div>
                    <div>
                        <CardTitle className="text-xs font-semibold text-foreground">
                            Inventory Depletion Radar
                        </CardTitle>
                        <p className="text-[10px] text-muted-foreground">
                            SKUs approaching stockout thresholds
                        </p>
                    </div>
                </div>
                <Link href={`/workspace/${workspaceId}/ecommerce/products`}>
                    <Button variant="ghost" size="sm" className="h-6 text-[11px] text-muted-foreground hover:text-foreground p-0 gap-1">
                        Catalog <ArrowRight className="w-3 h-3" />
                    </Button>
                </Link>
            </CardHeader>

            <CardContent className="p-3 flex-1">
                {loading ? (
                    <div className="space-y-2.5">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="flex items-center justify-between gap-3 p-2">
                                <div className="flex items-center gap-2.5">
                                    <Skeleton className="w-8 h-8 rounded-lg" />
                                    <div className="space-y-1">
                                        <Skeleton className="w-24 h-3" />
                                        <Skeleton className="w-16 h-2.5" />
                                    </div>
                                </div>
                                <Skeleton className="w-14 h-5" />
                            </div>
                        ))}
                    </div>
                ) : alerts.length === 0 ? (
                    <div className="py-6 text-center text-muted-foreground space-y-1.5">
                        <CheckCircle2 className="w-6 h-6 mx-auto text-emerald-500/80" />
                        <p className="text-xs font-medium text-foreground">Inventory Levels Healthy</p>
                        <p className="text-[10px]">No active products currently below safe re-order thresholds.</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {alerts.map((item) => {
                            const isOutOfStock = (item.inventoryCount ?? 0) <= 0;
                            return (
                                <div 
                                    key={item.id}
                                    className="p-2.5 rounded-xl border border-border/50 bg-background/50 hover:bg-muted/40 transition-colors flex items-center justify-between gap-2"
                                >
                                    <div className="flex items-center gap-2.5 min-w-0">
                                        <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0 border border-border/60">
                                            <Package className="w-3.5 h-3.5 text-muted-foreground" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-xs font-semibold text-foreground truncate">
                                                {item.title}
                                            </p>
                                            <p className="text-[10px] text-muted-foreground font-mono truncate">
                                                SKU: {item.sku || 'N/A'} • {item.store?.name}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 shrink-0">
                                        <Badge 
                                            variant="outline" 
                                            className={`text-[10px] font-bold px-1.5 py-0.5 ${
                                                isOutOfStock 
                                                    ? 'bg-rose-500/10 text-rose-500 border-rose-500/30' 
                                                    : 'bg-amber-500/10 text-amber-500 border-amber-500/30'
                                            }`}
                                        >
                                            {isOutOfStock ? '0 (Out)' : `${item.inventoryCount} left`}
                                        </Badge>
                                        <Link href={`/workspace/${workspaceId}/ecommerce/products?search=${encodeURIComponent(item.sku || item.title)}`}>
                                            <Button variant="ghost" size="icon" className="w-6 h-6 text-muted-foreground hover:text-foreground">
                                                <ArrowRight className="w-3 h-3" />
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
