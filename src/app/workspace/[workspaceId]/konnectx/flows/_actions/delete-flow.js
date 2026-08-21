'use server'

import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { db } from "@/lib/db";
import { ensureWorkspaceAccess } from "@/lib/auth-utils";
import { getDecryptedCredentials } from "../../settings/_actions/get-decrypted-credentials";
import * as cloudApi from '../../_lib/whatsapp-cloud-api';

const DeleteFlowSchema = z.object({
    workspaceId: z.string(),
    id: z.string(),
});

const handler = async (data) => {
    const { workspaceId, id } = data;

    try {
        const session = await ensureWorkspaceAccess(workspaceId);
        const userId = session.user.userId || session.user.id;

        const flow = await db.whatsAppFlow.findFirst({
            where: { id, workspaceId }
        });

        if (!flow) throw new Error("Flow not found");

        // Delete from Meta if it has a flowId
        if (flow.flowId) {
            try {
                const credsRes = await getDecryptedCredentials({ workspaceId });
                if (credsRes.success && credsRes.data) {
                    await cloudApi.deleteFlowMeta(credsRes.data, flow.flowId);
                }
            } catch (metaErr) {
                console.warn("[DeleteFlow] Meta delete failed (non-fatal):", metaErr);
            }
        }

        await db.whatsAppFlow.delete({
            where: { id }
        });

        return { success: true };
    } catch (error) {
        return { error: error.message || "Failed to delete flow" };
    }
};

export const deleteFlow = createSafeAction(DeleteFlowSchema, handler);
