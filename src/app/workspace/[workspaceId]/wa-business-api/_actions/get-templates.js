'use server'

import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { db } from "@/lib/db";
import { ensureWorkspaceAccess } from "@/lib/auth-utils";

const GetTemplatesSchema = z.object({
    workspaceId: z.string(),
});

const handler = async (data) => {
    const { workspaceId } = data;

    try {
        const session = await ensureWorkspaceAccess(workspaceId);
        const userId = session.user.userId || session.user.id;

        const templates = await db.messageTemplate.findMany({
            where: { 
                userId,
                // Allow templates from both platforms to show in the library for now
                // to avoid empty library issues for existing users.
                OR: [
                    { platform: "WHATSAPP_BUSINESS" },
                    { platform: "WHATSAPP_CLOUD" }
                ]
            },
            orderBy: { createdAt: 'desc' }
        });

        return { 
            data: { 
                templates: JSON.parse(JSON.stringify(templates))
            } 
        };
    } catch (error) {
        console.error('[WA_BUSINESS_GET_TEMPLATES]', error);
        return { error: error.message || "Failed to fetch templates" };
    }
};

export const getTemplates = createSafeAction(GetTemplatesSchema, handler);
