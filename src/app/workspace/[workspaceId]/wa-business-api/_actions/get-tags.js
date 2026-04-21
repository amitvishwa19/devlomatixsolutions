'use server'

import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { db } from "@/lib/db";

const GetTagsSchema = z.object({
    workspaceId: z.string(),
});

const handler = async (data) => {
    const { workspaceId } = data;

    try {
        // Fetch all contacts in the workspace to extract unique tags
        // Since Prisma doesn't have a direct "distinct on array elements" query, 
        // we fetch the tags and process in memory.
        const contacts = await db.contact.findMany({
            where: { workspaceId },
            select: { tags: true }
        });

        const uniqueTags = [...new Set(contacts.flatMap(c => c.tags || []))].sort();

        return { data: uniqueTags };
    } catch (error) {
        console.error('[WA_BUSINESS_GET_TAGS]', error);
        return { error: "Failed to fetch unique tags" };
    }
};

export const getTags = createSafeAction(GetTagsSchema, handler);
