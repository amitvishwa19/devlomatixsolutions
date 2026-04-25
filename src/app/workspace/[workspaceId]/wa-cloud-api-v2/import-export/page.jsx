"use client";

import { useMemo, useRef, useState } from "react";
import { Upload, Download, FileSpreadsheet, Users, BookTemplate, CheckCircle2, AlertTriangle, XCircle, Trash2, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/lib/supabase";
import { parseCsv, toCsv, downloadCsv } from "../_lib/csv";
import { mapHeader } from "../_lib/segments";
import { isValidPhone, normalizePhone, parseTags } from "../_lib/validators";
import { useV2Data } from "../layout";

const CONTACT_SAMPLE_HEADERS = ["name", "phone", "tags", "email", "company", "lifecycle_stage", "notes"];
const CONTACT_SAMPLE_ROWS = [
  { name: "Alex Rivera", phone: "+15551234567", tags: "vip, lead", email: "alex@acme.com", company: "Acme Inc", lifecycle_stage: "customer", notes: "VIP customer" },
  { name: "Priya Shah", phone: "+919812345678", tags: "trial", email: "priya@example.com", company: "Lumen Labs", lifecycle_stage: "lead", notes: "" },
];

const TEMPLATE_SAMPLE_HEADERS = ["name", "language", "category", "header", "body", "footer", "components_json"];
const TEMPLATE_SAMPLE_ROWS = [
  { name: "welcome_offer", language: "en_US", category: "MARKETING", header: "Welcome to {{1}}!", body: "Hi {{1}}, here's 20% off your first order with code SAVE20.", footer: "Reply STOP to opt out", components_json: "" },
  { name: "order_update", language: "en_US", category: "UTILITY", header: "", body: "Your order {{1}} has shipped and will arrive on {{2}}.", footer: "", components_json: "" },
];

const TEMPLATE_NAME_RE = /^[a-z0-9_]{1,512}$/;
const VALID_CATEGORIES = new Set(["MARKETING", "UTILITY", "AUTHENTICATION"]);

function buildContactPlan(rows, existingPhones) {
  if (!rows.length || rows.length < 2) {
    return { rows: [], headers: [], errors: ["CSV is empty"], stats: { total: 0, insert: 0, update: 0, invalid: 0, dupes: 0 } };
  }
  const headers = rows[0].map(mapHeader);
  if (!headers.includes("phone_number")) {
    return { rows: [], headers, errors: ["CSV must contain a phone column"], stats: { total: 0, insert: 0, update: 0, invalid: 0, dupes: 0 } };
  }

  const planned = [];
  const seenPhones = new Set();
  let invalid = 0;
  let dupes = 0;

  for (let i = 1; i < rows.length; i += 1) {
    const row = rows[i];
    const record = { custom_fields: {} };
    headers.forEach((field, idx) => {
      if (!field) return;
      const value = String(row[idx] ?? "").trim();
      if (!value) return;
      if (field === "tags") record.tags = parseTags(value);
      else if (field.startsWith("custom:")) record.custom_fields[field.slice(7)] = value;
      else if (["company", "last_purchase", "email"].includes(field)) record.custom_fields[field] = value;
      else record[field] = value;
    });

    const issues = [];
    if (!record.name) issues.push("missing name");
    if (!record.phone_number) issues.push("missing phone");
    else if (!isValidPhone(record.phone_number)) issues.push("invalid phone");

    if (issues.length) {
      invalid += 1;
      planned.push({ row: i + 1, action: "skip", issues, record });
      continue;
    }

    record.phone_number = normalizePhone(record.phone_number);
    if (seenPhones.has(record.phone_number)) {
      dupes += 1;
      planned.push({ row: i + 1, action: "merge-in-file", issues: ["duplicate phone"], record });
      continue;
    }
    seenPhones.add(record.phone_number);

    const action = existingPhones.has(record.phone_number) ? "update" : "insert";
    record.source = "csv";
    planned.push({ row: i + 1, action, issues: [], record });
  }

  const insert = planned.filter((p) => p.action === "insert").length;
  const update = planned.filter((p) => p.action === "update").length;
  return {
    rows: planned,
    headers,
    errors: [],
    stats: { total: planned.length, insert, update, invalid, dupes },
  };
}

async function commitContacts(plan) {
  const incoming = plan.rows
    .filter((p) => p.action === "insert" || p.action === "update")
    .map((p) => p.record);
  if (!incoming.length) throw new Error("No valid contacts");
  const { error } = await supabase.from("wa_contacts").upsert(incoming, { onConflict: "phone_number" });
  if (error) throw new Error(error.message);
  return incoming.length;
}

function exportContactsCsv(contacts) {
  const cols = ["name", "phone", "tags", "email", "company", "lifecycle_stage", "status", "notes"];
  const rows = contacts.map((c) => ({
    name: c.name,
    phone: c.phone_number,
    tags: (c.tags || []).join(", "),
    email: c.custom_fields?.email || "",
    company: c.custom_fields?.company || "",
    lifecycle_stage: c.lifecycle_stage || "",
    status: c.status,
    notes: c.notes || "",
  }));
  return toCsv(rows, cols);
}

function buildTemplateComponents({ header, body, footer, components_json }) {
  if (components_json && components_json.trim()) {
    try {
      const parsed = JSON.parse(components_json);
      if (Array.isArray(parsed)) return parsed;
    } catch { }
  }
  const components = [];
  if (header && header.trim()) components.push({ type: "HEADER", format: "TEXT", text: header.trim() });
  if (body && body.trim()) components.push({ type: "BODY", text: body.trim() });
  if (footer && footer.trim()) components.push({ type: "FOOTER", text: footer.trim() });
  return components;
}

function extractVariables(text) {
  const matches = String(text || "").match(/\{\{\d+\}\}/g) || [];
  return [...new Set(matches.map((m) => Number(m.replace(/[^\d]/g, ""))))]
    .sort((a, b) => a - b)
    .map((n) => `{{${n}}}`);
}

function buildTemplatePlan(rows, existing, defaultWabaId) {
  if (!rows.length || rows.length < 2) return { rows: [], headers: [], errors: ["CSV is empty"], stats: { total: 0, insert: 0, update: 0, invalid: 0 } };
  if (!defaultWabaId) return { rows: [], headers: [], errors: ["Add a WhatsApp account first"], stats: { total: 0, insert: 0, update: 0, invalid: 0 } };
  
  const rawHeaders = rows[0].map((h) => String(h || "").trim().toLowerCase().replace(/\s+/g, "_"));
  const required = ["name", "language", "category", "body"];
  const missing = required.filter((r) => !rawHeaders.includes(r));
  if (missing.length) return { rows: [], headers: rawHeaders, errors: [`Missing columns: ${missing.join(", ")}`], stats: { total: 0, insert: 0, update: 0, invalid: 0 } };

  const idx = (key) => rawHeaders.indexOf(key);
  const planned = [];
  const seen = new Set();
  let invalid = 0;
  const existingMap = new Map((existing || []).map((t) => [`${t.name}|${t.language}`, t]));

  for (let i = 1; i < rows.length; i += 1) {
    const row = rows[i];
    const record = {
      name: String(row[idx("name")] ?? "").trim().toLowerCase(),
      language: String(row[idx("language")] ?? "").trim(),
      category: String(row[idx("category")] ?? "").trim().toUpperCase(),
      waba_id: defaultWabaId,
    };
    const header = idx("header") >= 0 ? String(row[idx("header")] ?? "") : "";
    const body = String(row[idx("body")] ?? "");
    const footer = idx("footer") >= 0 ? String(row[idx("footer")] ?? "") : "";
    const components_json = idx("components_json") >= 0 ? String(row[idx("components_json")] ?? "") : "";

    const issues = [];
    if (!record.name || !TEMPLATE_NAME_RE.test(record.name)) issues.push("invalid name");
    if (!record.language) issues.push("missing language");
    if (!VALID_CATEGORIES.has(record.category)) issues.push("invalid category");
    if (!body.trim()) issues.push("missing body");

    if (issues.length) {
      invalid += 1;
      planned.push({ row: i + 1, action: "skip", issues, record });
      continue;
    }

    const key = `${record.name}|${record.language}`;
    if (seen.has(key)) {
      invalid += 1;
      planned.push({ row: i + 1, action: "skip", issues: ["duplicate row"], record });
      continue;
    }
    seen.add(key);

    record.components = buildTemplateComponents({ header, body, footer, components_json });
    record.variables = extractVariables(`${header} ${body}`);
    record.status = "LOCAL";

    const action = existingMap.has(key) ? "update" : "insert";
    if (action === "update") record.id = existingMap.get(key).id;
    planned.push({ row: i + 1, action, issues: [], record });
  }

  const insert = planned.filter((p) => p.action === "insert").length;
  const update = planned.filter((p) => p.action === "update").length;
  return { rows: planned, headers: rawHeaders, errors: [], stats: { total: planned.length, insert, update, invalid } };
}

async function commitTemplates(plan) {
  const inserts = plan.rows.filter((p) => p.action === "insert").map((p) => p.record);
  const updates = plan.rows.filter((p) => p.action === "update").map((p) => p.record);
  if (inserts.length) {
    const { error } = await supabase.from("wa_templates").insert(inserts);
    if (error) throw new Error(error.message);
  }
  for (const u of updates) {
    const { id, ...patch } = u;
    const { error } = await supabase.from("wa_templates").update(patch).eq("id", id);
    if (error) throw new Error(error.message);
  }
  return inserts.length + updates.length;
}

function exportTemplatesCsv(templates) {
  const cols = ["name", "language", "category", "status", "header", "body", "footer", "components_json"];
  const rows = templates.map((t) => {
    const components = Array.isArray(t.components) ? t.components : [];
    const find = (type) => components.find((c) => String(c?.type || "").toUpperCase() === type);
    return {
      name: t.name,
      language: t.language,
      category: t.category,
      status: t.status,
      header: find("HEADER")?.text || "",
      body: find("BODY")?.text || "",
      footer: find("FOOTER")?.text || "",
      components_json: JSON.stringify(components),
    };
  });
  return toCsv(rows, cols);
}

function ActionBadge({ action }) {
  const map = {
    insert: { label: "New", cls: "bg-green-500/15 text-green-500" },
    update: { label: "Update", cls: "bg-blue-500/15 text-blue-500" },
    skip: { label: "Skip", cls: "bg-red-500/15 text-red-500" },
    "merge-in-file": { label: "Merged", cls: "bg-yellow-500/15 text-yellow-500" },
  };
  const entry = map[action] || { label: action, cls: "bg-muted text-muted-foreground" };
  return <span className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${entry.cls}`}>{entry.label}</span>;
}

function StatChip({ icon: Icon, label, value, tone }) {
  const colors = {
    default: "bg-muted text-foreground",
    success: "bg-green-500/10 text-green-500",
    primary: "bg-blue-500/10 text-blue-500",
    warning: "bg-yellow-500/10 text-yellow-500",
    destructive: "bg-red-500/10 text-red-500",
  };
  return (
    <div className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs ${colors[tone || "default"]}`}>
      <Icon className="h-3.5 w-3.5" />
      <span className="font-bold tabular-nums">{value}</span>
      <span className="opacity-80 font-medium uppercase text-[10px]">{label}</span>
    </div>
  );
}

