import { useEffect, useMemo, useState } from "react";
import { ClipboardList, Plus, Trash2, ExternalLink, Copy, Wand2, Check, FileCode } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { addFlow, getFlows, isValidFlowId, removeFlow } from "../lib/flows";
import { FIELD_LIBRARY, DEFAULT_SIGNUP_FIELDS, buildSignupFlowJson } from "../lib/flowBuilder";
import { cloudAction } from "../lib/api";
import { Loader2, Send } from "lucide-react";

// === Local server-function alternatives (uncomment to switch from edge → local) ===
// import * as flowsFn from "../functions/flows";
// =================================================================================


export function Flows() {
  const [flows, setFlows] = useState([]);
  const [open, setOpen] = useState(false);
  const [builderOpen, setBuilderOpen] = useState(false);
  const [viewJsonFor, setViewJsonFor] = useState(null); // saved flow whose JSON is being viewed
  const [form, setForm] = useState({ name: "", flow_id: "", screen: "SIGNUP", description: "" });

  useEffect(() => setFlows(getFlows()), []);

  const submit = (e) => {
    e.preventDefault();
    if (!isValidFlowId(form.flow_id)) return toast.error("Flow ID must be numeric");
    try {
      const next = addFlow(form);
      setFlows(next);
      setForm({ name: "", flow_id: "", screen: "SIGNUP", description: "" });
      setOpen(false);
      toast.success("Flow saved");
    } catch (err) {
      toast.error(err.message);
    }
  };

  const onRemove = (flow_id) => {
    setFlows(removeFlow(flow_id));
    toast.success("Flow removed");
  };

  const copyText = (txt, label = "Copied") => {
    navigator.clipboard?.writeText(String(txt));
    toast.success(label);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-primary" /> WhatsApp Flows
            </CardTitle>
            <p className="mt-1 max-w-2xl text-xs text-muted-foreground">
              Design a Flow JSON (e.g. a sign-up form), copy it into Meta Business Manager → WhatsApp Manager → Flows
              to publish, then register the resulting numeric Flow ID here. Saved Flows show up as a dropdown in the
              Template editor when you add a FLOW button.
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            <Button asChild size="sm" variant="outline">
              <a
                href="https://business.facebook.com/wa/manage/flows/"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5"
              >
                <ExternalLink className="h-3.5 w-3.5" /> Meta Flows
              </a>
            </Button>
            <BuilderDialog
              open={builderOpen}
              onOpenChange={setBuilderOpen}
              onSaved={() => setFlows(getFlows())}
            />
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="bg-gradient-primary text-primary-foreground hover:opacity-90">
                  <Plus className="mr-2 h-4 w-4" /> New flow
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Register a published Flow</DialogTitle>
                </DialogHeader>
                <form onSubmit={submit} className="space-y-4 pt-2">
                  <div className="space-y-2">
                    <Label>Display name</Label>
                    <Input
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="Lead capture form"
                      maxLength={80}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Flow ID * (numeric, from Meta)</Label>
                    <Input
                      value={form.flow_id}
                      onChange={(e) => setForm({ ...form, flow_id: e.target.value.replace(/[^0-9]/g, "") })}
                      placeholder="e.g. 123456789012345"
                      inputMode="numeric"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>First screen ID</Label>
                    <Input
                      value={form.screen}
                      onChange={(e) => setForm({ ...form, screen: e.target.value.toUpperCase() })}
                      placeholder="SIGNUP"
                      maxLength={40}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Notes (optional)</Label>
                    <Textarea
                      rows={2}
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      placeholder="What does this flow collect?"
                      maxLength={300}
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <Button size="sm" type="button" variant="outline" onClick={() => setOpen(false)}>
                      Cancel
                    </Button>
                    <Button size="sm" type="submit">
                      Save flow
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {flows.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border/60 bg-muted/20 py-12 text-center">
              <ClipboardList className="mb-3 h-8 w-8 text-muted-foreground" />
              <p className="text-sm font-medium">No flows yet</p>
              <p className="mt-1 max-w-md text-xs text-muted-foreground">
                Click <em>Build signup flow</em> to design one in seconds, paste the JSON into Meta to publish, then
                register the resulting Flow ID here.
              </p>
              <Button size="sm" className="mt-4" onClick={() => setBuilderOpen(true)}>
                <Wand2 className="mr-2 h-4 w-4" /> Build signup flow
              </Button>
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {flows.map((f) => (
                <div
                  key={f.flow_id}
                  className="group flex flex-col rounded-lg border border-border/60 bg-card/40 p-4 transition-all hover:border-primary/50 hover:shadow-soft"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{f.name}</p>
                      <p className="mt-0.5 truncate text-[11px] text-muted-foreground">Screen: {f.screen}</p>
                    </div>
                    <Badge variant="secondary" className="shrink-0 text-[10px]">
                      FLOW
                    </Badge>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyText(f.flow_id, "Flow ID copied")}
                    className="mt-3 flex items-center justify-between rounded-md bg-muted/40 px-2.5 py-1.5 text-left text-xs transition-colors hover:bg-muted"
                  >
                    <span className="font-mono text-muted-foreground">{f.flow_id}</span>
                    <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                  </button>
                  {f.description && (
                    <p className="mt-2 line-clamp-3 text-[11px] text-muted-foreground">{f.description}</p>
                  )}
                  <div className="mt-3 flex items-center justify-between gap-2">
                    {f.flow_json ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setViewJsonFor(f)}
                        className="h-7 text-xs"
                      >
                        <FileCode className="mr-1 h-3.5 w-3.5" /> View JSON
                      </Button>
                    ) : (
                      <span className="text-[11px] text-muted-foreground">Manually registered</span>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onRemove(f.flow_id)}
                      className="h-7 text-xs text-destructive hover:text-destructive"
                    >
                      <Trash2 className="mr-1 h-3.5 w-3.5" /> Remove
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* JSON viewer for saved flows */}
      <Dialog open={!!viewJsonFor} onOpenChange={(o) => !o && setViewJsonFor(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Flow JSON — {viewJsonFor?.name}</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] rounded-md border border-border bg-muted/30 p-3">
            <pre className="whitespace-pre-wrap break-all font-mono text-[11px] leading-relaxed">
              {viewJsonFor ? JSON.stringify(viewJsonFor.flow_json, null, 2) : ""}
            </pre>
          </ScrollArea>
          <div className="flex justify-end">
            <Button
              size="sm"
              onClick={() => copyText(JSON.stringify(viewJsonFor.flow_json, null, 2), "JSON copied")}
            >
              <Copy className="mr-2 h-4 w-4" /> Copy JSON
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function BuilderDialog({ open, onOpenChange, onSaved }) {
  const [step, setStep] = useState("design"); // design | publish
  const [title, setTitle] = useState("Sign up");
  const [cta, setCta] = useState("Submit");
  const [screenId, setScreenId] = useState("SIGNUP");
  const [name, setName] = useState("Lead capture form");
  const [selected, setSelected] = useState(DEFAULT_SIGNUP_FIELDS);
  const [flowId, setFlowId] = useState("");
  const [publishing, setPublishing] = useState(false);

  const publishToMeta = async () => {
    setPublishing(true);
    try {
      // LOCAL: await flowsFn.publishFlow(/* same payload as edge call below */);
      const res = await cloudAction("publish_flow", {
        name,
        categories: ["SIGN_UP"],
        flow_json: flowJson,
      });
      if (res?.flow_id) {
        setFlowId(String(res.flow_id));
        if (res.published) {
          toast.success(`Flow published on Meta (ID ${res.flow_id})`);
        } else {
          toast.warning(`Flow created (ID ${res.flow_id}) but auto-publish failed: ${res.publish_error || "unknown"}. Publish manually in Meta.`);
        }
      } else {
        toast.error("Meta did not return a flow ID");
      }
    } catch (err) {
      toast.error(err.message || "Publish failed — check token has whatsapp_business_management permission");
    } finally {
      setPublishing(false);
    }
  };

  // Reset on open
  useEffect(() => {
    if (!open) return;
    setStep("design");
    setTitle("Sign up");
    setCta("Submit");
    setScreenId("SIGNUP");
    setName("Lead capture form");
    setSelected(DEFAULT_SIGNUP_FIELDS);
    setFlowId("");
  }, [open]);

  const flowJson = useMemo(
    () => buildSignupFlowJson({ title, cta, screenId, fieldKeys: selected }),
    [title, cta, screenId, selected]
  );
  const jsonText = useMemo(() => JSON.stringify(flowJson, null, 2), [flowJson]);

  const toggleField = (key) => {
    setSelected((cur) => (cur.includes(key) ? cur.filter((k) => k !== key) : [...cur, key]));
  };
  const moveField = (key, dir) => {
    setSelected((cur) => {
      const i = cur.indexOf(key);
      if (i < 0) return cur;
      const j = i + dir;
      if (j < 0 || j >= cur.length) return cur;
      const next = [...cur];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  };

  const copy = (txt, label = "Copied") => {
    navigator.clipboard?.writeText(String(txt));
    toast.success(label);
  };

  const saveFlow = () => {
    if (!isValidFlowId(flowId)) return toast.error("Paste the numeric Flow ID from Meta");
    try {
      addFlow({ name, flow_id: flowId, screen: screenId, description: `${selected.length} fields`, flow_json: flowJson });
      toast.success("Flow saved — pick it in the Template editor's FLOW button");
      onSaved?.();
      onOpenChange(false);
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Wand2 className="mr-2 h-4 w-4" /> Build signup flow
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[80vw] max-w-[80vw] h-[80vh] max-h-[80vh] p-0 flex flex-col overflow-hidden sm:rounded-lg">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle>Signup flow builder</DialogTitle>
          <p className="text-xs text-muted-foreground">
            Choose the fields you want to collect. We'll generate the Flow JSON for Meta — paste it in WhatsApp
            Manager to publish, then come back to register the Flow ID.
          </p>
        </DialogHeader>
        <Tabs value={step} onValueChange={setStep} className="flex flex-1 min-h-0 flex-col px-6 pb-6">
          <TabsList className="w-fit">
            <TabsTrigger value="design">1 · Design fields</TabsTrigger>
            <TabsTrigger value="publish">2 · Publish & save</TabsTrigger>
          </TabsList>

          <TabsContent value="design" className="mt-4 flex-1 min-h-0 flex flex-col">
            <div className="grid flex-1 min-h-0 gap-6 lg:grid-cols-[1fr_360px]">
              <ScrollArea className="h-full pr-4">
                <div className="space-y-4 pb-2">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label>Flow display name</Label>
                      <Input value={name} onChange={(e) => setName(e.target.value)} maxLength={80} />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Screen ID</Label>
                      <Input
                        value={screenId}
                        onChange={(e) => setScreenId(e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, ""))}
                        maxLength={40}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Screen title</Label>
                      <Input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={60} />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Submit button label</Label>
                      <Input value={cta} onChange={(e) => setCta(e.target.value)} maxLength={30} />
                    </div>
                  </div>

                  <div>
                    <p className="mb-2 text-xs font-medium text-muted-foreground">
                      Fields to collect ({selected.length})
                    </p>
                    <div className="grid gap-2">
                      {FIELD_LIBRARY.map((field) => {
                        const checked = selected.includes(field.key);
                        const idx = selected.indexOf(field.key);
                        return (
                          <div
                            key={field.key}
                            className={`flex items-center justify-between gap-3 rounded-md border p-3 transition-colors ${
                              checked ? "border-primary/40 bg-primary/5" : "border-border/60 bg-card/30"
                            }`}
                          >
                            <label className="flex flex-1 cursor-pointer items-center gap-3">
                              <Checkbox checked={checked} onCheckedChange={() => toggleField(field.key)} />
                              <div className="min-w-0">
                                <p className="text-sm font-medium">{field.label}</p>
                                <p className="text-[11px] text-muted-foreground">
                                  {field.type}
                                  {field.input_type ? ` · ${field.input_type}` : ""}
                                  {field.required ? " · required" : ""}
                                </p>
                              </div>
                            </label>
                            {checked && (
                              <div className="flex items-center gap-1">
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-7 w-7"
                                  disabled={idx <= 0}
                                  onClick={() => moveField(field.key, -1)}
                                >
                                  ↑
                                </Button>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-7 w-7"
                                  disabled={idx >= selected.length - 1}
                                  onClick={() => moveField(field.key, 1)}
                                >
                                  ↓
                                </Button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </ScrollArea>

              {/* Preview */}
              <div className="flex flex-col rounded-lg border border-border/60 bg-card/30 p-4 min-h-0">
                <p className="mb-3 text-xs font-medium text-muted-foreground">Preview</p>
                <ScrollArea className="flex-1 min-h-0 rounded-md bg-muted/30 p-3">
                  <div className="mx-auto w-full max-w-xs rounded-2xl bg-card p-3 shadow-soft ring-1 ring-border">
                    <p className="mb-2 text-sm font-semibold">{title || "Sign up"}</p>
                    <div className="space-y-2">
                      {selected
                        .map((k) => FIELD_LIBRARY.find((f) => f.key === k))
                        .filter(Boolean)
                        .map((f) => (
                          <div key={f.key} className="space-y-1">
                            <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                              {f.label}
                              {f.required ? " *" : ""}
                            </p>
                            <div className="h-7 rounded-md border border-dashed border-border bg-muted/40" />
                          </div>
                        ))}
                      <div className="mt-3 rounded-md bg-primary py-2 text-center text-xs font-medium text-primary-foreground">
                        {cta || "Submit"}
                      </div>
                    </div>
                  </div>
                </ScrollArea>
              </div>
            </div>
            <div className="mt-4 flex shrink-0 justify-end">
              <Button size="sm" onClick={() => setStep("publish")} disabled={!selected.length}>
                Generate JSON →
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="publish" className="mt-4 flex-1 min-h-0">
            <div className="grid h-full min-h-0 gap-6 lg:grid-cols-[1fr_320px]">
              <div className="flex min-h-0 flex-col">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-xs font-medium text-muted-foreground">Flow JSON (paste into Meta)</p>
                  <Button size="sm" variant="outline" onClick={() => copy(jsonText, "JSON copied")}>
                    <Copy className="mr-2 h-3.5 w-3.5" /> Copy JSON
                  </Button>
                </div>
                <ScrollArea className="flex-1 min-h-0 rounded-md border border-border bg-muted/30 p-3">
                  <pre className="whitespace-pre-wrap break-all font-mono text-[11px] leading-relaxed">
                    {jsonText}
                  </pre>
                </ScrollArea>
              </div>

              <div className="space-y-4">
                <div className="rounded-md border border-border/60 bg-card/30 p-3 text-[11px] leading-relaxed text-muted-foreground">
                  <p className="mb-2 text-xs font-semibold text-foreground">Publish steps</p>
                  <ol className="list-inside list-decimal space-y-1">
                    <li>Open Meta Business Manager → WhatsApp Manager → Flows.</li>
                    <li>Click <em>Create flow</em>, name it, choose <em>Without endpoint</em>.</li>
                    <li>In the editor, paste the JSON on the left.</li>
                    <li>Save → Publish. Copy the resulting numeric Flow ID.</li>
                    <li>Paste it below and click <em>Save flow</em>.</li>
                  </ol>
                  <Button asChild size="sm" variant="outline" className="mt-3 w-full">
                    <a
                      href="https://business.facebook.com/wa/manage/flows/"
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center justify-center gap-1.5"
                    >
                      <ExternalLink className="h-3.5 w-3.5" /> Open Meta Flows
                    </a>
                  </Button>
                </div>

                <div className="space-y-2 rounded-md border border-primary/30 bg-primary/5 p-3">
                  <Label className="text-xs font-semibold text-foreground">One-click publish</Label>
                  <p className="text-[11px] text-muted-foreground">
                    Creates the Flow on Meta, uploads the JSON and publishes it using the connected account's token.
                    Requires <code>whatsapp_business_management</code> permission.
                  </p>
                  <Button size="sm" className="w-full" onClick={publishToMeta} disabled={publishing || !selected.length}>
                    {publishing ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Publishing…</>
                    ) : (
                      <><Send className="mr-2 h-4 w-4" /> Publish to Meta</>
                    )}
                  </Button>
                </div>

                <div className="space-y-2 rounded-md border border-border/60 bg-card/30 p-3">
                  <Label>Numeric Flow ID from Meta</Label>
                  <Input
                    value={flowId}
                    onChange={(e) => setFlowId(e.target.value.replace(/[^0-9]/g, ""))}
                    placeholder="Auto-filled after publish, or paste manually"
                    inputMode="numeric"
                  />
                  <Button size="sm" className="w-full" onClick={saveFlow} disabled={!isValidFlowId(flowId)}>
                    <Check className="mr-2 h-4 w-4" /> Save flow
                  </Button>
                  <p className="text-[11px] text-muted-foreground">
                    Once saved, this Flow appears in the Template editor's FLOW button dropdown.
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
