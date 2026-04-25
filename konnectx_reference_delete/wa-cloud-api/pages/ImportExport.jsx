import { useMemo, useRef, useState } from "react";
import { Upload, Download, FileSpreadsheet, Users, BookTemplate, CheckCircle2, AlertTriangle, XCircle, Trash2, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { parseCsv, toCsv, downloadCsv } from "../lib/csv";
import { mapHeader } from "../lib/segments";
import { isValidPhone, normalizePhone, parseTags } from "../lib/validators";

// ============================================================================
// CONTACTS — schema & helpers
// ============================================================================

const CONTACT_SAMPLE_HEADERS = ["name", "phone", "tags", "email", "company", "lifecycle_stage", "notes"];
const CONTACT_SAMPLE_ROWS = [
  { name: "Alex Rivera", phone: "+15551234567", tags: "vip, lead", email: "alex@acme.com", company: "Acme Inc", lifecycle_stage: "customer", notes: "VIP customer" },
  { name: "Priya Shah", phone: "+919812345678", tags: "trial", email: "priya@example.com", company: "Lumen Labs", lifecycle_stage: "lead", notes: "" },
];

function buildContactPlan(rows, existingPhones) {
  if (!rows.length || rows.length < 2) {
    return { rows: [], headers: [], errors: ["CSV is empty"], stats: { total: 0, insert: 0, update: 0, invalid: 0, dupes: 0 } };
  }
  const headers = rows[0].map(mapHeader);
  if (!headers.includes("phone_number")) {
    return { rows: [], headers, errors: ["CSV must contain a phone column (phone, mobile, whatsapp, or number)"], stats: { total: 0, insert: 0, update: 0, invalid: 0, dupes: 0 } };
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
      planned.push({ row: i + 1, action: "merge-in-file", issues: ["duplicate of earlier row"], record });
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
  if (!incoming.length) throw new Error("No valid contacts to import");
  const { error } = await supabase.from("wa_contacts").upsert(incoming, { onConflict: "phone_number" });
  if (error) throw new Error(error.message);
  return incoming.length;
}

function exportContactsCsv(contacts) {
  const cols = ["name", "phone", "tags", "email", "company", "lifecycle_stage", "status", "notes", "last_message_at"];
  const rows = contacts.map((c) => ({
    name: c.name,
    phone: c.phone_number,
    tags: (c.tags || []).join(", "),
    email: c.custom_fields?.email || "",
    company: c.custom_fields?.company || "",
    lifecycle_stage: c.lifecycle_stage || "",
    status: c.status,
    notes: c.notes || "",
    last_message_at: c.last_message_at || "",
  }));
  return toCsv(rows, cols);
}

// ============================================================================
// TEMPLATES — schema & helpers
// ============================================================================

const TEMPLATE_SAMPLE_HEADERS = ["name", "language", "category", "header", "body", "footer", "components_json"];
const TEMPLATE_SAMPLE_ROWS = [
  { name: "welcome_offer", language: "en_US", category: "MARKETING", header: "Welcome to {{1}}!", body: "Hi {{1}}, here's 20% off your first order with code SAVE20.", footer: "Reply STOP to opt out", components_json: "" },
  { name: "order_update", language: "en_US", category: "UTILITY", header: "", body: "Your order {{1}} has shipped and will arrive on {{2}}.", footer: "", components_json: "" },
];

const TEMPLATE_NAME_RE = /^[a-z0-9_]{1,512}$/;
const VALID_CATEGORIES = new Set(["MARKETING", "UTILITY", "AUTHENTICATION"]);

function buildTemplateComponents({ header, body, footer, components_json }) {
  // If a full components_json is supplied, prefer it (lets users round-trip exports).
  if (components_json && components_json.trim()) {
    try {
      const parsed = JSON.parse(components_json);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      // fall through to building from simple fields
    }
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
  if (!rows.length || rows.length < 2) {
    return { rows: [], headers: [], errors: ["CSV is empty"], stats: { total: 0, insert: 0, update: 0, invalid: 0 } };
  }
  if (!defaultWabaId) {
    return { rows: [], headers: [], errors: ["No default WhatsApp account is configured. Add one in Settings before importing templates."], stats: { total: 0, insert: 0, update: 0, invalid: 0 } };
  }
  const rawHeaders = rows[0].map((h) => String(h || "").trim().toLowerCase().replace(/\s+/g, "_"));
  const required = ["name", "language", "category", "body"];
  const missing = required.filter((r) => !rawHeaders.includes(r));
  if (missing.length) {
    return { rows: [], headers: rawHeaders, errors: [`CSV is missing required column(s): ${missing.join(", ")}`], stats: { total: 0, insert: 0, update: 0, invalid: 0 } };
  }

  const idx = (key) => rawHeaders.indexOf(key);
  const planned = [];
  const seen = new Set();
  let invalid = 0;

  // Build a quick lookup of existing templates by (name|language)
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
    if (!record.name) issues.push("missing name");
    else if (!TEMPLATE_NAME_RE.test(record.name)) issues.push("name must be lowercase letters, digits, underscores");
    if (!record.language) issues.push("missing language");
    if (!record.category) issues.push("missing category");
    else if (!VALID_CATEGORIES.has(record.category)) issues.push(`category must be one of ${[...VALID_CATEGORIES].join(", ")}`);
    if (!body.trim()) issues.push("missing body");

    if (issues.length) {
      invalid += 1;
      planned.push({ row: i + 1, action: "skip", issues, record });
      continue;
    }

    const key = `${record.name}|${record.language}`;
    if (seen.has(key)) {
      invalid += 1;
      planned.push({ row: i + 1, action: "skip", issues: ["duplicate name+language earlier in file"], record });
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
  const cols = ["name", "language", "category", "status", "header", "body", "footer", "variables", "components_json", "updated_at"];
  const rows = templates.map((t) => {
    const components = Array.isArray(t.components) ? t.components : [];
    const find = (type, format) => components.find((c) => String(c?.type || "").toUpperCase() === type && (!format || String(c?.format || "").toUpperCase() === format));
    const headerComp = find("HEADER");
    const bodyComp = find("BODY");
    const footerComp = find("FOOTER");
    return {
      name: t.name,
      language: t.language,
      category: t.category,
      status: t.status,
      header: headerComp?.format && headerComp.format !== "TEXT" ? `[${headerComp.format}]` : (headerComp?.text || ""),
      body: bodyComp?.text || "",
      footer: footerComp?.text || "",
      variables: Array.isArray(t.variables) ? t.variables.join(", ") : "",
      components_json: JSON.stringify(components),
      updated_at: t.updated_at || "",
    };
  });
  return toCsv(rows, cols);
}

// ============================================================================
// SHARED UI bits
// ============================================================================

function ActionBadge({ action }) {
  const map = {
    insert:          { label: "New",       cls: "bg-success/15 text-success ring-success/30" },
    update:          { label: "Update",    cls: "bg-primary/15 text-primary ring-primary/30" },
    skip:            { label: "Skip",      cls: "bg-destructive/15 text-destructive ring-destructive/30" },
    "merge-in-file": { label: "Merged",    cls: "bg-warning/15 text-warning ring-warning/30" },
  };
  const entry = map[action] || { label: action, cls: "bg-muted text-muted-foreground ring-border" };
  return <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset ${entry.cls}`}>{entry.label}</span>;
}

function StatChip({ icon: Icon, label, value, tone = "default" }) {
  const tones = {
    default: "bg-muted text-foreground",
    success: "bg-success/10 text-success",
    primary: "bg-primary/10 text-primary",
    warning: "bg-warning/10 text-warning",
    destructive: "bg-destructive/10 text-destructive",
  };
  return (
    <div className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm ${tones[tone]}`}>
      <Icon className="h-4 w-4" />
      <span className="font-semibold tabular-nums">{value}</span>
      <span className="text-xs opacity-80">{label}</span>
    </div>
  );
}

function FileDropZone({ accept = ".csv", onFile, fileName, onClear }) {
  const inputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFile = (file) => {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".csv")) {
      toast.error("Please choose a .csv file");
      return;
    }
    onFile(file);
  };

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files?.[0]); }}
      className={`flex flex-col items-center justify-center rounded-md border-2 border-dashed p-8 text-center transition-colors ${
        dragOver ? "border-primary bg-primary/5" : "border-border bg-card/40"
      }`}
    >
      <FileSpreadsheet className="mb-3 h-8 w-8 text-muted-foreground" />
      {fileName ? (
        <>
          <p className="text-sm font-medium">{fileName}</p>
          <div className="mt-3 flex gap-2">
            <Button size="sm" variant="outline" onClick={() => inputRef.current?.click()}>Choose another</Button>
            <Button size="sm" variant="ghost" onClick={onClear}><Trash2 className="mr-1.5 h-3.5 w-3.5" /> Clear</Button>
          </div>
        </>
      ) : (
        <>
          <p className="text-sm font-medium">Drop a CSV file here</p>
          <p className="mt-1 text-xs text-muted-foreground">or click to browse</p>
          <Button size="sm" variant="outline" className="mt-3" onClick={() => inputRef.current?.click()}>
            <Upload className="mr-2 h-4 w-4" /> Choose file
          </Button>
        </>
      )}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="sr-only"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
    </div>
  );
}

