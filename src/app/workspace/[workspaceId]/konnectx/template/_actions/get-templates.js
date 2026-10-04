'use server'

import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { db } from "@/lib/db";
import { ensureWorkspaceAccess } from "@/lib/auth-utils";
import { symmetricDecrypt } from "@/lib/encryption";

const GetTemplatesSchema = z.object({
    workspaceId: z.string(),
    all: z.boolean().optional(),
    phoneNumberId: z.string().optional()
});

const handler = async (data) => {
    const { workspaceId, all, phoneNumberId: explicitPhoneId } = data;

    try {
        const session = await ensureWorkspaceAccess(workspaceId).catch(() => null);
        const currentUserId = session?.user?.userId || session?.user?.id;

        // Get workspace members & owner
        const workspace = await db.server.findUnique({
            where: { id: workspaceId },
            include: { members: true }
        }).catch(() => null);

        const effectiveUserId = currentUserId || workspace?.userId;

        const workspaceUserIds = [
            ...new Set([
                effectiveUserId,
                workspace?.userId,
                ...((workspace?.members || []).map(m => m.userId))
            ].filter(Boolean))
        ];

        let phoneNumberId = explicitPhoneId || null;
        if (!phoneNumberId && !all) {
            let credential = await db.credentials.findFirst({
                where: { workspaceId, platform: 'WHATSAPP_CLOUD', isDefault: true }
            }).catch(() => null);
            if (!credential) {
                credential = await db.credentials.findFirst({
                    where: { workspaceId, platform: 'WHATSAPP_CLOUD' },
                    orderBy: { updatedAt: 'desc' }
                }).catch(() => null);
            }

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
                phoneNumberId = String(cloudCreds?.phoneNumberId || cloudCreds?.phone_number_id || "");
            }
        }

        const whereClause = {
            OR: [
                ...(workspaceUserIds.length > 0 ? [{ userId: { in: workspaceUserIds } }] : []),
                ...(effectiveUserId ? [{ sharedWith: { some: { sharedWithUserId: effectiveUserId } } }] : []),
                { isDefault: true }
            ]
        };

        if (phoneNumberId && phoneNumberId.trim() !== "" && !all) {
            whereClause.phoneNumberId = phoneNumberId;
        }

        const templates = await db.messageTemplate.findMany({
            where: whereClause,
            include: {
                sharedWith: {
                    include: {
                        sharedWith: {
                            select: { id: true, displayName: true, email: true }
                        }
                    }
                }
            },
            orderBy: [
                { createdAt: 'desc' }
            ]
        });

        return {
            data: {
                success: true,
                templates: JSON.parse(JSON.stringify(templates))
            }
        };
    } catch (error) {
        console.error("[getTemplates] Exception caught in handler:", error);
        return { error: String(error.message || error) };
    }
};

export const getTemplates = createSafeAction(GetTemplatesSchema, handler);

