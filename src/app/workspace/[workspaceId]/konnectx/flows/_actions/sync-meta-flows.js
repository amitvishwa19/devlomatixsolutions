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
        
        // 1. Get Credentials
        const credsRes = await getDecryptedCredentials({ workspaceId });
        if (credsRes.error || !credsRes.data) {
            throw new Error(credsRes.error || "WhatsApp credentials not found");
        }
        const credentials = credsRes.data;

        // 2. Fetch from Meta
        console.log("🔄 Fetching flows from Meta...");
        const metaRes = await cloudApi.fetchFlowsMeta(credentials);
        if (!metaRes.success) throw new Error(metaRes.error);

        const metaFlows = metaRes.data;

        // 3. Update Local DB for flows that exist on Meta
        for (const metaFlow of metaFlows) {
            await db.whatsAppFlow.updateMany({
                where: { 
                    workspaceId,
                    OR: [
                        { flowId: metaFlow.id },
                        { name: metaFlow.name, flowId: null }
                    ]
                },
                data: {
                    flowId: metaFlow.id,
                    status: metaFlow.status,
                    updatedAt: new Date()
                }
            });
        }

        revalidatePath(`/workspace/${workspaceId}/wa-cloud-api/flows`);
        return { success: true, count: metaFlows.length };

    } catch (error) {
        console.error("❌ SyncFlows Error:", error);
        return { error: error.message || "Failed to sync flows with Meta" };
    }
};

export const syncMetaFlows = createSafeAction(SyncFlowsSchema, handler);
