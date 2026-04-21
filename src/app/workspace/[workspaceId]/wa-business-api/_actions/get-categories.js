'use server'

import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { db } from "@/lib/db";

const GetCategoriesSchema = z.object({
    workspaceId: z.string(),
});

const handler = async (data) => {
    const { workspaceId } = data;

    try {
        // In the WhatsApp module, categories are stored as a flat string field on the Contact model.
        // We fetch unique categories used by contacts in this workspace.
        const contacts = await db.contact.findMany({
            where: { workspaceId },
            select: { category: true }
        });

        const uniqueCategories = [...new Set(contacts.map(c => c.category).filter(Boolean))].sort();

        return { data: uniqueCategories };
    } catch (error) {
        console.error('[WA_BUSINESS_GET_CATEGORIES]', error);
        return { error: "Failed to fetch contact categories" };
    }
};

export const getCategories = createSafeAction(GetCategoriesSchema, handler);
