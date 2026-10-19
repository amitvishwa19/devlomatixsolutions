"use client";

import React from 'react';
import Link from 'next/link';
import { 
    Tag, 
    Package, 
    Users, 
    ShoppingBag, 
    Ticket, 
    Star, 
    ShoppingCart, 
    Settings,
    Sparkles,
    ArrowUpRight
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function EcommerceQuickNav({ workspaceId }) {
    const modules = [
        {
            title: "Categories",
            desc: "Taxonomy & Tree",
            href: `/workspace/${workspaceId}/ecommerce/categories`,
            icon: Tag,
            color: "text-amber-500",
            bg: "bg-amber-500/10 border-amber-500/20"
        },
        {
            title: "Product Catalog",
            desc: "SKUs, Variants & Stock",
            href: `/workspace/${workspaceId}/ecommerce/products`,
            icon: Package,
            color: "text-blue-500",
            bg: "bg-blue-500/10 border-blue-500/20"
        },
        {
            title: "Customer CRM",
            desc: "Clients & Purchasing",
            href: `/workspace/${workspaceId}/ecommerce/clients`,
            icon: Users,
            color: "text-emerald-500",
            bg: "bg-emerald-500/10 border-emerald-500/20"
        },
        {
            title: "Orders Queue",
            desc: "Fulfill & Print Slips",
            href: `/workspace/${workspaceId}/ecommerce/orders`,
            icon: ShoppingBag,
            color: "text-indigo-500",
            bg: "bg-indigo-500/10 border-indigo-500/20"
        },
        {
            title: "Discount Coupons",
            desc: "Flash Promos & Codes",
            href: `/workspace/${workspaceId}/ecommerce/marketing/coupons`,
            icon: Ticket,
            color: "text-rose-500",
            bg: "bg-rose-500/10 border-rose-500/20"
        },
        {
            title: "Product Reviews",
            desc: "Ratings & Feedback",
            href: `/workspace/${workspaceId}/ecommerce/marketing/reviews`,
            icon: Star,
            color: "text-amber-400",
            bg: "bg-amber-400/10 border-amber-400/20"
        },
        {
            title: "Abandoned Carts",
            desc: "Checkout Recovery",
            href: `/workspace/${workspaceId}/ecommerce/abandoned`,
            icon: ShoppingCart,
            color: "text-purple-500",
            bg: "bg-purple-500/10 border-purple-500/20"
        },
        {
            title: "AI Scraper",
            desc: "Extract & Import Catalog",
            href: `/workspace/${workspaceId}/ecommerce/scraper`,
            icon: Sparkles,
            color: "text-cyan-400",
            bg: "bg-cyan-500/10 border-cyan-500/20"
        },
        {
            title: "Store Settings",
            desc: "API Keys & Webhooks",
            href: `/workspace/${workspaceId}/ecommerce/settings`,
            icon: Settings,
            color: "text-slate-400",
            bg: "bg-slate-500/10 border-slate-500/20"
        }
    ];

    return (
        <div className="space-y-2.5">
            <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    eCommerce Modules & Workflows
                </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-9 gap-2.5">
                {modules.map((item, idx) => (
                    <Link key={idx} href={item.href} className="group">
                        <Card className="h-full bg-card/60 backdrop-blur-sm border-border/80 shadow-sm hover:border-primary/40 hover:bg-card/90 transition-all duration-200">
                            <CardContent className="p-3 flex flex-col justify-between h-full">
                                <div className="flex items-center justify-between mb-2">
                                    <div className={`w-7 h-7 rounded-lg ${item.bg} border flex items-center justify-center group-hover:scale-105 transition-transform`}>
                                        <item.icon className={`w-3.5 h-3.5 ${item.color}`} />
                                    </div>
                                    <ArrowUpRight className="w-3 h-3 text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                                </div>
                                <div>
                                    <h4 className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                                        {item.title}
                                    </h4>
                                    <p className="text-[10px] text-muted-foreground truncate mt-0.5">
                                        {item.desc}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>
        </div>
    );
}
