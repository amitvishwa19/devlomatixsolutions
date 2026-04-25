import { useMemo, useState } from "react";
import { Activity, AlertTriangle, CheckCircle2, RefreshCw, Send, ShieldCheck, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { formatDate } from "../lib/validators";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const WEBHOOK_URL = `${SUPABASE_URL}/functions/v1/wa-cloud-webhook`;

const SAMPLES = {
  inbound_text: (phoneId) => ({
    object: "whatsapp_business_account",
    entry: [{
      id: "WABA_ID_123",
      changes: [{
        field: "messages",
        value: {
          messaging_product: "whatsapp",
          metadata: { display_phone_number: "15555555555", phone_number_id: phoneId || "PHONE_NUMBER_ID" },
          contacts: [{ profile: { name: "Test User" }, wa_id: "919876543210" }],
          messages: [{ from: "919876543210", id: `wamid.test.${Date.now()}`, timestamp: String(Math.floor(Date.now() / 1000)), text: { body: "Hello from the tester" }, type: "text" }],
        },
      }],
    }],
  }),
  delivery_status: (phoneId) => ({
    object: "whatsapp_business_account",
    entry: [{
      id: "WABA_ID_123",
      changes: [{
        field: "messages",
        value: {
          messaging_product: "whatsapp",
          metadata: { display_phone_number: "15555555555", phone_number_id: phoneId || "PHONE_NUMBER_ID" },
          statuses: [{ id: "wamid.outbound.example", status: "delivered", timestamp: String(Math.floor(Date.now() / 1000)), recipient_id: "919876543210" }],
        },
      }],
    }],
  }),
  stop_keyword: (phoneId) => ({
    object: "whatsapp_business_account",
    entry: [{
      id: "WABA_ID_123",
      changes: [{
        field: "messages",
        value: {
          messaging_product: "whatsapp",
          metadata: { display_phone_number: "15555555555", phone_number_id: phoneId || "PHONE_NUMBER_ID" },
          contacts: [{ profile: { name: "Test User" }, wa_id: "919876543210" }],
          messages: [{ from: "919876543210", id: `wamid.stop.${Date.now()}`, timestamp: String(Math.floor(Date.now() / 1000)), text: { body: "STOP" }, type: "text" }],
        },
      }],
    }],
  }),
};

function StatusPill({ event }) {
  if (event.event_type === "signature_rejected") {
    return <Badge variant="destructive" className="gap-1"><ShieldAlert className="h-3 w-3" /> signature</Badge>;
  }
  if (event.processing_error) {
    return <Badge variant="destructive" className="gap-1"><AlertTriangle className="h-3 w-3" /> error</Badge>;
  }
  if (event.processed) {
    return <Badge variant="secondary" className="gap-1"><CheckCircle2 className="h-3 w-3" /> processed</Badge>;
  }
  return <Badge variant="outline">queued</Badge>;
}

export function Events({ data }) {
  const events = data.events.data || [];
  const phoneNumbers = data.phoneNumbers.data || [];
  const [selected, setSelected] = useState(null);

  // Tester state
  const [sampleKey, setSampleKey] = useState("inbound_text");
  const [phoneId, setPhoneId] = useState(phoneNumbers.find((n) => n.is_default)?.phone_number_id || "");
  const [bodyText, setBodyText] = useState(() => JSON.stringify(SAMPLES.inbound_text(""), null, 2));
  const [signature, setSignature] = useState("");
  const [busy, setBusy] = useState(false);
  const [response, setResponse] = useState(null);

  const loadSample = (key) => {
    setSampleKey(key);
    setBodyText(JSON.stringify(SAMPLES[key](phoneId), null, 2));
    setResponse(null);
  };

  const fillPhoneId = (id) => {
    setPhoneId(id);
    try {
      const obj = JSON.parse(bodyText);
      const meta = obj?.entry?.[0]?.changes?.[0]?.value?.metadata;
      if (meta) { meta.phone_number_id = id; setBodyText(JSON.stringify(obj, null, 2)); }
    } catch (_) {}
  };

  const send = async () => {
    setBusy(true);
    setResponse(null);
    try {
      JSON.parse(bodyText); // validate
    } catch (e) {
      setBusy(false);
      return toast.error(`Invalid JSON: ${e.message}`);
    }
    try {
      const { data: session } = await supabase.auth.getSession();
      const token = session?.session?.access_token || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
      const headers = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
        "apikey": import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        "x-test-skip-signature": signature ? "0" : "1",
      };
      if (signature) headers["x-hub-signature-256"] = signature.startsWith("sha256=") ? signature : `sha256=${signature}`;
      const start = Date.now();
      const res = await fetch(WEBHOOK_URL, { method: "POST", headers, body: bodyText });
      const text = await res.text();
      let parsed;
      try { parsed = JSON.parse(text); } catch { parsed = text; }
      setResponse({ status: res.status, ok: res.ok, body: parsed, ms: Date.now() - start });
      if (res.ok) toast.success(`Webhook returned ${res.status}`);
      else toast.error(`Webhook returned ${res.status}`);
      setTimeout(() => data.events.refetch(), 600);
    } catch (err) {
      setResponse({ status: 0, ok: false, body: { error: err.message }, ms: 0 });
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_420px]">
      <Card className="rounded-md">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2"><Activity className="h-4 w-4" /> Webhook events</CardTitle>
          <Button size="sm" variant="ghost" onClick={() => data.events.refetch()}><RefreshCw className="mr-1.5 h-3.5 w-3.5" /> Refresh</Button>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 lg:grid-cols-[280px_1fr]">
            <ScrollArea className="h-[560px] rounded-md border">
              <ul className="divide-y">
                {events.map((ev) => (
                  <li key={ev.id}>
                    <button
                      onClick={() => setSelected(ev)}
                      className={`flex w-full flex-col items-start gap-1 px-3 py-2 text-left text-xs hover:bg-muted/50 ${selected?.id === ev.id ? "bg-muted" : ""}`}
                    >
                      <div className="flex w-full items-center justify-between gap-2">
                        <span className="truncate font-medium">{ev.event_type}</span>
                        <StatusPill event={ev} />
                      </div>
                      <span className="text-[10px] text-muted-foreground">{formatDate(ev.received_at)}</span>
                      {ev.processing_error && <span className="line-clamp-1 text-[10px] text-destructive">{ev.processing_error}</span>}
                    </button>
                  </li>
                ))}
                {!events.length && <li className="p-6 text-center text-xs text-muted-foreground">No events yet.</li>}
              </ul>
            </ScrollArea>

            <div className="rounded-md border bg-card/40 p-3">
              {selected ? (
                <>
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <span className="font-medium">{selected.event_type}</span>
                    <StatusPill event={selected} />
                    <span className="text-xs text-muted-foreground">{formatDate(selected.received_at)}</span>
                  </div>
                  {selected.processing_error && (
                    <div className="mb-2 rounded border border-destructive/40 bg-destructive/5 p-2 text-xs text-destructive">{selected.processing_error}</div>
                  )}
                  <ScrollArea className="h-[460px]">
                    <pre className="whitespace-pre-wrap break-all text-[11px] leading-relaxed">{JSON.stringify(selected.payload, null, 2)}</pre>
                  </ScrollArea>
                </>
              ) : (
                <p className="py-20 text-center text-sm text-muted-foreground">Select an event to inspect its payload.</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Send className="h-4 w-4" /> Webhook tester</CardTitle>
          <p className="text-xs text-muted-foreground break-all">POST → {WEBHOOK_URL}</p>
        </CardHeader>
        <CardContent className="space-y-3">
          <Tabs value={sampleKey} onValueChange={loadSample}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="inbound_text">Inbound</TabsTrigger>
              <TabsTrigger value="delivery_status">Status</TabsTrigger>
              <TabsTrigger value="stop_keyword">STOP</TabsTrigger>
            </TabsList>
            <TabsContent value={sampleKey} className="mt-3 space-y-3">
              <div className="space-y-1.5">
                <Label>Target phone_number_id</Label>
                <Select value={phoneId || "__custom"} onValueChange={(v) => fillPhoneId(v === "__custom" ? "" : v)}>
                  <SelectTrigger><SelectValue placeholder="Pick configured account" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__custom">Custom / placeholder</SelectItem>
                    {phoneNumbers.map((p) => <SelectItem key={p.id} value={p.phone_number_id}>{p.display_name} · {p.phone_number_id}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Payload</Label>
                <Textarea rows={12} className="font-mono text-[11px]" value={bodyText} onChange={(e) => setBodyText(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label className="flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5" /> X-Hub-Signature-256 (optional)</Label>
                <Input value={signature} onChange={(e) => setSignature(e.target.value)} placeholder="Leave empty to bypass (auth is required for bypass)" className="font-mono text-xs" />
                <p className="text-[10px] text-muted-foreground">If set, the webhook will validate this against META_WA_APP_SECRET.</p>
              </div>
              <Button size="sm" onClick={send} disabled={busy} className="w-full">
                <Send className="mr-2 h-4 w-4" /> {busy ? "Sending…" : "Send to webhook"}
              </Button>

              {response && (
                <div className={`rounded-md border p-2 text-xs ${response.ok ? "border-emerald-500/30 bg-emerald-500/5" : "border-destructive/40 bg-destructive/5"}`}>
                  <div className="flex items-center justify-between font-medium">
                    <span>HTTP {response.status} {response.ok ? "OK" : "FAIL"}</span>
                    <span className="text-muted-foreground">{response.ms}ms</span>
                  </div>
                  <pre className="mt-2 max-h-40 overflow-auto whitespace-pre-wrap break-all text-[11px]">{typeof response.body === "string" ? response.body : JSON.stringify(response.body, null, 2)}</pre>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}