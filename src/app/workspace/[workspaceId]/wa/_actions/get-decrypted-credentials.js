'use server'

import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { db } from "@/lib/db";
import { ensureWorkspaceAccess } from "@/lib/auth-utils";
import { symmetricDecrypt } from "@/lib/encryption";

const GetDecryptedCredentialsSchema = z.object({
    workspaceId: z.string(),
});

const handler = async (data) => {
    const { workspaceId } = data;

    try {
        const session = await ensureWorkspaceAccess(workspaceId);
        const userId = session.user.userId || session.user.id;

        // Prefer default account, fallback to first
        const cred = await db.credentials.findFirst({
            where: { userId, platform: 'WHATSAPP_CLOUD' },
            orderBy: [{ isDefault: 'desc' }, { createdAt: 'asc' }],
        });

        if (!cred) return { error: "No credentials found" };

        let stored = cred.credentials;
        if (typeof stored === 'string' && stored.includes(':')) {
            try {
                const decrypted = symmetricDecrypt(stored);
                stored = JSON.parse(decrypted);
            } catch (e) {
                return { error: 'Failed to decrypt credentials' };
            }
        }

        return {
            success: true,
            data: {
                accessToken: stored?.accessToken || '',
                phoneNumberId: stored?.phoneNumberId || '',
                wabaId: stored?.wabaId || '',
                profile: cred.profile || 'Default Account',
                isDefault: cred.isDefault,
            }
        };
    } catch (error) {
        return { error: error.message || "Failed to fetch credentials" };
    }
};

export const getDecryptedCredentials = createSafeAction(GetDecryptedCredentialsSchema, handler);
