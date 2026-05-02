'use server'

import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { db } from "@/lib/db";
import { ensureWorkspaceAccess } from "@/lib/auth-utils";

const GetBotDetailsSchema = z.object({
    workspaceId: z.string(),
    id: z.string(),
});

const handler = async (data) => {
    const { workspaceId, id } = data;

    try {
        const session = await ensureWorkspaceAccess(workspaceId);
        const userId = session.user.userId || session.user.id;

        const bot = await db.botFlow.findUnique({
            where: { id, userId },
            include: {
                steps: {
                    orderBy: { order: 'asc' }
                }
            }
        });

        if (!bot) return { error: "Bot flow not found" };

        return { success: true, bot };
    } catch (error) {
        return { error: error.message || "Failed to fetch bot details" };
    }
};

export const getBotDetails = createSafeAction(GetBotDetailsSchema, handler);
