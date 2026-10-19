"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
    ShoppingCart, 
    ArrowRight, 
    MessageCircle, 
    Mail, 
    Sparkles, 
    CheckCircle2, 
    DollarSign,
    ExternalLink
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from 'sonner';

export default function EcommerceCartRecovery({ workspaceId, selectedStore, stats }) {
    const [carts, setCarts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;
        const fetchCarts = async () => {
            setLoading(true);
            try {
                const res = await fetch(`/api/workspace/${workspaceId}/ecommerce/abandoned?storeId=${selectedStore}&limit=4`);
                const data = await res.json();
                if (isMounted && data.success) {
                    setCarts(data.abandonedCarts || []);
                }
            } catch (err) {
                console.error("Failed to load abandoned carts:", err);
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        if (workspaceId) {
            fetchCarts();
        }

        return () => { isMounted = false; };
    }, [workspaceId, selectedStore]);

    const recoverableRevenue = stats?.recoverableRevenue ?? 0;
    const abandonedCount = stats?.abandonedCartsCount ?? carts.length;

    const sendRecoveryWhatsApp = (cart) => {
        const phone = cart.customerPhone;
        if (!phone) {
            toast.error("Customer phone not available for WhatsApp outreach");
            return;
        }
        const cleanPhone = phone.replace(/[^0-9]/g, '');
        const message = encodeURIComponent(
            `Hi there! We noticed you left some great items in your cart totaling ₹${cart.totalAmount?.toLocaleString() || 0}. Use coupon code *SAVE10* to get 10% OFF if you complete your order today! Let us know if you need any help completing checkout.`
        );
        window.open(`https://wa.me/${cleanPhone}?text=${message}`, '_blank');
        toast.success("WhatsApp recovery prompt opened");
    };

    return (
        <Card className="bg-gradient-to-br from-purple-500/10 via-indigo-500/5 to-card/80 border-purple-500/20 shadow-sm relative overflow-hidden flex flex-col">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />
            
            <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-border/40 relative z-10">
                <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-purple-500/20 border border-purple-500/30 flex items-center justify-center">
                        <ShoppingCart className="w-3.5 h-3.5 text-purple-400" />
                    </div>
                    <div>
                        <CardTitle className="text-xs font-semibold text-foreground">
                            Cart Recovery Terminal
                        </CardTitle>
                        <p className="text-[10px] text-muted-foreground">
                            Automated abandoned checkout retargeting
                        </p>
                    </div>
                </div>
                <Link href={`/workspace/${workspaceId}/ecommerce/abandoned`}>
                    <Button variant="ghost" size="sm" className="h-6 text-[11px] text-purple-400 hover:text-purple-300 p-0 gap-1">
                        View All <ArrowRight className="w-3 h-3" />
                    </Button>
                </Link>
            </CardHeader>

            <CardContent className="p-3.5 flex-1 relative z-10 space-y-3">
                {/* Recoverable Counter Ribbon */}
                <div className="p-3 rounded-xl bg-background/60 border border-purple-500/20 flex items-center justify-between">
                    <div>
                        <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                            Recoverable Revenue
                        </span>
                        <h4 className="text-xl font-bold font-mono text-purple-400 mt-0.5">
                            ₹{recoverableRevenue.toLocaleString()}
                        </h4>
                    </div>
                    <Badge variant="outline" className="text-[10px] bg-purple-500/10 text-purple-400 border-purple-500/30 px-2 py-0.5 font-semibold">
                        {abandonedCount} At-Risk Carts
                    </Badge>
                </div>

                {/* Recent Abandoned Checkouts */}
                {loading ? (
                    <div className="space-y-2">
                        {[1, 2].map(i => (
                            <Skeleton key={i} className="h-14 w-full rounded-xl" />
                        ))}
                    </div>
                ) : carts.length === 0 ? (
                    <div className="py-4 text-center text-muted-foreground text-xs">
                        <CheckCircle2 className="w-5 h-5 mx-auto text-emerald-500/80 mb-1" />
                        No pending abandoned checkouts.
                    </div>
                ) : (
                    <div className="space-y-2">
                        {carts.slice(0, 3).map((cart) => {
                            const customerDisplay = cart.customerEmail || cart.customerPhone || 'Anonymous Guest';
                            return (
                                <div 
                                    key={cart.id}
                                    className="p-2.5 rounded-xl border border-border/50 bg-background/50 hover:bg-muted/40 transition-colors flex items-center justify-between gap-2"
                                >
                                    <div className="min-w-0 space-y-0.5">
                                        <div className="flex items-center gap-1.5">
                                            <p className="text-xs font-semibold text-foreground truncate max-w-[150px]">
                                                {customerDisplay}
                                            </p>
                                        </div>
                                        <p className="text-[10px] text-muted-foreground font-mono">
                                            Value: ₹{cart.totalAmount?.toLocaleString() || 0} • {cart.store?.name}
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-1.5 shrink-0">
                                        {cart.customerPhone && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => sendRecoveryWhatsApp(cart)}
                                                className="h-7 text-[10px] font-semibold gap-1 text-[#25D366] border-[#25D366]/30 bg-[#25D366]/10 hover:bg-[#25D366]/20 px-2"
                                            >
                                                <MessageCircle className="w-3 h-3" />
                                                <span>WhatsApp</span>
                                            </Button>
                                        )}
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
