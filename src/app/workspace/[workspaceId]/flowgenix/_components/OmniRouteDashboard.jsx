'use client';

import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { LayoutDashboard, Layers, Cpu, TrendingDown, Activity, Zap, ShieldCheck } from 'lucide-react';

import { OverviewTab } from './tabs/OverviewTab';
import { CombosTab } from './tabs/CombosTab';
import { ProvidersTab } from './tabs/ProvidersTab';
import { CompressionTab } from './tabs/CompressionTab';
import { LogsTab } from './tabs/LogsTab';

export function OmniRouteDashboard({ workspaceId, userId }) {
    const [activeTab, setActiveTab] = useState('overview');

    return (
        <div className="flex flex-col h-full bg-card/20 overflow-hidden shadow-xs">
            {/* Navigation Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between px-6 py-2.5 gap-3 border-b border-border/50 bg-card/60 backdrop-blur-md">
                <div className="flex items-center gap-3">
                    <div className="p-1.5 rounded-lg bg-primary/10 border border-primary/20 text-primary">
                        <Zap className="w-4 h-4 fill-primary/20" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-xs font-bold tracking-tight uppercase">OmniRoute AI Gateway</h1>
                            <Badge className="bg-emerald-500/15 text-emerald-500 border-emerald-500/30 text-[9px] font-mono px-1.5 py-0">
                                250+ Providers
                            </Badge>
                        </div>
                    </div>
                </div>

                {/* Decluttered Tabs Selector */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full md:w-auto overflow-x-auto">
                    <TabsList className="bg-muted/40 p-1 rounded-lg border border-border/40 flex items-center gap-1 w-full md:w-auto">
                        <TabsTrigger value="overview" className="gap-1.5 font-semibold text-xs px-3 py-1 rounded-md text-muted-foreground data-[state=active]:text-foreground data-[state=active]:bg-background shadow-xs">
                            <LayoutDashboard className="h-3.5 w-3.5" /> Overview
                        </TabsTrigger>
                        <TabsTrigger value="combos" className="gap-1.5 font-semibold text-xs px-3 py-1 rounded-md text-muted-foreground data-[state=active]:text-foreground data-[state=active]:bg-background shadow-xs">
                            <Layers className="h-3.5 w-3.5" /> Combos
                        </TabsTrigger>
                        <TabsTrigger value="providers" className="gap-1.5 font-semibold text-xs px-3 py-1 rounded-md text-muted-foreground data-[state=active]:text-foreground data-[state=active]:bg-background shadow-xs">
                            <Cpu className="h-3.5 w-3.5" /> Providers
                        </TabsTrigger>
                        <TabsTrigger value="compression" className="gap-1.5 font-semibold text-xs px-3 py-1 rounded-md text-muted-foreground data-[state=active]:text-foreground data-[state=active]:bg-background shadow-xs">
                            <TrendingDown className="h-3.5 w-3.5" /> Compression
                        </TabsTrigger>
                        <TabsTrigger value="logs" className="gap-1.5 font-semibold text-xs px-3 py-1 rounded-md text-muted-foreground data-[state=active]:text-foreground data-[state=active]:bg-background shadow-xs">
                            <Activity className="h-3.5 w-3.5" /> Logs
                        </TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>

            {/* Content Area */}
            <ScrollArea className="flex-1 min-h-0 relative">
                <div className="p-6">
                    <Tabs value={activeTab} className="h-full">
                        <TabsContent value="overview" className="mt-0">
                            <OverviewTab onNavigateTab={setActiveTab} workspaceId={workspaceId} />
                        </TabsContent>

                        <TabsContent value="combos" className="mt-0">
                            <CombosTab />
                        </TabsContent>

                        <TabsContent value="providers" className="mt-0">
                            <ProvidersTab workspaceId={workspaceId} />
                        </TabsContent>

                        <TabsContent value="compression" className="mt-0">
                            <CompressionTab />
                        </TabsContent>

                        <TabsContent value="logs" className="mt-0">
                            <LogsTab />
                        </TabsContent>
                    </Tabs>
                </div>
            </ScrollArea>
        </div>
    );
}
