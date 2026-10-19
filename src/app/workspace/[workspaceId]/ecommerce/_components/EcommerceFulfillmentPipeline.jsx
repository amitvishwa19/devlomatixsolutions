"use client";

import React from 'react';
import Link from 'next/link';
import { 
    Clock, 
    PackageCheck, 
    Truck, 
    CheckCircle2, 
    AlertCircle, 
    ArrowRight,
    ArrowUpRight
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function EcommerceFulfillmentPipeline({ workspaceId, stats }) {
    const unfulfilledCount = stats?.unfulfilledOrders ?? 0;
    const totalOrders = stats?.totalOrders ?? 0;

    // Simulated/Derived distribution based on total orders
    const processingCount = Math.max(0, Math.floor(unfulfilledCount * 0.4));
    const newUnfulfilled = Math.max(0, unfulfilledCount - processingCount);
    const deliveredCount = Math.max(0, totalOrders - unfulfilledCount);
    const shippedCount = Math.min(Math.floor(deliveredCount * 0.15), 12);
    const completedCount = Math.max(0, deliveredCount - shippedCount);

    const stages = [
        {
            title: "New Orders",
            subtitle: "Action required",
            count: newUnfulfilled,
            icon: Clock,
            statusParam: "pending",
            color: "text-amber-500",
            bg: "bg-amber-500/10 border-amber-500/20",
            pulse: newUnfulfilled > 0
        },
        {
            title: "Processing",
            subtitle: "Packing & label",
            count: processingCount,
            icon: PackageCheck,
            statusParam: "processing",
            color: "text-blue-500",
            bg: "bg-blue-500/10 border-blue-500/20",
            pulse: false
        },
        {
            title: "Shipped",
            subtitle: "In transit",
            count: shippedCount,
            icon: Truck,
            statusParam: "shipped",
            color: "text-indigo-500",
            bg: "bg-indigo-500/10 border-indigo-500/20",
            pulse: false
        },
        {
            title: "Delivered",
            subtitle: "Completed",
            count: completedCount,
            icon: CheckCircle2,
            statusParam: "completed",
            color: "text-emerald-500",
            bg: "bg-emerald-500/10 border-emerald-500/20",
            pulse: false
        }
    ];

    return (
        <Card className="bg-card/70 backdrop-blur-md border-border/80 shadow-sm overflow-hidden">
            <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-3 border-b border-border/40 gap-2">
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            Fulfillment Lifecycle Pipeline
                        </span>
                        {unfulfilledCount > 0 && (
                            <Badge variant="outline" className="text-[10px] bg-amber-500/10 text-amber-500 border-amber-500/30">
                                {unfulfilledCount} Orders Need Dispatch
                            </Badge>
                        )}
                    </div>
                    <Link href={`/workspace/${workspaceId}/ecommerce/orders?status=pending`}>
                        <Button variant="ghost" size="sm" className="h-6 text-[11px] text-primary hover:text-primary/90 gap-1 p-0">
                            Process Orders <ArrowRight className="w-3 h-3" />
                        </Button>
                    </Link>
                </div>

                {/* Pipeline Stepper Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
                    {stages.map((stage, idx) => (
                        <Link 
                            key={idx}
                            href={`/workspace/${workspaceId}/ecommerce/orders?status=${stage.statusParam}`}
                            className="group"
                        >
                            <div className={`p-3 rounded-xl border transition-all duration-200 hover:border-primary/50 hover:bg-muted/40 ${stage.bg} flex items-center justify-between`}>
                                <div className="space-y-0.5">
                                    <div className="flex items-center gap-1.5">
                                        <p className="text-[11px] font-medium text-foreground group-hover:text-primary transition-colors">
                                            {stage.title}
                                        </p>
                                        {stage.pulse && (
                                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
                                        )}
                                    </div>
                                    <p className="text-[10px] text-muted-foreground">{stage.subtitle}</p>
                                    <h4 className="text-lg font-bold font-mono text-foreground mt-1">
                                        {stage.count}
                                    </h4>
                                </div>
                                <div className={`w-8 h-8 rounded-lg ${stage.bg} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                                    <stage.icon className={`w-4 h-4 ${stage.color}`} />
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
