'use server'

import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { db } from "@/lib/db";
import { ensureWorkspaceAccess, checkIsSuperAdmin } from "@/lib/auth-utils";
import { symmetricDecrypt } from "@/lib/encryption";

const SyncDefaultCredentialSchema = z.object({
    workspaceId: z.string(),
});

const handler = async (data) => {
    const { workspaceId } = data;

    try {
        const session = await ensureWorkspaceAccess(workspaceId);
        const userId = session?.user?.userId || session?.user?.id;

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
        } else if (typeof stored === 'object' && stored !== null) {
            if (stored.enc && typeof stored.enc === 'string' && stored.enc.includes(':')) {
                cloudCreds = JSON.parse(symmetricDecrypt(stored.enc));
            } else {
                cloudCreds = stored;
            }
        }

        const defaultInfo = {
            credentialId: credential.id,
            profile: credential.profile || '',
            phoneNumberId: cloudCreds?.phoneNumberId || cloudCreds?.phone_number_id || '',
            wabaId: cloudCreds?.wabaId || cloudCreds?.waba_id || '',
        };

        // 1. Always save to workspace settings (key = workspaceId)
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

        // 2. If super-admin, ALSO save to global settings (key = 'global')
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

        return { success: true, data: defaultInfo };
    } catch (error) {
        return { error: error.message || "Failed to sync default credential" };
    }
};

export const syncDefaultCredentialAppsettings = createSafeAction(SyncDefaultCredentialSchema, handler);
