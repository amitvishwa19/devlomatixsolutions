'use server'

import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { db } from "@/lib/db";
import { ensureWorkspaceAccess } from "@/lib/auth-utils";

const SaveTemplateSchema = z.object({
    workspaceId: z.string(),
    id: z.string().optional(),
    name: z.string(),
    category: z.string().optional().nullable(),
    language: z.string().optional().nullable(),
    type: z.string().optional().nullable(),
    body: z.string(),
    header: z.string().optional().nullable(),
    footer: z.string().optional().nullable(),
    buttons: z.array(z.any()).optional().nullable(),
    metadata: z.any().optional().nullable(),
    status: z.string().optional(),
});

const handler = async (data) => {
    const { 
        workspaceId, id, name, category, language, 
        type, body, header, footer, buttons, metadata, status 
    } = data;

    try {
        const session = await ensureWorkspaceAccess(workspaceId);
        const userId = session.user.userId || session.user.id;

        const templateData = {
            userId,
            name,
            category: category || "UTILITY",
            language: language || "en_US",
            type: type || "TEXT",
            body,
            header: header || null,
            footer: footer || null,
            buttons: buttons || [],
            metadata: metadata || null,
            status: status || "DRAFT",
            platform: "WHATSAPP_BUSINESS" // Explicitly mark for business module
        };

        if (id) {
            // Check ownership
            const existing = await db.messageTemplate.findUnique({
                where: { id }
            });

            if (!existing || existing.userId !== userId) {
                return { error: "Template not found or unauthorized" };
            }

            const updated = await db.messageTemplate.update({
                where: { id },
                data: templateData
            });
            return { data: updated };
        } else {
            // Check for duplicate name
            const existingName = await db.messageTemplate.findFirst({
                where: { userId, name }
            });
            if (existingName) {
                return { error: "A template with this name already exists." };
            }

            const created = await db.messageTemplate.create({
                data: templateData
            });
            return { data: created };
        }
    } catch (error) {
        console.error('[WA_BUSINESS_SAVE_TEMPLATE]', error);
        return { error: "Failed to save template" };
    }
};

export const saveTemplate = createSafeAction(SaveTemplateSchema, handler);
