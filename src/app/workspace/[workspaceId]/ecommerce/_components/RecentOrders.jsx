// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, ExternalLink, Package, Loader2 } from "lucide-react";

export default function RecentOrders({ workspaceId }) {
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

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
                setIsLoading(false);
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

    if (isLoading) {
        return (
            <Card className="bg-card border h-[300px] flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </Card>
        );
    }

    return (
        <Card className="bg-card border shadow-xl shadow-black/20">
            <CardHeader className="pb-3 border-b border-white/5">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-semibold flex items-center gap-2">
                        <ShoppingCart className="w-4 h-4 text-primary" />
                        Recent Orders
                    </CardTitle>
                    <Badge variant="outline" className="text-[10px] font-normal opacity-70">
                        Latest {orders.length}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                {orders.length === 0 ? (
                    <div className="py-12 text-center text-sm text-muted-foreground h-[200px] flex items-center justify-center">
                        No orders found
                    </div>
                ) : (
                    <div className="divide-y divide-white/5">
                        {orders.map((order) => (
                            <div key={order.id} className="p-4 hover:bg-white/2 transition-colors flex items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                                        <Package className="w-5 h-5 text-primary" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-white truncate max-w-[150px]">
                                            #{order.orderNumber || order.externalOrderId.slice(-6)}
                                        </p>
                                        <p className="text-[10px] text-muted-foreground uppercase flex items-center gap-1">
                                            {order.store?.platform} • {order.customerName || 'Anonymous'}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right flex flex-col items-end gap-1.5">
                                    <p className="text-sm font-bold text-white">₹{order.totalAmount.toLocaleString()}</p>
                                    <Badge className={`text-[9px] px-1.5 py-0 min-h-0 uppercase leading-relaxed font-bold border ${getStatusColor(order.status)} hover:opacity-80 transition-opacity`}>
                                        {order.status}
                                    </Badge>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                <div className="p-3 border-t border-white/5 bg-white/1">
                    <button className="w-full text-[11px] text-muted-foreground hover:text-primary transition-colors flex items-center justify-center gap-1 font-medium">
                        View All Orders <ExternalLink className="w-3 h-3" />
                    </button>
                </div>
            </CardContent>
        </Card>
    );
}
