'use server'

import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { db } from "@/lib/db";
import { ensureWorkspaceAccess } from "@/lib/auth-utils";
import { symmetricDecrypt } from "@/lib/encryption";

const CheckTemplateStatusSchema = z.object({
    workspaceId: z.string(),
    templateId: z.string(),
});

const handler = async (data) => {
    const { workspaceId, templateId } = data;

    try {
        const session = await ensureWorkspaceAccess(workspaceId);
        const userId = session.user.userId || session.user.id;

        // 1. Fetch template
        const template = await db.messageTemplate.findUnique({
            where: { id: templateId, userId }
        });

        if (!template || !template.templateName) {
            return { error: "Template not submitted or not found" };
        }

        // 2. Fetch Credentials
        const credential = await db.credentials.findFirst({
            where: { userId, platform: 'WHATSAPP_CLOUD' },
            orderBy: { updatedAt: 'desc' }
        });

        if (!credential) return { error: "Credentials not found" };

        let cloudCreds = null;
        const stored = credential.credentials;
        if (typeof stored === 'string' && stored.includes(':')) {
            cloudCreds = JSON.parse(symmetricDecrypt(stored));
        } else if (typeof stored === 'string') {
            cloudCreds = JSON.parse(stored);
        } else {
            cloudCreds = stored;
        }

        // 3. Fetch from Meta
        const response = await fetch(
            `https://graph.facebook.com/v17.0/${cloudCreds.wabaId}/message_templates?name=${template.templateName}`,
            {
                method: "GET",
                headers: { "Authorization": `Bearer ${cloudCreds.accessToken}` }
            }
        );

        const result = await response.json();
        if (!response.ok || !result.data || result.data.length === 0) {
            return { error: "Template status not found on Meta" };
        }

        const metaT = result.data[0];
        const status = metaT.status;

        // 4. Update local DB
        const updated = await db.messageTemplate.update({
            where: { id: templateId },
            data: {
                status: status,
                approved: status === 'APPROVED'
            }
        });

        return { success: true, status: status, template: updated };

    } catch (error) {
        return { error: error.message || "Failed to check status" };
    }
};

export const checkTemplateStatus = createSafeAction(CheckTemplateStatusSchema, handler);
