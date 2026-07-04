'use server'

import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { db } from "@/lib/db";
import { ensureWorkspaceAccess } from "@/lib/auth-utils";

const ShareContactsByFilterSchema = z.object({
    workspaceId: z.string(),
    filterType: z.enum(['category', 'tag']),
    filterValue: z.string(),
    email: z.string().email(),
});

const handler = async (data) => {
    const { workspaceId, filterType, filterValue, email } = data;

    try {
        const session = await ensureWorkspaceAccess(workspaceId);
        const userId = session.user.userId || session.user.id;

        const targetUser = await db.user.findUnique({ where: { email } });
        if (!targetUser) return { error: "No user found with that email" };
        if (targetUser.id === userId) return { error: "Cannot share with yourself" };

        const where = filterType === 'category'
            ? { workspaceId, category: filterValue }
            : { workspaceId, tags: { has: filterValue } };

        const contacts = await db.contact.findMany({
            where,
            select: { id: true }
        });

        if (contacts.length === 0) return { error: "No contacts found for this filter" };

        let shared = 0;
        for (const contact of contacts) {
            try {
                await db.contactShare.upsert({
                    where: {
                        contactId_sharedWithUserId: {
                            contactId: contact.id,
                            sharedWithUserId: targetUser.id
                        }
                    },
                    update: {},
                    create: {
                        contactId: contact.id,
                        sharedWithUserId: targetUser.id
                    }
                });
                shared++;
            } catch { }
        }

        return { data: { success: true, count: shared, user: { displayName: targetUser.displayName, email: targetUser.email } } };
    } catch (error) {
        console.error("[ShareContactsByFilter] Error:", error);
        return { error: error.message || "Failed to share contacts" };
    }
};

export const shareContactsByFilter = createSafeAction(ShareContactsByFilterSchema, handler);
