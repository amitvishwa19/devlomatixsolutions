import { useMemo, useState } from "react";
import { Filter, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { applyFilter, describeFilter, EMPTY_FILTER, LIFECYCLE_STAGES } from "../lib/segments";

// === Local server-function alternatives (uncomment to switch from edge → local) ===
// import * as segmentsFn from "../functions/segments";
// =================================================================================


const empty = { name: "", description: "", filter: { ...EMPTY_FILTER } };

export function Segments({ data }) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);
  const segments = data.segments.data || [];
  const contacts = data.contacts.data || [];

  const allTags = useMemo(() => {
    const set = new Set();
    contacts.forEach((c) => (c.tags || []).forEach((t) => set.add(t)));
    return [...set];
  }, [contacts]);

  const openAdd = () => { setEditing(null); setForm(empty); setOpen(true); };
  const openEdit = (segment) => {
    setEditing(segment);
    setForm({ name: segment.name, description: segment.description || "", filter: { ...EMPTY_FILTER, ...(segment.filter || {}) } });
    setOpen(true);
  };

  const save = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error("Segment needs a name");
    const payload = { name: form.name.trim(), description: form.description, filter: form.filter };
    const { error } = editing
      ? await supabase.from("wa_segments").update(payload).eq("id", editing.id)
      : await supabase.from("wa_segments").insert(payload);
    if (error) return toast.error(error.message);
    toast.success(editing ? "Segment updated" : "Segment saved");
    setOpen(false); setEditing(null); setForm(empty); data.segments.refetch();
  };

  const remove = async (segment) => {
    if (!confirm(`Delete segment "${segment.name}"?`)) return;
    const { error } = await supabase.from("wa_segments").delete().eq("id", segment.id);
    if (error) return toast.error(error.message);
    toast.success("Segment removed"); data.segments.refetch();
  };

  const setFilter = (patch) => setForm((f) => ({ ...f, filter: { ...f.filter, ...patch } }));
  const previewCount = useMemo(() => applyFilter(contacts, form.filter).length, [contacts, form.filter]);

  return (
    <Card className="rounded-md">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2"><Filter className="h-4 w-4" /> Segments</CardTitle>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setEditing(null); setForm(empty); } }}>
          <DialogTrigger asChild><Button size="sm" onClick={openAdd}><Plus className="mr-2 h-4 w-4" /> New segment</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editing ? "Edit segment" : "New segment"}</DialogTitle></DialogHeader>
            <form onSubmit={save} className="space-y-4">
              <div className="space-y-2"><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="VIP customers" /></div>
              <div className="space-y-2"><Label>Description</Label><Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Optional" /></div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Tag</Label>
                  <Select value={form.filter.tag || "__any"} onValueChange={(v) => setFilter({ tag: v === "__any" ? "" : v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__any">Any</SelectItem>
                      {allTags.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Lifecycle</Label>
                  <Select value={form.filter.lifecycle_stage || "__any"} onValueChange={(v) => setFilter({ lifecycle_stage: v === "__any" ? "" : v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__any">Any</SelectItem>
                      {LIFECYCLE_STAGES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={form.filter.status || "__any"} onValueChange={(v) => setFilter({ status: v === "__any" ? "" : v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__any">Any</SelectItem>
                      <SelectItem value="active">active</SelectItem>
                      <SelectItem value="opted_out">opted_out</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2"><Label>Search text</Label><Input value={form.filter.search} onChange={(e) => setFilter({ search: e.target.value })} placeholder="acme" /></div>
              </div>

              <div className="flex items-center justify-between rounded-md border bg-muted/30 px-3 py-2 text-sm">
                <span>Exclude opted-out</span>
                <Switch checked={!!form.filter.exclude_opted_out} onCheckedChange={(v) => setFilter({ exclude_opted_out: v })} />
              </div>

              <div className="rounded-md border bg-card/40 p-3 text-xs">
                <p className="font-medium">{previewCount} matching contacts</p>
                <p className="mt-1 text-muted-foreground">{describeFilter(form.filter)}</p>
              </div>

              <Button size="sm" type="submit">{editing ? "Update segment" : "Save segment"}</Button>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="space-y-3">
        {segments.map((s) => {
          const count = applyFilter(contacts, s.filter).length;
          return (
            <div key={s.id} className="flex items-center justify-between rounded-md border p-3">
              <div className="min-w-0">
                <p className="font-medium">{s.name} <span className="ml-2 text-xs text-muted-foreground">{count} contacts</span></p>
                <p className="truncate text-xs text-muted-foreground">{s.description || describeFilter(s.filter)}</p>
              </div>
              <div className="flex gap-1">
                <Button size="sm" variant="ghost" onClick={() => openEdit(s)}><Pencil className="h-4 w-4" /></Button>
                <Button size="sm" variant="ghost" onClick={() => remove(s)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
              </div>
            </div>
          );
        })}
        {!segments.length && <div className="py-10 text-center text-muted-foreground">No segments yet. Save a filter to reuse it in Campaigns.</div>}
      </CardContent>
    </Card>
  );
}