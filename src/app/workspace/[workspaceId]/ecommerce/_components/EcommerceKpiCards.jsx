"use client";

import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { 
    DollarSign, 
    ShoppingCart, 
    TrendingUp, 
    Package, 
    AlertTriangle, 
    ArrowUpRight, 
    ArrowDownRight,
    ShoppingBag,
    Clock
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

export default function EcommerceKpiCards({ stats, loading }) {
    if (loading || !stats) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
                {[1, 2, 3, 4, 5].map(i => (
                    <Card key={i} className="bg-card/60 backdrop-blur-sm border-border/80 shadow-sm">
                        <CardContent className="p-4">
                            <Skeleton className="h-3.5 w-20 mb-3" />
                            <Skeleton className="h-7 w-28 mb-2" />
                            <Skeleton className="h-3 w-16" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    const currencySymbol = stats.primaryCurrency === "USD" ? "$" : "₹";

    const formatCurrency = (val) => {
        return `${currencySymbol}${Number(val || 0).toLocaleString(undefined, {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        })}`;
    };

    const renderDelta = (delta) => {
        if (delta === undefined || delta === null) return null;
        const isPositive = delta >= 0;
        return (
            <span className={`inline-flex items-center text-[11px] font-semibold ${isPositive ? 'text-emerald-500' : 'text-rose-500'}`}>
                {isPositive ? <ArrowUpRight className="w-3 h-3 mr-0.5" /> : <ArrowDownRight className="w-3 h-3 mr-0.5" />}
                {Math.abs(delta)}%
            </span>
        );
    };

    const cards = [
        {
            title: "Gross Revenue",
            value: formatCurrency(stats.totalRevenue),
            delta: stats.revenueDelta,
            deltaLabel: "vs prev period",
            icon: DollarSign,
            color: "text-emerald-500",
            bg: "bg-emerald-500/10 border-emerald-500/20",
            subBadge: null
        },
        {
            title: "Total Orders",
            value: Number(stats.totalOrders || 0).toLocaleString(),
            delta: stats.ordersDelta,
            deltaLabel: "vs prev period",
            icon: ShoppingBag,
            color: "text-blue-500",
            bg: "bg-blue-500/10 border-blue-500/20",
            subBadge: stats.unfulfilledOrders > 0 ? {
                text: `${stats.unfulfilledOrders} Pending`,
                variant: "amber"
            } : null
        },
        {
            title: "Avg. Order Value",
            value: formatCurrency(stats.averageOrderValue),
            delta: stats.aovDelta,
            deltaLabel: "vs prev period",
            icon: TrendingUp,
            color: "text-indigo-500",
            bg: "bg-indigo-500/10 border-indigo-500/20",
            subBadge: null
        },
        {
            title: "Cart Recovery Value",
            value: formatCurrency(stats.recoverableRevenue),
            delta: null,
            deltaLabel: null,
            icon: ShoppingCart,
            color: "text-purple-500",
            bg: "bg-purple-500/10 border-purple-500/20",
            subBadge: stats.abandonedCartsCount > 0 ? {
                text: `${stats.abandonedCartsCount} Recoverable`,
                variant: "purple"
            } : null
        },
        {
            title: "Active Catalog",
            value: Number(stats.totalProducts || 0).toLocaleString(),
            delta: null,
            deltaLabel: null,
            icon: Package,
            color: "text-amber-500",
            bg: "bg-amber-500/10 border-amber-500/20",
            subBadge: stats.lowStockProducts > 0 ? {
                text: `${stats.lowStockProducts} Low Stock`,
                variant: "rose"
            } : null
        }
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
            {cards.map((card, idx) => (
                <Card 
                    key={idx} 
                    className="bg-card/70 backdrop-blur-md border-border/80 shadow-sm hover:border-primary/40 hover:bg-card/90 transition-all duration-200 group"
                >
                    <CardContent className="p-4 flex flex-col justify-between h-full">
                        <div className="flex items-center justify-between">
                            <span className="text-[12px] font-medium text-muted-foreground">{card.title}</span>
                            <div className={`w-8 h-8 rounded-lg ${card.bg} border flex items-center justify-center group-hover:scale-105 transition-transform`}>
                                <card.icon className={`w-4 h-4 ${card.color}`} />
                            </div>
                        </div>

                        <div className="mt-2.5">
                            <h3 className="text-xl font-bold tracking-tight text-foreground font-mono">
                                {card.value}
                            </h3>
                        </div>

                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/40 text-[11px]">
                            {card.delta !== null ? (
                                <div className="flex items-center gap-1">
                                    {renderDelta(card.delta)}
                                    <span className="text-muted-foreground text-[10px]">{card.deltaLabel}</span>
                                </div>
                            ) : (
                                <span className="text-muted-foreground text-[10px]">Real-time telemetry</span>
                            )}

                            {card.subBadge && (
                                <Badge 
                                    variant="outline" 
                                    className={`text-[9px] px-1.5 py-0 font-semibold uppercase ${
                                        card.subBadge.variant === 'amber' ? 'bg-amber-500/10 text-amber-500 border-amber-500/30' :
                                        card.subBadge.variant === 'rose' ? 'bg-rose-500/10 text-rose-500 border-rose-500/30' :
                                        'bg-purple-500/10 text-purple-400 border-purple-500/30'
                                    }`}
                                >
                                    {card.subBadge.text}
                                </Badge>
                            )}
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
