"use client";

import React, { use, useState, useEffect, useCallback } from 'react';
import { ShoppingCart, Search, Filter, ArrowLeft, Package, ExternalLink, Download, Grid, List, MoreVertical, Edit2, Trash2, MapPin, Phone, Mail, Truck, CreditCard } from "lucide-react";
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
import { toast } from 'sonner';

export default function EcommerceOrdersPage({ params: paramsPromise }) {
    const params = use(paramsPromise);
    const workspaceId = params.workspaceId;
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('list');
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    const fetchOrders = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/workspace/${workspaceId}/ecommerce/orders?limit=50`);
            const data = await res.json();
            if (data.success) setOrders(data.orders);
        } catch (err) {
            console.error("Failed to fetch orders:", err);
        } finally {
            setLoading(false);
        }
    }, [workspaceId]);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'fulfilled':
            case 'completed': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
            case 'pending': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
            case 'cancelled': return 'bg-destructive/10 text-destructive border-destructive/20';
            case 'partiallyfulfilled':
            case 'partial': return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
            default: return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
        }
    };

    const getFinancialStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'paid': return 'text-emerald-400';
            case 'refunded': return 'text-purple-400';
            case 'pending': return 'text-amber-400';
            default: return 'text-muted-foreground';
        }
    };

    const filteredOrders = orders.filter(order => {
        const matchesSearch = search === '' || 
            order.orderNumber?.toLowerCase().includes(search.toLowerCase()) ||
            order.customerName?.toLowerCase().includes(search.toLowerCase()) ||
            order.customerEmail?.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = statusFilter === 'all' || order.status?.toLowerCase() === statusFilter.toLowerCase();
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
                            Order Management
                        </h1>
                        <p className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">
                            Full transaction history across all platforms
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
                    <Button variant="outline" size="sm" className="gap-2 border-white/10 hover:bg-white/5">
                        <Download className="w-4 h-4" /> Export
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
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-9 bg-black/20 border-white/10 focus:border-primary/50 transition-all"
                        />
                    </div>
                    <div className="flex items-center gap-2 w-full md:w-auto">
                        <Button 
                            variant={statusFilter === 'all' ? 'default' : 'ghost'} 
                            size="sm" 
                            className="gap-2 text-xs font-medium"
                            onClick={() => setStatusFilter('all')}
                        >
                            All
                        </Button>
                        <Button 
                            variant={statusFilter === 'pending' ? 'default' : 'ghost'} 
                            size="sm" 
                            className="gap-2 text-xs font-medium"
                            onClick={() => setStatusFilter('pending')}
                        >
                            Pending
                        </Button>
                        <Button 
                            variant={statusFilter === 'fulfilled' ? 'default' : 'ghost'} 
                            size="sm" 
                            className="gap-2 text-xs font-medium"
                            onClick={() => setStatusFilter('fulfilled')}
                        >
                            Fulfilled
                        </Button>
                        <Button 
                            variant={statusFilter === 'cancelled' ? 'default' : 'ghost'} 
                            size="sm" 
                            className="gap-2 text-xs font-medium"
                            onClick={() => setStatusFilter('cancelled')}
                        >
                            Cancelled
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Orders Grid/List */}
            <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4" : "space-y-3"}>
                {loading ? (
                    viewMode === 'grid' ? (
                        [1, 2, 3, 4, 5, 6].map(i => (
                            <Card key={i} className="bg-card border-white/5 h-[280px] animate-pulse" />
                        ))
                    ) : (
                        [1, 2, 3, 4, 5].map(i => (
                            <Card key={i} className="bg-card border-white/5 h-24 animate-pulse" />
                        ))
                    )
                ) : filteredOrders.length === 0 ? (
                    <div className="col-span-full py-20 text-center text-muted-foreground border-2 border-dashed border-white/5 rounded-xl">
                        No orders found.
                    </div>
                ) : (
                    filteredOrders.map((order) => (
                        viewMode === 'grid' ? (
                            <Card key={order.id} className="bg-card border-white/5 hover:border-primary/30 transition-all overflow-hidden group">
                                <CardHeader className="p-3 pb-0">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center border border-primary/20">
                                                <Package className="w-4 h-4 text-primary" />
                                            </div>
                                            <div>
                                                <CardTitle className="text-xs font-bold text-white">
                                                    #{order.orderNumber || order.externalOrderId.slice(-6)}
                                                </CardTitle>
                                                <p className="text-[9px] text-muted-foreground">
                                                    {new Date(order.createdAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                        <Badge className={`text-[8px] px-1.5 font-bold uppercase ${getStatusColor(order.status)} border`}>
                                            {order.status}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-3 space-y-2">
                                    <div className="flex items-center gap-2">
                                        <Mail className="w-3 h-3 text-muted-foreground" />
                                        <p className="text-[10px] text-muted-foreground truncate">{order.customerEmail || 'No email'}</p>
                                    </div>
                                    {order.customerPhone && (
                                        <div className="flex items-center gap-2">
                                            <Phone className="w-3 h-3 text-muted-foreground" />
                                            <p className="text-[10px] text-muted-foreground">{order.customerPhone}</p>
                                        </div>
                                    )}
                                    {order.metadata?.shippingAddress && (
                                        <div className="flex items-start gap-2">
                                            <MapPin className="w-3 h-3 text-muted-foreground mt-0.5" />
                                            <p className="text-[9px] text-muted-foreground line-clamp-2">
                                                {order.metadata.shippingAddress.city}, {order.metadata.shippingAddress.state}
                                            </p>
                                        </div>
                                    )}
                                    <div className="flex items-center justify-between pt-2 border-t border-white/5">
                                        <div>
                                            <p className="text-sm font-black text-white">₹{order.totalAmount?.toLocaleString()}</p>
                                            <p className={`text-[9px] flex items-center gap-1 ${getFinancialStatusColor(order.financialStatus)}`}>
                                                <CreditCard className="w-2 h-2" />
                                                {order.financialStatus || 'N/A'}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[9px] text-muted-foreground">{order.store?.platform}</p>
                                            <p className={`text-[9px] flex items-center gap-1 ${order.fulfillmentStatus === 'fulfilled' ? 'text-emerald-400' : 'text-amber-400'}`}>
                                                <Truck className="w-2 h-2" />
                                                {order.fulfillmentStatus || 'Unfulfilled'}
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ) : (
                            <Card key={order.id} className="bg-card border-white/5 hover:border-primary/30 transition-all overflow-hidden group">
                                <div className="flex items-center gap-4 p-3">
                                    <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center border border-primary/20 shrink-0">
                                        <Package className="w-5 h-5 text-primary" />
                                    </div>
                                    <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-6 gap-2">
                                        <div className="md:col-span-1">
                                            <p className="text-sm font-bold text-white">#{order.orderNumber || order.externalOrderId.slice(-6)}</p>
                                            <p className="text-[9px] text-muted-foreground">{new Date(order.createdAt).toLocaleDateString()}</p>
                                        </div>
                                        <div className="md:col-span-1">
                                            <p className="text-xs font-medium text-white truncate">{order.customerName || 'Guest'}</p>
                                            <p className="text-[9px] text-muted-foreground truncate">{order.customerEmail}</p>
                                            {order.customerPhone && (
                                                <p className="text-[9px] text-muted-foreground flex items-center gap-1">
                                                    <Phone className="w-2 h-2" /> {order.customerPhone}
                                                </p>
                                            )}
                                        </div>
                                        <div className="md:col-span-1">
                                            {order.metadata?.shippingAddress ? (
                                                <div className="flex items-start gap-1">
                                                    <MapPin className="w-3 h-3 text-muted-foreground mt-0.5 shrink-0" />
                                                    <p className="text-[9px] text-muted-foreground line-clamp-2">
                                                        {order.metadata.shippingAddress.name}<br/>
                                                        {order.metadata.shippingAddress.city}, {order.metadata.shippingAddress.state}<br/>
                                                        {order.metadata.shippingAddress.pincode}
                                                    </p>
                                                </div>
                                            ) : (
                                                <p className="text-[9px] text-muted-foreground">No address</p>
                                            )}
                                        </div>
                                        <div className="md:col-span-1 text-center">
                                            <p className="text-sm font-black text-white">₹{order.totalAmount?.toLocaleString()}</p>
                                            <p className={`text-[9px] flex items-center justify-center gap-1 ${getFinancialStatusColor(order.financialStatus)}`}>
                                                <CreditCard className="w-2 h-2" />
                                                {order.financialStatus || 'Pending'}
                                            </p>
                                        </div>
                                        <div className="md:col-span-1 text-center">
                                            <Badge className={`text-[8px] px-1.5 font-bold uppercase ${getStatusColor(order.status)} border`}>
                                                {order.status}
                                            </Badge>
                                            <p className={`text-[9px] mt-1 flex items-center justify-center gap-1 ${order.fulfillmentStatus === 'fulfilled' ? 'text-emerald-400' : 'text-amber-400'}`}>
                                                <Truck className="w-2 h-2" />
                                                {order.fulfillmentStatus || 'Unfulfilled'}
                                            </p>
                                        </div>
                                        <div className="md:col-span-1">
                                            <Badge variant="outline" className="text-[9px]">{order.store?.platform}</Badge>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 shrink-0">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="w-8 h-8 rounded-md text-muted-foreground hover:text-white hover:bg-white/10 transition-all">
                                                    <MoreVertical className="w-4 h-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-40 bg-black/80 backdrop-blur-xl border-white/10">
                                                <DropdownMenuItem className="gap-2 text-xs cursor-pointer focus:bg-white/10">
                                                    <Edit2 className="w-3 h-3" /> Update Status
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="gap-2 text-xs cursor-pointer focus:bg-white/10">
                                                    <Truck className="w-3 h-3" /> Dispatch
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator className="bg-white/10" />
                                                <DropdownMenuItem className="gap-2 text-xs cursor-pointer focus:bg-white/10">
                                                    <ExternalLink className="w-3 h-3" /> View Details
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