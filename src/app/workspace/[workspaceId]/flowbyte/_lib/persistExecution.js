import { saveExecutionAction } from "../_actions/save-execution";

export async function persistExecution({
  workflowId,
  workflowName,
  status,
  startedAt,
  finishedAt,
  duration,
  mode,
  errorMessage,
  nodeExecutions,
}) {
  // Use server action to persist to Prisma
  const res = await saveExecutionAction({
    workflowId: workflowId === "new" ? undefined : workflowId,
    status: status || "SUCCESS",
    startedAt,
    finishedAt,
    logs: nodeExecutions, // Maps to 'logs' in Prisma schema based on get-executions.js
    edges: [], // We could persist current edges here if needed
    nodes: [], // We could persist current nodes here if needed
  });

  if (res.error) {
    console.error("Failed to persist execution:", res.error);
  }
}
