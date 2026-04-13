import { useState, useEffect, useSyncExternalStore } from "react";
import { CheckCircle2, XCircle, Clock, ArrowRight, Loader2, Filter, RefreshCw, ChevronDown, ChevronRight, ArrowLeft, Copy, FileText, Activity, GitBranch, Trash2 } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { executionStore, type LiveExecution } from "@/flowbite/lib/executionStore";
import { supabase } from "@/integrations/supabase/client";

type ExecutionStatus = "success" | "error" | "running";
type NodeStatus = "success" | "error" | "skipped" | "running" | "pending";

interface NodeExecution {
  name: string;
  type: string;
  status: NodeStatus;
  startTime: string;
  duration: string;
  input: Record<string, unknown>;
  output: Record<string, unknown>;
  error?: string;
}

interface Execution {
  id: string;
  workflow: string;
  status: ExecutionStatus;
  startedAt: string;
  finishedAt: string;
  duration: string;
  nodes: number;
  executedNodes: number;
  errorMessage?: string;
  mode: "manual" | "schedule" | "webhook";
  nodeExecutions: NodeExecution[];
}

const StatusIcon = ({ status }: { status: ExecutionStatus }) => {
  if (status === "running") return <Loader2 className="h-4 w-4 text-primary animate-spin" />;
  if (status === "success") return <CheckCircle2 className="h-4 w-4 text-n8n-success" />;
  return <XCircle className="h-4 w-4 text-destructive" />;
};

const NodeStatusIcon = ({ status }: { status: NodeStatus }) => {
  if (status === "success") return <CheckCircle2 className="h-3.5 w-3.5 text-n8n-success" />;
  if (status === "error") return <XCircle className="h-3.5 w-3.5 text-destructive" />;
  if (status === "running") return <Loader2 className="h-3.5 w-3.5 text-primary animate-spin" />;
  if (status === "pending") return <Clock className="h-3.5 w-3.5 text-muted-foreground/40" />;
  return <Clock className="h-3.5 w-3.5 text-muted-foreground" />;
};

const statusLabel: Record<ExecutionStatus, string> = { success: "Success", error: "Error", running: "Running" };
const statusColor: Record<ExecutionStatus, string> = {
  success: "bg-n8n-success/10 text-n8n-success border-n8n-success/20",
  error: "bg-destructive/10 text-destructive border-destructive/20",
  running: "bg-primary/10 text-primary border-primary/20",
};

const nodeStatusColor: Record<NodeStatus, string> = {
  success: "text-n8n-success",
  error: "text-destructive",
  running: "text-primary",
  pending: "text-muted-foreground/40",
  skipped: "text-muted-foreground",
};

function JsonBlock({ data, label }: { data: Record<string, unknown>; label: string }) {
  const [copied, setCopied] = useState(false);
  const json = JSON.stringify(data, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(json);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="flex-1 min-w-0">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</span>
        <button onClick={handleCopy} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors">
          <Copy className="h-3 w-3" />
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
      <pre className="text-xs bg-muted/50 border border-border rounded-md p-3 overflow-auto max-h-48 font-mono text-foreground whitespace-pre-wrap break-all">
        {json}
      </pre>
    </div>
  );
}

function NodeExecutionRow({ node, index }: { node: NodeExecution; index: number }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border border-border rounded-md overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-muted/30 transition-colors text-left"
      >
        <span className="text-xs text-muted-foreground font-mono w-5">{index + 1}</span>
        <NodeStatusIcon status={node.status} />
        <span className="text-sm font-medium text-foreground flex-1">{node.name}</span>
        <Badge variant="outline" className="text-xs">{node.type}</Badge>
        <span className="text-xs text-muted-foreground">{node.duration}</span>
        {expanded ? <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" /> : <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />}
      </button>

      {expanded && (
        <div className="border-t border-border bg-muted/10 p-3 space-y-3">
          {/* Timing info */}
          <div className="flex gap-4 text-xs">
            <span className="text-muted-foreground">Start: <span className="text-foreground font-mono">{node.startTime}</span></span>
            <span className="text-muted-foreground">Duration: <span className={`font-mono ${nodeStatusColor[node.status]}`}>{node.duration}</span></span>
            <span className="text-muted-foreground">Status: <span className={`font-medium ${nodeStatusColor[node.status]}`}>{node.status}</span></span>
          </div>

          {/* Error */}
          {node.error && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-md p-3">
              <span className="text-xs font-medium text-destructive">Error:</span>
              <p className="text-sm text-destructive mt-1">{node.error}</p>
            </div>
          )}

          {/* Input / Output */}
          {node.status !== "skipped" && (
            <div className="flex gap-3">
              <JsonBlock data={node.input} label="Input" />
              <JsonBlock data={node.output} label="Output" />
            </div>
          )}

          {node.status === "skipped" && (
            <p className="text-xs text-muted-foreground italic">This node was skipped due to a previous error.</p>
          )}
        </div>
      )}
    </div>
  );
}

