"use client";

import React, { use, useState, useEffect, useCallback } from 'react';
import { ShoppingBag, MessageSquare, AlertTriangle, ArrowLeft, RefreshCw, Send, CheckCircle2, Search, Grid, List, MoreVertical, Mail, Phone, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function EcommerceAbandonedPage({ params: paramsPromise }) {
    const params = use(paramsPromise);
    const workspaceId = params.workspaceId;
    const [carts, setCarts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('list');
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    const fetchCarts = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/workspace/${workspaceId}/ecommerce/abandoned`);
            const data = await res.json();
            if (data.success) setCarts(data.abandonedCarts);
        } catch (err) {
            console.error("Failed to fetch abandoned carts:", err);
        } finally {
            setLoading(false);
        }
    }, [workspaceId]);

    useEffect(() => {
        fetchCarts();
    }, [fetchCarts]);

    const totalPotentialLoss = carts.reduce((acc, cart) => acc + (cart.totalAmount || 0), 0);

    const filteredCarts = carts.filter(cart => {
        const matchesSearch = search === '' || 
            cart.customerEmail?.toLowerCase().includes(search.toLowerCase()) ||
            cart.customerPhone?.includes(search) ||
            cart.externalCartId?.slice(-6).includes(search);
        const matchesStatus = statusFilter === 'all' || 
            (statusFilter === 'recovered' && cart.recovered) ||
            (statusFilter === 'pending' && !cart.recovered);
        return matchesSearch && matchesStatus;
    });

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
                            Abandoned Recovery
                        </h1>
                        <p className="text-xs text-muted-foreground font-semibold ">
                            automated re-engagement for lost revenue
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex items-center border border-white/10 rounded-md overflow-hidden">
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className={`rounded-none h-8 w-8 ${viewMode === 'list' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-white'}`}
                            onClick={() => setViewMode('list')}
                        >
                            <List className="w-4 h-4" />
                        </Button>
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className={`rounded-none h-8 w-8 ${viewMode === 'grid' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-white'}`}
                            onClick={() => setViewMode('grid')}
                        >
                            <Grid className="w-4 h-4" />
                        </Button>
                    </div>
                    <Button variant="outline" size="sm" className="gap-2 border-white/10 hover:bg-white/5 transition-all">
                        <RefreshCw className="w-4 h-4" /> Sync
                    </Button>
                </div>
            </div>

            {/* Recovery Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-destructive/5 border-destructive/20 border-dashed">
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-destructive flex items-center justify-center shrink-0">
                            <AlertTriangle className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Potential Loss</p>
                            <h3 className="text-xl font-black text-white leading-none mt-1">₹{totalPotentialLoss.toLocaleString()}</h3>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-primary/5 border-primary/20 border-dashed">
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center shrink-0">
                            <MessageSquare className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Reminders Sent</p>
                            <h3 className="text-xl font-black text-white leading-none mt-1">{carts.filter(c => c.reminderCount > 0).length}</h3>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-emerald-500/5 border-emerald-500/20 border-dashed">
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-emerald-500 flex items-center justify-center shrink-0">
                            <CheckCircle2 className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Recovered</p>
                            <h3 className="text-xl font-black text-white leading-none mt-1">{carts.filter(c => c.recovered).length}</h3>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filter Bar */}
            <Card className="bg-card/50 border-white/5 backdrop-blur-sm">
                <CardContent className="p-4 flex flex-col md:flex-row gap-4 items-center">
                    <div className="relative flex-1 w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by email, phone or cart ID..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-9 bg-black/20 border-white/10 focus:border-primary/50 transition-all"
                        />
                    </div>
                    <div className="flex items-center gap-2 w-full md:w-auto">
                        <Button 
                            variant={statusFilter === 'all' ? 'default' : 'ghost'} 
                            size="sm" 
                            className="text-xs font-medium"
                            onClick={() => setStatusFilter('all')}
                        >
                            All
                        </Button>
                        <Button 
                            variant={statusFilter === 'pending' ? 'default' : 'ghost'} 
                            size="sm" 
                            className="text-xs font-medium"
                            onClick={() => setStatusFilter('pending')}
                        >
                            Pending
                        </Button>
                        <Button 
                            variant={statusFilter === 'recovered' ? 'default' : 'ghost'} 
                            size="sm" 
                            className="text-xs font-medium"
                            onClick={() => setStatusFilter('recovered')}
                        >
                            Recovered
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Abandoned Carts Grid/List */}
            <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4" : "space-y-3"}>
                {loading ? (
                    viewMode === 'grid' ? (
                        [1, 2, 3, 4, 5, 6].map(i => (
                            <Card key={i} className="bg-card border-white/5 h-[240px] animate-pulse" />
                        ))
                    ) : (
                        [1, 2, 3, 4, 5].map(i => (
                            <Card key={i} className="bg-card border-white/5 h-20 animate-pulse" />
                        ))
                    )
                ) : filteredCarts.length === 0 ? (
                    <div className="col-span-full py-20 text-center text-muted-foreground border-2 border-dashed border-white/5 rounded-xl">
                        No abandoned carts found.
                    </div>
                ) : (
                    filteredCarts.map((cart) => (
                        viewMode === 'grid' ? (
                            <Card key={cart.id} className="bg-card border-white/5 hover:border-primary/30 transition-all overflow-hidden group">
                                <CardHeader className="p-3 pb-0">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                                                <ShoppingBag className="w-4 h-4 text-amber-500" />
                                            </div>
                                            <div>
                                                <CardTitle className="text-xs font-bold text-white">
                                                    #{cart.externalCartId.slice(-6)}
                                                </CardTitle>
                                                <p className="text-[9px] text-muted-foreground">
                                                    {new Date(cart.createdAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                        <Badge className={`text-[8px] px-1.5 font-bold uppercase border ${cart.recovered ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'}`}>
                                            {cart.recovered ? 'Recovered' : 'Pending'}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-3 space-y-2">
                                    <div className="flex items-center gap-2">
                                        <Mail className="w-3 h-3 text-muted-foreground" />
                                        <p className="text-[10px] text-muted-foreground truncate">{cart.customerEmail || 'Guest'}</p>
                                    </div>
                                    {cart.customerPhone && (
                                        <div className="flex items-center gap-2">
                                            <Phone className="w-3 h-3 text-muted-foreground" />
                                            <p className="text-[10px] text-muted-foreground">{cart.customerPhone}</p>
                                        </div>
                                    )}
                                    {cart.metadata?.shippingAddress && (
                                        <div className="flex items-start gap-2">
                                            <MapPin className="w-3 h-3 text-muted-foreground mt-0.5" />
                                            <p className="text-[9px] text-muted-foreground line-clamp-2">
                                                {cart.metadata.shippingAddress.city}, {cart.metadata.shippingAddress.state}
                                            </p>
                                        </div>
                                    )}
                                    <div className="flex items-center justify-between pt-2 border-t border-white/5">
                                        <div>
                                            <p className="text-sm font-black text-destructive/80">₹{cart.totalAmount?.toLocaleString()}</p>
                                        </div>
                                        <div className="text-right">
                                            <div className="flex items-center gap-1">
                                                <div className={`w-2 h-2 rounded-full ${cart.reminderCount > 0 ? 'bg-primary' : 'bg-muted-foreground/30'}`} />
                                                <span className="text-[9px] text-muted-foreground">{cart.reminderCount} reminders</span>
                                            </div>
                                        </div>
                                    </div>
                                    {!cart.recovered && (
                                        <Button size="sm" className="w-full h-7 gap-1 text-[10px] font-bold">
                                            <Send className="w-3 h-3" /> Send Recovery
                                        </Button>
                                    )}
                                </CardContent>
                            </Card>
                        ) : (
                            <Card key={cart.id} className="bg-card border-white/5 hover:border-primary/30 transition-all overflow-hidden group">
                                <div className="flex items-center gap-4 p-3">
                                    <div className="w-10 h-10 rounded-md bg-amber-500/10 flex items-center justify-center border border-amber-500/20 shrink-0">
                                        <ShoppingBag className="w-5 h-5 text-amber-500" />
                                    </div>
                                    <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-6 gap-2">
                                        <div className="md:col-span-1">
                                            <p className="text-sm font-bold text-white">#{cart.externalCartId.slice(-6)}</p>
                                            <p className="text-[9px] text-muted-foreground">{new Date(cart.createdAt).toLocaleDateString()}</p>
                                        </div>
                                        <div className="md:col-span-1">
                                            <p className="text-xs font-medium text-white truncate">{cart.customerEmail || 'Guest'}</p>
                                            {cart.customerPhone && (
                                                <p className="text-[9px] text-muted-foreground flex items-center gap-1">
                                                    <Phone className="w-2 h-2" /> {cart.customerPhone}
                                                </p>
                                            )}
                                        </div>
                                        <div className="md:col-span-1">
                                            {cart.metadata?.shippingAddress ? (
                                                <div className="flex items-start gap-1">
                                                    <MapPin className="w-3 h-3 text-muted-foreground mt-0.5 shrink-0" />
                                                    <p className="text-[9px] text-muted-foreground line-clamp-2">
                                                        {cart.metadata.shippingAddress.city}, {cart.metadata.shippingAddress.state} - {cart.metadata.shippingAddress.pincode}
                                                    </p>
                                                </div>
                                            ) : (
                                                <p className="text-[9px] text-muted-foreground">No address</p>
                                            )}
                                        </div>
                                        <div className="md:col-span-1 text-center">
                                            <p className="text-sm font-black text-destructive/80">₹{cart.totalAmount?.toLocaleString()}</p>
                                        </div>
                                        <div className="md:col-span-1 text-center">
                                            <div className="flex items-center justify-center gap-1">
                                                <div className={`w-2 h-2 rounded-full ${cart.reminderCount > 0 ? 'bg-primary' : 'bg-muted-foreground/30'}`} />
                                                <span className="text-[9px] text-muted-foreground">{cart.reminderCount}</span>
                                            </div>
                                        </div>
                                        <div className="md:col-span-1 flex items-center justify-center">
                                            <Badge className={`text-[8px] px-1.5 font-bold uppercase border ${cart.recovered ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'}`}>
                                                {cart.recovered ? 'Recovered' : 'Pending'}
                                            </Badge>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 shrink-0">
                                        {!cart.recovered ? (
                                            <Button size="sm" variant="outline" className="h-8 gap-1 border-primary/30 hover:bg-primary text-[10px] font-bold">
                                                <Send className="w-3 h-3 text-primary group-hover:text-white" />
                                            </Button>
                                        ) : (
                                            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                        )}
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="w-8 h-8 rounded-md text-muted-foreground hover:text-white hover:bg-white/10 transition-all">
                                                    <MoreVertical className="w-4 h-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-40 bg-black/80 backdrop-blur-xl border-white/10">
                                                <DropdownMenuItem className="gap-2 text-xs cursor-pointer focus:bg-white/10">
                                                    <Send className="w-3 h-3" /> Send Reminder
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="gap-2 text-xs cursor-pointer focus:bg-white/10">
                                                    <MessageSquare className="w-3 h-3" /> WhatsApp
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator className="bg-white/10" />
                                                <DropdownMenuItem className="gap-2 text-xs cursor-pointer focus:bg-white/10">
                                                    View Details
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </div>
                            </Card>
                        )
                    ))
                )}
            </div>
        </div>
    );
}