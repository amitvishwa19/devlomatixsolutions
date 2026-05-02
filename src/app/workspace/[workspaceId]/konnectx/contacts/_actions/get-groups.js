'use server'

import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { db } from "@/lib/db";

const GetGroupsSchema = z.object({
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

        const groups = await db.contactGroup.findMany({
            where,
            include: {
                _count: {
                    select: { contacts: true }
                }
            },
            orderBy: { name: 'asc' }
        });

        return { data: groups };
    } catch (error) {
        console.error('[GET_GROUPS]', error);
        return { error: "Failed to fetch groups" };
    }
};

export const getGroups = createSafeAction(GetGroupsSchema, handler);
