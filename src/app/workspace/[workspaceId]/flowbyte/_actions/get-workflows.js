'use server'
import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { db } from "@/lib/db";

const GetWorkflow = z.object({
    userId: z.string(),
    workspaceId: z.optional(z.string()),
});

const handler = async (data) => {
    const { userId, workspaceId } = data;
    try {
        const workflows = await db.workflow.findMany({
            where: {
                userId,
                // Optionally filter by workspaceId if your schema supports it
                // workspaceId, 
            },
            orderBy: {
                createdAt: "desc",
            },
        })
        return { data: workflows };
    } catch (error) {
        console.error(error)
        return {
            error: "Failed to fetch workflows"
        }
    }
}

export const getWorkflow = createSafeAction(GetWorkflow, handler);
