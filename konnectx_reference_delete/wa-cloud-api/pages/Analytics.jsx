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
import { supabase } from "@/integrations/supabase/client";
import { MetricCard } from "../components/MetricCard";
import { formatNumber } from "../lib/validators";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const PIE_COLORS = ["hsl(var(--primary))", "hsl(var(--success))", "hsl(var(--warning))", "hsl(var(--destructive))", "hsl(var(--info))"];

function downloadBlob(blob, filename) {
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

export function Analytics({ data }) {
  const [from, setFrom] = useState(() => subDays(new Date(), 29));
  const [to, setTo] = useState(() => new Date());
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const activeAccount = data.activeAccount;
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
    // response time: time between an inbound and the next outbound in the same conversation
    const byConv = new Map();
    for (const m of messages) {
      if (!m.conversation_id) continue;
      if (!byConv.has(m.conversation_id)) byConv.set(m.conversation_id, []);
      byConv.get(m.conversation_id).push(m);
    }
    const responseTimes = [];
    byConv.forEach((arr) => {
      arr.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
      for (let i = 0; i < arr.length - 1; i += 1) {
        if (arr[i].direction === "inbound" && arr[i + 1].direction === "outbound") {
          responseTimes.push((new Date(arr[i + 1].created_at) - new Date(arr[i].created_at)) / 60000);
        }
      }
    });
    const avgResponse = responseTimes.length ? responseTimes.reduce((s, n) => s + n, 0) / responseTimes.length : 0;
    return {
      sent: out.length,
      received: inb.length,
      delivered,
      read,
      failed,
      deliveryRate: out.length ? (delivered / out.length) * 100 : 0,
      readRate: out.length ? (read / out.length) * 100 : 0,
      avgResponseMinutes: avgResponse,
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

  const templatePerf = useMemo(() => {
    const map = new Map();
    for (const m of messages) {
      if (m.message_type !== "template" || !m.template_name) continue;
      const k = `${m.template_name} · ${m.template_language || "?"}`;
      if (!map.has(k)) map.set(k, { name: k, sent: 0, delivered: 0, read: 0, failed: 0, replied: 0, conv: new Set() });
      const e = map.get(k);
      e.sent += 1;
      const s = String(m.status).toLowerCase();
      if (s === "delivered" || s === "read") e.delivered += 1;
      if (s === "read") e.read += 1;
      if (s === "failed" || s === "error") e.failed += 1;
      if (m.conversation_id) e.conv.add(m.conversation_id);
    }
    // count replies = inbound messages in conversations that received this template, after the template
    for (const [, entry] of map) {
      const inboundInConv = messages.filter((m) => m.direction === "inbound" && entry.conv.has(m.conversation_id));
      entry.replied = inboundInConv.length;
      delete entry.conv;
    }
    return Array.from(map.values()).sort((a, b) => b.sent - a.sent).slice(0, 12);
  }, [messages]);

  const accountBreakdown = useMemo(() => {
    const map = new Map();
    for (const m of messages) {
      const id = m.phone_number_id || "unknown";
      if (!map.has(id)) map.set(id, { name: accountMap.get(id)?.display_name || "Unknown", sent: 0, received: 0, delivered: 0 });
      const e = map.get(id);
      if (m.direction === "outbound") e.sent += 1; else e.received += 1;
      const s = String(m.status).toLowerCase();
      if (s === "delivered" || s === "read") e.delivered += 1;
    }
    return Array.from(map.values());
  }, [messages, accountMap]);

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
    if (kind === "messages") {
      const headers = ["created_at", "direction", "status", "message_type", "template_name", "phone_number_id"];
      downloadBlob(new Blob([toCSV(messages, headers)], { type: "text/csv" }), `messages_${scope}_${range}.csv`);
    } else if (kind === "templates") {
      const headers = ["name", "sent", "delivered", "read", "failed", "replied"];
      downloadBlob(new Blob([toCSV(templatePerf, headers)], { type: "text/csv" }), `template_performance_${scope}_${range}.csv`);
    } else if (kind === "campaigns") {
      const rows = campaigns.map((c) => ({ name: c.name, status: c.status, total: c.total_count, sent: c.sent_count, delivered: c.delivered_count, read: c.read_count, failed: c.failed_count, started_at: c.started_at, completed_at: c.completed_at }));
      const headers = ["name", "status", "total", "sent", "delivered", "read", "failed", "started_at", "completed_at"];
      downloadBlob(new Blob([toCSV(rows, headers)], { type: "text/csv" }), `campaigns_${scope}_${range}.csv`);
    } else if (kind === "daily") {
      const headers = ["day", "sent", "received", "delivered", "read", "failed"];
      downloadBlob(new Blob([toCSV(seriesByDay, headers)], { type: "text/csv" }), `daily_${scope}_${range}.csv`);
    }
    toast.success("CSV downloaded");
  };

  const exportPDF = () => {
    const doc = new jsPDF({ unit: "pt", format: "letter" });
    const scope = activeAccount?.display_name || "All accounts";
    const range = `${format(from, "PPP")} – ${format(to, "PPP")}`;
    doc.setFontSize(18);
    doc.text("WhatsApp Analytics Report", 40, 50);
    doc.setFontSize(11);
    doc.setTextColor(110);
    doc.text(`Account: ${scope}`, 40, 70);
    doc.text(`Period: ${range}`, 40, 86);
    doc.text(`Generated: ${format(new Date(), "PPpp")}`, 40, 102);
    doc.setTextColor(0);
    autoTable(doc, {
      startY: 130,
      head: [["Metric", "Value"]],
      body: [
        ["Messages sent", formatNumber(stats.sent)],
        ["Messages received", formatNumber(stats.received)],
        ["Delivered", formatNumber(stats.delivered)],
        ["Read", formatNumber(stats.read)],
        ["Failed", formatNumber(stats.failed)],
        ["Delivery rate", `${stats.deliveryRate.toFixed(1)}%`],
        ["Read rate", `${stats.readRate.toFixed(1)}%`],
        ["Avg response time", `${stats.avgResponseMinutes.toFixed(1)} min`],
      ],
      theme: "striped",
    });
    if (templatePerf.length) {
      autoTable(doc, {
        head: [["Template", "Sent", "Delivered", "Read", "Failed", "Replies"]],
        body: templatePerf.map((t) => [t.name, t.sent, t.delivered, t.read, t.failed, t.replied]),
        theme: "grid",
        styles: { fontSize: 9 },
      });
    }
    if (accountBreakdown.length) {
      autoTable(doc, {
        head: [["Account", "Sent", "Received", "Delivered"]],
        body: accountBreakdown.map((a) => [a.name, a.sent, a.received, a.delivered]),
        theme: "grid",
        styles: { fontSize: 9 },
      });
    }
    doc.save(`analytics_${scope.replace(/\s+/g, "-")}_${format(from, "yyyyMMdd")}-${format(to, "yyyyMMdd")}.pdf`);
    toast.success("PDF downloaded");
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-bold tracking-tight">
            <BarChart3 className="h-5 w-5 text-primary" /> Analytics
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Scope: <span className="font-medium text-foreground">{activeAccount?.display_name || "All accounts"}</span>
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className={cn("gap-1.5 text-xs", !from && "text-muted-foreground")}>
                <CalendarIcon className="h-3.5 w-3.5" /> {format(from, "MMM d")} – {format(to, "MMM d, yyyy")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <div className="flex flex-col gap-1 border-b p-2 text-xs">
                {[
                  { l: "Last 7 days", d: 6 },
                  { l: "Last 30 days", d: 29 },
                  { l: "Last 90 days", d: 89 },
                ].map((r) => (
                  <button key={r.l} onClick={() => { setFrom(subDays(new Date(), r.d)); setTo(new Date()); }} className="rounded px-2 py-1 text-left hover:bg-muted">
                    {r.l}
                  </button>
                ))}
              </div>
              <Calendar
                mode="range"
                selected={{ from, to }}
                onSelect={(r) => { if (r?.from) setFrom(r.from); if (r?.to) setTo(r.to); }}
                numberOfMonths={2}
                className={cn("p-3 pointer-events-auto")}
              />
            </PopoverContent>
          </Popover>
          <Button size="sm" variant="outline" onClick={() => exportCSV("daily")}><Download className="mr-1.5 h-3.5 w-3.5" /> CSV</Button>
          <Button size="sm" onClick={exportPDF}><FileText className="mr-1.5 h-3.5 w-3.5" /> PDF report</Button>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard icon={MessageSquare} label="Sent" value={formatNumber(stats.sent)} helper={`${formatNumber(stats.received)} received`} />
        <MetricCard icon={TrendingUp} label="Delivery rate" value={`${stats.deliveryRate.toFixed(1)}%`} helper={`${formatNumber(stats.delivered)} delivered`} tone="success" />
        <MetricCard icon={Activity} label="Read rate" value={`${stats.readRate.toFixed(1)}%`} helper={`${formatNumber(stats.read)} read`} tone="info" />
        <MetricCard icon={Activity} label="Avg response" value={`${stats.avgResponseMinutes.toFixed(1)}m`} helper={`${formatNumber(stats.failed)} failed`} tone={stats.failed > 0 ? "warning" : "primary"} />
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Messages over time</CardTitle>
        </CardHeader>
        <CardContent className="h-72">
          {loading ? (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading…
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={seriesByDay}>
                <defs>
                  <linearGradient id="g-sent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="g-recv" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--success))" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="hsl(var(--success))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Area type="monotone" dataKey="sent" stroke="hsl(var(--primary))" fill="url(#g-sent)" name="Sent" />
                <Area type="monotone" dataKey="received" stroke="hsl(var(--success))" fill="url(#g-recv)" name="Received" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-3 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Delivery vs Read</CardTitle></CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={seriesByDay}>
                <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line type="monotone" dataKey="delivered" stroke="hsl(var(--info))" name="Delivered" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="read" stroke="hsl(var(--success))" name="Read" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="failed" stroke="hsl(var(--destructive))" name="Failed" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2 flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm">Sentiment (AI-tagged inbound)</CardTitle>
            {sentimentBreakdown.length === 0 && <Badge variant="outline" className="text-[10px]">Run AI summary in Inbox</Badge>}
          </CardHeader>
          <CardContent className="h-64">
            {sentimentBreakdown.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={sentimentBreakdown} dataKey="value" nameKey="name" outerRadius={80} label>
                    {sentimentBreakdown.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-1 text-center text-xs text-muted-foreground">
                No sentiment data yet. Use "Summarize thread" inside any conversation in the Inbox to tag sentiment.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="templates" className="w-full">
        <TabsList>
          <TabsTrigger value="templates">Per-template performance</TabsTrigger>
          <TabsTrigger value="accounts">Per-account breakdown</TabsTrigger>
        </TabsList>
        <TabsContent value="templates" className="space-y-3">
          <div className="flex justify-end">
            <Button size="sm" variant="outline" onClick={() => exportCSV("templates")}><Download className="mr-1.5 h-3.5 w-3.5" /> CSV</Button>
          </div>
          {templatePerf.length === 0 ? (
            <Card><CardContent className="p-8 text-center text-sm text-muted-foreground">No template messages in this period.</CardContent></Card>
          ) : (
            <Card>
              <CardContent className="overflow-x-auto p-0">
                <table className="w-full text-sm">
                  <thead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
                    <tr>
                      <th className="p-3 text-left">Template</th>
                      <th className="p-3 text-right">Sent</th>
                      <th className="p-3 text-right">Delivered</th>
                      <th className="p-3 text-right">Read</th>
                      <th className="p-3 text-right">Failed</th>
                      <th className="p-3 text-right">Inbound replies</th>
                      <th className="p-3 text-right">Read %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {templatePerf.map((t) => (
                      <tr key={t.name} className="border-t">
                        <td className="p-3 font-medium">{t.name}</td>
                        <td className="p-3 text-right">{t.sent}</td>
                        <td className="p-3 text-right">{t.delivered}</td>
                        <td className="p-3 text-right">{t.read}</td>
                        <td className="p-3 text-right">{t.failed}</td>
                        <td className="p-3 text-right">{t.replied}</td>
                        <td className="p-3 text-right">{t.sent ? ((t.read / t.sent) * 100).toFixed(1) : "0.0"}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        <TabsContent value="accounts" className="space-y-3">
          {accountBreakdown.length === 0 ? (
            <Card><CardContent className="p-8 text-center text-sm text-muted-foreground">No data for this period.</CardContent></Card>
          ) : (
            <Card>
              <CardContent className="h-72 p-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={accountBreakdown}>
                    <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                    <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                    <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Bar dataKey="sent" fill="hsl(var(--primary))" name="Sent" />
                    <Bar dataKey="received" fill="hsl(var(--success))" name="Received" />
                    <Bar dataKey="delivered" fill="hsl(var(--info))" name="Delivered" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      <div className="flex flex-wrap justify-end gap-2">
        <Button size="sm" variant="outline" onClick={() => exportCSV("messages")}><Download className="mr-1.5 h-3.5 w-3.5" /> Messages CSV</Button>
        <Button size="sm" variant="outline" onClick={() => exportCSV("campaigns")}><Download className="mr-1.5 h-3.5 w-3.5" /> Campaigns CSV</Button>
      </div>
    </div>
  );
}