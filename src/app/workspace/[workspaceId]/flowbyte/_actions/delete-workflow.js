'use server'
import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

const DeleteWorkflow = z.object({
    workflowId: z.string(),
    workspaceId: z.optional(z.string()),
});

const handler = async (data) => {
    const { workflowId, workspaceId } = data;
    
    const session = await getServerSession(authOptions);
    const userId = session?.user?.userId;

    if (!userId) {
        return { error: "Unauthorized" };
    }

    try {
        const workflow = await db.workflow.delete({
            where: {
                id: workflowId,
                userId
            }
        })
        return { data: workflow };
    } catch (error) {
        console.error("[deleteWorkflow] Error:", error);
        return {
            error: "Failed to delete workflow"
        }
    }
}

export const deleteWorkflow = createSafeAction(DeleteWorkflow, handler);
