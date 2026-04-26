'use client'

import { useCallback, useState } from "react";
import { executionStore } from "../_lib/executionStore";
// import { persistExecution } from "../_lib/persistExecution"; // Optional for now
import { executeWorkflowAction } from "../_actions/workflows/actions";

export function useWorkflowExecution(nodes, setNodes, edges, workflowId, workflowName) {
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionResults, setExecutionResults] = useState(new Map());

  const execute = useCallback(async (chatInput) => {
    if (isExecuting) return;
    setIsExecuting(true);
    setExecutionResults(new Map());

    // Reset all nodes to idle
    setNodes((nds) => nds.map((n) => ({ ...n, data: { ...n.data, status: "idle" } })));

    // Build topo order for UI updates
    const adj = new Map();
    const inDeg = new Map();
    nodes.forEach((n) => { adj.set(n.id, []); inDeg.set(n.id, 0); });
    edges.forEach((e) => {
      adj.get(e.source)?.push(e.target);
      inDeg.set(e.target, (inDeg.get(e.target) || 0) + 1);
    });
    const queue = [];
    inDeg.forEach((deg, id) => { if (deg === 0) queue.push(id); });
    const order = [];
    while (queue.length) {
      const id = queue.shift();
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
      return { name: node?.data?.label || "Unknown", type: node?.data?.type || "trigger" };
    });
    const execId = executionStore.startExecution(wfName, order.length, nodeNames);
    nodeNames.forEach((n) => executionStore.nodeRunning(execId, n.name));

    try {
      // Prepare nodes payload with config data
      const nodesPayload = nodes.map((n) => ({
        id: n.id,
        type: n.type,
        data: {
          label: n.data.label,
          type: n.data.type,
          config: n.data.config || {},
        },
      }));

      const data = await executeWorkflowAction({
        workflowId,
        nodes: nodesPayload,
        edges,
        chatInput
      });

      if (data.error) throw new Error(data.error);

      const results = data.results || [];
      const resultsMap = new Map();

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

      // Optional: persist to database if needed in future
      // const finishedAt = new Date().toISOString();
      // const durationMs = new Date(finishedAt).getTime() - new Date(startedAt).getTime();
    } catch (err) {
      console.error("Workflow Execution Error:", err);
      setNodes((nds) => nds.map((n) => ({ ...n, data: { ...n.data, status: "error" } })));
      executionStore.finishExecution(execId, "error", err.message || "Execution failed");
    } finally {
      setIsExecuting(false);
    }
  }, [nodes, edges, setNodes, isExecuting, workflowId, workflowName]);

  const clearResults = useCallback(() => setExecutionResults(new Map()), []);

  return { execute, isExecuting, executionResults, clearResults };
}
