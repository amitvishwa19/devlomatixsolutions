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

function sanitizeFlowName(name) {
    return name.toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s_-]/g, '')
        .replace(/\s+/g, '_')
        .replace(/^_+|_+$/g, '')
        .slice(0, 128) || 'flow';
}

const handler = async (data) => {
    const { workspaceId, id: localFlowId } = data;
    try {
        const session = await ensureWorkspaceAccess(workspaceId);
        const userId = session.user.userId || session.user.id;

        const flow = await db.whatsAppFlow.findFirst({
            where: { id: localFlowId, workspaceId }
        });

        if (!flow) throw new Error("Flow not found");

        const credsRes = await getDecryptedCredentials({ workspaceId });
        if (credsRes.error || !credsRes.data) {
            throw new Error(credsRes.error || "WhatsApp credentials not found or invalid");
        }
        const credentials = credsRes.data;

        let metaId = flow.flowId;

        // 3. Create or Update on Meta
        if (!metaId) {
            const normalizedName = sanitizeFlowName(flow.name);
            const categories = flow.categories?.length > 0 ? flow.categories : ["OTHER"];
            const createRes = await cloudApi.createFlowMeta(credentials, normalizedName, categories);
            if (!createRes.success) throw new Error(`Meta Create Error: ${createRes.error}`);
            metaId = createRes.data.id;
        } else {
            // Update flow metadata on Meta (name, categories)
            const updateRes = await cloudApi.updateFlowMeta(credentials, metaId, {
                name: sanitizeFlowName(flow.name),
                categories: flow.categories?.length > 0 ? flow.categories : ["OTHER"]
            });
            if (!updateRes.success) {
                console.warn("[PushFlow] Meta metadata update failed (non-fatal):", updateRes.error);
            }
        }

        // 4. Generate and upload flow.json asset
        const flowJson = generateFlowDSL(flow.screens, { endpointUrl: flow.endpointUrl });
        const uploadRes = await cloudApi.updateFlowAssetMeta(credentials, metaId, flowJson);
        if (!uploadRes.success) throw new Error(`Meta Upload Error: ${uploadRes.error}`);

        // 5. Update Local DB
        await db.whatsAppFlow.update({
            where: { id: localFlowId },
            data: {
                flowId: metaId,
                definition: flowJson,
                status: 'DRAFT'
            }
        });

        revalidatePath(`/workspace/${workspaceId}/konnectx/flows`);
        return { success: true, flowId: metaId };

    } catch (error) {
        console.error("[PushFlow] Error:", error);
        return { error: error.message || "Failed to push flow to Meta" };
    }
};

export const pushFlowToMeta = createSafeAction(PushFlowSchema, handler);
