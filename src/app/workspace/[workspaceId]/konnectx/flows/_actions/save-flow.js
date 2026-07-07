'use server'

import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { db } from "@/lib/db";
import { ensureWorkspaceAccess } from "@/lib/auth-utils";

const SaveFlowSchema = z.object({
    workspaceId: z.string(),
    id: z.string().optional(),
    name: z.string().min(1, "Name is required"),
    description: z.string().optional(),
    categories: z.array(z.string()).optional(),
    endpointUrl: z.string().optional(),
    screens: z.any().optional(),
    metaValidationErrors: z.any().optional(),
});

const handler = async (data) => {
    const { workspaceId, id, ...rest } = data;

    try {
        const session = await ensureWorkspaceAccess(workspaceId);
        const userId = session.user.userId || session.user.id;

        if (id) {
            // Update
            const flow = await db.whatsAppFlow.update({
                where: { id, userId },
                data: {
                    ...rest,
                    updatedAt: new Date()
                }
            });
            return { success: true, flow };
        } else {
            // Create
            const flow = await db.whatsAppFlow.create({
                data: {
                    ...rest,
                    workspaceId,
                    userId,
                    status: 'DRAFT'
                }
            });
            return { success: true, flow };
        }
    } catch (error) {
        return { error: error.message || "Failed to save flow" };
    }
};

export const saveFlow = createSafeAction(SaveFlowSchema, handler);
