"use client";

import React from 'react';
import Link from 'next/link';
import { 
    Sparkles, 
    ArrowLeft, 
    Globe, 
    Bot, 
    Layers, 
    ShieldCheck,
    Cpu
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function ScraperHeader({ workspaceId }) {
    return (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/60 pb-5">
            <div className="flex items-center gap-3">
                <Link href={`/workspace/${workspaceId}/ecommerce`}>
                    <Button variant="ghost" size="icon" className="rounded-full hover:bg-muted">
                        <ArrowLeft className="w-5 h-5 text-muted-foreground hover:text-foreground" />
                    </Button>
                </Link>
                <div>
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                            <Sparkles className="w-4 h-4 text-cyan-400" />
                        </div>
                        <h1 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
                            AI Catalog Scraper & Web Crawler
                        </h1>
                        <Badge variant="outline" className="text-[10px] font-semibold text-cyan-400 border-cyan-500/30 bg-cyan-500/10 px-2 py-0.5">
                            <Cpu className="w-3 h-3 mr-1" />
                            Gemini 1.5 Flash
                        </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                        Scrape any competitor, supplier or brand store URL. Automatically extract product data, variants, and high-res images directly into your catalog.
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-2">
                <Link href={`/workspace/${workspaceId}/ecommerce/products`}>
                    <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5 border-border/80 bg-card/60">
                        <Layers className="w-3.5 h-3.5 text-primary" />
                        <span>View Catalog</span>
                    </Button>
                </Link>
            </div>
        </div>
    );
}
