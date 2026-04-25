"use client";

import { useState, useEffect } from "react";
import { Check, KeyRound, Plus, RefreshCw, Star, Trash2, ShieldCheck, ShieldAlert, Sparkles, Phone, Send, UserCircle2, Zap, Webhook, AlertTriangle, CheckCircle2, Copy, Brain, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { supabase } from "@/lib/supabase";
import { cloudAction } from "../_lib/api";
import { StatusBadge } from "../_components/StatusBadge";
import { formatDate } from "../_lib/validators";
import { getTestNumbers, addTestNumber, removeTestNumber, isValidTestPhone } from "../_lib/testNumbers";
import { PRESET_MODELS, DEFAULT_CONFIG, loadAiConfig, saveAiConfig } from "../_lib/aiSettings";
import { useV2Data } from "../layout";

const empty = { display_name: "", phone_number: "", phone_number_id: "", waba_id: "", access_token: "" };

function HealthBadge({ account }) {
  const quality = String(account.quality_rating || "").toUpperCase();
  const issues = [];
  if (!account.last_verified_at) issues.push("Never verified — run Test & Preview");
  if (!account.verified_name) issues.push("No verified business name from Meta");
  if (quality && quality !== "GREEN" && quality !== "UNKNOWN") issues.push(`Quality rating: ${quality}`);
  const healthy = issues.length === 0;
  return (
    <div className="flex flex-col items-end gap-1">
      <span
        className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-semibold ring-1 ring-inset ${
          healthy ? "bg-green-500/15 text-green-500 ring-green-500/30" : "bg-yellow-500/15 text-yellow-500 ring-yellow-500/30"
        }`}
      >
        {healthy ? <ShieldCheck className="h-3.5 w-3.5" /> : <ShieldAlert className="h-3.5 w-3.5" />}
        {healthy ? "Healthy" : "Needs attention"}
      </span>
      {!healthy && (
        <ul className="max-w-[16rem] space-y-0.5 text-right text-[11px] text-muted-foreground">
          {issues.map((i) => <li key={i}>• {i}</li>)}
        </ul>
      )}
    </div>
  );
}

function AiSettingsCard() {
  const [cfg, setCfg] = useState(DEFAULT_CONFIG);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [newKey, setNewKey] = useState("");

  useEffect(() => {
    (async () => {
      try { setCfg(await loadAiConfig()); }
      catch (e) { toast.error(e.message || "Failed to load AI settings"); }
      finally { setLoading(false); }
    })();
  }, []);

  const update = (patch) => setCfg((prev) => ({ ...prev, ...patch }));

  const persist = async (extra = {}) => {
    setSaving(true);
    try {
      const payload = { ...cfg, ...extra };
      if (typeof extra.custom_api_key !== "string" && newKey.trim()) {
        payload.custom_api_key = newKey.trim();
      }
      const next = await saveAiConfig(payload);
      setCfg(next);
      setNewKey("");
      toast.success("AI settings saved");
      return next;
    } catch (e) {
      toast.error(e.message || "Failed to save AI settings");
      throw e;
    } finally {
      setSaving(false);
    }
  };

  const clearKey = async () => {
    await persist({ custom_api_key: "" });
  };

  const runTest = async () => {
    if (cfg.provider === "custom") {
      if (!cfg.custom_model.trim()) return toast.error("Model name is required");
      if (!cfg.custom_base_url.trim()) return toast.error("Base URL is required");
      if (!cfg.has_custom_api_key && !newKey.trim()) return toast.error("API key is required");
    }
    try { await persist(); } catch { return; }
    setTesting(true);
    try {
      const { data: result, error } = await supabase.functions.invoke("wa-ai-assist", {
        body: { action: "ping" },
      });
      if (error) throw new Error(error.message);
      if (result?.error) throw new Error(result.error);
      toast.success(`Connected (${result.provider}/${result.model})`);
    } catch (e) {
      toast.error(e.message || "AI test failed");
    } finally {
      setTesting(false);
    }
  };

  return (
    <Card className="rounded-md border-border/60 bg-card shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Brain className="h-5 w-5" /> AI provider</CardTitle>
        <p className="mt-1 text-sm text-muted-foreground">
          Choose between built-in AI (no key needed) or bring your own model & API key.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : (
          <Tabs value={cfg.provider} onValueChange={(v) => update({ provider: v })}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="lovable">Built-in</TabsTrigger>
              <TabsTrigger value="custom">Custom model + key</TabsTrigger>
            </TabsList>

            <TabsContent value="lovable" className="space-y-3 pt-3">
              <div className="space-y-2">
                <Label>Gemini model</Label>
                <Select value={cfg.model} onValueChange={(v) => update({ model: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {PRESET_MODELS.map((m) => <SelectItem key={m.id} value={m.id}>{m.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <p className="rounded-md border border-border/60 bg-muted/20 p-3 text-xs text-muted-foreground">
                No API key needed. Requests run through our AI Gateway.
              </p>
            </TabsContent>

            <TabsContent value="custom" className="space-y-3 pt-3">
              <div className="space-y-2">
                <Label>Model name *</Label>
                <Input
                  value={cfg.custom_model}
                  onChange={(e) => update({ custom_model: e.target.value })}
                  placeholder="e.g. gemini-1.5-flash, gpt-4o-mini"
                />
              </div>
              <div className="space-y-2">
                <Label>Base URL *</Label>
                <Input
                  value={cfg.custom_base_url}
                  onChange={(e) => update({ custom_base_url: e.target.value })}
                  placeholder="https://generativelanguage.googleapis.com/v1beta/openai"
                />
              </div>
              <div className="space-y-2">
                <Label>API key {cfg.has_custom_api_key ? "" : "*"}</Label>
                {cfg.has_custom_api_key && (
                  <div className="flex items-center justify-between rounded-md border border-green-500/30 bg-green-500/5 px-3 py-2 text-xs mb-2">
                    <span className="text-muted-foreground">
                      Saved key: <span className="font-mono text-foreground">{cfg.custom_api_key_preview || "••••••••"}</span>
                    </span>
                    <Button type="button" variant="ghost" size="sm" onClick={clearKey} disabled={saving} className="h-6">
                      <Trash2 className="mr-1 h-3.5 w-3.5" /> Clear
                    </Button>
                  </div>
                )}
                <div className="relative">
                  <Input
                    type={showKey ? "text" : "password"}
                    value={newKey}
                    onChange={(e) => setNewKey(e.target.value)}
                    placeholder={cfg.has_custom_api_key ? "Replace current key..." : "sk-... or AIza..."}
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowKey((v) => !v)}
                    className="absolute right-1 top-1 h-8 w-8 p-0"
                  >
                    {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        )}

        <div className="flex justify-end gap-2">
          <Button size="sm" variant="outline" onClick={() => persist()} disabled={saving || loading}>
            {saving ? "Saving…" : "Save"}
          </Button>
          <Button size="sm" onClick={runTest} disabled={testing || saving || loading}>
            <Sparkles className="mr-2 h-4 w-4" /> {testing ? "Testing..." : "Save & Test"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function AssigneesCard({ data }) {
  const list = data.assignees?.data || [];
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const add = async () => {
    if (!name.trim()) return toast.error("Name is required");
    const { error } = await supabase.from("wa_assignees").insert({ name: name.trim(), email: email.trim() || null });
    if (error) return toast.error(error.message);
    setName(""); setEmail(""); data.assignees.refetch();
    toast.success("Teammate added");
  };
  const remove = async (id) => {
    const { error } = await supabase.from("wa_assignees").delete().eq("id", id);
    if (error) return toast.error(error.message);
    data.assignees.refetch();
  };
  return (
    <Card className="rounded-md border-border/60 bg-card shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><UserCircle2 className="h-5 w-5" /> Teammates</CardTitle>
        <p className="mt-1 text-sm text-muted-foreground">Assign conversations to these team members.</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
          <div className="space-y-2"><Label>Name</Label><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Alex" /></div>
          <div className="space-y-2"><Label>Email (optional)</Label><Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="alex@company.com" /></div>
          <div className="flex items-end"><Button size="sm" variant="outline" onClick={add}><Plus className="mr-2 h-4 w-4" /> Add</Button></div>
        </div>
        {list.length > 0 && (
          <div className="space-y-2">
            {list.map((a) => (
              <div key={a.id} className="flex items-center justify-between rounded-md border border-border/60 bg-muted/20 px-3 py-2 text-sm">
                <div><span className="font-medium">{a.name}</span>{a.email && <span className="ml-2 text-xs text-muted-foreground">{a.email}</span>}</div>
                <Button size="sm" variant="ghost" onClick={() => remove(a.id)} className="h-7 w-7 text-destructive"><Trash2 className="h-4 w-4" /></Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function WebhookCard({ data }) {
  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const url = `${SUPABASE_URL}/functions/v1/wa-cloud-webhook`;
  const [verifyToken, setVerifyToken] = useState("wa-cloud-api");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);
  const events = (data.events?.data || []).slice(0, 5);

  const verify = async () => {
    setBusy(true);
    setResult(null);
    const challenge = `lov-${Math.random().toString(36).slice(2, 10)}`;
    const test = `${url}?hub.mode=subscribe&hub.verify_token=${encodeURIComponent(verifyToken)}&hub.challenge=${challenge}`;
    const start = Date.now();
    try {
      const res = await fetch(test, { method: "GET" });
      const body = await res.text();
      const ms = Date.now() - start;
      const ok = res.ok && body.trim() === challenge;
      setResult({ status: res.status, ok, body: body.slice(0, 200), ms, expected: challenge });
      if (ok) toast.success(`Webhook verified (${ms}ms)`);
      else toast.error(`Verification failed: HTTP ${res.status}`);
    } catch (e) {
      setResult({ status: 0, ok: false, body: e.message, ms: Date.now() - start });
      toast.error(e.message);
    } finally {
      setBusy(false);
    }
  };

  const copyUrl = async () => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Callback URL copied");
    } catch { toast.error("Copy failed"); }
  };

  return (
    <Card className="rounded-md border-border/60 bg-card shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Webhook className="h-5 w-5" /> Webhook</CardTitle>
        <p className="mt-1 text-sm text-muted-foreground">Subscribe to messages and message_status events in Meta.</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Callback URL</Label>
          <div className="flex gap-2">
            <code className="flex-1 overflow-auto rounded-md bg-muted p-2.5 text-xs text-foreground font-mono">{url}</code>
            <Button size="sm" variant="outline" onClick={copyUrl} className="shrink-0"><Copy className="h-4 w-4" /></Button>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-end">
          <div className="space-y-2">
            <Label>Verify token</Label>
            <Input value={verifyToken} onChange={(e) => setVerifyToken(e.target.value)} placeholder="wa-cloud-api" className="font-mono text-xs" />
          </div>
          <Button size="sm" onClick={verify} disabled={busy || !verifyToken.trim()}>
            <ShieldCheck className="mr-2 h-4 w-4" /> {busy ? "Verifying…" : "Verify endpoint"}
          </Button>
        </div>

        {result && (
          <div className={`rounded-md border p-3 text-sm ${result.ok ? "border-green-500/40 bg-green-500/5" : "border-red-500/40 bg-red-500/5"}`}>
            <div className="flex items-center justify-between font-medium">
              <span className="flex items-center gap-1.5">
                {result.ok ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <AlertTriangle className="h-4 w-4 text-red-500" />}
                HTTP {result.status} — {result.ok ? "Verified" : "Failed"}
              </span>
              <span className="text-xs text-muted-foreground">{result.ms}ms</span>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <Label className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Recent deliveries</Label>
          {events.length ? (
            <div className="space-y-1.5">
              {events.map((ev) => {
                const ok = ev.processed && !ev.processing_error;
                return (
                  <div key={ev.id} className="flex items-center justify-between gap-3 rounded-md border border-border/60 bg-muted/20 px-3 py-2 text-xs">
                    <div className="flex min-w-0 items-center gap-2">
                      {ok ? <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-green-500" /> : <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-red-500" />}
                      <span className="truncate font-medium">{ev.event_type}</span>
                    </div>
                    <span className="shrink-0 text-muted-foreground">{formatDate(ev.received_at)}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="rounded-md border border-dashed border-border/60 p-4 text-center text-xs text-muted-foreground">
              No events yet.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function QuickRepliesCard({ data }) {
  const list = data.quickReplies?.data || [];
  const [shortcut, setShortcut] = useState("");
  const [body, setBody] = useState("");
  const [category, setCategory] = useState("");
  const add = async () => {
    const sc = shortcut.trim().toLowerCase().replace(/[^a-z0-9_-]/g, "");
    if (!sc || !body.trim()) return toast.error("Shortcut and message are required");
    const { error } = await supabase.from("wa_quick_replies").insert({ shortcut: sc, body: body.trim(), category: category.trim() || null });
    if (error) return toast.error(error.message);
    setShortcut(""); setBody(""); setCategory("");
    data.quickReplies.refetch();
    toast.success(`/${sc} saved`);
  };
  const remove = async (id) => {
    const { error } = await supabase.from("wa_quick_replies").delete().eq("id", id);
    if (error) return toast.error(error.message);
    data.quickReplies.refetch();
  };
  return (
    <Card className="rounded-md border-border/60 bg-card shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Zap className="h-5 w-5" /> Quick replies</CardTitle>
        <p className="mt-1 text-sm text-muted-foreground">Canned responses for the Inbox. Use <kbd className="rounded border bg-muted px-1 text-[10px]">/</kbd> in composer.</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 md:grid-cols-[160px_1fr_160px_auto]">
          <div className="space-y-2"><Label>Shortcut</Label><Input value={shortcut} onChange={(e) => setShortcut(e.target.value)} placeholder="hello" /></div>
          <div className="space-y-2"><Label>Message</Label><Input value={body} onChange={(e) => setBody(e.target.value)} placeholder={`Hi {{name}}!`} /></div>
          <div className="space-y-2"><Label>Category</Label><Input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="greeting" /></div>
          <div className="flex items-end"><Button size="sm" variant="outline" onClick={add}><Plus className="mr-2 h-4 w-4" /> Add</Button></div>
        </div>
        {list.length > 0 && (
          <div className="space-y-2">
            {list.map((r) => (
              <div key={r.id} className="flex items-start justify-between gap-3 rounded-md border border-border/60 bg-muted/20 px-3 py-2 text-sm">
                <div className="min-w-0 flex-1">
                  <p className="font-mono text-xs font-semibold text-primary">/{r.shortcut} {r.category && <span className="ml-2 rounded bg-muted px-1 text-[10px] text-muted-foreground">{r.category}</span>}</p>
                  <p className="mt-1 truncate text-xs text-muted-foreground">{r.body}</p>
                </div>
                <Button size="sm" variant="ghost" onClick={() => remove(r.id)} className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function SettingsPage() {
  const data = useV2Data();
  const [form, setForm] = useState(empty);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [testNumbers, setTestNumbers] = useState([]);
  const [newLabel, setNewLabel] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [quickTo, setQuickTo] = useState("");
  const [testMessage, setTestMessage] = useState("Hello from WA Cloud 👋");
  const [sendingTest, setSendingTest] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const list = await getTestNumbers();
        setTestNumbers(list);
        if (list.length) setQuickTo(list[0].phone);
      } catch (e) { toast.error(e.message || "Failed to load test numbers"); }
    })();
  }, []);

  const addNumber = async () => {
    if (!isValidTestPhone(newPhone)) return toast.error("Enter valid phone with country code");
    try {
      const next = await addTestNumber(newLabel.trim(), newPhone.trim());
      setTestNumbers(next);
      if (!quickTo) setQuickTo(newPhone.trim());
      setNewLabel(""); setNewPhone("");
      toast.success("Saved");
    } catch (e) { toast.error(e.message); }
  };

  const deleteNumber = async (phone) => {
    try {
      const next = await removeTestNumber(phone);
      setTestNumbers(next);
      if (quickTo === phone) setQuickTo(next[0]?.phone || "");
    } catch (e) { toast.error(e.message); }
  };

  const sendTestMessage = async () => {
    if (!quickTo) return toast.error("Select test number");
    setSendingTest(true);
    try {
      await cloudAction("send_message", { to: quickTo, kind: "text", body: testMessage });
      toast.success("Sent");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSendingTest(false);
    }
  };

  const reset = () => { setForm(empty); setTestResult(null); };

  const testPreview = async () => {
    if (!form.phone_number_id.trim() || !form.access_token.trim()) return toast.error("Phone ID and Token required");
    setTesting(true); setTestResult(null);
    try {
      const result = await cloudAction("test_account", {
        phone_number_id: form.phone_number_id.trim(),
        waba_id: form.waba_id.trim(),
        access_token: form.access_token.trim(),
      });
      setTestResult(result);
      toast.success("Success");
    } catch (error) {
      setTestResult({ error: error.message });
      toast.error(error.message);
    } finally {
      setTesting(false);
    }
  };

  const saveAccount = async (event) => {
    event.preventDefault();
    setBusy(true);
    try {
      await cloudAction("save_account", form);
      toast.success("Added");
      reset(); setOpen(false); data.refetchAll();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setBusy(false);
    }
  };

  const setDefault = async (number) => {
    const { error } = await supabase.rpc("set_default_wa_phone_number", { _phone_number_uuid: number.id });
    if (error) return toast.error(error.message);
    toast.success("Default set");
    data.refetchAll();
  };

  const remove = async (number) => {
    if (!confirm(`Remove ${number.display_name}?`)) return;
    const { error } = await supabase.from("wa_phone_numbers").delete().eq("id", number.id);
    if (error) return toast.error(error.message);
    toast.success("Removed");
    data.refetchAll();
  };

  const sync = async (number) => {
    setBusy(true);
    try {
      const result = await cloudAction("sync_templates", { account_id: number.id });
      toast.success(`Synced ${result.count || 0} templates`);
      data.refetchAll();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6 pb-8">
      <Card className="rounded-md border-border/60 bg-card shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <div>
            <CardTitle>WhatsApp Cloud accounts</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">Manage your Meta WhatsApp accounts.</p>
          </div>
          <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) reset(); }}>
            <DialogTrigger asChild>
              <Button size="sm"><Plus className="mr-2 h-4 w-4" /> Add account</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl">
              <DialogHeader><DialogTitle>Add account</DialogTitle></DialogHeader>
              <form onSubmit={saveAccount} className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2"><Label>Name</Label><Input value={form.display_name} onChange={(e) => setForm({ ...form, display_name: e.target.value })} placeholder="Support" /></div>
                <div className="space-y-2"><Label>Phone ID</Label><Input value={form.phone_number_id} onChange={(e) => setForm({ ...form, phone_number_id: e.target.value })} /></div>
                <div className="space-y-2"><Label>WABA ID</Label><Input value={form.waba_id} onChange={(e) => setForm({ ...form, waba_id: e.target.value })} /></div>
                <div className="space-y-2"><Label>Access token</Label><Input type="password" value={form.access_token} onChange={(e) => setForm({ ...form, access_token: e.target.value })} /></div>

                <div className="md:col-span-2 flex items-center justify-between rounded-lg border border-border/60 bg-muted/20 p-3">
                  <div className="text-xs text-muted-foreground">Fetch details from Meta before saving.</div>
                  <Button size="sm" type="button" variant="outline" onClick={testPreview} disabled={testing} className="shrink-0">
                    <Sparkles className="mr-2 h-4 w-4" /> {testing ? "Testing..." : "Test & Preview"}
                  </Button>
                </div>

                {testResult && !testResult.error && (
                  <div className="md:col-span-2 grid gap-3 rounded-lg border border-green-500/30 bg-green-500/5 p-4 md:grid-cols-2 text-sm">
                    <div><p className="text-[10px] text-muted-foreground uppercase font-bold">Number</p><p>{testResult.meta?.display_phone_number || "—"}</p></div>
                    <div><p className="text-[10px] text-muted-foreground uppercase font-bold">Name</p><p>{testResult.meta?.verified_name || "—"}</p></div>
                  </div>
                )}

                <div className="md:col-span-2 flex justify-end gap-2">
                  <Button size="sm" type="submit" disabled={busy}>{busy ? "Saving..." : "Save account"}</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent className="space-y-4">
          {(data.phoneNumbers.data || []).map((number) => (
            <div key={number.id} className="grid gap-4 rounded-md border border-border/60 bg-muted/20 p-4 lg:grid-cols-[1fr_auto]">
              <div className="grid gap-3 md:grid-cols-4 items-center">
                <div className="md:col-span-2">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-sm">{number.display_name}</p>
                    {number.is_default && <Badge variant="outline" className="text-[10px] h-4">Default</Badge>}
                  </div>
                  <p className="text-xs text-muted-foreground font-mono">{number.phone_number}</p>
                </div>
                <div><StatusBadge status={number.quality_rating || "unknown"} /></div>
                <div className="flex justify-start md:justify-end"><HealthBadge account={number} /></div>
              </div>
              <div className="flex items-center gap-2 flex-wrap lg:justify-end">
                <Button variant="outline" size="sm" onClick={() => setDefault(number)} disabled={number.is_default} className="h-7 text-xs">Default</Button>
                <Button variant="outline" size="sm" onClick={() => sync(number)} disabled={busy} className="h-7 text-xs">Sync</Button>
                <Button variant="ghost" size="sm" onClick={() => remove(number)} className="h-7 w-7 p-0 text-destructive"><Trash2 className="h-4 w-4" /></Button>
              </div>
            </div>
          ))}
          {!(data.phoneNumbers.data || []).length && (
            <div className="rounded-md border border-dashed border-border/60 p-8 text-center text-muted-foreground text-sm">
              <KeyRound className="mx-auto mb-3 h-8 w-8" /> No accounts added yet.
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="rounded-md border-border/60 bg-card shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Phone className="h-5 w-5" /> Test numbers</CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">Quickly send test messages to these recipients.</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
            <div className="space-y-2"><Label>Label</Label><Input value={newLabel} onChange={(e) => setNewLabel(e.target.value)} placeholder="Personal" /></div>
            <div className="space-y-2"><Label>Phone</Label><Input value={newPhone} onChange={(e) => setNewPhone(e.target.value)} placeholder="+91..." /></div>
            <div className="flex items-end"><Button size="sm" variant="outline" onClick={addNumber} className="h-10">Add</Button></div>
          </div>

          <div className="grid gap-3 rounded-md border border-border/60 bg-muted/20 p-3 md:grid-cols-[200px_1fr_auto]">
            <Select value={quickTo} onValueChange={setQuickTo}>
              <SelectTrigger className="h-10"><SelectValue placeholder="Pick number" /></SelectTrigger>
              <SelectContent>
                {testNumbers.map((n) => <SelectItem key={n.phone} value={n.phone}>{n.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <Input value={testMessage} onChange={(e) => setTestMessage(e.target.value)} className="h-10" />
            <Button size="sm" onClick={sendTestMessage} disabled={sendingTest || !quickTo} className="h-10">
              <Send className="mr-2 h-4 w-4" /> Send
            </Button>
          </div>
        </CardContent>
      </Card>

      <AiSettingsCard />
      <AssigneesCard data={data} />
      <QuickRepliesCard data={data} />
      <WebhookCard data={data} />
    </div>
  );
}
