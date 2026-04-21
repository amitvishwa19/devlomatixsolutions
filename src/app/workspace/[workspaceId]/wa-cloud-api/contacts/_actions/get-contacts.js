'use server'

import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { db } from "@/lib/db";

const GetContactsSchema = z.object({
    userId: z.string().optional(),
    workspaceId: z.string().optional(),
});

const handler = async (data) => {
    const { userId, workspaceId } = data;

    if (!userId && !workspaceId) {
        return { error: 'User ID or Workspace ID is required' };
    }

    try {
        const where = {};
        if (workspaceId) where.workspaceId = workspaceId;
        else if (userId) where.userId = userId;

        const contacts = await db.contact.findMany({
            where,
            include: { 
                groups: true,
                category: true 
            },
            orderBy: { createdAt: 'desc' }
        });

        return { data: contacts };
    } catch (error) {
        console.error('[GET_CONTACTS]', error);
        return { error: "Failed to fetch contacts" };
    }
};

export const getContacts = createSafeAction(GetContactsSchema, handler);
