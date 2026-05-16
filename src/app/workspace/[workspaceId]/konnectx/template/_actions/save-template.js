'use server'

import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { db } from "@/lib/db";
import { ensureWorkspaceAccess } from "@/lib/auth-utils";
import { symmetricDecrypt } from "@/lib/encryption";

const SaveTemplateSchema = z.object({
    workspaceId: z.string(),
    id: z.string().optional(),
    name: z.string(),
    category: z.string().optional().nullable(),
    language: z.string().optional(),
    type: z.string().optional(),
    body: z.string().optional().nullable(),
    footer: z.string().optional().nullable(),
    buttons: z.array(z.any()).optional(),
    metadata: z.any().optional().nullable(),
    status: z.string().optional(),
    templateName: z.string().optional(),
});

const handler = async (data) => {
    const { workspaceId, id, name, category, language, type, body, footer, buttons, metadata, status, templateName } = data;
    console.log("[SaveTemplate] Incoming data:", { name, type, status, id });

    try {
        const session = await ensureWorkspaceAccess(workspaceId);
        const userId = session.user.userId || session.user.id;

        // Find the active phoneNumberId for this workspace (with fallback)
        let credential = await db.credentials.findFirst({
            where: { workspaceId, platform: 'WHATSAPP_CLOUD', isDefault: true }
        });

        if (!credential) {
            credential = await db.credentials.findFirst({
                where: { workspaceId, platform: 'WHATSAPP_CLOUD' },
                orderBy: { updatedAt: 'desc' }
            });
        }
        
        let phoneNumberId = null;
        if (credential && credential.credentials) {
            let cloudCreds = null;
            const stored = credential.credentials;
            
            if (typeof stored === 'string' && stored.includes(':')) {
                try { cloudCreds = JSON.parse(symmetricDecrypt(stored)); } catch (e) { }
            } else if (typeof stored === 'object' && stored.enc && typeof stored.enc === 'string' && stored.enc.includes(':')) {
                try { cloudCreds = JSON.parse(symmetricDecrypt(stored.enc)); } catch (e) { }
            } else if (typeof stored === 'object') {
                cloudCreds = stored;
            } else {
                try { cloudCreds = JSON.parse(stored); } catch (e) { }
            }

            if (cloudCreds?.enc) {
                try { cloudCreds = JSON.parse(symmetricDecrypt(cloudCreds.enc)); } catch (e) { }
            }

            phoneNumberId = String(cloudCreds?.phoneNumberId || cloudCreds?.phone_number_id || "");
        }

        if (id) {
            const existing = await db.messageTemplate.findUnique({ where: { id } });
            if (!existing || existing.userId !== userId) {
                return { error: "Template not found or unauthorized" };
            }
            const updated = await db.messageTemplate.update({
                where: { id },
                data: {
                    name,
                    category: category || "UTILITY",
                    language: language || "en_US",
                    type: type || "TEXT",
                    body: body || "",
                    footer: footer || null,
                    buttons: buttons || [],
                    metadata: metadata || null,
                    status: status || "DRAFT",
                    templateName: templateName || name,
                    phoneNumberId: phoneNumberId || existing.phoneNumberId // Preserve if not found
                }
            });
            console.log("[SaveTemplate] Update success:", updated.id);
            return { success: true, template: updated };
        } else {
            const existingName = await db.messageTemplate.findFirst({ 
                where: { userId, name, phoneNumberId } 
            });
            if (existingName) {
                return { error: "A template with this name already exists for this phone number." };
            }
            const template = await db.messageTemplate.create({
                data: {
                    userId,
                    name,
                    category: category || "UTILITY",
                    language: language || "en_US",
                    type: type || "TEXT",
                    body: body || "",
                    footer: footer || null,
                    buttons: buttons || [],
                    metadata: metadata || null,
                    status: "DRAFT",
                    templateName: templateName || name,
                    phoneNumberId
                }
            });
            console.log("[SaveTemplate] Create success:", template.id);
            return { success: true, template };
        }
    } catch (error) {
        console.error("[SaveTemplate] Error:", error);
        if (error.code === 'P2002') {
            return { error: "A template with this name/language already exists for this account." };
        }
        return { error: error.message || "Failed to save template" };
    }
};

export const saveTemplate = createSafeAction(SaveTemplateSchema, handler);
