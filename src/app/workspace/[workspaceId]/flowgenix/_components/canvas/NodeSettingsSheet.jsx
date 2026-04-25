import { useEffect, useMemo, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Trash2, Copy, RefreshCw, Send, Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useParams } from "next/navigation";
import { NodeCredentialsSection } from "./NodeCredentialsSection";
import { stripSecretsForStorage } from "../../_lib/node-credentials";

export const NodeSettingsSheet = ({
  node,
  open,
  onOpenChange,
  onSave,
  onDelete,
  webhookToken,
  onRegenerateWebhookToken,
}) => {
  const params = useParams();
  const workflowId = params?.id;
  const [label, setLabel] = useState("");
  const [description, setDescription] = useState("");
  const [config, setConfig] = useState({});
  const [retry, setRetry] = useState({ count: 0, delayMs: 500 });
  const [retryEnabled, setRetryEnabled] = useState(false);
  const [testBody, setTestBody] = useState('{"hello":"world"}');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [ioLoading, setIoLoading] = useState(false);
  const [lastIO, setLastIO] = useState(null);

  const fetchLastIO = async (nodeId) => {
    if (!workflowId) return;
    setIoLoading(true);
    try {
      const { data: runs } = await supabase
        .from("workflow_runs")
        .select("id")
        .eq("workflow_id", workflowId)
        .order("started_at", { ascending: false })
        .limit(20);
      const runIds = (runs ?? []).map((r) => r.id);
      if (runIds.length === 0) { setLastIO(null); return; }
      const { data: logs } = await supabase
        .from("workflow_run_logs")
        .select("data,status,created_at,message")
        .in("run_id", runIds)
        .eq("node_id", nodeId)
        .order("created_at", { ascending: false })
        .limit(1);
      const row = logs?.[0];
      if (!row) { setLastIO(null); return; }
      const d = (row.data ?? {}) ;
      setLastIO({ input: d.input, output: d.output, status: row.status, created_at: row.created_at, message: row.message });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setIoLoading(false);
    }
  };

  useEffect(() => {
    if (!node) return;
    setTestResult(null);
    setLastIO(null);
    const d = node.data;
    setLabel(d.label ?? "");
    setDescription(d.description ?? "");
    setConfig(d.config ?? {});
    const r = d.retry ?? {};
    setRetry({ count: r.count ?? 0, delayMs: r.delayMs ?? 500 });
    setRetryEnabled((r.count ?? 0) > 0);
    if (open) void fetchLastIO(node.id);
  }, [node, open]);

  const kind = useMemo(() => {
    if (!node) return "node";
    const d = node.data;
    return d.kind ?? node.type ?? "node";
  }, [node]);

  const webhookUrl = useMemo(() => {
    if (kind !== "trigger.webhook" || !workflowId || !webhookToken) return null;
    // In Next.js we use process.env.NEXT_PUBLIC_SUPABASE_URL
    const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
    return `${base}/functions/v1/flowgenix-webhook?id=${workflowId}&token=${webhookToken}`;
  }, [kind, workflowId, webhookToken]);

  if (!node) return null;

  const setCfg = (k, v) => setConfig((c) => ({ ...c, [k]: v }));

  const handleSave = () => {
    onSave(node.id, {
      label,
      description,
      config: stripSecretsForStorage(kind, config),
      retry: retryEnabled ? { count: retry.count ?? 1, delayMs: retry.delayMs ?? 500 } : undefined,
    });
    onOpenChange(false);
  };

  const handleDelete = () => {
    onDelete(node.id);
    onOpenChange(false);
  };

  const supportsRetry = node.type !== "trigger" && kind !== "util.if" && kind !== "util.repeat";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="font-mono text-sm">Node settings</SheetTitle>
          <SheetDescription className="font-mono text-xs">
            <span className="text-muted-foreground">type:</span> {kind}
          </SheetDescription>
        </SheetHeader>

        <Tabs defaultValue="settings" className="mt-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="settings" className="font-mono text-xs">Settings</TabsTrigger>
            <TabsTrigger value="input" className="font-mono text-xs">Input</TabsTrigger>
            <TabsTrigger value="output" className="font-mono text-xs">Output</TabsTrigger>
          </TabsList>

          <TabsContent value="settings" className="mt-4 space-y-5">
            <div className="space-y-1.5">
              <Label className="font-mono text-xs">Label</Label>
              <Input value={label} onChange={(e) => setLabel(e.target.value)} className="h-9 font-mono text-xs" />
            </div>

            <NodeCredentialsSection
              kind={kind}
              config={config}
              onApplyConfig={(merged) => setConfig(merged)}
            />

          {kind === "util.http" && (
            <>
              <div className="grid grid-cols-[100px_1fr] gap-2">
                <div className="space-y-1.5">
                  <Label className="font-mono text-xs">Method</Label>
                  <Select value={String(config.method ?? "GET")} onValueChange={(v) => setCfg("method", v)}>
                    <SelectTrigger className="h-9 font-mono text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["GET", "POST", "PUT", "PATCH", "DELETE"].map((m) => (
                        <SelectItem key={m} value={m} className="font-mono text-xs">{m}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="font-mono text-xs">URL</Label>
                  <Input value={String(config.url ?? "")} onChange={(e) => setCfg("url", e.target.value)} placeholder="https://api.example.com/endpoint" className="h-9 font-mono text-xs" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="font-mono text-xs">Headers (JSON)</Label>
                <Textarea value={String(config.headers ?? "")} onChange={(e) => setCfg("headers", e.target.value)} rows={3} className="font-mono text-xs" placeholder='{"Content-Type":"application/json"}' />
              </div>
              <div className="space-y-1.5">
                <Label className="font-mono text-xs">Body</Label>
                <Textarea value={String(config.body ?? "")} onChange={(e) => setCfg("body", e.target.value)} rows={4} className="font-mono text-xs" placeholder='{"key":"value"}' />
              </div>
              <p className="font-mono text-[10px] text-muted-foreground">// Browser-direct fetch — CORS may block some endpoints.</p>
            </>
          )}

          {kind === "util.if" && (
            <div className="space-y-1.5">
              <Label className="font-mono text-xs">Condition (JS expression on `input`)</Label>
              <Textarea value={String(config.expression ?? "")} onChange={(e) => setCfg("expression", e.target.value)} rows={3} className="font-mono text-xs" placeholder="input && input.score > 0.5" />
              <p className="font-mono text-[10px] text-muted-foreground">// Connect "true" handle for the truthy branch, "false" for the other.</p>
            </div>
          )}

          {kind === "util.repeat" && (
            <div className="space-y-1.5">
              <Label className="font-mono text-xs">Times</Label>
              <Input type="number" min={1} max={100} value={Number(config.times ?? 1)} onChange={(e) => setCfg("times", Number(e.target.value))} className="h-9 font-mono text-xs" />
              <p className="font-mono text-[10px] text-muted-foreground">// Runs everything downstream of this node sequentially N times (max 100).</p>
            </div>
          )}

          {kind === "util.delay" && (
            <div className="space-y-1.5">
              <Label className="font-mono text-xs">Wait (milliseconds)</Label>
              <Input type="number" min={0} max={60000} step={100} value={Number(config.ms ?? 1000)} onChange={(e) => setCfg("ms", Number(e.target.value))} className="h-9 font-mono text-xs" />
              <p className="font-mono text-[10px] text-muted-foreground">// Pauses execution for up to 60s before passing input to the next node.</p>
            </div>
          )}

          {kind === "util.slack" && (
            <>
              <div className="space-y-1.5">
                <Label className="font-mono text-xs">Slack incoming webhook URL</Label>
                <Input value={String(config.webhookUrl ?? "")} onChange={(e) => setCfg("webhookUrl", e.target.value)} placeholder="https://hooks.slack.com/services/..." className="h-9 font-mono text-xs" />
              </div>
              <div className="space-y-1.5">
                <Label className="font-mono text-xs">Message text</Label>
                <Textarea value={String(config.text ?? "")} onChange={(e) => setCfg("text", e.target.value)} rows={3} className="font-mono text-xs" placeholder="Defaults to incoming input if empty" />
              </div>
              <p className="font-mono text-[10px] text-muted-foreground">// Get a webhook URL from https://api.slack.com/messaging/webhooks</p>
            </>
          )}

          {kind === "util.email" && (
            <>
              <div className="space-y-1.5">
                <Label className="font-mono text-xs">To</Label>
                <Input value={String(config.to ?? "")} onChange={(e) => setCfg("to", e.target.value)} placeholder="recipient@example.com" className="h-9 font-mono text-xs" />
              </div>
              <div className="space-y-1.5">
                <Label className="font-mono text-xs">Subject</Label>
                <Input value={String(config.subject ?? "")} onChange={(e) => setCfg("subject", e.target.value)} className="h-9 font-mono text-xs" />
              </div>
              <div className="space-y-1.5">
                <Label className="font-mono text-xs">From (optional)</Label>
                <Input value={String(config.from ?? "")} onChange={(e) => setCfg("from", e.target.value)} placeholder="Workflow <onboarding@resend.dev>" className="h-9 font-mono text-xs" />
              </div>
              <div className="space-y-1.5">
                <Label className="font-mono text-xs">HTML body</Label>
                <Textarea value={String(config.html ?? "")} onChange={(e) => setCfg("html", e.target.value)} rows={5} className="font-mono text-xs" placeholder="<p>Hello!</p> — defaults to the incoming input if empty" />
              </div>
              <p className="font-mono text-[10px] text-muted-foreground">// Sent via Resend connector.</p>
            </>
          )}

          {kind === "util.db" && (
            <>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1.5">
                  <Label className="font-mono text-xs">Table</Label>
                  <Input value={String(config.table ?? "")} onChange={(e) => setCfg("table", e.target.value)} placeholder="workflow_runs" className="h-9 font-mono text-xs" />
                </div>
                <div className="space-y-1.5">
                  <Label className="font-mono text-xs">Limit</Label>
                  <Input type="number" min={1} max={1000} value={Number(config.limit ?? 50)} onChange={(e) => setCfg("limit", Number(e.target.value))} className="h-9 font-mono text-xs" />
                </div>
              </div>
              <div className="grid grid-cols-[1fr_120px_1fr] gap-2 items-end">
                <div className="space-y-1.5">
                  <Label className="font-mono text-xs">Filter column</Label>
                  <Input value={String(config.filterCol ?? "")} onChange={(e) => setCfg("filterCol", e.target.value)} placeholder="status" className="h-9 font-mono text-xs" />
                </div>
                <div className="space-y-1.5">
                  <Label className="font-mono text-xs">Op</Label>
                  <Select value={String(config.filterOp ?? "eq")} onValueChange={(v) => setCfg("filterOp", v)}>
                    <SelectTrigger className="h-9 font-mono text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["eq", "neq", "gt", "gte", "lt", "lte", "like", "ilike"].map((o) => (
                        <SelectItem key={o} value={o} className="font-mono text-xs">{o}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="font-mono text-xs">Value</Label>
                  <Input value={String(config.filterVal ?? "")} onChange={(e) => setCfg("filterVal", e.target.value)} className="h-9 font-mono text-xs" />
                </div>
              </div>
              <div className="grid grid-cols-[1fr_120px] gap-2 items-end">
                <div className="space-y-1.5">
                  <Label className="font-mono text-xs">Order by</Label>
                  <Input value={String(config.orderBy ?? "")} onChange={(e) => setCfg("orderBy", e.target.value)} placeholder="created_at" className="h-9 font-mono text-xs" />
                </div>
                <div className="flex items-center gap-2 pb-2">
                  <Switch checked={Boolean(config.ascending)} onCheckedChange={(v) => setCfg("ascending", v)} id="asc" />
                  <Label htmlFor="asc" className="font-mono text-xs">Asc</Label>
                </div>
              </div>
              <p className="font-mono text-[10px] text-muted-foreground">// Reads via PostgREST. Subject to your table's RLS policies.</p>
            </>
          )}

          {kind === "util.supabase" && (
            <>
              <div className="grid grid-cols-[1fr_140px] gap-2">
                <div className="space-y-1.5">
                  <Label className="font-mono text-xs">Table</Label>
                  <Input value={String(config.table ?? "")} onChange={(e) => setCfg("table", e.target.value)} placeholder="my_table" className="h-9 font-mono text-xs" />
                </div>
                <div className="space-y-1.5">
                  <Label className="font-mono text-xs">Operation</Label>
                  <Select value={String(config.operation ?? "select")} onValueChange={(v) => setCfg("operation", v)}>
                    <SelectTrigger className="h-9 font-mono text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["select", "insert", "update", "delete"].map((o) => (
                        <SelectItem key={o} value={o} className="font-mono text-xs">{o}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {String(config.operation ?? "select") === "select" && (
                <>
                  <div className="grid grid-cols-[1fr_120px] gap-2">
                    <div className="space-y-1.5">
                      <Label className="font-mono text-xs">Columns</Label>
                      <Input value={String(config.columns ?? "*")} onChange={(e) => setCfg("columns", e.target.value)} placeholder="*" className="h-9 font-mono text-xs" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="font-mono text-xs">Limit</Label>
                      <Input type="number" min={1} max={1000} value={Number(config.limit ?? 50)} onChange={(e) => setCfg("limit", Number(e.target.value))} className="h-9 font-mono text-xs" />
                    </div>
                  </div>
                  <div className="grid grid-cols-[1fr_120px] gap-2 items-end">
                    <div className="space-y-1.5">
                      <Label className="font-mono text-xs">Order by</Label>
                      <Input value={String(config.orderBy ?? "")} onChange={(e) => setCfg("orderBy", e.target.value)} placeholder="created_at" className="h-9 font-mono text-xs" />
                    </div>
                    <div className="flex items-center gap-2 pb-2">
                      <Switch checked={Boolean(config.ascending)} onCheckedChange={(v) => setCfg("ascending", v)} id="sb-asc" />
                      <Label htmlFor="sb-asc" className="font-mono text-xs">Asc</Label>
                    </div>
                  </div>
                </>
              )}

              {(String(config.operation ?? "select") === "insert" ||
                String(config.operation ?? "select") === "update") && (
                <div className="space-y-1.5">
                  <Label className="font-mono text-xs">Payload (JSON)</Label>
                  <Textarea value={String(config.payload ?? "")} onChange={(e) => setCfg("payload", e.target.value)} rows={5} className="font-mono text-xs" placeholder='{"name":"Acme"} — leave empty to use upstream input' />
                </div>
              )}

              {String(config.operation ?? "select") !== "insert" && (
                <div className="grid grid-cols-[1fr_120px_1fr] gap-2 items-end">
                  <div className="space-y-1.5">
                    <Label className="font-mono text-xs">Filter column</Label>
                    <Input value={String(config.filterCol ?? "")} onChange={(e) => setCfg("filterCol", e.target.value)} placeholder="id" className="h-9 font-mono text-xs" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="font-mono text-xs">Op</Label>
                    <Select value={String(config.filterOp ?? "eq")} onValueChange={(v) => setCfg("filterOp", v)}>
                      <SelectTrigger className="h-9 font-mono text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {["eq", "neq", "gt", "gte", "lt", "lte", "like", "ilike"].map((o) => (
                          <SelectItem key={o} value={o} className="font-mono text-xs">{o}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="font-mono text-xs">Value</Label>
                    <Input value={String(config.filterVal ?? "")} onChange={(e) => setCfg("filterVal", e.target.value)} className="h-9 font-mono text-xs" />
                  </div>
                </div>
              )}

              <p className="font-mono text-[10px] text-muted-foreground">
                // Runs through Supabase JS client → subject to RLS. Update/Delete require a filter for safety.
              </p>
            </>
          )}

          {kind === "trigger.webhook" && (
            <div className="space-y-2">
              <Label className="font-mono text-xs">Public URL</Label>
              {webhookUrl ? (
                <div className="space-y-2">
                  <div className="break-all rounded-md border border-border bg-secondary/40 p-2 font-mono text-[10px]">
                    {webhookUrl}
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="gap-1.5 font-mono text-xs" onClick={() => { navigator.clipboard.writeText(webhookUrl); toast.success("Copied"); }}>
                      <Copy className="h-3 w-3" /> Copy
                    </Button>
                    {onRegenerateWebhookToken && (
                      <Button size="sm" variant="outline" className="gap-1.5 font-mono text-xs" onClick={async () => { await onRegenerateWebhookToken(); toast.success("Token regenerated"); }}>
                        <RefreshCw className="h-3 w-3" /> Regenerate
                      </Button>
                    )}
                  </div>
                  <p className="font-mono text-[10px] text-muted-foreground">// POST to this URL to trigger the workflow. Body becomes input.</p>

                  <div className="mt-3 space-y-2 rounded-md border border-border bg-secondary/20 p-2">
                    <Label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Test webhook</Label>
                    <Textarea value={testBody} onChange={(e) => setTestBody(e.target.value)} rows={3} className="font-mono text-[10px]" placeholder='{"hello":"world"}' />
                    <Button size="sm" variant="outline" disabled={testing} className="w-full gap-1.5 font-mono text-xs" onClick={async () => {
                      setTesting(true); setTestResult(null);
                      try {
                        const resp = await fetch(webhookUrl, { method: "POST", headers: { "Content-Type": "application/json" }, body: testBody });
                        const text = await resp.text();
                        setTestResult({ ok: resp.ok, status: resp.status, body: text });
                      } catch (err) {
                        setTestResult({ ok: false, status: 0, body: err instanceof Error ? err.message : "Network error" });
                      } finally { setTesting(false); }
                    }}>
                      {testing ? <Loader2 className="h-3 w-3 animate-spin" /> : <Send className="h-3 w-3" />}
                      Send test request
                    </Button>
                    {testResult && (
                      <div className={`rounded border p-2 ${testResult.ok ? "border-[hsl(142_76%_36%)]/40 bg-[hsl(142_76%_36%)]/10" : "border-destructive/40 bg-destructive/10"}`}>
                        <p className="font-mono text-[10px]">
                          <span className={testResult.ok ? "text-[hsl(142_76%_36%)]" : "text-destructive"}>
                            {testResult.ok ? "✓" : "✗"} {testResult.status || "error"}
                          </span>
                        </p>
                        <pre className="mt-1 max-h-32 overflow-auto whitespace-pre-wrap font-mono text-[10px] text-muted-foreground">{testResult.body.slice(0, 1000)}</pre>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <p className="font-mono text-[10px] text-muted-foreground">// Save the workflow to generate a webhook URL.</p>
              )}
            </div>
          )}

          {supportsRetry && (
            <div className="space-y-2 rounded-md border border-border bg-secondary/20 p-3">
              <div className="flex items-center justify-between">
                <Label className="font-mono text-xs">Retry on failure</Label>
                <Switch checked={retryEnabled} onCheckedChange={setRetryEnabled} />
              </div>
              {retryEnabled && (
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="font-mono text-[10px] text-muted-foreground">Max retries</Label>
                    <Input type="number" min={1} max={5} value={retry.count ?? 1} onChange={(e) => setRetry((r) => ({ ...r, count: Number(e.target.value) }))} className="h-8 font-mono text-xs" />
                  </div>
                  <div className="space-y-1">
                    <Label className="font-mono text-[10px] text-muted-foreground">Delay (ms)</Label>
                    <Input type="number" min={0} max={30000} step={100} value={retry.delayMs ?? 500} onChange={(e) => setRetry((r) => ({ ...r, delayMs: Number(e.target.value) }))} className="h-8 font-mono text-xs" />
                  </div>
                </div>
              )}
              <p className="font-mono text-[10px] text-muted-foreground">
                // Connect the red error handle on this node to route failures elsewhere.
              </p>
            </div>
          )}

            <div className="space-y-1.5">
              <Label className="font-mono text-xs">Description / Notes</Label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="font-mono text-xs" placeholder="// add notes about this node…" />
            </div>
          </TabsContent>

          <TabsContent value="input" className="mt-4">
            <IOPanel which="input" loading={ioLoading} lastIO={lastIO} onRefresh={() => node && fetchLastIO(node.id)} />
          </TabsContent>

          <TabsContent value="output" className="mt-4">
            <IOPanel which="output" loading={ioLoading} lastIO={lastIO} onRefresh={() => node && fetchLastIO(node.id)} />
          </TabsContent>
        </Tabs>

        <div className="mt-6 flex items-center justify-between gap-2 border-t border-border pt-4">
          <Button variant="outline" size="sm" onClick={handleDelete} className="gap-1.5 font-mono text-xs text-destructive hover:text-destructive">
            <Trash2 className="h-3.5 w-3.5" /> Delete node
          </Button>
          <Button size="sm" onClick={handleSave} className="font-mono text-xs">Save</Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

const formatIO = (v) => {
  if (v === undefined) return "// (no value)";
  if (v === null) return "null";
  if (typeof v === "string") return v;
  try { return JSON.stringify(v, null, 2); } catch { return String(v); }
};

const IOPanel = ({
  which,
  loading,
  lastIO,
  onRefresh,
}) => {
  const value = lastIO ? lastIO[which] : undefined;
  return (
    <div className="space-y-2 rounded-md border border-border bg-secondary/20 p-3">
      <div className="flex items-center justify-between">
        <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          {lastIO ? `${new Date(lastIO.created_at).toLocaleString()} · ` : ""}
          {lastIO && (
            <span className={lastIO.status === "error" ? "text-destructive" : "text-[hsl(142_76%_36%)]"}>{lastIO.status}</span>
          )}
        </p>
        <Button size="sm" variant="ghost" className="h-7 gap-1.5 px-2 font-mono text-[10px]" onClick={onRefresh} disabled={loading}>
          {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
          Refresh
        </Button>
      </div>
      {loading && !lastIO ? (
        <p className="font-mono text-[10px] text-muted-foreground">// loading…</p>
      ) : !lastIO ? (
        <p className="font-mono text-[10px] text-muted-foreground">// No execution data yet. Run the workflow to capture {which}.</p>
      ) : (
        <pre className="max-h-[400px] overflow-auto rounded border border-border bg-background p-2 font-mono text-[10px]">{formatIO(value)}</pre>
      )}
    </div>
  );
};
