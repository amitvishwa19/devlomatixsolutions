// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShoppingBag, MessageSquare, AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AbandonedCarts({ workspaceId }) {
    const [carts, setCarts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchCarts = async () => {
            try {
                // In a real app, this would fetch from /api/workspace/${workspaceId}/ecommerce/abandoned
                const res = await fetch(`/api/workspace/${workspaceId}/ecommerce/stats`); 
                const data = await res.json();
                // Mocking data for visual demonstration
                setCarts([
                    { id: '1', customerEmail: 'alex@example.com', totalAmount: 1250, status: 'Active', platform: 'shopify' },
                    { id: '2', customerEmail: 'sam@example.com', totalAmount: 3400, status: 'Active', platform: 'woocommerce' }
                ]);
            } catch (err) {
                console.error("Failed to fetch abandoned carts:", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchCarts();
    }, [workspaceId]);

    const sendRecovery = (id) => {
        alert("Linking to WhatsApp Manager for recovery Flow...");
    };

    if (isLoading) {
        return (
            <Card className="bg-card border h-[300px] flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </Card>
        );
    }

    return (
        <Card className="bg-card border border-amber-500/20 shadow-xl shadow-amber-950/5 text-white">
            <CardHeader className="pb-3 border-b border-amber-500/10 bg-amber-500/2">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-semibold flex items-center gap-2 text-amber-500">
                        <AlertTriangle className="w-4 h-4" />
                        Abandoned Recovery
                    </CardTitle>
                    <Badge variant="outline" className="text-[10px] bg-amber-500/10 text-amber-500 border-amber-500/20">
                        Potentially ₹{(carts.reduce((acc, c) => acc + c.totalAmount, 0)).toLocaleString()} Loss
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                {carts.length === 0 ? (
                    <div className="py-12 text-center text-sm text-muted-foreground">
                        No abandoned carts found
                    </div>
                ) : (
                    <div className="divide-y divide-white/5">
                        {carts.map((cart) => (
                            <div key={cart.id} className="p-4 hover:bg-white/2 transition-colors flex items-center justify-between gap-4">
                                <div className="space-y-1">
                                    <p className="text-sm font-medium text-white">{cart.customerEmail}</p>
                                    <div className="flex items-center gap-2">
                                        <Badge variant="secondary" className="text-[9px] h-4 px-1 opacity-70">
                                            {cart.platform}
                                        </Badge>
                                        <p className="text-xs font-bold text-amber-500/80">₹{cart.totalAmount.toLocaleString()}</p>
                                    </div>
                                </div>
                                <Button 
                                    size="sm" 
                                    variant="outline" 
                                    onClick={() => sendRecovery(cart.id)}
                                    className="h-8 gap-2 border-amber-500/50 hover:bg-amber-500 hover:text-white transition-all text-[11px]"
                                >
                                    <MessageSquare className="w-3.5 h-3.5" />
                                    Recover
                                </Button>
                            </div>
                        ))}
                    </div>
                )}
                <div className="p-3 border-t border-white/5 bg-amber-500/1">
                    <p className="text-[10px] text-center text-muted-foreground italic">
                        Recovery uses automated WhatsApp templates
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}
