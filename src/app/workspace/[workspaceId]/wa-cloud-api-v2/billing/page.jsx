"use client";

import { useEffect, useMemo, useState } from "react";
import { Wallet, TrendingUp, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/lib/supabase";
import { formatDate, formatNumber } from "../_lib/validators";
import { useV2Data } from "../layout";

// Indicative pricing in USD. Real Meta rates vary by country and change often —
// users can edit these in Settings later. For now we surface unit counts and
// show an estimate using a single-region default to make the meter actionable.
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

function lastNMonths(n) {
  const out = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i -= 1) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    out.push(monthKey(d));
  }
  return out;
}

export default function BillingPage() {
  const data = useV2Data();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [accountFilter, setAccountFilter] = useState("all");
  const accounts = data.phoneNumbers?.data || [];

  const load = async () => {
    setLoading(true);
    try {
      const since = new Date();
      since.setMonth(since.getMonth() - 5);
      since.setDate(1);
      const { data: rows, error } = await supabase
        .from("wa_billing_events")
        .select("*")
        .gte("occurred_at", since.toISOString())
        .order("occurred_at", { ascending: false })
        .limit(5000);
      if (error) throw error;
      setEvents(rows || []);
    } catch (err) {
      console.error("Failed to load billing events:", err);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    if (accountFilter === "all") return events;
    return events.filter((e) => e.phone_number_id === accountFilter);
  }, [events, accountFilter]);

  // This month roll-up by category
  const thisMonth = monthKey(new Date());
  const monthRollup = useMemo(() => {
    const out = { marketing: 0, utility: 0, service: 0, authentication: 0, unknown: 0 };
    for (const ev of filtered) {
      if (monthKey(ev.occurred_at) !== thisMonth) continue;
      if (!ev.billable) continue;
      const cat = String(ev.category || "unknown").toLowerCase();
      if (out[cat] != null) out[cat] += 1;
      else out.unknown += 1;
    }
    return out;
  }, [filtered, thisMonth]);

  const monthEstimate = useMemo(() => {
    let total = 0;
    for (const [cat, count] of Object.entries(monthRollup)) total += count * (RATE_USD[cat] || 0);
    return total;
  }, [monthRollup]);

  // 6-month series
  const months = lastNMonths(6);
  const series = useMemo(() => {
    const out = months.map((m) => ({ month: m, marketing: 0, utility: 0, service: 0, authentication: 0, unknown: 0 }));
    const idx = new Map(out.map((row, i) => [row.month, i]));
    for (const ev of filtered) {
      if (!ev.billable) continue;
      const k = monthKey(ev.occurred_at);
      const i = idx.get(k);
      if (i == null) continue;
      const cat = String(ev.category || "unknown").toLowerCase();
      if (out[i][cat] != null) out[i][cat] += 1;
      else out[i].unknown += 1;
    }
    return out;
  }, [filtered, months]);

  const max = Math.max(1, ...series.map((s) => s.marketing + s.utility + s.service + s.authentication + s.unknown));

  const cats = [
    { id: "marketing", label: "Marketing", color: "bg-primary" },
    { id: "utility", label: "Utility", color: "bg-emerald-500" },
    { id: "authentication", label: "Authentication", color: "bg-amber-500" },
    { id: "service", label: "Service (free)", color: "bg-sky-400" },
    { id: "unknown", label: "Unknown", color: "bg-muted" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-bold tracking-tight">Usage & Billing</h2>
        <p className="text-sm text-muted-foreground">Monitor conversation volume and Meta billable events.</p>
      </div>

      <Card className="rounded-md border-border/60 bg-card shadow-sm">
        <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between border-b border-border/60 py-4">
          <div>
            <CardTitle className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest"><Wallet className="h-4 w-4 text-primary" /> Billing meter</CardTitle>
            <CardDescription className="text-xs">
              Counts conversations Meta has billed you for this month. Estimates use indicative USD rates.
            </CardDescription>
          </div>
          <Select value={accountFilter} onValueChange={setAccountFilter}>
            <SelectTrigger className="w-[220px] h-9 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All accounts</SelectItem>
              {accounts.map((a) => <SelectItem key={a.id} value={a.id}>{a.display_name}</SelectItem>)}
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent className="pt-6">
          {loading ? (
            <div className="py-20 text-center"><Loader2 className="mx-auto h-6 w-6 animate-spin text-primary/40" /></div>
          ) : (
            <div className="space-y-6">
              <div className="grid gap-3 sm:grid-cols-5">
                {cats.map((c) => (
                  <div key={c.id} className="rounded-md border border-border/60 bg-muted/10 p-3">
                    <div className="flex items-center gap-2">
                      <span className={`h-2 w-2 rounded-full ${c.color}`} />
                      <p className="text-[10px] font-bold uppercase tracking-tight text-muted-foreground">{c.label}</p>
                    </div>
                    <p className="mt-1 text-2xl font-bold tracking-tight">{formatNumber(monthRollup[c.id] || 0)}</p>
                    <p className="text-[10px] text-muted-foreground font-medium">{thisMonth}</p>
                  </div>
                ))}
              </div>
              
              <div className="flex items-center justify-between rounded-md border border-primary/20 bg-primary/5 p-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Estimated cost · {thisMonth}</p>
                  <p className="text-2xl font-bold tracking-tight text-primary">${monthEstimate.toFixed(2)} <span className="text-xs font-normal text-muted-foreground">USD (indicative)</span></p>
                </div>
                <TrendingUp className="h-8 w-8 text-primary opacity-20" />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="rounded-md border-border/60 bg-card shadow-sm h-fit">
          <CardHeader className="border-b border-border/60 py-4">
            <CardTitle className="text-sm font-bold uppercase tracking-widest">6-month trend</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-3">
              {series.map((row) => {
                const total = cats.reduce((acc, c) => acc + (row[c.id] || 0), 0);
                return (
                  <div key={row.month} className="flex items-center gap-3">
                    <span className="w-16 shrink-0 text-[10px] font-bold uppercase tracking-tight text-muted-foreground">{row.month}</span>
                    <div className="flex h-5 flex-1 overflow-hidden rounded-md bg-muted/40">
                      {cats.map((c) => {
                        const v = row[c.id] || 0;
                        if (!v) return null;
                        const pct = (v / max) * 100;
                        return <div key={c.id} className={c.color} style={{ width: `${pct}%` }} title={`${c.label}: ${v}`} />;
                      })}
                    </div>
                    <span className="w-12 text-right text-[10px] font-bold tabular-nums">{formatNumber(total)}</span>
                  </div>
                );
              })}
            </div>
            <div className="mt-6 flex flex-wrap gap-4 border-t border-border/60 pt-4">
              {cats.map((c) => (
                <span key={c.id} className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-tight text-muted-foreground">
                  <span className={`h-2 w-2 rounded-full ${c.color}`} />
                  {c.label}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-md border-border/60 bg-card shadow-sm">
          <CardHeader className="border-b border-border/60 py-4">
            <CardTitle className="text-sm font-bold uppercase tracking-widest">Recent events</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[280px]">
              {!filtered.length ? (
                <div className="flex h-[280px] flex-col items-center justify-center p-8 text-center text-xs text-muted-foreground font-medium italic">
                  No billable events yet — they'll appear once Meta reports conversation pricing in callbacks.
                </div>
              ) : (
                <table className="w-full text-[10px]">
                  <thead className="sticky top-0 bg-muted/90 backdrop-blur z-10 text-left font-bold uppercase tracking-tight border-b border-border/60">
                    <tr>
                      <th className="px-4 py-3">When</th>
                      <th className="px-4 py-3">Category</th>
                      <th className="px-4 py-3">Recipient</th>
                      <th className="px-4 py-3 text-right">Reference</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {filtered.slice(0, 100).map((ev) => (
                      <tr key={ev.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3 text-muted-foreground">{formatDate(ev.occurred_at)}</td>
                        <td className="px-4 py-3">
                          <Badge variant="outline" className="text-[9px] font-bold uppercase tracking-tight h-5">
                            {ev.category}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 font-mono">{ev.recipient_phone || "—"}</td>
                        <td className="px-4 py-3 text-right font-mono text-muted-foreground text-[9px] truncate max-w-[120px]">
                          {ev.conversation_provider_id}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
