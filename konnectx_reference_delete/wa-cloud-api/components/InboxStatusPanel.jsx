import { useEffect, useMemo, useState } from "react";
import { Activity, AlertTriangle, CheckCircle2, Inbox as InboxIcon, MailOpen, Radio, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "../lib/validators";

function timeAgo(value) {
  if (!value) return "Never";
  const diff = Date.now() - new Date(value).getTime();
  if (diff < 0) return "Just now";
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function InboxStatusPanel({ data }) {
  const events = data.events?.data || [];
  const conversations = data.conversations?.data || [];
  const activeAccount = data.activeAccount;
  const [lastInboundAt, setLastInboundAt] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const lastEventAt = events[0]?.received_at || null;

  // Pull the most recent inbound message timestamp (scoped to the active account when available).
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      let q = supabase
        .from("wa_messages")
        .select("created_at, phone_number_id")
        .eq("direction", "inbound")
        .order("created_at", { ascending: false })
        .limit(1);
      if (activeAccount?.id) q = q.eq("phone_number_id", activeAccount.id);
      const { data: rows } = await q;
      if (!cancelled) setLastInboundAt(rows?.[0]?.created_at || null);
    };
    load();
    return () => { cancelled = true; };
  }, [activeAccount?.id, events.length, conversations.length]);

  const totalUnread = useMemo(
    () => conversations.reduce((acc, c) => acc + (c.unread_count || 0), 0),
    [conversations]
  );
  const threadsWithUnread = useMemo(
    () => conversations.filter((c) => (c.unread_count || 0) > 0).length,
    [conversations]
  );

  // Webhook is "live" if we received any event in the past 24h
  const webhookLive = useMemo(() => {
    if (!lastEventAt) return false;
    return Date.now() - new Date(lastEventAt).getTime() < 24 * 60 * 60 * 1000;
  }, [lastEventAt]);

  const refresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([data.events?.refetch?.(), data.conversations?.refetch?.()]);
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <Card className="overflow-hidden border-border/60">
      <CardContent className="grid gap-3 p-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile
          icon={Radio}
          label="Webhook"
          value={webhookLive ? "Connected" : "No recent events"}
          tone={webhookLive ? "good" : "warn"}
          hint={lastEventAt ? `Last event ${timeAgo(lastEventAt)}` : "Subscribe in Meta to receive events"}
        />
        <StatTile
          icon={Activity}
          label="Last inbound"
          value={lastInboundAt ? timeAgo(lastInboundAt) : "—"}
          tone={lastInboundAt ? "good" : "muted"}
          hint={lastInboundAt ? formatDate(lastInboundAt) : "No inbound message yet"}
        />
        <StatTile
          icon={MailOpen}
          label="Unread messages"
          value={totalUnread.toString()}
          tone={totalUnread > 0 ? "alert" : "muted"}
          hint={`${threadsWithUnread} thread${threadsWithUnread === 1 ? "" : "s"} need attention`}
        />
        <div className="flex items-center justify-between gap-2 rounded-lg border border-border/60 bg-card/50 p-3">
          <div className="min-w-0">
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Active account</p>
            <p className="truncate text-sm font-semibold">{activeAccount?.display_name || "Not selected"}</p>
            <p className="truncate text-[11px] text-muted-foreground">{activeAccount?.phone_number || "—"}</p>
          </div>
          <Button size="sm" variant="outline" className="h-8 shrink-0" onClick={refresh} disabled={refreshing}>
            <RefreshCw className={`mr-1.5 h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
            Sync
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function StatTile({ icon: Icon, label, value, hint, tone = "muted" }) {
  const tones = {
    good: "border-success/30 bg-success/5 text-success",
    warn: "border-amber-500/30 bg-amber-500/5 text-amber-600 dark:text-amber-400",
    alert: "border-primary/30 bg-primary/5 text-primary",
    muted: "border-border bg-card/40 text-muted-foreground",
  };
  const Glyph = tone === "good" ? CheckCircle2 : tone === "warn" ? AlertTriangle : tone === "alert" ? InboxIcon : Icon;
  return (
    <div className={`flex items-start gap-3 rounded-lg border p-3 ${tones[tone]}`}>
      <div className="rounded-md bg-background/60 p-1.5 ring-1 ring-inset ring-border/40">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[11px] uppercase tracking-wider opacity-80">{label}</p>
          <Glyph className="h-3.5 w-3.5 opacity-70" />
        </div>
        <p className="truncate text-sm font-semibold text-foreground">{value}</p>
        {hint && <p className="truncate text-[11px] text-muted-foreground">{hint}</p>}
      </div>
    </div>
  );
}

export function InboxStatusBadge({ data }) {
  const events = data.events?.data || [];
  const lastEventAt = events[0]?.received_at || null;
  const live = lastEventAt && Date.now() - new Date(lastEventAt).getTime() < 24 * 60 * 60 * 1000;
  return (
    <Badge variant={live ? "default" : "outline"} className="gap-1">
      <span className={`inline-block h-1.5 w-1.5 rounded-full ${live ? "bg-success" : "bg-muted-foreground"}`} />
      {live ? "Webhook live" : "No recent webhook"}
    </Badge>
  );
}
