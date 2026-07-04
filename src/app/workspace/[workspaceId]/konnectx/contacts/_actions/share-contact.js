'use server'

import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { db } from "@/lib/db";
import { ensureWorkspaceAccess } from "@/lib/auth-utils";

const ShareContactSchema = z.object({
    workspaceId: z.string(),
    contactId: z.string(),
    email: z.string().email(),
});

const handler = async (data) => {
    const { workspaceId, contactId, email } = data;

    try {
        const session = await ensureWorkspaceAccess(workspaceId);
        const userId = session.user.userId || session.user.id;

        const contact = await db.contact.findUnique({
            where: { id: contactId },
            select: { id: true, userId: true }
        });

        if (!contact || contact.userId !== userId) {
            return { error: "Contact not found or unauthorized" };
        }

        const targetUser = await db.user.findUnique({ where: { email } });
        if (!targetUser) {
            return { error: "No user found with that email" };
        }

        if (targetUser.id === userId) {
            return { error: "Cannot share contact with yourself" };
        }

        const existing = await db.contactShare.findUnique({
            where: {
                contactId_sharedWithUserId: {
                    contactId,
                    sharedWithUserId: targetUser.id
                }
            }
        });

        if (existing) {
            return { error: "Contact already shared with this user" };
        }

        await db.contactShare.create({
            data: {
                contactId,
                sharedWithUserId: targetUser.id
            }
        });

        console.log('[ShareContact] targetUser:', JSON.stringify({ id: targetUser.id, displayName: targetUser.displayName, email: targetUser.email }));
        return { data: { success: true, sharedWith: { id: targetUser.id, displayName: targetUser.displayName, email: targetUser.email } } };
    } catch (error) {
        console.error("[ShareContact] Error:", error);
        return { error: error.message || "Failed to share contact" };
    }
};

export const shareContact = createSafeAction(ShareContactSchema, handler);
