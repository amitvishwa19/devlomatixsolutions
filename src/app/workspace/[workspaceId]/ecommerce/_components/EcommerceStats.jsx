"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { DollarSign, ShoppingCart, TrendingUp, Package } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function EcommerceStats({ workspaceId }) {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await fetch(`/api/workspace/${workspaceId}/ecommerce/stats`);
                const data = await res.json();
                if (data.success) {
                    setStats(data.stats);
                }
            } catch (err) {
                console.error("Failed to fetch stats:", err);
            } finally {
                setLoading(false);
            }
        };

        if (workspaceId) {
            fetchStats();
        }
    }, [workspaceId]);

    const statCards = [
        {
            title: "Total Revenue",
            value: stats ? `₹${stats.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "₹0.00",
            icon: DollarSign,
            color: "text-emerald-400",
            bg: "bg-emerald-400/10"
        },
        {
            title: "Total Orders",
            value: stats ? stats.totalOrders.toLocaleString() : "0",
            icon: ShoppingCart,
            color: "text-blue-400",
            bg: "bg-blue-400/10"
        },
        {
            title: "Avg. Order Value",
            value: stats ? `₹${stats.averageOrderValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "₹0.00",
            icon: TrendingUp,
            color: "text-purple-400",
            bg: "bg-purple-400/10"
        },
        {
            title: "Active Products",
            value: stats ? stats.totalProducts.toLocaleString() : "0",
            icon: Package,
            color: "text-orange-400",
            bg: "bg-orange-400/10"
        }
    ];

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map(i => (
                    <Card key={i} className="bg-card/50 border-white/5">
                        <CardContent className="p-6">
                            <Skeleton className="h-4 w-24 mb-4" />
                            <Skeleton className="h-8 w-32" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {statCards.map((card, index) => (
                <Card key={index} className="bg-card/50 border-white/5 hover:bg-card/80 transition-all group">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground mb-1">{card.title}</p>
                                <h3 className="text-2xl font-bold text-white tracking-tight">{card.value}</h3>
                            </div>
                            <div className={`w-12 h-12 rounded-xl ${card.bg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                                <card.icon className={`w-6 h-6 ${card.color}`} />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
