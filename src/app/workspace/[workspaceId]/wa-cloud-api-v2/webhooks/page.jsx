"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, Trash2, Send, Webhook as WebhookIcon, Power, Loader2, Check, AlertCircle, Clock, Pencil } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/lib/supabase";
import { formatDate } from "../_lib/validators";

const EVENT_OPTIONS = [
  { id: "message.received", label: "Message received" },
  { id: "message.sent", label: "Message sent" },
  { id: "message.delivered", label: "Message delivered" },
  { id: "message.read", label: "Message read" },
  { id: "message.failed", label: "Message failed" },
  { id: "contact.created", label: "Contact created" },
  { id: "campaign.completed", label: "Campaign completed" },
];

function genSecret() {
  const arr = new Uint8Array(24);
  crypto.getRandomValues(arr);
  return Array.from(arr).map((b) => b.toString(16).padStart(2, "0")).join("");
}

export default function WebhooksPage() {
  const [hooks, setHooks] = useState([]);
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: "", url: "", secret: "", events: [], enabled: true });
  const [testingId, setTestingId] = useState(null);
  const [activeHookId, setActiveHookId] = useState(null);

  const load = async () => {
    setLoading(true);
    const [{ data: h }, { data: d }] = await Promise.all([
      supabase.from("wa_outbound_webhooks").select("*").order("created_at", { ascending: false }),
      supabase.from("wa_outbound_webhook_deliveries").select("*").order("created_at", { ascending: false }).limit(80),
    ]);
    setHooks(h || []);
    setDeliveries(d || []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const openAdd = () => { setEditing(null); setForm({ name: "", url: "", secret: genSecret(), events: ["message.received"], enabled: true }); setOpen(true); };
  const openEdit = (h) => { setEditing(h); setForm({ name: h.name, url: h.url, secret: h.secret, events: h.events || [], enabled: h.enabled }); setOpen(true); };

  const save = async () => {
    if (!form.name.trim() || !form.url.trim()) return toast.error("Name and URL are required");
    const payload = { name: form.name.trim(), url: form.url.trim(), secret: form.secret, events: form.events, enabled: form.enabled };
    const { error } = editing
      ? await supabase.from("wa_outbound_webhooks").update(payload).eq("id", editing.id)
      : await supabase.from("wa_outbound_webhooks").insert(payload);
    if (error) return toast.error(error.message);
    toast.success(editing ? "Updated" : "Added");
    setOpen(false);
    load();
  };

  const remove = async (h) => {
    if (!confirm(`Delete "${h.name}"?`)) return;
    await supabase.from("wa_outbound_webhooks").delete().eq("id", h.id);
    toast.success("Deleted");
    load();
  };

  const toggleEnabled = async (h) => {
    await supabase.from("wa_outbound_webhooks").update({ enabled: !h.enabled }).eq("id", h.id);
    load();
  };

  const sendTest = async (h) => {
    setTestingId(h.id);
    try {
      const { data, error } = await supabase.functions.invoke("wa-webhook-dispatch", {
        body: {
          event_type: "test.ping",
          webhook_id: h.id,
          payload: { hello: "world", sent_at: new Date().toISOString() },
        },
      });
      if (error) throw new Error(error.message);
      toast.success("Test sent");
      load();
    } catch (e) { toast.error(e.message); }
    finally { setTestingId(null); }
  };

  const visibleDeliveries = useMemo(
    () => activeHookId ? deliveries.filter((d) => d.webhook_id === activeHookId) : deliveries,
    [deliveries, activeHookId]
  );

  return (
    <div className="space-y-6">
      <Card className="rounded-md border-border/60 bg-card shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between py-4 border-b border-border/60">
          <div>
            <CardTitle className="flex items-center gap-2 font-bold"><WebhookIcon className="h-5 w-5" /> Webhooks Out</CardTitle>
            <p className="text-xs text-muted-foreground font-medium">Stream events to your own external systems.</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button size="sm" onClick={openAdd}><Plus className="mr-2 h-4 w-4" /> Add Webhook</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>{editing ? "Edit Webhook" : "Add Webhook"}</DialogTitle></DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2"><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Zapier" /></div>
                <div className="space-y-2"><Label>Endpoint URL</Label><Input value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} placeholder="https://..." /></div>
                <div className="space-y-2">
                  <Label>Secret</Label>
                  <Input value={form.secret} onChange={(e) => setForm({ ...form, secret: e.target.value })} className="font-mono text-xs" />
                </div>
                <div className="space-y-2">
                  <Label>Events</Label>
                  <div className="grid grid-cols-2 gap-2 rounded-md border border-border/60 p-3 bg-muted/20">
                    {EVENT_OPTIONS.map((evt) => (
                      <label key={evt.id} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={form.events.includes(evt.id)}
                          onChange={() => setForm(s => ({ ...s, events: s.events.includes(evt.id) ? s.events.filter(e => e !== evt.id) : [...s.events, evt.id] }))}
                          className="h-3.5 w-3.5 accent-primary"
                        />
                        <span className="text-[10px] font-bold uppercase tracking-tight">{evt.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 border border-border/60 rounded-md">
                  <span className="text-sm font-bold">Enabled</span>
                  <Switch checked={form.enabled} onCheckedChange={v => setForm({ ...form, enabled: v })} />
                </div>
              </div>
              <DialogFooter><Button onClick={save} className="w-full">{editing ? "Update" : "Save"}</Button></DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-muted/50 border-b border-border/60">
                <tr className="text-left font-bold uppercase tracking-tighter text-muted-foreground">
                  <th className="p-4">Name</th><th>Endpoint</th><th>Last Delivery</th><th>Status</th><th className="pr-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {hooks.map((h) => (
                  <tr key={h.id} className={`hover:bg-muted/20 ${activeHookId === h.id ? "bg-primary/5" : ""}`}>
                    <td className="p-4"><button onClick={() => setActiveHookId(activeHookId === h.id ? null : h.id)} className="font-bold hover:text-primary">{h.name}</button></td>
                    <td className="font-mono text-[10px] text-muted-foreground max-w-[200px] truncate">{h.url}</td>
                    <td className="text-muted-foreground font-mono">{formatDate(h.last_delivery_at)}</td>
                    <td>
                      {h.last_status === "delivered" ? <Badge className="bg-green-500/15 text-green-500 h-4 text-[9px]">OK</Badge> : h.last_status === "failed" ? <Badge variant="destructive" className="h-4 text-[9px]">ERR</Badge> : <Badge variant="outline" className="h-4 text-[9px]">IDLE</Badge>}
                    </td>
                    <td className="pr-4 text-right space-x-1">
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => sendTest(h)} disabled={testingId === h.id}><Send className="h-3.5 w-3.5" /></Button>
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => openEdit(h)}><Pencil className="h-3.5 w-3.5" /></Button>
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-destructive" onClick={() => remove(h)}><Trash2 className="h-3.5 w-3.5" /></Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-md border-border/60 bg-card shadow-sm">
        <CardHeader className="py-4 border-b border-border/60">
          <CardTitle className="text-sm font-bold flex items-center justify-between">
            Recent Deliveries
            {activeHookId && <Button size="sm" variant="ghost" onClick={() => setActiveHookId(null)} className="h-6 text-[10px]">Show All</Button>}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-64">
            <div className="divide-y divide-border/60">
              {visibleDeliveries.map((d) => (
                <div key={d.id} className="flex items-center justify-between p-3 text-[10px] hover:bg-muted/20">
                  <div className="min-w-0 flex-1">
                    <p className="font-bold uppercase tracking-tight">{d.event_type} <span className="text-muted-foreground normal-case font-mono">→ {d.target_url}</span></p>
                    <p className="text-muted-foreground font-mono mt-0.5">{formatDate(d.created_at)} · {d.latency_ms}ms</p>
                  </div>
                  <Badge variant={d.status === "delivered" ? "secondary" : "destructive"} className="h-4 text-[9px] font-mono">{d.http_status || "ERR"}</Badge>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
