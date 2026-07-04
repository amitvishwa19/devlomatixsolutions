'use server'

import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { db } from "@/lib/db";
import { ensureWorkspaceAccess } from "@/lib/auth-utils";

const RemoveContactShareSchema = z.object({
    workspaceId: z.string(),
    contactId: z.string(),
    sharedWithUserId: z.string(),
});

const handler = async (data) => {
    const { workspaceId, contactId, sharedWithUserId } = data;

    try {
        const session = await ensureWorkspaceAccess(workspaceId);
        const userId = session.user.userId || session.user.id;

        const contact = await db.contact.findUnique({
            where: { id: contactId },
            select: { id: true, userId: true }
        });

        if (!contact) {
            return { error: "Contact not found" };
        }

        // Owner can remove any share; shared user can remove themselves
        if (contact.userId !== userId && sharedWithUserId !== userId) {
            return { error: "Unauthorized" };
        }

        await db.contactShare.deleteMany({
            where: {
                contactId,
                sharedWithUserId
            }
        });

        return { data: { success: true } };
    } catch (error) {
        console.error("[RemoveContactShare] Error:", error);
        return { error: error.message || "Failed to remove share" };
    }
};

export const removeContactShare = createSafeAction(RemoveContactShareSchema, handler);
