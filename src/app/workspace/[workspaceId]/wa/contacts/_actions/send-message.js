'use server'

import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { db } from "@/lib/db";
import { ensureWorkspaceAccess } from "@/lib/auth-utils";
import { waManager } from "../../_lib/whatsapp-v2";

const SendMessageSchema = z.object({
    workspaceId: z.string(),
    phone: z.string().min(1, "Phone is required"),
    message: z.string().min(1, "Message is required"),
});

const handler = async (data) => {
    const { workspaceId, phone, message } = data;

    try {
        await ensureWorkspaceAccess(workspaceId);

        // Format phone number to JID
        let jid = phone.replace(/\D/g, '');
        if (!jid.endsWith('@s.whatsapp.net')) {
            jid = `${jid}@s.whatsapp.net`;
        }

        const result = await waManager.sendMessage(jid, { text: message });

        return { success: true, result };
    } catch (error) {
        console.error('Action Error (sendMessage):', error);
        return { error: error.message || 'Internal Server Error' };
    }
};

export const sendMessage = createSafeAction(SendMessageSchema, handler);
