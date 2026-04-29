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

        // 1. Fetch ALL Cloud API Credentials for this user
        const credentials = await db.credentials.findMany({
            where: { userId, platform: 'WHATSAPP_CLOUD' }
        });

        if (credentials.length === 0) {
            return {
                data: { success: true, templates: [] }
            };
        }

        const phoneIds = [];
        for (const cred of credentials) {
            if (!cred.credentials) continue;
            let phoneNumberId = null;
            const stored = cred.credentials;
            if (typeof stored === 'string') {
                try {
                    const decrypted = stored.includes(':') ? JSON.parse(symmetricDecrypt(stored)) : JSON.parse(stored);
                    phoneNumberId = decrypted.phoneNumberId;
                } catch (e) {}
            } else {
                phoneNumberId = stored.phoneNumberId;
            }
            if (phoneNumberId) phoneIds.push(phoneNumberId);
        }

        // 2. Fetch templates matching ANY of these phoneIds, or those with null phoneId (legacy)
        const templates = await db.messageTemplate.findMany({
            where: { 
                userId,
                OR: [
                    { phoneNumberId: { in: phoneIds } },
                    { phoneNumberId: null }
                ]
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
