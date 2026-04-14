'use server'
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { db } from "@/lib/db";
import { WorkflowStatus } from "@prisma/client";

const SaveWorkflow = z.object({
    userId: z.string(),
    workspaceId: z.optional(z.string()),
    workflowId: z.string(),
    definition: z.string(),
});

const handler = async (data) => {
    const { userId, workspaceId, workflowId, definition } = data;
    try {
        const workflow = await db.workflow.findUnique({
            where: { id: workflowId }
        })

        if (!workflow) {
            throw new Error('Workflow not found')
        }

        if (workflow.status !== WorkflowStatus.DRAFT) {
            throw new Error('Workflow is not in draft mode')
        }

        const parsedDefinition = JSON.parse(definition)

        const updatedWorkflow = await db.workflow.update({
            where: {
                id: workflowId, 
                userId
            },
            data: {
                definition: parsedDefinition,
                nodes: parsedDefinition.nodes || [],
                edges: parsedDefinition.edges || [],
            }
        })

        revalidatePath(`/workspace/${workspaceId}/flowbyte/${workflowId}`)
        return { data: updatedWorkflow };
    } catch (error) {
        console.error(error)
        return {
            error: "Failed to save workflow"
        }
    }
}

export const saveWorkflow = createSafeAction(SaveWorkflow, handler);
