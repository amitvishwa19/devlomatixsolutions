'use server'

import { db } from "@/lib/db";
import { ensureWorkspaceAccess } from "@/lib/auth-utils";
import { getDecryptedCredentials } from "../../settings/_actions/get-decrypted-credentials";
import * as cloudApi from '../../_lib/whatsapp-cloud-api';
import { revalidatePath } from "next/cache";
import { generateFlowDSL } from "../_lib/flow-utils";

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

        if (!flow) throw new Error("Flow not found in database");
        if (!flow.flowId) throw new Error("Flow has not been pushed to Meta yet. Please click 'Push' first.");

        // 2. Get Credentials
        const credsRes = await getDecryptedCredentials({ workspaceId });
        if (credsRes.error || !credsRes.data) {
            throw new Error(credsRes.error || "WhatsApp credentials not found");
        }
        const credentials = credsRes.data;
        if (!credentials?.accessToken) {
            throw new Error("Meta access token is missing or expired. Please check your account in Settings.");
        }

        const metaId = flow.flowId;

        // 3. Re-upload latest Flow JSON asset to ensure Meta has valid and updated schema before publishing
        const flowJson = generateFlowDSL(flow.screens, { endpointUrl: flow.endpointUrl });
        console.log(`📢 Syncing flow asset before publishing flow ${metaId}...`);
        const assetRes = await cloudApi.updateFlowAssetMeta(credentials, metaId, flowJson);
        if (!assetRes.success) {
            const validationErrors = assetRes.validationErrors || assetRes.data?.error?.error_data?.validation_errors || [];
            if (validationErrors.length > 0) {
                await db.whatsAppFlow.update({
                    where: { id: localFlowId },
                    data: { metaValidationErrors: JSON.stringify(validationErrors) }
                }).catch(() => {});
            }
            throw new Error(`Flow Asset Error: ${assetRes.error}`);
        }

        // 4. Publish on Meta
        console.log(`📢 Publishing flow ${metaId} on Meta...`);
        const publishRes = await cloudApi.publishFlowMeta(credentials, metaId);
        
        if (!publishRes.success) {
            const validationErrors = publishRes.validationErrors || publishRes.data?.error?.error_data?.validation_errors || [];
            if (validationErrors.length > 0) {
                await db.whatsAppFlow.update({
                    where: { id: localFlowId },
                    data: { metaValidationErrors: JSON.stringify(validationErrors) }
                }).catch(() => {});
            }
            throw new Error(`Meta Publish Error: ${publishRes.error}`);
        }

        // 5. Update Local DB
        await db.whatsAppFlow.update({
            where: { id: localFlowId },
            data: { 
                status: 'PUBLISHED',
                definition: flowJson,
                metaValidationErrors: null 
            }
        });

        revalidatePath(`/workspace/${workspaceId}/konnectx/flows`);
        return { success: true };

    } catch (error) {
        console.error("❌ PublishFlow Error:", error);
        return { error: error.message || "Failed to publish flow" };
    }
};

export const publishMetaFlow = createSafeAction(PublishFlowSchema, handler);
