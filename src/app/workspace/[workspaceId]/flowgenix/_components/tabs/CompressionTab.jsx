'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { TrendingDown, Sparkles, Scissors, FileText, Zap, RefreshCw, CheckCircle2, ArrowRight } from 'lucide-react';
import { compressPayload, estimateTokens } from '../../_lib/compression-engine';

const SAMPLE_DIFF = `git diff HEAD~1
diff --git a/src/app/api/v1/route.js b/src/app/api/v1/route.js
index 838291..928391 100644
--- a/src/app/api/v1/route.js
+++ b/src/app/api/v1/route.js
@@ -10,6 +10,8 @@ export async function POST(req) {
+  console.log("Processing incoming request payload...");
+  const body = await req.json();
+  // Validate authentication headers
   if (!body.model) return NextResponse.json({ error: "Missing model" });
   at node_modules/next/dist/server/future/route-modules/app-route/module.js:254:20
   at internal/process/task_queues:95:5
[webpack.cache.PackFileCacheStrategy] Stored (150ms)`;

const SAMPLE_PROMPT = `Please be aware that you are an AI assistant. In order to help the user, feel free to always make sure to write clean code. As a large language model, I would be happy to help you with anything. Due to the fact that performance matters, utilize fast algorithms for the purpose of efficiency. Hope this helps!`;

export function CompressionTab() {
    const [rtkEnabled, setRtkEnabled] = useState(true);
    const [cavemanEnabled, setCavemanEnabled] = useState(true);
    const [inflationGuard, setInflationGuard] = useState(true);

    // Playground state
    const [rawInput, setRawInput] = useState(SAMPLE_DIFF);
    const [compressedOutput, setCompressedOutput] = useState('');
    const [metrics, setMetrics] = useState({ original: 0, compressed: 0, savings: 0 });

    const handleRunCompression = (textToCompress = rawInput) => {
        const result = compressPayload(textToCompress, {
            rtk: rtkEnabled,
            caveman: cavemanEnabled,
            inflationGuard
        });

        setCompressedOutput(result.compressed);
        setMetrics({
            original: result.originalTokens,
            compressed: result.compressedTokens,
            savings: result.savingsPercent
        });
    };

    // Auto-run once on load
    React.useEffect(() => {
        handleRunCompression(SAMPLE_DIFF);
    }, [rtkEnabled, cavemanEnabled, inflationGuard]);

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
                                Automatically compacts large context payloads, git diffs, build logs, and conversational system prompts before upstream dispatch.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Compression Engine Rules */}
            <Card className="border-border/50 bg-card/40 backdrop-blur-md">
                <CardHeader className="p-5 pb-3">
                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                        <Scissors className="w-4 h-4 text-primary" /> Active Compression Pipelines
                    </CardTitle>
                    <CardDescription className="text-xs">
                        Configure token reduction rules applied across all gateway requests.
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-5 pt-0 space-y-3">
                    <div className="p-4 rounded-xl border border-border/30 bg-secondary/20 flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3">
                            <Checkbox 
                                id="rtk-toggle" 
                                checked={rtkEnabled} 
                                onCheckedChange={setRtkEnabled}
                                className="mt-0.5"
                            />
                            <div className="space-y-0.5">
                                <label htmlFor="rtk-toggle" className="text-xs font-bold text-foreground cursor-pointer">
                                    RTK Build Output & Diff Filter
                                </label>
                                <p className="text-[11px] text-muted-foreground leading-relaxed">
                                    Compresses git diffs, node_modules stack traces, Gradle & .NET build logs by 50–95%.
                                </p>
                            </div>
                        </div>
                        <Badge variant="outline" className="text-[10px] font-mono bg-emerald-500/10 text-emerald-500 border-emerald-500/20 shrink-0">
                            ~82% avg savings
                        </Badge>
                    </div>

                    <div className="p-4 rounded-xl border border-border/30 bg-secondary/20 flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3">
                            <Checkbox 
                                id="caveman-toggle" 
                                checked={cavemanEnabled} 
                                onCheckedChange={setCavemanEnabled}
                                className="mt-0.5"
                            />
                            <div className="space-y-0.5">
                                <label htmlFor="caveman-toggle" className="text-xs font-bold text-foreground cursor-pointer">
                                    Caveman Token Compression
                                </label>
                                <p className="text-[11px] text-muted-foreground leading-relaxed">
                                    Trims conversational prose structure, filler pleasantries, and redundant directives without altering instructions.
                                </p>
                            </div>
                        </div>
                        <Badge variant="outline" className="text-[10px] font-mono bg-emerald-500/10 text-emerald-500 border-emerald-500/20 shrink-0">
                            ~28% avg savings
                        </Badge>
                    </div>

                    <div className="p-4 rounded-xl border border-border/30 bg-secondary/20 flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3">
                            <Checkbox 
                                id="guard-toggle" 
                                checked={inflationGuard} 
                                onCheckedChange={setInflationGuard}
                                className="mt-0.5"
                            />
                            <div className="space-y-0.5">
                                <label htmlFor="guard-toggle" className="text-xs font-bold text-foreground cursor-pointer">
                                    Inflation Guard
                                </label>
                                <p className="text-[11px] text-muted-foreground leading-relaxed">
                                    Safety lock: Auto-discards compressed result if compression increases token count.
                                </p>
                            </div>
                        </div>
                        <Badge variant="outline" className="text-[10px] font-mono bg-primary/10 text-primary border-primary/20 shrink-0">
                            Safety Lock
                        </Badge>
                    </div>
                </CardContent>
            </Card>

            {/* Live Interactive Compression Playground */}
            <Card className="border-border/50 bg-card/40 backdrop-blur-md">
                <CardHeader className="p-5 pb-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                            <CardTitle className="text-sm font-bold flex items-center gap-2">
                                <FileText className="w-4 h-4 text-amber-500" /> Interactive Compression Sandbox
                            </CardTitle>
                            <CardDescription className="text-xs">
                                Test how the pipeline compresses custom prompts, diffs, and logs in real-time.
                            </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button size="sm" variant="outline" onClick={() => { setRawInput(SAMPLE_DIFF); handleRunCompression(SAMPLE_DIFF); }} className="h-7 text-xs">
                                Load Sample Diff
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => { setRawInput(SAMPLE_PROMPT); handleRunCompression(SAMPLE_PROMPT); }} className="h-7 text-xs">
                                Load Sample Prompt
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-5 pt-0 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Raw Input */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                    Raw Uncompressed Input
                                </span>
                                <Badge variant="outline" className="text-[10px] font-mono">
                                    ~{metrics.original} Tokens
                                </Badge>
                            </div>
                            <Textarea
                                value={rawInput}
                                onChange={(e) => {
                                    setRawInput(e.target.value);
                                    handleRunCompression(e.target.value);
                                }}
                                placeholder="Paste verbose text, logs, or prompt here..."
                                className="h-44 text-xs font-mono bg-secondary/30 border-border/40 resize-none"
                            />
                        </div>

                        {/* Compressed Output */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold uppercase tracking-wider text-emerald-500">
                                    Compressed Payload ({metrics.savings}% Savings)
                                </span>
                                <Badge className="text-[10px] font-mono bg-emerald-500/15 text-emerald-500 border-emerald-500/30">
                                    ~{metrics.compressed} Tokens
                                </Badge>
                            </div>
                            <div className="h-44 p-3 rounded-lg border border-emerald-500/30 bg-emerald-500/5 text-xs font-mono text-emerald-400 overflow-y-auto whitespace-pre-wrap leading-relaxed shadow-inner">
                                {compressedOutput || "Output will appear here..."}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
