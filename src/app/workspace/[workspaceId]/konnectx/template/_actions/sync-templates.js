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

            // 3. Upsert into Database
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
                        phoneNumberId: cloudCredentials.phoneNumberId
                    };

                    console.log(`[Template Sync Action] VERIFIED NEW LOGIC RUNNING for ${metaT.name}`);
                    // Manual Upsert to avoid Prisma Client caching issues with compound unique names
                    const existing = await db.messageTemplate.findFirst({
                        where: {
                            userId,
                            name: metaT.name,
                            language: metaT.language,
                            phoneNumberId: cloudCredentials.phoneNumberId
                        }
                    });

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
