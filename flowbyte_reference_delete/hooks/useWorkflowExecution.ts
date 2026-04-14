import { useCallback, useState } from "react";
import type { Node } from "@xyflow/react";
import { executionStore } from "@/flowbite/lib/executionStore";
import { supabase } from "@/integrations/supabase/client";
import { persistExecution } from "@/flowbite/lib/persistExecution";

type SetNodes = React.Dispatch<React.SetStateAction<Node[]>>;

export type NodeExecutionResult = {
  nodeId: string;
  nodeType: string;
  label: string;
  status: "success" | "error";
  input: Record<string, unknown>;
  output: Record<string, unknown>;
  error?: string;
  duration: number;
  startTime: string;
};

export function useWorkflowExecution(nodes: Node[], setNodes: SetNodes, edges: { source: string; target: string }[], workflowId?: string, workflowName?: string) {
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionResults, setExecutionResults] = useState<Map<string, NodeExecutionResult>>(new Map());

  const execute = useCallback(async (chatInput?: string) => {
    if (isExecuting) return;
    setIsExecuting(true);
    setExecutionResults(new Map());

    // Reset all nodes to idle
    setNodes((nds) => nds.map((n) => ({ ...n, data: { ...n.data, status: "idle" } })));

    // Build topo order for UI updates
    const adj = new Map<string, string[]>();
    const inDeg = new Map<string, number>();
    nodes.forEach((n) => { adj.set(n.id, []); inDeg.set(n.id, 0); });
    edges.forEach((e) => {
      adj.get(e.source)?.push(e.target);
      inDeg.set(e.target, (inDeg.get(e.target) || 0) + 1);
    });
    const queue: string[] = [];
    inDeg.forEach((deg, id) => { if (deg === 0) queue.push(id); });
    const order: string[] = [];
    while (queue.length) {
      const id = queue.shift()!;
      order.push(id);
      adj.get(id)?.forEach((t) => {
        const d = (inDeg.get(t) || 1) - 1;
        inDeg.set(t, d);
        if (d === 0) queue.push(t);
      });
    }

    // Set all to running
    setNodes((nds) => nds.map((n) => order.includes(n.id) ? { ...n, data: { ...n.data, status: "running" } } : n));

    // Start execution in store
    const wfName = workflowName || "My Workflow";
    const startedAt = new Date().toISOString();
    const nodeNames = order.map((id) => {
      const node = nodes.find((n) => n.id === id);
      return { name: (node?.data as any)?.label || "Unknown", type: (node?.data as any)?.type || "trigger" };
    });
    const execId = executionStore.startExecution(wfName, order.length, nodeNames);
    nodeNames.forEach((n) => executionStore.nodeRunning(execId, n.name));

    try {
      // Prepare nodes payload with config data
      const nodesPayload = nodes.map((n) => ({
        id: n.id,
        type: n.type,
        data: {
          label: (n.data as any).label,
          type: (n.data as any).type,
          config: (n.data as any).config || {},
        },
      }));

      const { data, error } = await supabase.functions.invoke("execute-workflow", {
        body: { nodes: nodesPayload, edges, chatInput },
      });

      if (error) throw error;

      const results = (data.results || []) as NodeExecutionResult[];
      const resultsMap = new Map<string, NodeExecutionResult>();

      results.forEach((r) => {
        resultsMap.set(r.nodeId, r);
        setNodes((nds) =>
          nds.map((n) => n.id === r.nodeId ? { ...n, data: { ...n.data, status: r.status } } : n)
        );
        executionStore.nodeCompleted(execId, r.label, {
          status: r.status,
          duration: `${r.duration}ms`,
          input: r.input,
          output: r.output,
          error: r.error,
        });
      });

      // Mark unprocessed nodes as skipped
      order.forEach((id) => {
        if (!resultsMap.has(id)) {
          setNodes((nds) => nds.map((n) => n.id === id ? { ...n, data: { ...n.data, status: "idle" } } : n));
        }
      });

      setExecutionResults(resultsMap);
      const hasError = results.some((r) => r.status === "error");
      const finalStatus = hasError ? "error" : "success";
      const errorMsg = hasError ? results.find((r) => r.error)?.error : undefined;
      executionStore.finishExecution(execId, finalStatus, errorMsg);

      // Persist to database
      const finishedAt = new Date().toISOString();
      const durationMs = new Date(finishedAt).getTime() - new Date(startedAt).getTime();
      persistExecution({
        workflowId,
        workflowName: wfName,
        status: finalStatus,
        startedAt,
        finishedAt,
        duration: durationMs > 1000 ? `${(durationMs / 1000).toFixed(1)}s` : `${durationMs}ms`,
        mode: "manual",
        errorMessage: errorMsg,
        nodeExecutions: results.map((r) => ({
          name: r.label,
          type: r.nodeType,
          status: r.status,
          startTime: r.startTime,
          duration: `${r.duration}ms`,
          input: r.input,
          output: r.output,
          error: r.error,
        })),
      });
    } catch (err: any) {
      setNodes((nds) => nds.map((n) => ({ ...n, data: { ...n.data, status: "error" } })));
      executionStore.finishExecution(execId, "error", err.message || "Execution failed");

      // Persist error execution
      persistExecution({
        workflowId,
        workflowName: wfName,
        status: "error",
        startedAt,
        finishedAt: new Date().toISOString(),
        duration: `${Date.now() - new Date(startedAt).getTime()}ms`,
        mode: "manual",
        errorMessage: err.message || "Execution failed",
        nodeExecutions: [],
      });
    } finally {
      setIsExecuting(false);
    }
  }, [nodes, edges, setNodes, isExecuting]);

  const clearResults = useCallback(() => setExecutionResults(new Map()), []);

  return { execute, isExecuting, executionResults, clearResults };
}
