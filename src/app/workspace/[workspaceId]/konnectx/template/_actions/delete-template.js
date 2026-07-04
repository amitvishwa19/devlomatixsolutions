'use server'

import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { db } from "@/lib/db";
import { ensureWorkspaceAccess } from "@/lib/auth-utils";
import { symmetricDecrypt } from "@/lib/encryption";

const DeleteTemplateSchema = z.object({
    workspaceId: z.string(),
    id: z.string(),
});

const handler = async (data) => {
    const { workspaceId, id } = data;

    try {
        const session = await ensureWorkspaceAccess(workspaceId);
        const userId = session.user.userId || session.user.id;

        const template = await db.messageTemplate.findUnique({
            where: { id },
            select: { id: true, userId: true, templateId: true, name: true, language: true, platform: true }
        });

        if (!template || template.userId !== userId) {
            return { error: "Template not found or unauthorized" };
        }

        let metaDeleted = false;

        if (template.templateId && template.platform === 'WHATSAPP_CLOUD') {
            try {
                const credential = await db.credentials.findFirst({
                    where: { workspaceId, platform: 'WHATSAPP_CLOUD', isDefault: true }
                }) || await db.credentials.findFirst({
                    where: { workspaceId, platform: 'WHATSAPP_CLOUD' },
                    orderBy: { updatedAt: 'desc' }
                });

                if (credential?.credentials) {
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

                    if (cloudCreds?.accessToken && cloudCreds?.wabaId) {
                        const deleteUrl = `https://graph.facebook.com/v17.0/${cloudCreds.wabaId}/message_templates?name=${encodeURIComponent(template.name)}&access_token=${cloudCreds.accessToken}`;
                        const metaRes = await fetch(deleteUrl, { method: 'DELETE' });
                        const metaResult = await metaRes.json();

                        if (metaRes.ok && !metaResult.error) {
                            metaDeleted = true;
                            console.log(`[DeleteTemplate] Deleted from Meta: ${template.name}`);
                        } else {
                            console.warn(`[DeleteTemplate] Meta delete failed:`, metaResult.error?.message || metaResult);
                        }
                    }
                }
            } catch (metaError) {
                console.warn(`[DeleteTemplate] Meta delete error:`, metaError.message);
            }
        }

        await db.messageTemplate.delete({
            where: { id }
        });

        return {
            data: {
                success: true,
                metaDeleted
            }
        };
    } catch (error) {
        console.error("[DeleteTemplate] Error:", error);
        return { error: error.message || "Failed to delete template" };
    }
};

export const deleteTemplate = createSafeAction(DeleteTemplateSchema, handler);
