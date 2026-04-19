'use server'

import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { db } from "@/lib/db";
import { ensureWorkspaceAccess } from "@/lib/auth-utils";
import * as cloudApi from "@/app/workspace/[workspaceId]/wa/_lib/whatsapp-cloud-api";
import { symmetricDecrypt } from "@/lib/encryption";

const SyncTemplatesSchema = z.object({
    workspaceId: z.string(),
});

const handler = async (data) => {
    const { workspaceId } = data;

    try {
        const session = await ensureWorkspaceAccess(workspaceId);
        const userId = session.user.userId || session.user.id;

        // 1. Fetch Cloud API Credentials
        const credential = await db.credentials.findFirst({
            where: { userId, platform: 'WHATSAPP_CLOUD' },
            orderBy: { updatedAt: 'desc' }
        });

        if (!credential || !credential.credentials) {
            return { error: "Cloud API credentials not found" };
        }

        let cloudCredentials = null;
        const stored = credential.credentials;

        if (typeof stored === 'string' && stored.includes(':')) {
            try {
                const decrypted = symmetricDecrypt(stored);
                cloudCredentials = JSON.parse(decrypted);
            } catch (e) {
                console.error("[Template Sync Action] Decryption failed:", e);
                return { error: "Failed to decrypt credentials" };
            }
        } else if (typeof stored === 'string') {
            try {
                cloudCredentials = JSON.parse(stored);
            } catch (e) {
                console.error("[Template Sync Action] JSON parse failed:", e);
                return { error: "Malformed credentials in database" };
            }
        } else {
            cloudCredentials = stored;
        }

        if (!cloudCredentials || !cloudCredentials.accessToken || !cloudCredentials.wabaId) {
            return { error: "Incomplete credentials (missing Access Token or WABA ID)" };
        }

        // 2. Fetch Templates from Meta
        const metaRes = await cloudApi.fetchTemplates(cloudCredentials);
        if (!metaRes.success) {
            return { error: metaRes.error || "Failed to fetch from Meta" };
        }

        const metaTemplates = metaRes.data;
        if (!Array.isArray(metaTemplates)) {
            return { error: "Invalid response format from Meta" };
        }

        // 3. Upsert into Database
        const syncResults = [];
        for (const metaT of metaTemplates) {
            try {
                const bodyComp = metaT.components?.find(c => c.type === 'BODY');
                const footerComp = metaT.components?.find(c => c.type === 'FOOTER');
                const buttonComp = metaT.components?.find(c => c.type === 'BUTTONS');
                const headerComp = metaT.components?.find(c => c.type === 'HEADER');

                const templateData = {
                    userId,
                    name: metaT.name,
                    templateName: metaT.name,
                    category: metaT.category,
                    language: metaT.language,
                    status: metaT.status,
                    type: 'TEXT',
                    body: bodyComp?.text || "",
                    footer: footerComp?.text || null,
                    buttons: buttonComp?.buttons || [],
                    metadata: {
                        headerText: headerComp?.format === 'TEXT' ? headerComp.text : null,
                        mediaUrl: headerComp?.format === 'IMAGE' ? headerComp.example?.header_handle?.[0] : null
                    },
                    isDefault: true,
                    platform: 'WHATSAPP_CLOUD'
                };

                const synced = await db.messageTemplate.upsert({
                    where: {
                        userId_name: {
                            userId,
                            name: metaT.name
                        }
                    },
                    update: templateData,
                    create: templateData
                });
                syncResults.push(synced);
            } catch (error) {
                console.error(`[Template Sync Action] Failed to sync ${metaT.name}:`, error);
            }
        }

        return { 
            success: true, 
            count: metaTemplates.length,
            synced: syncResults.length 
        };

    } catch (error) {
        return { error: error.message || "Failed to sync templates" };
    }
};

export const syncTemplates = createSafeAction(SyncTemplatesSchema, handler);
