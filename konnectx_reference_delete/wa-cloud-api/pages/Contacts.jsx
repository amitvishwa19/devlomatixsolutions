import { useMemo, useState } from "react";
import { Eye, Pencil, Plus, Search, Trash2, Upload, UserRound } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { formatDate, isValidPhone, normalizePhone, parseTags } from "../lib/validators";
import { applyFilter, EMPTY_FILTER, LIFECYCLE_STAGES, mapHeader, parseCsv } from "../lib/segments";
import { ContactTimeline } from "../components/ContactTimeline";

// === Local server-function alternatives (uncomment to switch from edge → local) ===
// import * as contactsFn from "../functions/contacts";
// =================================================================================


const empty = {
  name: "", phone_number: "", tags: "", notes: "",
  lifecycle_stage: "", company: "", last_purchase: "", email: "",
  custom: "", // raw "key=value, key2=value2" pairs
};

function customToString(custom = {}) {
  const reserved = ["company", "last_purchase", "email"];
  return Object.entries(custom)
    .filter(([k]) => !reserved.includes(k))
    .map(([k, v]) => `${k}=${v}`)
    .join(", ");
}

function parseCustom(text) {
  const out = {};
  String(text || "").split(",").forEach((pair) => {
    const [k, ...rest] = pair.split("=");
    const key = String(k || "").trim();
    const val = rest.join("=").trim();
    if (key) out[key] = val;
  });
  return out;
}

