"use client";

import React, { use, useState, useEffect } from 'react';
import { ShoppingCart, Search, Filter, ArrowLeft, Package, Sparkles, AlertTriangle, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function EcommerceProductsPage({ params: paramsPromise }) {
    const params = use(paramsPromise);
    const workspaceId = params.workspaceId;
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const res = await fetch(`/api/workspace/${workspaceId}/ecommerce/products`);
                const data = await res.json();
                if (data.success) setProducts(data.products);
            } catch (err) {
                console.error("Failed to fetch products:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, [workspaceId]);

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
                            Product Catalog
                        </h1>
                        <p className="text-xs text-muted-foreground  font-semibold ">
                            Manage items and optimize with AI
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button className="gap-2 shadow-lg shadow-primary/20">
                        <Package className="w-4 h-4" /> Add Product
                    </Button>
                </div>
            </div>

            {/* AI Optimization Banner */}
            <Card className="bg-primary/5 border-primary/20 shadow-lg shadow-primary/5 border-dashed overflow-hidden relative group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Sparkles className="w-24 h-24 text-primary" />
                </div>
                <CardContent className="p-6 relative">
                    <div className="flex flex-col md:flex-row items-center gap-6">
                        <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20 shrink-0">
                            <Sparkles className="w-6 h-6 text-white" />
                        </div>
                        <div className="space-y-1 text-center md:text-left">
                            <h3 className="text-lg font-bold text-white">AI Catalog Optimizer</h3>
                            <p className="text-sm text-muted-foreground">Automatically scan and improve SEO tags, descriptions, and categories for your entire catalog.</p>
                        </div>
                        <Button className="md:ml-auto gap-2 bg-primary hover:bg-primary/80 transition-all font-bold tracking-tighter uppercase text-xs">
                            Start Bulk Optimization
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Product Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {loading ? (
                    [1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                        <Card key={i} className="bg-card border-white/5 h-[300px] animate-pulse" />
                    ))
                ) : products.length === 0 ? (
                    <div className="col-span-full py-20 text-center text-muted-foreground border-2 border-dashed border-white/5 rounded-xl">
                        No products found. Connect a store to sync your catalog.
                    </div>
                ) : (
                    products.map((product) => (
                        <Card key={product.id} className="bg-card border-white/5 hover:border-primary/30 transition-all overflow-hidden group shadow-xl hover:shadow-primary/5">
                            <div className="aspect-square bg-white/3 relative overflow-hidden flex items-center justify-center p-6 grayscale-[0.5] group-hover:grayscale-0 transition-all duration-500">
                                {product.imageUrl ? (
                                    <img src={product.imageUrl} alt={product.title} className="object-cover w-full h-full transform group-hover:scale-110 transition-transform duration-700" />
                                ) : (
                                    <Package className="w-12 h-12 text-muted-foreground/30" />
                                )}
                                <div className="absolute top-2 right-2 flex flex-col gap-1">
                                    <Badge className="bg-black/60 backdrop-blur-md text-[9px] border-white/10">{product.store?.platform}</Badge>
                                    {product.inventoryCount < 10 && (
                                        <Badge variant="destructive" className="text-[9px] flex gap-1">
                                            <AlertTriangle className="w-3 h-3" /> Low Stock
                                        </Badge>
                                    )}
                                </div>
                            </div>
                            <CardHeader className="p-4 space-y-1">
                                <div className="flex items-start justify-between gap-2">
                                    <CardTitle className="text-sm font-bold text-white line-clamp-1 leading-tight">{product.title}</CardTitle>
                                    <button className="text-muted-foreground hover:text-white transition-colors shrink-0">
                                        <MoreVertical className="w-4 h-4" />
                                    </button>
                                </div>
                                <CardDescription className="text-xs text-muted-foreground truncate italic">
                                    {product.store?.name}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-4 pt-0 flex items-center justify-between border-t border-white/5 mt-auto bg-white/1">
                                <p className="text-lg font-black text-white">₹{product.price.toLocaleString()}</p>
                                <Button size="sm" variant="ghost" className="h-8 gap-2 hover:bg-primary hover:text-white group/btn">
                                    <Sparkles className="w-3.5 h-3.5 text-primary group-hover/btn:text-white transition-colors" />
                                    <span className="text-[10px] font-bold uppercase">Optimize</span>
                                </Button>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
