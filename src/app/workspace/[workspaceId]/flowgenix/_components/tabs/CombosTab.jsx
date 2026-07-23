'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Layers, Plus, ShieldAlert, Sparkles, Check, ArrowRight, Settings2, Trash2 } from 'lucide-react';

export function CombosTab() {
    const [selectedStrategy, setSelectedStrategy] = useState("priority");
    const [comboName, setComboName] = useState("");

    const presetStrategies = [
        { id: "auto", name: "auto", label: "Balanced Default (LKGP)", desc: "12-factor live evaluation. Sticks to last known good provider.", badge: "Zero-Config" },
        { id: "auto/coding", name: "auto/coding", label: "Quality-First Coding", desc: "Optimized weights for code generation & reasoning.", badge: "Preset" },
        { id: "auto/fast", name: "auto/fast", label: "Lowest Latency", desc: "Prioritizes high-speed inference endpoints (Groq, Cerebras).", badge: "Preset" },
        { id: "auto/cheap", name: "auto/cheap", label: "Cost-Minimizer", desc: "Routes to lowest $/1M tokens available, including free tiers.", badge: "Preset" },
        { id: "auto/smart", name: "auto/smart", label: "Exploration + Smart", desc: "Quality-first with 10% exploration for discovering optimal models.", badge: "Preset" },
    ];

    const allStrategies = [
        { value: "priority", label: "Priority Ordered List (First-Target)", desc: "Drains targets in ordered sequence before moving to backup." },
        { value: "fill-first", label: "Fill-First", desc: "Fills each target's quota fully before moving to next target." },
        { value: "weighted", label: "Weighted Random", desc: "Distributes load by configured target weight percentages." },
        { value: "round-robin", label: "Round-Robin", desc: "Cycles sequentially through configured target targets." },
        { value: "least-used", label: "Least-Used Target", desc: "Picks model target with lowest active concurrency." },
        { value: "cost-optimized", label: "Cost-Optimized", desc: "Live dynamic minimum cost per request routing." },
        { value: "fusion", label: "Fusion (Multi-Model Parallel)", desc: "Fans out request to multiple models; judge synthesizes top response." },
        { value: "pipeline", label: "Pipeline Chaining", desc: "Chains steps where output of target A feeds into target B." }
    ];

    const existingCombos = [
        { id: "1", name: "coding-pro-fallback", strategy: "priority", targets: ["claude-3-7-sonnet", "deepseek-v3", "gemini-2-0-flash"] },
        { id: "2", name: "fast-summarizer", strategy: "round-robin", targets: ["llama-3.3-70b-groq", "llama-3.1-8b-cerebras"] },
        { id: "3", name: "budget-guard", strategy: "cost-optimized", targets: ["glm-4-flash", "qwen-2.5-coder-free", "deepseek-v3"] }
    ];

    return (
        <div className="space-y-6 pb-6">
            {/* Header & Explanation */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl border border-border/50 bg-card/40">
                <div>
                    <h2 className="text-base font-bold flex items-center gap-2">
                        <Layers className="w-5 h-5 text-primary" /> Combos & Routing Strategies
                    </h2>
                    <p className="text-xs text-muted-foreground mt-0.5">
                        Define failover chains across providers. Quota depleted or provider down? OmniRoute automatically slides to the next model.
                    </p>
                </div>
                <Badge variant="outline" className="w-fit text-xs font-mono bg-primary/10 text-primary border-primary/20 px-3 py-1">
                    18 Routing Strategies Supported
                </Badge>
            </div>

            {/* Zero-Config Presets */}
            <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Zero-Config System Presets
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {presetStrategies.map((preset) => (
                        <Card key={preset.id} className="border-border/40 bg-card/30 hover:border-primary/40 transition-all cursor-pointer group">
                            <CardHeader className="p-4 pb-2">
                                <div className="flex items-center justify-between">
                                    <span className="font-mono text-xs font-bold text-foreground group-hover:text-primary transition-colors">
                                        {preset.name}
                                    </span>
                                    <Badge className="text-[9px] bg-secondary text-secondary-foreground">
                                        {preset.badge}
                                    </Badge>
                                </div>
                                <CardTitle className="text-xs font-semibold text-muted-foreground mt-1">
                                    {preset.label}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 pt-0">
                                <p className="text-[11px] text-muted-foreground leading-relaxed">
                                    {preset.desc}
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>

            {/* Custom Combo Creator */}
            <Card className="border-border/50 bg-card/40">
                <CardHeader className="p-5 pb-3">
                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                        <Plus className="w-4 h-4 text-primary" /> Create Custom Routing Combo
                    </CardTitle>
                    <CardDescription className="text-xs">
                        Combine multiple connected models into a single failover endpoint ID.
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-5 pt-0 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Combo Name / Alias</label>
                            <Input 
                                placeholder="e.g. custom/coding-chain" 
                                value={comboName} 
                                onChange={(e) => setComboName(e.target.value)}
                                className="bg-secondary/30 border-border/40 text-xs"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Routing Strategy</label>
                            <Select value={selectedStrategy} onValueChange={setSelectedStrategy}>
                                <SelectTrigger className="bg-secondary/30 border-border/40 text-xs">
                                    <SelectValue placeholder="Select strategy" />
                                </SelectTrigger>
                                <SelectContent>
                                    {allStrategies.map((s) => (
                                        <SelectItem key={s.value} value={s.value} className="text-xs">
                                            {s.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="flex justify-end pt-2">
                        <Button size="sm" variant="save" className="text-xs font-semibold">
                            <Plus className="w-3.5 h-3.5 mr-1" /> Create Combo Rule
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Configured Custom Combos Table */}
            <Card className="border-border/50 bg-card/40">
                <CardHeader className="p-5 pb-3">
                    <CardTitle className="text-sm font-bold">Active Custom Combos</CardTitle>
                </CardHeader>
                <CardContent className="p-5 pt-0 space-y-3">
                    {existingCombos.map((combo) => (
                        <div key={combo.id} className="p-3.5 rounded-lg border border-border/40 bg-secondary/20 flex flex-col md:flex-row md:items-center justify-between gap-3">
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <span className="font-mono text-xs font-bold">{combo.name}</span>
                                    <Badge variant="outline" className="text-[9px] uppercase font-mono bg-primary/10 text-primary">
                                        {combo.strategy}
                                    </Badge>
                                </div>
                                <div className="flex items-center gap-2 flex-wrap text-[11px] text-muted-foreground">
                                    <span>Sequence:</span>
                                    {combo.targets.map((t, idx) => (
                                        <React.Fragment key={idx}>
                                            <span className="font-mono text-foreground font-medium bg-muted/30 px-2 py-0.5 rounded-md">{t}</span>
                                            {idx < combo.targets.length - 1 && <ArrowRight className="w-3 h-3 text-muted-foreground" />}
                                        </React.Fragment>
                                    ))}
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button size="sm" variant="ghost" className="h-8 text-xs text-muted-foreground hover:text-foreground">
                                    <Settings2 className="w-3.5 h-3.5 mr-1" /> Edit
                                </Button>
                                <Button size="sm" variant="ghost" className="h-8 text-xs text-destructive hover:bg-destructive/10">
                                    <Trash2 className="w-3.5 h-3.5" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>
    );
}
