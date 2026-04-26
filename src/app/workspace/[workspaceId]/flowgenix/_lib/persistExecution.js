import { saveExecutionAction } from "../_actions/workflows/save-execution";

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
  const res = await saveExecutionAction({
    workflowId: workflowId === "new" ? undefined : workflowId,
    status: status || "SUCCESS",
    startedAt,
    finishedAt,
    logs: nodeExecutions,
    edges: [],
    nodes: [],
  });

  if (res.error) {
    console.error("Failed to persist execution:", res.error);
  }
}
