import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowDown, ArrowUp, RefreshCw, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { formatDate } from "../lib/validators";
import { toast } from "sonner";

const STATUS_TONE = {
  sent: "secondary",
  delivered: "secondary",
  read: "default",
  failed: "destructive",
  received: "outline",
  queued: "outline",
};

export function Messages({ data }) {
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
      toast.error(e.message || "Failed to load messages");
    } finally {
      setLoading(false);
    }
  }, [direction, status]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const channel = supabase
      .channel("wa-messages-unified")
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
    <Card className="rounded-md border-border/60">
      <CardHeader className="flex flex-col gap-3 border-b lg:flex-row lg:items-center lg:justify-between">
        <div>
          <CardTitle>Messages</CardTitle>
          <p className="mt-1 text-xs text-muted-foreground">All sent and received messages with timestamps, contact, and delivery status.</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">{filtered.length} message{filtered.length === 1 ? "" : "s"}</Badge>
          <Button size="sm" variant="outline" onClick={load} disabled={loading}>
            <RefreshCw className={`mr-1.5 h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 p-4">
        <div className="grid gap-3 rounded-lg border border-border/60 bg-card/40 p-3 md:grid-cols-4">
          <div className="space-y-1.5 md:col-span-2">
            <Label className="text-[11px] uppercase tracking-wider text-muted-foreground"><Search className="mr-1 inline h-3 w-3" /> Search</Label>
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Phone, name, body or template…" className="h-9" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-[11px] uppercase tracking-wider text-muted-foreground">Direction</Label>
            <Select value={direction} onValueChange={setDirection}>
              <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="inbound">Inbound</SelectItem>
                <SelectItem value="outbound">Outbound</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-[11px] uppercase tracking-wider text-muted-foreground">Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
              <SelectContent>
                {["all", "queued", "sent", "delivered", "read", "failed", "received"].map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="overflow-hidden rounded-lg border border-border/60">
          <ScrollArea className="h-[60vh]">
            <table className="w-full min-w-[900px] text-sm">
              <thead className="sticky top-0 bg-card">
                <tr className="border-b border-border/60 text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                  <th className="py-2.5 pl-3 pr-3">When</th>
                  <th className="px-3">Dir</th>
                  <th className="px-3">Contact</th>
                  <th className="px-3">Account</th>
                  <th className="px-3">Type</th>
                  <th className="px-3">Status</th>
                  <th className="px-3">Preview</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr><td colSpan={7} className="py-8 text-center text-xs text-muted-foreground">Loading…</td></tr>
                )}
                {!loading && filtered.map((r) => {
                  const acc = accountById.get(r.phone_number_id);
                  const phone = phoneByConvId.get(r.conversation_id) || contactById.get(r.contact_id)?.phone_number || "—";
                  const name = contactById.get(r.contact_id)?.name;
                  const inbound = r.direction === "inbound";
                  return (
                    <tr key={r.id} className="border-b border-border/40 hover:bg-card/40">
                      <td className="py-2 pl-3 pr-3 text-xs text-muted-foreground">{formatDate(r.created_at)}</td>
                      <td className="px-3">
                        {inbound
                          ? <span className="inline-flex items-center gap-1 text-xs text-primary"><ArrowDown className="h-3 w-3" /> in</span>
                          : <span className="inline-flex items-center gap-1 text-xs text-success"><ArrowUp className="h-3 w-3" /> out</span>}
                      </td>
                      <td className="px-3 text-xs">
                        {name && <div className="font-medium">{name}</div>}
                        <div className="font-mono text-[11px] text-muted-foreground">{phone}</div>
                      </td>
                      <td className="px-3 text-xs text-muted-foreground">{acc?.display_name || "—"}</td>
                      <td className="px-3"><Badge variant="outline" className="text-[10px]">{r.message_type}</Badge></td>
                      <td className="px-3"><Badge variant={STATUS_TONE[r.status] || "outline"} className="text-[10px]">{r.status}</Badge></td>
                      <td className="px-3">
                        {r.template_name
                          ? <span className="font-mono text-xs">[tpl] {r.template_name}</span>
                          : <span className="line-clamp-1">{r.body || "—"}</span>}
                        {r.error_message && <div className="line-clamp-1 text-[10px] text-destructive">{r.error_message}</div>}
                      </td>
                    </tr>
                  );
                })}
                {!loading && !filtered.length && (
                  <tr><td colSpan={7} className="py-10 text-center text-xs text-muted-foreground">No messages match the filters.</td></tr>
                )}
              </tbody>
            </table>
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
}
