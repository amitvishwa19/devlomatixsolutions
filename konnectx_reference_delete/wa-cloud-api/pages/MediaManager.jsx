import { useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { formatDate } from "../lib/validators";

// === Local server-function alternatives (uncomment to switch from edge → local) ===
// import * as mediaFn from "../functions/media";
// =================================================================================


export function MediaManager({ data }) {
  const [form, setForm] = useState({ filename: "", media_type: "image", mime_type: "image/jpeg", source_url: "" });
  const save = async () => { const { error } = await supabase.from("wa_media_assets").insert({ ...form, phone_number_id: data.defaultNumber?.id || null }); if (error) return toast.error(error.message); toast.success("Media asset saved"); setForm({ filename: "", media_type: "image", mime_type: "image/jpeg", source_url: "" }); data.media.refetch(); };
  return <div className="grid gap-4 xl:grid-cols-[360px_1fr]"><Card className="rounded-lg"><CardHeader><CardTitle>Register media</CardTitle></CardHeader><CardContent className="space-y-4"><div className="space-y-2"><Label>Filename</Label><Input value={form.filename} onChange={(e) => setForm({ ...form, filename: e.target.value })} /></div><div className="space-y-2"><Label>Type</Label><Select value={form.media_type} onValueChange={(v) => setForm({ ...form, media_type: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{["image","document","audio","video","sticker"].map((v) => <SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent></Select></div><div className="space-y-2"><Label>MIME type</Label><Input value={form.mime_type} onChange={(e) => setForm({ ...form, mime_type: e.target.value })} /></div><div className="space-y-2"><Label>Media URL</Label><Input value={form.source_url} onChange={(e) => setForm({ ...form, source_url: e.target.value })} /></div><Button size="sm" onClick={save} disabled={!form.filename || !form.mime_type}><Plus className="mr-2 h-4 w-4" /> Save media</Button></CardContent></Card><Card className="rounded-lg"><CardHeader><CardTitle>Media library</CardTitle></CardHeader><CardContent className="space-y-3">{(data.media.data || []).map((m) => <div key={m.id} className="grid gap-2 rounded-md border p-3 md:grid-cols-4"><p className="font-medium">{m.filename}</p><p className="capitalize text-muted-foreground">{m.media_type}</p><p className="text-muted-foreground">{m.mime_type}</p><p className="text-muted-foreground">{formatDate(m.created_at)}</p></div>)}{!(data.media.data || []).length && <div className="py-10 text-center text-muted-foreground">No media assets saved.</div>}</CardContent></Card></div>;
}
