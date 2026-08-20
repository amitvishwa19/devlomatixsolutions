'use server'

import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { db } from "@/lib/db";
import { ensureWorkspaceAccess, checkIsSuperAdmin } from "@/lib/auth-utils";

const UpdateTestNumbersSchema = z.object({
    workspaceId: z.string(),
    testNumbers: z.array(z.string()),
});

const handler = async (data) => {
    const { workspaceId, testNumbers } = data;

    try {
        const session = await ensureWorkspaceAccess(workspaceId);
        const userId = session.user.userId || session.user.id;

        // 1. Fetch current workspace & global settings
        const wsSettings = await db.appSettings.findUnique({ where: { key: workspaceId } }).catch(() => null);
        const glSettings = await db.appSettings.findUnique({ where: { key: 'global' } }).catch(() => null);

        const currentWsIntegrations = (typeof wsSettings?.integrations === 'object' && wsSettings?.integrations !== null)
            ? wsSettings.integrations
            : {};
        const currentGlIntegrations = (typeof glSettings?.integrations === 'object' && glSettings?.integrations !== null)
            ? glSettings.integrations
            : {};

        const currentMetadata = (typeof currentWsIntegrations.whatsappMetadata === 'object' && currentWsIntegrations.whatsappMetadata !== null)
            ? currentWsIntegrations.whatsappMetadata
            : (typeof currentGlIntegrations.whatsappMetadata === 'object' && currentGlIntegrations.whatsappMetadata !== null)
                ? currentGlIntegrations.whatsappMetadata
                : {};

        const existingAuth = await db.whatsAppAuth.findUnique({
            where: { sessionId: userId }
        }).catch(() => null);

        const authMetadata = (existingAuth?.metadata && typeof existingAuth.metadata === 'object') ? existingAuth.metadata : {};

        const updatedMetadata = {
            ...authMetadata,
            ...currentMetadata,
            testNumbers: testNumbers
        };

        // 2. Always update workspace settings (key = workspaceId)
        const updatedWsIntegrations = {
            ...currentWsIntegrations,
            whatsappSettings: updatedMetadata,
            whatsappMetadata: updatedMetadata,
        };

        await db.appSettings.upsert({
            where: { key: workspaceId },
            create: {
                key: workspaceId,
                integrations: updatedWsIntegrations,
            },
            update: {
                integrations: updatedWsIntegrations,
            }
        });

        // 3. If super-admin, ALSO save to global settings (key = 'global')
        const isSuperAdmin = await checkIsSuperAdmin(session, userId);
        if (isSuperAdmin) {
            const updatedGlIntegrations = {
                ...currentGlIntegrations,
                whatsappSettings: updatedMetadata,
                whatsappMetadata: updatedMetadata,
            };

            await db.appSettings.upsert({
                where: { key: 'global' },
                create: {
                    key: 'global',
                    integrations: updatedGlIntegrations,
                },
                update: {
                    integrations: updatedGlIntegrations,
                }
            });
        }

        // 4. Sync to whatsAppAuth
        try {
            await db.whatsAppAuth.upsert({
                where: { sessionId: userId },
                update: {
                    metadata: updatedMetadata
                },
                create: {
                    sessionId: userId,
                    metadata: updatedMetadata
                }
            });
        } catch (authErr) {
            console.error("[updateTestNumbers] whatsAppAuth sync error:", authErr.message);
        }

        return { success: true, testNumbers: testNumbers };
    } catch (error) {
        return { error: error.message || "Failed to update test numbers" };
    }
};

export const updateTestNumbers = createSafeAction(UpdateTestNumbersSchema, handler);
