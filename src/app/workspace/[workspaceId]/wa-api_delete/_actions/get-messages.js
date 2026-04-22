'use server'

import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { db } from "@/lib/db";
import { ensureWorkspaceAccess } from "@/lib/auth-utils";

const GetMessagesSchema = z.object({
    workspaceId: z.string(),
    jid: z.string(),
});

const handler = async (data) => {
    const { workspaceId, jid } = data;

    try {
        const session = await ensureWorkspaceAccess(workspaceId);
        const userId = session.user.userId || session.user.id;

        const messages = await db.whatsAppMessage.findMany({
            where: {
                userId,
                jid: jid
            },
            orderBy: {
                timestamp: 'desc'
            },
            take: 50 // Recent history
        });

        // Convert BigInt to Number for JSON serialization
        const serializedMessages = messages.map(m => ({
            ...m,
            timestamp: Number(m.timestamp)
        }));

        return { data: { messages: serializedMessages } };
    } catch (error) {
        console.error("[WA Action] Get Messages Error:", error);
        return { error: error.message || "Failed to fetch messages" };
    }
};

export const getMessages = createSafeAction(GetMessagesSchema, handler);
