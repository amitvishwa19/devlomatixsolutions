'use server'

import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { db } from "@/lib/db";
import { ensureWorkspaceAccess } from "@/lib/auth-utils";
import { symmetricDecrypt } from "@/lib/encryption";
import * as cloudApi from "../_lib/whatsapp-cloud-api";

const SendBrowserMessageSchema = z.object({
    workspaceId: z.string(),
    to: z.string(),
    text: z.string().optional(),
    interactive: z.any().optional(),
});

const handler = async (data) => {
    const { workspaceId, to, text, interactive } = data;

    try {
        const session = await ensureWorkspaceAccess(workspaceId);
        const userId = session.user.userId || session.user.id;

        // 1. Fetch Default Credential
        const credential = await db.credentials.findFirst({
            where: { 
                workspaceId, 
                userId, 
                platform: 'WHATSAPP_CLOUD',
                isDefault: true 
            }
        });

        if (!credential) return { error: "No default WhatsApp Cloud account found. Please configure one in Settings." };

        let cloudCreds = null;
        const stored = credential.credentials;
        if (stored) {
            if (typeof stored === 'string' && stored.includes(':')) {
                try { cloudCreds = JSON.parse(symmetricDecrypt(stored)); } catch (e) { }
            } else if (typeof stored === 'object' && stored.enc && typeof stored.enc === 'string' && stored.enc.includes(':')) {
                try { cloudCreds = JSON.parse(symmetricDecrypt(stored.enc)); } catch (e) { }
            } else if (typeof stored === 'object') {
                cloudCreds = stored;
            } else {
                try { cloudCreds = JSON.parse(stored); } catch (e) { }
            }
        }

        if (!cloudCreds || !cloudCreds.accessToken) return { error: "Failed to decrypt or find access token" };

        const phone = to.replace(/\D/g, '');
        let result;

        if (interactive) {
            result = await cloudApi.sendInteractiveMessage(cloudCreds, phone, interactive);
        } else {
            result = await cloudApi.sendTextMessage(cloudCreds, phone, text || "");
        }

        if (!result.success) {
            return { error: result.error || "Failed to send message via Cloud API" };
        }

        // 2. Log Message to DB
        await db.whatsAppMessage.create({
            data: {
                userId,
                jid: `${phone}@s.whatsapp.net`,
                text: text || "Interactive Message",
                fromMe: true,
                timestamp: BigInt(Math.floor(Date.now() / 1000)),
                status: 'SENT',
                metadata: { 
                    provider: 'WHATSAPP_CLOUD',
                    messageId: result.data?.messages?.[0]?.id 
                }
            }
        });

        return { success: true };
    } catch (error) {
        console.error("[WA Cloud Action] Send Message Error:", error);
        return { error: error.message || "Failed to send message" };
    }
};

export const sendBrowserMessage = createSafeAction(SendBrowserMessageSchema, handler);
