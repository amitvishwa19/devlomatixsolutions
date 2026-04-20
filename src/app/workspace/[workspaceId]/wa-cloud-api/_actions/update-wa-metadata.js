'use server'

import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { db } from "@/lib/db";
import { ensureWorkspaceAccess } from "@/lib/auth-utils";

const UpdateWaMetadataSchema = z.object({
    workspaceId: z.string(),
    metadata: z.any(),
});

const handler = async (data) => {
    const { workspaceId, metadata } = data;

    try {
        const session = await ensureWorkspaceAccess(workspaceId);
        const userId = session.user.userId || session.user.id;

        const auth = await db.whatsAppAuth.findUnique({ where: { sessionId: userId } });
        if (!auth) return { error: "No WhatsApp instance found. Connect first." };

        const currentMetadata = typeof auth.metadata === 'object' && auth.metadata !== null ? auth.metadata : {};
        
        const updatedMetadata = {
            ...currentMetadata,
            ...metadata
        };

        if (updatedMetadata.testNumbers) {
            updatedMetadata.testNumbers = Array.isArray(updatedMetadata.testNumbers) 
                ? updatedMetadata.testNumbers.slice(0, 5) 
                : [];
        }

        const updated = await db.whatsAppAuth.update({
            where: { sessionId: userId },
            data: { metadata: updatedMetadata }
        });

        return { success: true, metadata: updated.metadata };
    } catch (error) {
        return { error: error.message || "Failed to update metadata" };
    }
};

export const updateWaMetadata = createSafeAction(UpdateWaMetadataSchema, handler);
