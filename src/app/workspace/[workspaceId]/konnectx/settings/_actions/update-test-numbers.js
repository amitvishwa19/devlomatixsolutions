'use server'

import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { db } from "@/lib/db";
import { ensureWorkspaceAccess } from "@/lib/auth-utils";

const UpdateTestNumbersSchema = z.object({
    workspaceId: z.string(),
    testNumbers: z.array(z.string()),
});

const handler = async (data) => {
    const { workspaceId, testNumbers } = data;

    try {
        const session = await ensureWorkspaceAccess(workspaceId);
        const userId = session.user.userId || session.user.id;

        // Fetch current record to merge metadata
        const existing = await db.whatsAppAuth.findUnique({
            where: { sessionId: userId }
        });

        const currentMetadata = existing?.metadata && typeof existing.metadata === 'object' ? existing.metadata : {};
        
        const updatedMetadata = {
            ...currentMetadata,
            testNumbers: testNumbers
        };

        const updated = await db.whatsAppAuth.upsert({
            where: { sessionId: userId },
            update: {
                metadata: updatedMetadata
            },
            create: {
                sessionId: userId,
                metadata: updatedMetadata
            }
        });

        return { success: true, testNumbers: testNumbers };
    } catch (error) {
        return { error: error.message || "Failed to update test numbers" };
    }
};

export const updateTestNumbers = createSafeAction(UpdateTestNumbersSchema, handler);
