'use server'

import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { db } from "@/lib/db";
import { ensureWorkspaceAccess, checkIsSuperAdmin } from "@/lib/auth-utils";
import { symmetricDecrypt } from "@/lib/encryption";

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

        // 3. Extract credential details
        let cloudCreds = null;
        const stored = account.credentials;
        if (typeof stored === 'string' && stored.includes(':')) {
            try { cloudCreds = JSON.parse(symmetricDecrypt(stored)); } catch (e) {}
        } else if (typeof stored === 'string') {
            try { cloudCreds = JSON.parse(stored); } catch (e) {}
        } else if (typeof stored === 'object' && stored !== null) {
            if (stored.enc && typeof stored.enc === 'string' && stored.enc.includes(':')) {
                try { cloudCreds = JSON.parse(symmetricDecrypt(stored.enc)); } catch (e) {}
            } else {
                cloudCreds = stored;
            }
        }

        const defaultInfo = {
            credentialId: account.id,
            profile: account.profile || '',
            phoneNumberId: cloudCreds?.phoneNumberId || cloudCreds?.phone_number_id || '',
            wabaId: cloudCreds?.wabaId || cloudCreds?.waba_id || '',
        };

        // 4. Save to Workspace Settings (key = workspaceId)
        const existingWs = await db.appSettings.findUnique({ where: { key: workspaceId } }).catch(() => null);
        const wsIntegrations = (typeof existingWs?.integrations === 'object' && existingWs?.integrations !== null)
            ? existingWs.integrations
            : {};

        await db.appSettings.upsert({
            where: { key: workspaceId },
            create: {
                key: workspaceId,
                integrations: {
                    ...wsIntegrations,
                    whatsappDefault: defaultInfo,
                },
            },
            update: {
                integrations: {
                    ...wsIntegrations,
                    whatsappDefault: defaultInfo,
                },
            },
        });

        // 5. If user is super-admin, ALSO save to Global Settings (key = 'global')
        const isSuperAdmin = await checkIsSuperAdmin(session, userId);
        if (isSuperAdmin) {
            const existingGlobal = await db.appSettings.findUnique({ where: { key: 'global' } }).catch(() => null);
            const glIntegrations = (typeof existingGlobal?.integrations === 'object' && existingGlobal?.integrations !== null)
                ? existingGlobal.integrations
                : {};

            await db.appSettings.upsert({
                where: { key: 'global' },
                create: {
                    key: 'global',
                    integrations: {
                        ...glIntegrations,
                        whatsappDefault: defaultInfo,
                    },
                },
                update: {
                    integrations: {
                        ...glIntegrations,
                        whatsappDefault: defaultInfo,
                    },
                },
            });
        }

        return { success: true, accountId: account.id };
    } catch (error) {
        return { error: error.message || "Failed to set default" };
    }
};

export const setDefaultCredential = createSafeAction(SetDefaultCredentialSchema, handler);
