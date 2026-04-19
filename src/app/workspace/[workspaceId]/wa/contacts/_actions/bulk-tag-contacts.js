'use server'

import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { db } from "@/lib/db";
import { ensureWorkspaceAccess } from "@/lib/auth-utils";

const BulkTagSchema = z.object({
    ids: z.array(z.string()),
    tag: z.string().min(1, "Tag is required"),
    workspaceId: z.string(),
});

const handler = async (data) => {
    const { ids, tag, workspaceId } = data;
    await ensureWorkspaceAccess(workspaceId);

    try {
        // Find existing contacts to get their current tags
        const contacts = await db.contact.findMany({
            where: { 
                id: { in: ids },
                workspaceId
            },
            select: { id: true, tags: true }
        });

        const updates = contacts.map(contact => {
            const currentTags = Array.isArray(contact.tags) ? contact.tags : [];
            if (!currentTags.includes(tag)) {
                return db.contact.update({
                    where: { id: contact.id },
                    data: {
                        tags: {
                            set: [...currentTags, tag]
                        }
                    }
                });
            }
            return null;
        }).filter(p => p !== null);

        if (updates.length > 0) {
            await Promise.all(updates);
        }

        return { data: { success: true, count: updates.length } };
    } catch (error) {
        console.error('[BULK_TAG_CONTACTS]', error);
        return { error: "Failed to tag contacts" };
    }
};

export const bulkTagContacts = createSafeAction(BulkTagSchema, handler);
