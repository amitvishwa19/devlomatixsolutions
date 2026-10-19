"use client";

import React from 'react';
import Link from 'next/link';
import { 
    Store, 
    Settings, 
    Plus, 
    ExternalLink, 
    CheckCircle2, 
    AlertCircle, 
    Radio
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function EcommerceStoreFleet({ workspaceId, stores = [], loading }) {
    const getPlatformLogo = (platform) => {
        switch (platform?.toLowerCase()) {
            case 'shopify':
                return (
                    <div className="w-8 h-8 rounded-lg bg-[#95BF47]/15 border border-[#95BF47]/30 flex items-center justify-center font-bold text-[#95BF47] text-xs">
                        SP
                    </div>
                );
            case 'woocommerce':
                return (
                    <div className="w-8 h-8 rounded-lg bg-[#7F54B3]/15 border border-[#7F54B3]/30 flex items-center justify-center font-bold text-[#7F54B3] text-xs">
                        WC
                    </div>
                );
            default:
                return (
                    <div className="w-8 h-8 rounded-lg bg-blue-500/15 border border-blue-500/30 flex items-center justify-center font-bold text-blue-400 text-xs">
                        API
                    </div>
                );
        }
    };

    return (
        <Card className="bg-card/70 backdrop-blur-md border-border/80 shadow-sm flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-border/40">
                <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                        <Store className="w-3.5 h-3.5 text-blue-500" />
                    </div>
                    <div>
                        <CardTitle className="text-xs font-semibold text-foreground">
                            Connected Store Fleets
                        </CardTitle>
                        <p className="text-[10px] text-muted-foreground">
                            Multi-channel webhooks & sync status
                        </p>
                    </div>
                </div>
                <Link href={`/workspace/${workspaceId}/ecommerce/settings`}>
                    <Button variant="ghost" size="icon" className="w-6 h-6 text-muted-foreground hover:text-foreground">
                        <Settings className="w-3.5 h-3.5" />
                    </Button>
                </Link>
            </CardHeader>

            <CardContent className="p-3 flex-1">
                {stores.length === 0 ? (
                    <div className="py-6 text-center text-muted-foreground space-y-2">
                        <Store className="w-6 h-6 mx-auto opacity-30" />
                        <p className="text-xs">No stores linked yet.</p>
                        <Link href={`/workspace/${workspaceId}/ecommerce/settings`}>
                            <Button size="sm" variant="outline" className="h-7 text-xs gap-1">
                                <Plus className="w-3 h-3" /> Connect Store
                            </Button>
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {stores.map((store) => (
                            <div 
                                key={store.id}
                                className="p-2.5 rounded-xl border border-border/50 bg-background/50 hover:bg-muted/40 transition-colors flex items-center justify-between gap-3"
                            >
                                <div className="flex items-center gap-2.5 min-w-0">
                                    {getPlatformLogo(store.platform)}
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-1.5">
                                            <p className="text-xs font-semibold text-foreground truncate max-w-[130px]">
                                                {store.name}
                                            </p>
                                            {store.isDefault && (
                                                <Badge variant="outline" className="text-[8px] px-1 py-0 uppercase">Default</Badge>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-1 text-[10px] text-emerald-500">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                            <span>Webhooks Active</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-1">
                                    {store.storeUrl && (
                                        <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            className="w-7 h-7 text-muted-foreground hover:text-foreground"
                                            onClick={() => window.open(store.storeUrl, '_blank')}
                                        >
                                            <ExternalLink className="w-3.5 h-3.5" />
                                        </Button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
