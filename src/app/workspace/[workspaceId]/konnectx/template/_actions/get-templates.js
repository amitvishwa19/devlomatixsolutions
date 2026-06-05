'use server'

import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { db } from "@/lib/db";
import { ensureWorkspaceAccess } from "@/lib/auth-utils";
import { symmetricDecrypt } from "@/lib/encryption";

const GetTemplatesSchema = z.object({
    workspaceId: z.string(),
});

const handler = async (data) => {
    const { workspaceId } = data;
    console.log("[getTemplates] Starting handler for workspaceId:", workspaceId);

    try {
        console.log("[getTemplates] Checking workspace access...");
        const session = await ensureWorkspaceAccess(workspaceId);
        console.log("[getTemplates] Session found:", session ? "yes" : "no");
        if (!session) {
            console.log("[getTemplates] No session found, throwing error...");
            throw new Error("No active session found");
        }
        const userId = session.user?.userId || session.user?.id;
        console.log("[getTemplates] userId:", userId);
        if (!userId) {
            throw new Error("User ID not found in session");
        }

        // 1. Find Credential (with fallback to latest if no default is set)
        console.log("[getTemplates] Querying default credential...");
        let defaultCredential = await db.credentials.findFirst({
            where: { userId, platform: 'WHATSAPP_CLOUD', isDefault: true }
        });

        if (!defaultCredential) {
            console.log("[getTemplates] No default credential, querying latest WhatsApp credential...");
            defaultCredential = await db.credentials.findFirst({
                where: { userId, platform: 'WHATSAPP_CLOUD' },
                orderBy: { updatedAt: 'desc' }
            });
        }

        console.log("[getTemplates] Default credential found:", defaultCredential ? defaultCredential.id : "none");
        if (!defaultCredential) {
            console.log("[getTemplates] Returning empty templates list");
            return { data: { success: true, templates: [] } };
        }

        // Extract active Phone ID
        let cloudCreds = null;
        const stored = defaultCredential.credentials;
        console.log("[getTemplates] Stored credentials length/type:", stored ? typeof stored : "null");
        if (stored) {
            if (typeof stored === 'string' && stored.includes(':')) {
                try { cloudCreds = JSON.parse(symmetricDecrypt(stored)); } catch (e) { console.error("[getTemplates] Decryption error 1:", e); }
            } else if (typeof stored === 'object' && stored.enc && typeof stored.enc === 'string' && stored.enc.includes(':')) {
                try { cloudCreds = JSON.parse(symmetricDecrypt(stored.enc)); } catch (e) { console.error("[getTemplates] Decryption error 2:", e); }
            } else if (typeof stored === 'object') {
                cloudCreds = stored;
            } else {
                try { cloudCreds = JSON.parse(stored); } catch (e) { console.error("[getTemplates] JSON parse error:", e); }
            }
        }
        
        if (cloudCreds?.enc) {
            try { cloudCreds = JSON.parse(symmetricDecrypt(cloudCreds.enc)); } catch (e) { console.error("[getTemplates] Decryption error 3:", e); }
        }
        const activePhoneId = String(cloudCreds?.phoneNumberId || cloudCreds?.phone_number_id || "");
        console.log("[getTemplates] activePhoneId:", activePhoneId);

        // 2. Fetch templates matching ONLY this active phoneId
        console.log("[getTemplates] Querying message templates in DB...");
        const templates = await db.messageTemplate.findMany({
            where: activePhoneId ? {
                userId,
                phoneNumberId: activePhoneId
            } : {
                userId,
                OR: [
                    { phoneNumberId: null },
                    { phoneNumberId: "" }
                ]
            },
            orderBy: { createdAt: 'desc' }
        });
        console.log("[getTemplates] Templates query result count:", templates.length);

        const result = {
            data: {
                success: true,
                templates: JSON.parse(JSON.stringify(templates))
            }
        };
        console.log("[getTemplates] Returning successful result");
        return result;
    } catch (error) {
        console.error("[getTemplates] Exception caught in handler:", error);
        return { error: String(error.message || error) };
    }
};

export const getTemplates = createSafeAction(GetTemplatesSchema, handler);
