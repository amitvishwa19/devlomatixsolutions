"use client";

import React, { use, useState, useEffect } from 'react';
import { ShoppingBag, MessageSquare, AlertTriangle, ArrowLeft, RefreshCw, Send, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function EcommerceAbandonedPage({ params: paramsPromise }) {
    const params = use(paramsPromise);
    const workspaceId = params.workspaceId;
    const [carts, setCarts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCarts = async () => {
            try {
                const res = await fetch(`/api/workspace/${workspaceId}/ecommerce/abandoned`);
                const data = await res.json();
                if (data.success) setCarts(data.abandonedCarts);
            } catch (err) {
                console.error("Failed to fetch abandoned carts:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchCarts();
    }, [workspaceId]);

    const totalPotentialLoss = carts.reduce((acc, cart) => acc + (cart.totalAmount || 0), 0);

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
                    <Button variant="outline" size="sm" className="gap-2 border-white/10 hover:bg-white/5 transition-all">
                        <RefreshCw className="w-4 h-4" /> Sync Carts
                    </Button>
                </div>
            </div>

            {/* Recovery Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-destructive/5 border-destructive/20 border-dashed">
                    <CardContent className="p-6 flex items-center gap-6">
                        <div className="w-12 h-12 rounded-xl bg-destructive flex items-center justify-center shadow-lg shadow-destructive/20 shrink-0">
                            <AlertTriangle className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Potential Loss</p>
                            <h3 className="text-2xl font-black text-white leading-none mt-1">₹{totalPotentialLoss.toLocaleString()}</h3>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-primary/5 border-primary/20 border-dashed">
                    <CardContent className="p-6 flex items-center gap-6">
                        <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20 shrink-0">
                            <MessageSquare className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Reminders Sent</p>
                            <h3 className="text-2xl font-black text-white leading-none mt-1">{carts.filter(c => c.reminderCount > 0).length}</h3>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-emerald-500/5 border-emerald-500/20 border-dashed">
                    <CardContent className="p-6 flex items-center gap-6">
                        <div className="w-12 h-12 rounded-xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 shrink-0">
                            <CheckCircle2 className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Recovered</p>
                            <h3 className="text-2xl font-black text-white leading-none mt-1">{carts.filter(c => c.recovered).length}</h3>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Abandoned Carts List */}
            <Card className="bg-card border-white/5 shadow-2xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-white/5 bg-white/2">
                                <th className="p-4 text-xs uppercase font-bold text-muted-foreground tracking-widest">Cart Reference</th>
                                <th className="p-4 text-xs uppercase font-bold text-muted-foreground tracking-widest">Customer Details</th>
                                <th className="p-4 text-xs uppercase font-bold text-muted-foreground tracking-widest">Store</th>
                                <th className="p-4 text-xs uppercase font-bold text-muted-foreground tracking-widest text-right">Cart Value</th>
                                <th className="p-4 text-xs uppercase font-bold text-muted-foreground tracking-widest text-center">Reminders</th>
                                <th className="p-4 text-xs uppercase font-bold text-muted-foreground tracking-widest text-center">Status</th>
                                <th className="p-4 text-xs uppercase font-bold text-muted-foreground tracking-widest text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                [1, 2, 3, 4, 5].map(i => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={7} className="p-8 h-16 bg-white/1" />
                                    </tr>
                                ))
                            ) : carts.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="p-12 text-center text-sm text-muted-foreground italic">
                                        No abandoned carts detected. Keep up the high service standards!
                                    </td>
                                </tr>
                            ) : (
                                carts.map((cart) => (
                                    <tr key={cart.id} className="hover:bg-white/2 transition-colors group">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded bg-amber-500/10 flex items-center justify-center border border-amber-500/20 text-amber-500">
                                                    <ShoppingBag className="w-4 h-4" />
                                                </div>
                                                <span className="font-bold text-sm text-white">#{cart.externalCartId.slice(-6)}</span>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <p className="text-sm font-medium text-white">{cart.customerEmail || 'Guest'}</p>
                                            <p className="text-[10px] text-muted-foreground">{cart.customerPhone || 'N/A'}</p>
                                        </td>
                                        <td className="p-4">
                                            <Badge variant="ghost" className="text-[10px] bg-white/5 border-white/10 uppercase tracking-tighter">
                                                {cart.store?.platform}
                                            </Badge>
                                        </td>
                                        <td className="p-4 text-right font-bold text-destructive/80 text-sm">₹{cart.totalAmount.toLocaleString()}</td>
                                        <td className="p-4 text-center">
                                            <div className="flex items-center justify-center gap-1">
                                                <div className={`w-2 h-2 rounded-full ${cart.reminderCount > 0 ? 'bg-primary' : 'bg-muted-foreground/30'}`} />
                                                <span className="text-xs font-medium text-white">{cart.reminderCount}</span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-center">
                                            <Badge className={`text-[9px] px-1.5 font-bold uppercase border ${cart.recovered ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'}`}>
                                                {cart.recovered ? 'RECOVERED' : 'PENDING'}
                                            </Badge>
                                        </td>
                                        <td className="p-4 text-right">
                                            {!cart.recovered && (
                                                <Button size="sm" variant="outline" className="h-8 gap-2 border-primary/30 hover:bg-primary transition-all group/btn text-[11px] font-bold">
                                                    <Send className="w-3 h-3 text-primary group-hover/btn:text-white" /> Recover WA
                                                </Button>
                                            )}
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
