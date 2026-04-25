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
  const accounts = data.phoneNumbers.data || [];

  const load = async () => {
    setLoading(true);
    const since = new Date();
    since.setMonth(since.getMonth() - 5);
    since.setDate(1);
    const { data: rows } = await supabase
      .from("wa_billing_events")
      .select("*")
      .gte("occurred_at", since.toISOString())
      .order("occurred_at", { ascending: false })
      .limit(5000);
    setEvents(rows || []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    if (accountFilter === "all") return events;
    return events.filter((e) => e.phone_number_id === accountFilter);
  }, [events, accountFilter]);

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
    <div className="space-y-4">
      <Card className="rounded-md border-border/60 bg-card shadow-sm">
        <CardHeader className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2"><Wallet className="h-5 w-5" /> Usage & billing meter</CardTitle>
            <CardDescription>
              Counts the conversations Meta has billed you for this month.
            </CardDescription>
          </div>
          <Select value={accountFilter} onValueChange={setAccountFilter}>
            <SelectTrigger className="w-[220px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All accounts</SelectItem>
              {accounts.map((a) => <SelectItem key={a.id} value={a.id}>{a.display_name}</SelectItem>)}
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-10 text-center"><Loader2 className="mx-auto h-5 w-5 animate-spin text-muted-foreground" /></div>
          ) : (
            <>
              <div className="grid gap-3 sm:grid-cols-5">
                {cats.map((c) => (
                  <div key={c.id} className="rounded-md border border-border/60 bg-muted/20 p-3">
                    <div className="flex items-center gap-2"><span className={`h-2 w-2 rounded-full ${c.color}`} /><p className="text-[10px] uppercase tracking-wide text-muted-foreground font-bold">{c.label}</p></div>
                    <p className="mt-1 text-2xl font-semibold tabular-nums">{formatNumber(monthRollup[c.id] || 0)}</p>
                    <p className="text-[10px] text-muted-foreground">{thisMonth}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex items-center justify-between rounded-md border border-primary/30 bg-primary/5 p-3">
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground font-bold">Estimated cost · {thisMonth}</p>
                  <p className="text-2xl font-semibold tabular-nums">${monthEstimate.toFixed(2)} <span className="text-xs font-normal text-muted-foreground">USD (indicative)</span></p>
                </div>
                <TrendingUp className="h-8 w-8 text-primary opacity-60" />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card className="rounded-md border-border/60 bg-card shadow-sm">
        <CardHeader><CardTitle className="text-base">6-month trend</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3">
            {series.map((row) => {
              const total = cats.reduce((acc, c) => acc + (row[c.id] || 0), 0);
              return (
                <div key={row.month} className="flex items-center gap-3">
                  <span className="w-16 shrink-0 text-xs text-muted-foreground font-mono">{row.month}</span>
                  <div className="flex h-4 flex-1 overflow-hidden rounded bg-muted/30">
                    {cats.map((c) => {
                      const v = row[c.id] || 0;
                      if (!v) return null;
                      const pct = (v / max) * 100;
                      return <div key={c.id} className={c.color} style={{ width: `${pct}%` }} title={`${c.label}: ${v}`} />;
                    })}
                  </div>
                  <span className="w-12 text-right text-xs tabular-nums font-medium">{formatNumber(total)}</span>
                </div>
              );
            })}
          </div>
          <div className="mt-4 flex flex-wrap gap-4 text-[10px] text-muted-foreground font-bold uppercase tracking-tight">
            {cats.map((c) => <span key={c.id} className="inline-flex items-center gap-1.5"><span className={`h-2 w-2 rounded-full ${c.color}`} />{c.label}</span>)}
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-md border-border/60 bg-card shadow-sm">
        <CardHeader><CardTitle className="text-base">Recent billable events</CardTitle></CardHeader>
        <CardContent>
          <ScrollArea className="h-72">
            {!filtered.length ? (
              <p className="py-8 text-center text-xs text-muted-foreground">No billable events yet.</p>
            ) : (
              <table className="w-full text-xs">
                <thead className="text-left text-muted-foreground font-bold uppercase tracking-tighter">
                  <tr className="border-b border-border/60">
                    <th className="py-2">When</th><th>Category</th><th>Recipient</th><th>Conversation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">{filtered.slice(0, 100).map((ev) => (
                  <tr key={ev.id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-2.5">{formatDate(ev.occurred_at)}</td>
                    <td><Badge variant="secondary" className="text-[10px] h-4 rounded-sm">{ev.category}</Badge></td>
                    <td className="font-mono">{ev.recipient_phone || "—"}</td>
                    <td className="max-w-[200px] truncate font-mono text-[10px] text-muted-foreground">{ev.conversation_provider_id}</td>
                  </tr>
                ))}</tbody>
              </table>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