function FileDropZone({ onFile, fileName, onClear }) {
  const inputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  const handleFile = (file) => {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".csv")) return toast.error("Choose a CSV file");
    onFile(file);
  };
  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files?.[0]); }}
      className={`flex flex-col items-center justify-center rounded-md border-2 border-dashed p-8 text-center transition-colors cursor-pointer ${
        dragOver ? "border-primary bg-primary/5" : "border-border/60 bg-muted/20"
      }`}
      onClick={() => inputRef.current?.click()}
    >
      <FileSpreadsheet className="mb-3 h-8 w-8 text-muted-foreground" />
      {fileName ? (
        <>
          <p className="text-sm font-medium">{fileName}</p>
          <Button size="sm" variant="ghost" className="mt-2 h-7" onClick={(e) => { e.stopPropagation(); onClear(); }}><Trash2 className="h-3.5 w-3.5" /></Button>
        </>
      ) : (
        <>
          <p className="text-sm font-medium">Drop CSV here or click to browse</p>
          <p className="mt-1 text-xs text-muted-foreground">Up to 5000 rows supported</p>
        </>
      )}
      <input ref={inputRef} type="file" accept=".csv" className="sr-only" onChange={(e) => handleFile(e.target.files?.[0])} />
    </div>
  );
}

function ContactsSection({ data }) {
  const [file, setFile] = useState(null);
  const [plan, setPlan] = useState(null);
  const [busy, setBusy] = useState(false);
  const existingPhones = useMemo(() => new Set((data.contacts.data || []).map((c) => c.phone_number)), [data.contacts.data]);

  const handleFile = async (f) => {
    setFile(f);
    try {
      const rows = parseCsv(await f.text());
      setPlan(buildContactPlan(rows, existingPhones));
    } catch (e) { toast.error(e.message); setPlan(null); }
  };

  const sync = async () => {
    if (!plan) return;
    setBusy(true);
    try {
      const count = await commitContacts(plan);
      toast.success(`Imported ${count} contacts`);
      data.contacts.refetch(); setFile(null); setPlan(null);
    } catch (e) { toast.error(e.message); }
    finally { setBusy(false); }
  };

  const downloadSample = () => {
    downloadCsv("contacts-sample.csv", toCsv(CONTACT_SAMPLE_ROWS, CONTACT_SAMPLE_HEADERS));
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
      <div className="space-y-4">
        <FileDropZone onFile={handleFile} fileName={file?.name} onClear={() => { setFile(null); setPlan(null); }} />
        {plan && (
          <>
            <div className="flex flex-wrap gap-2">
              <StatChip icon={Users} label="rows" value={plan.stats.total} />
              <StatChip icon={CheckCircle2} label="new" value={plan.stats.insert} tone="success" />
              <StatChip icon={ArrowRight} label="update" value={plan.stats.update} tone="primary" />
              {plan.stats.invalid > 0 && <StatChip icon={XCircle} label="skipped" value={plan.stats.invalid} tone="destructive" />}
            </div>
            <ScrollArea className="h-96 rounded-md border border-border/60">
              <table className="w-full text-xs">
                <thead className="sticky top-0 bg-muted/90 backdrop-blur text-left font-bold uppercase tracking-tight">
                  <tr className="border-b border-border/60">
                    <th className="p-2">#</th><th className="p-2">Action</th><th className="p-2">Name</th><th className="p-2">Phone</th><th className="p-2">Issues</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">{plan.rows.map((p) => (
                  <tr key={p.row} className={p.action === "skip" ? "bg-red-500/5" : "hover:bg-muted/30"}>
                    <td className="p-2 text-muted-foreground">{p.row}</td>
                    <td className="p-2"><ActionBadge action={p.action} /></td>
                    <td className="p-2 font-medium">{p.record.name}</td>
                    <td className="p-2 font-mono">{p.record.phone_number}</td>
                    <td className="p-2 text-red-500">{p.issues.join(", ")}</td>
                  </tr>
                ))}</tbody>
              </table>
            </ScrollArea>
            <div className="flex justify-end gap-2">
              <Button size="sm" variant="outline" onClick={() => { setFile(null); setPlan(null); }}>Cancel</Button>
              <Button size="sm" onClick={sync} disabled={busy || (plan.stats.insert + plan.stats.update) === 0}>
                {busy ? "Syncing..." : "Commit changes"}
              </Button>
            </div>
          </>
        )}
      </div>
      <div className="space-y-4">
        <Card className="rounded-md border-border/60 bg-muted/10 h-fit">
          <CardHeader><CardTitle className="text-sm">Quick start</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <Button size="sm" variant="outline" className="w-full justify-start h-9" onClick={downloadSample}><Download className="mr-2 h-4 w-4" /> Download sample</Button>
            <Button size="sm" variant="outline" className="w-full justify-start h-9" onClick={() => {
              const list = data.contacts.data || [];
              if (!list.length) return toast.error("No contacts");
              downloadCsv("contacts-export.csv", exportContactsCsv(list));
            }}><Download className="mr-2 h-4 w-4" /> Export all</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function TemplatesSection({ data }) {
  const [file, setFile] = useState(null);
  const [plan, setPlan] = useState(null);
  const [busy, setBusy] = useState(false);
  const defaultWabaId = useMemo(() => {
    const numbers = data.phoneNumbers.data || [];
    const def = numbers.find((n) => n.is_default) || numbers[0];
    return def?.waba_id || "";
  }, [data.phoneNumbers.data]);

  const handleFile = async (f) => {
    setFile(f);
    try {
      const rows = parseCsv(await f.text());
      setPlan(buildTemplatePlan(rows, data.templates.data || [], defaultWabaId));
    } catch (e) { toast.error(e.message); setPlan(null); }
  };

  const sync = async () => {
    if (!plan) return;
    setBusy(true);
    try {
      const count = await commitTemplates(plan);
      toast.success(`Imported ${count} templates`);
      data.templates.refetch(); setFile(null); setPlan(null);
    } catch (e) { toast.error(e.message); }
    finally { setBusy(false); }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
      <div className="space-y-4">
        <FileDropZone onFile={handleFile} fileName={file?.name} onClear={() => { setFile(null); setPlan(null); }} />
        {plan && (
          <>
            <div className="flex flex-wrap gap-2">
              <StatChip icon={BookTemplate} label="rows" value={plan.stats.total} />
              <StatChip icon={CheckCircle2} label="new" value={plan.stats.insert} tone="success" />
              <StatChip icon={ArrowRight} label="update" value={plan.stats.update} tone="primary" />
              {plan.stats.invalid > 0 && <StatChip icon={XCircle} label="skipped" value={plan.stats.invalid} tone="destructive" />}
            </div>
            <ScrollArea className="h-96 rounded-md border border-border/60">
              <table className="w-full text-xs">
                <thead className="sticky top-0 bg-muted/90 backdrop-blur text-left font-bold uppercase tracking-tight">
                  <tr className="border-b border-border/60">
                    <th className="p-2">#</th><th className="p-2">Action</th><th className="p-2">Name</th><th className="p-2">Lang</th><th className="p-2">Issues</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">{plan.rows.map((p) => (
                  <tr key={p.row} className={p.action === "skip" ? "bg-red-500/5" : "hover:bg-muted/30"}>
                    <td className="p-2 text-muted-foreground">{p.row}</td>
                    <td className="p-2"><ActionBadge action={p.action} /></td>
                    <td className="p-2 font-medium">{p.record.name}</td>
                    <td className="p-2 font-mono">{p.record.language}</td>
                    <td className="p-2 text-red-500">{p.issues.join(", ")}</td>
                  </tr>
                ))}</tbody>
              </table>
            </ScrollArea>
            <div className="flex justify-end gap-2">
              <Button size="sm" variant="outline" onClick={() => { setFile(null); setPlan(null); }}>Cancel</Button>
              <Button size="sm" onClick={sync} disabled={busy || (plan.stats.insert + plan.stats.update) === 0}>
                {busy ? "Syncing..." : "Commit changes"}
              </Button>
            </div>
          </>
        )}
      </div>
      <div className="space-y-4">
        <Card className="rounded-md border-border/60 bg-muted/10 h-fit">
          <CardHeader><CardTitle className="text-sm">Templates</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <Button size="sm" variant="outline" className="w-full justify-start h-9" onClick={() => downloadCsv("templates-sample.csv", toCsv(TEMPLATE_SAMPLE_ROWS, TEMPLATE_SAMPLE_HEADERS))}><Download className="mr-2 h-4 w-4" /> Sample CSV</Button>
            <Button size="sm" variant="outline" className="w-full justify-start h-9" onClick={() => {
              const list = data.templates.data || [];
              if (!list.length) return toast.error("No templates");
              downloadCsv("templates-export.csv", exportTemplatesCsv(list));
            }}><Download className="mr-2 h-4 w-4" /> Export all</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function ImportExportPage() {
  const data = useV2Data();
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-bold tracking-tight">Import & Export</h2>
        <p className="text-sm text-muted-foreground">Bulk manage contacts and templates using CSV files.</p>
      </div>
      <Tabs defaultValue="contacts">
        <TabsList className="bg-muted/30 p-1 h-10">
          <TabsTrigger value="contacts" className="h-8 text-xs font-bold uppercase tracking-tight">Contacts</TabsTrigger>
          <TabsTrigger value="templates" className="h-8 text-xs font-bold uppercase tracking-tight">Templates</TabsTrigger>
        </TabsList>
        <TabsContent value="contacts" className="mt-4"><ContactsSection data={data} /></TabsContent>
        <TabsContent value="templates" className="mt-4"><TemplatesSection data={data} /></TabsContent>
      </Tabs>
    </div>
  );
}
