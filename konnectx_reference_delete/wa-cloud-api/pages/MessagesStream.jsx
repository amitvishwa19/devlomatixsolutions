import { useCallback, useEffect, useMemo, useState } from "react";
import { Activity, Download, FileDown, Filter, RefreshCw, Search } from "lucide-react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { formatDate } from "../lib/validators";
import { toast } from "sonner";

const TYPE_OPTIONS = ["all", "text", "template", "image", "document", "audio", "video", "interactive", "button", "reaction", "unknown"];

function todayIso() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString().slice(0, 10);
}

function isoDateToStart(iso) {
  if (!iso) return null;
  const d = new Date(`${iso}T00:00:00`);
  return isNaN(d) ? null : d.toISOString();
}

function isoDateToEnd(iso) {
  if (!iso) return null;
  const d = new Date(`${iso}T23:59:59.999`);
  return isNaN(d) ? null : d.toISOString();
}

function escapeCsv(value) {
  const s = value == null ? "" : String(value);
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export function MessagesStream({ data }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [phoneFilter, setPhoneFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 6);
    return d.toISOString().slice(0, 10);
  });
  const [dateTo, setDateTo] = useState(todayIso());
  const [accountFilter, setAccountFilter] = useState("active");
  const accounts = data.phoneNumbers?.data || [];

  const activeAccountId = data.activeAccount?.id || null;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      let q = supabase
        .from("wa_messages")
        .select("id, conversation_id, phone_number_id, direction, message_type, body, status, created_at, raw_payload, template_name, template_language, error_message")
        .eq("direction", "inbound")
        .order("created_at", { ascending: false })
        .limit(500);

      if (accountFilter === "active" && activeAccountId) q = q.eq("phone_number_id", activeAccountId);
      else if (accountFilter !== "active" && accountFilter !== "all") q = q.eq("phone_number_id", accountFilter);
      if (typeFilter !== "all") q = q.eq("message_type", typeFilter);
      const start = isoDateToStart(dateFrom);
      const end = isoDateToEnd(dateTo);
      if (start) q = q.gte("created_at", start);
      if (end) q = q.lte("created_at", end);

      const { data: rowsData, error } = await q;
      if (error) throw error;
      setRows(rowsData || []);
    } catch (e) {
      toast.error(e.message || "Failed to load messages");
    } finally {
      setLoading(false);
    }
  }, [accountFilter, activeAccountId, typeFilter, dateFrom, dateTo]);

  // Initial + filter-driven load
  useEffect(() => { load(); }, [load]);

  // Realtime: append new inbound messages that match current filters
  useEffect(() => {
    const channel = supabase
      .channel("wa-stream")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "wa_messages" },
        (payload) => {
          const row = payload.new;
          if (!row || row.direction !== "inbound") return;
          if (accountFilter === "active" && activeAccountId && row.phone_number_id !== activeAccountId) return;
          if (accountFilter !== "active" && accountFilter !== "all" && row.phone_number_id !== accountFilter) return;
          if (typeFilter !== "all" && row.message_type !== typeFilter) return;
          const start = isoDateToStart(dateFrom);
          const end = isoDateToEnd(dateTo);
          if (start && row.created_at < start) return;
          if (end && row.created_at > end) return;
          setRows((prev) => {
            if (prev.some((r) => r.id === row.id)) return prev;
            return [row, ...prev].slice(0, 500);
          });
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [accountFilter, activeAccountId, typeFilter, dateFrom, dateTo]);

  const conversations = data.conversations?.data || [];
  const phoneByConvId = useMemo(() => {
    const map = new Map();
    for (const c of conversations) map.set(c.id, c.external_contact_phone || c.wa_contacts?.phone_number || "—");
    return map;
  }, [conversations]);
  const accountById = useMemo(() => {
    const map = new Map();
    for (const a of accounts) map.set(a.id, a);
    return map;
  }, [accounts]);

  const filtered = useMemo(() => {
    if (!phoneFilter.trim()) return rows;
    const q = phoneFilter.toLowerCase();
    return rows.filter((r) => {
      const phone = phoneByConvId.get(r.conversation_id) || "";
      return phone.toLowerCase().includes(q) || (r.body || "").toLowerCase().includes(q);
    });
  }, [rows, phoneFilter, phoneByConvId]);

  const exportCsv = () => {
    if (!filtered.length) {
      toast.error("Nothing to export");
      return;
    }
    const header = ["received_at", "phone", "account", "type", "status", "body", "template", "error"];
    const lines = [header.join(",")];
    for (const r of filtered) {
      const acc = accountById.get(r.phone_number_id);
      lines.push([
        r.created_at,
        phoneByConvId.get(r.conversation_id) || "",
        acc?.display_name || "",
        r.message_type,
        r.status,
        r.body || "",
        r.template_name ? `${r.template_name}${r.template_language ? ` (${r.template_language})` : ""}` : "",
        r.error_message || "",
      ].map(escapeCsv).join(","));
    }
    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `wa-messages-${todayIso()}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${filtered.length} rows to CSV`);
  };

  const exportPdf = () => {
    if (!filtered.length) {
      toast.error("Nothing to export");
      return;
    }
    const doc = new jsPDF({ orientation: "landscape" });
    doc.setFontSize(14);
    doc.text("Received WhatsApp messages", 14, 15);
    doc.setFontSize(9);
    doc.setTextColor(120);
    doc.text(
      `Filters: ${dateFrom} → ${dateTo} · type=${typeFilter} · account=${accountFilter === "active" ? (data.activeAccount?.display_name || "active") : accountFilter} · ${filtered.length} rows`,
      14,
      21
    );
    autoTable(doc, {
      startY: 26,
      head: [["Received", "Phone", "Account", "Type", "Status", "Body / Template"]],
      body: filtered.map((r) => {
        const acc = accountById.get(r.phone_number_id);
        const last = r.template_name ? `[tpl] ${r.template_name}` : (r.body || "—");
        return [
          formatDate(r.created_at),
          phoneByConvId.get(r.conversation_id) || "—",
          acc?.display_name || "—",
          r.message_type,
          r.status,
          String(last).slice(0, 120),
        ];
      }),
      styles: { fontSize: 8, cellPadding: 2, overflow: "linebreak" },
      headStyles: { fillColor: [30, 144, 175] },
      columnStyles: { 5: { cellWidth: 90 } },
    });
    doc.save(`wa-messages-${todayIso()}.pdf`);
    toast.success(`Exported ${filtered.length} rows to PDF`);
  };

  return (
    <Card className="overflow-hidden border-border/60">
      <CardHeader className="flex flex-col gap-3 border-b lg:flex-row lg:items-center lg:justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" /> Live messages stream
          </CardTitle>
          <p className="mt-1 text-xs text-muted-foreground">
            Inbound messages from webhook events — updated in real time. Filter by phone, type and date, then export.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="gap-1">
            <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-success" />
            {filtered.length} message{filtered.length === 1 ? "" : "s"}
          </Badge>
          <Button size="sm" variant="outline" onClick={load} disabled={loading}>
            <RefreshCw className={`mr-1.5 h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
          </Button>
          <Button size="sm" variant="outline" onClick={exportCsv}>
            <Download className="mr-1.5 h-3.5 w-3.5" /> CSV
          </Button>
          <Button size="sm" variant="outline" onClick={exportPdf}>
            <FileDown className="mr-1.5 h-3.5 w-3.5" /> PDF
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 p-4">
        <div className="grid gap-3 rounded-lg border border-border/60 bg-card/40 p-3 md:grid-cols-2 lg:grid-cols-5">
          <div className="space-y-1.5 lg:col-span-2">
            <Label className="text-[11px] uppercase tracking-wider text-muted-foreground">
              <Search className="mr-1 inline h-3 w-3" /> Phone or text
            </Label>
            <Input
              value={phoneFilter}
              onChange={(e) => setPhoneFilter(e.target.value)}
              placeholder="Search phone or body…"
              className="h-9"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-[11px] uppercase tracking-wider text-muted-foreground">
              <Filter className="mr-1 inline h-3 w-3" /> Type
            </Label>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
              <SelectContent>
                {TYPE_OPTIONS.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-[11px] uppercase tracking-wider text-muted-foreground">From</Label>
            <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="h-9" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-[11px] uppercase tracking-wider text-muted-foreground">To</Label>
            <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="h-9" />
          </div>
          <div className="space-y-1.5 lg:col-span-2">
            <Label className="text-[11px] uppercase tracking-wider text-muted-foreground">Account</Label>
            <Select value={accountFilter} onValueChange={setAccountFilter}>
              <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active account ({data.activeAccount?.display_name || "—"})</SelectItem>
                <SelectItem value="all">All accounts</SelectItem>
                {accounts.map((a) => <SelectItem key={a.id} value={a.id}>{a.display_name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="overflow-hidden rounded-lg border border-border/60">
          <ScrollArea className="h-[58vh]">
            <table className="w-full min-w-[900px] text-sm">
              <thead className="sticky top-0 bg-card">
                <tr className="border-b border-border/60 text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                  <th className="py-2.5 pl-3 pr-3">Received</th>
                  <th className="px-3">Phone</th>
                  <th className="px-3">Account</th>
                  <th className="px-3">Type</th>
                  <th className="px-3">Status</th>
                  <th className="px-3">Preview</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr><td colSpan={6} className="py-8 text-center text-xs text-muted-foreground">Loading…</td></tr>
                )}
                {!loading && filtered.map((r) => {
                  const acc = accountById.get(r.phone_number_id);
                  const phoneText = phoneByConvId.get(r.conversation_id) || "—";
                  const preview = r.template_name
                    ? <span className="font-mono text-xs">[tpl] {r.template_name}</span>
                    : <span className="line-clamp-1">{r.body || "—"}</span>;
                  return (
                    <tr key={r.id} className="border-b border-border/40 hover:bg-card/40">
                      <td className="py-2 pl-3 pr-3 text-xs text-muted-foreground">{formatDate(r.created_at)}</td>
                      <td className="px-3 font-mono text-xs">{phoneText}</td>
                      <td className="px-3 text-xs text-muted-foreground">{acc?.display_name || "—"}</td>
                      <td className="px-3"><Badge variant="outline" className="text-[10px]">{r.message_type}</Badge></td>
                      <td className="px-3 text-xs">{r.status}</td>
                      <td className="px-3">{preview}</td>
                    </tr>
                  );
                })}
                {!loading && !filtered.length && (
                  <tr><td colSpan={6} className="py-10 text-center text-xs text-muted-foreground">
                    No inbound messages match the current filters.
                  </td></tr>
                )}
              </tbody>
            </table>
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
}
