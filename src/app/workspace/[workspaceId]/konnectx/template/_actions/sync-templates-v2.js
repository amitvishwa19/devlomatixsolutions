'use server'

import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { db } from "@/lib/db";
import { ensureWorkspaceAccess } from "@/lib/auth-utils";
import * as cloudApi from "@/app/workspace/[workspaceId]/konnectx/_lib/whatsapp-cloud-api";
import { symmetricDecrypt } from "@/lib/encryption";

const SyncTemplatesSchema = z.object({
    workspaceId: z.string(),
});

const handler = async (data) => {
    const { workspaceId } = data;

    try {
        const session = await ensureWorkspaceAccess(workspaceId);
        const userId = session.user.userId || session.user.id;

        // 1. Fetch Credentials (with fallback to latest if no default is set)
        let credentials = await db.credentials.findMany({
            where: { userId, platform: 'WHATSAPP_CLOUD', isDefault: true }
        });

        if (credentials.length === 0) {
            const fallback = await db.credentials.findFirst({
                where: { userId, platform: 'WHATSAPP_CLOUD' },
                orderBy: { updatedAt: 'desc' }
            });
            if (fallback) credentials = [fallback];
        }

        if (credentials.length === 0) {
            return { error: "No WhatsApp Cloud credentials found" };
        }

        const syncResults = [];
        let totalMetaTemplates = 0;

        for (const credential of credentials) {
            let cloudCredentials = null;
            const stored = credential.credentials;

            if (stored) {
                if (typeof stored === 'string' && stored.includes(':')) {
                    try { cloudCredentials = JSON.parse(symmetricDecrypt(stored)); } catch (e) { }
                } else if (typeof stored === 'object' && stored.enc && typeof stored.enc === 'string' && stored.enc.includes(':')) {
                    try { cloudCredentials = JSON.parse(symmetricDecrypt(stored.enc)); } catch (e) { }
                } else if (typeof stored === 'object') {
                    cloudCredentials = stored;
                } else {
                    try { cloudCredentials = JSON.parse(stored); } catch (e) { }
                }
            }

            if (cloudCredentials?.enc) {
                try { cloudCredentials = JSON.parse(symmetricDecrypt(cloudCredentials.enc)); } catch (e) { }
            }

            if (!cloudCredentials || !cloudCredentials.accessToken || !cloudCredentials.wabaId) continue;

            const metaRes = await cloudApi.fetchTemplates(cloudCredentials);
            if (!metaRes.success || !Array.isArray(metaRes.data)) continue;

            const metaTemplates = metaRes.data;
            totalMetaTemplates += metaTemplates.length;

            for (const metaT of metaTemplates) {
                try {
                    const bodyComp = metaT.components?.find(c => c.type === 'BODY');
                    const footerComp = metaT.components?.find(c => c.type === 'FOOTER');
                    const buttonComp = metaT.components?.find(c => c.type === 'BUTTONS');
                    const headerComp = metaT.components?.find(c => c.type === 'HEADER');

                    const templateData = {
                        userId,
                        templateId: metaT.id,
                        name: metaT.name,
                        templateName: metaT.name,
                        category: metaT.category,
                        language: metaT.language,
                        status: metaT.status,
                        type: headerComp?.format || 'TEXT',
                        body: bodyComp?.text || "",
                        footer: footerComp?.text || null,
                        buttons: buttonComp?.buttons || [],
                        metadata: {
                            headerText: headerComp?.format === 'TEXT' ? (headerComp.text || headerComp.example?.header_text?.[0]) : null,
                            mediaUrl: ['IMAGE', 'VIDEO', 'DOCUMENT'].includes(headerComp?.format)
                                ? (headerComp.example?.header_handle?.[0] || headerComp.example?.header_url?.[0] || null)
                                : null
                        },
                        isDefault: true,
                        platform: 'WHATSAPP_CLOUD',
                        phoneNumberId: String(cloudCredentials.phoneNumberId || cloudCredentials.phone_number_id || "")
                    };

                    const existing = await db.messageTemplate.findFirst({
                        where: {
                            userId,
                            name: metaT.name,
                            language: metaT.language,
                            phoneNumberId: cloudCredentials.phoneNumberId
                        }
                    });

                    if (existing) {
                        await db.messageTemplate.update({ where: { id: existing.id }, data: templateData });
                    } else {
                        await db.messageTemplate.create({ data: templateData });
                    }
                    syncResults.push(metaT.name);
                } catch (error) {
                    console.error(`Failed to sync ${metaT.name}:`, error);
                }
            }
        }

        return {
            success: true,
            count: totalMetaTemplates,
            synced: syncResults.length,
            message: `Successfully synchronized ${syncResults.length} templates.`
        };

    } catch (error) {
        return { error: error.message || "Failed to sync templates" };
    }
};

export const syncTemplates = createSafeAction(SyncTemplatesSchema, handler);
