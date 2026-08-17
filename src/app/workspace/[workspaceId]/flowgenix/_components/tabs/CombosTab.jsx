'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Layers, Plus, ShieldAlert, Sparkles, Check, ArrowRight, Settings2, Trash2, Loader2, Play } from 'lucide-react';
import { toast } from 'sonner';
import { getCombosAction, saveComboAction, deleteComboAction } from '../../_action/combo-actions';
import { getProvidersAction } from '../../_action/provider-actions';

export function CombosTab({ workspaceId }) {
    const [combos, setCombos] = useState([]);
    const [providers, setProviders] = useState([]);
    const [loading, setLoading] = useState(true);

    // Form state
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [comboName, setComboName] = useState('');
    const [selectedStrategy, setSelectedStrategy] = useState('priority');
    const [comboDesc, setComboDesc] = useState('');
    const [targets, setTargets] = useState(['claude-3-7-sonnet', 'deepseek-chat-v3', 'gemini-2.0-flash']);
    const [newTargetInput, setNewTargetInput] = useState('');

    const presetStrategies = [
        { id: "auto", name: "auto", label: "Balanced Default (LKGP)", desc: "12-factor live evaluation. Automatically sticks to last known good provider.", badge: "Zero-Config" },
        { id: "auto/coding", name: "auto/coding", label: "Quality-First Coding", desc: "Optimized weights for code generation, AST reasoning & refactoring.", badge: "Preset" },
        { id: "auto/fast", name: "auto/fast", label: "Lowest Latency", desc: "Prioritizes high-speed inference endpoints (Groq Llama 3.3, Cerebras).", badge: "Preset" },
        { id: "auto/cheap", name: "auto/cheap", label: "Cost-Minimizer", desc: "Routes to lowest $/1M tokens available, including free tiers & FreeModel.", badge: "Preset" },
        { id: "auto/smart", name: "auto/smart", label: "Deep Reasoning", desc: "Routes complex questions to reasoning frontier models (Claude 3.7, DeepSeek R1).", badge: "Preset" },
    ];

    const allStrategies = [
        { value: "priority", label: "Priority Ordered List (First-Target)", desc: "Drains targets in ordered sequence before moving to backup." },
        { value: "fill-first", label: "Fill-First", desc: "Fills each target's quota fully before moving to next target." },
        { value: "weighted", label: "Weighted Random", desc: "Distributes load by configured target weight percentages." },
        { value: "round-robin", label: "Round-Robin", desc: "Cycles sequentially through configured target targets." },
        { value: "least-used", label: "Least-Used Target", desc: "Picks model target with lowest active concurrency." },
        { value: "cost-optimized", label: "Cost-Optimized", desc: "Live dynamic minimum cost per request routing." },
        { value: "fusion", label: "Fusion (Multi-Model Parallel)", desc: "Fans out request to multiple models; judge synthesizes top response." }
    ];

    const loadData = useCallback(async () => {
        if (!workspaceId) return;
        setLoading(true);
        try {
            const [combosRes, provRes] = await Promise.all([
                getCombosAction(workspaceId),
                getProvidersAction(workspaceId)
            ]);

            if (combosRes.success) setCombos(combosRes.data || []);
            if (provRes.success) setProviders(provRes.data || []);
        } catch (err) {
            console.error("Error loading combos:", err);
        } finally {
            setLoading(false);
        }
    }, [workspaceId]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleAddTarget = () => {
        if (!newTargetInput.trim()) return;
        setTargets(prev => [...prev, newTargetInput.trim()]);
        setNewTargetInput('');
    };

    const handleRemoveTarget = (index) => {
        setTargets(prev => prev.filter((_, idx) => idx !== index));
    };

    const handleSaveCombo = async (e) => {
        e?.preventDefault();
        if (!comboName.trim() || targets.length === 0) {
            toast.error("Combo Name and at least 1 target model are required.");
            return;
        }

        setSaving(true);
        try {
            const res = await saveComboAction({
                workspaceId,
                combo: {
                    name: comboName.trim(),
                    strategy: selectedStrategy,
                    targets,
                    desc: comboDesc.trim() || "Custom failover cascade rule"
                }
            });

            if (res.success) {
                toast.success(`Combo '${res.data.name}' saved successfully!`);
                setIsCreateOpen(false);
                setComboName('');
                setComboDesc('');
                loadData();
            } else {
                toast.error(res.error || "Failed to save combo");
            }
        } catch (err) {
            toast.error(err.message || "Failed to save combo");
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteCombo = async (id) => {
        if (!confirm("Are you sure you want to delete this custom combo?")) return;
        try {
            const res = await deleteComboAction({ workspaceId, id });
            if (res.success) {
                toast.success("Combo deleted");
                setCombos(prev => prev.filter(c => c.id !== id));
            } else {
                toast.error(res.error || "Failed to delete combo");
            }
        } catch (err) {
            toast.error(err.message);
        }
    };

    return (
        <div className="space-y-6 pb-6">
            {/* Header & Explanation */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl border border-border/50 bg-card/40 backdrop-blur-md">
                <div>
                    <h2 className="text-base font-bold flex items-center gap-2">
                        <Layers className="w-5 h-5 text-primary" /> Combos & Routing Strategies
                    </h2>
                    <p className="text-xs text-muted-foreground mt-0.5">
                        Define resilient failover cascades across providers. Quota depleted or provider down? OmniRoute automatically slides to the next candidate model.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button size="sm" onClick={() => setIsCreateOpen(true)} className="text-xs font-semibold gap-1.5 bg-primary text-primary-foreground">
                        <Plus className="w-3.5 h-3.5" /> Create Custom Combo
                    </Button>
                </div>
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
                                    <Badge className="text-[9px] bg-primary/10 text-primary border-primary/20">
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

            {/* Configured Custom Combos List */}
            <Card className="border-border/50 bg-card/40 backdrop-blur-md">
                <CardHeader className="p-5 pb-3">
                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                        <Layers className="w-4 h-4 text-primary" /> Active Custom Combos
                    </CardTitle>
                    <CardDescription className="text-xs">
                        Custom multi-model routing chains configured for this workspace.
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-5 pt-0 space-y-3">
                    {loading ? (
                        <div className="flex items-center justify-center p-8 text-xs text-muted-foreground gap-2">
                            <Loader2 className="w-4 h-4 animate-spin text-primary" /> Loading combos...
                        </div>
                    ) : combos.length === 0 ? (
                        <div className="text-center p-8 text-xs text-muted-foreground">
                            No custom combos created yet. Click "Create Custom Combo" above to build your first failover rule.
                        </div>
                    ) : (
                        combos.map((combo) => (
                            <div key={combo.id} className="p-3.5 rounded-lg border border-border/40 bg-secondary/20 hover:bg-secondary/30 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-3">
                                <div className="space-y-1.5 flex-1">
                                    <div className="flex items-center gap-2">
                                        <span className="font-mono text-xs font-bold text-foreground">{combo.name}</span>
                                        <Badge variant="outline" className="text-[9px] uppercase font-mono bg-primary/10 text-primary border-primary/20">
                                            {combo.strategy}
                                        </Badge>
                                    </div>
                                    <p className="text-[11px] text-muted-foreground">{combo.desc}</p>
                                    <div className="flex items-center gap-2 flex-wrap text-[11px] text-muted-foreground pt-1">
                                        <span className="font-bold text-[10px] uppercase tracking-wider text-foreground">Failover Sequence:</span>
                                        {combo.targets.map((t, idx) => (
                                            <React.Fragment key={idx}>
                                                <span className="font-mono text-primary font-semibold bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-md text-[10px]">{t}</span>
                                                {idx < combo.targets.length - 1 && <ArrowRight className="w-3 h-3 text-muted-foreground" />}
                                            </React.Fragment>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                    <Button size="sm" variant="ghost" onClick={() => handleDeleteCombo(combo.id)} className="h-8 text-xs text-destructive hover:bg-destructive/10">
                                        <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete
                                    </Button>
                                </div>
                            </div>
                        ))
                    )}
                </CardContent>
            </Card>

            {/* Create Custom Combo Modal */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent className="sm:max-w-[550px]">
                    <DialogHeader>
                        <DialogTitle className="text-sm font-bold flex items-center gap-2">
                            <Plus className="w-4 h-4 text-primary" /> Create Custom Routing Combo
                        </DialogTitle>
                        <DialogDescription className="text-xs">
                            Combine multiple models into an automated failover sequence under a single alias.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSaveCombo} className="space-y-4 py-2">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Combo Alias / Name</label>
                            <Input
                                placeholder="e.g. coding-chain or audit-fast"
                                value={comboName}
                                onChange={(e) => setComboName(e.target.value)}
                                className="text-xs bg-secondary/30"
                                required
                            />
                            <p className="text-[10px] text-muted-foreground">Will be accessible via <code>custom/{comboName || "your-name"}</code></p>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Routing Strategy</label>
                            <Select value={selectedStrategy} onValueChange={setSelectedStrategy}>
                                <SelectTrigger className="text-xs bg-secondary/30">
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

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Target Sequence (Priority Order)</label>
                            <div className="flex items-center gap-2">
                                <Input
                                    placeholder="e.g. claude-3-7-sonnet or groq/llama-3.3-70b"
                                    value={newTargetInput}
                                    onChange={(e) => setNewTargetInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTarget())}
                                    className="text-xs bg-secondary/30"
                                />
                                <Button type="button" size="sm" variant="outline" onClick={handleAddTarget} className="text-xs font-semibold shrink-0">
                                    <Plus className="w-3.5 h-3.5 mr-1" /> Add
                                </Button>
                            </div>

                            {/* Active Target Pills */}
                            <div className="flex flex-wrap gap-1.5 pt-2">
                                {targets.map((t, idx) => (
                                    <Badge key={idx} variant="secondary" className="gap-1 text-xs py-1 px-2.5 font-mono">
                                        <span className="text-[10px] text-muted-foreground">{idx + 1}.</span>
                                        <span>{t}</span>
                                        <button type="button" onClick={() => handleRemoveTarget(idx)} className="text-muted-foreground hover:text-destructive ml-1">
                                            &times;
                                        </button>
                                    </Badge>
                                ))}
                            </div>
                        </div>

                        <DialogFooter className="pt-3">
                            <Button type="button" variant="outline" size="sm" onClick={() => setIsCreateOpen(false)} className="text-xs">
                                Cancel
                            </Button>
                            <Button type="submit" size="sm" disabled={saving} className="text-xs font-bold bg-primary text-primary-foreground gap-1.5">
                                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                                Save Combo Rule
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
