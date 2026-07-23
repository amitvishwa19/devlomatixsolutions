import { useEffect, useMemo, useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Clock, Loader2, AlertCircle, CheckCircle2, XCircle } from "lucide-react";
import { CronBuilder, isValidCron } from "./CronBuilder";
import { supabase } from "@/lib/supabase";
import { updateWorkflow } from "../../_actions/workflows/actions";
import { listRuns } from "../../_actions/runs/actions";
import { toast } from "sonner";
import cronParser from "cron-parser";
import { useParams } from "next/navigation";

function nextRun(cron) {
  try {
    return cronParser.parseExpression(cron).next().toDate();
  } catch {
    return null;
  }
}

function formatRelative(d) {
  const diff = d.getTime() - Date.now();
  const abs = Math.abs(diff);
  const mins = Math.round(abs / 60000);
  if (mins < 1) return diff >= 0 ? "in <1m" : "<1m ago";
  if (mins < 60) return diff >= 0 ? `in ${mins}m` : `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return diff >= 0 ? `in ${hrs}h` : `${hrs}h ago`;
  const days = Math.round(hrs / 24);
  return diff >= 0 ? `in ${days}d` : `${days}d ago`;
}

export const SchedulePopover = ({ workflowId, initialEnabled, initialCron, onSaved }) => {
  const params = useParams();
  const workspaceId = params?.workspaceId;
  const [open, setOpen] = useState(false);
  const [enabled, setEnabled] = useState(initialEnabled);
  const [cron, setCron] = useState(initialCron ?? "0 * * * *");
  const [saving, setSaving] = useState(false);
  const [recentRuns, setRecentRuns] = useState([]);
  const [runsLoading, setRunsLoading] = useState(false);

  const valid = useMemo(() => isValidCron(cron), [cron]);
  const next = useMemo(() => (valid ? nextRun(cron) : null), [cron, valid]);
  const triggerNext = useMemo(
    () => (initialEnabled && initialCron ? nextRun(initialCron) : null),
    [initialEnabled, initialCron],
  );

  useEffect(() => {
    if (!open) return;
    setRunsLoading(true);
    listRuns(workspaceId) // Note: This lists all runs, ideally filtered by workflowId
      .then(setRecentRuns)
      .catch(() => setRecentRuns([]))
      .finally(() => setRunsLoading(false));
  }, [open, workspaceId, workflowId]);

  const apply = async () => {
    if (enabled && !valid) return;
    setSaving(true);
    try {
      await updateWorkflow(workspaceId, workflowId, { scheduleEnabled: enabled, scheduleCron: cron });

      const fnUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/flowgenix-scheduler`;
      const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      if (enabled) {
        const { error } = await supabase.rpc("schedule_workflow_cron", {
          _workflow_id: workflowId,
          _cron: cron,
          _fn_url: fnUrl,
          _anon_key: anonKey,
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.rpc("unschedule_workflow_cron", {
          _workflow_id: workflowId,
        });
        if (error) throw error;
      }
      onSaved(enabled, cron);
      toast.success(enabled ? "Schedule enabled" : "Schedule disabled");
      setOpen(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to schedule");
    } finally {
      setSaving(false);
    }
  };

  const statusIcon = (s) => {
    if (s === "success") return <CheckCircle2 className="h-3 w-3 text-[hsl(142_76%_36%)]" />;
    if (s === "error") return <XCircle className="h-3 w-3 text-destructive" />;
    return <Loader2 className="h-3 w-3 animate-spin text-primary" />;
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button size="sm" variant="outline" className="gap-1.5 font-mono text-xs">
          <Clock className="h-3.5 w-3.5" />
          {initialEnabled ? (
            <span className="flex items-center gap-1.5">
              Scheduled
              {triggerNext && (
                <span className="text-[10px] text-muted-foreground">· next {formatRelative(triggerNext)}</span>
              )}
            </span>
          ) : (
            "Schedule"
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[560px] p-4" align="end">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-mono text-xs">Schedule workflow</p>
              <p className="font-mono text-[10px] text-muted-foreground">Runs automatically via pg_cron.</p>
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="sched-en" className="font-mono text-xs">Enabled</Label>
              <Switch id="sched-en" checked={enabled} onCheckedChange={setEnabled} />
            </div>
          </div>

          <div className={enabled ? "" : "pointer-events-none opacity-50"}>
            <CronBuilder value={cron} onChange={setCron} />
          </div>

          <div
            className={`rounded-md border px-3 py-2 ${
              enabled && !valid
                ? "border-destructive/50 bg-destructive/10"
                : "border-border bg-secondary/30"
            }`}
          >
            <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Next run</p>
            <p className={`font-mono text-xs ${enabled && !valid ? "flex items-center gap-1 text-destructive" : ""}`}>
              {enabled && !valid && <AlertCircle className="h-3 w-3" />}
              {next
                ? `${next.toLocaleString()} (${formatRelative(next)})`
                : "// invalid cron expression"}
            </p>
          </div>

          <div className="rounded-md border border-border">
            <p className="border-b border-border bg-secondary/30 px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              Last 5 runs
            </p>
            <div className="max-h-44 overflow-auto">
              {runsLoading ? (
                <div className="flex h-12 items-center justify-center">
                  <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
                </div>
              ) : recentRuns.length === 0 ? (
                <p className="px-3 py-3 font-mono text-[10px] text-muted-foreground">// no runs yet</p>
              ) : (
                recentRuns.map((r) => {
                  const dur = r.finished_at
                    ? `${Math.max(0, new Date(r.finished_at).getTime() - new Date(r.started_at).getTime())}ms`
                    : "—";
                  return (
                    <div
                      key={r.id}
                      className="flex items-center justify-between border-b border-border px-3 py-1.5 last:border-b-0"
                    >
                      <div className="flex items-center gap-2">
                        {statusIcon(r.status)}
                        <span className="font-mono text-[10px] text-muted-foreground">
                          {new Date(r.started_at).toLocaleString()}
                        </span>
                        <span className="rounded bg-secondary px-1 py-px font-mono text-[9px] uppercase text-muted-foreground">
                          {r.trigger}
                        </span>
                      </div>
                      <span className="font-mono text-[10px] text-muted-foreground">{dur}</span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <Button size="sm" variant="ghost" onClick={() => setOpen(false)} className="font-mono text-xs">
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={apply}
              disabled={saving || (enabled && !valid)}
              className="gap-1.5 font-mono text-xs"
            >
              {saving && <Loader2 className="h-3 w-3 animate-spin" />}
              Apply
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
