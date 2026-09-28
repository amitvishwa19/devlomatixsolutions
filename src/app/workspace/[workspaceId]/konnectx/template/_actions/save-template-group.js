'use server'

import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { db } from "@/lib/db";
import { ensureWorkspaceAccess } from "@/lib/auth-utils";

const SaveTemplateGroupSchema = z.object({
    id: z.string().optional(),
    name: z.string().min(1, "Group name is required"),
    description: z.string().optional().nullable(),
    color: z.string().optional().default('#3b82f6'),
    workspaceId: z.string(),
});

const handler = async (data) => {
    const { id, name, description, color, workspaceId } = data;

    try {
        await ensureWorkspaceAccess(workspaceId);

        const baseSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'group';
        const slug = `${baseSlug}-tpl`;

        if (id) {
            const updated = await db.category.update({
                where: { id },
                data: {
                    name,
                    slug,
                    description: description || null,
                    color: color || '#3b82f6',
                    type: 'TEMPLATE',
                    workspaceId
                }
            });

            // Also update any templates that have this groupId in metadata so groupName stays in sync
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
                meta.groupName = name;
                meta.groupColor = color || '#3b82f6';
                await db.messageTemplate.update({
                    where: { id: t.id },
                    data: { metadata: meta }
                }).catch(() => null);
            }

            return { data: { group: updated } };
        } else {
            // Check if group with same name already exists in this workspace
            const existing = await db.category.findFirst({
                where: {
                    workspaceId,
                    name: { equals: name, mode: 'insensitive' },
                    type: 'TEMPLATE'
                }
            });

            if (existing) {
                return { error: 'A template group with this name already exists.' };
            }

            // Ensure unique slug within workspace
            let uniqueSlug = slug;
            let counter = 1;
            while (await db.category.findUnique({ where: { workspaceId_slug: { workspaceId, slug: uniqueSlug } } })) {
                uniqueSlug = `${slug}-${counter++}`;
            }

            const group = await db.category.create({
                data: {
                    name,
                    slug: uniqueSlug,
                    description: description || null,
                    color: color || '#3b82f6',
                    type: 'TEMPLATE',
                    workspaceId
                }
            });

            return { data: { group } };
        }
    } catch (error) {
        if (error.code === 'P2002') {
            return { error: 'A group with this name already exists in this workspace.' };
        }
        console.error('Action Error (saveTemplateGroup):', error);
        return { error: error.message || 'Failed to save template group' };
    }
};

export const saveTemplateGroup = createSafeAction(SaveTemplateGroupSchema, handler);
