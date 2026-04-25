"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowDown, ArrowUp, RefreshCw, Search, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/lib/supabase";
import { formatDate } from "../_lib/validators";
import { toast } from "sonner";
import { useV2Data } from "../layout";

const STATUS_TONE = {
  sent: "secondary",
  delivered: "secondary",
  read: "default",
  failed: "destructive",
  received: "outline",
  queued: "outline",
};

export default function StreamPage() {
  const data = useV2Data();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [direction, setDirection] = useState("all");
  const [status, setStatus] = useState("all");
  const [search, setSearch] = useState("");
  const accounts = data.phoneNumbers?.data || [];
  const contacts = data.contacts?.data || [];
  const conversations = data.conversations?.data || [];

  const accountById = useMemo(() => new Map(accounts.map((a) => [a.id, a])), [accounts]);
  const contactById = useMemo(() => new Map(contacts.map((c) => [c.id, c])), [contacts]);
  const phoneByConvId = useMemo(() => {
    const map = new Map();
    for (const c of conversations) map.set(c.id, c.external_contact_phone || c.wa_contacts?.phone_number || "—");
    return map;
  }, [conversations]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      let q = supabase
        .from("wa_messages")
        .select("id, conversation_id, contact_id, phone_number_id, direction, message_type, body, status, error_message, template_name, created_at, sent_at, delivered_at, read_at")
        .order("created_at", { ascending: false })
        .limit(500);
      if (direction !== "all") q = q.eq("direction", direction);
      if (status !== "all") q = q.eq("status", status);
      const { data: rowsData, error } = await q;
      if (error) throw error;
      setRows(rowsData || []);
    } catch (e) {
      toast.error(e.message || "Failed to load stream");
    } finally {
      setLoading(false);
    }
  }, [direction, status]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const channel = supabase
      .channel("wa-stream-v2")
      .on("postgres_changes", { event: "*", schema: "public", table: "wa_messages" }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [load]);

  const filtered = useMemo(() => {
    if (!search.trim()) return rows;
    const q = search.toLowerCase();
    return rows.filter((r) => {
      const phone = phoneByConvId.get(r.conversation_id) || contactById.get(r.contact_id)?.phone_number || "";
      const name = contactById.get(r.contact_id)?.name || "";
      return (
        phone.toLowerCase().includes(q) ||
        name.toLowerCase().includes(q) ||
        (r.body || "").toLowerCase().includes(q) ||
        (r.template_name || "").toLowerCase().includes(q)
      );
    });
  }, [rows, search, phoneByConvId, contactById]);

  return (
    <Card className="rounded-md border-border/60 bg-card shadow-sm h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between border-b border-border/60 py-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 p-2 rounded-full">
            <Activity className="w-5 h-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-lg font-bold">Live Stream</CardTitle>
            <p className="text-xs text-muted-foreground font-medium">Real-time interaction monitor.</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="text-[10px] font-bold h-5">{filtered.length} EVENTS</Badge>
          <Button size="sm" variant="ghost" onClick={load} disabled={loading} className="h-8 w-8 p-0">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 p-4 flex-1 flex flex-col min-h-0">
        <div className="grid gap-3 rounded-md border border-border/60 bg-muted/20 p-3 md:grid-cols-4 shrink-0">
          <div className="md:col-span-2">
            <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5 block">Search</Label>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Phone, name, content..." className="pl-9 h-9 bg-background" />
            </div>
          </div>
          <div>
            <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5 block">Direction</Label>
            <Select value={direction} onValueChange={setDirection}>
              <SelectTrigger className="h-9 bg-background"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="inbound">Inbound</SelectItem>
                <SelectItem value="outbound">Outbound</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5 block">Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="h-9 bg-background"><SelectValue /></SelectTrigger>
              <SelectContent>
                {["all", "queued", "sent", "delivered", "read", "failed", "received"].map((s) => (
                  <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="overflow-hidden rounded-md border border-border/60 flex-1 min-h-0">
          <ScrollArea className="h-full">
            <table className="w-full text-xs">
              <thead className="sticky top-0 bg-muted/90 backdrop-blur z-10">
                <tr className="border-b border-border/60 text-left font-bold uppercase tracking-tighter text-muted-foreground">
                  <th className="py-2.5 pl-4">Time</th>
                  <th>Dir</th>
                  <th>Contact</th>
                  <th>Account</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th className="pr-4">Preview</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {loading && !rows.length && (
                  <tr><td colSpan={7} className="py-20 text-center text-muted-foreground animate-pulse font-bold uppercase tracking-widest">Initialising Stream...</td></tr>
                )}
                {filtered.map((r) => {
                  const acc = accountById.get(r.phone_number_id);
                  const phone = phoneByConvId.get(r.conversation_id) || contactById.get(r.contact_id)?.phone_number || "—";
                  const name = contactById.get(r.contact_id)?.name;
                  const inbound = r.direction === "inbound";
                  return (
                    <tr key={r.id} className="hover:bg-muted/30 transition-colors">
                      <td className="py-3 pl-4 text-muted-foreground font-mono">{formatDate(r.created_at)}</td>
                      <td>
                        {inbound
                          ? <span className="inline-flex items-center gap-1 font-bold text-blue-500"><ArrowDown className="h-3 w-3" /> IN</span>
                          : <span className="inline-flex items-center gap-1 font-bold text-green-500"><ArrowUp className="h-3 w-3" /> OUT</span>}
                      </td>
                      <td>
                        <div className="font-bold">{name || "—"}</div>
                        <div className="font-mono text-[10px] text-muted-foreground">{phone}</div>
                      </td>
                      <td className="text-muted-foreground font-medium">{acc?.display_name || "—"}</td>
                      <td><Badge variant="outline" className="text-[9px] h-4 rounded-sm uppercase tracking-tighter font-bold">{r.message_type}</Badge></td>
                      <td><Badge variant={STATUS_TONE[r.status] || "outline"} className="text-[9px] h-4 rounded-sm uppercase tracking-tighter font-bold">{r.status}</Badge></td>
                      <td className="pr-4 max-w-xs">
                        <div className="truncate font-medium">
                          {r.template_name ? <span className="text-primary font-mono">[TPL] {r.template_name}</span> : r.body}
                        </div>
                        {r.error_message && <div className="truncate text-[9px] text-destructive font-bold">{r.error_message}</div>}
                      </td>
                    </tr>
                  );
                })}
                {!loading && !filtered.length && (
                  <tr><td colSpan={7} className="py-20 text-center text-muted-foreground font-bold uppercase tracking-widest">No activity found</td></tr>
                )}
              </tbody>
            </table>
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
}
