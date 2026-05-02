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

        let account;
        let finalEncrypted;

        if (id) {
            // Update existing record
            const oldAccount = await db.credentials.findUnique({ where: { id } });
            if (!oldAccount) return { error: "Account not found" };

            let finalAccessToken = accessToken;
            // Robust check: if new token is empty, null, or just whitespace, preserve the old one
            if (!finalAccessToken || finalAccessToken.trim() === '') {
                const oldCredsRaw = oldAccount.credentials;
                if (typeof oldCredsRaw === 'string' && oldCredsRaw.includes(':')) {
                    try {
                        const decrypted = JSON.parse(symmetricDecrypt(oldCredsRaw));
                        finalAccessToken = decrypted.accessToken;
                        console.log("[SaveCloudCredentials] Preserved existing token for account:", profile);
                    } catch (e) {
                        console.error("[SaveCloudCredentials] Failed to decrypt old token for preservation:", e.message);
                    }
                }
            }

            const credObj = {
                accessToken: finalAccessToken,
                phoneNumberId,
                wabaId
            };
            finalEncrypted = symmetricEncrypt(JSON.stringify(credObj));

            account = await db.credentials.update({
                where: { id },
                data: {
                    profile,
                    credentials: finalEncrypted,
                    status: 'connected'
                }
            });
        } else {
            // Create new record
            const credObj = {
                accessToken,
                phoneNumberId,
                wabaId
            };
            finalEncrypted = symmetricEncrypt(JSON.stringify(credObj));

            account = await db.credentials.create({
                data: {
                    userId,
                    workspaceId,
                    platform: 'WHATSAPP_CLOUD',
                    profile,
                    credentials: finalEncrypted,
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
