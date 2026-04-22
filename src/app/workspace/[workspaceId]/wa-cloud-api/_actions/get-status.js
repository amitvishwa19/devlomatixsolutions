'use server'

import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { db } from "@/lib/db";
import { ensureWorkspaceAccess } from "@/lib/auth-utils";

const GetStatusSchema = z.object({
    workspaceId: z.string(),
});

const handler = async (data) => {
    const { workspaceId } = data;

    try {
        const session = await ensureWorkspaceAccess(workspaceId);
        const userId = session.user.userId || session.user.id;
        
        // In Cloud API, "status" is 'open' if we have a default credential
        const defaultCred = await db.credentials.findFirst({
            where: { 
                workspaceId, 
                userId, 
                platform: 'WHATSAPP_CLOUD',
                isDefault: true 
            }
        });

        return {
            status: defaultCred ? 'open' : 'welcome',
            hasDefault: !!defaultCred
        };
    } catch (error) {
        console.error("[WA Cloud Action] Get Status Error:", error);
        return { error: error.message || "Failed to fetch status" };
    }
};

export const getStatus = createSafeAction(GetStatusSchema, handler);
