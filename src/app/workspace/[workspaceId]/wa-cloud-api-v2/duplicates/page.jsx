"use client";

import { useEffect, useMemo, useState } from "react";
import { Merge, UserRound, Loader2, Check } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/lib/supabase";
import { formatDate, normalizePhone } from "../_lib/validators";
import { useV2Data } from "../layout";

function buildGroups(contacts) {
  const byPhone = new Map();
  for (const c of contacts) {
    const key = normalizePhone(c.phone_number);
    if (!key) continue;
    if (!byPhone.has(key)) byPhone.set(key, []);
    byPhone.get(key).push(c);
  }
  const byEmail = new Map();
  for (const c of contacts) {
    const email = String(c.custom_fields?.email || "").trim().toLowerCase();
    if (!email) continue;
    if (!byEmail.has(email)) byEmail.set(email, []);
    byEmail.get(email).push(c);
  }
  const groups = [];
  for (const [key, rows] of byPhone) if (rows.length > 1) groups.push({ key: `phone:${key}`, kind: "phone", value: key, rows });
  for (const [key, rows] of byEmail) if (rows.length > 1) groups.push({ key: `email:${key}`, kind: "email", value: key, rows });
  return groups;
}

function pickWinner(rows) {
  return [...rows].sort((a, b) => {
    const ta = a.last_message_at ? new Date(a.last_message_at).getTime() : 0;
    const tb = b.last_message_at ? new Date(b.last_message_at).getTime() : 0;
    if (tb !== ta) return tb - ta;
    return Object.keys(b.custom_fields || {}).length - Object.keys(a.custom_fields || {}).length;
  })[0];
}

function mergeRecord(winner, losers) {
  const tags = new Set([...(winner.tags || []), ...losers.flatMap((l) => l.tags || [])]);
  const customFields = { ...(winner.custom_fields || {}) };
  for (const l of losers) {
    for (const [k, v] of Object.entries(l.custom_fields || {})) {
      if (!customFields[k]) customFields[k] = v;
    }
  }
  const notes = [winner.notes, ...losers.map((l) => l.notes)].filter(Boolean).join("\n---\n").slice(0, 4000);
  return {
    tags: Array.from(tags),
    custom_fields: customFields,
    notes: notes || null,
    name: winner.name || losers.find((l) => l.name)?.name,
    lifecycle_stage: winner.lifecycle_stage || losers.find((l) => l.lifecycle_stage)?.lifecycle_stage,
  };
}

export default function DuplicateMergePage() {
  const data = useV2Data();
  const contacts = data.contacts.data || [];
  const groups = useMemo(() => buildGroups(contacts), [contacts]);
  const [selected, setSelected] = useState({});
  const [merging, setMerging] = useState(null);

  useEffect(() => {
    const next = {};
    for (const g of groups) next[g.key] = pickWinner(g.rows).id;
    setSelected(next);
  }, [groups.length]);

  const merge = async (group) => {
    const winnerId = selected[group.key];
    const winner = group.rows.find((r) => r.id === winnerId);
    const losers = group.rows.filter((r) => r.id !== winnerId);
    if (!winner || !losers.length) return;
    setMerging(group.key);
    try {
      const patch = mergeRecord(winner, losers);
      const { error: upErr } = await supabase.from("wa_contacts").update(patch).eq("id", winner.id);
      if (upErr) throw upErr;
      const loserIds = losers.map((l) => l.id);
      await supabase.from("wa_conversations").update({ contact_id: winner.id }).in("contact_id", loserIds);
      await supabase.from("wa_messages").update({ contact_id: winner.id }).in("contact_id", loserIds);
      await supabase.from("wa_contacts").delete().in("id", loserIds);
      toast.success(`Merged ${losers.length} contacts`);
      data.contacts.refetch();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setMerging(null);
    }
  };

  return (
    <Card className="rounded-md border-border/60 bg-card shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-bold"><Merge className="h-5 w-5" /> Duplicate merge</CardTitle>
        <CardDescription>
          Identify and combine duplicate contact records.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!groups.length ? (
          <div className="flex flex-col items-center gap-2 py-20 text-sm text-muted-foreground">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500/10 text-green-500">
              <Check className="h-6 w-6" />
            </div>
            <p className="font-bold uppercase tracking-tight">No duplicates found</p>
          </div>
        ) : (
          <ScrollArea className="max-h-[70vh]">
            <div className="space-y-4 pr-4">
              {groups.map((g) => (
                <div key={g.key} className="rounded-md border border-border/60 bg-muted/20 p-4">
                  <div className="mb-4 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-wider">{g.kind} match</Badge>
                      <span className="font-mono text-xs text-muted-foreground">{g.value}</span>
                    </div>
                    <Button size="sm" disabled={merging === g.key} onClick={() => merge(g)} className="h-8 text-xs font-bold uppercase tracking-tight">
                      {merging === g.key ? <><Loader2 className="mr-2 h-3 w-3 animate-spin" /> Merging</> : <><Merge className="mr-2 h-3 w-3" /> Merge others</>}
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {g.rows.map((r) => {
                      const isWinner = selected[g.key] === r.id;
                      return (
                        <label key={r.id} className={`flex items-center gap-4 rounded-md border p-3 cursor-pointer transition-all ${isWinner ? "border-primary bg-primary/5 ring-1 ring-primary/20" : "border-border/60 hover:bg-muted/50"}`}>
                          <input type="radio" name={g.key} checked={isWinner} onChange={() => setSelected((s) => ({ ...s, [g.key]: r.id }))} className="accent-primary" />
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted/50">
                            <UserRound className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <p className="truncate text-sm font-bold">{r.name || "(unnamed)"}</p>
                              {isWinner && <Badge className="text-[9px] h-4 rounded-sm uppercase tracking-tighter">Primary</Badge>}
                            </div>
                            <p className="truncate text-[10px] text-muted-foreground font-medium uppercase tracking-tight">
                              {r.phone_number} · {(r.tags || []).slice(0, 3).join(", ") || "no tags"} · active {formatDate(r.last_message_at)}
                            </p>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
