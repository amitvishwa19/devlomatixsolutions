'use server'

import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { ensureWorkspaceAccess } from "@/lib/auth-utils";
import { waManager } from "../../wa-api/_lib/whatsapp-v2";

const SendMessageSchema = z.object({
    workspaceId: z.string(),
    to: z.string(),
    body: z.string(),
    type: z.string().optional(),
});

const handler = async (data) => {
    const { workspaceId, to, body } = data;
    try {
        await ensureWorkspaceAccess(workspaceId);
        
        console.log("[WA Business Action] Sending message to:", to);
        // waManager.sendMessage(jid, text)
        const result = await waManager.sendMessage(to, body);
        
        return { data: { success: true, result } };
    } catch (error) {
        console.error("[WA Business Action] Send Message Error:", error);
        return { error: error.message || "Failed to send message" };
    }
};

export const sendMessage = createSafeAction(SendMessageSchema, handler);
