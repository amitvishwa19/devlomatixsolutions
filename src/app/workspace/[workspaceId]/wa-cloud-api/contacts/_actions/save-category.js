'use server'

import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { db } from "@/lib/db";

const SaveCategorySchema = z.object({
    id: z.string().optional(),
    name: z.string().min(1, "Name is required"),
    color: z.string().optional().default('#3b82f6'),
    type: z.enum(['CONTACT', 'TAG', 'GENERAL']).default('CONTACT'),
    workspaceId: z.string(),
    userId: z.string().optional(),
});

const handler = async (data) => {
    const { id, name, color, type, workspaceId, userId } = data;

    try {
        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

        if (id) {
            const updated = await db.category.update({
                where: { id },
                data: {
                    name,
                    slug,
                    color,
                    type,
                    workspaceId
                }
            });
            return { data: updated };
        } else {
            const category = await db.category.create({
                data: {
                    name,
                    slug,
                    color,
                    type,
                    workspaceId
                }
            });
            return { data: category };
        }
    } catch (error) {
        if (error.code === 'P2002') {
            return { error: 'A category with this name already exists' };
        }
        console.error('Action Error (saveCategory):', error);
        return { error: error.message || 'Internal Server Error' };
    }
};

export const saveCategory = createSafeAction(SaveCategorySchema, handler);
