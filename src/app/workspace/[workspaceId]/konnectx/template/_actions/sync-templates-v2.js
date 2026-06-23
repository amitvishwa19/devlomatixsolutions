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

            // 1. Build a set of Meta template keys (name_language) for comparison
            const metaTemplateKeys = new Set(
                metaTemplates.map(t => `${t.name.toLowerCase()}_${t.language}`)
            );

            // 2. Fetch all local synchronized templates for this phone number and user
            const currentPhoneId = String(cloudCredentials.phoneNumberId || cloudCredentials.phone_number_id || "");
            const localTemplates = await db.messageTemplate.findMany({
                where: {
                    userId,
                    phoneNumberId: currentPhoneId,
                    isDefault: true,
                    platform: 'WHATSAPP_CLOUD'
                }
            });

            // 3. Identify and delete templates no longer on Meta Cloud
            const templatesToDelete = localTemplates.filter(t => {
                const key = `${t.name.toLowerCase()}_${t.language}`;
                return !metaTemplateKeys.has(key);
            });

            if (templatesToDelete.length > 0) {
                console.log(`[Template Sync] Deleting ${templatesToDelete.length} templates that were deleted on Meta:`, templatesToDelete.map(t => t.name));
                await db.messageTemplate.deleteMany({
                    where: {
                        id: {
                            in: templatesToDelete.map(t => t.id)
                        }
                    }
                });
            }

            for (const metaT of metaTemplates) {
                try {
                    const bodyComp = metaT.components?.find(c => c.type === 'BODY');
                    const footerComp = metaT.components?.find(c => c.type === 'FOOTER');
                    const buttonComp = metaT.components?.find(c => c.type === 'BUTTONS');
                    const headerComp = metaT.components?.find(c => c.type === 'HEADER');
                    const carouselComp = metaT.components?.find(c => c.type === 'CAROUSEL');

                    let templateType = headerComp?.format || 'TEXT';
                    let templateMetadata = {
                        headerText: headerComp?.format === 'TEXT' ? (headerComp.text || headerComp.example?.header_text?.[0]) : null,
                        mediaUrl: ['IMAGE', 'VIDEO', 'DOCUMENT'].includes(headerComp?.format)
                            ? (headerComp.example?.header_handle?.[0] || headerComp.example?.header_url?.[0] || null)
                            : null
                    };

                    if (carouselComp && carouselComp.cards) {
                        templateType = 'CAROUSEL';
                        const cardsData = carouselComp.cards.map(card => {
                            const cHeader = card.components?.find(c => c.type === 'HEADER');
                            const cBody = card.components?.find(c => c.type === 'BODY');
                            const cButtons = card.components?.find(c => c.type === 'BUTTONS');
                            
                            return {
                                mediaUrl: cHeader?.example?.header_handle?.[0] || cHeader?.example?.header_url?.[0] || '',
                                body: cBody?.text || '',
                                buttons: cButtons?.buttons?.map(b => b.text) || []
                            };
                        });
                        templateMetadata.cards = cardsData;
                    }

                    const templateData = {
                        userId,
                        templateId: metaT.id,
                        name: metaT.name,
                        templateName: metaT.name,
                        category: metaT.category,
                        language: metaT.language,
                        status: metaT.status,
                        type: templateType,
                        body: bodyComp?.text || "",
                        footer: footerComp?.text || null,
                        buttons: buttonComp?.buttons || [],
                        metadata: templateMetadata,
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
