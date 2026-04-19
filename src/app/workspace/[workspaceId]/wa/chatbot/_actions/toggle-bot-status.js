'use server'

import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { db } from "@/lib/db";
import { ensureWorkspaceAccess } from "@/lib/auth-utils";

const ToggleBotStatusSchema = z.object({
    workspaceId: z.string(),
    id: z.string(),
    active: z.boolean(),
});

const handler = async (data) => {
    const { workspaceId, id, active } = data;

    try {
        const session = await ensureWorkspaceAccess(workspaceId);
        const userId = session.user.userId || session.user.id;

        const updated = await db.botFlow.update({
            where: { id, userId },
            data: { active }
        });

        return { success: true, bot: updated };
    } catch (error) {
        return { error: error.message || "Failed to toggle bot status" };
    }
};

export const toggleBotStatus = createSafeAction(ToggleBotStatusSchema, handler);
