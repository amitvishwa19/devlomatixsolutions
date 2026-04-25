"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, RefreshCw, Send, Trash2, Search, FileText, LayoutGrid, Sparkles, Eye, Pencil, CheckCircle2, AlertCircle, Upload as UploadIcon, BookTemplate } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { syncTemplates, deleteTemplate, createTemplate, editTemplate, sendTestTemplate, uploadMedia } from "./_actions/sync";
import { StatusBadge } from "../_components/StatusBadge";
import { TemplatePreview } from "../_components/TemplatePreview";
import { MediaPreview, detectMismatch } from "../_components/MediaPreview";
import { DeliveryTimeline } from "../_components/DeliveryTimeline";
import { GALLERY_PRESETS, TEMPLATE_TYPES, getBody, getHeader, getFooter } from "../_lib/templateGallery";
import { formatDate, isValidPhone } from "../_lib/validators";
import { getTestNumbers } from "../_lib/testNumbers";
import { getFlows } from "../_lib/flows";
import { useV2Data } from "../layout";

const LANGUAGES = ["en_US", "en_GB", "en", "es", "es_ES", "pt_BR", "fr", "de", "hi", "id", "ar", "it"];
const CATEGORIES = ["MARKETING", "UTILITY", "AUTHENTICATION"];

function countVariables(body) {
  const matches = String(body || "").match(/\{\{\d+\}\}/g);
  return matches ? matches.length : 0;
}

function getTemplateHeaderMeta(template) {
  const components = Array.isArray(template?.components) ? template.components : [];
  const header = components.find((item) => String(item?.type || "").toUpperCase() === "HEADER");
  const format = String(header?.format || "NONE").toUpperCase();
  const variableCount = format === "TEXT" ? countVariables(header?.text || "") : 0;
  return { header, format, variableCount };
}

