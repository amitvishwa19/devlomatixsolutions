'use server'

import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { db } from "@/lib/db";
import { ensureWorkspaceAccess } from "@/lib/auth-utils";

const AssignConversationSchema = z.object({
    workspaceId: z.string(),
    jid: z.string(),
    email: z.string().email(),
});

const handler = async (data) => {
    const { workspaceId, jid, email } = data;

    try {
        const session = await ensureWorkspaceAccess(workspaceId);
        const userId = session.user.userId || session.user.id;

        const targetUser = await db.user.findUnique({ where: { email } });
        if (!targetUser) return { error: "No user found with that email" };
        if (targetUser.id === userId) return { error: "Cannot assign conversation to yourself" };

        const existing = await db.conversationShare.findUnique({
            where: {
                jid_workspaceId_sharedWithUserId: {
                    jid,
                    workspaceId,
                    sharedWithUserId: targetUser.id
                }
            }
        });

        if (existing) return { error: "Conversation already assigned to this user" };

        await db.conversationShare.create({
            data: {
                jid,
                workspaceId,
                sharedWithUserId: targetUser.id,
                sharedByUserId: userId
            }
        });

        return {
            data: {
                success: true,
                user: { id: targetUser.id, displayName: targetUser.displayName, email: targetUser.email }
            }
        };
    } catch (error) {
        console.error("[AssignConversation] Error:", error);
        return { error: error.message || "Failed to assign conversation" };
    }
};

export const assignConversation = createSafeAction(AssignConversationSchema, handler);
