'use server'

import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { db } from "@/lib/db";
import { ensureWorkspaceAccess } from "@/lib/auth-utils";
import * as cloudApi from "@/app/workspace/[workspaceId]/konnectx/_lib/whatsapp-cloud-api";
import { symmetricDecrypt } from "@/lib/encryption";
import { getTemplateDisplayName } from "@/app/workspace/[workspaceId]/konnectx/_lib/template-formatter";

const SyncTemplatesSchema = z.object({
    workspaceId: z.string(),
});

const handler = async (data) => {
    const { workspaceId } = data;

    try {
        const session = await ensureWorkspaceAccess(workspaceId);
        const userId = session.user.userId || session.user.id;

        // 1. Fetch ALL Cloud API Credentials for this user
        const credentials = await db.credentials.findMany({
            where: { userId, platform: 'WHATSAPP_CLOUD' },
            orderBy: { updatedAt: 'desc' }
        });

        console.log(`[Template Sync Action] Found ${credentials.length} credentials for user ${userId}`);

        if (credentials.length === 0) {
            return { error: "No WhatsApp Cloud credentials found" };
        }

        const syncResults = [];
        let totalMetaTemplates = 0;

        for (const credential of credentials) {
            console.log(`--- Syncing Credential: ${credential.profile} (${credential.id}) ---`);
            let cloudCredentials = null;
            const stored = credential.credentials;

            if (stored) {
                if (typeof stored === 'string' && stored.includes(':')) {
                    try {
                        cloudCredentials = JSON.parse(symmetricDecrypt(stored));
                    } catch (e) {
                        console.error(`[Template Sync Action] String decryption failed for ${credential.profile}:`, e);
                    }
                } else if (typeof stored === 'object' && stored.enc && typeof stored.enc === 'string' && stored.enc.includes(':')) {
                    try {
                        cloudCredentials = JSON.parse(symmetricDecrypt(stored.enc));
                    } catch (e) {
                        console.error(`[Template Sync Action] Object decryption failed for ${credential.profile}:`, e);
                    }
                } else if (typeof stored === 'object') {
                    cloudCredentials = stored;
                } else {
                    try {
                        cloudCredentials = JSON.parse(stored);
                    } catch (e) { }
                }
            }

            if (!cloudCredentials || !cloudCredentials.accessToken || !cloudCredentials.wabaId) {
                console.warn(`[Template Sync Action] Incomplete credentials for ${credential.profile}`);
                continue;
            }

            // 2. Fetch Templates from Meta
            const metaRes = await cloudApi.fetchTemplates(cloudCredentials);
            if (!metaRes.success) {
                console.error(`[Template Sync Action] Failed to fetch from Meta for ${credential.profile}:`, metaRes.error);
                continue;
            }

            const metaTemplates = metaRes.data;
            if (!Array.isArray(metaTemplates)) continue;

            totalMetaTemplates += metaTemplates.length;
            console.log(`[Template Sync Action] Fetched ${metaTemplates.length} templates for ${credential.profile}`);

            // 1. Build lookup sets of Meta template IDs and keys (name_language) for robust comparison
            const metaTemplateIds = new Set(metaTemplates.map(t => String(t.id)).filter(Boolean));
            const metaTemplateKeys = new Set(
                metaTemplates.map(t => `${t.name.toLowerCase()}_${t.language}`)
            );

            // 2. Fetch all local synchronized templates for this phone number and user
            const currentPhoneId = String(cloudCredentials.phoneNumberId || cloudCredentials.phone_number_id || "");
            const localTemplates = await db.messageTemplate.findMany({
                where: {
                    userId,
                    ...(currentPhoneId ? { phoneNumberId: currentPhoneId } : {}),
                    isDefault: true,
                    platform: 'WHATSAPP_CLOUD'
                }
            });

            // 3. Identify and delete ONLY templates that were genuinely deleted on Meta Cloud
            const templatesToDelete = localTemplates.filter(t => {
                // Never delete local drafts that haven't been linked to a Meta ID
                if (t.status === 'DRAFT' && !t.templateId) return false;

                // Match by templateId
                if (t.templateId && metaTemplateIds.has(String(t.templateId))) return false;

                const lang = t.language || 'en_US';

                // Match by templateName
                if (t.templateName && metaTemplateKeys.has(`${t.templateName.toLowerCase()}_${lang}`)) return false;

                // Match by name
                if (t.name && metaTemplateKeys.has(`${t.name.toLowerCase()}_${lang}`)) return false;

                // Match by snake_cased display name
                const sanitized = t.name ? t.name.toLowerCase().trim().replace(/[^a-z0-9_]/g, '_') : '';
                if (sanitized && metaTemplateKeys.has(`${sanitized}_${lang}`)) return false;

                return true;
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

            // 4. Upsert into Database
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

                    const identifierConditions = [];
                    if (metaT.id) identifierConditions.push({ templateId: String(metaT.id) });
                    identifierConditions.push({ templateName: metaT.name });
                    identifierConditions.push({ name: metaT.name });
                    identifierConditions.push({ name: getTemplateDisplayName(metaT.name) });

                    const phoneFilter = currentPhoneId ? [
                        { phoneNumberId: currentPhoneId },
                        { phoneNumberId: null },
                        { phoneNumberId: "" }
                    ] : [];

                    const existing = await db.messageTemplate.findFirst({
                        where: {
                            userId,
                            language: metaT.language,
                            OR: identifierConditions,
                            ...(phoneFilter.length > 0 ? {
                                AND: [{ OR: phoneFilter }]
                            } : {})
                        }
                    });

                    let existingMeta = {};
                    if (existing?.metadata) {
                        try {
                            existingMeta = typeof existing.metadata === 'string'
                                ? JSON.parse(existing.metadata)
                                : (existing.metadata || {});
                        } catch (e) {
                            existingMeta = {};
                        }
                    }

                    // Carefully merge metadata to preserve groupId, groupName, groupColor and custom properties
                    const mergedMetadata = {
                        ...templateMetadata,
                        ...existingMeta,
                        ...(templateMetadata.headerText !== undefined && { headerText: templateMetadata.headerText }),
                        ...(templateMetadata.mediaUrl !== undefined && { mediaUrl: templateMetadata.mediaUrl }),
                        ...(templateMetadata.cards !== undefined && { cards: templateMetadata.cards }),
                        // Explicitly preserve group assignments
                        ...(existingMeta.groupId ? {
                            groupId: existingMeta.groupId,
                            groupName: existingMeta.groupName,
                            groupColor: existingMeta.groupColor || '#3b82f6'
                        } : {})
                    };

                    const displayName = (existing?.name && existing.name !== metaT.name)
                        ? existing.name
                        : getTemplateDisplayName(metaT.name);

                    const templateData = {
                        userId,
                        templateId: String(metaT.id),
                        name: displayName,
                        templateName: metaT.name,
                        category: metaT.category || 'UTILITY',
                        language: metaT.language,
                        status: metaT.status,
                        approved: metaT.status === 'APPROVED',
                        type: templateType,
                        body: bodyComp?.text || "",
                        footer: footerComp?.text || null,
                        buttons: buttonComp?.buttons || [],
                        metadata: mergedMetadata,
                        isDefault: true,
                        platform: 'WHATSAPP_CLOUD',
                        phoneNumberId: currentPhoneId || existing?.phoneNumberId || null
                    };

                    let synced;
                    if (existing) {
                        synced = await db.messageTemplate.update({
                            where: { id: existing.id },
                            data: templateData
                        });
                    } else {
                        synced = await db.messageTemplate.create({
                            data: templateData
                        });
                    }
                    syncResults.push(synced);
                } catch (error) {
                    console.error(`[Template Sync Action] Failed to sync ${metaT.name}:`, error);
                }
            }
        }

        return {
            success: true,
            count: totalMetaTemplates,
            synced: syncResults.length,
            message: `Successfully synchronized ${syncResults.length} templates across ${credentials.length} accounts.`
        };

    } catch (error) {
        return { error: error.message || "Failed to sync templates" };
    }
};

export const syncTemplates = createSafeAction(SyncTemplatesSchema, handler);
