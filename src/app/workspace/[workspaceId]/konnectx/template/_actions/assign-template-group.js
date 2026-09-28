'use server'

import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { db } from "@/lib/db";
import { ensureWorkspaceAccess } from "@/lib/auth-utils";

const AssignTemplateGroupSchema = z.object({
    workspaceId: z.string(),
    templateIds: z.array(z.string()).min(1, "At least one template ID is required"),
    groupId: z.string().nullable().optional(), // null to unassign
});

const handler = async (data) => {
    const { workspaceId, templateIds, groupId } = data;

    try {
        await ensureWorkspaceAccess(workspaceId);

        let group = null;
        if (groupId) {
            group = await db.category.findUnique({
                where: { id: groupId }
            });
            if (!group) {
                return { error: 'Selected group does not exist' };
            }
        }

        const templates = await db.messageTemplate.findMany({
            where: {
                id: { in: templateIds }
            }
        });

        for (const t of templates) {
            let meta = typeof t.metadata === 'string' ? JSON.parse(t.metadata) : (t.metadata || {});
            if (group) {
                meta.groupId = group.id;
                meta.groupName = group.name;
                meta.groupColor = group.color || '#3b82f6';
            } else {
                delete meta.groupId;
                delete meta.groupName;
                delete meta.groupColor;
            }

            await db.messageTemplate.update({
                where: { id: t.id },
                data: { metadata: meta }
            });
        }

        return {
            data: {
                success: true,
                count: templates.length,
                groupId: group?.id || null,
                groupName: group?.name || null
            }
        };
    } catch (error) {
        console.error('Action Error (assignTemplateGroup):', error);
        return { error: error.message || 'Failed to assign templates to group' };
    }
};

export const assignTemplateGroup = createSafeAction(AssignTemplateGroupSchema, handler);