function ExecutionTimeline({ nodes }: { nodes: NodeExecution[] }) {
  const maxDurationMs = Math.max(...nodes.map(n => parseFloat(n.duration) || 1));

  return (
    <div className="space-y-1">
      {/* Flow diagram */}
      <div className="bg-card border border-border rounded-lg p-6 mb-4">
        <h3 className="text-sm font-semibold text-foreground mb-4">Execution Flow</h3>
        <div className="flex items-center gap-0 overflow-x-auto pb-2">
          {nodes.map((node, i) => {
            const bgColor = node.status === "success" ? "bg-n8n-success" : node.status === "error" ? "bg-destructive" : "bg-muted-foreground/40";
            const borderColor = node.status === "success" ? "border-n8n-success/30" : node.status === "error" ? "border-destructive/30" : "border-muted-foreground/20";
            const textColor = node.status === "success" ? "text-n8n-success" : node.status === "error" ? "text-destructive" : "text-muted-foreground";
            return (
              <div key={i} className="flex items-center flex-shrink-0">
                <div className={`flex flex-col items-center gap-1.5 px-3 py-2 rounded-lg border ${borderColor} bg-card min-w-[100px]`}>
                  <div className={`w-8 h-8 rounded-full ${bgColor} flex items-center justify-center`}>
                    {node.status === "success" ? <CheckCircle2 className="h-4 w-4 text-primary-foreground" /> :
                     node.status === "error" ? <XCircle className="h-4 w-4 text-primary-foreground" /> :
                     <Clock className="h-4 w-4 text-primary-foreground" />}
                  </div>
                  <span className="text-xs font-medium text-foreground text-center truncate w-full">{node.name}</span>
                  <span className={`text-[10px] ${textColor} font-mono`}>{node.duration}</span>
                </div>
                {i < nodes.length - 1 && (
                  <div className="flex items-center mx-1">
                    <div className={`w-6 h-0.5 ${nodes[i + 1].status === "skipped" ? "bg-muted-foreground/20 border-t border-dashed border-muted-foreground/40 h-0" : bgColor}`} />
                    <ArrowRight className={`h-3 w-3 flex-shrink-0 ${nodes[i + 1].status === "skipped" ? "text-muted-foreground/40" : textColor}`} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Gantt-style timeline */}
      <div className="bg-card border border-border rounded-lg p-4">
        <h3 className="text-sm font-semibold text-foreground mb-3">Duration Timeline</h3>
        <div className="space-y-2">
          {nodes.map((node, i) => {
            const durationMs = parseFloat(node.duration) || 0;
            const barWidth = Math.max((durationMs / maxDurationMs) * 100, 2);
            const barColor = node.status === "success" ? "bg-n8n-success" : node.status === "error" ? "bg-destructive" : "bg-muted-foreground/30";

            return (
              <div key={i} className="flex items-center gap-3">
                <div className="w-32 flex-shrink-0 flex items-center gap-2">
                  <NodeStatusIcon status={node.status} />
                  <span className="text-xs font-medium text-foreground truncate">{node.name}</span>
                </div>
                <div className="flex-1 flex items-center gap-2">
                  <div className="flex-1 h-5 bg-muted/50 rounded overflow-hidden">
                    <div className={`h-full ${barColor} rounded transition-all flex items-center px-1.5`} style={{ width: `${barWidth}%` }}>
                      {barWidth > 15 && <span className="text-[9px] text-primary-foreground font-mono whitespace-nowrap">{node.duration}</span>}
                    </div>
                  </div>
                  {barWidth <= 15 && <span className="text-[10px] text-muted-foreground font-mono flex-shrink-0">{node.duration}</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function ExecutionLogs({ execution }: { execution: Execution }) {
  const logs = execution.nodeExecutions.flatMap((node, i) => {
    const entries: { time: string; level: "info" | "error" | "warn"; message: string }[] = [];
    entries.push({ time: node.startTime, level: "info", message: `[${node.name}] Started (${node.type})` });
    if (node.status === "success") {
      entries.push({ time: node.startTime, level: "info", message: `[${node.name}] Completed in ${node.duration}` });
    } else if (node.status === "error") {
      entries.push({ time: node.startTime, level: "error", message: `[${node.name}] Failed: ${node.error || "Unknown error"}` });
    } else if (node.status === "skipped") {
      entries.push({ time: node.startTime, level: "warn", message: `[${node.name}] Skipped` });
    }
    return entries;
  });

  const levelColors = { info: "text-n8n-success", error: "text-destructive", warn: "text-amber-500" };
  const levelBg = { info: "bg-n8n-success/10", error: "bg-destructive/10", warn: "bg-amber-500/10" };

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      <div className="bg-muted/50 px-4 py-2 border-b border-border flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Execution Log</span>
        <span className="text-xs text-muted-foreground">{logs.length} entries</span>
      </div>
      <div className="divide-y divide-border max-h-[500px] overflow-auto">
        {logs.map((log, i) => (
          <div key={i} className={`flex items-start gap-3 px-4 py-2 ${levelBg[log.level]} hover:bg-muted/20 transition-colors`}>
            <span className="text-[10px] text-muted-foreground font-mono flex-shrink-0 pt-0.5 w-24">{log.time}</span>
            <span className={`text-[10px] font-semibold uppercase w-10 flex-shrink-0 pt-0.5 ${levelColors[log.level]}`}>{log.level}</span>
            <span className="text-xs text-foreground font-mono">{log.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ExecutionDetail({ execution, onBack }: { execution: Execution; onBack: () => void }) {
  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-foreground">Execution #{String(execution.id).slice(0, 8)}</h1>
            <Badge className={`${statusColor[execution.status]} border`}>{statusLabel[execution.status]}</Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">{execution.workflow}</p>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        {[
          { label: "Status", value: statusLabel[execution.status] },
          { label: "Mode", value: execution.mode },
          { label: "Started", value: execution.startedAt },
          { label: "Finished", value: execution.finishedAt },
          { label: "Duration", value: execution.duration },
        ].map((item) => (
          <div key={item.label} className="bg-card border border-border rounded-lg p-3">
            <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{item.label}</div>
            <div className="text-sm font-medium text-foreground capitalize">{item.value}</div>
          </div>
        ))}
      </div>

      {/* Node progress */}
      <div className="bg-card border border-border rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-foreground">Node Progress</span>
          <span className="text-sm text-muted-foreground">{execution.executedNodes} / {execution.nodes} nodes</span>
        </div>
        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${execution.status === "error" ? "bg-destructive" : execution.status === "running" ? "bg-primary" : "bg-n8n-success"}`}
            style={{ width: `${(execution.executedNodes / execution.nodes) * 100}%` }}
          />
        </div>
      </div>

      {/* Error banner */}
      {execution.errorMessage && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 mb-6 flex items-start gap-3">
          <XCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-destructive">Execution Failed</p>
            <p className="text-sm text-destructive/80 mt-1">{execution.errorMessage}</p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <Tabs defaultValue="nodes" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="nodes" className="gap-1.5">
            <FileText className="h-3.5 w-3.5" />
            Node Data
          </TabsTrigger>
          <TabsTrigger value="logs" className="gap-1.5">
            <Activity className="h-3.5 w-3.5" />
            Logs
          </TabsTrigger>
          <TabsTrigger value="timeline" className="gap-1.5">
            <GitBranch className="h-3.5 w-3.5" />
            Timeline
          </TabsTrigger>
        </TabsList>

        <TabsContent value="nodes">
          <div className="space-y-2">
            <h2 className="text-sm font-semibold text-foreground mb-3">Node Executions ({execution.nodeExecutions.length})</h2>
            {execution.nodeExecutions.map((node, i) => (
              <NodeExecutionRow key={i} node={node} index={i} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="logs">
          <ExecutionLogs execution={execution} />
        </TabsContent>

        <TabsContent value="timeline">
          <ExecutionTimeline nodes={execution.nodeExecutions} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function Executions() {
  const [filter, setFilter] = useState<ExecutionStatus | "all">("all");
  const [selectedExecution, setSelectedExecution] = useState<Execution | null>(null);
  const [dbExecutions, setDbExecutions] = useState<Execution[]>([]);
  const [loading, setLoading] = useState(true);
  const liveExecutions = useSyncExternalStore(executionStore.subscribe, executionStore.getSnapshot);

  const fetchExecutions = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("executions")
      .select("*")
      .order("started_at", { ascending: false })
      .limit(100);

    if (!error && data) {
      setDbExecutions(
        data.map((row: any): Execution => {
          const nodeExecs = (row.node_executions || []) as NodeExecution[];
          return {
            id: row.id,
            workflow: row.workflow_name,
            status: row.status as ExecutionStatus,
            startedAt: row.started_at ? new Date(row.started_at).toLocaleString("sv-SE") : "—",
            finishedAt: row.finished_at ? new Date(row.finished_at).toLocaleString("sv-SE") : "—",
            duration: row.duration || "—",
            nodes: nodeExecs.length,
            executedNodes: nodeExecs.filter((n) => n.status === "success" || n.status === "error").length,
            errorMessage: row.error_message,
            mode: (row.mode || "manual") as "manual" | "schedule" | "webhook",
            nodeExecutions: nodeExecs,
          };
        })
      );
    }
    setLoading(false);
  };

  useEffect(() => { fetchExecutions(); }, []);

  // Real-time subscription for live updates
  useEffect(() => {
    const channel = supabase
      .channel('executions-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'executions' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const row = payload.new as any;
            const nodeExecs = (row.node_executions || []) as NodeExecution[];
            const newExec: Execution = {
              id: row.id,
              workflow: row.workflow_name,
              status: row.status as ExecutionStatus,
              startedAt: row.started_at ? new Date(row.started_at).toLocaleString("sv-SE") : "—",
              finishedAt: row.finished_at ? new Date(row.finished_at).toLocaleString("sv-SE") : "—",
              duration: row.duration || "—",
              nodes: nodeExecs.length,
              executedNodes: nodeExecs.filter((n: NodeExecution) => n.status === "success" || n.status === "error").length,
              errorMessage: row.error_message,
              mode: (row.mode || "manual") as "manual" | "schedule" | "webhook",
              nodeExecutions: nodeExecs,
            };
            setDbExecutions((prev) => [newExec, ...prev.filter((e) => e.id !== row.id)]);
          } else if (payload.eventType === 'UPDATE') {
            const row = payload.new as any;
            const nodeExecs = (row.node_executions || []) as NodeExecution[];
            setDbExecutions((prev) =>
              prev.map((e) =>
                e.id === row.id
                  ? {
                      ...e,
                      status: row.status as ExecutionStatus,
                      finishedAt: row.finished_at ? new Date(row.finished_at).toLocaleString("sv-SE") : "—",
                      duration: row.duration || "—",
                      errorMessage: row.error_message,
                      nodes: nodeExecs.length,
                      executedNodes: nodeExecs.filter((n: NodeExecution) => n.status === "success" || n.status === "error").length,
                      nodeExecutions: nodeExecs,
                    }
                  : e
              )
            );
          } else if (payload.eventType === 'DELETE') {
            const oldRow = payload.old as any;
            setDbExecutions((prev) => prev.filter((e) => e.id !== oldRow.id));
          }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("executions").delete().eq("id", id);
    if (!error) {
      setDbExecutions((prev) => prev.filter((e) => e.id !== id));
    }
  };

  // Merge live (in-memory running) executions with persisted ones
  const mergedExecutions: Execution[] = [
    ...liveExecutions
      .filter((le) => le.status === "running")
      .map((le): Execution => ({
        ...le,
        id: String(le.id),
        nodeExecutions: le.nodeExecutions.map((n) => ({
          ...n,
          status: n.status === "pending" ? "skipped" as const : n.status === "running" ? "success" as const : n.status,
        })),
      })),
    ...dbExecutions,
  ];

  const filtered = filter === "all" ? mergedExecutions : mergedExecutions.filter((e) => e.status === filter);

  const counts = {
    all: mergedExecutions.length,
    success: mergedExecutions.filter((e) => e.status === "success").length,
    error: mergedExecutions.filter((e) => e.status === "error").length,
    running: mergedExecutions.filter((e) => e.status === "running").length,
  };

  if (selectedExecution) {
    return <ExecutionDetail execution={selectedExecution} onBack={() => setSelectedExecution(null)} />;
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Executions</h1>
          <p className="text-sm text-muted-foreground mt-1">{filtered.length} executions</p>
        </div>
        <Button variant="outline" size="sm" className="gap-1.5" onClick={fetchExecutions}>
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh
        </Button>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-2 mb-4">
        <Filter className="h-4 w-4 text-muted-foreground" />
        {(["all", "success", "error", "running"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              filter === s ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            {s === "all" ? "All" : statusLabel[s]} ({counts[s]})
          </button>
        ))}
      </div>

      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider w-10">Status</th>
              <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">ID</th>
              <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Workflow</th>
              <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Mode</th>
              <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Started</th>
              <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Duration</th>
              <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Nodes</th>
              <th className="py-3 px-4 w-10 text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((exec) => (
              <tr
                key={exec.id}
                onClick={() => setSelectedExecution(exec)}
                className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors cursor-pointer"
              >
                <td className="py-3 px-4"><StatusIcon status={exec.status} /></td>
                <td className="py-3 px-4 text-muted-foreground font-mono text-xs">#{String(exec.id).slice(0, 8)}</td>
                <td className="py-3 px-4 font-medium text-foreground">{exec.workflow}</td>
                <td className="py-3 px-4">
                  <Badge variant="outline" className="text-xs capitalize">{exec.mode}</Badge>
                </td>
                <td className="py-3 px-4 text-muted-foreground flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" /> {exec.startedAt}
                </td>
                <td className="py-3 px-4 text-muted-foreground">{exec.duration}</td>
                <td className="py-3 px-4 text-muted-foreground">{exec.executedNodes} / {exec.nodes}</td>
                <td className="py-3 px-4">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(exec.id);
                    }}
                    className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                    title="Delete execution"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
