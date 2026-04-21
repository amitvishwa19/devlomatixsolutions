'use server'

import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { db } from "@/lib/db";
import { ensureWorkspaceAccess } from "@/lib/auth-utils";

const GetBotsSchema = z.object({
    workspaceId: z.string(),
});

const handler = async (data) => {
    const { workspaceId } = data;

    try {
        const session = await ensureWorkspaceAccess(workspaceId);
        const userId = session.user.userId || session.user.id;

        const bots = await db.botFlow.findMany({
            where: { userId },
            include: {
                steps: true
            },
            orderBy: { updatedAt: 'desc' }
        });

        return {
            data: {
                success: true,
                bots: JSON.parse(JSON.stringify(bots))
            }
        };
    } catch (error) {
        return { error: error.message || "Failed to fetch bot flows" };
    }
};

export const getBots = createSafeAction(GetBotsSchema, handler);
