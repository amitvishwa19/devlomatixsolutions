'use server'

import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { db } from "@/lib/db";
import { ensureWorkspaceAccess } from "@/lib/auth-utils";

const SetDefaultCredentialSchema = z.object({
    workspaceId: z.string(),
    id: z.string(),
});

const handler = async (data) => {
    const { workspaceId, id } = data;

    try {
        const session = await ensureWorkspaceAccess(workspaceId);
        const userId = session.user.userId || session.user.id;

        // 1. Unset all existing defaults for this user and platform
        await db.credentials.updateMany({
            where: { 
                userId, 
                platform: 'WHATSAPP_CLOUD',
                isDefault: true 
            },
            data: { isDefault: false }
        });

        // 2. Set the new default
        const account = await db.credentials.update({
            where: { id },
            data: { isDefault: true }
        });

        return { success: true, accountId: account.id };
    } catch (error) {
        return { error: error.message || "Failed to set default" };
    }
};

export const setDefaultCredential = createSafeAction(SetDefaultCredentialSchema, handler);
