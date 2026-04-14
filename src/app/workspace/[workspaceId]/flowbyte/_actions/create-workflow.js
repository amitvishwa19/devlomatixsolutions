'use server'
import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { db } from "@/lib/db";
import { CreateFlowNode } from "../_lib/tasks/CreateFlowNode";
import { TASK_TYPE } from "../_utils/constants";

const CreateWorkflow = z.object({
    userId: z.string(),
    workspaceId: z.optional(z.string()),
    name: z.string(),
    description: z.string().optional(),
});

const handler = async (data) => {
    const { userId, workspaceId, name, description } = data;
    try {
        const initialFlow = { nodes: [], edges: [] }
        initialFlow.nodes.push(CreateFlowNode(TASK_TYPE.LAUNCH_BROWSER, { x: 0, y: 0 }))

        const workflow = await db.workflow.create({
            data: {
                userId,
                workspaceId,
                name,
                description,
                status: 'DRAFT',
                nodes: initialFlow.nodes,
                edges: initialFlow.edges,
                definition: initialFlow
            }
        })
        return { data: workflow };
    } catch (error) {
        console.error(error)
        return {
            error: "Failed to create workflow"
        }
    }
}

export const createWorkflow = createSafeAction(CreateWorkflow, handler);