export function Contacts({ data }) {
  const [filter, setFilter] = useState({ ...EMPTY_FILTER, exclude_opted_out: false });
  const [form, setForm] = useState(empty);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [drawerContact, setDrawerContact] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const contacts = data.contacts.data || [];
  const segments = data.segments.data || [];
  const [activeSegmentId, setActiveSegmentId] = useState("");

  const allTags = useMemo(() => {
    const set = new Set();
    contacts.forEach((c) => (c.tags || []).forEach((t) => set.add(t)));
    return [...set];
  }, [contacts]);

  const effectiveFilter = useMemo(() => {
    if (activeSegmentId) {
      const seg = segments.find((s) => s.id === activeSegmentId);
      if (seg) return { ...EMPTY_FILTER, ...seg.filter, search: filter.search };
    }
    return filter;
  }, [activeSegmentId, segments, filter]);

  const filtered = useMemo(() => applyFilter(contacts, effectiveFilter), [contacts, effectiveFilter]);

  const openAdd = () => { setEditing(null); setForm(empty); setOpen(true); };
  const openEdit = (contact) => {
    setEditing(contact);
    const cf = contact.custom_fields || {};
    setForm({
      name: contact.name || "",
      phone_number: contact.phone_number || "",
      tags: (contact.tags || []).join(", "),
      notes: contact.notes || "",
      lifecycle_stage: contact.lifecycle_stage || "",
      company: cf.company || "",
      last_purchase: cf.last_purchase || "",
      email: cf.email || "",
      custom: customToString(cf),
    });
    setOpen(true);
  };

  const showTimeline = (contact) => { setDrawerContact(contact); setDrawerOpen(true); };

  const save = async (event) => {
    event.preventDefault();
    if (!form.name.trim() || !isValidPhone(form.phone_number)) return toast.error("Enter a name and valid phone number");
    const customFields = { ...parseCustom(form.custom) };
    if (form.company) customFields.company = form.company;
    if (form.last_purchase) customFields.last_purchase = form.last_purchase;
    if (form.email) customFields.email = form.email;
    const payload = {
      name: form.name.trim(),
      phone_number: normalizePhone(form.phone_number),
      tags: parseTags(form.tags),
      notes: form.notes,
      lifecycle_stage: form.lifecycle_stage || null,
      custom_fields: customFields,
    };
    const { error } = editing
      ? await supabase.from("wa_contacts").update(payload).eq("id", editing.id)
      : await supabase.from("wa_contacts").insert({ ...payload, source: "manual" });
    if (error) return toast.error(error.message);
    toast.success(editing ? "Contact updated" : "Contact added");
    setForm(empty); setEditing(null); setOpen(false); data.contacts.refetch();
  };

  const remove = async (contact) => {
    if (!confirm(`Remove ${contact.name}?`)) return;
    const { error } = await supabase.from("wa_contacts").delete().eq("id", contact.id);
    if (error) return toast.error(error.message);
    toast.success("Contact removed"); data.contacts.refetch();
  };

  const importCsv = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    event.target.value = "";
    const rows = parseCsv(await file.text());
    if (rows.length < 2) return toast.error("CSV needs a header row and at least one record");
    const headers = rows[0].map(mapHeader);
    if (!headers.includes("phone_number")) return toast.error("CSV must contain a phone column");

    const incoming = [];
    const seenPhones = new Set();
    let dupeInFile = 0;
    let invalid = 0;
    for (const row of rows.slice(1)) {
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
      if (!record.name || !record.phone_number || !isValidPhone(record.phone_number)) { invalid += 1; continue; }
      record.phone_number = normalizePhone(record.phone_number);
      if (seenPhones.has(record.phone_number)) { dupeInFile += 1; continue; }
      seenPhones.add(record.phone_number);
      record.source = "csv";
      incoming.push(record);
    }
    if (!incoming.length) return toast.error("No valid contacts found in CSV");

    const existingPhones = new Set(contacts.map((c) => c.phone_number));
    const updates = incoming.filter((r) => existingPhones.has(r.phone_number));
    const inserts = incoming.filter((r) => !existingPhones.has(r.phone_number));

    const { error } = await supabase.from("wa_contacts").upsert(incoming, { onConflict: "phone_number" });
    if (error) return toast.error(error.message);
    toast.success(`Imported ${incoming.length} · ${inserts.length} new, ${updates.length} updated${dupeInFile ? `, ${dupeInFile} duplicate rows merged` : ""}${invalid ? `, ${invalid} skipped` : ""}`);
    data.contacts.refetch();
  };

  return (
    <>
      <Card className="rounded-md">
        <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <CardTitle>Contacts <span className="ml-2 text-xs font-normal text-muted-foreground">{filtered.length} of {contacts.length}</span></CardTitle>
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input className="pl-9 sm:w-56" placeholder="Search name, phone, company" value={filter.search} onChange={(e) => setFilter({ ...filter, search: e.target.value })} />
            </div>
            <Label className="inline-flex h-10 cursor-pointer items-center justify-center rounded-md border bg-background px-4 text-sm font-medium">
              <Upload className="mr-2 h-4 w-4" /> Import CSV
              <input type="file" accept=".csv" className="sr-only" onChange={importCsv} />
            </Label>
            <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setEditing(null); setForm(empty); } }}>
              <DialogTrigger asChild><Button size="sm" onClick={openAdd}><Plus className="mr-2 h-4 w-4" /> Add</Button></DialogTrigger>
              <DialogContent className="max-h-[90vh] overflow-y-auto">
                <DialogHeader><DialogTitle>{editing ? "Edit contact" : "Add contact"}</DialogTitle></DialogHeader>
                <form onSubmit={save} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2"><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
                    <div className="space-y-2"><Label>Phone</Label><Input value={form.phone_number} onChange={(e) => setForm({ ...form, phone_number: e.target.value })} /></div>
                    <div className="space-y-2"><Label>Company</Label><Input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} /></div>
                    <div className="space-y-2"><Label>Email</Label><Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
                    <div className="space-y-2">
                      <Label>Lifecycle stage</Label>
                      <Select value={form.lifecycle_stage || "__none"} onValueChange={(v) => setForm({ ...form, lifecycle_stage: v === "__none" ? "" : v })}>
                        <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__none">—</SelectItem>
                          {LIFECYCLE_STAGES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2"><Label>Last purchase</Label><Input value={form.last_purchase} onChange={(e) => setForm({ ...form, last_purchase: e.target.value })} placeholder="2024-12-01 · $129" /></div>
                  </div>
                  <div className="space-y-2"><Label>Tags</Label><Input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="vip, lead" /></div>
                  <div className="space-y-2"><Label>Custom fields</Label><Input value={form.custom} onChange={(e) => setForm({ ...form, custom: e.target.value })} placeholder="industry=saas, plan=pro" /></div>
                  <div className="space-y-2"><Label>Notes</Label><Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
                  <Button size="sm" type="submit">{editing ? "Update contact" : "Save contact"}</Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>

        <CardContent>
          <div className="mb-4 grid gap-2 sm:grid-cols-4">
            <Select value={activeSegmentId || "__none"} onValueChange={(v) => setActiveSegmentId(v === "__none" ? "" : v)}>
              <SelectTrigger><SelectValue placeholder="Saved segment" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="__none">No segment</SelectItem>
                {segments.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filter.tag || "__any"} onValueChange={(v) => { setActiveSegmentId(""); setFilter({ ...filter, tag: v === "__any" ? "" : v }); }}>
              <SelectTrigger><SelectValue placeholder="Tag" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="__any">Any tag</SelectItem>
                {allTags.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filter.lifecycle_stage || "__any"} onValueChange={(v) => { setActiveSegmentId(""); setFilter({ ...filter, lifecycle_stage: v === "__any" ? "" : v }); }}>
              <SelectTrigger><SelectValue placeholder="Lifecycle" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="__any">Any stage</SelectItem>
                {LIFECYCLE_STAGES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filter.status || "__any"} onValueChange={(v) => { setActiveSegmentId(""); setFilter({ ...filter, status: v === "__any" ? "" : v }); }}>
              <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="__any">Any status</SelectItem>
                <SelectItem value="active">active</SelectItem>
                <SelectItem value="opted_out">opted_out</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[920px] text-sm">
              <thead><tr className="border-b text-left text-muted-foreground">
                <th className="py-3">Contact</th><th>Phone</th><th>Company</th><th>Stage</th><th>Tags</th><th>Last message</th><th className="text-right">Actions</th>
              </tr></thead>
              <tbody>{filtered.map((contact) => (
                <tr key={contact.id} className="border-b">
                  <td className="py-3">
                    <button onClick={() => showTimeline(contact)} className="flex items-center gap-3 text-left hover:text-primary">
                      <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary"><UserRound className="h-4 w-4" /></div>
                      <span className="font-medium">{contact.name}</span>
                    </button>
                  </td>
                  <td className="font-mono">{contact.phone_number}</td>
                  <td className="text-muted-foreground">{contact.custom_fields?.company || "—"}</td>
                  <td className="capitalize text-muted-foreground">{contact.lifecycle_stage || "—"}</td>
                  <td><div className="flex flex-wrap gap-1">{(contact.tags || []).map((tag) => <Badge key={tag} variant="secondary" className="rounded-md">{tag}</Badge>)}</div></td>
                  <td className="text-muted-foreground">{formatDate(contact.last_message_at)}</td>
                  <td className="text-right">
                    <Button size="sm" variant="ghost" onClick={() => showTimeline(contact)}><Eye className="h-4 w-4" /></Button>
                    <Button size="sm" variant="ghost" onClick={() => openEdit(contact)}><Pencil className="h-4 w-4" /></Button>
                    <Button size="sm" variant="ghost" onClick={() => remove(contact)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </td>
                </tr>
              ))}</tbody>
            </table>
            {!filtered.length && <div className="py-10 text-center text-muted-foreground">No contacts match these filters.</div>}
          </div>
        </CardContent>
      </Card>

      <ContactTimeline contact={drawerContact} open={drawerOpen} onOpenChange={setDrawerOpen} />
    </>
  );
}