"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
    Flame, 
    ArrowRight, 
    Package, 
    Star, 
    ExternalLink 
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export default function EcommerceTopProducts({ workspaceId, selectedStore }) {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;
        const fetchTop = async () => {
            setLoading(true);
            try {
                const res = await fetch(`/api/workspace/${workspaceId}/ecommerce/products/top?storeId=${selectedStore}&limit=4`);
                const data = await res.json();
                if (isMounted && data.success) {
                    setProducts(data.products || []);
                }
            } catch (err) {
                console.error("Failed to load top products:", err);
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        if (workspaceId) {
            fetchTop();
        }

        return () => { isMounted = false; };
    }, [workspaceId, selectedStore]);

    return (
        <Card className="bg-card/70 backdrop-blur-md border-border/80 shadow-sm flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-border/40">
                <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
                        <Flame className="w-3.5 h-3.5 text-orange-500" />
                    </div>
                    <div>
                        <CardTitle className="text-xs font-semibold text-foreground">
                            Merchandising Leaderboard
                        </CardTitle>
                        <p className="text-[10px] text-muted-foreground">
                            Top performing catalog items by velocity
                        </p>
                    </div>
                </div>
                <Link href={`/workspace/${workspaceId}/ecommerce/products`}>
                    <Button variant="ghost" size="sm" className="h-6 text-[11px] text-muted-foreground hover:text-foreground p-0 gap-1">
                        All <ArrowRight className="w-3 h-3" />
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
                                <Skeleton className="w-12 h-4" />
                            </div>
                        ))}
                    </div>
                ) : products.length === 0 ? (
                    <div className="py-6 text-center text-muted-foreground space-y-1">
                        <Package className="w-6 h-6 mx-auto opacity-30 mb-1" />
                        <p className="text-xs">No active catalog products found.</p>
                        <p className="text-[10px]">Add products or connect a store to see leaderboards.</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {products.map((item, idx) => (
                            <div 
                                key={item.id}
                                className="p-2 rounded-xl border border-border/50 bg-background/50 hover:bg-muted/40 transition-colors flex items-center justify-between gap-2.5"
                            >
                                <div className="flex items-center gap-2.5 min-w-0">
                                    <span className="font-mono text-xs font-bold text-muted-foreground/60 w-3.5 text-center">
                                        #{idx + 1}
                                    </span>
                                    {item.thumbnail ? (
                                        <img 
                                            src={item.thumbnail} 
                                            alt={item.title} 
                                            className="w-8 h-8 rounded-lg object-cover border border-border/60 shrink-0" 
                                        />
                                    ) : (
                                        <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0 border border-border/60">
                                            <Package className="w-3.5 h-3.5 text-muted-foreground" />
                                        </div>
                                    )}
                                    <div className="min-w-0">
                                        <p className="text-xs font-semibold text-foreground truncate max-w-[150px]">
                                            {item.title}
                                        </p>
                                        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-mono">
                                            <span>₹{item.price?.toLocaleString()}</span>
                                            <span>•</span>
                                            <span>{item.inventoryCount} in stock</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-1.5 shrink-0">
                                    <div className="flex items-center gap-0.5 text-amber-500 text-[11px] font-bold">
                                        <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                                        <span>{item.rating}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
