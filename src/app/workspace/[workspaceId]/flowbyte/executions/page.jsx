'use client'

import React, { useState, useEffect, useCallback } from "react";
import { CheckCircle2, XCircle, Clock, ArrowRight, Loader2, Filter, RefreshCw, ChevronDown, ChevronRight, ArrowLeft, Copy, FileText, Activity, GitBranch, Trash2 } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useParams } from "next/navigation";
import { getExecutions } from "../_actions/get-executions";

const StatusIcon = ({ status }) => {
  if (status === "running") return <Loader2 className="h-4 w-4 text-primary animate-spin" />;
  if (status === "success" || status === "success") return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
  return <XCircle className="h-4 w-4 text-destructive" />;
};

const NodeStatusIcon = ({ status }) => {
  if (status === "success") return <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />;
  if (status === "error") return <XCircle className="h-3.5 w-3.5 text-destructive" />;
  if (status === "running") return <Loader2 className="h-3.5 w-3.5 text-primary animate-spin" />;
  return <Clock className="h-3.5 w-3.5 text-muted-foreground" />;
};

function JsonBlock({ data, label }) {
  const [copied, setCopied] = useState(false);
  const json = JSON.stringify(data, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(json);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
    toast.success("Copied to clipboard");
  };

  return (
    <div className="flex-1 min-w-0">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{label}</span>
        <button onClick={handleCopy} className="text-[10px] text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors">
          <Copy className="h-3 w-3" />
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
      <pre className="text-xs bg-muted/20 border border-border rounded-md p-3 overflow-auto max-h-48 font-mono text-foreground whitespace-pre-wrap break-all">
        {json}
      </pre>
    </div>
  );
}

function NodeExecutionRow({ node, index }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border border-border rounded-md overflow-hidden bg-card">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-muted/30 transition-colors text-left"
      >
        <span className="text-[10px] text-muted-foreground font-mono w-5 shrink-0">{index + 1}</span>
        <NodeStatusIcon status={node.status} />
        <span className="text-sm font-medium text-foreground flex-1 truncate">{node.nodeName || node.name}</span>
        <Badge variant="outline" className="text-[10px] h-5">{node.type}</Badge>
        <span className="text-[10px] text-muted-foreground font-mono">{node.duration}ms</span>
        {expanded ? <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" /> : <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />}
      </button>

      {expanded && (
        <div className="border-t border-border bg-muted/5 p-3 space-y-3">
          <div className="flex gap-4 text-[10px] uppercase tracking-wider text-muted-foreground font-bold">
            <span>Duration: <span className="text-foreground">{node.duration}ms</span></span>
            <span>Status: <span className={node.status === "success" ? "text-emerald-500" : "text-destructive"}>{node.status}</span></span>
          </div>

          {node.error && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-md p-3">
              <span className="text-xs font-bold text-destructive uppercase tracking-tight">Error Detail</span>
              <p className="text-xs text-destructive mt-1 font-mono">{node.error}</p>
            </div>
          )}

          <div className="flex flex-col md:flex-row gap-3">
            <JsonBlock data={node.input || {}} label="Input" />
            <JsonBlock data={node.output || {}} label="Output" />
          </div>
        </div>
      )}
    </div>
  );
}

