import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, FileImage, Image as ImageIcon, MessageSquare, Send, Smartphone, User } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { cloudAction } from "../lib/api";
import { isValidPhone, normalizePhone } from "../lib/validators";

// === Local server-function alternatives (uncomment to switch from edge → local) ===
// import * as sendFn from "../functions/send";
// =================================================================================


function substitute(text, vars) {
  if (!text) return "";
  return String(text).replace(/\{\{\s*(\d+)\s*\}\}/g, (_, n) => {
    const i = Number(n) - 1;
    return vars[i] != null && String(vars[i]).trim() !== "" ? String(vars[i]) : `{{${n}}}`;
  });
}

function PreviewBubble({ children, footer }) {
  return (
    <div className="rounded-2xl rounded-br-sm bg-[#dcf8c6] p-3 text-sm text-emerald-950 shadow-sm dark:bg-emerald-200/90">
      <div className="space-y-2">{children}</div>
      <p className="mt-2 text-right text-[10px] text-emerald-800/70">{footer}</p>
    </div>
  );
}

function PhonePreview({ accountName, children }) {
  return (
    <div className="mx-auto w-full max-w-[320px] overflow-hidden rounded-3xl border border-border bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22120%22 height=%22120%22><rect width=%22120%22 height=%22120%22 fill=%22%23ece5dd%22/></svg>')] shadow-elevated">
      <div className="flex items-center gap-2 bg-emerald-700 px-3 py-2 text-white">
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20">
          <User className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-semibold">Recipient preview</p>
          <p className="truncate text-[10px] text-white/80">via {accountName || "default account"}</p>
        </div>
        <Smartphone className="h-4 w-4 opacity-80" />
      </div>
      <div className="min-h-[180px] space-y-2 p-3">
        <div className="flex justify-end">{children}</div>
      </div>
    </div>
  );
}

function getTemplateHeaderMeta(tpl) {
  const components = Array.isArray(tpl?.components) ? tpl.components : [];
  const header = components.find((c) => String(c?.type || "").toUpperCase() === "HEADER");
  const format = String(header?.format || "NONE").toUpperCase();
  const variableCount = format === "TEXT" ? countTemplateVars({ components: [header] }) : 0;
  return { header, format, variableCount };
}

