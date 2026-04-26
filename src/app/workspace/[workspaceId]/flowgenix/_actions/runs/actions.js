"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function listRuns(workspaceId, limit = 50) {
    try {
        return await db.workflowExecution.findMany({
            where: { 
                workflow: {
                    workspaceId
                }
            },
            include: {
                workflow: {
                    select: { name: true }
                }
            },
            orderBy: { startedAt: 'desc' },
            take: limit
        });
    } catch (error) {
        console.error("listRuns error:", error);
        return [];
    }
}

export async function listRunLogs(workspaceId, runId) {
    try {
        return await db.workflowRunLog.findMany({
            where: { 
                workspaceId,
                runId
            },
            orderBy: { createdAt: 'asc' }
        });
    } catch (error) {
        console.error("listRunLogs error:", error);
        return [];
    }
}
