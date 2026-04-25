import { useEffect, useMemo, useState } from "react";
import { Merge, AlertTriangle, UserRound, Loader2, Check } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { formatDate, normalizePhone } from "../lib/validators";

function buildGroups(contacts) {
  // Group by normalized phone
  const byPhone = new Map();
  for (const c of contacts) {
    const key = normalizePhone(c.phone_number);
    if (!key) continue;
    if (!byPhone.has(key)) byPhone.set(key, []);
    byPhone.get(key).push(c);
  }
  // Group by email if present
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
  // Prefer most-recently-active, then most metadata
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

export function DuplicateMerge({ data }) {
  const contacts = data.contacts.data || [];
  const groups = useMemo(() => buildGroups(contacts), [contacts]);
  const [selected, setSelected] = useState({}); // groupKey -> winnerId
  const [merging, setMerging] = useState(null);

  useEffect(() => {
    // Default winner = top scorer
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
      // Update winner
      const { error: upErr } = await supabase.from("wa_contacts").update(patch).eq("id", winner.id);
      if (upErr) throw upErr;
      // Re-point conversations and messages
      const loserIds = losers.map((l) => l.id);
      await supabase.from("wa_conversations").update({ contact_id: winner.id }).in("contact_id", loserIds);
      await supabase.from("wa_messages").update({ contact_id: winner.id }).in("contact_id", loserIds);
      // Delete losers
      await supabase.from("wa_contacts").delete().in("id", loserIds);
      toast.success(`Merged ${losers.length} contact${losers.length === 1 ? "" : "s"} into ${winner.name}`);
      data.contacts.refetch();
      data.conversations?.refetch?.();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setMerging(null);
    }
  };

  return (
    <Card className="rounded-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Merge className="h-5 w-5" /> Duplicate merge</CardTitle>
        <CardDescription>
          Found <span className="font-semibold text-foreground">{groups.length}</span> duplicate group{groups.length === 1 ? "" : "s"} across {contacts.length} contacts. Pick the record to keep — tags, custom fields and notes from the others will be merged in, and their conversations will be re-pointed.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!groups.length ? (
          <div className="flex flex-col items-center gap-2 py-12 text-sm text-muted-foreground">
            <Check className="h-6 w-6 text-success" /> No duplicates found.
          </div>
        ) : (
          <ScrollArea className="max-h-[60vh]">
            <div className="space-y-3">
              {groups.map((g) => (
                <div key={g.key} className="rounded-md border bg-card/50 p-3">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-[10px] uppercase">{g.kind} match</Badge>
                      <span className="font-mono text-xs text-muted-foreground">{g.value}</span>
                      <Badge variant="outline" className="text-[10px]">{g.rows.length} records</Badge>
                    </div>
                    <Button size="sm" disabled={merging === g.key} onClick={() => merge(g)}>
                      {merging === g.key ? <><Loader2 className="mr-1 h-3 w-3 animate-spin" /> Merging…</> : <><Merge className="mr-1 h-3 w-3" /> Merge {g.rows.length - 1} into selected</>}
                    </Button>
                  </div>
                  <div className="space-y-1">
                    {g.rows.map((r) => {
                      const isWinner = selected[g.key] === r.id;
                      return (
                        <label key={r.id} className={`flex items-center gap-3 rounded border p-2 transition-colors ${isWinner ? "border-primary bg-primary/5" : "border-border hover:bg-muted/30"}`}>
                          <input type="radio" name={g.key} checked={isWinner} onChange={() => setSelected((s) => ({ ...s, [g.key]: r.id }))} />
                          <UserRound className="h-4 w-4 text-muted-foreground" />
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium">{r.name || "(unnamed)"} {isWinner && <span className="ml-2 rounded bg-primary px-1.5 py-0.5 text-[10px] text-primary-foreground">Keep</span>}</p>
                            <p className="truncate text-[11px] text-muted-foreground">{r.phone_number} · {(r.tags || []).slice(0, 4).join(", ") || "no tags"} · last activity {formatDate(r.last_message_at)}</p>
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
