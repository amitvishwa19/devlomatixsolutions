'use server'

import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { db } from "@/lib/db";
import { ensureWorkspaceAccess, checkIsSuperAdmin } from "@/lib/auth-utils";

const UpdateWaMetadataSchema = z.object({
    workspaceId: z.string(),
    metadata: z.any(),
});

const handler = async (data) => {
    const { workspaceId, metadata } = data;

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

        const updatedMetadata = {
            ...currentMetadata,
            ...metadata
        };

        if (updatedMetadata.testNumbers) {
            updatedMetadata.testNumbers = Array.isArray(updatedMetadata.testNumbers) 
                ? updatedMetadata.testNumbers.slice(0, 5) 
                : [];
        }

        // 2. Always update workspace-specific settings (key = workspaceId)
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

        // 3. If user is super-admin, ALSO save to global settings (key = 'global')
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

        // 4. Sync to whatsAppAuth if available
        try {
            const auth = await db.whatsAppAuth.findUnique({ where: { sessionId: userId } }).catch(() => null);
            if (auth) {
                await db.whatsAppAuth.update({
                    where: { sessionId: userId },
                    data: { metadata: updatedMetadata }
                });
            }
        } catch (authErr) {
            console.error("[updateWaMetadata] whatsAppAuth sync error:", authErr.message);
        }

        return { success: true, metadata: updatedMetadata };
    } catch (error) {
        return { error: error.message || "Failed to update metadata" };
    }
};

export const updateWaMetadata = createSafeAction(UpdateWaMetadataSchema, handler);
