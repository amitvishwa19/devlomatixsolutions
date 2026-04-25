import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AppLayout } from "@/flowgenix/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { ScrollText, Loader2, Play } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  getWorkflow,
  listRunLogs,
  listWorkflows,
  type WorkflowRow,
  type WorkflowRunLogRow,
  type WorkflowRunRow,
} from "@/flowgenix/lib/workflow-storage";
import { executeWorkflow } from "@/flowgenix/lib/workflow-runtime";

const RunHistory = () => {
  const [workflows, setWorkflows] = useState<WorkflowRow[]>([]);
  const [runs, setRuns] = useState<(WorkflowRunRow & { workflow_name?: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [wfFilter, setWfFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [from, setFrom] = useState<string>("");
  const [to, setTo] = useState<string>("");

  const [openRunId, setOpenRunId] = useState<string | null>(null);
  const [logs, setLogs] = useState<WorkflowRunLogRow[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [rerunningId, setRerunningId] = useState<string | null>(null);

  const refreshRuns = async () => {
    const { data } = await supabase
      .from("workflow_runs")
      .select("*")
      .order("started_at", { ascending: false })
      .limit(500);
    const byId = new Map(workflows.map((w) => [w.id, w.name]));
    setRuns(
      ((data ?? []) as unknown as WorkflowRunRow[]).map((r) => ({
        ...r,
        workflow_name: byId.get(r.workflow_id),
      })),
    );
  };

  const handleRunNow = async (run: WorkflowRunRow) => {
    setRerunningId(run.id);
    try {
      const wf = await getWorkflow(run.workflow_id);
      if (!wf) throw new Error("Workflow not found");
      const cleanNodes = (wf.nodes ?? []).filter((n) => n.id !== "__viewport__");
      const input = (run.input ?? undefined) as ({ prompt?: string } & Record<string, unknown>) | undefined;
      const result = await executeWorkflow({
        workflowId: wf.id,
        nodes: cleanNodes,
        edges: wf.edges ?? [],
        trigger: "rerun",
        input,
      });
      if (result.status === "error") toast.error(result.error ?? "Re-run failed");
      else toast.success("Re-run complete");
      await refreshRuns();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Re-run failed");
    } finally {
      setRerunningId(null);
    }
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [wfs, allTpl] = await Promise.all([
          listWorkflows({ templates: false }),
          listWorkflows({ templates: true }),
        ]);
        setWorkflows([...wfs, ...allTpl]);
        const { data, error } = await supabase
          .from("workflow_runs")
          .select("*")
          .order("started_at", { ascending: false })
          .limit(500);
        if (error) throw error;
        const byId = new Map([...wfs, ...allTpl].map((w) => [w.id, w.name]));
        setRuns(
          ((data ?? []) as unknown as WorkflowRunRow[]).map((r) => ({
            ...r,
            workflow_name: byId.get(r.workflow_id),
          })),
        );
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    return runs.filter((r) => {
      if (wfFilter !== "all" && r.workflow_id !== wfFilter) return false;
      if (statusFilter !== "all" && r.status !== statusFilter) return false;
      if (from && new Date(r.started_at) < new Date(from)) return false;
      if (to && new Date(r.started_at) > new Date(to + "T23:59:59")) return false;
      return true;
    });
  }, [runs, wfFilter, statusFilter, from, to]);

  useEffect(() => {
    if (!openRunId) {
      setLogs([]);
      return;
    }
    setLogsLoading(true);
    listRunLogs(openRunId)
      .then(setLogs)
      .finally(() => setLogsLoading(false));
  }, [openRunId]);

  const statusBadge = (s: string) => {
    const variant: Record<string, string> = {
      success: "bg-[hsl(142_76%_36%)]/15 text-[hsl(142_76%_36%)] border-[hsl(142_76%_36%)]/30",
      error: "bg-destructive/15 text-destructive border-destructive/30",
      running: "bg-primary/15 text-primary border-primary/30",
    };
    return (
      <Badge variant="outline" className={`font-mono text-[10px] uppercase ${variant[s] ?? ""}`}>
        {s}
      </Badge>
    );
  };

  return (
    <AppLayout>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="font-mono text-sm">run history</h1>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
          <div className="space-y-1">
            <Label className="font-mono text-[10px] uppercase text-muted-foreground">Workflow</Label>
            <Select value={wfFilter} onValueChange={setWfFilter}>
              <SelectTrigger className="h-9 font-mono text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="font-mono text-xs">All</SelectItem>
                {workflows.map((w) => (
                  <SelectItem key={w.id} value={w.id} className="font-mono text-xs">{w.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="font-mono text-[10px] uppercase text-muted-foreground">Status</Label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-9 font-mono text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                {["all", "success", "error", "running"].map((s) => (
                  <SelectItem key={s} value={s} className="font-mono text-xs">{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="font-mono text-[10px] uppercase text-muted-foreground">From</Label>
            <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="h-9 font-mono text-xs" />
          </div>
          <div className="space-y-1">
            <Label className="font-mono text-[10px] uppercase text-muted-foreground">To</Label>
            <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="h-9 font-mono text-xs" />
          </div>
        </div>

        {loading ? (
          <div className="flex h-40 items-center justify-center">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="overflow-hidden rounded-md border border-border">
            <table className="w-full">
              <thead className="bg-secondary/30">
                <tr className="text-left">
                  <th className="px-3 py-2 font-mono text-[10px] uppercase text-muted-foreground">Workflow</th>
                  <th className="px-3 py-2 font-mono text-[10px] uppercase text-muted-foreground">Status</th>
                  <th className="px-3 py-2 font-mono text-[10px] uppercase text-muted-foreground">Trigger</th>
                  <th className="px-3 py-2 font-mono text-[10px] uppercase text-muted-foreground">Started</th>
                  <th className="px-3 py-2 font-mono text-[10px] uppercase text-muted-foreground">Duration</th>
                  <th className="px-3 py-2"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-3 py-8 text-center font-mono text-xs text-muted-foreground">
                      // no runs match filters
                    </td>
                  </tr>
                ) : (
                  filtered.map((r) => {
                    const dur =
                      r.finished_at
                        ? `${Math.max(0, new Date(r.finished_at).getTime() - new Date(r.started_at).getTime())}ms`
                        : "—";
                    return (
                      <tr key={r.id} className="border-t border-border hover:bg-secondary/20">
                        <td className="px-3 py-2 font-mono text-xs">
                          <Link to={`/canvas/${r.workflow_id}`} className="hover:text-primary">
                            {r.workflow_name ?? r.workflow_id.slice(0, 8)}
                          </Link>
                        </td>
                        <td className="px-3 py-2">{statusBadge(r.status)}</td>
                        <td className="px-3 py-2 font-mono text-xs text-muted-foreground">{r.trigger}</td>
                        <td className="px-3 py-2 font-mono text-[10px] text-muted-foreground">
                          {new Date(r.started_at).toLocaleString()}
                        </td>
                        <td className="px-3 py-2 font-mono text-[10px] text-muted-foreground">{dur}</td>
                        <td className="px-3 py-2 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleRunNow(r)}
                              disabled={rerunningId === r.id}
                              className="gap-1.5 font-mono text-xs"
                              title="Re-execute with the same input"
                            >
                              {rerunningId === r.id ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <Play className="h-3.5 w-3.5" />
                              )}
                              Run now
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setOpenRunId(r.id)}
                              className="gap-1.5 font-mono text-xs"
                            >
                              <ScrollText className="h-3.5 w-3.5" /> Logs
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Sheet open={!!openRunId} onOpenChange={(o) => !o && setOpenRunId(null)}>
        <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-xl">
          <SheetHeader>
            <SheetTitle className="font-mono text-sm">Run logs</SheetTitle>
          </SheetHeader>
          <div className="mt-4 space-y-2">
            {logsLoading ? (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            ) : logs.length === 0 ? (
              <p className="font-mono text-xs text-muted-foreground">// no log entries</p>
            ) : (
              logs.map((l) => (
                <div key={l.id} className="rounded-md border border-border bg-card p-2">
                  <div className="flex items-center justify-between">
                    <p className="font-mono text-xs">
                      <span className="text-muted-foreground">{l.node_kind ?? "node"}</span> · {l.node_label ?? l.node_id}
                    </p>
                    <span
                      className={`font-mono text-[10px] uppercase ${
                        l.status === "error" ? "text-destructive" : l.status === "success" ? "text-[hsl(142_76%_36%)]" : "text-muted-foreground"
                      }`}
                    >
                      {l.status}
                    </span>
                  </div>
                  {l.message && <p className="mt-1 font-mono text-[10px] text-muted-foreground">{l.message}</p>}
                  {l.data != null && (
                    <pre className="mt-1 max-h-40 overflow-auto rounded bg-secondary/40 p-1.5 font-mono text-[10px]">
                      {JSON.stringify(l.data, null, 2)}
                    </pre>
                  )}
                  <p className="mt-1 font-mono text-[9px] text-muted-foreground">
                    {new Date(l.created_at).toLocaleTimeString()} · {l.duration_ms ?? "—"}ms
                  </p>
                </div>
              ))
            )}
          </div>
        </SheetContent>
      </Sheet>
    </AppLayout>
  );
};

export default RunHistory;
