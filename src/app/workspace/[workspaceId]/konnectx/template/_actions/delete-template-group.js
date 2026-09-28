'use server'

import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { db } from "@/lib/db";
import { ensureWorkspaceAccess } from "@/lib/auth-utils";

const DeleteTemplateGroupSchema = z.object({
    id: z.string(),
    workspaceId: z.string(),
});

const handler = async (data) => {
    const { id, workspaceId } = data;

    try {
        await ensureWorkspaceAccess(workspaceId);

        // Find group
        const group = await db.category.findUnique({
            where: { id }
        });

        if (!group || group.workspaceId !== workspaceId) {
            return { error: 'Group not found or unauthorized' };
        }

        // Remove group reference from all templates that belonged to this group
        const templatesWithGroup = await db.messageTemplate.findMany({
            where: {
                metadata: {
                    path: ['groupId'],
                    equals: id
                }
            }
        }).catch(() => []);

        for (const t of templatesWithGroup) {
            let meta = typeof t.metadata === 'string' ? JSON.parse(t.metadata) : (t.metadata || {});
            delete meta.groupId;
            delete meta.groupName;
            delete meta.groupColor;
            await db.messageTemplate.update({
                where: { id: t.id },
                data: { metadata: meta }
            }).catch(() => null);
        }

        // Delete the category row
        await db.category.delete({
            where: { id }
        });

        return { data: { success: true, id } };
    } catch (error) {
        console.error('Action Error (deleteTemplateGroup):', error);
        return { error: error.message || 'Failed to delete template group' };
    }
};

export const deleteTemplateGroup = createSafeAction(DeleteTemplateGroupSchema, handler);
