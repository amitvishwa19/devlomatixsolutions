'use server'

import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { db } from "@/lib/db";
import { ensureWorkspaceAccess } from "@/lib/auth-utils";

const GetTemplatesSchema = z.object({
    workspaceId: z.string(),
});

const handler = async (data) => {
    const { workspaceId } = data;

    try {
        const session = await ensureWorkspaceAccess(workspaceId);
        const userId = session.user.userId || session.user.id;

        // Find the default WhatsApp Cloud credential for this user
        // We look for workspaceId first, then fallback to userId-only if workspaceId isn't tagged yet
        let credential = await db.credentials.findFirst({
            where: { 
                workspaceId, 
                platform: 'WHATSAPP_CLOUD',
                isDefault: true 
            }
        });

        if (!credential) {
            credential = await db.credentials.findFirst({
                where: { 
                    userId, 
                    platform: 'WHATSAPP_CLOUD',
                    isDefault: true 
                }
            });
        }

        let phoneNumberId = null;
        if (credential && credential.credentials) {
            const stored = credential.credentials;
            if (typeof stored === 'string') {
                try {
                    const decrypted = stored.includes(':') ? JSON.parse(require("@/lib/encryption").symmetricDecrypt(stored)) : JSON.parse(stored);
                    phoneNumberId = decrypted.phoneNumberId;
                } catch (e) {}
            } else {
                phoneNumberId = stored.phoneNumberId;
            }
        }

        // If we have a phoneNumberId, we ONLY show templates for that number.
        // If we don't have one, we show nothing (to avoid showing the mixed legacy templates).
        if (!phoneNumberId) {
             return {
                data: {
                    success: true,
                    templates: []
                }
            };
        }

        const templates = await db.messageTemplate.findMany({
            where: { 
                userId,
                phoneNumberId: phoneNumberId
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
