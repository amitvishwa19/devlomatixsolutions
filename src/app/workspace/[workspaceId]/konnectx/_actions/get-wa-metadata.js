'use server'

import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { db } from "@/lib/db";
import { ensureWorkspaceAccess } from "@/lib/auth-utils";

const GetMetadataSchema = z.object({
    workspaceId: z.string(),
});

const handler = async (data) => {
    const { workspaceId } = data;

    try {
        const session = await ensureWorkspaceAccess(workspaceId);
        const userId = session.user.userId || session.user.id;

        // 1. Fetch workspace settings & global settings
        const wsSettings = await db.appSettings.findUnique({ where: { key: workspaceId } }).catch(() => null);
        const glSettings = await db.appSettings.findUnique({ where: { key: 'global' } }).catch(() => null);
        const authRecord = await db.whatsAppAuth.findUnique({ where: { sessionId: userId } }).catch(() => null);

        const glMetadata = (typeof glSettings?.integrations?.whatsappMetadata === 'object' && glSettings?.integrations?.whatsappMetadata !== null)
            ? glSettings.integrations.whatsappMetadata
            : (typeof glSettings?.integrations?.whatsappSettings === 'object' && glSettings?.integrations?.whatsappSettings !== null)
                ? glSettings.integrations.whatsappSettings
                : {};

        const wsMetadata = (typeof wsSettings?.integrations?.whatsappMetadata === 'object' && wsSettings?.integrations?.whatsappMetadata !== null)
            ? wsSettings.integrations.whatsappMetadata
            : (typeof wsSettings?.integrations?.whatsappSettings === 'object' && wsSettings?.integrations?.whatsappSettings !== null)
                ? wsSettings.integrations.whatsappSettings
                : {};

        const authMetadata = (typeof authRecord?.metadata === 'object' && authRecord?.metadata !== null)
            ? authRecord.metadata
            : {};

        const mergedMetadata = {
            ...glMetadata,
            ...authMetadata,
            ...wsMetadata,
        };

        return {
            data: {
                metadata: JSON.parse(JSON.stringify(mergedMetadata)),
            }
        };
    } catch (error) {
        return { error: error.message || "Failed to fetch metadata" };
    }
};

export const getWaMetadata = createSafeAction(GetMetadataSchema, handler);
