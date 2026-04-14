/**
 * A simple pub/sub store for sharing live execution data
 * between the workflow canvas and the executions page.
 */

let liveExecutions = [];
const listeners = new Set();

function notify() {
  listeners.forEach((l) => l());
}

export const executionStore = {
  subscribe(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  getSnapshot() {
    return liveExecutions;
  },

  /** Start a new live execution */
  startExecution(workflow, totalNodes, nodeNames) {
    const id = Date.now();
    const now = new Date();
    const exec = {
      id,
      workflow,
      status: "running",
      startedAt: now.toLocaleString("sv-SE").replace("T", " "),
      finishedAt: "—",
      duration: "—",
      nodes: totalNodes,
      executedNodes: 0,
      mode: "manual",
      nodeExecutions: nodeNames.map((n) => ({
        name: n.name,
        type: n.type,
        status: "pending",
        startTime: "—",
        duration: "—",
        input: {},
        output: {},
      })),
    };
    liveExecutions = [exec, ...liveExecutions];
    notify();
    return id;
  },

  /** Mark a node as running */
  nodeRunning(executionId, nodeName) {
    liveExecutions = liveExecutions.map((e) => {
      if (e.id !== executionId) return e;
      return {
        ...e,
        nodeExecutions: e.nodeExecutions.map((n) =>
          n.name === nodeName ? { ...n, status: "running", startTime: new Date().toISOString().split("T")[1].slice(0, 12) } : n
        ),
      };
    });
    notify();
  },

  /** Mark a node as completed */
  nodeCompleted(
    executionId,
    nodeName,
    result
  ) {
    liveExecutions = liveExecutions.map((e) => {
      if (e.id !== executionId) return e;
      const updatedNodes = e.nodeExecutions.map((n) =>
        n.name === nodeName ? { ...n, ...result } : n
      );
      const executedCount = updatedNodes.filter((n) => n.status === "success" || n.status === "error").length;
      return { ...e, nodeExecutions: updatedNodes, executedNodes: executedCount };
    });
    notify();
  },

  /** Mark remaining nodes as skipped and finish the execution */
  finishExecution(executionId, status, errorMessage) {
    const now = new Date();
    liveExecutions = liveExecutions.map((e) => {
      if (e.id !== executionId) return e;
      const startMs = new Date(e.startedAt.replace(" ", "T")).getTime();
      const durationMs = now.getTime() - startMs;
      const durationStr = durationMs > 1000 ? `${(durationMs / 1000).toFixed(1)}s` : `${durationMs}ms`;
      return {
        ...e,
        status,
        finishedAt: now.toLocaleString("sv-SE").replace("T", " "),
        duration: durationStr,
        errorMessage,
        nodeExecutions: e.nodeExecutions.map((n) =>
          n.status === "pending" ? { ...n, status: "skipped" } : n
        ),
      };
    });
    notify();
  },
};
