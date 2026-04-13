/**
 * A simple pub/sub store for sharing live execution data
 * between the workflow canvas and the executions page.
 */

export type LiveNodeExecution = {
  name: string;
  type: string;
  status: "success" | "error" | "running" | "pending" | "skipped";
  startTime: string;
  duration: string;
  input: Record<string, unknown>;
  output: Record<string, unknown>;
  error?: string;
};

export type LiveExecution = {
  id: number;
  workflow: string;
  status: "running" | "success" | "error";
  startedAt: string;
  finishedAt: string;
  duration: string;
  nodes: number;
  executedNodes: number;
  errorMessage?: string;
  mode: "manual" | "schedule" | "webhook";
  nodeExecutions: LiveNodeExecution[];
};

type Listener = () => void;

let liveExecutions: LiveExecution[] = [];
const listeners = new Set<Listener>();

function notify() {
  listeners.forEach((l) => l());
}

export const executionStore = {
  subscribe(listener: Listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  getSnapshot(): LiveExecution[] {
    return liveExecutions;
  },

  /** Start a new live execution */
  startExecution(workflow: string, totalNodes: number, nodeNames: { name: string; type: string }[]): number {
    const id = Date.now();
    const now = new Date();
    const exec: LiveExecution = {
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
  nodeRunning(executionId: number, nodeName: string) {
    liveExecutions = liveExecutions.map((e) => {
      if (e.id !== executionId) return e;
      return {
        ...e,
        nodeExecutions: e.nodeExecutions.map((n) =>
          n.name === nodeName ? { ...n, status: "running" as const, startTime: new Date().toISOString().split("T")[1].slice(0, 12) } : n
        ),
      };
    });
    notify();
  },

  /** Mark a node as completed */
  nodeCompleted(
    executionId: number,
    nodeName: string,
    result: { status: "success" | "error"; duration: string; input: Record<string, unknown>; output: Record<string, unknown>; error?: string }
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
  finishExecution(executionId: number, status: "success" | "error", errorMessage?: string) {
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
          n.status === "pending" ? { ...n, status: "skipped" as const } : n
        ),
      };
    });
    notify();
  },
};
