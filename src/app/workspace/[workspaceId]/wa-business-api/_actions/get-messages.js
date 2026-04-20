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
                jid
            },
            orderBy: {
                timestamp: 'asc'
            },
            take: 50 // Last 50 messages
        });

        // Serialize BigInt and other objects
        const serializedMessages = messages.map(m => ({
            id: m.id,
            jid: m.jid,
            text: m.text,
            fromMe: m.fromMe,
            timestamp: Number(m.timestamp),
            createdAt: m.createdAt.toISOString(),
            status: m.status
        }));

        return { data: { messages: serializedMessages } };
    } catch (error) {
        console.error("[WA Business Action] Get Messages Error:", error);
        return { error: error.message || "Failed to fetch messages" };
    }
};

export const getMessages = createSafeAction(GetMessagesSchema, handler);
