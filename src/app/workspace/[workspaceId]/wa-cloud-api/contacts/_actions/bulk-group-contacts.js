'use server'

import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { db } from "@/lib/db";
import { ensureWorkspaceAccess } from "@/lib/auth-utils";

const BulkGroupSchema = z.object({
    contactIds: z.array(z.string()),
    groupId: z.string(),
    workspaceId: z.string(),
});

const handler = async (data) => {
    const { workspaceId, contactIds, groupId } = data;
    await ensureWorkspaceAccess(workspaceId);

    try {
        // We use updateMany for the contacts, but Prisma's updateMany doesn't support relations.
        // So we have to use a transaction or a specialized query.
        // Actually, we want to CONNECT each contact to the group.
        
        await db.contactGroup.update({
            where: { id: groupId },
            data: {
                contacts: {
                    connect: contactIds.map(id => ({ id }))
                }
            }
        });

        return { data: { success: true, count: contactIds.length } };
    } catch (error) {
        console.error('Action Error (bulkGroupContacts):', error);
        return { error: error.message || 'Internal Server Error' };
    }
};

export const bulkGroupContacts = createSafeAction(BulkGroupSchema, handler);
