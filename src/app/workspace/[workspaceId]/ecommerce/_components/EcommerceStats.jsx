// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { DollarSign, ShoppingCart, ShoppingBag, TrendingUp, Loader2 } from "lucide-react";

export default function EcommerceStats({ workspaceId }) {
    const [stats, setStats] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await fetch(`/api/workspace/${workspaceId}/ecommerce/stats`);
                const data = await res.json();
                if (data.success) {
                    setStats(data.stats);
                }
            } catch (err) {
                console.error("Failed to fetch ecommerce stats:", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchStats();
    }, [workspaceId]);

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map(i => (
                    <Card key={i} className="bg-card/50 border border-border/50 h-24 animate-pulse" />
                ))}
            </div>
        );
    }

    const cards = [
        {
            title: "Total Revenue",
            value: `₹${(stats?.revenue?.total || 0).toLocaleString()}`,
            subtext: `${stats?.revenue?.count || 0} orders`,
            icon: DollarSign,
            color: "bg-emerald-500",
            textColor: "text-emerald-400"
        },
        {
            title: "Active Orders",
            value: stats?.revenue?.count || 0,
            subtext: "From all stores",
            icon: ShoppingCart,
            color: "bg-primary",
            textColor: "text-blue-400"
        },
        {
            title: "Abandoned Value",
            value: `₹${(stats?.abandoned?.total || 0).toLocaleString()}`,
            subtext: `${stats?.abandoned?.count || 0} checkouts`,
            icon: ShoppingBag,
            color: "bg-amber-500",
            textColor: "text-amber-400"
        },
        {
            title: "Conversion Rate",
            value: `${stats?.conversion?.rate || 0}%`,
            subtext: "Checkout success",
            icon: TrendingUp,
            color: "bg-purple-500",
            textColor: "text-purple-400"
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {cards.map((card, i) => (
                <Card key={i} className="bg-card border hover:border-muted transition-colors group">
                    <CardContent className="py-3 px-4">
                        <div className="flex items-center justify-between gap-2">
                            <div className="space-y-1">
                                <h3 className="text-2xl font-bold text-white leading-none tracking-tight">{card.value}</h3>
                                <p className="text-[#A0AEC0] text-[10px] uppercase font-semibold tracking-wider">{card.title}</p>
                            </div>
                            <div className={`w-10 h-10 ${card.color} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform shrink-0 shadow-lg shadow-black/20`}>
                                <card.icon className="w-5 h-5 text-white" />
                            </div>
                        </div>
                        <p className={`${card.textColor} text-[11px] font-medium pt-2 flex items-center gap-1`}>
                            {card.subtext}
                        </p>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
