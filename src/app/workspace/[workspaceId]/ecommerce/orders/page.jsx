"use client";

import React, { use, useState, useEffect } from 'react';
import { ShoppingCart, Search, Filter, ArrowLeft, Package, ExternalLink, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function EcommerceOrdersPage({ params: paramsPromise }) {
    const params = use(paramsPromise);
    const workspaceId = params.workspaceId;
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const res = await fetch(`/api/workspace/${workspaceId}/ecommerce/orders?limit=50`);
                const data = await res.json();
                if (data.success) setOrders(data.orders);
            } catch (err) {
                console.error("Failed to fetch orders:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, [workspaceId]);

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'fulfilled':
            case 'completed': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
            case 'pending': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
            case 'cancelled': return 'bg-destructive/10 text-destructive border-destructive/20';
            default: return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
        }
    };

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
                            Order Management
                        </h1>
                        <p className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">
                            Full transaction history across all platforms
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="gap-2 border-white/10 hover:bg-white/5">
                        <Download className="w-4 h-4" /> Export CSV
                    </Button>
                </div>
            </div>

            {/* Filter Bar */}
            <Card className="bg-card/50 border-white/5 backdrop-blur-sm">
                <CardContent className="p-4 flex flex-col md:flex-row gap-4 items-center">
                    <div className="relative flex-1 w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="Search orders, emails, or order numbers..."
                            className="pl-9 bg-black/20 border-white/10 focus:border-primary/50 transition-all"
                        />
                    </div>
                    <div className="flex items-center gap-2 w-full md:w-auto">
                        <Button variant="ghost" size="sm" className="gap-2 text-xs font-medium">
                            <Filter className="w-4 h-4" /> Status: ALL
                        </Button>
                        <Button variant="ghost" size="sm" className="gap-2 text-xs font-medium">
                            Platform: ALL
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Orders Table */}
            <Card className="bg-card border-white/5 shadow-2xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-white/5 bg-white/2">
                                <th className="p-4 text-xs uppercase font-bold text-muted-foreground tracking-widest">Order</th>
                                <th className="p-4 text-xs uppercase font-bold text-muted-foreground tracking-widest">Customer</th>
                                <th className="p-4 text-xs uppercase font-bold text-muted-foreground tracking-widest">Store</th>
                                <th className="p-4 text-xs uppercase font-bold text-muted-foreground tracking-widest text-right">Amount</th>
                                <th className="p-4 text-xs uppercase font-bold text-muted-foreground tracking-widest text-center">Status</th>
                                <th className="p-4 text-xs uppercase font-bold text-muted-foreground tracking-widest">Date</th>
                                <th className="p-4 text-xs uppercase font-bold text-muted-foreground tracking-widest"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                [1, 2, 3, 4, 5].map(i => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={7} className="p-8 h-16 bg-white/1" />
                                    </tr>
                                ))
                            ) : orders.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="p-12 text-center text-sm text-muted-foreground italic">
                                        No orders found in this workspace.
                                    </td>
                                </tr>
                            ) : (
                                orders.map((order) => (
                                    <tr key={order.id} className="hover:bg-white/2 transition-colors group">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center border border-primary/20">
                                                    <Package className="w-4 h-4 text-primary" />
                                                </div>
                                                <span className="font-bold text-sm text-white">#{order.orderNumber || order.externalOrderId.slice(-6)}</span>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <p className="text-sm font-medium text-white">{order.customerName || 'N/A'}</p>
                                            <p className="text-[10px] text-muted-foreground truncate max-w-[120px]">{order.customerEmail}</p>
                                        </td>
                                        <td className="p-4">
                                            <Badge variant="ghost" className="text-[10px] bg-white/5 border-white/10 uppercase tracking-tighter">
                                                {order.store?.platform}
                                            </Badge>
                                        </td>
                                        <td className="p-4 text-right font-bold text-white text-sm">₹{order.totalAmount.toLocaleString()}</td>
                                        <td className="p-4 text-center">
                                            <Badge className={`text-[9px] px-1.5 font-bold uppercase ${getStatusColor(order.status)} border`}>
                                                {order.status}
                                            </Badge>
                                        </td>
                                        <td className="p-4 text-xs text-muted-foreground">
                                            {new Date(order.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="p-4 text-right">
                                            <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                                                <ExternalLink className="w-3.5 h-3.5" />
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
}
