"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
    Package, 
    ArrowRight, 
    ExternalLink, 
    MessageCircle, 
    Truck, 
    CheckCircle2, 
    Clock, 
    CreditCard,
    Store
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { OrderDetailModal } from "../orders/_components/OrderDetailModal";

export default function EcommerceLiveOrders({ workspaceId, selectedStore }) {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(null);

    useEffect(() => {
        let isMounted = true;
        const fetchOrders = async () => {
            setLoading(true);
            try {
                const res = await fetch(`/api/workspace/${workspaceId}/ecommerce/orders?storeId=${selectedStore}&limit=7`);
                const data = await res.json();
                if (isMounted && data.success) {
                    setOrders(data.orders || []);
                }
            } catch (err) {
                console.error("Failed to load recent orders:", err);
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        if (workspaceId) {
            fetchOrders();
        }

        return () => { isMounted = false; };
    }, [workspaceId, selectedStore]);

    const getStatusBadge = (status) => {
        switch (status?.toLowerCase()) {
            case 'completed':
            case 'delivered':
            case 'fulfilled':
                return <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-500 border-emerald-500/20 font-semibold uppercase">Fulfilled</Badge>;
            case 'shipped':
                return <Badge variant="outline" className="text-[10px] bg-indigo-500/10 text-indigo-500 border-indigo-500/20 font-semibold uppercase">Shipped</Badge>;
            case 'processing':
                return <Badge variant="outline" className="text-[10px] bg-blue-500/10 text-blue-500 border-blue-500/20 font-semibold uppercase">Processing</Badge>;
            case 'cancelled':
                return <Badge variant="outline" className="text-[10px] bg-rose-500/10 text-rose-500 border-rose-500/20 font-semibold uppercase">Cancelled</Badge>;
            case 'pending':
            default:
                return <Badge variant="outline" className="text-[10px] bg-amber-500/10 text-amber-500 border-amber-500/20 font-semibold uppercase">Pending</Badge>;
        }
    };

    const getPlatformBadge = (platform) => {
        switch (platform?.toLowerCase()) {
            case 'shopify':
                return <span className="inline-flex items-center gap-1 text-[9px] font-bold text-[#95BF47] bg-[#95BF47]/10 px-1.5 py-0.5 rounded border border-[#95BF47]/20 uppercase">Shopify</span>;
            case 'woocommerce':
                return <span className="inline-flex items-center gap-1 text-[9px] font-bold text-[#7F54B3] bg-[#7F54B3]/10 px-1.5 py-0.5 rounded border border-[#7F54B3]/20 uppercase">Woo</span>;
            default:
                return <span className="inline-flex items-center gap-1 text-[9px] font-bold text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded border border-blue-500/20 uppercase">Store</span>;
        }
    };

    const openWhatsApp = (phone, customerName, orderNum) => {
        if (!phone) return;
        const cleanPhone = phone.replace(/[^0-9]/g, '');
        const message = encodeURIComponent(`Hi ${customerName || 'there'}, thank you for ordering with us! We are currently processing your order #${orderNum}. Please let us know if you need any assistance.`);
        window.open(`https://wa.me/${cleanPhone}?text=${message}`, '_blank');
    };

    return (
        <Card className="bg-card/70 backdrop-blur-md border-border/80 shadow-sm flex flex-col h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-border/40">
                <div>
                    <CardTitle className="text-sm font-semibold flex items-center gap-2 text-foreground">
                        <Package className="w-4 h-4 text-primary" />
                        Live Order Operations Stream
                    </CardTitle>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                        Real-time transactions across connected storefronts
                    </p>
                </div>
                <Link href={`/workspace/${workspaceId}/ecommerce/orders`}>
                    <Button variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground hover:text-foreground gap-1">
                        View All Orders <ArrowRight className="w-3 h-3" />
                    </Button>
                </Link>
            </CardHeader>

            <CardContent className="p-0 flex-1">
                {loading ? (
                    <div className="p-4 space-y-3">
                        {[1, 2, 3, 4, 5].map(i => (
                            <div key={i} className="flex items-center justify-between gap-4 py-2">
                                <div className="flex items-center gap-3">
                                    <Skeleton className="w-9 h-9 rounded-xl" />
                                    <div className="space-y-1.5">
                                        <Skeleton className="w-24 h-3.5" />
                                        <Skeleton className="w-32 h-3" />
                                    </div>
                                </div>
                                <Skeleton className="w-20 h-6" />
                            </div>
                        ))}
                    </div>
                ) : orders.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground space-y-2">
                        <Package className="w-8 h-8 mx-auto opacity-30" />
                        <p className="text-xs">No orders logged for this store scope yet.</p>
                        <p className="text-[11px]">Orders from Shopify, WooCommerce, and manual checkouts appear here live.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-border/40">
                        {orders.map((order) => {
                            const orderNum = order.orderNumber || order.externalOrderId?.slice(-6) || order.id.slice(-6);
                            const customerName = order.customerName || 'Guest Customer';
                            const orderDate = new Date(order.createdAt).toLocaleDateString(undefined, {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                            });

                            return (
                                <div 
                                    key={order.id} 
                                    className="p-3.5 hover:bg-muted/40 transition-colors flex items-center justify-between gap-3 group"
                                >
                                    {/* Left: Store icon & Order info */}
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                                            <Package className="w-4 h-4 text-primary" />
                                        </div>
                                        <div className="min-w-0 space-y-0.5">
                                            <div className="flex items-center gap-2">
                                                <span className="font-mono text-xs font-bold text-foreground">
                                                    #{orderNum}
                                                </span>
                                                {getPlatformBadge(order.store?.platform)}
                                            </div>
                                            <p className="text-[11px] text-muted-foreground truncate">
                                                {customerName} • {orderDate}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Right: Amount, Status & Actions */}
                                    <div className="flex items-center gap-3 shrink-0">
                                        <div className="text-right hidden sm:block">
                                            <p className="font-mono font-bold text-xs text-foreground">
                                                ₹{order.totalAmount?.toLocaleString()}
                                            </p>
                                            <p className="text-[10px] text-muted-foreground uppercase">
                                                {order.financialStatus || 'Paid'}
                                            </p>
                                        </div>

                                        {getStatusBadge(order.fulfillmentStatus || order.status)}

                                        {/* WhatsApp Quick Action */}
                                        {order.customerPhone && (
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                title={`Message ${customerName} on WhatsApp`}
                                                onClick={() => openWhatsApp(order.customerPhone, customerName, orderNum)}
                                                className="w-7 h-7 text-[#25D366] hover:bg-[#25D366]/10 opacity-70 group-hover:opacity-100 transition-opacity"
                                            >
                                                <MessageCircle className="w-3.5 h-3.5" />
                                            </Button>
                                        )}

                                        {/* Inspect Modal Trigger */}
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => setSelectedOrder(order)}
                                            className="w-7 h-7 text-muted-foreground hover:text-foreground opacity-70 group-hover:opacity-100 transition-opacity"
                                        >
                                            <ExternalLink className="w-3.5 h-3.5" />
                                        </Button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </CardContent>

            {/* Order Detail Modal */}
            {selectedOrder && (
                <OrderDetailModal
                    order={selectedOrder}
                    open={!!selectedOrder}
                    onOpenChange={(open) => !open && setSelectedOrder(null)}
                />
            )}
        </Card>
    );
}
