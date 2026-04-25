"use client";

import { useMemo, useState } from "react";
import { Rocket, FlaskConical, CircleSlash, Filter, Play, Pause, Trash2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { createCampaign, startCampaign, pauseCampaign, deleteCampaign } from "./_actions/campaign";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/lib/supabase";
import { StatusBadge } from "../_components/StatusBadge";
import { applyFilter, describeFilter, EMPTY_FILTER } from "../_lib/segments";
import { useV2Data } from "../layout";

export default function CampaignsPage() {
  const data = useV2Data();
  const approved = (data.templates.data || []).filter((t) => t.status === "APPROVED");
  const allContacts = data.contacts.data || [];
  const segments = data.segments.data || [];
  const [form, setForm] = useState({
    name: "", template_id: "", template_b_id: "", split: 50,
    tag: "", segment_id: "", pacing_per_minute: 20, abEnabled: false,
  });

  const audience = useMemo(() => {
    const seg = segments.find((s) => s.id === form.segment_id);
    const baseFilter = seg ? { ...EMPTY_FILTER, ...seg.filter, exclude_opted_out: false } : { ...EMPTY_FILTER, tag: form.tag.trim(), exclude_opted_out: false };
    const pool = applyFilter(allContacts, baseFilter);
    const eligible = pool.filter((c) => !c.opted_out_at && c.status !== "opted_out");
    const label = seg ? `Segment · ${seg.name}` : (form.tag ? `Tag · ${form.tag}` : "All contacts");
    return { total: pool.length, eligible: eligible.length, skipped: pool.length - eligible.length, list: eligible, label };
  }, [allContacts, segments, form.tag, form.segment_id]);

  const create = async () => {
    if (!data.defaultNumber || !form.name || !form.template_id) {
      return toast.error("Choose default account, campaign name, and template");
    }
    if (form.abEnabled && !form.template_b_id) {
      return toast.error("Pick a second template for A/B test");
    }
    const recipients = audience.list;
    const splitA = Math.max(0, Math.min(100, Number(form.split) || 50));
    const variants = form.abEnabled
      ? [
          { key: "A", template_id: form.template_id, weight: splitA },
          { key: "B", template_id: form.template_b_id, weight: 100 - splitA },
        ]
      : [];

    const res = await createCampaign({
        name: form.name,
        phone_number_id: data.defaultNumber.id,
        template_id: form.template_id,
        total_count: recipients.length,
        pacing_per_minute: Number(form.pacing_per_minute),
        audience_filter: { tag: form.tag || null, segment_id: form.segment_id || null, exclude_opted_out: true },
        variants,
      });
    if (!res.success) return toast.error(res.error || "Failed to create campaign");
    const campaign = res.data;

    if (recipients.length) {
      const rows = recipients.map((c, i) => {
        let variant = null;
        if (form.abEnabled) {
          // Deterministic split by index
          variant = i < Math.round((recipients.length * splitA) / 100) ? "A" : "B";
        }
        return { campaign_id: campaign.id, contact_id: c.id, recipient_phone: c.phone_number, variant };
      });
      await supabase.from("wa_campaign_recipients").insert(rows);
    }
    toast.success(`Campaign created · ${recipients.length} recipients (${audience.skipped} opted-out skipped)`);
    data.refetchAll();
  };

  return (
    <div className="grid gap-4 xl:grid-cols-[420px_1fr]">
      <Card className="rounded-lg">
        <CardHeader><CardTitle>Create campaign</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2"><Label>Name</Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>

          <div className="space-y-2"><Label>Template {form.abEnabled ? "A" : ""}</Label>
            <Select value={form.template_id} onValueChange={(v) => setForm({ ...form, template_id: v })}>
              <SelectTrigger><SelectValue placeholder="Approved template" /></SelectTrigger>
              <SelectContent>
                {approved.map((t) => <SelectItem key={t.id} value={t.id}>{t.name} · {t.language}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between rounded-md border bg-muted/30 px-3 py-2">
            <div className="flex items-center gap-2 text-sm">
              <FlaskConical className="h-4 w-4 text-primary" />
              <span>A/B test two templates</span>
            </div>
            <Switch checked={form.abEnabled} onCheckedChange={(v) => setForm({ ...form, abEnabled: v })} />
          </div>

          {form.abEnabled && (
            <>
              <div className="space-y-2"><Label>Template B</Label>
                <Select value={form.template_b_id} onValueChange={(v) => setForm({ ...form, template_b_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Second template" /></SelectTrigger>
                  <SelectContent>
                    {approved.filter((t) => t.id !== form.template_id).map((t) => (
                      <SelectItem key={t.id} value={t.id}>{t.name} · {t.language}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Split — A: {form.split}% · B: {100 - form.split}%</Label>
                <Input type="range" min="10" max="90" step="5" value={form.split}
                  onChange={(e) => setForm({ ...form, split: Number(e.target.value) })} />
              </div>
            </>
          )}

          <div className="space-y-2">
            <Label className="flex items-center gap-2"><Filter className="h-3.5 w-3.5" /> Segment (optional)</Label>
            <Select value={form.segment_id || "__none"} onValueChange={(v) => setForm({ ...form, segment_id: v === "__none" ? "" : v })}>
              <SelectTrigger><SelectValue placeholder="No saved segment" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="__none">No saved segment</SelectItem>
                {segments.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2"><Label>Or filter by tag</Label>
            <Input value={form.tag} onChange={(e) => setForm({ ...form, tag: e.target.value, segment_id: "" })} placeholder="vip" disabled={!!form.segment_id} />
          </div>
          <div className="space-y-2"><Label>Pacing per minute</Label>
            <Input type="number" min="1" max="1000" value={form.pacing_per_minute}
              onChange={(e) => setForm({ ...form, pacing_per_minute: e.target.value })} />
          </div>

          <div className="rounded-md border bg-card/40 p-3 text-xs">
            <p className="font-medium">Audience preview</p>
            <p className="mt-1 text-muted-foreground">
              {audience.label} — {audience.eligible} eligible · {audience.skipped > 0 && (
                <span className="inline-flex items-center gap-1 text-destructive">
                  <CircleSlash className="h-3 w-3" /> {audience.skipped} opted-out skipped
                </span>
              )}
            </p>
          </div>

          <Button size="sm" onClick={create}><Rocket className="mr-2 h-4 w-4" /> Create campaign</Button>
        </CardContent>
      </Card>

      <Card className="rounded-lg">
        <CardHeader><CardTitle>Campaigns</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {(data.campaigns.data || []).map((c) => {
            const progress = c.total_count ? Math.round(((c.sent_count + c.failed_count) / c.total_count) * 100) : 0;
            const isAB = Array.isArray(c.variants) && c.variants.length === 2;
            return (
              <div key={c.id} className="rounded-lg border p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="flex items-center gap-2 font-semibold">
                      {c.name}
                      {isAB && <span className="inline-flex items-center gap-1 rounded bg-primary/10 px-1.5 py-0.5 text-[10px] text-primary"><FlaskConical className="h-2.5 w-2.5" /> A/B</span>}
                    </p>
                    <p className="text-sm text-muted-foreground">{c.wa_templates?.name || "Template"} · {c.total_count} recipients</p>
                  </div>
                  <StatusBadge status={c.status} />
                </div>
                <Progress value={progress} className="mt-4" />
                <div className="mt-3 flex items-center justify-between gap-2">
                  <div className="grid grid-cols-4 gap-2 text-[10px] text-muted-foreground uppercase font-bold tracking-tight flex-1">
                    <span>Sent {c.sent_count}</span>
                    <span>Delivered {c.delivered_count}</span>
                    <span>Read {c.read_count}</span>
                    <span>Failed {c.failed_count}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {c.status === "paused" || c.status === "draft" ? (
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-green-500" onClick={async () => { await startCampaign(c.id); data.refetchAll(); toast.success("Campaign started"); }}>
                        <Play className="h-3.5 w-3.5" />
                      </Button>
                    ) : c.status === "running" ? (
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-amber-500" onClick={async () => { await pauseCampaign(c.id); data.refetchAll(); toast.success("Campaign paused"); }}>
                        <Pause className="h-3.5 w-3.5" />
                      </Button>
                    ) : null}
                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-destructive" onClick={async () => { if (confirm("Delete campaign?")) { await deleteCampaign(c.id); data.refetchAll(); toast.success("Campaign deleted"); } }}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
                {isAB && <ABBreakdown campaignId={c.id} variants={c.variants} />}
              </div>
            );
          })}
          {!(data.campaigns.data || []).length && <div className="py-10 text-center text-muted-foreground">No campaigns yet.</div>}
        </CardContent>
      </Card>
    </div>
  );
}

function ABBreakdown({ campaignId, variants }) {
  const [stats, setStats] = useState(null);
  const load = async () => {
    const { data } = await supabase
      .from("wa_campaign_recipients")
      .select("variant, status")
      .eq("campaign_id", campaignId);
    const buckets = { A: { sent: 0, delivered: 0, read: 0, failed: 0, total: 0 }, B: { sent: 0, delivered: 0, read: 0, failed: 0, total: 0 } };
    for (const r of data || []) {
      const v = r.variant === "B" ? "B" : "A";
      buckets[v].total += 1;
      const s = String(r.status || "").toLowerCase();
      if (s === "sent" || s === "delivered" || s === "read") buckets[v].sent += 1;
      if (s === "delivered" || s === "read") buckets[v].delivered += 1;
      if (s === "read") buckets[v].read += 1;
      if (s === "failed" || s === "error") buckets[v].failed += 1;
    }
    setStats(buckets);
  };
  return (
    <div className="mt-3 rounded-md border border-dashed bg-muted/30 p-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold">A/B variants</p>
        <Button size="sm" variant="ghost" className="h-6 text-[11px]" onClick={load}>Load stats</Button>
      </div>
      {stats && (
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          {["A", "B"].map((k) => {
            const s = stats[k];
            const dr = s.total ? Math.round((s.delivered / s.total) * 100) : 0;
            const rr = s.total ? Math.round((s.read / s.total) * 100) : 0;
            return (
              <div key={k} className="rounded border bg-card p-2 text-xs">
                <p className="font-semibold">Variant {k} <span className="text-muted-foreground">({s.total})</span></p>
                <p className="text-muted-foreground">Delivered: {dr}% · Read: {rr}% · Failed: {s.failed}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
