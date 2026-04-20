'use server'

import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { db } from "@/lib/db";
import { ensureWorkspaceAccess } from "@/lib/auth-utils";
import { symmetricEncrypt } from "@/lib/encryption";

const SaveCloudCredentialsSchema = z.object({
    workspaceId: z.string(),
    profileName: z.string(),
    credentials: z.object({
        accessToken: z.string(),
        phoneNumberId: z.string(),
        wabaId: z.string(),
    }),
});

const handler = async (data) => {
    const { workspaceId, profileName, credentials } = data;

    try {
        const session = await ensureWorkspaceAccess(workspaceId);
        const userId = session.user.userId || session.user.id;

        // Encrypt credentials
        const encrypted = symmetricEncrypt(JSON.stringify(credentials));

        // Save into Credentials table (using existing platform WHATSAPP_CLOUD)
        const account = await db.credentials.upsert({
            where: {
                userId_platform: {
                    userId,
                    platform: 'WHATSAPP_CLOUD'
                }
            },
            update: {
                profileName,
                credentials: encrypted,
                status: 'connected'
            },
            create: {
                userId,
                platform: 'WHATSAPP_CLOUD',
                profileName,
                credentials: encrypted,
                status: 'connected'
            }
        });

        return { success: true, accountId: account.id };
    } catch (error) {
        return { error: error.message || "Failed to save cloud credentials" };
    }
};

export const saveCloudCredentials = createSafeAction(SaveCloudCredentialsSchema, handler);
