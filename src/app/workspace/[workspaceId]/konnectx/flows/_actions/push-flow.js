'use server'

import { db } from "@/lib/db";
import { ensureWorkspaceAccess } from "@/lib/auth-utils";
import { getDecryptedCredentials } from "../../settings/_actions/get-decrypted-credentials";
import * as cloudApi from '../../_lib/whatsapp-cloud-api';
import { revalidatePath } from "next/cache";
import { generateFlowDSL } from "../_lib/flow-utils";

import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";

const PushFlowSchema = z.object({
    workspaceId: z.string(),
    id: z.string(),
});

const handler = async (data) => {
    const { workspaceId, id: localFlowId } = data;
    try {
        const session = await ensureWorkspaceAccess(workspaceId);
        const userId = session.user.userId || session.user.id;

        // 1. Get Local Flow
        if (!localFlowId) throw new Error("Flow ID is required");

        const flow = await db.whatsAppFlow.findFirst({
            where: { id: localFlowId, workspaceId }
        });

        if (!flow) throw new Error("Flow not found");

        // 2. Get Credentials
        const credsRes = await getDecryptedCredentials({ workspaceId });
        if (credsRes.error || !credsRes.data) {
            throw new Error(credsRes.error || "WhatsApp credentials not found or invalid");
        }
        const credentials = credsRes.data;

        let metaId = flow.flowId;

        // 3. Create on Meta if not exists
        if (!metaId) {
            console.log("🚀 Creating flow on Meta...");
            // Normalize name: lowercase, numbers and underscores only
            const normalizedName = flow.name.toLowerCase()
                .trim()
                .replace(/[^a-z0-9\s]/g, '') // Remove special chars
                .replace(/\s+/g, '_')        // Spaces to underscores
                .replace(/^_+|_+$/g, '');   // Trim underscores
            const categories = flow.categories?.length > 0 ? flow.categories : ["OTHER"];
            const createRes = await cloudApi.createFlowMeta(credentials, normalizedName, categories);
            if (!createRes.success) throw new Error(`Meta Create Error: ${createRes.error}`);
            metaId = createRes.data.id;
        }

        // 4. Upload Asset (flow.json)
        console.log("📤 Generating and uploading flow assets to Meta...");
        const flowJson = generateFlowDSL(flow.screens);
        
        const uploadRes = await cloudApi.updateFlowAssetMeta(credentials, metaId, flowJson);
        if (!uploadRes.success) throw new Error(`Meta Upload Error: ${uploadRes.error}`);

        // 5. Update Local DB
        await db.whatsAppFlow.update({
            where: { id: localFlowId },
            data: { 
                flowId: metaId,
                definition: flowJson, // Save the generated JSON back to DB
                status: 'DRAFT' // Meta starts as DRAFT after asset upload
            }
        });

        revalidatePath(`/workspace/${workspaceId}/wa-cloud-api/flows`);
        return { success: true, flowId: metaId };

    } catch (error) {
        console.error("❌ PushFlow Error:", error);
        return { error: error.message || "Failed to push flow to Meta" };
    }
};

export const pushFlowToMeta = createSafeAction(PushFlowSchema, handler);