function PlanTable({ plan, columns }) {
  if (!plan.rows.length) return null;
  return (
    <ScrollArea className="h-[360px] rounded-md border border-border">
      <table className="w-full text-xs">
        <thead className="sticky top-0 bg-muted/80 backdrop-blur">
          <tr className="text-left">
            <th className="w-10 p-2">#</th>
            <th className="w-20 p-2">Action</th>
            {columns.map((c) => <th key={c.key} className="p-2 font-medium">{c.label}</th>)}
            <th className="p-2">Issues</th>
          </tr>
        </thead>
        <tbody>
          {plan.rows.map((p) => (
            <tr key={p.row} className={`border-t border-border ${p.action === "skip" ? "bg-destructive/5" : ""}`}>
              <td className="p-2 font-mono text-muted-foreground">{p.row}</td>
              <td className="p-2"><ActionBadge action={p.action} /></td>
              {columns.map((c) => (
                <td key={c.key} className="max-w-[220px] truncate p-2" title={c.get(p.record)}>
                  {c.get(p.record) || <span className="text-muted-foreground">—</span>}
                </td>
              ))}
              <td className="p-2 text-destructive">{p.issues.join(", ")}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </ScrollArea>
  );
}

// ============================================================================
// SECTION COMPONENTS
// ============================================================================

function ContactsSection({ data }) {
  const [file, setFile] = useState(null);
  const [plan, setPlan] = useState(null);
  const [busy, setBusy] = useState(false);

  const existingPhones = useMemo(
    () => new Set((data.contacts.data || []).map((c) => c.phone_number)),
    [data.contacts.data],
  );

  const handleFile = async (f) => {
    setFile(f);
    try {
      const text = await f.text();
      const rows = parseCsv(text);
      setPlan(buildContactPlan(rows, existingPhones));
    } catch (e) {
      toast.error(e.message || "Failed to read file");
      setPlan(null);
    }
  };

  const clear = () => { setFile(null); setPlan(null); };

  const sync = async () => {
    if (!plan) return;
    setBusy(true);
    try {
      const count = await commitContacts(plan);
      toast.success(`Imported ${count} contact${count === 1 ? "" : "s"} (${plan.stats.insert} new, ${plan.stats.update} updated)`);
      data.contacts.refetch();
      clear();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setBusy(false);
    }
  };

  const downloadTemplate = () => {
    downloadCsv("contacts-template.csv", toCsv(CONTACT_SAMPLE_ROWS, CONTACT_SAMPLE_HEADERS));
    toast.success("Sample CSV downloaded");
  };

  const exportAll = () => {
    const list = data.contacts.data || [];
    if (!list.length) return toast.error("No contacts to export");
    downloadCsv(`contacts-${new Date().toISOString().slice(0, 10)}.csv`, exportContactsCsv(list));
    toast.success(`Exported ${list.length} contact${list.length === 1 ? "" : "s"}`);
  };

  const planColumns = [
    { key: "name", label: "Name", get: (r) => r.name },
    { key: "phone_number", label: "Phone", get: (r) => r.phone_number },
    { key: "tags", label: "Tags", get: (r) => (r.tags || []).join(", ") },
    { key: "email", label: "Email", get: (r) => r.custom_fields?.email || "" },
  ];

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
      <div className="space-y-4">
        <FileDropZone onFile={handleFile} fileName={file?.name} onClear={clear} />

        {plan?.errors?.length > 0 && (
          <div className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
            <XCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <div>{plan.errors.map((e, i) => <p key={i}>{e}</p>)}</div>
          </div>
        )}

        {plan && plan.rows.length > 0 && (
          <>
            <div className="flex flex-wrap gap-2">
              <StatChip icon={Users} label="rows" value={plan.stats.total} tone="default" />
              <StatChip icon={CheckCircle2} label="new" value={plan.stats.insert} tone="success" />
              <StatChip icon={ArrowRight} label="update" value={plan.stats.update} tone="primary" />
              {plan.stats.dupes > 0 && <StatChip icon={AlertTriangle} label="duplicate rows" value={plan.stats.dupes} tone="warning" />}
              {plan.stats.invalid > 0 && <StatChip icon={XCircle} label="invalid (skipped)" value={plan.stats.invalid} tone="destructive" />}
            </div>
            <PlanTable plan={plan} columns={planColumns} />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={clear}>Cancel</Button>
              <Button onClick={sync} disabled={busy || (plan.stats.insert + plan.stats.update) === 0}>
                {busy ? "Syncing…" : `Sync ${plan.stats.insert + plan.stats.update} contact${plan.stats.insert + plan.stats.update === 1 ? "" : "s"}`}
              </Button>
            </div>
          </>
        )}
      </div>

      <div className="space-y-4">
        <Card className="rounded-md border-border/60 bg-card/40">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">CSV format</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-xs text-muted-foreground">
            <p>Required column: <code className="rounded bg-muted px-1 py-0.5">phone</code> (or <code className="rounded bg-muted px-1 py-0.5">mobile</code>, <code className="rounded bg-muted px-1 py-0.5">whatsapp</code>, <code className="rounded bg-muted px-1 py-0.5">number</code>)</p>
            <p>Recognized columns: <code className="rounded bg-muted px-1 py-0.5">name</code>, <code className="rounded bg-muted px-1 py-0.5">tags</code>, <code className="rounded bg-muted px-1 py-0.5">email</code>, <code className="rounded bg-muted px-1 py-0.5">company</code>, <code className="rounded bg-muted px-1 py-0.5">lifecycle_stage</code>, <code className="rounded bg-muted px-1 py-0.5">notes</code></p>
            <p>Any other column becomes a custom field. Existing phones are <strong>updated</strong>; new phones are <strong>inserted</strong>.</p>
            <Button size="sm" variant="outline" className="mt-2 w-full" onClick={downloadTemplate}>
              <Download className="mr-2 h-3.5 w-3.5" /> Download sample CSV
            </Button>
          </CardContent>
        </Card>

        <Card className="rounded-md border-border/60 bg-card/40">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Export</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-xs text-muted-foreground">
            <p>Download all <Badge variant="secondary" className="rounded-md font-mono">{(data.contacts.data || []).length}</Badge> contacts as a CSV — re-import to round-trip.</p>
            <Button size="sm" className="mt-2 w-full" onClick={exportAll} disabled={!(data.contacts.data || []).length}>
              <Download className="mr-2 h-3.5 w-3.5" /> Export contacts
            </Button>
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
      const text = await f.text();
      const rows = parseCsv(text);
      setPlan(buildTemplatePlan(rows, data.templates.data || [], defaultWabaId));
    } catch (e) {
      toast.error(e.message || "Failed to read file");
      setPlan(null);
    }
  };

  const clear = () => { setFile(null); setPlan(null); };

  const sync = async () => {
    if (!plan) return;
    setBusy(true);
    try {
      const count = await commitTemplates(plan);
      toast.success(`Imported ${count} template${count === 1 ? "" : "s"} as local drafts (status: LOCAL)`);
      data.templates.refetch();
      clear();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setBusy(false);
    }
  };

  const downloadTemplate = () => {
    downloadCsv("templates-template.csv", toCsv(TEMPLATE_SAMPLE_ROWS, TEMPLATE_SAMPLE_HEADERS));
    toast.success("Sample CSV downloaded");
  };

  const exportAll = () => {
    const list = data.templates.data || [];
    if (!list.length) return toast.error("No templates to export");
    downloadCsv(`templates-${new Date().toISOString().slice(0, 10)}.csv`, exportTemplatesCsv(list));
    toast.success(`Exported ${list.length} template${list.length === 1 ? "" : "s"}`);
  };

  const planColumns = [
    { key: "name", label: "Name", get: (r) => r.name },
    { key: "language", label: "Lang", get: (r) => r.language },
    { key: "category", label: "Category", get: (r) => r.category },
    { key: "body", label: "Body", get: (r) => r.components?.find((c) => c.type === "BODY")?.text || "" },
    { key: "vars", label: "Vars", get: (r) => (r.variables || []).length },
  ];

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
      <div className="space-y-4">
        <FileDropZone onFile={handleFile} fileName={file?.name} onClear={clear} />

        {plan?.errors?.length > 0 && (
          <div className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
            <XCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <div>{plan.errors.map((e, i) => <p key={i}>{e}</p>)}</div>
          </div>
        )}

        {plan && plan.rows.length > 0 && (
          <>
            <div className="flex flex-wrap gap-2">
              <StatChip icon={BookTemplate} label="rows" value={plan.stats.total} tone="default" />
              <StatChip icon={CheckCircle2} label="new" value={plan.stats.insert} tone="success" />
              <StatChip icon={ArrowRight} label="update" value={plan.stats.update} tone="primary" />
              {plan.stats.invalid > 0 && <StatChip icon={XCircle} label="invalid (skipped)" value={plan.stats.invalid} tone="destructive" />}
            </div>
            <PlanTable plan={plan} columns={planColumns} />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={clear}>Cancel</Button>
              <Button onClick={sync} disabled={busy || (plan.stats.insert + plan.stats.update) === 0}>
                {busy ? "Syncing…" : `Sync ${plan.stats.insert + plan.stats.update} template${plan.stats.insert + plan.stats.update === 1 ? "" : "s"}`}
              </Button>
            </div>
          </>
        )}
      </div>

      <div className="space-y-4">
        <Card className="rounded-md border-border/60 bg-card/40">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">CSV format</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-xs text-muted-foreground">
            <p>Required: <code className="rounded bg-muted px-1 py-0.5">name</code>, <code className="rounded bg-muted px-1 py-0.5">language</code>, <code className="rounded bg-muted px-1 py-0.5">category</code>, <code className="rounded bg-muted px-1 py-0.5">body</code></p>
            <p>Optional: <code className="rounded bg-muted px-1 py-0.5">header</code>, <code className="rounded bg-muted px-1 py-0.5">footer</code>, <code className="rounded bg-muted px-1 py-0.5">components_json</code></p>
            <p>Categories: <code className="rounded bg-muted px-1 py-0.5">MARKETING</code>, <code className="rounded bg-muted px-1 py-0.5">UTILITY</code>, <code className="rounded bg-muted px-1 py-0.5">AUTHENTICATION</code></p>
            <p>Templates are saved as <Badge variant="outline" className="rounded font-mono text-[10px]">LOCAL</Badge> drafts. Submit them to Meta for approval from the Templates page.</p>
            {!defaultWabaId && (
              <div className="flex items-start gap-1.5 rounded-md border border-warning/30 bg-warning/5 p-2 text-warning">
                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <span>Add a WhatsApp account in Settings before importing templates.</span>
              </div>
            )}
            <Button size="sm" variant="outline" className="mt-2 w-full" onClick={downloadTemplate}>
              <Download className="mr-2 h-3.5 w-3.5" /> Download sample CSV
            </Button>
          </CardContent>
        </Card>

        <Card className="rounded-md border-border/60 bg-card/40">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Export</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-xs text-muted-foreground">
            <p>Download all <Badge variant="secondary" className="rounded-md font-mono">{(data.templates.data || []).length}</Badge> templates with full component JSON.</p>
            <Button size="sm" className="mt-2 w-full" onClick={exportAll} disabled={!(data.templates.data || []).length}>
              <Download className="mr-2 h-3.5 w-3.5" /> Export templates
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ============================================================================
// PAGE
// ============================================================================

export function ImportExport({ data }) {
  return (
    <div className="space-y-6">
      <Card className="rounded-md border-border/60 bg-gradient-card shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" /> Import &amp; Export
          </CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">
            Upload a CSV to bulk-add or update contacts and templates. Preview the changes before they're written, then sync them into the manager. Export anything back out as CSV at any time.
          </p>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="contacts">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="contacts" className="gap-2"><Users className="h-4 w-4" /> Contacts</TabsTrigger>
              <TabsTrigger value="templates" className="gap-2"><BookTemplate className="h-4 w-4" /> Templates</TabsTrigger>
            </TabsList>
            <TabsContent value="contacts" className="mt-4">
              <ContactsSection data={data} />
            </TabsContent>
            <TabsContent value="templates" className="mt-4">
              <TemplatesSection data={data} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
