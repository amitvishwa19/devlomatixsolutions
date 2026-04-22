'use server'

import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { db } from "@/lib/db";
import { ensureWorkspaceAccess } from "@/lib/auth-utils";

const GetConversationsSchema = z.object({
    workspaceId: z.string(),
});

const handler = async (data) => {
    const { workspaceId } = data;

    try {
        const session = await ensureWorkspaceAccess(workspaceId);
        const userId = session.user.userId || session.user.id;

        // Fetch the unique JIDs that this user has interacted with
        const uniqueConversations = await db.whatsAppMessage.groupBy({
            by: ['jid'],
            where: { userId },
            _max: {
                timestamp: true
            }
        });

        // For each JID, fetch the most recent message text
        const conversations = await Promise.all(
            uniqueConversations.map(async (conv) => {
                const lastMsg = await db.whatsAppMessage.findFirst({
                    where: {
                        userId,
                        jid: conv.jid,
                        timestamp: conv._max.timestamp
                    },
                    orderBy: { createdAt: 'desc' }
                });

                return {
                    jid: conv.jid,
                    name: conv.jid.split('@')[0], // Fallback if contact info missing
                    lastMessage: lastMsg?.text || '',
                    fromMe: lastMsg?.fromMe || false,
                    timestamp: Number(conv._max.timestamp),
                    messages: [] // We'll fetch these on selection
                };
            })
        );

        // Sort by timestamp descending
        conversations.sort((a, b) => b.timestamp - a.timestamp);

        return { data: { conversations } };
    } catch (error) {
        console.error("[WA Action] Get Conversations Error:", error);
        return { error: error.message || "Failed to fetch conversations" };
    }
};

export const getConversations = createSafeAction(GetConversationsSchema, handler);
