"use client";

import { useState } from "react";
import { Plus, Image as ImageIcon, FileText, Music, Video, Sticker } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/lib/supabase";
import { formatDate } from "../_lib/validators";
import { useV2Data } from "../layout";

export default function MediaPage() {
  const data = useV2Data();
  const [form, setForm] = useState({ filename: "", media_type: "image", mime_type: "image/jpeg", source_url: "" });

  const save = async () => {
    const { error } = await supabase.from("wa_media_assets").insert({
      ...form,
      phone_number_id: data.defaultNumber?.id || null,
    });
    if (error) return toast.error(error.message);
    toast.success("Media asset saved");
    setForm({ filename: "", media_type: "image", mime_type: "image/jpeg", source_url: "" });
    data.media.refetch();
  };

  const getIcon = (type) => {
    switch (type) {
      case "image": return <ImageIcon className="h-4 w-4" />;
      case "document": return <FileText className="h-4 w-4" />;
      case "audio": return <Music className="h-4 w-4" />;
      case "video": return <Video className="h-4 w-4" />;
      case "sticker": return <Sticker className="h-4 w-4" />;
      default: return <ImageIcon className="h-4 w-4" />;
    }
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
      <Card className="rounded-md border-border/60 bg-card shadow-sm h-fit">
        <CardHeader>
          <CardTitle>Register media</CardTitle>
          <p className="text-xs text-muted-foreground">Add externally hosted media for use in templates.</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Filename</Label>
            <Input value={form.filename} onChange={(e) => setForm({ ...form, filename: e.target.value })} placeholder="hero-image.jpg" />
          </div>
          <div className="space-y-2">
            <Label>Type</Label>
            <Select value={form.media_type} onValueChange={(v) => setForm({ ...form, media_type: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {["image", "document", "audio", "video", "sticker"].map((v) => (
                  <SelectItem key={v} value={v}>{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>MIME type</Label>
            <Input value={form.mime_type} onChange={(e) => setForm({ ...form, mime_type: e.target.value })} placeholder="image/jpeg" />
          </div>
          <div className="space-y-2">
            <Label>Media URL</Label>
            <Input value={form.source_url} onChange={(e) => setForm({ ...form, source_url: e.target.value })} placeholder="https://..." />
          </div>
          <Button size="sm" className="w-full" onClick={save} disabled={!form.filename || !form.mime_type}>
            <Plus className="mr-2 h-4 w-4" /> Save media
          </Button>
        </CardContent>
      </Card>

      <Card className="rounded-md border-border/60 bg-card shadow-sm">
        <CardHeader>
          <CardTitle>Media library</CardTitle>
          <p className="text-xs text-muted-foreground">Assets registered for this account.</p>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-2">
            {(data.media.data || []).map((m) => (
              <div key={m.id} className="grid items-center gap-4 rounded-md border border-border/60 p-3 md:grid-cols-[1.5fr_1fr_1fr_1fr] hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded bg-primary/10 text-primary">
                    {getIcon(m.media_type)}
                  </div>
                  <p className="font-medium text-sm truncate">{m.filename}</p>
                </div>
                <p className="capitalize text-xs text-muted-foreground">{m.media_type}</p>
                <p className="text-xs text-muted-foreground">{m.mime_type}</p>
                <p className="text-xs text-muted-foreground text-right">{formatDate(m.created_at)}</p>
              </div>
            ))}
            {!(data.media.data || []).length && (
              <div className="py-12 text-center text-sm text-muted-foreground border border-dashed border-border/60 rounded-md">
                No media assets saved.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
