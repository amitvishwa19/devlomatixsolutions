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
            where: { 
                userId, 
                platform: { in: ['WHATSAPP', 'WHATSAPP_CLOUD'] } 
            },
            select: {
                id: true,
                profile: true,
                credentials: true,
                platform: true,
                isDefault: true
            },
            orderBy: [
                { isDefault: 'desc' }, 
                { updatedAt: 'desc' } // Get the most recently updated one if multiple
            ],
        });

        console.log("-----------------------------------------");
        console.log("[GetDecryptedCredentials] Record Found:", cred?.profile || "NONE");


        if (!cred) {
            console.log("[GetDecryptedCredentials] No credentials found for userId:", userId);
            return { error: "No credentials found" };
        }

        let stored = cred.credentials;
        if (typeof stored === 'string' && stored.includes(':')) {
            try {
                const decrypted = symmetricDecrypt(stored);
                stored = JSON.parse(decrypted);
                console.log("[GetDecryptedCredentials] Decryption successful.");
                console.log("[GetDecryptedCredentials] Extracted values:", {
                    hasToken: !!stored.accessToken,
                    phoneId: stored.phoneNumberId,
                    wabaId: stored.wabaId
                });
            } catch (e) {
                console.error("[GetDecryptedCredentials] Decryption failed:", e.message);
                return { error: 'Failed to decrypt credentials' };
            }
        }

        const result = {
            success: true,
            data: {
                accessToken: stored?.accessToken || '',
                phoneNumberId: stored?.phoneNumberId || '',
                wabaId: stored?.wabaId || '',
                profile: cred.profile || 'Default Account',
                isDefault: cred.isDefault,
            }
        };

        console.log("[GetDecryptedCredentials] Returning to UI:", {
            ...result.data,
            accessToken: result.data.accessToken ? "PRESENT" : "MISSING"
        });

        return result;
    } catch (error) {
        return { error: error.message || "Failed to fetch credentials" };
    }
};

export const getDecryptedCredentials = createSafeAction(GetDecryptedCredentialsSchema, handler);
