'use server'
import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { db } from "@/lib/db";

const DeleteWorkflow = z.object({
    workflowId: z.string(),
    userId: z.string(),
    workspaceId: z.optional(z.string()),
});

const handler = async (data) => {
    const { userId, workflowId } = data;
    try {
        const workflow = await db.workflow.delete({
            where: {
                id: workflowId,
                userId
            }
        })
        return { data: workflow };
    } catch (error) {
        console.error(error)
        return {
            error: "Failed to delete workflow"
        }
    }
}

export const deleteWorkflow = createSafeAction(DeleteWorkflow, handler);
