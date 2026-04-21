'use server'

import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { ensureWorkspaceAccess } from "@/lib/auth-utils";
import { waManager } from '../_lib/whatsapp-v2';

const SendBrowserMessageSchema = z.object({
    workspaceId: z.string(),
    to: z.string(),
    text: z.string().optional(),
    interactive: z.any().optional(),
    image: z.any().optional(),
    video: z.any().optional(),
    audio: z.any().optional(),
    document: z.any().optional(),
    location: z.any().optional(),
    caption: z.string().optional(),
});

const handler = async (data) => {
    const { workspaceId, to, text } = data;

    try {
        await ensureWorkspaceAccess(workspaceId);

        if (!to || (!text && !data.interactive)) {
            return { error: 'Missing recipient "to" or message content.' };
        }

        // Format phone number to JID
        let jid = to.replace(/\D/g, '');
        if (!jid.endsWith('@s.whatsapp.net')) {
            jid = `${jid}@s.whatsapp.net`;
        }

        // Prepare payload
        const sendPayload = { ...data };
        delete sendPayload.workspaceId;
        delete sendPayload.to;

        const result = await waManager.sendMessage(jid, sendPayload);

        return { success: true, result };
    } catch (error) {
        return { error: error.message || "Failed to send message via browser" };
    }
};

export const sendBrowserMessage = createSafeAction(SendBrowserMessageSchema, handler);