function CreateTemplateDialog({ data, onCreated }) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [tab, setTab] = useState("gallery");
  const [typeFilter, setTypeFilter] = useState("all");
  const [extras, setExtras] = useState([]);
  const [headerFormat, setHeaderFormat] = useState("TEXT");
  const [headerExample, setHeaderExample] = useState(null);
  const [flowId, setFlowId] = useState("");
  const [savedFlows, setSavedFlows] = useState([]);

  const [form, setForm] = useState({
    account_id: data.defaultNumber?.id || "",
    name: "",
    language: "en_US",
    category: "MARKETING",
    header: "",
    body: "Hello {{1}}, your order {{2}} is on the way!",
    footer: "",
  });

  useEffect(() => {
    if (!open) return;
    setTab("gallery");
    setTypeFilter("all");
    setExtras([]);
    setHeaderFormat("TEXT");
    setHeaderExample(null);
    setFlowId("");
    setSavedFlows(getFlows());
    setForm((f) => ({ ...f, account_id: data.defaultNumber?.id || f.account_id }));
  }, [open, data.defaultNumber?.id]);

  const hasFlowButton = useMemo(
    () => extras.some((c) => c?.type === "BUTTONS" && Array.isArray(c.buttons) && c.buttons.some((b) => b?.type === "FLOW")),
    [extras]
  );

  const applyPreset = (preset) => {
    const header = getHeader(preset.components);
    const body = getBody(preset.components);
    const footer = getFooter(preset.components);
    const fmt = String(header?.format || "TEXT").toUpperCase();
    setHeaderFormat(header ? fmt : "NONE");
    setHeaderExample(header && fmt !== "TEXT" ? header.example || null : null);
    setForm((f) => ({
      ...f,
      name: preset.name,
      language: preset.language,
      category: preset.category,
      header: fmt === "TEXT" ? header?.text || "" : "",
      body: body?.text || "",
      footer: footer?.text || "",
    }));
    const preserved = (preset.components || []).filter((c) => {
      const t = String(c.type).toUpperCase();
      if (t === "BODY" || t === "FOOTER") return false;
      if (t === "HEADER" && String(c.format || "TEXT").toUpperCase() === "TEXT") return false;
      return true;
    });
    setExtras(preserved);
    setFlowId("");
    setTab("form");
    toast.success(`Loaded "${preset.title}" — edit and submit to Meta`);
  };

  const startBlank = () => {
    setExtras([]);
    setHeaderFormat("TEXT");
    setHeaderExample(null);
    setFlowId("");
    setForm((f) => ({
      ...f,
      name: "",
      header: "",
      body: "Hello {{1}}, your order {{2}} is on the way!",
      footer: "",
    }));
    setTab("form");
  };

  const previewComponents = useMemo(() => {
    const built = [];
    if (headerFormat === "TEXT" && form.header.trim()) {
      built.push({ type: "HEADER", format: "TEXT", text: form.header.slice(0, 60) });
    } else if (headerFormat !== "TEXT" && headerFormat !== "NONE") {
      built.push({ type: "HEADER", format: headerFormat, example: headerExample || undefined });
    }
    if (form.body.trim()) built.push({ type: "BODY", text: form.body.slice(0, 1024) });
    if (form.footer.trim()) built.push({ type: "FOOTER", text: form.footer.slice(0, 60) });
    extras.forEach((c) => built.push(c));
    return built;
  }, [form.header, form.body, form.footer, headerFormat, headerExample, extras]);

  const filteredPresets = typeFilter === "all" ? GALLERY_PRESETS : GALLERY_PRESETS.filter((p) => p.type === typeFilter);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.account_id) return toast.error("Select an account");
    if (!form.name.trim()) return toast.error("Template name is required");
    if (!form.body.trim()) return toast.error("Template body is required");

    let componentsToSend = previewComponents;
    if (hasFlowButton) {
      const num = Number(String(flowId).trim());
      if (!Number.isFinite(num) || num <= 0) {
        return toast.error("Enter a valid numeric Flow ID from Meta (e.g. 123456789012345)");
      }
      componentsToSend = previewComponents.map((c) => {
        if (c?.type !== "BUTTONS" || !Array.isArray(c.buttons)) return c;
        return {
          ...c,
          buttons: c.buttons.map((b) => (b?.type === "FLOW" ? { ...b, flow_id: num } : b)),
        };
      });
    }

    setBusy(true);
    try {
      const res = await createTemplate({
        account_id: form.account_id,
        name: form.name,
        language: form.language,
        category: form.category,
        components: componentsToSend,
      });
      if (!res.success) throw new Error(res.error);
      toast.success("Template submitted to Meta — status will appear as 'In review'");
      setOpen(false);
      onCreated();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="bg-primary text-primary-foreground hover:opacity-90">
          <Plus className="mr-2 h-4 w-4" /> New template
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[80vw] max-w-[80vw] h-[80vh] max-h-[80vh] p-0 flex flex-col overflow-hidden sm:rounded-lg">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle>Create WhatsApp template</DialogTitle>
          <p className="text-xs text-muted-foreground">
            Pick a Meta-approved layout from the gallery, tweak the copy, then submit for review.
          </p>
        </DialogHeader>
        <Tabs value={tab} onValueChange={setTab} className="flex-1 min-h-0 flex flex-col px-6 pb-6">
          <TabsList className="w-fit">
            <TabsTrigger value="gallery">
              <LayoutGrid className="mr-2 h-4 w-4" /> Visual gallery
            </TabsTrigger>
            <TabsTrigger value="form">
              <FileText className="mr-2 h-4 w-4" /> Template details
            </TabsTrigger>
          </TabsList>

          <TabsContent value="gallery" className="flex-1 min-h-0 mt-4">
            <div className="flex h-full flex-col gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-xs font-medium text-muted-foreground">Filter by type:</span>
                <Button
                  size="sm"
                  variant={typeFilter === "all" ? "default" : "outline"}
                  onClick={() => setTypeFilter("all")}
                  className="h-7 text-xs"
                >
                  All
                </Button>
                {TEMPLATE_TYPES.map((t) => (
                  <Button
                    key={t.id}
                    size="sm"
                    variant={typeFilter === t.id ? "default" : "outline"}
                    onClick={() => setTypeFilter(t.id)}
                    className="h-7 text-xs"
                  >
                    {t.label}
                  </Button>
                ))}
                <div className="ml-auto">
                  <Button size="sm" variant="ghost" onClick={startBlank} className="text-xs">
                    Start from blank →
                  </Button>
                </div>
              </div>

              <ScrollArea className="flex-1 min-h-0 pr-4">
                <div className="grid grid-cols-1 gap-4 pb-4 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredPresets.map((preset) => (
                    <div
                      key={preset.id}
                      className="group flex flex-col rounded-lg border border-border/60 bg-card/40 p-4 transition-all hover:border-primary/50 hover:shadow-soft"
                    >
                      <div className="mb-3 flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold">{preset.title}</p>
                          <p className="mt-0.5 line-clamp-2 text-[11px] text-muted-foreground">{preset.description}</p>
                        </div>
                        <Badge variant="secondary" className="shrink-0 text-[10px]">
                          {preset.category}
                        </Badge>
                      </div>
                      <div className="flex-1">
                        <TemplatePreview components={preset.components} compact />
                      </div>
                      <Button
                        size="sm"
                        className="mt-3 w-full"
                        onClick={() => applyPreset(preset)}
                      >
                        Use this template
                      </Button>
                    </div>
                  ))}
                </div>
                {!filteredPresets.length && (
                  <p className="py-12 text-center text-sm text-muted-foreground">No presets in this category yet.</p>
                )}
              </ScrollArea>
            </div>
          </TabsContent>

          <TabsContent value="form" className="flex-1 min-h-0 mt-4">
            <div className="grid h-full min-h-0 gap-6 lg:grid-cols-[1fr_360px]">
              <ScrollArea className="h-full pr-4">
                <form onSubmit={submit} className="grid gap-4 md:grid-cols-2 pb-2">
                  <div className="space-y-2 md:col-span-2">
                    <Label>Account *</Label>
                    <Select value={form.account_id} onValueChange={(v) => setForm({ ...form, account_id: v })}>
                      <SelectTrigger><SelectValue placeholder="Select WhatsApp account" /></SelectTrigger>
                      <SelectContent>
                        {(data.phoneNumbers.data || []).map((n) => (
                          <SelectItem key={n.id} value={n.id}>{n.display_name} — {n.phone_number}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Name * (lowercase, underscores)</Label>
                    <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="order_shipped" maxLength={512} />
                  </div>
                  <div className="space-y-2">
                    <Label>Language *</Label>
                    <Select value={form.language} onValueChange={(v) => setForm({ ...form, language: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{LANGUAGES.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>Category *</Label>
                    <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>Header type</Label>
                    <Select value={headerFormat} onValueChange={setHeaderFormat}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="NONE">None</SelectItem>
                        <SelectItem value="TEXT">Text</SelectItem>
                        <SelectItem value="IMAGE">Image</SelectItem>
                        <SelectItem value="VIDEO">Video</SelectItem>
                        <SelectItem value="DOCUMENT">Document</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {headerFormat === "TEXT" && (
                    <div className="space-y-2 md:col-span-2">
                      <Label>Header text (max 60 chars)</Label>
                      <Input value={form.header} onChange={(e) => setForm({ ...form, header: e.target.value })} maxLength={60} />
                    </div>
                  )}
                  <div className="space-y-2 md:col-span-2">
                    <Label>Body * — use {`{{1}}, {{2}}`} for variables</Label>
                    <Textarea rows={4} value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} maxLength={1024} />
                    <p className="text-xs text-muted-foreground">{countVariables(form.body)} variable(s) detected · {form.body.length}/1024</p>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>Footer (optional, max 60 chars)</Label>
                    <Input value={form.footer} onChange={(e) => setForm({ ...form, footer: e.target.value })} maxLength={60} />
                  </div>
                  {!!extras.length && (
                    <div className="md:col-span-2 rounded-md border border-border/60 bg-card/40 p-3">
                      <p className="text-xs font-medium">Preserved from preset</p>
                      <p className="mt-1 text-[11px] text-muted-foreground">
                        Buttons, carousel cards, and media headers from the gallery preset will be submitted to Meta as-is.
                        Edit them in the JSON later if needed.
                      </p>
                      <ul className="mt-2 flex flex-wrap gap-1">
                        {extras.map((c, i) => (
                          <Badge key={i} variant="outline" className="text-[10px]">
                            {String(c.type).toLowerCase()}
                            {c.format ? ` · ${String(c.format).toLowerCase()}` : ""}
                          </Badge>
                        ))}
                      </ul>
                    </div>
                  )}
                  {hasFlowButton && (
                    <div className="md:col-span-2 space-y-2 rounded-md border border-primary/30 bg-primary/5 p-3">
                      <Label>Meta Flow * (numeric ID)</Label>
                      {savedFlows.length > 0 && (
                        <Select
                          value={savedFlows.find((f) => f.flow_id === flowId) ? flowId : ""}
                          onValueChange={(v) => setFlowId(v)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Pick a saved flow" />
                          </SelectTrigger>
                          <SelectContent>
                            {savedFlows.map((f) => (
                              <SelectItem key={f.flow_id} value={f.flow_id}>
                                {f.name} — {f.flow_id}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                      <Input
                        value={flowId}
                        onChange={(e) => setFlowId(e.target.value.replace(/[^0-9]/g, ""))}
                        placeholder={savedFlows.length ? "…or paste a different flow ID" : "e.g. 123456789012345"}
                        inputMode="numeric"
                      />
                      <p className="text-[11px] text-muted-foreground">
                        {savedFlows.length
                          ? "Pick a saved Flow above, or paste any numeric Flow ID."
                          : "Tip: register your published Flows in the Flows screen so they appear here as a dropdown."}
                      </p>
                    </div>
                  )}
                  <div className="md:col-span-2 flex items-center justify-between gap-2 pt-2">
                    <Button size="sm" type="button" variant="ghost" onClick={() => setTab("gallery")}>
                      ← Back to gallery
                    </Button>
                    <div className="flex gap-2">
                      <Button size="sm" type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                      <Button size="sm" type="submit" disabled={busy}>{busy ? "Submitting..." : "Submit to Meta"}</Button>
                    </div>
                  </div>
                </form>
              </ScrollArea>

              <div className="hidden lg:flex flex-col rounded-lg border border-border/60 bg-card/30 p-4">
                <div className="mb-3 flex items-center gap-2 text-xs font-medium text-muted-foreground">
                  <Eye className="h-3.5 w-3.5" /> Live preview
                </div>
                <div className="flex-1 overflow-auto">
                  <TemplatePreview components={previewComponents} />
                </div>
                <p className="mt-3 text-[11px] text-muted-foreground">
                  After submission, the template appears as <span className="font-medium">In review</span> until Meta
                  approves it. Click <span className="font-medium">Sync</span> to refresh status.
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

function SendTestDialog({ template, onDone }) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const bodyText = useMemo(() => {
    const c = (Array.isArray(template.components) ? template.components : []).find((x) => String(x.type).toUpperCase() === "BODY");
    return c?.text || "";
  }, [template]);
  const varCount = countVariables(bodyText);
  const [savedNumbers, setSavedNumbers] = useState([]);
  const [recipientMode, setRecipientMode] = useState("saved");
  const [savedPhone, setSavedPhone] = useState("");
  const [customPhone, setCustomPhone] = useState("");
  const [vars, setVars] = useState(Array(varCount).fill(""));
  const headerMeta = useMemo(() => getTemplateHeaderMeta(template), [template]);
  const [headerUrl, setHeaderUrl] = useState("");
  const [headerMediaId, setHeaderMediaId] = useState("");
  const [headerFile, setHeaderFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [headerSource, setHeaderSource] = useState("upload");
  const [headerVars, setHeaderVars] = useState(Array(headerMeta.variableCount).fill(""));
  const [uploadStatus, setUploadStatus] = useState(null);
  const [uploadError, setUploadError] = useState(null);
  const [sendStatus, setSendStatus] = useState(null);
  const [sendError, setSendError] = useState(null);
  const [sentMessageId, setSentMessageId] = useState(null);

  useEffect(() => {
    if (!open) return;
    (async () => {
      try {
        const list = await getTestNumbers();
        setSavedNumbers(list);
        if (list.length) { setRecipientMode("saved"); setSavedPhone(list[0].phone); }
        else { setRecipientMode("custom"); }
      } catch (_) { setSavedNumbers([]); setRecipientMode("custom"); }
      setVars(Array(varCount).fill(""));
      setHeaderUrl("");
      setHeaderMediaId("");
      setHeaderFile(null);
      setHeaderSource("upload");
      setHeaderVars(Array(headerMeta.variableCount).fill(""));
      setUploadStatus(null);
      setUploadError(null);
      setSendStatus(null);
      setSendError(null);
      setSentMessageId(null);
    })();
  }, [open, varCount, headerMeta.variableCount]);

  const onPickFile = async (file) => {
    if (!file) return;
    const fmt = headerMeta.format;
    const maxBytes = fmt === "IMAGE" ? 5 * 1024 * 1024 : fmt === "VIDEO" ? 16 * 1024 * 1024 : 100 * 1024 * 1024;
    if (file.size > maxBytes) {
      return toast.error(`File too large. Max ${(maxBytes / (1024 * 1024)).toFixed(0)}MB for ${fmt.toLowerCase()}.`);
    }
    setHeaderFile(file);
    setHeaderMediaId("");
    setUploadStatus(null);
    setUploadError(null);
    const mismatch = detectMismatch(file, fmt);
    if (mismatch) {
      toast.error(mismatch);
      return;
    }
    setUploading(true);
    try {
      const reader = new FileReader();
      const base64 = await new Promise((resolve, reject) => {
        reader.onload = () => resolve(String(reader.result || "").split(",").pop());
        reader.onerror = () => reject(new Error("Could not read file"));
        reader.readAsDataURL(file);
      });
      const res = await uploadMedia({
        file_base64: base64,
        mime_type: file.type || "application/octet-stream",
        filename: file.name,
      });
      if (!res.success) throw new Error(res.error);
      setHeaderMediaId(res.media_id);
      setUploadStatus("ok");
      toast.success("Media uploaded");
    } catch (err) {
      setUploadStatus("failed");
      setUploadError(err.message);
      toast.error(err.message);
    } finally {
      setUploading(false);
    }
  };

  const retryUpload = async () => {
    if (headerFile) await onPickFile(headerFile);
  };

  const submit = async (e) => {
    e.preventDefault();
    setSendStatus(null);
    setSendError(null);
    setSentMessageId(null);
    const to = recipientMode === "saved" ? savedPhone : customPhone.trim();
    if (!isValidPhone(to)) return toast.error("Enter a valid phone with country code");
    if (vars.some((v) => !v.trim())) return toast.error("Fill all template variables");
    const needsMedia = ["IMAGE", "VIDEO", "DOCUMENT"].includes(headerMeta.format);
    if (needsMedia && headerSource === "upload" && !headerMediaId) {
      return toast.error(`Upload a ${headerMeta.format.toLowerCase()} file for the header`);
    }
    if (needsMedia && headerSource === "url" && !headerUrl.trim()) {
      return toast.error(`Provide a public ${headerMeta.format.toLowerCase()} URL for the header`);
    }
    if (headerMeta.variableCount > 0 && headerVars.some((v) => !v.trim())) {
      return toast.error("Fill all header variables");
    }
    setBusy(true);
    try {
      const res = await sendTestTemplate({
        template_id: template.id,
        to,
        variables: vars,
        header_media_url: headerSource === "url" ? (headerUrl.trim() || undefined) : undefined,
        header_media_id: headerSource === "upload" ? (headerMediaId || undefined) : undefined,
        header_variables: headerVars,
      });
      if (!res.success) throw new Error(res.error);
      setSendStatus("ok");
      setSentMessageId(res.result?.messages?.[0]?.id || null);
      toast.success("Sent");
      onDone?.();
    } catch (err) {
      setSendStatus("failed");
      setSendError(err.message);
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  const isApproved = String(template.status || "").toUpperCase() === "APPROVED";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" disabled={!isApproved} title={isApproved ? "Send test template" : "Only APPROVED templates can be sent"}>
          <Send className="mr-2 h-3.5 w-3.5" /> Test
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Send test: {template.name}</DialogTitle></DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="rounded-md border border-border/60 bg-card/40 p-3 text-sm">
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Body preview</p>
            <p className="mt-1 whitespace-pre-wrap">{bodyText || "—"}</p>
          </div>

          {headerMeta.format !== "NONE" && (
            <div className="space-y-2 rounded-md border border-border/60 bg-card/40 p-3">
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Header</p>
              {headerMeta.format === "TEXT" ? (
                headerMeta.variableCount > 0 ? (
                  <div className="space-y-2">
                    {headerVars.map((value, index) => (
                      <div key={index} className="space-y-1.5">
                        <Label className="text-xs">{`Header variable {{${index + 1}}}`}</Label>
                        <Input
                          value={value}
                          onChange={(e) => {
                            const next = [...headerVars];
                            next[index] = e.target.value;
                            setHeaderVars(next);
                          }}
                          maxLength={60}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">Static text header — no extra input required.</p>
                )
              ) : (
                <div className="space-y-2">
                  <div className="flex gap-1 rounded-md bg-muted p-1 text-xs">
                    <button
                      type="button"
                      onClick={() => setHeaderSource("upload")}
                      className={`flex-1 rounded px-2 py-1 transition-colors ${headerSource === "upload" ? "bg-background shadow-sm font-medium" : "text-muted-foreground"}`}
                    >
                      Upload file
                    </button>
                    <button
                      type="button"
                      onClick={() => setHeaderSource("url")}
                      className={`flex-1 rounded px-2 py-1 transition-colors ${headerSource === "url" ? "bg-background shadow-sm font-medium" : "text-muted-foreground"}`}
                    >
                      Public URL
                    </button>
                  </div>

                  {headerSource === "upload" ? (
                    <div className="space-y-1.5">
                      <Label className="text-xs">Local {headerMeta.format.toLowerCase()} file</Label>
                      <Input
                        type="file"
                        accept={headerMeta.format === "IMAGE" ? "image/jpeg,image/png" : headerMeta.format === "VIDEO" ? "video/mp4,video/3gpp" : "application/pdf"}
                        onChange={(e) => onPickFile(e.target.files?.[0])}
                        disabled={uploading}
                      />
                      <MediaPreview file={headerFile} expectedFormat={headerMeta.format} />
                      {uploading && (
                        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                          <UploadIcon className="h-3 w-3 animate-pulse" /> Uploading to Meta…
                        </div>
                      )}
                      {uploadStatus === "ok" && !uploading && (
                        <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 className="h-3 w-3" /> Upload OK · media_id <code>{headerMediaId.slice(0, 16)}…</code>
                        </div>
                      )}
                      {uploadStatus === "failed" && !uploading && (
                        <div className="flex items-start justify-between gap-2 rounded-md border border-destructive/40 bg-destructive/10 p-2 text-[11px] text-destructive">
                          <div className="flex items-start gap-1.5">
                            <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                            <span><span className="font-medium">Upload failed</span> — {uploadError}</span>
                          </div>
                          <button type="button" onClick={retryUpload} className="shrink-0 underline">Retry</button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      <Label className="text-xs">Public {headerMeta.format.toLowerCase()} URL</Label>
                      <Input value={headerUrl} onChange={(e) => setHeaderUrl(e.target.value)} placeholder="https://…" />
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label>Recipient *</Label>
            <Select value={recipientMode} onValueChange={setRecipientMode}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="saved" disabled={!savedNumbers.length}>
                  {savedNumbers.length ? "Saved test number" : "No saved test numbers"}
                </SelectItem>
                <SelectItem value="custom">Custom number</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {recipientMode === "saved" ? (
            <div className="space-y-2">
              <Label>Pick a saved number</Label>
              {savedNumbers.length > 1 ? (
                <Select value={savedPhone} onValueChange={setSavedPhone}>
                  <SelectTrigger><SelectValue placeholder="Select test number" /></SelectTrigger>
                  <SelectContent>
                    {savedNumbers.map((n) => <SelectItem key={n.phone} value={n.phone}>{n.label} — {n.phone}</SelectItem>)}
                  </SelectContent>
                </Select>
              ) : savedNumbers.length === 1 ? (
                <div className="rounded-md border border-border/60 bg-card/40 px-3 py-2 text-sm">
                  <span className="font-medium">{savedNumbers[0].label}</span>
                  <span className="text-muted-foreground"> — {savedNumbers[0].phone}</span>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">Add test numbers in Settings → Test numbers.</p>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <Label>Phone (with country code)</Label>
              <Input value={customPhone} onChange={(e) => setCustomPhone(e.target.value)} placeholder="+919876543210" />
            </div>
          )}

          {vars.map((v, i) => (
            <div key={i} className="space-y-2">
              <Label>{`Variable {{${i + 1}}}`}</Label>
              <Input value={v} onChange={(e) => { const next = [...vars]; next[i] = e.target.value; setVars(next); }} maxLength={512} />
            </div>
          ))}
          <div className="flex justify-end gap-2">
            <Button size="sm" type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button size="sm" type="submit" disabled={busy || uploading}>{busy ? "Sending..." : sendStatus === "ok" ? "Send again" : "Send"}</Button>
          </div>

          {sendStatus === "failed" && (
            <div className="flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/10 p-2.5 text-xs text-destructive">
              <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <span><span className="font-medium">Send failed</span> — {sendError}</span>
            </div>
          )}
          {sendStatus === "ok" && (
            <div className="flex items-center gap-1.5 rounded-md border border-emerald-500/40 bg-emerald-500/10 p-2.5 text-xs text-emerald-700 dark:text-emerald-400">
              <CheckCircle2 className="h-3.5 w-3.5" /> Accepted by Meta — tracking delivery below.
            </div>
          )}
          {sentMessageId && <DeliveryTimeline messageId={sentMessageId} />}
        </form>
      </DialogContent>
    </Dialog>
  );
}

function EditTemplateDialog({ template, accountId, onDone }) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const initial = useMemo(() => {
    const comps = Array.isArray(template.components) ? template.components : [];
    const header = comps.find((c) => String(c.type).toUpperCase() === "HEADER");
    const body = comps.find((c) => String(c.type).toUpperCase() === "BODY");
    const footer = comps.find((c) => String(c.type).toUpperCase() === "FOOTER");
    const headerFmt = String(header?.format || "TEXT").toUpperCase();
    return {
      headerFmt: header ? headerFmt : "NONE",
      header: headerFmt === "TEXT" ? header?.text || "" : "",
      body: body?.text || "",
      footer: footer?.text || "",
      category: template.category || "MARKETING",
      extras: comps.filter((c) => {
        const t = String(c.type).toUpperCase();
        if (t === "BODY" || t === "FOOTER") return false;
        if (t === "HEADER" && String(c.format || "TEXT").toUpperCase() === "TEXT") return false;
        return true;
      }),
    };
  }, [template]);

  const [form, setForm] = useState(initial);
  useEffect(() => { if (open) setForm(initial); }, [open, initial]);

  const previewComponents = useMemo(() => {
    const built = [];
    if (form.headerFmt === "TEXT" && form.header.trim()) built.push({ type: "HEADER", format: "TEXT", text: form.header.slice(0, 60) });
    if (form.body.trim()) built.push({ type: "BODY", text: form.body.slice(0, 1024) });
    if (form.footer.trim()) built.push({ type: "FOOTER", text: form.footer.slice(0, 60) });
    form.extras.forEach((c) => built.push(c));
    return built;
  }, [form]);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.body.trim()) return toast.error("Body is required");
    setBusy(true);
    try {
      const res = await editTemplate({
        account_id: accountId,
        template_id: template.id,
        category: form.category,
        components: previewComponents,
      });
      if (!res.success) throw new Error(res.error);
      toast.success("Edit submitted to Meta — status will reflect review state");
      setOpen(false);
      onDone?.();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  const status = String(template.status || "").toUpperCase();
  const editable = status === "APPROVED" || status === "PAUSED" || status === "REJECTED";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" disabled={!editable} title={editable ? "Edit template" : "Only APPROVED, PAUSED, or REJECTED templates can be edited"}>
          <Pencil className="h-3.5 w-3.5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[80vw] max-w-[80vw] h-[80vh] max-h-[80vh] p-0 flex flex-col overflow-hidden sm:rounded-lg">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle>Edit template: {template.name}</DialogTitle>
          <p className="text-xs text-muted-foreground">
            Meta only allows editing <span className="font-medium">category</span> and <span className="font-medium">components</span>.
          </p>
        </DialogHeader>
        <div className="grid h-full min-h-0 flex-1 gap-6 px-6 pb-6 lg:grid-cols-[1fr_360px]">
          <ScrollArea className="h-full pr-4">
            <form onSubmit={submit} className="grid gap-4 md:grid-cols-2 pb-2">
              <div className="space-y-2 md:col-span-2">
                <Label>Category</Label>
                <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Header type</Label>
                <Select value={form.headerFmt} onValueChange={(v) => setForm({ ...form, headerFmt: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NONE">None</SelectItem>
                    <SelectItem value="TEXT">Text</SelectItem>
                    <SelectItem value="IMAGE" disabled>Image (Edit from JSON)</SelectItem>
                    <SelectItem value="VIDEO" disabled>Video (Edit from JSON)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {form.headerFmt === "TEXT" && (
                <div className="space-y-2 md:col-span-2">
                  <Label>Header text</Label>
                  <Input value={form.header} onChange={(e) => setForm({ ...form, header: e.target.value })} maxLength={60} />
                </div>
              )}
              <div className="space-y-2 md:col-span-2">
                <Label>Body *</Label>
                <Textarea rows={6} value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} maxLength={1024} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Footer</Label>
                <Input value={form.footer} onChange={(e) => setForm({ ...form, footer: e.target.value })} maxLength={60} />
              </div>
              <div className="md:col-span-2 flex justify-end gap-2 pt-2">
                <Button size="sm" type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button size="sm" type="submit" disabled={busy}>{busy ? "Saving..." : "Submit edit"}</Button>
              </div>
            </form>
          </ScrollArea>
          <div className="hidden lg:flex flex-col rounded-lg border border-border/60 bg-card/30 p-4">
            <div className="mb-3 flex items-center gap-2 text-xs font-medium text-muted-foreground"><Eye className="h-3.5 w-3.5" /> Preview</div>
            <div className="flex-1 overflow-auto"><TemplatePreview components={previewComponents} /></div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function TemplatesPage() {
  const data = useV2Data();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [syncing, setSyncing] = useState(false);
  const rows = data.templates.data || [];

  const filtered = useMemo(() => {
    let list = rows;
    if (filter !== "all") list = list.filter((r) => String(r.status).toUpperCase() === filter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((r) => r.name.toLowerCase().includes(q) || r.category.toLowerCase().includes(q));
    }
    return list;
  }, [rows, filter, search]);

  const sync = async () => {
    setSyncing(true);
    try {
      const res = await syncTemplates({ account_id: data.defaultNumber?.id });
      if (!res.success) throw new Error(res.error);
      toast.success("Templates synced with Meta");
      data.templates.refetch();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setSyncing(false);
    }
  };

  const del = async (id) => {
    if (!confirm("Are you sure? This will remove the template from Meta as well.")) return;
    try {
      const res = await deleteTemplate(id, data.defaultNumber?.id);
      if (!res.success) throw new Error(res.error);
      toast.success("Template deleted");
      data.templates.refetch();
    } catch (e) {
      toast.error(e.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Message Templates</h2>
          <p className="text-sm text-muted-foreground">Sync and manage your approved WhatsApp message formats.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={sync} disabled={syncing}>
            <RefreshCw className={`mr-2 h-3.5 w-3.5 ${syncing ? "animate-spin" : ""}`} /> Sync
          </Button>
          <CreateTemplateDialog data={data} onCreated={() => data.templates.refetch()} />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative w-full max-w-xs">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search templates..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="APPROVED">Approved</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="REJECTED">Rejected</SelectItem>
          </SelectContent>
        </Select>
        <Badge variant="outline" className="h-7 px-3">{filtered.length} TEMPLATES</Badge>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map((t) => (
          <Card key={t.id} className="group relative flex flex-col overflow-hidden rounded-md border-border/60 bg-card shadow-sm transition-all hover:border-primary/40 hover:shadow-md">
            <CardHeader className="p-4 pb-2 border-b border-border/60">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <CardTitle className="truncate text-sm font-bold">{t.name}</CardTitle>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-0.5">{t.category}</p>
                </div>
                <StatusBadge status={t.status} />
              </div>
            </CardHeader>
            <CardContent className="flex-1 p-4 flex flex-col">
              <div className="flex-1 overflow-hidden rounded border border-border/40 bg-muted/20">
                <ScrollArea className="h-48 p-2">
                  <TemplatePreview components={t.components} compact />
                </ScrollArea>
              </div>
              <div className="mt-4 flex items-center justify-between gap-2">
                <span className="text-[10px] font-bold uppercase tracking-tighter text-muted-foreground">{t.language} · {t.components?.length || 0} comps</span>
                <div className="flex items-center gap-1.5">
                  <SendTestDialog template={t} onDone={() => data.templates.refetch()} />
                  <EditTemplateDialog template={t} accountId={data.defaultNumber?.id} onDone={() => data.templates.refetch()} />
                  <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive" onClick={() => del(t.id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {!filtered.length && !rows.length && (
        <div className="flex flex-col items-center justify-center space-y-4 rounded-lg border border-dashed border-border/60 py-24 text-center">
          <div className="rounded-full bg-primary/10 p-4"><BookTemplate className="h-8 w-8 text-primary" /></div>
          <div>
            <p className="text-base font-bold italic uppercase tracking-widest">No templates found</p>
            <p className="mt-1 text-sm text-muted-foreground">Sync with Meta or create your first template to get started.</p>
          </div>
          <Button variant="outline" size="sm" onClick={sync} disabled={syncing}>
            <RefreshCw className={`mr-2 h-3.5 w-3.5 ${syncing ? "animate-spin" : ""}`} /> Sync with Meta
          </Button>
        </div>
      )}
    </div>
  );
}
