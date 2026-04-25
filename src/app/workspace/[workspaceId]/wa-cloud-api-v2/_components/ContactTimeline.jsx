"use client";

import { useEffect, useState } from "react";
import { Activity, MessageSquare, Rocket } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase";
import { formatDate } from "../_lib/validators";

export function ContactTimeline({ contact, open, onOpenChange }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !contact) return;
    let cancelled = false;
    setLoading(true);
    (async () => {
      const [messages, recipients] = await Promise.all([
        supabase
          .from("wa_messages")
          .select("id, body, direction, status, message_type, created_at, template_name")
          .or(`contact_id.eq.${contact.id},raw_payload->>recipient_phone.eq.${contact.phone_number}`)
          .order("created_at", { ascending: false })
          .limit(100),
        supabase
          .from("wa_campaign_recipients")
          .select("id, status, sent_at, created_at, variant, wa_campaigns(name)")
          .eq("contact_id", contact.id)
          .order("created_at", { ascending: false })
          .limit(50),
      ]);
      if (cancelled) return;
      const events = [
        ...(messages.data || []).map((m) => ({
          kind: "message",
          at: m.created_at,
          title: m.direction === "inbound" ? "Inbound message" : "Outbound message",
          subtitle: m.template_name ? `Template · ${m.template_name}` : (m.body?.slice(0, 140) || `(${m.message_type})`),
          status: m.status,
        })),
        ...(recipients.data || []).map((r) => ({
          kind: "campaign",
          at: r.sent_at || r.created_at,
          title: `Campaign · ${r.wa_campaigns?.name || "Unknown"}`,
          subtitle: r.variant ? `Variant ${r.variant}` : "",
          status: r.status,
        })),
      ].sort((a, b) => new Date(b.at) - new Date(a.at));
      setItems(events);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [open, contact]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{contact?.name || "Contact"}</SheetTitle>
          <p className="font-mono text-xs text-muted-foreground">{contact?.phone_number}</p>
        </SheetHeader>

        {contact && (
          <div className="mt-4 space-y-3">
            <div className="rounded-md border bg-muted/30 p-3 text-xs">
              <div className="grid grid-cols-2 gap-y-1">
                <span className="text-muted-foreground">Status</span><span className="capitalize">{contact.status}</span>
                <span className="text-muted-foreground">Lifecycle</span><span className="capitalize">{contact.lifecycle_stage || "—"}</span>
                <span className="text-muted-foreground">Company</span><span>{contact.custom_fields?.company || "—"}</span>
                <span className="text-muted-foreground">Last purchase</span><span>{contact.custom_fields?.last_purchase || "—"}</span>
                <span className="text-muted-foreground">Last message</span><span>{formatDate(contact.last_message_at)}</span>
                {contact.opted_out_at && (<><span className="text-muted-foreground">Opted out</span><span className="text-destructive">{formatDate(contact.opted_out_at)}</span></>)}
              </div>
              {(contact.tags || []).length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {contact.tags.map((t) => <Badge key={t} variant="secondary" className="rounded-md">{t}</Badge>)}
                </div>
              )}
            </div>

            <div>
              <p className="mb-2 flex items-center gap-2 text-sm font-semibold"><Activity className="h-4 w-4" /> Timeline</p>
              {loading && <p className="text-xs text-muted-foreground">Loading…</p>}
              {!loading && !items.length && <p className="text-xs text-muted-foreground">No activity yet.</p>}
              <ol className="space-y-2">
                {items.map((ev, i) => (
                  <li key={i} className="rounded-md border bg-card p-2.5 text-xs">
                    <div className="flex items-center gap-2 font-medium">
                      {ev.kind === "campaign" ? <Rocket className="h-3.5 w-3.5 text-primary" /> : <MessageSquare className="h-3.5 w-3.5 text-primary" />}
                      {ev.title}
                      <span className="ml-auto text-muted-foreground">{formatDate(ev.at)}</span>
                    </div>
                    {ev.subtitle && <p className="mt-1 text-muted-foreground">{ev.subtitle}</p>}
                    {ev.status && <p className="mt-1 text-[10px] uppercase tracking-wide text-muted-foreground">{ev.status}</p>}
                  </li>
                ))}
              </ol>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
