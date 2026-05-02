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

    try {
        const session = await ensureWorkspaceAccess(workspaceId);
        const userId = session.user.userId || session.user.id;

        // 1. Find Default Credential
        const defaultCredential = await db.credentials.findFirst({
            where: { userId, platform: 'WHATSAPP_CLOUD', isDefault: true }
        });

        if (!defaultCredential) {
            return { data: { success: true, templates: [] } };
        }

        // Extract active Phone ID
        let cloudCreds = null;
        const stored = defaultCredential.credentials;
        if (typeof stored === 'string' && stored.includes(':')) {
            try { cloudCreds = JSON.parse(symmetricDecrypt(stored)); } catch (e) { }
        } else if (typeof stored === 'string') {
            try { cloudCreds = JSON.parse(stored); } catch (e) { }
        } else { cloudCreds = stored; }
        
        if (cloudCreds?.enc) {
            try { cloudCreds = JSON.parse(symmetricDecrypt(cloudCreds.enc)); } catch (e) { }
        }
        const activePhoneId = String(cloudCreds?.phoneNumberId || cloudCreds?.phone_number_id || "");

        // 2. Fetch templates matching ONLY this active phoneId
        const templates = await db.messageTemplate.findMany({
            where: { 
                userId,
                phoneNumberId: activePhoneId
            },
            orderBy: { createdAt: 'desc' }
        });

        return {
            data: {
                success: true,
                templates: JSON.parse(JSON.stringify(templates))
            }
        };
    } catch (error) {
        return { error: error.message || "Failed to fetch templates" };
    }
};

export const getTemplates = createSafeAction(GetTemplatesSchema, handler);