export function SendMessage({ data }) {
  const [tab, setTab] = useState("text");
  const [busy, setBusy] = useState(false);
  const [confirm, setConfirm] = useState(null); // { kind, payload, summary }
  const contacts = data.contacts?.data || [];
  const mediaAssets = (data.media?.data || []).filter((m) => !!m.source_url);
  const approved = (data.templates.data || []).filter((item) => String(item.status).toUpperCase() === "APPROVED");
  const activeAccount = data.activeAccount;

  // Shared recipient picker — defaults to free-text but can pick from saved contacts
  const [contactId, setContactId] = useState("");
  const selectedContact = useMemo(() => contacts.find((c) => c.id === contactId), [contacts, contactId]);

  // Form state per kind
  const [text, setText] = useState({ to: "", body: "" });
  const [media, setMedia] = useState({ to: "", type: "image", media_url: "", caption: "", asset_id: "" });
  const [template, setTemplate] = useState({ to: "", template_id: "", values: [], header_media_url: "", header_values: [] });

  // When the user picks a contact, propagate to the active form
  useEffect(() => {
    if (!selectedContact) return;
    const phone = selectedContact.phone_number;
    setText((s) => ({ ...s, to: phone }));
    setMedia((s) => ({ ...s, to: phone }));
    setTemplate((s) => ({ ...s, to: phone }));
  }, [selectedContact]);

  // When picking a media asset, copy its URL & type into the form
  const onPickAsset = (id) => {
    setMedia((s) => {
      const next = { ...s, asset_id: id };
      const asset = mediaAssets.find((m) => m.id === id);
      if (asset) {
        next.media_url = asset.source_url || "";
        if (asset.media_type) next.type = asset.media_type;
      }
      return next;
    });
  };

  // When picking a template, prepare value slots equal to its variable count
  const onPickTemplate = (id) => {
    setTemplate((s) => {
      const tpl = approved.find((t) => t.id === id);
      const count = tpl ? countTemplateVars(tpl) : 0;
      const headerMeta = getTemplateHeaderMeta(tpl);
      return {
        ...s,
        template_id: id,
        values: Array(count).fill(""),
        header_media_url: "",
        header_values: Array(headerMeta.variableCount).fill(""),
      };
    });
  };

  const validate = (kind, payload) => {
    if (!activeAccount) return "No active WhatsApp account — pick one from the top nav.";
    if (!isValidPhone(payload.to)) return "Enter a valid recipient phone number with country code.";
    if (kind === "text" && !payload.body?.trim()) return "Message body is required.";
    if (kind === "media" && !payload.media_url?.trim()) return "Media URL is required.";
    if (kind === "template") {
      if (!payload.template_id) return "Pick an approved template.";
      const tpl = approved.find((t) => t.id === payload.template_id);
      const headerMeta = getTemplateHeaderMeta(tpl);
      if (["IMAGE", "VIDEO", "DOCUMENT"].includes(headerMeta.format) && !payload.header_media_url?.trim()) {
        return `Provide a public ${headerMeta.format.toLowerCase()} URL for the template header.`;
      }
      if (headerMeta.variableCount > 0 && payload.header_variables?.some((value) => !String(value || "").trim())) {
        return "Fill all template header variables.";
      }
    }
    return null;
  };

  const openConfirm = (kind) => {
    let payload;
    let summary;
    if (kind === "text") {
      payload = { kind: "text", to: text.to, body: text.body };
      summary = { headline: text.body, sub: "Plain text" };
    } else if (kind === "media") {
      payload = { kind: "media", to: media.to, type: media.type, media_url: media.media_url, caption: media.caption };
      summary = { headline: media.caption || media.media_url, sub: `Media · ${media.type}` };
    } else {
      const tpl = approved.find((t) => t.id === template.template_id);
      payload = {
        kind: "template",
        to: template.to,
        template_id: tpl?.id,
        variables: template.values,
        header_media_url: template.header_media_url,
        header_variables: template.header_values,
      };
      summary = { headline: tpl ? renderTemplate(tpl, template.values) : "—", sub: tpl ? `Template · ${tpl.name}` : "Template" };
    }
    const error = validate(kind, payload);
    if (error) return toast.error(error);
    payload.to = normalizePhone(payload.to);
    payload.account_id = activeAccount.id;
    setConfirm({ kind, payload, summary });
  };

  const send = async () => {
    if (!confirm) return;
    setBusy(true);
    try {
      // LOCAL: await sendFn.sendMessage(/* same payload as edge call below */);
      await cloudAction("send_message", confirm.payload);
      toast.success("Message queued");
      setConfirm(null);
      data.refetchAll();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setBusy(false);
    }
  };

  // === Live preview content ===
  const previewBody = (() => {
    if (tab === "text") return text.body || "Your message will appear here…";
    if (tab === "media") return media.caption || "(no caption)";
    if (tab === "template") {
      const tpl = approved.find((t) => t.id === template.template_id);
      return tpl ? renderTemplate(tpl, template.values) : "Pick a template to preview…";
    }
    return "";
  })();

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
      <Card className="rounded-lg">
        <CardHeader className="flex flex-row items-center justify-between gap-3">
          <CardTitle>Compose message</CardTitle>
          <Badge variant="outline" className="gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            Sending via {activeAccount?.display_name || "no account"}
          </Badge>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 rounded-lg border border-border/60 bg-card/40 p-3 md:grid-cols-[1fr_1fr]">
            <div className="space-y-2">
              <Label>Pick a saved contact</Label>
              <Select value={contactId} onValueChange={setContactId}>
                <SelectTrigger><SelectValue placeholder={contacts.length ? "Choose a contact…" : "No saved contacts"} /></SelectTrigger>
                <SelectContent>
                  {contacts.slice(0, 200).map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name} — {c.phone_number}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Or recipient phone</Label>
              <Input
                value={tab === "text" ? text.to : tab === "media" ? media.to : template.to}
                onChange={(e) => {
                  const v = e.target.value;
                  setContactId("");
                  if (tab === "text") setText({ ...text, to: v });
                  if (tab === "media") setMedia({ ...media, to: v });
                  if (tab === "template") setTemplate({ ...template, to: v });
                }}
                placeholder="+919876543210"
              />
            </div>
          </div>

          <Tabs value={tab} onValueChange={setTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="text"><MessageSquare className="mr-1 h-3.5 w-3.5" /> Text</TabsTrigger>
              <TabsTrigger value="template">Template</TabsTrigger>
              <TabsTrigger value="media"><ImageIcon className="mr-1 h-3.5 w-3.5" /> Media</TabsTrigger>
            </TabsList>

            <TabsContent value="text" className="space-y-3 pt-4">
              <div className="space-y-2">
                <Label>Message</Label>
                <Textarea
                  rows={7} maxLength={4096}
                  value={text.body}
                  onChange={(e) => setText({ ...text, body: e.target.value })}
                  placeholder="Type your WhatsApp message…"
                />
                <p className="text-right text-[11px] text-muted-foreground">{text.body.length}/4096</p>
              </div>
              <Button size="sm" disabled={busy || !text.body.trim()} onClick={() => openConfirm("text")}>
                <Send className="mr-2 h-4 w-4" /> Review &amp; send
              </Button>
            </TabsContent>

            <TabsContent value="template" className="space-y-3 pt-4">
              <div className="space-y-2">
                <Label>Approved template</Label>
                <Select value={template.template_id} onValueChange={onPickTemplate}>
                  <SelectTrigger><SelectValue placeholder={approved.length ? "Choose template" : "No approved templates"} /></SelectTrigger>
                  <SelectContent>
                    {approved.map((item) => (
                      <SelectItem key={item.id} value={item.id}>{item.name} · {item.language}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {(() => {
                const tpl = approved.find((t) => t.id === template.template_id);
                const headerMeta = getTemplateHeaderMeta(tpl);
                if (headerMeta.format === "NONE") return null;
                return (
                  <div className="space-y-3 rounded-lg border border-border/60 bg-card/40 p-3">
                    <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Header</p>
                    {headerMeta.format === "TEXT" ? (
                      headerMeta.variableCount > 0 ? (
                        template.header_values.map((value, index) => (
                          <div key={index} className="space-y-1.5">
                            <Label className="text-xs">{`Header variable {{${index + 1}}}`}</Label>
                            <Input
                              value={value}
                              onChange={(e) => {
                                const next = [...template.header_values];
                                next[index] = e.target.value;
                                setTemplate({ ...template, header_values: next });
                              }}
                            />
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-muted-foreground">Static text header — no extra input required.</p>
                      )
                    ) : (
                      <div className="space-y-1.5">
                        <Label className="text-xs">Public {headerMeta.format.toLowerCase()} URL</Label>
                        <Input
                          value={template.header_media_url}
                          onChange={(e) => setTemplate({ ...template, header_media_url: e.target.value })}
                          placeholder="https://…"
                        />
                      </div>
                    )}
                  </div>
                );
              })()}
              {template.values.length > 0 && (
                <div className="space-y-3 rounded-lg border border-border/60 bg-card/40 p-3">
                  <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Variables</p>
                  {template.values.map((v, i) => (
                    <div key={i} className="space-y-1.5">
                      <Label className="text-xs">
                        <span className="rounded bg-amber-500/15 px-1.5 py-0.5 font-mono text-[10px] text-amber-700 dark:text-amber-300">
                          {`{{${i + 1}}}`}
                        </span>
                      </Label>
                      <Input
                        value={v}
                        onChange={(e) => {
                          const next = [...template.values];
                          next[i] = e.target.value;
                          setTemplate({ ...template, values: next });
                        }}
                      />
                    </div>
                  ))}
                </div>
              )}
              <Button size="sm" disabled={busy || !template.template_id} onClick={() => openConfirm("template")}>
                <Send className="mr-2 h-4 w-4" /> Review &amp; send
              </Button>
            </TabsContent>

            <TabsContent value="media" className="space-y-3 pt-4">
              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Media library</Label>
                  <Select value={media.asset_id} onValueChange={onPickAsset}>
                    <SelectTrigger><SelectValue placeholder={mediaAssets.length ? "Pick attachment" : "No saved media"} /></SelectTrigger>
                    <SelectContent>
                      {mediaAssets.slice(0, 100).map((m) => (
                        <SelectItem key={m.id} value={m.id}>{m.filename || m.media_type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Media type</Label>
                  <Select value={media.type} onValueChange={(value) => setMedia({ ...media, type: value })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["image", "document", "audio", "video"].map((t) => (
                        <SelectItem key={t} value={t}>{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Public media URL</Label>
                <Input value={media.media_url} onChange={(e) => setMedia({ ...media, media_url: e.target.value, asset_id: "" })} placeholder="https://…" />
              </div>
              <div className="space-y-2">
                <Label>Caption</Label>
                <Textarea value={media.caption} onChange={(e) => setMedia({ ...media, caption: e.target.value })} maxLength={1024} />
              </div>
              <Button size="sm" disabled={busy || !media.media_url} onClick={() => openConfirm("media")}>
                <Send className="mr-2 h-4 w-4" /> Review &amp; send
              </Button>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Live preview column */}
      <Card className="rounded-lg">
        <CardHeader><CardTitle className="text-base">Live preview</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <PhonePreview accountName={activeAccount?.display_name}>
            <PreviewBubble footer={new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}>
              {tab === "media" && media.media_url && (
                <div className="flex aspect-video items-center justify-center overflow-hidden rounded-md bg-emerald-300/30 text-emerald-900">
                  {media.type === "image" ? (
                    /* eslint-disable-next-line jsx-a11y/alt-text */
                    <img src={media.media_url} className="max-h-32 w-full object-cover" onError={(e) => { e.currentTarget.style.display = "none"; }} />
                  ) : (
                    <FileImage className="h-8 w-8" />
                  )}
                </div>
              )}
              <p className="whitespace-pre-wrap leading-snug">{previewBody}</p>
            </PreviewBubble>
          </PhonePreview>
          <p className="text-center text-[11px] text-muted-foreground">
            This preview is approximate — Meta renders the final message on the recipient's device.
          </p>
        </CardContent>
      </Card>

      {/* Send confirmation */}
      <Dialog open={!!confirm} onOpenChange={(o) => !o && !busy && setConfirm(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-primary" /> Confirm send
            </DialogTitle>
            <DialogDescription>
              You're about to send a {confirm?.kind} message to{" "}
              <span className="font-semibold text-foreground">{confirm?.payload?.to}</span> using{" "}
              <span className="font-semibold text-foreground">{activeAccount?.display_name}</span>.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 rounded-lg border border-border/60 bg-card/40 p-3 text-sm">
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{confirm?.summary?.sub}</p>
            <p className="whitespace-pre-wrap">{confirm?.summary?.headline}</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirm(null)} disabled={busy}>Cancel</Button>
            <Button onClick={send} disabled={busy} className="bg-gradient-primary text-primary-foreground hover:opacity-90">
              {busy ? "Sending…" : <><Send className="mr-2 h-4 w-4" /> Send now</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function countTemplateVars(tpl) {
  if (!tpl) return 0;
  const components = Array.isArray(tpl.components) ? tpl.components : [];
  let max = 0;
  for (const c of components) {
    if (typeof c.text !== "string") continue;
    const matches = c.text.matchAll(/\{\{\s*(\d+)\s*\}\}/g);
    for (const m of matches) max = Math.max(max, Number(m[1]));
  }
  return max;
}

function renderTemplate(tpl, values) {
  const components = Array.isArray(tpl.components) ? tpl.components : [];
  const body = components.find((c) => c.type === "BODY");
  const header = components.find((c) => c.type === "HEADER");
  const footer = components.find((c) => c.type === "FOOTER");
  const lines = [];
  if (header?.text) lines.push(substitute(header.text, values));
  if (body?.text) lines.push(substitute(body.text, values));
  if (footer?.text) lines.push(footer.text);
  return lines.join("\n\n") || `[template] ${tpl.name}`;
}
