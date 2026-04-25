import { useEffect, useMemo, useState } from "react";
import { Plus, Trash2, Send, Webhook as WebhookIcon, Power, Loader2, Check, AlertCircle, Clock, Copy } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { formatDate } from "../lib/validators";

const EVENT_OPTIONS = [
  { id: "message.received", label: "Message received", description: "An inbound WhatsApp message arrived." },
  { id: "message.sent", label: "Message sent", description: "An outbound message was queued." },
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

export function Webhooks() {
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
    if (!/^https?:\/\//.test(form.url)) return toast.error("URL must start with http(s)://");
    if (!form.events.length) return toast.error("Pick at least one event");
    const payload = { name: form.name.trim(), url: form.url.trim(), secret: form.secret, events: form.events, enabled: form.enabled };
    const { error } = editing
      ? await supabase.from("wa_outbound_webhooks").update(payload).eq("id", editing.id)
      : await supabase.from("wa_outbound_webhooks").insert(payload);
    if (error) return toast.error(error.message);
    toast.success(editing ? "Webhook updated" : "Webhook added");
    setOpen(false);
    load();
  };

  const remove = async (h) => {
    if (!confirm(`Delete webhook "${h.name}"?`)) return;
    await supabase.from("wa_outbound_webhooks").delete().eq("id", h.id);
    toast.success("Webhook deleted");
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
      if (data?.error) throw new Error(data.error);
      toast.success("Test delivery sent");
      load();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setTestingId(null);
    }
  };

  const visibleDeliveries = useMemo(
    () => activeHookId ? deliveries.filter((d) => d.webhook_id === activeHookId) : deliveries,
    [deliveries, activeHookId]
  );

  const toggleEvent = (id) => setForm((s) => ({
    ...s,
    events: s.events.includes(id) ? s.events.filter((e) => e !== id) : [...s.events, id],
  }));

  return (
    <div className="space-y-4">
      <Card className="rounded-md">
        <CardHeader className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2"><WebhookIcon className="h-5 w-5" /> Outbound webhooks</CardTitle>
            <CardDescription>Push WhatsApp events to your CRM, Zapier, or any HTTPS endpoint. Each delivery is signed with HMAC-SHA256 (header <code>X-Webhook-Signature-256</code>).</CardDescription>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button size="sm" onClick={openAdd}><Plus className="mr-2 h-4 w-4" /> New webhook</Button></DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader><DialogTitle>{editing ? "Edit webhook" : "New webhook"}</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div className="space-y-1.5"><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="My CRM" /></div>
                <div className="space-y-1.5"><Label>Endpoint URL</Label><Input value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} placeholder="https://example.com/hooks/wa" /></div>
                <div className="space-y-1.5">
                  <Label>Signing secret</Label>
                  <div className="flex gap-2">
                    <Input className="font-mono text-xs" value={form.secret} onChange={(e) => setForm({ ...form, secret: e.target.value })} />
                    <Button type="button" size="sm" variant="outline" onClick={() => setForm({ ...form, secret: genSecret() })}>Regenerate</Button>
                  </div>
                  <p className="text-[11px] text-muted-foreground">Used to sign the JSON body. Verify on your side: <code>HMAC-SHA256(secret, raw_body)</code>.</p>
                </div>
                <div className="space-y-1.5">
                  <Label>Events</Label>
                  <div className="space-y-1 rounded-md border p-2">
                    {EVENT_OPTIONS.map((evt) => (
                      <label key={evt.id} className="flex items-center gap-2 rounded px-2 py-1 hover:bg-muted/50">
                        <input type="checkbox" checked={form.events.includes(evt.id)} onChange={() => toggleEvent(evt.id)} className="h-3.5 w-3.5" />
                        <div className="flex-1">
                          <p className="text-xs font-medium">{evt.label}</p>
                          {evt.description && <p className="text-[10px] text-muted-foreground">{evt.description}</p>}
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="flex items-center justify-between rounded-md border p-3">
                  <div><p className="text-sm font-medium">Enabled</p><p className="text-xs text-muted-foreground">Disabled webhooks won't receive deliveries.</p></div>
                  <Switch checked={form.enabled} onCheckedChange={(v) => setForm({ ...form, enabled: v })} />
                </div>
              </div>
              <DialogFooter><Button onClick={save}>{editing ? "Update" : "Create"}</Button></DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-10 text-center text-sm text-muted-foreground"><Loader2 className="mx-auto h-5 w-5 animate-spin" /></div>
          ) : !hooks.length ? (
            <div className="py-10 text-center text-sm text-muted-foreground">No webhooks yet — add one to start streaming events.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[820px] text-sm">
                <thead><tr className="border-b text-left text-muted-foreground"><th className="py-3">Name</th><th>Endpoint</th><th>Events</th><th>Last delivery</th><th>Status</th><th className="text-right">Actions</th></tr></thead>
                <tbody>{hooks.map((h) => (
                  <tr key={h.id} className={`border-b ${activeHookId === h.id ? "bg-muted/40" : ""}`}>
                    <td className="py-3"><button onClick={() => setActiveHookId(activeHookId === h.id ? null : h.id)} className="font-medium hover:text-primary">{h.name}</button></td>
                    <td className="max-w-[280px] truncate font-mono text-xs">{h.url}</td>
                    <td><div className="flex flex-wrap gap-1">{(h.events || []).map((e) => <Badge key={e} variant="secondary" className="text-[10px]">{e}</Badge>)}</div></td>
                    <td className="text-xs text-muted-foreground">{formatDate(h.last_delivery_at)}</td>
                    <td>{h.last_status === "delivered" ? <Badge className="bg-success/15 text-success" variant="secondary"><Check className="mr-1 h-3 w-3" />OK</Badge> : h.last_status === "failed" ? <Badge variant="destructive"><AlertCircle className="mr-1 h-3 w-3" />Failed</Badge> : <Badge variant="secondary" className="text-muted-foreground"><Clock className="mr-1 h-3 w-3" />Idle</Badge>}</td>
                    <td className="text-right">
                      <Button size="sm" variant="ghost" onClick={() => sendTest(h)} disabled={testingId === h.id} title="Send test ping">{testingId === h.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}</Button>
                      <Button size="sm" variant="ghost" onClick={() => toggleEnabled(h)} title={h.enabled ? "Disable" : "Enable"}><Power className={`h-4 w-4 ${h.enabled ? "text-success" : "text-muted-foreground"}`} /></Button>
                      <Button size="sm" variant="ghost" onClick={() => openEdit(h)}><Pencil /></Button>
                      <Button size="sm" variant="ghost" onClick={() => remove(h)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="rounded-md">
        <CardHeader>
          <CardTitle className="text-base">Recent deliveries {activeHookId && <Button size="sm" variant="ghost" onClick={() => setActiveHookId(null)}>Show all</Button>}</CardTitle>
          <CardDescription>Last 80 attempts across all webhooks. Click a webhook above to filter.</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-72">
            <div className="space-y-1">
              {visibleDeliveries.map((d) => (
                <div key={d.id} className="flex items-center justify-between gap-2 rounded border p-2 text-xs">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{d.event_type} <span className="text-muted-foreground">→ {d.target_url}</span></p>
                    <p className="text-[10px] text-muted-foreground">{formatDate(d.created_at)} · attempt {d.attempt_number} · {d.latency_ms ?? "—"}ms</p>
                    {d.error_message && <p className="text-[10px] text-destructive">{d.error_message}</p>}
                  </div>
                  {d.status === "delivered" ? <Badge className="bg-success/15 text-success" variant="secondary">{d.http_status || "OK"}</Badge> : <Badge variant="destructive">{d.http_status || "ERR"}</Badge>}
                </div>
              ))}
              {!visibleDeliveries.length && <p className="py-8 text-center text-xs text-muted-foreground">No deliveries yet.</p>}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}

// tiny pencil icon since we didn't import it above
function Pencil() { return <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5z"/></svg>; }
