"use client";

import { useEffect, useMemo, useState } from "react";
import { Activity, BarChart3, CalendarIcon, Download, FileText, Loader2, MessageSquare, TrendingUp } from "lucide-react";
import { format, subDays, startOfDay, endOfDay, eachDayOfInterval } from "date-fns";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { MetricCard } from "../_components/MetricCard";
import { formatNumber } from "../_lib/validators";
import { useV2Data } from "../layout";

const PIE_COLORS = ["#3b82f6", "#22c55e", "#eab308", "#ef4444", "#06b6d4"];

function downloadBlob(blob, filename) {
  if (typeof window === "undefined") return;
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function toCSV(rows, headers) {
  const escape = (v) => {
    if (v === null || v === undefined) return "";
    const s = String(v).replace(/"/g, '""');
    return /[",\n]/.test(s) ? `"${s}"` : s;
  };
  const lines = [headers.map(escape).join(",")];
  for (const r of rows) lines.push(headers.map((h) => escape(r[h])).join(","));
  return lines.join("\n");
}

function dayKey(d) { return format(new Date(d), "yyyy-MM-dd"); }

export default function AnalyticsPage() {
  const data = useV2Data();
  const [from, setFrom] = useState(() => subDays(new Date(), 29));
  const [to, setTo] = useState(() => new Date());
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const activeAccount = data.defaultNumber;
  const templates = data.templates?.data || [];
  const accounts = data.phoneNumbers?.data || [];
  const campaigns = data.campaigns?.data || [];

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      const start = startOfDay(from).toISOString();
      const end = endOfDay(to).toISOString();
      let q = supabase
        .from("wa_messages")
        .select("id, direction, status, message_type, template_name, template_language, phone_number_id, conversation_id, created_at, sent_at, delivered_at, read_at, sentiment")
        .gte("created_at", start)
        .lte("created_at", end)
        .order("created_at", { ascending: true })
        .limit(5000);
      if (activeAccount?.id) q = q.eq("phone_number_id", activeAccount.id);
      const { data: rows, error } = await q;
      if (cancelled) return;
      if (error) toast.error(error.message);
      setMessages(rows || []);
      setLoading(false);
    };
    load();
    return () => { cancelled = true; };
  }, [from, to, activeAccount?.id]);

  const accountMap = useMemo(() => new Map(accounts.map((a) => [a.id, a])), [accounts]);

  const stats = useMemo(() => {
    const out = messages.filter((m) => m.direction === "outbound");
    const inb = messages.filter((m) => m.direction === "inbound");
    const delivered = out.filter((m) => ["delivered", "read"].includes(String(m.status).toLowerCase())).length;
    const read = out.filter((m) => String(m.status).toLowerCase() === "read").length;
    const failed = out.filter((m) => ["failed", "error"].includes(String(m.status).toLowerCase())).length;
    
    return {
      sent: out.length,
      received: inb.length,
      delivered,
      read,
      failed,
      deliveryRate: out.length ? (delivered / out.length) * 100 : 0,
      readRate: out.length ? (read / out.length) * 100 : 0,
    };
  }, [messages]);

  const seriesByDay = useMemo(() => {
    const days = eachDayOfInterval({ start: startOfDay(from), end: endOfDay(to) });
    const buckets = new Map(days.map((d) => [dayKey(d), { day: format(d, "MMM d"), sent: 0, received: 0, delivered: 0, read: 0, failed: 0 }]));
    for (const m of messages) {
      const k = dayKey(m.created_at);
      if (!buckets.has(k)) continue;
      const b = buckets.get(k);
      if (m.direction === "outbound") b.sent += 1; else b.received += 1;
      const s = String(m.status).toLowerCase();
      if (s === "delivered" || s === "read") b.delivered += 1;
      if (s === "read") b.read += 1;
      if (s === "failed" || s === "error") b.failed += 1;
    }
    return Array.from(buckets.values());
  }, [messages, from, to]);

  const sentimentBreakdown = useMemo(() => {
    const map = new Map();
    for (const m of messages) {
      if (m.direction !== "inbound" || !m.sentiment) continue;
      map.set(m.sentiment, (map.get(m.sentiment) || 0) + 1);
    }
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
  }, [messages]);

  const exportCSV = (kind) => {
    const scope = activeAccount?.display_name || "all-accounts";
    const range = `${format(from, "yyyy-MM-dd")}_to_${format(to, "yyyy-MM-dd")}`;
    if (kind === "daily") {
      const headers = ["day", "sent", "received", "delivered", "read", "failed"];
      downloadBlob(new Blob([toCSV(seriesByDay, headers)], { type: "text/csv" }), `daily_${scope}_${range}.csv`);
    }
    toast.success("CSV downloaded");
  };

  return (
    <div className="space-y-6 pb-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Analytics</h2>
          <p className="text-sm text-muted-foreground font-medium uppercase tracking-tight mt-1">
            {activeAccount?.display_name || "All accounts"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 gap-2 font-bold text-xs uppercase tracking-tight">
                <CalendarIcon className="h-3.5 w-3.5" />
                {format(from, "MMM d")} – {format(to, "MMM d")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="range"
                selected={{ from, to }}
                onSelect={(r) => { if (r?.from) setFrom(r.from); if (r?.to) setTo(r.to); }}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
          <Button size="sm" variant="outline" onClick={() => exportCSV("daily")} className="h-9 font-bold text-xs uppercase tracking-tight"><Download className="mr-2 h-3.5 w-3.5" /> Export</Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard icon={MessageSquare} label="Total Sent" value={formatNumber(stats.sent)} helper={`${formatNumber(stats.received)} received`} tone="primary" />
        <MetricCard icon={TrendingUp} label="Delivery Rate" value={`${stats.deliveryRate.toFixed(1)}%`} helper={`${formatNumber(stats.delivered)} reached`} tone="success" />
        <MetricCard icon={Activity} label="Read Rate" value={`${stats.readRate.toFixed(1)}%`} helper={`${formatNumber(stats.read)} seen`} tone="info" />
        <MetricCard icon={Activity} label="Failed" value={formatNumber(stats.failed)} helper="Error count" tone="destructive" />
      </div>

      <Card className="rounded-md border-border/60 bg-card shadow-sm">
        <CardHeader className="py-4 border-b border-border/60">
          <CardTitle className="text-sm font-bold uppercase tracking-widest">Traffic Overview</CardTitle>
        </CardHeader>
        <CardContent className="h-80 pt-6">
          {loading ? (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground"><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading chart...</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={seriesByDay}>
                <defs>
                  <linearGradient id="g-sent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: "bold" }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: "bold" }} />
                <Tooltip />
                <Area type="monotone" dataKey="sent" stroke="#3b82f6" strokeWidth={2} fill="url(#g-sent)" name="Sent" />
                <Area type="monotone" dataKey="received" stroke="#22c55e" strokeWidth={2} fill="none" name="Received" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="rounded-md border-border/60 bg-card shadow-sm">
          <CardHeader className="py-4 border-b border-border/60">
            <CardTitle className="text-sm font-bold uppercase tracking-widest">Delivery Funnel</CardTitle>
          </CardHeader>
          <CardContent className="h-64 pt-6">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={seriesByDay}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: "bold" }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: "bold" }} />
                <Tooltip />
                <Line type="monotone" dataKey="delivered" stroke="#06b6d4" strokeWidth={2} dot={false} name="Delivered" />
                <Line type="monotone" dataKey="read" stroke="#22c55e" strokeWidth={2} dot={false} name="Read" />
                <Line type="monotone" dataKey="failed" stroke="#ef4444" strokeWidth={2} dot={false} name="Failed" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="rounded-md border-border/60 bg-card shadow-sm">
          <CardHeader className="py-4 border-b border-border/60">
            <CardTitle className="text-sm font-bold uppercase tracking-widest">Inbound Sentiment</CardTitle>
          </CardHeader>
          <CardContent className="h-64 pt-6">
            {sentimentBreakdown.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={sentimentBreakdown} dataKey="value" nameKey="name" innerRadius={60} outerRadius={80} paddingAngle={5} label>
                    {sentimentBreakdown.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-xs text-muted-foreground font-bold uppercase tracking-tight">No sentiment data recorded</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
