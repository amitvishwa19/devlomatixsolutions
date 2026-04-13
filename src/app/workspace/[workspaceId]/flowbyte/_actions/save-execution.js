'use server'
import { db } from "@/lib/db"
import { getSession } from "@/lib/auth"

export async function saveExecutionAction({
  workflowId,
  status,
  startedAt,
  finishedAt,
  logs,
  edges,
  nodes,
  userId: userIdArg
}) {
  let userId = userIdArg;
  if (!userId) {
    const session = await getSession()
    userId = session?.data?.id
  }
  
  if (!userId) {
    return { error: "Unauthorized" }
  }

  // Only set workflowId if it's a valid ID (cuid or uuid)
  // Our schema uses cuid() for Workflow.id
  const workflow = workflowId ? await db.workflow.findUnique({
    where: { id: workflowId }
  }) : null;

  try {
    const execution = await db.workflowExecution.create({
      data: {
        workflowId: workflow ? workflowId : undefined, // Must exist in DB if provided
        status: status.toUpperCase(),
        startedAt: new Date(startedAt),
        finishedAt: finishedAt ? new Date(finishedAt) : null,
        logs: logs || [],
        edges: edges || [],
        nodes: nodes || [],
      }
    })
    return { success: true, id: execution.id }
  } catch (error) {
    console.error("Failed to save execution:", error)
    return { error: error.message }
  }
}
