import { useState, useEffect } from "react";
import { Check, KeyRound, Plus, RefreshCw, Star, Trash2, ShieldCheck, ShieldAlert, Sparkles, Phone, Send, UserCircle2, Zap, Webhook, AlertTriangle, CheckCircle2, Copy } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { cloudAction } from "../lib/api";
import { StatusBadge } from "../components/StatusBadge";
import { formatDate } from "../lib/validators";
import { getTestNumbers, addTestNumber, removeTestNumber, isValidTestPhone } from "../lib/testNumbers";
import { PRESET_MODELS, DEFAULT_CONFIG, loadAiConfig, saveAiConfig } from "../lib/aiSettings";
import { Brain, Eye, EyeOff } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

// === Local server-function alternatives (uncomment to switch from edge → local) ===
// import * as settingsFn from "../functions/settings";
// import * as templatesFn from "../functions/templates";
// import * as sendFn from "../functions/send";
// =================================================================================


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
          healthy ? "bg-success/15 text-success ring-success/30" : "bg-warning/15 text-warning ring-warning/30"
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

export function Settings({ data }) {
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
    if (!isValidTestPhone(newPhone)) return toast.error("Enter a valid phone number with country code");
    try {
      const next = await addTestNumber(newLabel.trim(), newPhone.trim());
      setTestNumbers(next);
      if (!quickTo) setQuickTo(newPhone.trim());
      setNewLabel(""); setNewPhone("");
      toast.success("Test number saved");
    } catch (e) { toast.error(e.message || "Failed to save test number"); }
  };

  const deleteNumber = async (phone) => {
    try {
      const next = await removeTestNumber(phone);
      setTestNumbers(next);
      if (quickTo === phone) setQuickTo(next[0]?.phone || "");
    } catch (e) { toast.error(e.message || "Failed to remove test number"); }
  };

  const sendTestMessage = async () => {
    if (!quickTo) return toast.error("Select a test number");
    if (!testMessage.trim()) return toast.error("Message is required");
    setSendingTest(true);
    try {
      // LOCAL: await sendFn.sendMessage(/* same payload as edge call below */);
      await cloudAction("send_message", { to: quickTo, kind: "text", body: testMessage });
      toast.success("Test message sent");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSendingTest(false);
    }
  };

  const reset = () => { setForm(empty); setTestResult(null); };

  const testPreview = async () => {
    if (!form.phone_number_id.trim() || !form.access_token.trim()) {
      toast.error("Phone number ID and Access token are required to test");
      return;
    }
    setTesting(true);
    setTestResult(null);
    try {
      // LOCAL: await settingsFn.testAccount(/* same payload as edge call below */);
      const result = await cloudAction("test_account", {
        phone_number_id: form.phone_number_id.trim(),
        waba_id: form.waba_id.trim(),
        access_token: form.access_token.trim(),
      });
      setTestResult(result);
      toast.success("Connection successful");
    } catch (error) {
      setTestResult({ error: error.message });
      toast.error(error.message);
    } finally {
      setTesting(false);
    }
  };

  const saveAccount = async (event) => {
    event.preventDefault();
    if (!form.display_name.trim() || !form.phone_number_id.trim() || !form.waba_id.trim() || !form.access_token.trim()) {
      toast.error("Account name, Phone number ID, WABA ID and Access token are required");
      return;
    }
    setBusy(true);
    try {
      // LOCAL: await settingsFn.saveAccount(/* same payload as edge call below */);
      await cloudAction("save_account", form);
      toast.success("WhatsApp account added");
      reset();
      setOpen(false);
      data.refetchAll();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setBusy(false);
    }
  };

  const setDefault = async (number) => {
    const { error } = await supabase.rpc("set_default_wa_phone_number", { _phone_number_uuid: number.id });
    if (error) return toast.error(error.message);
    toast.success(`${number.display_name} is default`);
    data.refetchAll();
  };

  const remove = async (number) => {
    const { error } = await supabase.from("wa_phone_numbers").delete().eq("id", number.id);
    if (error) return toast.error(error.message);
    toast.success("Account removed");
    data.refetchAll();
  };

  const refresh = async (number) => {
    setBusy(true);
    try {
      // LOCAL: await settingsFn.refreshAccount(/* same payload as edge call below */);
      await cloudAction("refresh_account", { account_id: number.id });
      toast.success("Verification refreshed");
      data.refetchAll();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setBusy(false);
    }
  };

  const sync = async (number) => {
    setBusy(true);
    try {
      // LOCAL: await templatesFn.syncTemplates(/* same payload as edge call below */);
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
    <div className="space-y-6">
      <Card className="rounded-md border-border/60 bg-gradient-card shadow-card">
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <div>
            <CardTitle>WhatsApp Cloud accounts</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              Add multiple Meta accounts and choose one default. All actions run on the default account.
            </p>
          </div>
          <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) reset(); }}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-gradient-primary text-primary-foreground hover:opacity-90"><Plus className="mr-2 h-4 w-4" /> Add account</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl">
              <DialogHeader><DialogTitle>Add WhatsApp Cloud account</DialogTitle></DialogHeader>
              <form onSubmit={saveAccount} className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2"><Label>Account name *</Label><Input value={form.display_name} onChange={(e) => setForm({ ...form, display_name: e.target.value })} placeholder="Support India" maxLength={120} /></div>
                <div className="space-y-2"><Label>Phone number ID *</Label><Input value={form.phone_number_id} onChange={(e) => setForm({ ...form, phone_number_id: e.target.value })} maxLength={80} /></div>
                <div className="space-y-2"><Label>WhatsApp Business Account ID *</Label><Input value={form.waba_id} onChange={(e) => setForm({ ...form, waba_id: e.target.value })} maxLength={80} /></div>
                <div className="space-y-2"><Label>Access token *</Label><Input type="password" value={form.access_token} onChange={(e) => setForm({ ...form, access_token: e.target.value })} placeholder="EAAG..." /></div>

                <div className="md:col-span-2 flex items-center justify-between rounded-lg border border-border/60 bg-card/40 p-3">
                  <div className="text-xs text-muted-foreground">
                    Verify your credentials with Meta before saving — fetches the display phone number, quality rating, and verified business name.
                  </div>
                  <Button size="sm" type="button" variant="outline" onClick={testPreview} disabled={testing} className="ml-3 shrink-0">
                    <Sparkles className="mr-2 h-4 w-4" /> {testing ? "Testing..." : "Test & Preview"}
                  </Button>
                </div>

                {testResult && !testResult.error && (
                  <div className="md:col-span-2 grid gap-3 rounded-lg border border-success/30 bg-success/5 p-4 md:grid-cols-2">
                    <div>
                      <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Display phone number</p>
                      <p className="mt-1 font-mono text-sm">{testResult.meta?.display_phone_number || "—"}</p>
                    </div>
                    <div>
                      <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Verified name</p>
                      <p className="mt-1 text-sm font-medium">{testResult.meta?.verified_name || "—"}</p>
                    </div>
                    <div>
                      <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Quality rating</p>
                      <div className="mt-1"><StatusBadge status={testResult.meta?.quality_rating || "unknown"} /></div>
                    </div>
                    <div>
                      <p className="text-[11px] uppercase tracking-wider text-muted-foreground">WABA</p>
                      <p className="mt-1 text-sm">{testResult.waba?.name || "—"}</p>
                    </div>
                  </div>
                )}
                {testResult?.error && (
                  <div className="md:col-span-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
                    {testResult.error}
                  </div>
                )}

                <div className="md:col-span-2 flex justify-end gap-2">
                  <Button size="sm" type="button" variant="outline" onClick={() => { setOpen(false); reset(); }}>Cancel</Button>
                  <Button size="sm" type="submit" disabled={busy}>{busy ? "Saving..." : "Save account"}</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent className="space-y-4">
          {(data.phoneNumbers.data || []).map((number) => (
            <div key={number.id} className="grid gap-4 rounded-md border border-border/60 bg-card/40 p-4 lg:grid-cols-[1fr_auto]">
              <div className="grid gap-3 md:grid-cols-5">
                <div className="md:col-span-2">
                  <p className="font-semibold">{number.display_name}</p>
                  <p className="text-sm text-muted-foreground">{number.phone_number}</p>
                  {number.is_default && <Badge className="mt-1 rounded-md"><Star className="mr-1 h-3 w-3" /> Default</Badge>}
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Verified name</p>
                  <p className="mt-1 truncate text-sm">{number.verified_name || "—"}</p>
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Quality</p>
                  <div className="mt-1"><StatusBadge status={number.quality_rating || "unknown"} /></div>
                  <p className="mt-1 text-[11px] text-muted-foreground">Last verified: {formatDate(number.last_verified_at)}</p>
                </div>
                <div className="flex justify-start md:justify-end"><HealthBadge account={number} /></div>
              </div>
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-1">
                <div className="text-xs text-muted-foreground">
                  <p>Phone ID: <span className="font-mono">{number.phone_number_id}</span></p>
                  <p>WABA: <span className="font-mono">{number.waba_id}</span></p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => setDefault(number)} disabled={number.is_default}><Check className="mr-2 h-4 w-4" /> Default</Button>
                  <Button variant="outline" size="sm" onClick={() => refresh(number)} disabled={busy}><ShieldCheck className="mr-2 h-4 w-4" /> Refresh</Button>
                  <Button variant="outline" size="sm" onClick={() => sync(number)} disabled={busy}><RefreshCw className="mr-2 h-4 w-4" /> Sync</Button>
                  <Button variant="outline" size="sm" onClick={() => remove(number)}><Trash2 className="mr-2 h-4 w-4" /> Remove</Button>
                </div>
              </div>
            </div>
          ))}
          {!(data.phoneNumbers.data || []).length && (
            <div className="rounded-md border border-dashed p-8 text-center text-muted-foreground">
              <KeyRound className="mx-auto mb-3 h-8 w-8" /> No accounts yet. Add your access token, phone number ID, and WABA ID.
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="rounded-md border-border/60 bg-gradient-card shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Phone className="h-5 w-5" /> Test numbers</CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">Save reusable test recipients. They show up in template send dialogs alongside a custom number option.</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
            <div className="space-y-2"><Label>Label</Label><Input value={newLabel} onChange={(e) => setNewLabel(e.target.value)} placeholder="My phone" maxLength={40} /></div>
            <div className="space-y-2"><Label>Phone (with country code)</Label><Input value={newPhone} onChange={(e) => setNewPhone(e.target.value)} placeholder="+15551234567" /></div>
            <div className="flex items-end"><Button size="sm" variant="outline" onClick={addNumber}><Plus className="mr-2 h-4 w-4" /> Add</Button></div>
          </div>

          {testNumbers.length > 0 && (
            <div className="space-y-2">
              {testNumbers.map((n) => (
                <div key={n.phone} className="flex items-center justify-between rounded-md border border-border/60 bg-card/40 px-3 py-2 text-sm">
                  <div><span className="font-medium">{n.label}</span> <span className="ml-2 font-mono text-xs text-muted-foreground">{n.phone}</span></div>
                  <Button size="sm" variant="ghost" onClick={() => deleteNumber(n.phone)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              ))}
            </div>
          )}

          <div className="grid gap-3 rounded-md border border-border/60 bg-card/40 p-3 md:grid-cols-[220px_1fr_auto]">
            <div className="space-y-2">
              <Label>Send to</Label>
              <Select value={quickTo} onValueChange={setQuickTo}>
                <SelectTrigger><SelectValue placeholder="Pick a saved number" /></SelectTrigger>
                <SelectContent>
                  {testNumbers.map((n) => <SelectItem key={n.phone} value={n.phone}>{n.label} — {n.phone}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Quick text message</Label>
              <Input value={testMessage} onChange={(e) => setTestMessage(e.target.value)} maxLength={4096} />
            </div>
            <div className="flex items-end">
              <Button size="sm" onClick={sendTestMessage} disabled={sendingTest || !quickTo}>
                <Send className="mr-2 h-4 w-4" /> {sendingTest ? "Sending..." : "Send"}
              </Button>
            </div>
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

function AiSettingsCard() {
  const [cfg, setCfg] = useState(DEFAULT_CONFIG);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [newKey, setNewKey] = useState(""); // empty = keep existing key

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
      // Only forward `custom_api_key` if the user typed a new one (or explicitly cleared it).
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
    // Make sure the latest values (including any just-typed key) are persisted before testing
    try { await persist(); } catch { return; }
    setTesting(true);
    try {
      const { data: result, error } = await supabase.functions.invoke("wa-ai-assist", {
        body: { action: "ping" },
      });
      if (error) throw new Error(error.message);
      if (result?.error) throw new Error(result.error);
      toast.success(`Connected (${result.provider}/${result.model}) — replied "${(result.reply || "ok").slice(0, 40)}"`);
    } catch (e) {
      toast.error(e.message || "AI test failed");
    } finally {
      setTesting(false);
    }
  };

  return (
    <Card className="rounded-md border-border/60 bg-gradient-card shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Brain className="h-5 w-5" /> AI provider</CardTitle>
        <p className="mt-1 text-sm text-muted-foreground">
          Choose between built-in Lovable AI (no key needed) or bring your own model & API key.
          Settings are stored in the backend and shared across browsers. The API key is encrypted at rest and never returned to the browser.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : (
        <Tabs value={cfg.provider} onValueChange={(v) => update({ provider: v })}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="lovable">Built-in (Lovable AI)</TabsTrigger>
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
            <p className="rounded-md border border-border/60 bg-card/40 p-3 text-xs text-muted-foreground">
              No API key needed. Requests run through Lovable AI Gateway with your built-in monthly credits.
            </p>
          </TabsContent>

          <TabsContent value="custom" className="space-y-3 pt-3">
            <div className="space-y-2">
              <Label>Model name *</Label>
              <Input
                value={cfg.custom_model}
                onChange={(e) => update({ custom_model: e.target.value })}
                placeholder="e.g. gemini-2.5-flash, gpt-4o-mini, llama-3.1-70b"
                maxLength={120}
              />
            </div>
            <div className="space-y-2">
              <Label>Base URL *</Label>
              <Input
                value={cfg.custom_base_url}
                onChange={(e) => update({ custom_base_url: e.target.value })}
                placeholder="https://generativelanguage.googleapis.com/v1beta/openai"
                maxLength={300}
              />
              <p className="text-[11px] text-muted-foreground">
                OpenAI-compatible <code>/chat/completions</code> endpoint. Examples:
                <br />• Google Gemini: <code>https://generativelanguage.googleapis.com/v1beta/openai</code>
                <br />• OpenAI: <code>https://api.openai.com/v1</code>
                <br />• Groq: <code>https://api.groq.com/openai/v1</code>
                <br />• OpenRouter: <code>https://openrouter.ai/api/v1</code>
              </p>
            </div>
            <div className="space-y-2">
              <Label>API key {cfg.has_custom_api_key ? "" : "*"}</Label>
              {cfg.has_custom_api_key && (
                <div className="flex items-center justify-between rounded-md border border-success/30 bg-success/5 px-3 py-2 text-xs">
                  <span className="text-muted-foreground">
                    Saved key: <span className="font-mono text-foreground">{cfg.custom_api_key_preview || "••••••••"}</span>
                  </span>
                  <Button type="button" variant="ghost" size="sm" onClick={clearKey} disabled={saving}>
                    <Trash2 className="mr-1 h-3.5 w-3.5" /> Clear
                  </Button>
                </div>
              )}
              <div className="relative">
                <Input
                  type={showKey ? "text" : "password"}
                  value={newKey}
                  onChange={(e) => setNewKey(e.target.value)}
                  placeholder={cfg.has_custom_api_key ? "Enter new key to replace, or leave blank to keep current" : "sk-... or AIza..."}
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
              <p className="text-[11px] text-muted-foreground">
                Stored in the backend database. Never returned to the browser after saving — only a masked preview is shown.
              </p>
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
    <Card className="rounded-md border-border/60 bg-gradient-card shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><UserCircle2 className="h-5 w-5" /> Teammates</CardTitle>
        <p className="mt-1 text-sm text-muted-foreground">Names that show up in the conversation "Assign" dropdown. No login required.</p>
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
              <div key={a.id} className="flex items-center justify-between rounded-md border border-border/60 bg-card/40 px-3 py-2 text-sm">
                <div><span className="font-medium">{a.name}</span>{a.email && <span className="ml-2 text-xs text-muted-foreground">{a.email}</span>}</div>
                <Button size="sm" variant="ghost" onClick={() => remove(a.id)}><Trash2 className="h-4 w-4" /></Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function WebhookCard({ data }) {
  const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
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
    <Card className="rounded-md border-border/60 bg-gradient-card shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Webhook className="h-5 w-5" /> Webhook</CardTitle>
        <p className="mt-1 text-sm text-muted-foreground">
          Paste this callback URL into Meta → WhatsApp → Webhooks. Subscribe to <span className="font-mono">messages</span> and <span className="font-mono">message_status</span> events.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Callback URL</Label>
          <div className="flex gap-2">
            <code className="flex-1 overflow-auto rounded-md bg-muted p-3 text-xs text-foreground">{url}</code>
            <Button size="sm" variant="outline" onClick={copyUrl} className="shrink-0"><Copy className="h-4 w-4" /></Button>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-end">
          <div className="space-y-2">
            <Label>Verify token</Label>
            <Input value={verifyToken} onChange={(e) => setVerifyToken(e.target.value)} placeholder="wa-cloud-api" className="font-mono text-xs" />
            <p className="text-[11px] text-muted-foreground">Must match <span className="font-mono">META_WA_VERIFY_TOKEN</span> on the backend (defaults to <span className="font-mono">wa-cloud-api</span> when unset).</p>
          </div>
          <Button size="sm" onClick={verify} disabled={busy || !verifyToken.trim()}>
            <ShieldCheck className="mr-2 h-4 w-4" /> {busy ? "Verifying…" : "Verify endpoint"}
          </Button>
        </div>

        {result && (
          <div className={`rounded-md border p-3 text-sm ${result.ok ? "border-success/40 bg-success/5" : "border-destructive/40 bg-destructive/5"}`}>
            <div className="flex items-center justify-between font-medium">
              <span className="flex items-center gap-1.5">
                {result.ok ? <CheckCircle2 className="h-4 w-4 text-success" /> : <AlertTriangle className="h-4 w-4 text-destructive" />}
                HTTP {result.status} — {result.ok ? "Verification passed" : "Verification failed"}
              </span>
              <span className="text-xs text-muted-foreground">{result.ms}ms</span>
            </div>
            <p className="mt-2 break-all text-xs text-muted-foreground">
              <span className="font-medium">Response:</span> <span className="font-mono">{result.body || "(empty)"}</span>
              {result.expected && !result.ok && <><br /><span className="font-medium">Expected:</span> <span className="font-mono">{result.expected}</span></>}
            </p>
          </div>
        )}

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">Recent webhook deliveries</Label>
            <Button size="sm" variant="ghost" onClick={() => data.events?.refetch?.()}><RefreshCw className="mr-1.5 h-3.5 w-3.5" /> Refresh</Button>
          </div>
          {events.length ? (
            <div className="space-y-1.5">
              {events.map((ev) => {
                const ok = ev.processed && !ev.processing_error;
                return (
                  <div key={ev.id} className="flex items-center justify-between gap-3 rounded-md border border-border/60 bg-card/40 px-3 py-2 text-xs">
                    <div className="flex min-w-0 items-center gap-2">
                      {ok ? <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-success" /> : <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-destructive" />}
                      <span className="truncate font-medium">{ev.event_type}</span>
                      {ev.processing_error && <span className="truncate text-destructive">— {ev.processing_error}</span>}
                    </div>
                    <span className="shrink-0 text-muted-foreground">{formatDate(ev.received_at)}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="rounded-md border border-dashed border-border/60 p-4 text-center text-xs text-muted-foreground">
              No webhook events received yet.
            </p>
          )}
        </div>

        <p className="text-xs text-muted-foreground">
          Inbound STOP / UNSUBSCRIBE / CANCEL keywords automatically opt the contact out.
        </p>
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
    <Card className="rounded-md border-border/60 bg-gradient-card shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Zap className="h-5 w-5" /> Quick replies</CardTitle>
        <p className="mt-1 text-sm text-muted-foreground">
          Canned responses for the Inbox composer. Press <kbd className="rounded border bg-muted px-1 text-[10px]">/</kbd> in an empty reply to pick one.
          Use <span className="font-mono text-xs">{`{{name}}`}</span> or <span className="font-mono text-xs">{`{{phone}}`}</span> to auto-fill the contact.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 md:grid-cols-[160px_1fr_160px_auto]">
          <div className="space-y-2"><Label>Shortcut</Label><Input value={shortcut} onChange={(e) => setShortcut(e.target.value)} placeholder="hello" /></div>
          <div className="space-y-2"><Label>Message</Label><Input value={body} onChange={(e) => setBody(e.target.value)} placeholder={`Hi {{name}}, how can we help?`} /></div>
          <div className="space-y-2"><Label>Category</Label><Input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="greeting" /></div>
          <div className="flex items-end"><Button size="sm" variant="outline" onClick={add}><Plus className="mr-2 h-4 w-4" /> Add</Button></div>
        </div>
        {list.length > 0 && (
          <div className="space-y-2">
            {list.map((r) => (
              <div key={r.id} className="flex items-start justify-between gap-3 rounded-md border border-border/60 bg-card/40 px-3 py-2 text-sm">
                <div className="min-w-0 flex-1">
                  <p className="font-mono text-xs font-semibold text-primary">/{r.shortcut} {r.category && <span className="ml-2 rounded bg-muted px-1 text-[10px] text-muted-foreground">{r.category}</span>}</p>
                  <p className="mt-1 truncate text-xs text-muted-foreground">{r.body}</p>
                </div>
                <Button size="sm" variant="ghost" onClick={() => remove(r.id)}><Trash2 className="h-4 w-4" /></Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
