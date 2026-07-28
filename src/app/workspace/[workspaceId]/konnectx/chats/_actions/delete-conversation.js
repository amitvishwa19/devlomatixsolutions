'use server'

import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { db } from "@/lib/db";
import { ensureWorkspaceAccess } from "@/lib/auth-utils";
import { revalidatePath } from "next/cache";

const DeleteConversationSchema = z.object({
    workspaceId: z.string(),
    jid: z.string(),
});

const handler = async (data) => {
    const { workspaceId, jid } = data;

    try {
        const session = await ensureWorkspaceAccess(workspaceId);
        const userId = session.user.userId || session.user.id;

        const cleanPhone = jid.replace(/\D/g, '').split('@')[0];
        const last10 = cleanPhone.length >= 10 ? cleanPhone.slice(-10) : cleanPhone;

        // Delete all messages associated with this JID (or 10-digit number) for this user
        await db.whatsAppMessage.deleteMany({
            where: {
                userId,
                jid: {
                    contains: last10
                }
            }
        });

        revalidatePath(`/workspace/${workspaceId}/wa-cloud-api/chats`);

        return { 
            data: {
                success: true,
                message: "Conversation deleted successfully"
            } 
        };
    } catch (error) {
        console.error("[DeleteConversation Error]", error);
        return { error: error.message || "Failed to delete conversation" };
    }
};

export const deleteConversation = createSafeAction(DeleteConversationSchema, handler);
