'use server'

import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { db } from "@/lib/db";
import { ensureWorkspaceAccess } from "@/lib/auth-utils";
import * as cloudApi from "../../_lib/whatsapp-cloud-api";
import { symmetricDecrypt } from "@/lib/encryption";

const SendMessageSchema = z.object({
    workspaceId: z.string(),
    phone: z.string().min(1, "Phone is required"),
    message: z.string().min(1, "Message is required"),
});

const handler = async (data) => {
    const { workspaceId, phone, message } = data;

    try {
        const session = await ensureWorkspaceAccess(workspaceId);
        const userId = session.user.userId || session.user.id;

        let credential = await db.credentials.findFirst({
            where: { workspaceId, userId, platform: 'WHATSAPP_CLOUD', isDefault: true }
        });

        if (!credential) {
            credential = await db.credentials.findFirst({
                where: { workspaceId, userId, platform: 'WHATSAPP_CLOUD' },
                orderBy: { updatedAt: 'desc' }
            });
        }

        if (!credential) throw new Error("No active Cloud API credential found");

        let cloudCredentials = credential.credentials;
        if (typeof cloudCredentials === 'string' && cloudCredentials.includes(':')) {
            cloudCredentials = JSON.parse(symmetricDecrypt(cloudCredentials));
        } else if (typeof cloudCredentials === 'string') {
            cloudCredentials = JSON.parse(cloudCredentials);
        }
        if (cloudCredentials?.enc) {
            cloudCredentials = JSON.parse(symmetricDecrypt(cloudCredentials.enc));
        }

        const phoneNum = phone.replace(/\D/g, '');
        const result = await cloudApi.sendTextMessage(cloudCredentials, phoneNum, message);

        if (!result.success) throw new Error(result.error);

        return { success: true, result: result.data };
    } catch (error) {
        console.error('Action Error (sendMessage):', error);
        return { error: error.message || 'Internal Server Error' };
    }
};

export const sendMessage = createSafeAction(SendMessageSchema, handler);
