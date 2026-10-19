"use client";

import React, { useState } from 'react';
import { 
    Globe, 
    Sparkles, 
    Store, 
    Layers, 
    Search, 
    ChevronDown, 
    Loader2, 
    Link2,
    SlidersHorizontal
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export default function ScraperInputBar({
    url,
    setUrl,
    stores = [],
    selectedStore,
    setSelectedStore,
    limit,
    setLimit,
    onExtract,
    isExtracting
}) {
    // Quick Platform Detection from URL string
    const getDetectedPlatform = (urlStr) => {
        if (!urlStr) return null;
        const lower = urlStr.toLowerCase();
        if (lower.includes("myshopify.com") || lower.includes("/collections/") || lower.includes("/products/")) {
            return { name: "Shopify Store", color: "text-[#95BF47] bg-[#95BF47]/10 border-[#95BF47]/30" };
        }
        if (lower.includes("woocommerce") || lower.includes("/product-category/")) {
            return { name: "WooCommerce", color: "text-[#7F54B3] bg-[#7F54B3]/10 border-[#7F54B3]/30" };
        }
        if (lower.includes("amazon.")) {
            return { name: "Amazon Marketplace", color: "text-amber-500 bg-amber-500/10 border-amber-500/30" };
        }
        return { name: "Generic Web Store", color: "text-blue-400 bg-blue-500/10 border-blue-500/30" };
    };

    const platformBadge = getDetectedPlatform(url);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (url && !isExtracting) {
            onExtract();
        }
    };

    return (
        <Card className="bg-card/70 backdrop-blur-md border-border/80 shadow-md">
            <CardContent className="p-4 space-y-3.5">
                <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
                    {/* URL Input Bar */}
                    <div className="relative flex-1">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 pointer-events-none">
                            <Globe className="w-4 h-4 text-cyan-400" />
                        </div>
                        <Input
                            type="url"
                            placeholder="Paste product, collection, or catalog URL (e.g. https://brand.com/products/summer-shirt)..."
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            disabled={isExtracting}
                            className="pl-9 pr-36 h-11 text-xs font-medium bg-background/60 border-border/80 focus-visible:ring-cyan-500/30"
                        />
                        {platformBadge && (
                            <div className="absolute right-2.5 top-1/2 -translate-y-1/2">
                                <Badge variant="outline" className={`text-[10px] font-bold px-2 py-0.5 uppercase ${platformBadge.color}`}>
                                    {platformBadge.name}
                                </Badge>
                            </div>
                        )}
                    </div>

                    {/* Target Store Dropdown */}
                    <div className="w-full lg:w-48">
                        <Select value={selectedStore} onValueChange={setSelectedStore} disabled={isExtracting}>
                            <SelectTrigger className="h-11 text-xs border-border/80 bg-background/60">
                                <div className="flex items-center gap-2 truncate">
                                    <Store className="w-3.5 h-3.5 text-primary shrink-0" />
                                    <SelectValue placeholder="Target Store" />
                                </div>
                            </SelectTrigger>
                            <SelectContent>
                                {stores.map((s) => (
                                    <SelectItem key={s.id} value={s.id} className="text-xs">
                                        <div className="flex items-center gap-2">
                                            <span className={`w-2 h-2 rounded-full ${
                                                s.platform === 'shopify' ? 'bg-[#95BF47]' : 
                                                s.platform === 'woocommerce' ? 'bg-[#7F54B3]' : 'bg-blue-400'
                                            }`} />
                                            <span className="truncate">{s.name}</span>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Limit / Scrape Depth */}
                    <div className="w-full lg:w-40">
                        <Select value={String(limit)} onValueChange={(val) => setLimit(Number(val))} disabled={isExtracting}>
                            <SelectTrigger className="h-11 text-xs border-border/80 bg-background/60">
                                <div className="flex items-center gap-2">
                                    <SlidersHorizontal className="w-3.5 h-3.5 text-muted-foreground" />
                                    <SelectValue placeholder="Limit" />
                                </div>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="1" className="text-xs">Single Item (1)</SelectItem>
                                <SelectItem value="5" className="text-xs">Top 5 Items</SelectItem>
                                <SelectItem value="10" className="text-xs">Standard (10 Items)</SelectItem>
                                <SelectItem value="20" className="text-xs">Deep Scan (20 Items)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Start Extraction Button */}
                    <Button 
                        type="submit" 
                        disabled={!url || isExtracting}
                        className="h-11 px-6 text-xs font-semibold gap-2 bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 hover:from-cyan-600 hover:to-emerald-600 text-white shadow-lg shadow-cyan-500/20 shrink-0 transition-all"
                    >
                        {isExtracting ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span>Extracting...</span>
                            </>
                        ) : (
                            <>
                                <Sparkles className="w-4 h-4 text-cyan-200" />
                                <span>Extract with AI</span>
                            </>
                        )}
                    </Button>
                </form>

                {/* Quick Helper Tips */}
                <div className="flex flex-wrap items-center justify-between text-[11px] text-muted-foreground pt-1 border-t border-border/40 gap-2">
                    <span className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                        Supports Shopify, WooCommerce, Amazon, and generic eCommerce storefronts.
                    </span>
                    <span className="text-[10px]">
                        Images are automatically parsed at maximum resolution and variants are mapped.
                    </span>
                </div>
            </CardContent>
        </Card>
    );
}
