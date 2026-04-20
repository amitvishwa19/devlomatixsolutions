'use server'

import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { ensureWorkspaceAccess } from "@/lib/auth-utils";
import { waManager } from "../../wa-api/_lib/whatsapp-v2";

const SendMessageSchema = z.object({
    workspaceId: z.string(),
    jid: z.string(),
    text: z.string(),
});

const handler = async (data) => {
    const { workspaceId, jid, text } = data;
    try {
        await ensureWorkspaceAccess(workspaceId);
        
        console.log("[WA Business Action] Sending message to:", jid);
        const result = await waManager.sendMessage(jid, text);
        
        return { data: { success: true, result } };
    } catch (error) {
        console.error("[WA Business Action] Send Message Error:", error);
        return { error: error.message || "Failed to send message" };
    }
};

export const sendBrowserMessage = createSafeAction(SendMessageSchema, handler);
