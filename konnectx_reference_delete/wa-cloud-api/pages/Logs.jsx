import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, ChevronRight, Clock, RefreshCw, Search } from "lucide-react";
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

const KIND_OPTIONS = ["all", "send", "template", "webhook"];

function statusKind(row) {
  if (row.__source === "webhook") {
    if (row.processing_error) return { label: "error", tone: "destructive" };
    if (row.processed) return { label: "ok", tone: "secondary" };
    return { label: "pending", tone: "outline" };
  }
  if (row.status === "failed") return { label: "failed", tone: "destructive" };
  if (["sent", "delivered", "read"].includes(row.status)) return { label: row.status, tone: "secondary" };
  return { label: row.status || "—", tone: "outline" };
}

export function Logs() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [kind, setKind] = useState("all");
  const [onlyErrors, setOnlyErrors] = useState(false);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const merged = [];
      if (kind === "all" || kind === "send" || kind === "template") {
        let q = supabase
          .from("wa_messages")
          .select("id, direction, message_type, status, body, template_name, template_language, error_message, raw_payload, created_at, sent_at, provider_message_id")
          .eq("direction", "outbound")
          .order("created_at", { ascending: false })
          .limit(150);
        if (kind === "template") q = q.eq("message_type", "template");
        else if (kind === "send") q = q.neq("message_type", "template");
        const { data: msgs, error } = await q;
        if (error) throw error;
        for (const m of msgs || []) merged.push({ ...m, __source: m.message_type === "template" ? "template" : "send", __ts: m.created_at });
      }
      if (kind === "all" || kind === "webhook") {
        const { data: evs, error } = await supabase
          .from("wa_webhook_events")
          .select("id, event_type, provider_object, payload, processed, processing_error, received_at, provider_message_id")
          .order("received_at", { ascending: false })
          .limit(150);
        if (error) throw error;
        for (const e of evs || []) merged.push({ ...e, __source: "webhook", __ts: e.received_at });
      }
      merged.sort((a, b) => (a.__ts < b.__ts ? 1 : -1));
      setRows(merged.slice(0, 250));
    } catch (e) {
      toast.error(e.message || "Failed to load logs");
    } finally {
      setLoading(false);
    }
  }, [kind]);

  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (onlyErrors) {
        const isErr = r.__source === "webhook" ? !!r.processing_error : r.status === "failed";
        if (!isErr) return false;
      }
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      const blob = [r.body, r.template_name, r.error_message, r.event_type, r.provider_message_id, JSON.stringify(r.raw_payload || r.payload || "")].join(" ").toLowerCase();
      return blob.includes(q);
    });
  }, [rows, onlyErrors, search]);

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_420px]">
      <Card className="rounded-md border-border/60">
        <CardHeader className="flex flex-col gap-3 border-b lg:flex-row lg:items-center lg:justify-between">
          <div>
            <CardTitle>API logs</CardTitle>
            <p className="mt-1 text-xs text-muted-foreground">Last requests & responses for sends, template messages, and inbound webhooks.</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline">{filtered.length} entr{filtered.length === 1 ? "y" : "ies"}</Badge>
            <Button size="sm" variant="outline" onClick={load} disabled={loading}>
              <RefreshCw className={`mr-1.5 h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 p-4">
          <div className="grid gap-3 rounded-lg border border-border/60 bg-card/40 p-3 md:grid-cols-4">
            <div className="space-y-1.5 md:col-span-2">
              <Label className="text-[11px] uppercase tracking-wider text-muted-foreground"><Search className="mr-1 inline h-3 w-3" /> Search</Label>
              <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Body, template, error, message id…" className="h-9" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[11px] uppercase tracking-wider text-muted-foreground">Source</Label>
              <Select value={kind} onValueChange={setKind}>
                <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {KIND_OPTIONS.map((k) => <SelectItem key={k} value={k}>{k}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-[11px] uppercase tracking-wider text-muted-foreground">Show</Label>
              <Select value={onlyErrors ? "errors" : "all"} onValueChange={(v) => setOnlyErrors(v === "errors")}>
                <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="errors">Errors only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <ScrollArea className="h-[60vh] rounded-lg border border-border/60">
            <ul className="divide-y">
              {loading && <li className="p-6 text-center text-xs text-muted-foreground">Loading…</li>}
              {!loading && filtered.map((r) => {
                const k = statusKind(r);
                const isErr = (r.__source === "webhook" ? r.processing_error : r.status === "failed");
                const id = `${r.__source}-${r.id}`;
                const label = r.__source === "webhook"
                  ? r.event_type
                  : r.message_type === "template"
                    ? `template · ${r.template_name || ""}`
                    : `send · ${r.message_type}`;
                return (
                  <li key={id}>
                    <button
                      onClick={() => setSelected(r)}
                      className={`flex w-full items-start gap-3 px-3 py-2.5 text-left text-xs hover:bg-muted/40 ${selected && `${selected.__source}-${selected.id}` === id ? "bg-muted/60" : ""}`}
                    >
                      {isErr ? <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-destructive" /> : <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success" />}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="truncate font-medium">{label}</span>
                          <Badge variant={k.tone} className="text-[10px]">{k.label}</Badge>
                          <Badge variant="outline" className="text-[10px]">{r.__source}</Badge>
                        </div>
                        <div className="mt-1 flex items-center gap-2 text-[10px] text-muted-foreground">
                          <Clock className="h-3 w-3" /> {formatDate(r.__ts)}
                          {r.provider_message_id && <span className="font-mono">· {r.provider_message_id.slice(0, 24)}…</span>}
                        </div>
                        {(r.error_message || r.processing_error) && (
                          <p className="mt-1 line-clamp-1 text-[11px] text-destructive">{r.error_message || r.processing_error}</p>
                        )}
                      </div>
                      <ChevronRight className="mt-1 h-3.5 w-3.5 text-muted-foreground" />
                    </button>
                  </li>
                );
              })}
              {!loading && !filtered.length && (
                <li className="p-10 text-center text-xs text-muted-foreground">No log entries match the filters.</li>
              )}
            </ul>
          </ScrollArea>
        </CardContent>
      </Card>

      <Card className="rounded-md border-border/60">
        <CardHeader>
          <CardTitle className="text-base">Details</CardTitle>
        </CardHeader>
        <CardContent>
          {selected ? (
            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div><div className="text-[10px] uppercase text-muted-foreground">Source</div><div className="font-mono">{selected.__source}</div></div>
                <div><div className="text-[10px] uppercase text-muted-foreground">When</div><div>{formatDate(selected.__ts)}</div></div>
                {selected.__source !== "webhook" ? (
                  <>
                    <div><div className="text-[10px] uppercase text-muted-foreground">Type</div><div>{selected.message_type}</div></div>
                    <div><div className="text-[10px] uppercase text-muted-foreground">Status</div><div>{selected.status}</div></div>
                    {selected.template_name && (
                      <div className="col-span-2"><div className="text-[10px] uppercase text-muted-foreground">Template</div><div className="font-mono">{selected.template_name} ({selected.template_language})</div></div>
                    )}
                    {selected.provider_message_id && (
                      <div className="col-span-2"><div className="text-[10px] uppercase text-muted-foreground">Message id</div><div className="break-all font-mono">{selected.provider_message_id}</div></div>
                    )}
                  </>
                ) : (
                  <>
                    <div><div className="text-[10px] uppercase text-muted-foreground">Event</div><div>{selected.event_type}</div></div>
                    <div><div className="text-[10px] uppercase text-muted-foreground">Processed</div><div>{selected.processed ? "yes" : "no"}</div></div>
                  </>
                )}
              </div>

              {(selected.error_message || selected.processing_error) && (
                <div className="rounded-md border border-destructive/40 bg-destructive/5 p-2 text-destructive">
                  {selected.error_message || selected.processing_error}
                </div>
              )}

              {selected.body && (
                <div>
                  <div className="text-[10px] uppercase text-muted-foreground">Body</div>
                  <div className="mt-1 whitespace-pre-wrap rounded-md border border-border/60 bg-card/40 p-2">{selected.body}</div>
                </div>
              )}

              <div>
                <div className="text-[10px] uppercase text-muted-foreground">Raw payload</div>
                <ScrollArea className="mt-1 h-[40vh] rounded-md border border-border/60 bg-card/40 p-2">
                  <pre className="whitespace-pre-wrap break-all text-[11px] leading-relaxed">
                    {JSON.stringify(selected.raw_payload || selected.payload || {}, null, 2)}
                  </pre>
                </ScrollArea>
              </div>
            </div>
          ) : (
            <p className="py-16 text-center text-sm text-muted-foreground">Select a log entry to view details.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
