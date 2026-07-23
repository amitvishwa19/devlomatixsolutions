'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { TrendingDown, Sparkles, ShieldCheck, Zap, Scissors, FileText, CheckCircle2 } from 'lucide-react';

export function CompressionTab() {
    const [rtkEnabled, setRtkEnabled] = useState(true);
    const [cavemanEnabled, setCavemanEnabled] = useState(true);
    const [inflationGuard, setInflationGuard] = useState(true);

    const compressionEngines = [
        { name: "RTK Build Output Filter", desc: "Compresses git diff, terminal outputs, Gradle & .NET build logs by 50-95%.", enabled: rtkEnabled, toggle: () => setRtkEnabled(!rtkEnabled), savings: "~82% avg" },
        { name: "Caveman Token Compression", desc: "Optimizes prompt prose structure without losing instruction accuracy.", enabled: cavemanEnabled, toggle: () => setCavemanEnabled(!cavemanEnabled), savings: "~28% avg" },
        { name: "Inflation Guard", desc: "Auto-discards compressed result if compression increases token count.", enabled: inflationGuard, toggle: () => setInflationGuard(!inflationGuard), savings: "Safety Lock" },
    ];

    return (
        <div className="space-y-6 pb-6">
            {/* Top Bar Banner */}
            <div className="p-5 rounded-xl border border-emerald-500/30 bg-linear-to-r from-emerald-500/10 via-card to-secondary/20 shadow-lg">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="p-3.5 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-500 shadow-inner">
                            <TrendingDown className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-base font-bold tracking-tight">RTK + Caveman Token Compression Engine</h2>
                                <Badge className="bg-emerald-500/15 text-emerald-500 border-emerald-500/30 text-[10px] font-mono">
                                    ACTIVE • Saves 15% – 95% Tokens
                                </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                Automatically compacts large context payloads, tool outputs, and prompt templates before sending to LLM upstreams.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Compression Engine Rules Card */}
            <Card className="border-border/50 bg-card/40">
                <CardHeader className="p-5 pb-3">
                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                        <Scissors className="w-4 h-4 text-primary" /> Active Compression Pipelines
                    </CardTitle>
                    <CardDescription className="text-xs">
                        Enable or disable token optimization modules.
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-5 pt-0 space-y-4">
                    {compressionEngines.map((engine, idx) => (
                        <div key={idx} className="p-4 rounded-xl border border-border/30 bg-secondary/20 flex items-start justify-between gap-4">
                            <div className="flex items-start gap-3">
                                <Checkbox 
                                    id={`engine-${idx}`} 
                                    checked={engine.enabled} 
                                    onCheckedChange={engine.toggle}
                                    className="mt-0.5"
                                />
                                <div className="space-y-0.5">
                                    <label htmlFor={`engine-${idx}`} className="text-xs font-bold text-foreground cursor-pointer flex items-center gap-2">
                                        {engine.name}
                                    </label>
                                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                                        {engine.desc}
                                    </p>
                                </div>
                            </div>
                            <Badge variant="outline" className="text-[10px] font-mono bg-emerald-500/10 text-emerald-500 border-emerald-500/20 shrink-0">
                                {engine.savings}
                            </Badge>
                        </div>
                    ))}
                </CardContent>
            </Card>

            {/* Live Interactive Compression Playground */}
            <Card className="border-border/50 bg-card/40">
                <CardHeader className="p-5 pb-3">
                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                        <FileText className="w-4 h-4 text-amber-500" /> Compression Preview & Playground
                    </CardTitle>
                    <CardDescription className="text-xs">
                        See how RTK & Caveman compress verbose logs into compact prompt blocks.
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-5 pt-0 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">Raw Uncompressed Tool Output (1,420 Tokens)</span>
                            <div className="p-3 rounded-lg border border-border/40 bg-secondary/30 text-[11px] font-mono text-muted-foreground h-36 overflow-y-auto">
                                {`git diff HEAD~1
diff --git a/src/app/api/v1/route.js b/src/app/api/v1/route.js
index 838291..928391 100644
--- a/src/app/api/v1/route.js
+++ b/src/app/api/v1/route.js
@@ -10,6 +10,8 @@ export async function POST(req) {
+  console.log("Processing incoming request payload...");
+  const body = await req.json();
+  // Validate authentication headers
   if (!body.model) return NextResponse.json({ error: "Missing model" });`}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <span className="text-xs font-bold uppercase tracking-wider text-emerald-500 block">Compressed Output (320 Tokens — 77.4% Savings)</span>
                            <div className="p-3 rounded-lg border border-emerald-500/30 bg-emerald-500/5 text-[11px] font-mono text-emerald-400 h-36 overflow-y-auto">
                                {`[RTK Diff Filter applied]
MODIFIED: src/app/api/v1/route.js (+2 lines)
+  console.log("Processing incoming request payload...");
+  const body = await req.json();
[Target tokens reduced from 1420 to 320]` }
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
