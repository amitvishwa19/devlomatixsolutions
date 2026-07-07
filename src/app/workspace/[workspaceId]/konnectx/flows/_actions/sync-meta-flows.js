'use server'

import { db } from "@/lib/db";
import { ensureWorkspaceAccess } from "@/lib/auth-utils";
import { getDecryptedCredentials } from "../../settings/_actions/get-decrypted-credentials";
import * as cloudApi from '../../_lib/whatsapp-cloud-api';
import { revalidatePath } from "next/cache";

import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";

const SyncFlowsSchema = z.object({
    workspaceId: z.string(),
});

const handler = async (data) => {
    const { workspaceId } = data;
    try {
        const session = await ensureWorkspaceAccess(workspaceId);

        const credsRes = await getDecryptedCredentials({ workspaceId });
        if (credsRes.error || !credsRes.data) {
            throw new Error(credsRes.error || "WhatsApp credentials not found");
        }
        const credentials = credsRes.data;

        const metaRes = await cloudApi.fetchFlowsMeta(credentials);
        if (!metaRes.success) throw new Error(metaRes.error);

        const metaFlows = metaRes.data || [];

        for (const metaFlow of metaFlows) {
            // Try to fetch the flow.json asset to get screen definitions
            let screens = null;
            let definition = null;
            try {
                const assetRes = await cloudApi.getFlowAssetMeta(credentials, metaFlow.id);
                if (assetRes.success && assetRes.data?.data?.length > 0) {
                    const assetUrl = assetRes.data.data[0]?.url;
                    if (assetUrl) {
                        const assetDataRes = await fetch(assetUrl);
                        if (assetDataRes.ok) {
                            definition = await assetDataRes.json();
                            screens = definition?.screens || null;
                        }
                    }
                }
            } catch (assetErr) {
                console.warn(`[SyncFlows] Could not fetch asset for ${metaFlow.id}:`, assetErr);
            }

            const existing = await db.whatsAppFlow.findFirst({
                where: {
                    workspaceId,
                    OR: [
                        { flowId: metaFlow.id },
                        { name: metaFlow.name, flowId: null }
                    ]
                }
            });

            const updateData = {
                flowId: metaFlow.id,
                status: metaFlow.status || 'DRAFT',
                updatedAt: new Date(),
            };

            if (screens) updateData.screens = screens;
            if (definition) updateData.definition = definition;
            if (metaFlow.categories) updateData.categories = metaFlow.categories;
            if (metaFlow.validation_errors) {
                updateData.metaValidationErrors = metaFlow.validation_errors;
            }

            if (existing) {
                await db.whatsAppFlow.update({
                    where: { id: existing.id },
                    data: updateData
                });
            } else {
                await db.whatsAppFlow.create({
                    data: {
                        workspaceId,
                        userId: session.user.userId || session.user.id,
                        name: metaFlow.name,
                        flowId: metaFlow.id,
                        status: metaFlow.status || 'DRAFT',
                        categories: metaFlow.categories || [],
                        screens: screens || [],
                        definition: definition || null,
                    }
                });
            }
        }

        revalidatePath(`/workspace/${workspaceId}/konnectx/flows`);
        return { success: true, count: metaFlows.length };

    } catch (error) {
        console.error("[SyncFlows] Error:", error);
        return { error: error.message || "Failed to sync flows with Meta" };
    }
};

export const syncMetaFlows = createSafeAction(SyncFlowsSchema, handler);
