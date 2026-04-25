"use client";

import { useEffect, useMemo, useState } from "react";
import { Wallet, TrendingUp, Loader2, RefreshCw, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDate, formatNumber } from "../../_lib/validators";
import { useV2Data } from "../../layout";
import { supabase } from "@/lib/supabase";

const RATE_USD = {
  marketing: 0.025,
  utility: 0.0125,
  service: 0,
  authentication: 0.015,
  unknown: 0,
};

function monthKey(date) {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export function UsageBillingTab() {
  const data = useV2Data();
  const activeAccount = data.activeAccount;
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [metaData, setMetaData] = useState(null);

  const fetchMetaAnalytics = async (account) => {
    if (!account?.access_token || !account?.waba_id) {
      setError("Active account missing Access Token or WABA ID.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const end = Math.floor(Date.now() / 1000);
      const start = end - (180 * 24 * 60 * 60); // 6 months
      
      const cats = encodeURIComponent('["MARKETING","UTILITY","AUTHENTICATION","SERVICE"]');
      const dims = encodeURIComponent('["CONVERSATION_CATEGORY"]');
      const url = `https://graph.facebook.com/v25.0/${account.waba_id}/conversation_analytics?start=${start}&end=${end}&granularity=MONTH&conversation_categories=${cats}&dimensions=${dims}`;

      const res = await fetch(url, {
        headers: { 'Authorization': `Bearer ${account.access_token}` }
      });
      const result = await res.json();
      
      if (result.error) throw new Error(result.error.message);
      setMetaData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeAccount) fetchMetaAnalytics(activeAccount);
  }, [activeAccount?.id]);

  const stats = useMemo(() => {
    if (!metaData?.data?.[0]?.data_points) return null;
    
    const dataPoints = metaData.data[0].data_points;
    const currentMonth = monthKey(new Date());
    
    const rollup = { marketing: 0, utility: 0, service: 0, authentication: 0, unknown: 0 };
    const series = [];
    const monthMap = new Map();

    for (const pt of dataPoints) {
      const mKey = monthKey(pt.start * 1000);
      if (!monthMap.has(mKey)) {
        monthMap.set(mKey, { month: mKey, marketing: 0, utility: 0, service: 0, authentication: 0, unknown: 0 });
      }
      
      const target = monthMap.get(mKey);
      const cat = String(pt.conversation_category || "unknown").toLowerCase();
      if (target[cat] !== undefined) target[cat] += (pt.value || 0);
      else target.unknown += (pt.value || 0);

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
      <div className="p-12 flex flex-col items-center justify-center text-center space-y-4">
        <AlertCircle className="h-10 w-10 text-destructive/50" />
        <div className="space-y-1">
          <h3 className="font-bold text-sm uppercase tracking-widest">Meta API Error</h3>
          <p className="text-xs text-muted-foreground max-w-sm">{error}</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => fetchMetaAnalytics(activeAccount)} className="h-8 text-[10px] font-bold uppercase tracking-widest">Retry Connection</Button>
      </div>
    );
  }

  return (
    <div className="space-y-4 pt-4 h-[75vh] overflow-y-auto pr-2 custom-scrollbar">
      <Card className="rounded-md border-border/60 bg-card shadow-sm overflow-hidden">
        <CardHeader className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between pb-6 border-b border-border/40 bg-muted/5">
          <div>
            <div className="flex items-center gap-2 mb-1">
               <Wallet className="h-5 w-5 text-primary" />
               <CardTitle className="text-base font-bold uppercase tracking-widest">Meta Direct Insights</CardTitle>
            </div>
            <CardDescription className="text-[11px] font-medium text-muted-foreground">
              Conversation volume for <span className="font-mono text-primary font-bold">{activeAccount?.display_name || "Active Account"}</span>
            </CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            className="h-8 text-[10px] font-bold uppercase tracking-widest gap-2"
            onClick={() => fetchMetaAnalytics(activeAccount)}
            disabled={loading}
          >
            {loading ? <RefreshCw className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
            Refresh from Meta
          </Button>
        </CardHeader>
        <CardContent className="pt-6">
          {loading && !stats ? (
            <div className="py-20 text-center flex flex-col items-center gap-4">
               <Loader2 className="h-8 w-8 animate-spin text-primary/30" />
               <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 animate-pulse">Syncing with Meta Cloud...</p>
            </div>
          ) : stats ? (
            <div className="space-y-6">
              <div className="grid gap-3 sm:grid-cols-5">
                {cats.map((c) => (
                  <div key={c.id} className="rounded-xl border border-border/60 bg-muted/20 p-4 group hover:border-primary/30 transition-all shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`h-2 w-2 rounded-full ${c.color} group-hover:scale-110 transition-transform`} />
                      <p className="text-[9px] uppercase tracking-widest text-muted-foreground font-extrabold">{c.label}</p>
                    </div>
                    <p className="text-2xl font-bold tabular-nums tracking-tighter">{formatNumber(stats.rollup[c.id] || 0)}</p>
                    <p className="text-[9px] text-muted-foreground font-bold uppercase mt-0.5">This Month</p>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between rounded-xl border border-primary/20 bg-primary/5 p-5">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-extrabold mb-1">Estimated Cost · {monthKey(new Date())}</p>
                  <p className="text-3xl font-bold tabular-nums tracking-tighter text-primary">
                    ${stats.monthEstimate.toFixed(2)} 
                    <span className="text-xs font-normal text-muted-foreground ml-2 uppercase tracking-widest italic opacity-60">USD (Indicative)</span>
                  </p>
                </div>
                <TrendingUp className="h-10 w-10 text-primary opacity-10" />
              </div>
            </div>
          ) : (
            <div className="py-20 text-center text-muted-foreground text-[10px] uppercase font-bold tracking-widest opacity-40">No response from Meta</div>
          )}
        </CardContent>
      </Card>

      <Card className="rounded-md border-border/60 bg-card shadow-sm overflow-hidden">
        <CardHeader className="py-4 border-b border-border/40 bg-muted/5 flex flex-row items-center justify-between">
           <CardTitle className="text-[10px] font-extrabold uppercase tracking-widest flex items-center gap-2">
             <TrendingUp className="h-3.5 w-3.5 text-primary" />
             Usage Trend (Last 6 Months)
           </CardTitle>
           <Badge variant="outline" className="text-[8px] font-extrabold tracking-widest bg-background/50">DIRECT DATA</Badge>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {stats?.series?.length ? stats.series.map((row) => {
              const total = cats.reduce((acc, c) => acc + (row[c.id] || 0), 0);
              return (
                <div key={row.month} className="flex items-center gap-4">
                  <span className="w-20 shrink-0 text-[10px] text-muted-foreground font-mono font-bold uppercase tracking-tighter">{row.month}</span>
                  <div className="flex h-4 flex-1 overflow-hidden rounded-md bg-muted/40 border border-border/20 shadow-inner">
                    {cats.map((c) => {
                      const v = row[c.id] || 0;
                      if (!v) return null;
                      const pct = (v / max) * 100;
                      return <div key={c.id} className={`${c.color} opacity-80 hover:opacity-100 transition-opacity`} style={{ width: `${pct}%` }} title={`${c.label}: ${v}`} />;
                    })}
                  </div>
                  <span className="w-16 text-right text-[11px] tabular-nums font-bold text-foreground">{formatNumber(total)}</span>
                </div>
              );
            }) : (
              <p className="text-center py-10 text-xs text-muted-foreground font-bold uppercase tracking-widest opacity-30">No trend data found</p>
            )}
          </div>
          <div className="mt-6 flex flex-wrap gap-5 text-[9px] text-muted-foreground font-extrabold uppercase tracking-widest pt-4 border-t border-border/40">
            {cats.map((c) => (
              <span key={c.id} className="inline-flex items-center gap-2">
                <span className={`h-2.5 w-2.5 rounded-full ${c.color} shadow-sm`} />
                {c.label}
              </span>
            ))}
          </div>
        </CardContent>
      </Card>
      
      <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/20 flex items-start gap-3">
         <AlertCircle className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
         <p className="text-[10px] text-blue-500/80 font-bold leading-relaxed uppercase tracking-tight">
           Direct data reflects Meta's internal reporting. For individual billable event logs, please consult the real-time Stream module.
         </p>
      </div>
    </div>
  );
}
