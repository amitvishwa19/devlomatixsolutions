'use server'

import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { db } from "@/lib/db";
import { ensureWorkspaceAccess } from "@/lib/auth-utils";
import * as cloudApi from "../../_lib/whatsapp-cloud-api";

const SendMessageSchema = z.object({
    workspaceId: z.string(),
    phone: z.string().min(1, "Phone is required"),
    message: z.string().min(1, "Message is required"),
});

const handler = async (data) => {
    const { workspaceId, phone, message } = data;

    try {
        await ensureWorkspaceAccess(workspaceId);

        const credential = await db.whatsAppCredential.findFirst({
            where: { workspaceId, isActive: true }
        });

        if (!credential) throw new Error("No active Cloud API credential found");

        const phoneNum = phone.replace(/\D/g, '');
        const result = await cloudApi.sendTextMessage(credential, phoneNum, message);

        if (!result.success) throw new Error(result.error);

        return { success: true, result: result.data };
    } catch (error) {
        console.error('Action Error (sendMessage):', error);
        return { error: error.message || 'Internal Server Error' };
    }
};

export const sendMessage = createSafeAction(SendMessageSchema, handler);
