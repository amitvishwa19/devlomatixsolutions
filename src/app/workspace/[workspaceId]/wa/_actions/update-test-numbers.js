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

        // Fetch or update the WhatsAppAuth record
        const updated = await db.whatsAppAuth.upsert({
            where: { sessionId: userId },
            update: {
                metadata: {
                    testNumbers: testNumbers
                }
            },
            create: {
                sessionId: userId,
                metadata: {
                    testNumbers: testNumbers
                }
            }
        });

        return { success: true, metadata: updated.metadata };
    } catch (error) {
        return { error: error.message || "Failed to update test numbers" };
    }
};

export const updateTestNumbers = createSafeAction(UpdateTestNumbersSchema, handler);