function ExecutionDetail({ execution, onBack }) {
  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-2">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" className="h-9 w-9 p-0 rounded-full" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-foreground">Execution <span className="text-muted-foreground text-sm font-mono">#{String(execution.id).slice(0, 8)}</span></h1>
            <Badge className={execution.status === "success" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-destructive/10 text-destructive border-destructive/20"}>
              {execution.status}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">{execution.workflow}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Mode", value: "Manual", icon: Activity },
          { label: "Started", value: new Date(execution.startedAt).toLocaleString(), icon: Clock },
          { label: "Duration", value: execution.duration, icon: Activity },
          { label: "Nodes", value: `${execution.executedNodes} / ${execution.nodes}`, icon: GitBranch },
        ].map((item) => (
          <div key={item.label} className="bg-card border border-border rounded-xl p-4 flex flex-col justify-between">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{item.label}</span>
            <span className="text-sm font-semibold text-foreground mt-1">{item.value}</span>
          </div>
        ))}
      </div>

      <Tabs defaultValue="nodes" className="w-full">
        <TabsList className="bg-muted/50 p-1 mb-4 h-11">
          <TabsTrigger value="nodes" className="gap-2 h-9 px-4">
            <FileText className="h-4 w-4" /> Node Timeline
          </TabsTrigger>
          <TabsTrigger value="raw" className="gap-2 h-9 px-4">
            <Activity className="h-4 w-4" /> Raw Logs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="nodes" className="space-y-3">
          {execution.nodeExecutions.map((node, i) => (
            <NodeExecutionRow key={i} node={node} index={i} />
          ))}
          {execution.nodeExecutions.length === 0 && (
            <div className="text-center py-20 border-2 border-dashed rounded-xl border-border text-muted-foreground text-sm">
              No node execution data available for this run.
            </div>
          )}
        </TabsContent>
        <TabsContent value="raw">
          <div className="bg-black/90 rounded-xl p-4 font-mono text-[11px] text-emerald-400 overflow-auto max-h-[600px] leading-relaxed">
            {execution.nodeExecutions.map((node, i) => (
              <div key={i} className="mb-2">
                <div className="text-white/40 mb-0.5 border-b border-white/5 pb-0.5 inline-block">NODE: {node.nodeName} ({node.status})</div>
                <div className="pl-4">
                  <div className="text-emerald-500/60">INPUT: {JSON.stringify(node.input, null, 2)}</div>
                  <div className="text-emerald-400">OUTPUT: {JSON.stringify(node.output, null, 2)}</div>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function ExecutionsPage() {
  const { workspaceId } = useParams();
  const [filter, setFilter] = useState("all");
  const [selectedExecution, setSelectedExecution] = useState(null);
  const [executions, setExecutions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchExecutions = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getExecutions({ workspaceId });
      setExecutions(data || []);
    } catch (err) {
      toast.error("Failed to fetch executions history");
    } finally {
      setLoading(false);
    }
  }, [workspaceId]);

  useEffect(() => { fetchExecutions(); }, [fetchExecutions]);

  const filtered = filter === "all" ? executions : executions.filter((e) => e.status === filter);

  if (selectedExecution) {
    return <ExecutionDetail execution={selectedExecution} onBack={() => setSelectedExecution(null)} />;
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Workflow Executions</h1>
          <p className="text-sm text-muted-foreground mt-1">History of all workflow runs in this workspace</p>
        </div>
        <Button variant="outline" size="sm" className="gap-2 h-9 font-medium" onClick={fetchExecutions}>
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <div className="flex items-center gap-1.5 p-1 bg-muted/30 rounded-lg w-fit">
        {(["all", "success", "error", "running"]).map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all ${
              filter === s ? "bg-white dark:bg-zinc-800 shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <span className="capitalize">{s}</span>
          </button>
        ))}
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-border bg-muted/20">
                <th className="py-3.5 px-4 font-bold text-muted-foreground uppercase text-[10px] tracking-widest w-12 text-center">Status</th>
                <th className="py-3.5 px-4 font-bold text-muted-foreground uppercase text-[10px] tracking-widest">Execution</th>
                <th className="py-3.5 px-4 font-bold text-muted-foreground uppercase text-[10px] tracking-widest hidden md:table-cell">Mode</th>
                <th className="py-3.5 px-4 font-bold text-muted-foreground uppercase text-[10px] tracking-widest">Started</th>
                <th className="py-3.5 px-4 font-bold text-muted-foreground uppercase text-[10px] tracking-widest text-right">Duration</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr><td colSpan={5} className="py-20 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" /></td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={5} className="py-20 text-center text-muted-foreground text-sm italic">No executions found for this filter.</td></tr>
              ) : (
                filtered.map((exec) => (
                  <tr
                    key={exec.id}
                    onClick={() => setSelectedExecution(exec)}
                    className="hover:bg-muted/30 transition-colors cursor-pointer"
                  >
                    <td className="py-4 px-4"><div className="flex justify-center"><StatusIcon status={exec.status} /></div></td>
                    <td className="py-4 px-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-foreground">{exec.workflow}</span>
                        <span className="text-[10px] font-mono text-muted-foreground">ID: {String(exec.id).slice(0, 8)}...</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 hidden md:table-cell">
                      <Badge variant="secondary" className="text-[10px] font-bold uppercase tracking-tight h-5">MANUAL</Badge>
                    </td>
                    <td className="py-4 px-4 text-xs text-muted-foreground font-medium">
                      {new Date(exec.startedAt).toLocaleString()}
                    </td>
                    <td className="py-4 px-4 text-right text-xs font-mono font-medium text-foreground">
                      {exec.duration}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
