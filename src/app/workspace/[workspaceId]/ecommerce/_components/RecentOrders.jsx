"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package, ArrowRight, ExternalLink } from "lucide-react";
import Link from 'next/link';

export default function RecentOrders({ workspaceId }) {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const res = await fetch(`/api/workspace/${workspaceId}/ecommerce/orders?limit=5`);
                const data = await res.json();
                if (data.success) {
                    setOrders(data.orders);
                }
            } catch (err) {
                console.error("Failed to fetch recent orders:", err);
            } finally {
                setLoading(false);
            }
        };

        if (workspaceId) {
            fetchOrders();
        }
    }, [workspaceId]);

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'completed':
            case 'fulfilled': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
            case 'pending': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
            case 'cancelled': return 'bg-destructive/10 text-destructive border-destructive/20';
            default: return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
        }
    };

    return (
        <Card className="bg-card/50 border-white/5 flex flex-col h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-base font-semibold flex items-center gap-2 text-white">
                    <Package className="w-4 h-4 text-primary" />
                    Recent Live Orders
                </CardTitle>
                <Link href={`/workspace/${workspaceId}/ecommerce/orders`}>
                    <Button variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-white gap-1 h-8">
                        View All <ArrowRight className="w-3 h-3" />
                    </Button>
                </Link>
            </CardHeader>
            <CardContent className="flex-1 p-0 mt-4">
                {loading ? (
                    <div className="p-4 space-y-4">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="h-12 bg-white/5 animate-pulse rounded-md" />
                        ))}
                    </div>
                ) : orders.length === 0 ? (
                    <div className="p-8 text-center text-sm text-muted-foreground">
                        No orders yet. Start marketing your products!
                    </div>
                ) : (
                    <div className="divide-y divide-white/5">
                        {orders.map((order) => (
                            <div key={order.id} className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors group">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 shrink-0">
                                        <Package className="w-4 h-4 text-primary" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-white">#{order.orderNumber || order.externalOrderId?.slice(-6)}</p>
                                        <p className="text-[10px] text-muted-foreground">{order.customerName || 'Guest'} • {new Date(order.createdAt).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="text-right hidden sm:block">
                                        <p className="text-sm font-black text-white">₹{order.totalAmount?.toLocaleString()}</p>
                                        <p className="text-[10px] text-muted-foreground">{order.currency}</p>
                                    </div>
                                    <Badge variant="outline" className={`text-[9px] uppercase font-bold px-2 ${getStatusColor(order.status)}`}>
                                        {order.status}
                                    </Badge>
                                    <Link href={`/workspace/${workspaceId}/ecommerce/orders`}>
                                        <Button size="icon" variant="ghost" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <ExternalLink className="w-4 h-4" />
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
