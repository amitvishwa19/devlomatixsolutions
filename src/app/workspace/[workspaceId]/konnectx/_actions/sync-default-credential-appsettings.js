'use server'

import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { db } from "@/lib/db";
import { ensureWorkspaceAccess } from "@/lib/auth-utils";
import { symmetricDecrypt } from "@/lib/encryption";

const SyncDefaultCredentialSchema = z.object({
    workspaceId: z.string(),
});

const handler = async (data) => {
    const { workspaceId } = data;

    try {
        const session = await ensureWorkspaceAccess(workspaceId);

        const credential = await db.credentials.findFirst({
            where: {
                workspaceId,
                platform: 'WHATSAPP_CLOUD',
                isDefault: true,
            },
            select: {
                id: true,
                profile: true,
                credentials: true,
            }
        });

        if (!credential) {
            return { success: false, message: "No default WhatsApp credential found" };
        }

        let cloudCreds = null;
        const stored = credential.credentials;
        if (typeof stored === 'string' && stored.includes(':')) {
            cloudCreds = JSON.parse(symmetricDecrypt(stored));
        } else if (typeof stored === 'string') {
            cloudCreds = JSON.parse(stored);
        } else {
            cloudCreds = stored;
        }

        const defaultInfo = {
            credentialId: credential.id,
            profile: credential.profile || '',
            phoneNumberId: cloudCreds?.phoneNumberId || cloudCreds?.phone_number_id || '',
            wabaId: cloudCreds?.wabaId || cloudCreds?.waba_id || '',
        };

        const existing = await db.appSettings.findUnique({ where: { key: 'global' } });

        const integrations = {
            ...(existing?.integrations || {}),
            whatsappDefault: defaultInfo,
        };

        await db.appSettings.upsert({
            where: { key: 'global' },
            create: {
                key: 'global',
                integrations,
            },
            update: {
                integrations,
            },
        });

        return { success: true, data: defaultInfo };
    } catch (error) {
        return { error: error.message || "Failed to sync default credential" };
    }
};

export const syncDefaultCredentialAppsettings = createSafeAction(SyncDefaultCredentialSchema, handler);
