'use server'

import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { db } from "@/lib/db";
import { ensureWorkspaceAccess } from "@/lib/auth-utils";

const DeleteTemplateSchema = z.object({
    workspaceId: z.string(),
    id: z.string(),
});

const handler = async (data) => {
    const { workspaceId, id } = data;

    try {
        const session = await ensureWorkspaceAccess(workspaceId);
        const userId = session.user.userId || session.user.id;

        const existing = await db.messageTemplate.findUnique({
            where: { id }
        });

        if (!existing || existing.userId !== userId) {
            return { error: "Template not found or unauthorized" };
        }

        await db.messageTemplate.delete({
            where: { id }
        });

        return { data: { success: true } };
    } catch (error) {
        console.error('[WA_BUSINESS_DELETE_TEMPLATE]', error);
        return { error: "Failed to delete template" };
    }
};

export const deleteTemplate = createSafeAction(DeleteTemplateSchema, handler);
