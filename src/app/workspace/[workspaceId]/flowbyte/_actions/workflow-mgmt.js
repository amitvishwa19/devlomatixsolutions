'use server'
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { revalidatePath } from "next/cache";

export async function saveWorkflowAction({ id, name, nodes, edges, workspaceId, viewport }) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.userId;

  if (!userId) {
    return { error: "Unauthorized" };
  }

  try {
    const payload = {
      name,
      nodes: nodes || [],
      edges: edges || [],
      viewport: viewport || null,
      userId,
      workspaceId,
      status: "DRAFT",
    };

    let workflow;
    if (id && id !== "new") {
      workflow = await db.workflow.update({
        where: { id, userId }, // Ensure user owns it
        data: payload,
      });
    } else {
      workflow = await db.workflow.create({
        data: payload,
      });
    }

    if (workspaceId) {
      revalidatePath(`/workspace/${workspaceId}/flowbyte`);
      revalidatePath(`/workspace/${workspaceId}/flowbyte/${workflow.id}`);
    }

    return { success: true, data: workflow };
  } catch (error) {
    console.error("[saveWorkflowAction] Error:", error);
    return { error: error.message || "Failed to save workflow" };
  }
}

export async function saveAsTemplateAction({ name, nodes, edges }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.userId) return { error: "Unauthorized" };
  
  // templates are workflows with a specific flag or just stored as separate nodes
  // For now, maintain current simulation but ensure auth
  return { success: true };
}

export async function updateScheduleAction({ workflowId, cron, enabled }) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.userId;
  if (!userId) return { error: "Unauthorized" };

  try {
    // Store schedule in definition JSON field
    const workflow = await db.workflow.findUnique({ where: { id: workflowId } });
    const definition = (workflow?.definition && typeof workflow.definition === 'object') 
      ? { ...workflow.definition } 
      : {};
    
    definition.schedule = { cron, enabled };

    await db.workflow.update({
      where: { id: workflowId, userId },
      data: { definition }
    });
    return { success: true };
  } catch (error) {
    console.error("[updateScheduleAction] Error:", error);
    return { error: error.message };
  }
}
