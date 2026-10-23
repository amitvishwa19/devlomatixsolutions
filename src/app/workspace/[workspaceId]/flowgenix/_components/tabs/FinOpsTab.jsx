'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
    Wallet,
    ShieldCheck,
    AlertTriangle,
    CheckCircle2,
    RefreshCw,
    TrendingDown,
    TrendingUp,
    Zap,
    Cpu,
    Layers,
    Key,
    RotateCcw,
    DollarSign,
    Sparkles,
    Sliders,
    ArrowUpRight
} from 'lucide-react';
import { toast } from 'sonner';
import {
    getFinOpsOverviewAction,
    updateSpendGuardConfigAction,
    resetBillingCycleAction
} from '../../_action/finops-actions';

export function FinOpsTab({ workspaceId }) {
    const [finops, setFinops] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [resetting, setResetting] = useState(false);

    // Form inputs
    const [monthlyBudget, setMonthlyBudget] = useState('10.00');
    const [actionOnExceeded, setActionOnExceeded] = useState('auto_downgrade');
    const [alertThreshold, setAlertThreshold] = useState('80');

    const fetchFinOps = useCallback(async (isManual = false) => {
        if (!workspaceId) return;
        if (isManual) setRefreshing(true);
        try {
            const res = await getFinOpsOverviewAction(workspaceId);
            if (res.success && res.data) {
                setFinops(res.data);
                if (res.data.config) {
                    setMonthlyBudget(String(res.data.config.monthlyBudgetUsd || 10));
                    setActionOnExceeded(res.data.config.actionOnBudgetExceeded || 'auto_downgrade');
                    setAlertThreshold(String(res.data.config.alertThresholdPercent || 80));
                }
            }
        } catch (err) {
            console.error("FinOps fetch error:", err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [workspaceId]);

    useEffect(() => {
        fetchFinOps();
        const interval = setInterval(() => fetchFinOps(), 10000);
        return () => clearInterval(interval);
    }, [fetchFinOps]);

    const handleSaveConfig = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await updateSpendGuardConfigAction({
                workspaceId,
                monthlyBudgetUsd: monthlyBudget,
                actionOnBudgetExceeded: actionOnExceeded,
                alertThresholdPercent: alertThreshold
            });

            if (res.success) {
                toast.success("Spend Guard budget policy updated successfully");
                fetchFinOps();
            } else {
                toast.error(res.error || "Failed to update budget policy");
            }
        } catch (err) {
            toast.error(err.message || "Network error");
        } finally {
            setSaving(false);
        }
    };

    const handleResetBilling = async () => {
        if (!confirm("Reset current billing cycle spend to $0.00? This is typically used when starting a new billing cycle or testing.")) return;
        setResetting(true);
        try {
            const res = await resetBillingCycleAction(workspaceId);
            if (res.success) {
                toast.success("Monthly spend counter reset to $0.00");
                fetchFinOps();
            }
        } finally {
            setResetting(false);
        }
    };

    if (loading && !finops) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-muted-foreground gap-3">
                <RefreshCw className="w-6 h-6 animate-spin text-primary" />
                <p className="text-xs font-mono">Loading FinOps metrics & Spend Guard state...</p>
            </div>
        );
    }

    const currentSpend = finops?.currentMonthSpendUsd || 0;
    const budget = finops?.monthlyBudgetUsd || 10;
    const percentUsed = finops?.percentUsed || 0;
    const totalSaved = finops?.totalCostSavedUsd || 0;
    const projected = finops?.projectedMonthSpendUsd || 0;
    const isExceeded = finops?.isExceeded;
    const isAlert = finops?.isAlert;

    // Meter color
    const progressColor = isExceeded ? "bg-rose-500" : (isAlert ? "bg-amber-500" : "bg-emerald-500");
    const statusBorderColor = isExceeded ? "border-rose-500/40" : (isAlert ? "border-amber-500/40" : "border-emerald-500/40");
    const statusBgColor = isExceeded ? "bg-rose-500/10 text-rose-400" : (isAlert ? "bg-amber-500/10 text-amber-400" : "bg-emerald-500/10 text-emerald-400");

    return (
        <div className="space-y-4 mx-auto pb-8">
            {/* Header Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-card/60 backdrop-blur-md p-3 rounded-xl border border-border/50">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <Wallet className="w-5 h-5" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h2 className="text-sm font-bold tracking-tight">FinOps & Spend Guard</h2>
                            <Badge variant="outline" className="text-[10px] font-mono border-primary/30 text-primary bg-primary/10">
                                Cycle: {finops?.billingMonth || "Current"}
                            </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Enterprise token economics, live budget limits, and zero-downtime auto-downgrade guards.
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => fetchFinOps(true)}
                        disabled={refreshing}
                        className="h-8 text-xs gap-1.5"
                    >
                        <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-primary' : ''}`} />
                        Refresh
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleResetBilling}
                        disabled={resetting}
                        className="h-8 text-xs text-muted-foreground hover:text-foreground gap-1.5"
                        title="Reset cycle spend for testing"
                    >
                        <RotateCcw className="w-3.5 h-3.5" />
                        Reset Cycle
                    </Button>
                </div>
            </div>

            {/* Top Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                {/* 1. Monthly Budget Meter */}
                <Card className={`border ${statusBorderColor} bg-card/50 shadow-xs relative overflow-hidden`}>
                    <CardHeader className="p-3 pb-1 flex flex-row items-center justify-between">
                        <CardTitle className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                            <DollarSign className="w-3.5 h-3.5 text-primary" /> Monthly Budget
                        </CardTitle>
                        <Badge className={`text-[10px] font-mono border ${statusBgColor}`}>
                            {isExceeded ? "EXCEEDED" : (isAlert ? "WARNING" : "HEALTHY")}
                        </Badge>
                    </CardHeader>
                    <CardContent className="p-3 pt-1 space-y-2">
                        <div className="flex items-baseline justify-between">
                            <span className="text-xl font-extrabold tracking-tight font-mono">
                                ${currentSpend.toFixed(4)}
                            </span>
                            <span className="text-xs text-muted-foreground font-mono">
                                / ${budget.toFixed(2)} USD
                            </span>
                        </div>
                        <div className="space-y-1">
                            <div className="w-full bg-muted/40 h-2 rounded-full overflow-hidden">
                                <div
                                    className={`h-full transition-all duration-500 ${progressColor}`}
                                    style={{ width: `${Math.min(100, percentUsed)}%` }}
                                />
                            </div>
                            <div className="flex justify-between text-[10px] font-mono text-muted-foreground">
                                <span>{percentUsed}% Used</span>
                                <span>${Math.max(0, budget - currentSpend).toFixed(2)} Remaining</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* 2. Total Cost Saved */}
                <Card className="border-border/50 bg-card/50 shadow-xs">
                    <CardHeader className="p-3 pb-1 flex flex-row items-center justify-between">
                        <CardTitle className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                            <TrendingDown className="w-3.5 h-3.5 text-emerald-400" /> Cost Saved
                        </CardTitle>
                        <Badge variant="outline" className="text-[10px] font-mono text-emerald-400 border-emerald-500/30 bg-emerald-500/10">
                            Cache & RTK
                        </Badge>
                    </CardHeader>
                    <CardContent className="p-3 pt-1">
                        <div className="text-xl font-extrabold tracking-tight font-mono text-emerald-400">
                            ${totalSaved.toFixed(4)}
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-1">
                            Saved via deterministic Gateway Caching and token compression.
                        </p>
                    </CardContent>
                </Card>

                {/* 3. Projected Run-Rate */}
                <Card className="border-border/50 bg-card/50 shadow-xs">
                    <CardHeader className="p-3 pb-1 flex flex-row items-center justify-between">
                        <CardTitle className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                            <TrendingUp className="w-3.5 h-3.5 text-sky-400" /> Projected Spend
                        </CardTitle>
                        <span className="text-[10px] font-mono text-muted-foreground">Month End</span>
                    </CardHeader>
                    <CardContent className="p-3 pt-1">
                        <div className="text-xl font-extrabold tracking-tight font-mono">
                            ${projected.toFixed(2)}
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-1">
                            Estimated month-end bill based on daily run-rate.
                        </p>
                    </CardContent>
                </Card>

                {/* 4. Total Tokens Processed */}
                <Card className="border-border/50 bg-card/50 shadow-xs">
                    <CardHeader className="p-3 pb-1 flex flex-row items-center justify-between">
                        <CardTitle className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                            <Cpu className="w-3.5 h-3.5 text-indigo-400" /> Total Volume
                        </CardTitle>
                        <Badge variant="secondary" className="text-[10px] font-mono">Tokens</Badge>
                    </CardHeader>
                    <CardContent className="p-3 pt-1">
                        <div className="text-xl font-extrabold tracking-tight font-mono">
                            {(finops?.totalTokensProcessed || 0).toLocaleString()}
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-1">
                            Total input + completion tokens routed this month.
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Middle Section: Spend Guard Policy Configuration */}
            <Card className="border-border/50 bg-card/40 backdrop-blur-md shadow-xs">
                <CardHeader className="p-4 pb-2">
                    <div className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-primary" />
                        <CardTitle className="text-xs font-bold">Spend Guard Policy & Auto-Downgrade Rules</CardTitle>
                    </div>
                    <CardDescription className="text-xs">
                        Configure spending thresholds and automatic failover actions when budgets are exhausted.
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-4 pt-2">
                    <form onSubmit={handleSaveConfig} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-muted-foreground">Monthly Budget Cap (USD)</label>
                            <div className="relative">
                                <DollarSign className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-muted-foreground" />
                                <Input
                                    type="number"
                                    step="0.50"
                                    min="0"
                                    value={monthlyBudget}
                                    onChange={(e) => setMonthlyBudget(e.target.value)}
                                    className="pl-8 h-9 text-xs font-mono"
                                    placeholder="10.00"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-muted-foreground">Action When Budget is Exceeded</label>
                            <select
                                value={actionOnExceeded}
                                onChange={(e) => setActionOnExceeded(e.target.value)}
                                className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs focus:ring-1 focus:ring-primary focus:outline-none"
                            >
                                <option value="auto_downgrade">Auto-Downgrade to Free Tier (Zero Downtime)</option>
                                <option value="block_requests">Block Requests (Strict Stop, HTTP 402)</option>
                            </select>
                        </div>

                        <div className="flex items-center gap-2">
                            <div className="space-y-1.5 flex-1">
                                <label className="text-xs font-semibold text-muted-foreground">Warning Threshold (%)</label>
                                <Input
                                    type="number"
                                    min="10"
                                    max="100"
                                    value={alertThreshold}
                                    onChange={(e) => setAlertThreshold(e.target.value)}
                                    className="h-9 text-xs font-mono"
                                    placeholder="80"
                                />
                            </div>
                            <Button
                                type="submit"
                                disabled={saving}
                                className="h-9 text-xs font-semibold px-4 shrink-0 bg-primary shadow-xs"
                            >
                                {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin mr-1" /> : <Sliders className="w-3.5 h-3.5 mr-1.5" />}
                                Update Guard
                            </Button>
                        </div>
                    </form>

                    {actionOnExceeded === 'auto_downgrade' && (
                        <div className="mt-3 p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-start gap-2 text-emerald-400 text-xs">
                            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                            <span>
                                <strong>Zero-Downtime Guarantee Active:</strong> When your spend limit is reached, FlowGenix will automatically reroute all requests through 100% free providers (<strong>FreeModel.dev</strong>, <strong>Groq Cloud</strong>, <strong>Google AI Studio</strong>, and <strong>Local Ollama</strong>), ensuring your applications never experience an outage.
                            </span>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Bottom Grid: Model Spend Breakdown & API Keys Consumption */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Model Breakdown */}
                <Card className="border-border/50 bg-card/40 backdrop-blur-md shadow-xs flex flex-col">
                    <CardHeader className="p-3 pb-2 flex flex-row items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Layers className="w-4 h-4 text-primary" />
                            <CardTitle className="text-xs font-bold">Model Spend Breakdown</CardTitle>
                        </div>
                        <Badge variant="outline" className="text-[10px] font-mono">
                            {finops?.modelsList?.length || 0} Models
                        </Badge>
                    </CardHeader>
                    <CardContent className="p-3 pt-0 flex-1 overflow-auto">
                        {!finops?.modelsList || finops.modelsList.length === 0 ? (
                            <div className="p-8 text-center text-xs text-muted-foreground font-mono">
                                No billable model requests recorded in this cycle.
                            </div>
                        ) : (
                            <div className="divide-y divide-border/40">
                                {finops.modelsList.map((item, idx) => {
                                    const spendShare = currentSpend > 0 ? ((item.spendUsd / currentSpend) * 100).toFixed(1) : 0;
                                    return (
                                        <div key={idx} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                                            <div className="space-y-0.5 min-w-0">
                                                <div className="flex items-center gap-1.5">
                                                    <span className="font-semibold truncate">{item.model}</span>
                                                    <Badge variant="secondary" className="text-[9px] uppercase px-1 py-0">
                                                        {item.provider}
                                                    </Badge>
                                                    {item.tier === 'free' && (
                                                        <Badge className="text-[9px] bg-emerald-500/20 text-emerald-400 border-emerald-500/30 px-1 py-0">
                                                            FREE
                                                        </Badge>
                                                    )}
                                                </div>
                                                <p className="text-[11px] text-muted-foreground font-mono">
                                                    {item.requests.toLocaleString()} reqs • {item.tokens.toLocaleString()} tokens
                                                </p>
                                            </div>

                                            <div className="text-right shrink-0 space-y-0.5">
                                                <div className="font-mono font-bold text-xs">
                                                    ${item.spendUsd.toFixed(4)}
                                                </div>
                                                <div className="text-[10px] text-muted-foreground font-mono">
                                                    {spendShare}% of spend
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* API Key Consumption */}
                <Card className="border-border/50 bg-card/40 backdrop-blur-md shadow-xs flex flex-col">
                    <CardHeader className="p-3 pb-2 flex flex-row items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Key className="w-4 h-4 text-primary" />
                            <CardTitle className="text-xs font-bold">API Key Spend Allocation</CardTitle>
                        </div>
                        <Badge variant="outline" className="text-[10px] font-mono">
                            {finops?.keysList?.length || 0} Keys Tracked
                        </Badge>
                    </CardHeader>
                    <CardContent className="p-3 pt-0 flex-1 overflow-auto">
                        {!finops?.keysList || finops.keysList.length === 0 ? (
                            <div className="p-8 text-center text-xs text-muted-foreground font-mono">
                                No external API key usage tracked yet.
                            </div>
                        ) : (
                            <div className="divide-y divide-border/40">
                                {finops.keysList.map((k, idx) => (
                                    <div key={idx} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                                        <div className="space-y-0.5 min-w-0">
                                            <div className="flex items-center gap-1.5">
                                                <span className="font-semibold truncate">{k.label}</span>
                                                <span className="text-[10px] font-mono text-muted-foreground">({k.id.slice(0, 8)}...)</span>
                                            </div>
                                            <p className="text-[11px] text-muted-foreground font-mono">
                                                {k.requests.toLocaleString()} requests • {k.tokens.toLocaleString()} tokens
                                            </p>
                                        </div>

                                        <div className="text-right shrink-0 space-y-0.5">
                                            <div className="font-mono font-bold text-xs">
                                                ${k.spendUsd.toFixed(4)}
                                            </div>
                                            <div className="text-[10px] text-muted-foreground font-mono">
                                                Cap: {k.spendCap ? `$${k.spendCap.toFixed(2)}` : 'Unlimited'}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
