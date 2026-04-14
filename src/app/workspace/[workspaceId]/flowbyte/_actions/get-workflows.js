'use server'
import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

const GetWorkflow = z.object({
    workspaceId: z.optional(z.string()),
});

const handler = async (data) => {
    const { workspaceId } = data;
    
    const session = await getServerSession(authOptions);
    const userId = session?.user?.userId;

    if (!userId) {
        return { error: "Unauthorized" };
    }

    try {
        const workflows = await db.workflow.findMany({
            where: {
                userId,
                workspaceId: workspaceId || undefined,
            },
            orderBy: {
                createdAt: "desc",
            },
        })
        return { data: workflows };
    } catch (error) {
        console.error("[getWorkflow] Error:", error);
        return {
            error: "Failed to fetch workflows"
        }
    }
}

export const getWorkflow = createSafeAction(GetWorkflow, handler);
