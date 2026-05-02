'use server'

import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { db } from "@/lib/db";
import { ensureWorkspaceAccess } from "@/lib/auth-utils";

const UpdateGroupSchema = z.object({
    id: z.string(),
    name: z.string().min(1, "Name is required"),
    description: z.string().optional(),
    userId: z.string(),
    workspaceId: z.string(),
});

const handler = async (data) => {
    const { workspaceId, id, name, description } = data;
    await ensureWorkspaceAccess(workspaceId);

    try {
        const updated = await db.contactGroup.update({
            where: { id },
            data: {
                name,
                description: description || null
            }
        });
        return { data: updated };
    } catch (error) {
        console.error('Action Error (updateGroup):', error);
        return { error: error.message || 'Internal Server Error' };
    }
};

export const updateGroup = createSafeAction(UpdateGroupSchema, handler);
