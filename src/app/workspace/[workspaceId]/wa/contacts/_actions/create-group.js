'use server'

import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { db } from "@/lib/db";

const CreateGroupSchema = z.object({
    name: z.string().min(1, "Group name is required"),
    description: z.string().optional(),
    userId: z.string(),
    workspaceId: z.string().optional(),
});

const handler = async (data) => {
    const { name, description, userId, workspaceId } = data;

    try {
        const group = await db.contactGroup.create({
            data: {
                name,
                description,
                userId,
                workspaceId
            }
        });

        return { data: group };
    } catch (error) {
        if (error.code === 'P2002') {
            return { error: 'A group with this name already exists' };
        }
        console.error('Action Error (createGroup):', error);
        return { error: error.message || 'Internal Server Error' };
    }
};

export const createGroup = createSafeAction(CreateGroupSchema, handler);
