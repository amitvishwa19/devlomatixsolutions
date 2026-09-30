'use server'

import { db } from "@/lib/db";
import { ensureWorkspaceAccess } from "@/lib/auth-utils";
import { resolveWhatsAppCredentials } from "@/lib/whatsapp-credentials";
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
        const userId = session.user.userId || session.user.id;

        const { credentials } = await resolveWhatsAppCredentials({ workspaceId, userId });
        if (!credentials?.accessToken || !credentials?.wabaId) {
            throw new Error("WhatsApp Cloud credentials (Access Token or WABA ID) not configured");
        }

        const metaRes = await cloudApi.fetchFlowsMeta(credentials);
        if (!metaRes.success) {
            throw new Error(metaRes.error || "Failed to fetch flows from Meta");
        }

        const metaFlows = Array.isArray(metaRes.data) ? metaRes.data : [];
        const metaFlowIds = new Set(metaFlows.map(f => String(f.id)).filter(Boolean));

        // 1. Fetch local flows in this workspace
        const localFlows = await db.whatsAppFlow.findMany({
            where: { workspaceId }
        });

        // 2. Identify and remove flows that had a Meta flowId but were deleted on Meta
        const flowsToDelete = localFlows.filter(f => f.flowId && !metaFlowIds.has(String(f.flowId)));
        if (flowsToDelete.length > 0) {
            await db.whatsAppFlow.deleteMany({
                where: {
                    id: { in: flowsToDelete.map(f => f.id) }
                }
            });
        }

        // 3. Upsert flows from Meta into Database
        for (const metaFlow of metaFlows) {
            let screens = null;
            let definition = null;

            try {
                const assetRes = await cloudApi.getFlowAssetMeta(credentials, metaFlow.id);
                if (assetRes.success && assetRes.data?.data?.length > 0) {
                    const assetObj = assetRes.data.data[0];
                    const assetUrl = assetObj?.download_url || assetObj?.url;
                    if (assetUrl) {
                        const assetDataRes = await fetch(assetUrl, {
                            headers: { 'Authorization': `Bearer ${credentials.accessToken}` }
                        });
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
                        { flowId: String(metaFlow.id) },
                        { name: metaFlow.name }
                    ]
                }
            });

            const updateData = {
                flowId: String(metaFlow.id),
                status: metaFlow.status || 'DRAFT',
                name: existing?.name || metaFlow.name,
                categories: metaFlow.categories || existing?.categories || ["OTHER"],
                metaValidationErrors: metaFlow.validation_errors || null,
                updatedAt: new Date()
            };

            if (screens && screens.length > 0) {
                updateData.screens = screens;
            }
            if (definition) {
                updateData.definition = definition;
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
                        userId,
                        name: metaFlow.name,
                        flowId: String(metaFlow.id),
                        status: metaFlow.status || 'DRAFT',
                        categories: metaFlow.categories || ["OTHER"],
                        screens: screens || [],
                        definition: definition || null,
                        metaValidationErrors: metaFlow.validation_errors || null,
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
