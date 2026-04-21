'use server'

import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { db } from "@/lib/db";
import { ensureWorkspaceAccess } from "@/lib/auth-utils";

const GetActivitiesSchema = z.object({
    workspaceId: z.string(),
    limit: z.number().optional().default(20),
});

const handler = async (data) => {
    const { workspaceId, limit } = data;

    try {
        await ensureWorkspaceAccess(workspaceId);
        
        const activities = await db.systemLog.findMany({
            where: {
                workspaceId,
                provider: 'wa-business-api'
            },
            orderBy: {
                createdAt: 'desc'
            },
            take: limit
        });

        return {
            data: activities
        };
    } catch (error) {
        console.error("[WA Activity Action Error]", error);
        return { error: error.message || "Failed to fetch activities" };
    }
};

export const getActivities = createSafeAction(GetActivitiesSchema, handler);
