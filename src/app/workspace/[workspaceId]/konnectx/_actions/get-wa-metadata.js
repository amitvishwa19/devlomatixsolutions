'use server'

import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { db } from "@/lib/db";
import { ensureWorkspaceAccess } from "@/lib/auth-utils";

const GetMetadataSchema = z.object({
    workspaceId: z.string(),
});

const handler = async (data) => {
    const { workspaceId } = data;

    try {
        const session = await ensureWorkspaceAccess(workspaceId);
        const userId = session.user.userId || session.user.id;
        
        let authRecord = await db.whatsAppAuth.findUnique({
            where: { sessionId: userId }
        });

        return {
            data: {
                metadata: JSON.parse(JSON.stringify(authRecord?.metadata || {})),
            }
        };
    } catch (error) {
        return { error: error.message || "Failed to fetch metadata" };
    }
};

export const getWaMetadata = createSafeAction(GetMetadataSchema, handler);
