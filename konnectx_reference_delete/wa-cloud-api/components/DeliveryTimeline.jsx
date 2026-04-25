import { useEffect, useState } from "react";
import { CheckCircle2, Circle, Clock, AlertCircle, Upload, Send, Eye, RefreshCw, Inbox } from "lucide-react";
import { db } from "../lib/api";
import { supabase } from "@/integrations/supabase/client";
import { formatDate } from "../lib/validators";

// Merges:
//  - wa_send_attempts (every retry of upload + send)
//  - wa_messages timestamps (sent / delivered / read)
//  - wa_webhook_events tied to the same provider_message_id (failures, status updates)
// into a single chronological feed.
export function DeliveryTimeline({ messageId }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!messageId) return;
    setLoading(true);
    try {
      const { data: msg } = await db.message(messageId);
      const attemptsRes = await db.sendAttempts(messageId);
      const attempts = attemptsRes.data || [];
      let events = [];
      if (msg?.provider_message_id) {
        const evRes = await db.webhookEventsForMessage(msg.provider_message_id);
        events = evRes.data || [];
      }
      const merged = [];
      attempts.forEach((a) => {
        merged.push({
          ts: a.created_at,
          kind: a.stage === "upload" ? "upload" : "send",
          status: a.status,
          label:
            a.stage === "upload"
              ? `Upload attempt ${a.attempt_number}`
              : `Send attempt ${a.attempt_number}`,
          detail: a.error_message || (a.http_status ? `HTTP ${a.http_status} · ${a.latency_ms ?? "?"}ms` : `${a.latency_ms ?? "?"}ms`),
        });
      });
      if (msg?.sent_at) merged.push({ ts: msg.sent_at, kind: "sent", status: "success", label: "Accepted by Meta", detail: msg.provider_message_id });
      if (msg?.delivered_at) merged.push({ ts: msg.delivered_at, kind: "delivered", status: "success", label: "Delivered to phone", detail: null });
      if (msg?.read_at) merged.push({ ts: msg.read_at, kind: "read", status: "success", label: "Read by recipient", detail: null });
      events.forEach((ev) => {
        const status = String(ev.event_type || "").toLowerCase().includes("fail") ? "failed" : "success";
        merged.push({
          ts: ev.received_at,
          kind: "webhook",
          status,
          label: `Webhook · ${ev.event_type}`,
          detail: ev.processing_error || null,
        });
      });
      merged.sort((a, b) => new Date(a.ts).getTime() - new Date(b.ts).getTime());
      setItems(merged);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    if (!messageId) return;
    const channel = supabase
      .channel(`timeline-${messageId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "wa_send_attempts", filter: `message_id=eq.${messageId}` }, load)
      .on("postgres_changes", { event: "*", schema: "public", table: "wa_messages", filter: `id=eq.${messageId}` }, load)
      .on("postgres_changes", { event: "*", schema: "public", table: "wa_webhook_events" }, load)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [messageId]);

  if (!messageId) return null;

  const icon = (kind, status) => {
    const base = "h-3.5 w-3.5";
    if (status === "failed") return <AlertCircle className={`${base} text-destructive`} />;
    if (kind === "upload") return <Upload className={`${base} text-primary`} />;
    if (kind === "send") return <Send className={`${base} text-primary`} />;
    if (kind === "sent") return <CheckCircle2 className={`${base} text-emerald-500`} />;
    if (kind === "delivered") return <CheckCircle2 className={`${base} text-emerald-500`} />;
    if (kind === "read") return <Eye className={`${base} text-blue-500`} />;
    if (kind === "webhook") return <Inbox className={`${base} text-muted-foreground`} />;
    return <Circle className={base} />;
  };

  return (
    <div className="space-y-2 rounded-md border border-border/60 bg-card/40 p-3">
      <div className="flex items-center justify-between">
        <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Delivery timeline</p>
        <button onClick={load} className="text-[11px] text-muted-foreground hover:text-foreground">
          <RefreshCw className="inline h-3 w-3" />
        </button>
      </div>
      {loading && !items.length && <p className="text-xs text-muted-foreground">Loading…</p>}
      {!loading && !items.length && <p className="text-xs text-muted-foreground">No events yet — waiting for Meta.</p>}
      <ol className="space-y-2">
        {items.map((it, i) => (
          <li key={i} className="flex items-start gap-2 text-xs">
            <span className="mt-0.5">{icon(it.kind, it.status)}</span>
            <div className="min-w-0 flex-1">
              <p className={it.status === "failed" ? "font-medium text-destructive" : "font-medium"}>{it.label}</p>
              {it.detail && <p className="truncate text-[11px] text-muted-foreground">{it.detail}</p>}
              <p className="text-[10px] text-muted-foreground">{formatDate(it.ts)}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
