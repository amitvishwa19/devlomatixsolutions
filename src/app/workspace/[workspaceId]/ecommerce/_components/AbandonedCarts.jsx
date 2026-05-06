"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingCart, ArrowUpRight, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AbandonedCarts({ workspaceId }) {
    // In a real implementation, fetch from /api/.../abandoned-carts
    const recoveredRevenue = 12450;
    const recoveryRate = 14.2;
    const activeAutomations = 2;

    return (
        <Card className="bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-black border-white/5 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl -mr-10 -mt-10" />
            <CardHeader className="pb-2 relative z-10">
                <CardTitle className="text-sm font-bold flex items-center justify-between text-white">
                    <span className="flex items-center gap-2">
                        <ShoppingCart className="w-4 h-4 text-purple-400" />
                        Cart Recovery
                    </span>
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Active
                    </span>
                </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10">
                <div className="mt-2">
                    <p className="text-xs text-muted-foreground mb-1">Recovered Revenue</p>
                    <div className="flex items-end gap-2">
                        <h3 className="text-3xl font-black text-white">₹{recoveredRevenue.toLocaleString()}</h3>
                        <p className="text-xs text-emerald-400 font-medium mb-1 flex items-center">
                            +{recoveryRate}% <ArrowUpRight className="w-3 h-3" />
                        </p>
                    </div>
                </div>

                <div className="mt-6 space-y-3">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-black/40 border border-white/5">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
                                <Mail className="w-4 h-4 text-purple-400" />
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-white">Email Automations</p>
                                <p className="text-[10px] text-muted-foreground">{activeAutomations} active sequences</p>
                            </div>
                        </div>
                        <Button variant="ghost" size="sm" className="text-xs h-7">Edit</Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
