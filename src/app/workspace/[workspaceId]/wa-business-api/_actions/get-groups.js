'use server'

import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { db } from "@/lib/db";

const GetGroupsSchema = z.object({
    workspaceId: z.string(),
});

const handler = async (data) => {
    const { workspaceId } = data;

    try {
        const groups = await db.contactGroup.findMany({
            where: { workspaceId },
            include: {
                _count: {
                    select: { contacts: true }
                }
            },
            orderBy: { name: 'asc' }
        });

        return { data: groups };
    } catch (error) {
        console.error('[WA_BUSINESS_GET_GROUPS]', error);
        return { error: "Failed to fetch contact groups" };
    }
};

export const getGroups = createSafeAction(GetGroupsSchema, handler);
