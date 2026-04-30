"use client";

import React, { use, useState, useEffect, useCallback } from 'react';
import { 
    ShoppingCart, 
    Search, 
    Filter, 
    ArrowLeft, 
    Package, 
    Sparkles, 
    AlertTriangle, 
    MoreVertical,
    Plus,
    Edit2,
    Trash2,
    Tags,
    ChevronRight,
    ArrowUpDown,
    Download
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useModal } from '@/hooks/useModal';
import { toast } from 'sonner';
import { AddProductModal } from './_components/AddProductModal';
import { Skeleton } from "@/components/ui/skeleton";

export default function EcommerceProductsPage({ params: paramsPromise }) {
    const params = use(paramsPromise);
    const workspaceId = params.workspaceId;
    const { onOpen } = useModal();
    
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');

    const fetchProducts = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/workspace/${workspaceId}/ecommerce/products`);
            const data = await res.json();
            if (data.success) {
                setProducts(data.products);
            }
        } catch (err) {
            console.error("Failed to fetch products:", err);
            toast.error("Failed to load products");
        } finally {
            setLoading(false);
        }
    }, [workspaceId]);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    const filteredProducts = products.filter(p => {
        const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase()) || 
                              p.sku?.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = filterStatus === 'all' || p.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="space-y-6 animate-in fade-in duration-700 pb-10 p-4">
            <AddProductModal />

            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 overflow-hidden relative group">
                <div className="flex items-center gap-4 relative z-10">
                    <Link href={`/workspace/${workspaceId}/ecommerce`}>
                        <Button variant="ghost" size="icon" className="rounded-md hover:bg-white/10 h-10 w-10">
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                    </Link>
                    <div className="space-y-1">
                        <h1 className="text-xl font-bold text-white flex items-center gap-3">
                            <Package className="text-primary h-6 w-6" />
                            Product Management
                        </h1>
                        <p className="text-[10px] text-muted-foreground font-bold tracking-wider uppercase opacity-60">
                            Manage your items, pricing, and stock levels.
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3 relative z-10">
                    <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-10 px-4 rounded-md gap-2 border-white/10 hover:bg-white/5"
                    >
                        <Download className="w-4 h-4" /> Export CSV
                    </Button>
                    <Button 
                        onClick={() => onOpen('addProduct', { workspaceId, onApply: fetchProducts })}
                        className="h-10 px-6 rounded-md gap-2 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20"
                    >
                        <Plus className="w-4 h-4" /> New Product
                    </Button>
                </div>
            </div>

            {/* Metrics Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: "Total Artifacts", value: products.length, icon: Package, color: "text-blue-400" },
                    { label: "Active Items", value: products.filter(p => p.status === 'active').length, icon: Sparkles, color: "text-emerald-400" },
                    { label: "Low Inventory", value: products.filter(p => (p.inventoryCount || 0) < 10).length, icon: AlertTriangle, color: "text-amber-400" },
                    { label: "Total Value", value: `₹${products.reduce((acc, p) => acc + (p.price || 0), 0).toLocaleString()}`, icon: ShoppingCart, color: "text-purple-400" },
                ].map((stat, i) => (
                    <Card key={i} className="bg-card/30 backdrop-blur-xl border-border/40 shadow-soft overflow-hidden group">
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-60 mb-1">{stat.label}</p>
                                <h3 className="text-xl font-black">{stat.value}</h3>
                            </div>
                            <div className={`p-3 rounded-lg bg-white/5 ${stat.color} group-hover:scale-110 transition-transform`}>
                                <stat.icon className="w-5 h-5" />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Table Control Section */}
            <div className="flex flex-col md:flex-row items-center gap-4 bg-card/20 rounded-md border border-border/40 shadow-xl backdrop-blur-xl p-2 px-4">
                <div className="relative flex-1 group w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40 group-focus-within:text-primary transition-colors" />
                    <Input
                        placeholder="Search by Title or SKU..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10 bg-transparent border-none rounded-md focus-visible:ring-0 shadow-none text-sm h-10"
                    />
                </div>
                <div className="h-6 w-px bg-border/40 hidden md:block mx-2" />
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" className="h-9 px-3 text-[10px] gap-2 opacity-60 hover:opacity-100 uppercase font-black">
                        <Filter className="w-4 h-4" /> Filter
                    </Button>
                    <div className="h-6 w-px bg-border/40 hidden md:block mx-1" />
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-9 px-3 text-[10px] gap-2 opacity-60 hover:opacity-100 uppercase font-black">
                                <ArrowUpDown className="w-4 h-4" /> Sort
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 bg-card/95 border-border/40 backdrop-blur-xl">
                            <DropdownMenuItem className="text-xs">Price: Low to High</DropdownMenuItem>
                            <DropdownMenuItem className="text-xs">Price: High to Low</DropdownMenuItem>
                            <DropdownMenuItem className="text-xs">Latest Added</DropdownMenuItem>
                            <DropdownMenuItem className="text-xs">In Stock</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {/* CRM Table View */}
            <div className="bg-card/30 backdrop-blur-xl rounded-md border border-border/40 shadow-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-border/20 bg-muted/10">
                                <th className="px-6 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Product</th>
                                <th className="px-6 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest">SKU</th>
                                <th className="px-6 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Pricing</th>
                                <th className="px-6 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest text-center">Quantity</th>
                                <th className="px-6 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Status</th>
                                <th className="px-6 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest text-right pr-10">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/10">
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="px-6 py-4"><Skeleton className="h-10 w-40 bg-white/5" /></td>
                                        <td className="px-6 py-4"><Skeleton className="h-6 w-20 bg-white/5" /></td>
                                        <td className="px-6 py-4"><Skeleton className="h-6 w-20 bg-white/5" /></td>
                                        <td className="px-6 py-4"><Skeleton className="h-6 w-12 mx-auto bg-white/5" /></td>
                                        <td className="px-6 py-4"><Skeleton className="h-6 w-20 bg-white/5" /></td>
                                        <td className="px-6 py-4 text-right"><Skeleton className="h-8 w-8 ml-auto bg-white/5" /></td>
                                    </tr>
                                ))
                            ) : filteredProducts.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="py-20 text-center">
                                        <div className="flex flex-col items-center gap-4 opacity-30">
                                            <Package className="w-16 h-16" />
                                            <p className="text-sm font-bold uppercase tracking-widest">No artifacts discovered</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredProducts.map((product) => (
                                    <tr key={product.id} className="group hover:bg-white/[0.02] transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-md bg-white/5 border border-border/40 overflow-hidden flex items-center justify-center grayscale group-hover:grayscale-0 transition-all">
                                                    {product.imageUrl ? (
                                                        <img src={product.imageUrl} alt="" className="object-cover w-full h-full" />
                                                    ) : (
                                                        <Package className="w-5 h-5 text-muted-foreground/30" />
                                                    )}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-bold text-foreground line-clamp-1">{product.title}</p>
                                                    <p className="text-[10px] text-muted-foreground font-medium flex items-center gap-1">
                                                        <Tags className="w-3 h-3" /> {product.category || 'Uncategorized'}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <code className="text-[10px] font-mono text-muted-foreground bg-white/5 px-2 py-0.5 rounded border border-border/20">
                                                {product.sku || 'N/A'}
                                            </code>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="space-y-0.5">
                                                <p className="text-sm font-black">₹{product.price.toLocaleString()}</p>
                                                {product.discount > 0 && (
                                                    <p className="text-[10px] text-emerald-400 font-bold">-{product.discount}% OFF</p>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex flex-col items-center">
                                                <span className={`text-sm font-bold ${product.inventoryCount < 10 ? 'text-amber-400' : 'text-foreground'}`}>
                                                    {product.inventoryCount}
                                                </span>
                                                {product.inventoryCount < 10 && (
                                                    <span className="text-[8px] font-black text-amber-500 uppercase tracking-tighter">Low Stock</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge variant={product.status === 'active' ? 'default' : 'outline'} className={`text-[9px] uppercase font-black px-2 py-0.5 rounded-sm ${product.status === 'active' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-white/5 text-muted-foreground border-white/10'}`}>
                                                {product.status || 'Active'}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4 text-right pr-10">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="w-8 h-8 rounded-md text-muted-foreground hover:text-primary transition-all">
                                                        <MoreVertical className="w-4 h-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-48 bg-card/95 border-border/40 backdrop-blur-xl">
                                                    <DropdownMenuLabel className="text-[10px] opacity-40 uppercase font-black">Artifact Control</DropdownMenuLabel>
                                                    <DropdownMenuSeparator className="bg-white/5" />
                                                    <DropdownMenuItem 
                                                        onClick={() => onOpen('addProduct', { workspaceId, product, onApply: fetchProducts })}
                                                        className="gap-3 text-xs cursor-pointer"
                                                    >
                                                        <Edit2 className="w-4 h-4 text-primary" /> Edit Properties
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem className="gap-3 text-xs cursor-pointer">
                                                        <Sparkles className="w-4 h-4 text-purple-400" /> AI Optimization
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator className="bg-white/5" />
                                                    <DropdownMenuItem className="gap-3 text-xs cursor-pointer text-rose-500 hover:bg-rose-500/10 transition-colors">
                                                        <Trash2 className="w-4 h-4" /> Terminate Item
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
