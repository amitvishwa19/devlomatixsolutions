'use server'

import { db } from "@/lib/db";
import { ensureWorkspaceAccess } from "@/lib/auth-utils";
import { getDecryptedCredentials } from "../../settings/_actions/get-decrypted-credentials";
import * as cloudApi from '../../_lib/whatsapp-cloud-api';
import { revalidatePath } from "next/cache";

import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";

const PublishFlowSchema = z.object({
    workspaceId: z.string(),
    id: z.string(),
});

const handler = async (data) => {
    const { workspaceId, id: localFlowId } = data;
    try {
        const session = await ensureWorkspaceAccess(workspaceId);
        
        // 1. Get Local Flow
        if (!localFlowId) throw new Error("Flow ID is required");

        const flow = await db.whatsAppFlow.findFirst({
            where: { id: localFlowId, workspaceId }
        });

        if (!flow || !flow.flowId) throw new Error("Flow not pushed to Meta yet");

        // 2. Get Credentials
        const credsRes = await getDecryptedCredentials({ workspaceId });
        if (credsRes.error || !credsRes.data) {
            throw new Error(credsRes.error || "WhatsApp credentials not found");
        }
        const credentials = credsRes.data;

        // 3. Publish on Meta
        console.log(`📢 Publishing flow ${flow.flowId} on Meta...`);
        const publishRes = await cloudApi.publishFlowMeta(credentials, flow.flowId);
        
        if (!publishRes.success) {
            throw new Error(`Meta Publish Error: ${publishRes.error}`);
        }

        // 4. Update Local DB
        await db.whatsAppFlow.update({
            where: { id: localFlowId },
            data: { status: 'PUBLISHED' }
        });

        revalidatePath(`/workspace/${workspaceId}/wa-cloud-api/flows`);
        return { success: true };

    } catch (error) {
        console.error("❌ PublishFlow Error:", error);
        return { error: error.message || "Failed to publish flow" };
    }
};

export const publishMetaFlow = createSafeAction(PublishFlowSchema, handler);
