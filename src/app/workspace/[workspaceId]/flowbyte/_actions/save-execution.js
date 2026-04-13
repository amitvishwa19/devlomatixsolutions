'use server'
import { db } from "@/lib/db"
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

export async function saveExecutionAction({
  workflowId,
  status,
  startedAt,
  finishedAt,
  logs,
  edges,
  nodes
}) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.userId;

  if (!userId) {
    return { error: "Unauthorized" }
  }

  // Only set workflowId if it's a valid ID (cuid or uuid) and owned by the user
  const workflow = (workflowId && workflowId !== "new") ? await db.workflow.findUnique({
    where: { id: workflowId, userId }
  }) : null;

  try {
    const execution = await db.workflowExecution.create({
      data: {
        workflowId: workflow ? workflowId : undefined,
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
    console.error("[saveExecutionAction] Error:", error)
    return { error: error.message }
  }
}
