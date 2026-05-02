"use client";

import { useEffect, useMemo, useState } from "react";
import { Wallet, TrendingUp, Loader2, RefreshCw, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAction } from "@/hooks/use-action";
import { testMetaApi } from "../_actions/test-meta-api";
import { getDecryptedCredentials } from "../_actions/get-decrypted-credentials";
import { useParams } from "next/navigation";
import { toast } from "sonner";

const RATE_USD = {
    marketing: 0.025,
    utility: 0.0125,
    service: 0,
    authentication: 0.015,
    unknown: 0,
};

function formatNumber(value) {
    return new Intl.NumberFormat().format(Number(value || 0));
}

function monthKey(date) {
    const d = new Date(date);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export function UsageBillingTab() {
    const params = useParams();
    const workspaceId = params?.workspaceId;

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [metaData, setMetaData] = useState(null);
    const [creds, setCreds] = useState(null);

    const { execute: executeGetCreds } = useAction(getDecryptedCredentials, {
        onSuccess: (res) => {
            const data = res.data || res;
            if (data?.accessToken && data?.wabaId) {
                setCreds(data);
                fetchMetaAnalytics(data);
            } else {
                setError("No WhatsApp Cloud API credentials found. Please configure them in the General tab.");
                setLoading(false);
            }
        },
        onError: (err) => {
            setError(err);
            setLoading(false);
        }
    });

    const { execute: executeMetaApi } = useAction(testMetaApi, {
        onSuccess: (res) => {
            setMetaData(res.apiData);
            setLoading(false);
        },
        onError: (err) => {
            setError(err);
            setLoading(false);
        }
    });

    const fetchMetaAnalytics = (activeCreds) => {
        setLoading(true);
        setError(null);

        // Fetch last 6 months of conversation analytics
        const end = Math.floor(Date.now() / 1000);
        const start = end - (180 * 24 * 60 * 60); // ~6 months

        const cats = encodeURIComponent('["MARKETING","UTILITY","AUTHENTICATION","SERVICE"]');
        const dims = encodeURIComponent('["CONVERSATION_CATEGORY"]');
        const url = `https://graph.facebook.com/v25.0/${activeCreds.wabaId}/conversation_analytics?start=${start}&end=${end}&granularity=MONTH&conversation_categories=${cats}&dimensions=${dims}`;

        executeMetaApi({
            workspaceId,
            url,
            headers: { 'Authorization': `Bearer ${activeCreds.accessToken}` }
        });
    };

    useEffect(() => {
        if (workspaceId) executeGetCreds({ workspaceId });
    }, [workspaceId]);

    const stats = useMemo(() => {
        if (!metaData?.data?.[0]?.data_points) return null;

        const dataPoints = metaData.data[0].data_points;
        const currentMonth = monthKey(new Date());

        const rollup = { marketing: 0, utility: 0, service: 0, authentication: 0, unknown: 0 };
        const series = [];

        // Process data points from Meta
        // Meta returns points like: { start: timestamp, end: timestamp, conversation_category: "MARKETING", value: 10 }
        const monthMap = new Map();

        for (const pt of dataPoints) {
            const mKey = monthKey(pt.start * 1000);
            if (!monthMap.has(mKey)) {
                monthMap.set(mKey, { month: mKey, marketing: 0, utility: 0, service: 0, authentication: 0, unknown: 0 });
            }

            const target = monthMap.get(mKey);
            const cat = String(pt.conversation_category || "unknown").toLowerCase();
            if (target[cat] !== undefined) {
                target[cat] += (pt.value || 0);
            } else {
                target.unknown += (pt.value || 0);
            }

            if (mKey === currentMonth) {
                if (rollup[cat] !== undefined) rollup[cat] += (pt.value || 0);
                else rollup.unknown += (pt.value || 0);
            }
        }

        const sortedSeries = Array.from(monthMap.values()).sort((a, b) => a.month.localeCompare(b.month));

        let monthEstimate = 0;
        for (const [cat, count] of Object.entries(rollup)) {
            monthEstimate += count * (RATE_USD[cat] || 0);
        }

        return { rollup, series: sortedSeries, monthEstimate };
    }, [metaData]);

    const cats = [
        { id: "marketing", label: "Marketing", color: "bg-primary" },
        { id: "utility", label: "Utility", color: "bg-emerald-500" },
        { id: "authentication", label: "Authentication", color: "bg-amber-500" },
        { id: "service", label: "Service (free)", color: "bg-sky-400" },
        { id: "unknown", label: "Unknown", color: "bg-muted" },
    ];

    const max = useMemo(() => {
        if (!stats?.series?.length) return 1;
        return Math.max(1, ...stats.series.map((s) => s.marketing + s.utility + s.service + s.authentication + s.unknown));
    }, [stats]);

    if (error) {
        return (
            <div className="p-8 flex flex-col items-center justify-center text-center space-y-4">
                <AlertCircle className="h-12 w-12 text-destructive opacity-50" />
                <div className="space-y-2">
                    <h3 className="font-bold text-lg">Direct Fetch Error</h3>
                    <p className="text-sm text-muted-foreground max-w-md">{error}</p>
                </div>
                <Button variant="outline" onClick={() => executeGetCreds({ workspaceId })}>Retry</Button>
            </div>
        );
    }

    return (
        <div className="space-y-4 pt-4 h-[75vh] overflow-y-auto pr-2 custom-scrollbar">
            <div className="flex flex-row gap-4">
                <Card className="rounded-md border-border/60 bg-card shadow-sm overflow-hidden w-full">
                    <CardHeader className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between pb-6 border-b border-border/40 bg-muted/5">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <Wallet className="h-5 w-5 text-primary" />
                                <CardTitle className="text-base font-bold uppercase tracking-widest">Meta Billing Insights</CardTitle>
                            </div>
                            <CardDescription className="text-[11px] font-medium text-muted-foreground">
                                Live conversation metrics directly from Meta Graph API for WABA <span className="font-mono text-primary">{creds?.wabaId}</span>
                            </CardDescription>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-8 text-[10px] font-bold uppercase tracking-widest gap-2"
                            onClick={() => fetchMetaAnalytics(creds)}
                            disabled={loading}
                        >
                            {loading ? <RefreshCw className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
                            Sync with Meta
                        </Button>
                    </CardHeader>
                    <CardContent className="pt-6">
                        {loading && !stats ? (
                            <div className="py-20 text-center flex flex-col items-center gap-4">
                                <Loader2 className="h-8 w-8 animate-spin text-primary/30" />
                                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60 animate-pulse">Querying Meta Analytics API...</p>
                            </div>
                        ) : stats ? (
                            <div className="space-y-6">
                                <div className="grid gap-4 sm:grid-cols-5">
                                    {cats.map((c) => (
                                        <div key={c.id} className="rounded-xl border border-border/60 bg-muted/20 p-4 shadow-sm group hover:border-primary/30 transition-all">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className={`h-2 w-2 rounded-full ${c.color} shadow-sm group-hover:scale-110 transition-transform`} />
                                                <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">{c.label}</p>
                                            </div>
                                            <p className="text-3xl font-bold tabular-nums tracking-tighter text-foreground">{formatNumber(stats.rollup[c.id] || 0)}</p>
                                            <p className="text-[10px] text-muted-foreground font-medium uppercase mt-1">This Month</p>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex items-center justify-between rounded-xl border border-primary/20 bg-primary/5 p-5 shadow-inner">
                                    <div>
                                        <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-1">Direct Estimated Cost · {monthKey(new Date())}</p>
                                        <p className="text-3xl font-bold tabular-nums tracking-tighter text-primary">
                                            ${stats.monthEstimate.toFixed(2)}
                                            <span className="text-sm font-normal text-muted-foreground ml-2 uppercase tracking-wide italic">USD (Indicative)</span>
                                        </p>
                                    </div>
                                    <TrendingUp className="h-10 w-10 text-primary opacity-20" />
                                </div>
                            </div>
                        ) : (
                            <div className="py-20 text-center text-muted-foreground text-xs uppercase font-bold tracking-widest">No metrics returned from Meta API</div>
                        )}
                    </CardContent>
                </Card>

                <Card className="rounded-md border-border/60 bg-card shadow-sm overflow-hidden w-full">
                    <CardHeader className="py-4 border-b border-border/40 bg-muted/5 flex flex-row items-center justify-between">
                        <CardTitle className="text-[11px] font-bold uppercase tracking-widest flex items-center gap-2">
                            <TrendingUp className="h-3.5 w-3.5 text-primary" />
                            6-Month Conversation Trend
                        </CardTitle>
                        <Badge variant="outline" className="text-[9px] font-bold tracking-tighter opacity-60">Source: Meta Analytics</Badge>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="space-y-4">
                            {stats?.series?.length ? stats.series.slice(-6).map((row) => {
                                const total = cats.reduce((acc, c) => acc + (row[c.id] || 0), 0);
                                return (
                                    <div key={row.month} className="flex items-center gap-4">
                                        <span className="w-20 shrink-0 text-[10px] text-muted-foreground font-mono font-bold uppercase tracking-tighter">{row.month}</span>
                                        <div className="flex h-5 flex-1 overflow-hidden rounded-md bg-muted/30 border border-border/40 shadow-inner">
                                            {cats.map((c) => {
                                                const v = row[c.id] || 0;
                                                if (!v) return null;
                                                const pct = (v / max) * 100;
                                                return (
                                                    <div
                                                        key={c.id}
                                                        className={`${c.color} opacity-90 hover:opacity-100 transition-opacity border-r border-background/20 last:border-0`}
                                                        style={{ width: `${pct}%` }}
                                                        title={`${c.label}: ${v}`}
                                                    />
                                                );
                                            })}
                                        </div>
                                        <span className="w-16 text-right text-[11px] tabular-nums font-bold text-foreground">{formatNumber(total)}</span>
                                    </div>
                                );
                            }) : (
                                <p className="text-center py-10 text-xs text-muted-foreground font-bold uppercase tracking-widest opacity-40">No trend data available</p>
                            )}
                        </div>
                        <div className="mt-6 flex flex-wrap gap-5 text-[9px] text-muted-foreground font-bold uppercase tracking-widest pt-4 border-t border-border/40">
                            {cats.map((c) => (
                                <span key={c.id} className="inline-flex items-center gap-2 group cursor-help">
                                    <span className={`h-2.5 w-2.5 rounded-full ${c.color} shadow-sm group-hover:scale-110 transition-transform`} />
                                    {c.label}
                                </span>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="p-4 rounded-lg bg-amber-500/5 border border-amber-500/20 flex items-start gap-3">
                <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                <p className="text-[10px] text-amber-500/80 font-medium leading-relaxed">
                    <strong>Note on Direct Data:</strong> Meta Analytics API provides aggregate conversation volume. Individual conversation logs and specific billable events are tracked via real-time webhooks and are visible in the Inbox and Stream modules.
                </p>
            </div>
        </div>
    );
}
