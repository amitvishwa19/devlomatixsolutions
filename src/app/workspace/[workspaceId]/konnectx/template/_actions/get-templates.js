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
        if (!session) {
            throw new Error("No active session found");
        }
        const currentUserId = session.user?.userId || session.user?.id;
        if (!currentUserId) {
            throw new Error("User ID not found in session");
        }

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

        console.log('[getTemplates] filtering by sharedWith userId and phoneNumberId:', currentUserId, phoneNumberId);

        const templates = await db.messageTemplate.findMany({
            where: {
                OR: [
                    { userId: currentUserId },
                    { sharedWith: { some: { sharedWithUserId: currentUserId } } }
                ],
                ...(phoneNumberId ? { phoneNumberId } : {})
            },
            include: {
                sharedWith: {
                    include: {
                        sharedWith: {
                            select: { id: true, displayName: true, email: true }
                        }
                    }
                }
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
        console.error("[getTemplates] Exception caught in handler:", error);
        return { error: String(error.message || error) };
    }
};

export const getTemplates = createSafeAction(GetTemplatesSchema, handler);
