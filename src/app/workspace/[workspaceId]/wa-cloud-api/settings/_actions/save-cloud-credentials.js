'use server'

import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { db } from "@/lib/db";
import { ensureWorkspaceAccess } from "@/lib/auth-utils";
import { symmetricEncrypt } from "@/lib/encryption";

const SaveCloudCredentialsSchema = z.object({
    workspaceId: z.string(),
    id: z.string().nullable().optional(),
    profile: z.string(),
    phoneNumberId: z.string(),
    wabaId: z.string(),
    accessToken: z.string().optional().nullable(),
});

const handler = async (data) => {
    const { workspaceId, id, profile, phoneNumberId, wabaId, accessToken } = data;

    try {
        const session = await ensureWorkspaceAccess(workspaceId);
        const userId = session.user.userId || session.user.id;

        // Encrypt credentials
        const credentials = {
            accessToken,
            phoneNumberId,
            wabaId
        };
        const encrypted = symmetricEncrypt(JSON.stringify(credentials));

        let account;
        if (id) {
            // Update existing record
            account = await db.credentials.update({
                where: { id },
                data: {
                    profile,
                    credentials: encrypted,
                    status: 'connected'
                }
            });
        } else {
            // Create new record
            account = await db.credentials.create({
                data: {
                    userId,
                    workspaceId,
                    platform: 'WHATSAPP_CLOUD',
                    profile,
                    credentials: encrypted,
                    status: 'connected'
                }
            });
        }

        return { success: true, accountId: account.id };
    } catch (error) {
        return { error: error.message || "Failed to save cloud credentials" };
    }
};

export const saveCloudCredentials = createSafeAction(SaveCloudCredentialsSchema, handler);
