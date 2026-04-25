"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { MessageSquare, Send, Phone, Users, Search, Loader2, ArrowDownUp, BellDot, FileText, Check, CheckCheck, AlertCircle, Clock, UserCircle2, Tag, CircleSlash, RotateCcw, Zap, X, Sparkles, Wand2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toast } from "sonner";
import { db, cloudAction } from "../_lib/api";
import { supabase } from "@/lib/supabase";
import { formatDate } from "../_lib/validators";
import { InboxStatusPanel } from "../_components/InboxStatusPanel";
import { useV2Data } from "../layout";

// Compact message status chip with icon — sent ✓, delivered ✓✓, read ✓✓ (blue), failed ⚠
function MessageStatusChip({ status, outbound }) {
  if (!outbound) return null;
  const s = String(status || "").toLowerCase();
  const baseMuted = "text-primary-foreground/80";
  const map = {
    queued:    { Icon: Clock,       label: "Queued",    cls: baseMuted },
    sent:      { Icon: Check,       label: "Sent",      cls: baseMuted },
    delivered: { Icon: CheckCheck,  label: "Delivered", cls: baseMuted },
    read:      { Icon: CheckCheck,  label: "Read",      cls: "text-sky-200" },
    failed:    { Icon: AlertCircle, label: "Failed",    cls: "text-destructive-foreground bg-destructive/80 px-1.5 rounded" },
    error:     { Icon: AlertCircle, label: "Failed",    cls: "text-destructive-foreground bg-destructive/80 px-1.5 rounded" },
  };
  const entry = map[s] || { Icon: Clock, label: s || "Pending", cls: baseMuted };
  const { Icon, label, cls } = entry;
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-medium ${cls}`} title={label}>
      <Icon className="h-3 w-3" />
      <span>{label}</span>
    </span>
  );
}

const LARGE_LIST_THRESHOLD = 200;
const LAST_OPENED_KEY = "wa-inbox:last-conversation-id";
const SORT_KEY = "wa-inbox:sort-mode";
const FILTER_KEY = "wa-inbox:filter";

function substitute(text, vars) {
  if (!text) return "";
  return String(text).replace(/\{\{\s*(\d+)\s*\}\}/g, (_, n) => {
    const i = Number(n) - 1;
    return vars[i] != null ? String(vars[i]) : `{{${n}}}`;
  });
}

function countTemplateVariables(text) {
  const matches = Array.from(String(text || "").matchAll(/\{\{\s*(\d+)\s*\}\}/g));
  return matches.reduce((max, match) => Math.max(max, Number(match[1] || 0)), 0);
}

function getTemplateHeaderMeta(template) {
  const components = Array.isArray(template?.components) ? template.components : [];
  const header = components.find((item) => String(item?.type || "").toUpperCase() === "HEADER");
  const format = String(header?.format || "NONE").toUpperCase();
  const variableCount = format === "TEXT" ? countTemplateVariables(header?.text || "") : 0;
  return { header, format, variableCount };
}

function resolveTemplatePreview(conversation, templateMap) {
  const meta = conversation?.metadata || {};
  const tplMeta = meta.last_template;
  if (!tplMeta?.name) return null;
  const tpl =
    templateMap.get(`${tplMeta.name}::${tplMeta.language}`) ||
    templateMap.get(tplMeta.name);
  if (!tpl) return `[template] ${tplMeta.name}`;
  const components = Array.isArray(tpl.components) ? tpl.components : [];
  const body = components.find((c) => c.type === "BODY");
  const variables = Array.isArray(tplMeta.variables) ? tplMeta.variables : [];
  if (body?.text) return substitute(body.text, variables);
  const header = components.find((c) => c.type === "HEADER");
  if (header?.text) return substitute(header.text, variables);
  return `[template] ${tpl.name}`;
}

function PreviewLine({ text, highlight, className }) {
  if (!text) return null;
  if (!highlight) {
    return <p className={className}>{text}</p>;
  }
  const parts = String(text).split(/(\{\{\s*\d+\s*\}\})/g);
  return (
    <p className={className}>
      {parts.map((part, i) =>
        /^\{\{\s*\d+\s*\}\}$/.test(part) ? (
          <span
            key={i}
            className="rounded bg-amber-500/20 px-1 font-mono text-[10px] text-amber-700 dark:text-amber-300"
          >
            {part}
          </span>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </p>
  );
}

export default function InboxPage() {
  const data = useV2Data();
  const conversations = data.conversations.data || [];
  const contacts = data.contacts?.data || [];
  const templates = data.templates?.data || [];
  const quickReplies = data.quickReplies?.data || [];
  const assignees = data.assignees?.data || [];
  const defaultNumber = data.defaultNumber;
  const isLargeContactList = contacts.length > LARGE_LIST_THRESHOLD;

  const templateMap = useMemo(() => {
    const map = new Map();
    for (const t of templates) {
      map.set(`${t.name}::${t.language}`, t);
      if (!map.has(t.name)) map.set(t.name, t);
    }
    return map;
  }, [templates]);

  const [tab, setTab] = useState("conversations");
  const [selected, setSelected] = useState(null);
  const [messages, setMessages] = useState([]);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const [contactQuery, setContactQuery] = useState("");
  const [appliedQuery, setAppliedQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [startingContactId, setStartingContactId] = useState(null);
  const [selectedContactId, setSelectedContactId] = useState(null);
  const [templateDialog, setTemplateDialog] = useState({ open: false, templateId: "", values: [], headerUrl: "", headerValues: [] });
  const [sendingTemplate, setSendingTemplate] = useState(false);
  const [labelInput, setLabelInput] = useState("");
  const [quickPickerOpen, setQuickPickerOpen] = useState(false);
  const [quickFilter, setQuickFilter] = useState("");
  const [aiBusy, setAiBusy] = useState(null); // 'smart' | 'summary' | null
  const [aiSummary, setAiSummary] = useState(null);
  const [filterMode, setFilterMode] = useState(() => {
    if (typeof window === "undefined") return "all";
    return window.localStorage.getItem(FILTER_KEY) || "all";
  });
  const [filterLabel, setFilterLabel] = useState("");
  const [sortMode, setSortMode] = useState(() => {
    if (typeof window === "undefined") return "recent";
    return window.localStorage.getItem(SORT_KEY) || "recent";
  });
  const scrollRef = useRef(null);
  const selectedRef = useRef(null);
  const restoredRef = useRef(false);
  const seenMessageIdsRef = useRef(new Set());
  const replyInputRef = useRef(null);

  useEffect(() => { try { window.localStorage.setItem(SORT_KEY, sortMode); } catch (_) {} }, [sortMode]);
  useEffect(() => { try { window.localStorage.setItem(FILTER_KEY, filterMode); } catch (_) {} }, [filterMode]);

  useEffect(() => {
    selectedRef.current = selected;
    if (selected?.id) {
      try { window.localStorage.setItem(LAST_OPENED_KEY, selected.id); } catch (_) {}
    }
  }, [selected]);

  useEffect(() => {
    if (isLargeContactList) return;
    setSearching(true);
    const id = setTimeout(() => {
      setAppliedQuery(contactQuery.trim().toLowerCase());
      setSearching(false);
    }, 200);
    return () => clearTimeout(id);
  }, [contactQuery, isLargeContactList]);

  const runSearch = useCallback(() => {
    setSearching(true);
    setTimeout(() => {
      setAppliedQuery(contactQuery.trim().toLowerCase());
      setSearching(false);
    }, 50);
  }, [contactQuery]);

  const filteredContacts = useMemo(() => {
    if (!appliedQuery) return contacts;
    return contacts.filter((c) =>
      c.name?.toLowerCase().includes(appliedQuery) ||
      c.phone_number?.toLowerCase().includes(appliedQuery)
    );
  }, [contacts, appliedQuery]);

  // All known labels across conversations (for filter chips)
  const allLabels = useMemo(() => {
    const set = new Set();
    for (const c of conversations) (c.labels || []).forEach((l) => set.add(l));
    return Array.from(set).sort();
  }, [conversations]);

  // Apply filter mode + label filter
  const visibleConversations = useMemo(() => {
    return conversations.filter((c) => {
      if (filterMode === "unread" && !(c.unread_count > 0)) return false;
      if (filterMode === "open" && c.status !== "open") return false;
      if (filterMode === "resolved" && c.status !== "resolved") return false;
      if (filterMode === "assigned" && !c.assigned_to) return false;
      if (filterLabel && !(c.labels || []).includes(filterLabel)) return false;
      return true;
    });
  }, [conversations, filterMode, filterLabel]);

  const sortedConversations = useMemo(() => {
    const arr = [...visibleConversations];
    if (sortMode === "unread") {
      arr.sort((a, b) => {
        const ua = a.unread_count || 0;
        const ub = b.unread_count || 0;
        if (ub !== ua) return ub - ua;
        const ta = a.last_message_at ? new Date(a.last_message_at).getTime() : 0;
        const tb = b.last_message_at ? new Date(b.last_message_at).getTime() : 0;
        return tb - ta;
      });
    } else {
      arr.sort((a, b) => {
        const ta = a.last_message_at ? new Date(a.last_message_at).getTime() : 0;
        const tb = b.last_message_at ? new Date(b.last_message_at).getTime() : 0;
        return tb - ta;
      });
    }
    return arr;
  }, [visibleConversations, sortMode]);

  const totalUnread = useMemo(
    () => conversations.reduce((acc, c) => acc + (c.unread_count || 0), 0),
    [conversations]
  );

  const resetUnread = useCallback(async (conversationId) => {
    if (!conversationId) return;
    const target = conversations.find((c) => c.id === conversationId);
    if (!target || !target.unread_count) return;
    const { error } = await supabase
      .from("wa_conversations")
      .update({ unread_count: 0 })
      .eq("id", conversationId);
    if (!error) data.conversations.refetch();
  }, [conversations, data.conversations]);

  const selectConversation = useCallback((conversation) => {
    setSelected(conversation);
    if (conversation?.id) resetUnread(conversation.id);
  }, [resetUnread]);

  // Keep `selected` row in sync when list refetches (so labels/assign/status update live)
  useEffect(() => {
    if (!selected?.id) return;
    const fresh = conversations.find((c) => c.id === selected.id);
    if (fresh && fresh !== selected) setSelected(fresh);
  }, [conversations, selected]);

  useEffect(() => {
    if (restoredRef.current) return;
    if (!conversations.length) return;
    restoredRef.current = true;
    try {
      const savedId = window.localStorage.getItem(LAST_OPENED_KEY);
      const match = savedId && conversations.find((c) => c.id === savedId);
      if (match) {
        setSelected(match);
        return;
      }
    } catch (_) {}
    setSelected(sortedConversations[0] || null);
  }, [conversations, sortedConversations]);

  const startConversationWithContact = async (contact) => {
    if (!defaultNumber) {
      toast.error("Connect a WhatsApp number first");
      return;
    }
    setStartingContactId(contact.id);
    try {
      const phone = contact.phone_number;
      const cached = conversations.find(
        (c) => c.external_contact_phone === phone && c.phone_number_id === defaultNumber.id
      );
      if (cached) {
        setTab("conversations");
        selectConversation(cached);
        return;
      }
      const { data: existing } = await supabase
        .from("wa_conversations")
        .select("*, wa_contacts(name, phone_number), wa_phone_numbers(display_name)")
        .eq("phone_number_id", defaultNumber.id)
        .eq("external_contact_phone", phone)
        .maybeSingle();
      if (existing) {
        await data.conversations.refetch();
        setTab("conversations");
        selectConversation(existing);
        return;
      }
      const { data: row, error } = await supabase
        .from("wa_conversations")
        .upsert(
          {
            phone_number_id: defaultNumber.id,
            contact_id: contact.id,
            external_contact_phone: phone,
            last_message_preview: null,
          },
          { onConflict: "phone_number_id,external_contact_phone" }
        )
        .select("*, wa_contacts(name, phone_number), wa_phone_numbers(display_name)")
        .single();
      if (error) throw error;
      await data.conversations.refetch();
      setTab("conversations");
      selectConversation(row);
    } catch (e) {
      toast.error(e.message);
    } finally {
      setStartingContactId(null);
      setSelectedContactId(null);
    }
  };

  const loadMessages = async (id) => {
    const { data: rows } = await db.messages(id);
    setMessages(rows || []);
  };

  useEffect(() => {
    if (!selected) return;
    loadMessages(selected.id);
    setAiSummary(null);
  }, [selected?.id]);

  useEffect(() => {
    // Polling-based refresh: re-pull conversations + open thread every few seconds.
    // Webhook writes go straight to the database; this just makes the UI catch up
    // without needing a full page reload.
    const interval = setInterval(() => {
      data.conversations.refetch();
      const currentId = selectedRef.current?.id;
      if (currentId) loadMessages(currentId);
    }, 5000);
    return () => clearInterval(interval);
  }, [data.conversations]);

  useEffect(() => {
    const viewport = scrollRef.current?.querySelector("[data-radix-scroll-area-viewport]");
    if (viewport) viewport.scrollTop = viewport.scrollHeight;
  }, [messages.length]);

  const sendReply = async () => {
    if (!selected || !reply.trim()) return;
    setSending(true);
    try {
      await cloudAction("send_message", {
        account_id: selected.phone_number_id || undefined,
        to: selected.external_contact_phone,
        kind: "text",
        body: reply.trim(),
      });
      setReply("");
      loadMessages(selected.id);
      data.conversations.refetch();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setSending(false);
    }
  };

  const runSmartReply = async () => {
    if (!selected) return;
    setAiBusy("smart");
    try {
      const { data: result, error } = await supabase.functions.invoke("wa-ai-assist", {
        body: { action: "smart_reply", conversation_id: selected.id },
      });
      if (error) throw new Error(error.message);
      if (result?.error) throw new Error(result.error);
      setReply(result.reply || "");
      setTimeout(() => replyInputRef.current?.focus(), 0);
    } catch (e) {
      toast.error(e.message);
    } finally {
      setAiBusy(null);
    }
  };

  const runSummarize = async () => {
    if (!selected) return;
    setAiBusy("summary");
    try {
      const { data: result, error } = await supabase.functions.invoke("wa-ai-assist", {
        body: { action: "summarize_thread", conversation_id: selected.id },
      });
      if (error) throw new Error(error.message);
      if (result?.error) throw new Error(result.error);
      setAiSummary(result);
    } catch (e) {
      toast.error(e.message);
    } finally {
      setAiBusy(null);
    }
  };

  const countTemplateVars = (tpl) => {
    if (!tpl) return 0;
    const components = Array.isArray(tpl.components) ? tpl.components : [];
    let max = 0;
    for (const c of components) {
      if (typeof c.text !== "string") continue;
      const matches = c.text.matchAll(/\{\{\s*(\d+)\s*\}\}/g);
      for (const m of matches) max = Math.max(max, Number(m[1]));
    }
    return max;
  };

  const openTemplateDialog = () => {
    if (!selected) return;
    const approved = templates.filter((t) => String(t.status).toUpperCase() === "APPROVED");
    const first = approved[0];
    const count = countTemplateVars(first);
    const headerMeta = getTemplateHeaderMeta(first);
    setTemplateDialog({ open: true, templateId: first?.id || "", values: Array(count).fill(""), headerUrl: "", headerValues: Array(headerMeta.variableCount).fill("") });
  };

  const onPickTemplate = (id) => {
    const tpl = templates.find((t) => t.id === id);
    const count = countTemplateVars(tpl);
    const headerMeta = getTemplateHeaderMeta(tpl);
    setTemplateDialog((s) => ({ ...s, templateId: id, values: Array(count).fill(""), headerUrl: "", headerValues: Array(headerMeta.variableCount).fill("") }));
  };

  const fillFromContact = (idx, source) => {
    const value =
      source === "name" ? (selected?.wa_contacts?.name || "")
      : source === "phone" ? (selected?.external_contact_phone || "")
      : "";
    setTemplateDialog((s) => {
      const next = [...s.values];
      next[idx] = value;
      return { ...s, values: next };
    });
  };

  const sendMappedTemplate = async () => {
    if (!selected || !templateDialog.templateId) return;
    const tpl = templates.find((t) => t.id === templateDialog.templateId);
    if (!tpl) return;
    const headerMeta = getTemplateHeaderMeta(tpl);
    if (["IMAGE", "VIDEO", "DOCUMENT"].includes(headerMeta.format) && !templateDialog.headerUrl.trim()) {
      return toast.error(`Provide a public ${headerMeta.format.toLowerCase()} URL for the header`);
    }
    if (headerMeta.variableCount > 0 && templateDialog.headerValues.some((v) => !String(v || "").trim())) {
      return toast.error("Fill all header variables");
    }
    setSendingTemplate(true);
    try {
      await cloudAction("send_message", {
        account_id: selected.phone_number_id || undefined,
        to: selected.external_contact_phone,
        kind: "template",
        template_id: tpl.id,
        variables: templateDialog.values.map((v) => String(v ?? "")),
        header_media_url: templateDialog.headerUrl.trim() || undefined,
        header_variables: templateDialog.headerValues.map((v) => String(v ?? "")),
      });
      toast.success(`Template "${tpl.name}" sent`);
      setTemplateDialog({ open: false, templateId: "", values: [], headerUrl: "", headerValues: [] });
      loadMessages(selected.id);
      data.conversations.refetch();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setSendingTemplate(false);
    }
  };

  const updateConversation = async (patch) => {
    if (!selected) return;
    const { error } = await supabase.from("wa_conversations").update(patch).eq("id", selected.id);
    if (error) return toast.error(error.message);
    data.conversations.refetch();
  };

  const assignTo = (name) => updateConversation({ assigned_to: name || null });

  const addLabel = async () => {
    const v = labelInput.trim();
    if (!v || !selected) return;
    const next = Array.from(new Set([...(selected.labels || []), v]));
    await updateConversation({ labels: next });
    setLabelInput("");
  };

  const removeLabel = async (label) => {
    if (!selected) return;
    const next = (selected.labels || []).filter((l) => l !== label);
    await updateConversation({ labels: next });
  };

  const toggleResolved = async () => {
    if (!selected) return;
    const next = selected.status === "resolved" ? "open" : "resolved";
    await updateConversation({ status: next });
    toast.success(next === "resolved" ? "Marked resolved" : "Reopened");
  };

  const filteredQuickReplies = useMemo(() => {
    const q = quickFilter.trim().toLowerCase();
    if (!q) return quickReplies;
    return quickReplies.filter((r) =>
      r.shortcut.toLowerCase().includes(q) || r.body.toLowerCase().includes(q)
    );
  }, [quickReplies, quickFilter]);

  const insertQuickReply = (qr) => {
    let body = qr.body;
    if (selected) {
      body = body
        .replace(/\{\{\s*name\s*\}\}/gi, selected.wa_contacts?.name || "")
        .replace(/\{\{\s*phone\s*\}\}/gi, selected.external_contact_phone || "");
    }
    setReply((cur) => (cur ? cur + " " + body : body));
    setQuickPickerOpen(false);
    setQuickFilter("");
    setTimeout(() => replyInputRef.current?.focus(), 0);
  };

  const onReplyKeyDown = (e) => {
    if (e.key === "/" && !reply) {
      e.preventDefault();
      setQuickPickerOpen(true);
      return;
    }
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendReply(); }
  };

  const isResolved = selected?.status === "resolved";

  return (
    <div className="space-y-4">
      <InboxStatusPanel data={data} />
      <div className="grid h-[calc(100vh-18rem)] gap-4 lg:grid-cols-[360px_1fr]">
      <Card className="overflow-hidden">
        <CardContent className="flex h-full flex-col p-0">
          <Tabs value={tab} onValueChange={setTab} className="flex h-full flex-col">
            <TabsList className="m-3 grid grid-cols-2">
              <TabsTrigger value="conversations" className="gap-1.5">
                <MessageSquare className="h-3.5 w-3.5" /> Chats
                {totalUnread > 0 && (
                  <Badge variant="default" className="ml-1 h-4 min-w-4 justify-center rounded-full px-1 text-[10px]">
                    {totalUnread > 99 ? "99+" : totalUnread}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="contacts" className="gap-1.5">
                <Users className="h-3.5 w-3.5" /> Contacts
              </TabsTrigger>
            </TabsList>

            <TabsContent value="conversations" className="m-0 flex-1 overflow-hidden">
              <div className="flex flex-wrap items-center gap-1 border-b px-3 py-2">
                {[
                  { id: "all", label: "All" },
                  { id: "unread", label: "Unread" },
                  { id: "open", label: "Open" },
                  { id: "assigned", label: "Assigned" },
                  { id: "resolved", label: "Resolved" },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setFilterMode(f.id)}
                    className={`rounded-full px-2 py-0.5 text-[11px] transition-colors ${
                      filterMode === f.id
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-muted/70"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
                {allLabels.length > 0 && (
                  <Select value={filterLabel || "__none"} onValueChange={(v) => setFilterLabel(v === "__none" ? "" : v)}>
                    <SelectTrigger className="ml-auto h-6 w-auto gap-1 px-2 text-[11px]">
                      <Tag className="h-3 w-3" />
                      <SelectValue placeholder="Label" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none">All labels</SelectItem>
                      {allLabels.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                    </SelectContent>
                  </Select>
                )}
              </div>

              <div className="flex items-center justify-between gap-2 border-b px-4 py-2">
                <p className="text-xs text-muted-foreground">
                  {sortedConversations.length} thread{sortedConversations.length === 1 ? "" : "s"}
                </p>
                <ToggleGroup
                  type="single" size="sm" value={sortMode}
                  onValueChange={(v) => v && setSortMode(v)} className="h-7"
                >
                  <ToggleGroupItem value="recent" aria-label="Newest activity" className="h-7 px-2 text-[11px]">
                    <ArrowDownUp className="mr-1 h-3 w-3" /> Recent
                  </ToggleGroupItem>
                  <ToggleGroupItem value="unread" aria-label="Unread first" className="h-7 px-2 text-[11px]">
                    <BellDot className="mr-1 h-3 w-3" /> Unread
                  </ToggleGroupItem>
                </ToggleGroup>
              </div>
              <ScrollArea className="h-[calc(100%-6.25rem)]">
                {sortedConversations.map((item) => {
                  const tplPreview = resolveTemplatePreview(item, templateMap);
                  const previewText = item.last_message_preview || tplPreview || "No preview";
                  const hasUnresolved = /\{\{\s*\d+\s*\}\}/.test(previewText);
                  const unread = item.unread_count || 0;
                  const resolved = item.status === "resolved";
                  return (
                    <button
                      key={item.id}
                      onClick={() => selectConversation(item)}
                      className={`block w-full border-b px-4 py-3 text-left transition-colors hover:bg-muted/50 ${
                        selected?.id === item.id ? "bg-muted" : ""
                      } ${resolved ? "opacity-60" : ""}`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className={`truncate ${unread ? "font-semibold" : "font-medium"}`}>
                          {item.wa_contacts?.name || item.external_contact_phone}
                        </p>
                        <span className="shrink-0 text-[11px] text-muted-foreground">{formatDate(item.last_message_at)}</span>
                      </div>
                      <div className="mt-1 flex items-center justify-between gap-2">
                        <PreviewLine
                          text={previewText} highlight={hasUnresolved}
                          className={`truncate text-xs ${unread ? "text-foreground" : "text-muted-foreground"}`}
                        />
                        {unread > 0 && (
                          <Badge variant="default" className="h-5 min-w-5 shrink-0 justify-center rounded-full px-1.5 text-[10px]">
                            {unread > 99 ? "99+" : unread}
                          </Badge>
                        )}
                      </div>
                      {(item.assigned_to || (item.labels || []).length > 0 || resolved) && (
                        <div className="mt-1.5 flex flex-wrap items-center gap-1">
                          {resolved && (
                            <span className="inline-flex items-center gap-0.5 rounded bg-success/15 px-1.5 py-0.5 text-[10px] font-medium text-success">
                              <Check className="h-2.5 w-2.5" /> Resolved
                            </span>
                          )}
                          {item.assigned_to && (
                            <span className="inline-flex items-center gap-0.5 rounded bg-primary/10 px-1.5 py-0.5 text-[10px] text-primary">
                              <UserCircle2 className="h-2.5 w-2.5" /> {item.assigned_to}
                            </span>
                          )}
                          {(item.labels || []).slice(0, 3).map((l) => (
                            <span key={l} className="inline-flex items-center gap-0.5 rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                              <Tag className="h-2.5 w-2.5" /> {l}
                            </span>
                          ))}
                        </div>
                      )}
                    </button>
                  );
                })}
                {!sortedConversations.length && (
                  <div className="flex flex-col items-center gap-2 p-8 text-center text-sm text-muted-foreground">
                    <MessageSquare className="h-6 w-6" /> No conversations match.
                  </div>
                )}
              </ScrollArea>
            </TabsContent>

            <TabsContent value="contacts" className="m-0 flex-1 overflow-hidden">
              <div className="border-b px-3 py-2">
                <div className="relative">
                  {searching ? (
                    <Loader2 className="absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 animate-spin text-muted-foreground" />
                  ) : (
                    <Search className="absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                  )}
                  <Input
                    value={contactQuery}
                    onChange={(e) => setContactQuery(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); runSearch(); } }}
                    placeholder={isLargeContactList ? "Search & press Enter…" : "Search contacts…"}
                    className="h-8 pl-7 text-xs"
                  />
                </div>
                {isLargeContactList && (
                  <p className="mt-1 text-[10px] text-muted-foreground">
                    {contacts.length.toLocaleString()} contacts · press Enter to search
                  </p>
                )}
              </div>
              <ScrollArea className={`${isLargeContactList ? "h-[calc(100%-4.25rem-3.5rem)]" : "h-[calc(100%-3.25rem-3.5rem)]"}`}>
                {searching ? (
                  <div className="flex items-center justify-center gap-2 p-8 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" /> Searching…
                  </div>
                ) : (
                  <>
                    {filteredContacts.map((contact) => {
                      const isSelected = selectedContactId === contact.id;
                      const optedOut = !!contact.opted_out_at;
                      return (
                        <button
                          key={contact.id}
                          onClick={() => setSelectedContactId(isSelected ? null : contact.id)}
                          onDoubleClick={() => startConversationWithContact(contact)}
                          disabled={startingContactId === contact.id}
                          className={`block w-full border-b px-4 py-3 text-left transition-colors disabled:opacity-50 ${
                            isSelected ? "bg-primary/10 ring-1 ring-inset ring-primary/40" : "hover:bg-muted/50"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <p className={`truncate ${isSelected ? "font-semibold text-primary" : "font-medium"}`}>
                              {contact.name}
                            </p>
                            {startingContactId === contact.id ? (
                              <span className="shrink-0 text-[11px] text-muted-foreground">Opening…</span>
                            ) : isSelected ? (
                              <Check className="h-3.5 w-3.5 shrink-0 text-primary" />
                            ) : null}
                          </div>
                          <p className="mt-1 truncate text-xs text-muted-foreground">{contact.phone_number}</p>
                          {optedOut && (
                            <span className="mt-1 inline-flex items-center gap-1 rounded bg-destructive/10 px-1.5 py-0.5 text-[10px] text-destructive">
                              <CircleSlash className="h-2.5 w-2.5" /> Opted out
                            </span>
                          )}
                        </button>
                      );
                    })}
                    {!filteredContacts.length && (
                      <div className="flex flex-col items-center gap-2 p-8 text-center text-sm text-muted-foreground">
                        <Users className="h-6 w-6" />
                        {appliedQuery ? `No contacts match "${appliedQuery}".` : contacts.length ? "Type to search contacts." : "No contacts yet."}
                      </div>
                    )}
                  </>
                )}
              </ScrollArea>
              <div className="flex items-center justify-between gap-2 border-t bg-muted/30 px-3 py-2">
                <p className="text-[11px] text-muted-foreground">
                  {selectedContactId ? "1 contact selected" : "Select a contact"}
                </p>
                <Button
                  size="sm" className="h-7 text-xs"
                  disabled={!selectedContactId || !!startingContactId}
                  onClick={() => {
                    const c = contacts.find((x) => x.id === selectedContactId);
                    if (c) startConversationWithContact(c);
                  }}
                >
                  {startingContactId ? <><Loader2 className="mr-1 h-3 w-3 animate-spin" /> Starting…</> : <><MessageSquare className="mr-1 h-3 w-3" /> Start conversation</>}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Card className="overflow-hidden">
        <CardContent className="flex h-full flex-col p-0">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3">
            <div className="min-w-0">
              <p className="font-semibold">{selected?.wa_contacts?.name || selected?.external_contact_phone || "Select a conversation"}</p>
              <p className="text-xs text-muted-foreground">
                <Phone className="mr-1 inline h-3 w-3" />
                {selected?.external_contact_phone || "—"} · {selected?.wa_phone_numbers?.display_name || "Default account"}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {selected && (
                <>
                  <Select value={selected.assigned_to || "__unassigned"} onValueChange={(v) => assignTo(v === "__unassigned" ? "" : v)}>
                    <SelectTrigger className="h-8 w-[160px] text-xs">
                      <UserCircle2 className="mr-1 h-3.5 w-3.5" />
                      <SelectValue placeholder="Assign" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__unassigned">Unassigned</SelectItem>
                      {assignees.map((a) => <SelectItem key={a.id} value={a.name}>{a.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Button size="sm" variant={isResolved ? "default" : "outline"} onClick={toggleResolved}>
                    {isResolved ? <><RotateCcw className="mr-1.5 h-4 w-4" /> Reopen</> : <><Check className="mr-1.5 h-4 w-4" /> Resolve</>}
                  </Button>
                </>
              )}
              <Button size="sm" variant="outline" disabled={!selected} onClick={openTemplateDialog}>
                <FileText className="mr-1.5 h-4 w-4" /> Template
              </Button>
              <Button size="sm" variant="outline" disabled={!selected || aiBusy === "summary"} onClick={runSummarize} title="AI summary + sentiment">
                {aiBusy === "summary" ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <Sparkles className="mr-1.5 h-4 w-4" />}
                Summarize
              </Button>
              <Button size="sm" variant="outline" onClick={() => selected && loadMessages(selected.id)}>Refresh</Button>
            </div>
          </div>

          {aiSummary && (
            <div className="border-b bg-primary/5 px-4 py-3 text-xs">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-2 py-0.5 font-semibold text-primary">
                  <Sparkles className="h-3 w-3" /> AI summary
                </span>
                <span className="rounded-full bg-muted px-2 py-0.5">sentiment: <b>{aiSummary.sentiment}</b></span>
                <span className="rounded-full bg-muted px-2 py-0.5">urgency: <b>{aiSummary.urgency}</b></span>
                <span className="rounded-full bg-muted px-2 py-0.5">intent: {aiSummary.intent}</span>
                <button onClick={() => setAiSummary(null)} className="ml-auto text-muted-foreground hover:text-foreground"><X className="h-3 w-3" /></button>
              </div>
              <p className="mt-2 text-foreground">{aiSummary.summary}</p>
              <p className="mt-1 text-muted-foreground">Next: {aiSummary.next_action}</p>
            </div>
          )}

          {selected && (
            <div className="flex flex-wrap items-center gap-1.5 border-b bg-muted/20 px-4 py-2">
              <Tag className="h-3.5 w-3.5 text-muted-foreground" />
              {(selected.labels || []).map((l) => (
                <span key={l} className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] text-primary">
                  {l}
                  <button onClick={() => removeLabel(l)} className="opacity-60 hover:opacity-100"><X className="h-2.5 w-2.5" /></button>
                </span>
              ))}
              <Input
                value={labelInput}
                onChange={(e) => setLabelInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addLabel(); } }}
                placeholder="Add label…"
                className="h-6 w-32 border-dashed text-[11px]"
              />
            </div>
          )}

          <ScrollArea ref={scrollRef} className="flex-1 bg-muted/20">
            <div className="space-y-3 p-4">
              {messages.map((message) => {
                const out = message.direction === "outbound";
                return (
                  <div key={message.id} className={`flex ${out ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[78%] rounded-md border p-3 shadow-sm ${out ? "border-primary/30 bg-primary text-primary-foreground" : "border-border bg-card"}`}>
                      {message.message_type === "template"
                        ? <TemplateBubble message={message} template={templateMap.get(`${message.template_name}::${message.template_language}`) || templateMap.get(message.template_name)} outbound={out} />
                        : <p className="whitespace-pre-wrap text-sm">{message.body || message.media_url || "Unsupported message"}</p>}
                      <div className={`mt-2 flex items-center gap-2 text-[11px] ${out ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                        <span>{formatDate(message.created_at)}</span>
                        {out ? <MessageStatusChip status={message.status} outbound={out} /> : null}
                        {message.error_message && (
                          <span className="truncate text-destructive-foreground/90" title={message.error_message}>
                            · {message.error_message}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              {!messages.length && (
                <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                  <MessageSquare className="mr-2 h-5 w-5" /> No messages in this thread.
                </div>
              )}
            </div>
          </ScrollArea>

          <div className="flex items-center gap-2 border-t p-3">
            <Popover open={quickPickerOpen} onOpenChange={setQuickPickerOpen}>
              <PopoverTrigger asChild>
                <Button size="sm" variant="outline" disabled={!selected} title="Quick replies (press / in empty input)">
                  <Zap className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent align="start" className="w-80 p-0">
                <div className="border-b p-2">
                  <Input
                    autoFocus value={quickFilter}
                    onChange={(e) => setQuickFilter(e.target.value)}
                    placeholder="Search quick replies…" className="h-8 text-xs"
                  />
                </div>
                <ScrollArea className="max-h-72">
                  {filteredQuickReplies.length === 0 ? (
                    <p className="p-4 text-center text-xs text-muted-foreground">
                      No saved quick replies. Add some in Settings.
                    </p>
                  ) : (
                    filteredQuickReplies.map((qr) => (
                      <button
                        key={qr.id}
                        onClick={() => insertQuickReply(qr)}
                        className="block w-full border-b px-3 py-2 text-left hover:bg-muted/50"
                      >
                        <p className="text-xs font-semibold text-primary">/{qr.shortcut}</p>
                        <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{qr.body}</p>
                      </button>
                    ))
                  )}
                </ScrollArea>
              </PopoverContent>
            </Popover>
            <Input
              ref={replyInputRef}
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              onKeyDown={onReplyKeyDown}
              placeholder={selected ? "Type a reply… (press / for quick replies)" : "Select a conversation to reply"}
              disabled={!selected || sending}
              maxLength={4096}
            />
            <Button size="sm" variant="outline" disabled={!selected || aiBusy === "smart"} onClick={runSmartReply} title="AI smart reply">
              {aiBusy === "smart" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
            </Button>
            <Button size="sm" onClick={sendReply} disabled={!selected || !reply.trim() || sending}>
              <Send className="mr-2 h-4 w-4" /> {sending ? "Sending…" : "Send"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog
        open={templateDialog.open}
        onOpenChange={(o) => !o && setTemplateDialog({ open: false, templateId: "", values: [], headerUrl: "", headerValues: [] })}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Send template message</DialogTitle>
            <DialogDescription>
              Map each variable to the contact's details or a custom value before sending to{" "}
              <span className="font-medium text-foreground">
                {selected?.wa_contacts?.name || selected?.external_contact_phone}
              </span>.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Approved template</Label>
              <Select value={templateDialog.templateId} onValueChange={onPickTemplate}>
                <SelectTrigger><SelectValue placeholder="Choose template" /></SelectTrigger>
                <SelectContent>
                  {templates.filter((t) => String(t.status).toUpperCase() === "APPROVED").map((t) => (
                    <SelectItem key={t.id} value={t.id}>{t.name} · {t.language}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {(() => {
              const activeTemplate = templates.find((t) => t.id === templateDialog.templateId);
              const headerMeta = getTemplateHeaderMeta(activeTemplate);
              if (headerMeta.format === "NONE") return null;
              return (
                <div className="space-y-2 rounded-md border border-border/60 bg-card/40 p-3">
                  <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Header</p>
                  {headerMeta.format === "TEXT" ? (
                    headerMeta.variableCount > 0 ? (
                      <div className="space-y-3">
                        {templateDialog.headerValues.map((val, idx) => (
                          <div key={idx} className="space-y-1.5">
                            <Label className="text-xs">{`Header variable {{${idx + 1}}}`}</Label>
                            <Input
                              value={val}
                              onChange={(e) => {
                                const v = e.target.value;
                                setTemplateDialog((s) => {
                                  const next = [...s.headerValues];
                                  next[idx] = v;
                                  return { ...s, headerValues: next };
                                });
                              }}
                              placeholder={`Value for header {{${idx + 1}}}`}
                              className="h-8 text-sm"
                            />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground">Static text header — no extra input required.</p>
                    )
                  ) : (
                    <div className="space-y-1.5">
                      <Label className="text-xs">Public {headerMeta.format.toLowerCase()} URL</Label>
                      <Input
                        value={templateDialog.headerUrl}
                        onChange={(e) => setTemplateDialog((s) => ({ ...s, headerUrl: e.target.value }))}
                        placeholder="https://…"
                        className="h-8 text-sm"
                      />
                    </div>
                  )}
                </div>
              );
            })()}

            {templateDialog.values.length === 0 ? (
              <p className="rounded-md border border-dashed bg-muted/30 p-3 text-xs text-muted-foreground">
                This template has no variables — it's ready to send.
              </p>
            ) : (
              <div className="space-y-3">
                <p className="text-xs font-medium text-muted-foreground">
                  Template variables ({templateDialog.values.length})
                </p>
                {templateDialog.values.map((val, idx) => (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs">
                        <span className="rounded bg-amber-500/15 px-1.5 py-0.5 font-mono text-[10px] text-amber-700 dark:text-amber-300">
                          {`{{${idx + 1}}}`}
                        </span>
                      </Label>
                      <div className="flex gap-1">
                        <Button type="button" size="sm" variant="ghost" className="h-6 px-2 text-[10px]" onClick={() => fillFromContact(idx, "name")}>Use name</Button>
                        <Button type="button" size="sm" variant="ghost" className="h-6 px-2 text-[10px]" onClick={() => fillFromContact(idx, "phone")}>Use phone</Button>
                      </div>
                    </div>
                    <Input
                      value={val}
                      onChange={(e) => {
                        const v = e.target.value;
                        setTemplateDialog((s) => {
                          const next = [...s.values];
                          next[idx] = v;
                          return { ...s, values: next };
                        });
                      }}
                      placeholder={`Value for {{${idx + 1}}}`} className="h-8 text-sm"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setTemplateDialog({ open: false, templateId: "", values: [], headerUrl: "", headerValues: [] })} disabled={sendingTemplate}>Cancel</Button>
            <Button onClick={sendMappedTemplate} disabled={sendingTemplate || !templateDialog.templateId || templateDialog.values.some((v) => v === "")}>
              {sendingTemplate ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending…</> : <><Send className="mr-2 h-4 w-4" /> Send template</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </div>
    </div>
  );
}

function TemplateBubble({ message, template, outbound }) {
  const variables = Array.isArray(message.raw_payload?.variables) ? message.raw_payload.variables : [];
  const components = Array.isArray(template?.components) ? template.components : [];
  const header = components.find((c) => c.type === "HEADER");
  const body = components.find((c) => c.type === "BODY");
  const footer = components.find((c) => c.type === "FOOTER");
  const buttons = components.find((c) => c.type === "BUTTONS");
  const mutedClass = outbound ? "text-primary-foreground/80" : "text-muted-foreground";
  const dividerClass = outbound ? "border-primary-foreground/20" : "border-border";

  if (!template) {
    return (
      <div className="space-y-1">
        <p className="text-[11px] uppercase tracking-wide opacity-70">Template</p>
        <p className="whitespace-pre-wrap text-sm font-medium">{message.template_name}</p>
        {variables.length > 0 && (
          <p className={`text-xs ${mutedClass}`}>Variables: {variables.join(" · ")}</p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {header?.text && <p className="text-sm font-semibold">{substitute(header.text, variables)}</p>}
      {body?.text && <p className="whitespace-pre-wrap text-sm">{substitute(body.text, variables)}</p>}
      {footer?.text && <p className={`text-xs ${mutedClass}`}>{footer.text}</p>}
      {Array.isArray(buttons?.buttons) && buttons.buttons.length > 0 && (
        <div className={`mt-1 flex flex-wrap gap-1 border-t ${dividerClass} pt-2`}>
          {buttons.buttons.map((b, i) => (
            <span key={i} className={`rounded border px-2 py-0.5 text-[11px] ${dividerClass}`}>
              {b.text || b.type}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
