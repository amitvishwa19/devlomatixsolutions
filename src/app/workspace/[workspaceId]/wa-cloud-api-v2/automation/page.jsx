"use client";

import { useEffect, useMemo, useState } from "react";
import { Bot, Loader2, MessageSquare, Plus, Sparkles, Trash2, Wand2, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { RULE_TYPES, MATCH_MODES, WEEKDAYS, defaultOfficeHours, describeRule } from "../_lib/automation";
import { formatDate } from "../_lib/validators";
import { useV2Data } from "../layout";

const EMPTY_RULE = {
  name: "",
  rule_type: "keyword",
  enabled: true,
  priority: 100,
  match_keywords: [],
  match_mode: "any",
  case_sensitive: false,
  reply_type: "text",
  reply_body: "",
  template_id: null,
  template_language: null,
  office_hours: defaultOfficeHours(),
  cooldown_minutes: 60,
};

export default function AutomationPage() {
  const data = useV2Data();
  const templates = data.templates?.data || [];
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editorOpen, setEditorOpen] = useState(false);
  const [draft, setDraft] = useState(EMPTY_RULE);
  const [keywordInput, setKeywordInput] = useState("");
  const [saving, setSaving] = useState(false);

  const reload = async () => {
    setLoading(true);
    const { data: rows, error } = await supabase
      .from("wa_automation_rules")
      .select("*")
      .order("priority", { ascending: true })
      .order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    setRules(rows || []);
    setLoading(false);
  };

  useEffect(() => { reload(); }, []);

  const approvedTemplates = useMemo(
    () => templates.filter((t) => String(t.status).toUpperCase() === "APPROVED"),
    [templates]
  );

  const openNew = () => {
    setDraft({ ...EMPTY_RULE, office_hours: defaultOfficeHours() });
    setKeywordInput("");
    setEditorOpen(true);
  };

  const openEdit = (rule) => {
    setDraft({
      ...EMPTY_RULE,
      ...rule,
      office_hours: { ...defaultOfficeHours(), ...(rule.office_hours || {}) },
      match_keywords: rule.match_keywords || [],
    });
    setKeywordInput("");
    setEditorOpen(true);
  };

  const addKeyword = () => {
    const v = keywordInput.trim();
    if (!v) return;
    setDraft((d) => ({ ...d, match_keywords: Array.from(new Set([...(d.match_keywords || []), v])) }));
    setKeywordInput("");
  };

  const removeKeyword = (kw) => {
    setDraft((d) => ({ ...d, match_keywords: (d.match_keywords || []).filter((k) => k !== kw) }));
  };

  const save = async () => {
    if (!draft.name.trim()) return toast.error("Name is required");
    if (draft.rule_type === "keyword" && !(draft.match_keywords || []).length) {
      return toast.error("Add at least one keyword");
    }
    if (draft.reply_type === "text" && !draft.reply_body?.trim()) {
      return toast.error("Reply text is required");
    }
    if (draft.reply_type === "template" && !draft.template_id) {
      return toast.error("Select a template");
    }
    setSaving(true);
    try {
      const payload = {
        name: draft.name.trim().slice(0, 200),
        rule_type: draft.rule_type,
        enabled: !!draft.enabled,
        priority: Number(draft.priority) || 100,
        match_keywords: draft.rule_type === "keyword" ? draft.match_keywords || [] : [],
        match_mode: draft.match_mode,
        case_sensitive: !!draft.case_sensitive,
        reply_type: draft.reply_type,
        reply_body: draft.reply_type === "text" ? draft.reply_body : null,
        template_id: draft.reply_type === "template" ? draft.template_id : null,
        template_language: draft.reply_type === "template"
          ? approvedTemplates.find((t) => t.id === draft.template_id)?.language || null
          : null,
        office_hours: draft.rule_type === "away" ? draft.office_hours : {},
        cooldown_minutes: Number(draft.cooldown_minutes) || 0,
      };
      if (draft.id) {
        const { error } = await supabase.from("wa_automation_rules").update(payload).eq("id", draft.id);
        if (error) throw error;
        toast.success("Rule updated");
      } else {
        const { error } = await supabase.from("wa_automation_rules").insert(payload);
        if (error) throw error;
        toast.success("Rule created");
      }
      setEditorOpen(false);
      reload();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  const toggleEnabled = async (rule, enabled) => {
    const { error } = await supabase.from("wa_automation_rules").update({ enabled }).eq("id", rule.id);
    if (error) return toast.error(error.message);
    reload();
  };

  const remove = async (rule) => {
    if (!confirm(`Delete rule "${rule.name}"?`)) return;
    const { error } = await supabase.from("wa_automation_rules").delete().eq("id", rule.id);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
    reload();
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-bold tracking-tight">
            <Bot className="h-5 w-5 text-primary" /> Automation
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Auto-reply to inbound messages with keyword rules, welcome greetings, or away messages.
          </p>
        </div>
        <Button onClick={openNew}><Plus className="mr-2 h-4 w-4" /> New rule</Button>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 p-8 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading rules…
        </div>
      ) : rules.length === 0 ? (
        <Card className="border-dashed border-border/60">
          <CardContent className="flex flex-col items-center gap-3 p-10 text-center text-sm text-muted-foreground">
            <Sparkles className="h-8 w-8 text-primary" />
            <p className="font-medium text-foreground">No automation rules yet</p>
            <p>Create your first rule to auto-reply to inbound messages.</p>
            <Button onClick={openNew} className="mt-2"><Plus className="mr-2 h-4 w-4" /> New rule</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {rules.map((rule) => {
            const meta = RULE_TYPES.find((t) => t.id === rule.rule_type);
            return (
              <Card key={rule.id} className={`border-border/60 ${rule.enabled ? "" : "opacity-60"}`}>
                <CardContent className="flex flex-wrap items-start justify-between gap-4 p-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold">{rule.name}</p>
                      <Badge variant="outline" className="text-[10px]">{meta?.label || rule.rule_type}</Badge>
                      <Badge variant="secondary" className="text-[10px]">priority {rule.priority}</Badge>
                      {rule.trigger_count > 0 && (
                        <Badge variant="default" className="text-[10px]">{rule.trigger_count} triggered</Badge>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">{describeRule(rule)}</p>
                    <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                      {rule.reply_type === "template"
                        ? <><MessageSquare className="mr-1 inline h-3 w-3" />Template: {templates.find((t) => t.id === rule.template_id)?.name || "—"}</>
                        : rule.reply_body}
                    </p>
                    {rule.last_triggered_at && (
                      <p className="mt-1 text-[11px] text-muted-foreground">Last triggered {formatDate(rule.last_triggered_at)}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch checked={rule.enabled} onCheckedChange={(v) => toggleEnabled(rule, v)} />
                    <Button size="sm" variant="outline" onClick={() => openEdit(rule)}>Edit</Button>
                    <Button size="sm" variant="ghost" onClick={() => remove(rule)} className="text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={editorOpen} onOpenChange={setEditorOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wand2 className="h-4 w-4 text-primary" /> {draft.id ? "Edit rule" : "New automation rule"}
            </DialogTitle>
            <DialogDescription>Auto-replies are processed when inbound messages arrive.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2 space-y-1.5">
                <Label className="text-xs">Name</Label>
                <Input value={draft.name} onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))} placeholder="e.g. Pricing inquiry auto-reply" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Rule type</Label>
                <Select value={draft.rule_type} onValueChange={(v) => setDraft((d) => ({ ...d, rule_type: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {RULE_TYPES.map((t) => <SelectItem key={t.id} value={t.id}>{t.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Priority (lower runs first)</Label>
                <Input type="number" value={draft.priority} onChange={(e) => setDraft((d) => ({ ...d, priority: e.target.value }))} />
              </div>
            </div>

            {draft.rule_type === "keyword" && (
              <div className="space-y-2 rounded-md border border-border/60 bg-muted/20 p-3">
                <Label className="text-xs">Keywords</Label>
                <div className="flex flex-wrap items-center gap-1.5">
                  {(draft.match_keywords || []).map((k) => (
                    <span key={k} className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
                      {k}
                      <button onClick={() => removeKeyword(k)}><X className="h-3 w-3" /></button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input value={keywordInput} onChange={(e) => setKeywordInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addKeyword(); } }} placeholder="Add keyword and press Enter" />
                  <Button variant="outline" onClick={addKeyword}>Add</Button>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <Select value={draft.match_mode} onValueChange={(v) => setDraft((d) => ({ ...d, match_mode: v }))}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {MATCH_MODES.map((m) => <SelectItem key={m.id} value={m.id}>{m.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <label className="flex items-center gap-2 text-xs cursor-pointer">
                    <Switch checked={draft.case_sensitive} onCheckedChange={(v) => setDraft((d) => ({ ...d, case_sensitive: v }))} />
                    Case sensitive
                  </label>
                </div>
              </div>
            )}

            {draft.rule_type === "away" && (
              <div className="space-y-2 rounded-md border border-border/60 bg-muted/20 p-3">
                <Label className="text-xs">Office hours (auto-reply runs OUTSIDE this window)</Label>
                <div className="flex flex-wrap gap-1">
                  {WEEKDAYS.map((d) => {
                    const on = !!draft.office_hours?.days?.[d.id];
                    return (
                      <button
                        key={d.id}
                        type="button"
                        onClick={() => setDraft((s) => ({
                          ...s,
                          office_hours: { ...s.office_hours, days: { ...s.office_hours.days, [d.id]: !on } },
                        }))}
                        className={`rounded-full px-2 py-0.5 text-[11px] transition-colors ${on ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
                      >
                        {d.label}
                      </button>
                    );
                  })}
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="space-y-1">
                    <Label className="text-[11px]">Start</Label>
                    <Input type="time" value={draft.office_hours?.start || "09:00"} onChange={(e) => setDraft((s) => ({ ...s, office_hours: { ...s.office_hours, start: e.target.value } }))} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[11px]">End</Label>
                    <Input type="time" value={draft.office_hours?.end || "18:00"} onChange={(e) => setDraft((s) => ({ ...s, office_hours: { ...s.office_hours, end: e.target.value } }))} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[11px]">Timezone</Label>
                    <Input value={draft.office_hours?.timezone || "UTC"} onChange={(e) => setDraft((s) => ({ ...s, office_hours: { ...s.office_hours, timezone: e.target.value } }))} />
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-2 rounded-md border border-border/60 bg-muted/20 p-3">
              <Label className="text-xs">Reply with</Label>
              <Select value={draft.reply_type} onValueChange={(v) => setDraft((d) => ({ ...d, reply_type: v }))}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">Plain text</SelectItem>
                  <SelectItem value="template">Approved template</SelectItem>
                </SelectContent>
              </Select>
              {draft.reply_type === "text" ? (
                <Textarea
                  value={draft.reply_body || ""}
                  onChange={(e) => setDraft((d) => ({ ...d, reply_body: e.target.value }))}
                  placeholder="Hi! Thanks for reaching out — a teammate will get back to you shortly."
                  rows={4}
                />
              ) : (
                <Select value={draft.template_id || ""} onValueChange={(v) => setDraft((d) => ({ ...d, template_id: v }))}>
                  <SelectTrigger><SelectValue placeholder="Pick approved template" /></SelectTrigger>
                  <SelectContent>
                    {approvedTemplates.length === 0 && <SelectItem value="__none" disabled>No approved templates</SelectItem>}
                    {approvedTemplates.map((t) => <SelectItem key={t.id} value={t.id}>{t.name} · {t.language}</SelectItem>)}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Cooldown per contact (minutes)</Label>
                <Input type="number" value={draft.cooldown_minutes} onChange={(e) => setDraft((d) => ({ ...d, cooldown_minutes: e.target.value }))} />
                <p className="text-[10px] text-muted-foreground">Avoids replying repeatedly to the same contact.</p>
              </div>
              <label className="flex items-center justify-between gap-2 rounded-md border border-border/60 p-3 text-xs cursor-pointer">
                <div>
                  <p className="font-medium text-foreground">Enabled</p>
                  <p className="text-muted-foreground text-[10px]">Process this rule on incoming messages.</p>
                </div>
                <Switch checked={draft.enabled} onCheckedChange={(v) => setDraft((d) => ({ ...d, enabled: v }))} />
              </label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditorOpen(false)} disabled={saving}>Cancel</Button>
            <Button onClick={save} disabled={saving}>
              {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving…</> : "Save rule"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
