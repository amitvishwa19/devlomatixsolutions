'use server'

import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { ensureWorkspaceAccess } from "@/lib/auth-utils";
import { db } from "@/lib/db";

const GetMessagesSchema = z.object({
    workspaceId: z.string(),
    limit: z.number().optional().default(20),
});

const handler = async (data) => {
    const { workspaceId, limit } = data;

    try {
        const session = await ensureWorkspaceAccess(workspaceId);
        const userId = session.user.userId || session.user.id;

        const messages = await db.whatsAppMessage.findMany({
            where: { userId },
            orderBy: { timestamp: 'desc' },
            take: limit
        });

        // Convert BigInt timestamp to String for serialization
        const serialized = messages.map(m => ({
            ...m,
            timestamp: m.timestamp.toString()
        }));

        return { success: true, messages: serialized };
    } catch (error) {
        return { error: error.message || "Failed to fetch message history" };
    }
};

export const getMessages = createSafeAction(GetMessagesSchema, handler);
