'use server'

import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { db } from "@/lib/db";
import { ensureWorkspaceAccess } from "@/lib/auth-utils";

const SaveTemplateSchema = z.object({
    workspaceId: z.string(),
    id: z.string().optional(),
    name: z.string(),
    category: z.string().optional(),
    language: z.string().optional(),
    type: z.string().optional(),
    body: z.string(),
    footer: z.string().optional().nullable(),
    buttons: z.array(z.any()).optional(),
    metadata: z.any().optional().nullable(),
    status: z.string().optional(),
});

const handler = async (data) => {
    const { workspaceId, id, name, category, language, type, body, footer, buttons, metadata, status } = data;

    try {
        const session = await ensureWorkspaceAccess(workspaceId);
        const userId = session.user.userId || session.user.id;

        if (id) {
            const existing = await db.messageTemplate.findUnique({ where: { id } });
            if (!existing || existing.userId !== userId) {
                return { error: "Template not found or unauthorized" };
            }
            const updated = await db.messageTemplate.update({
                where: { id },
                data: {
                    name,
                    category: category || "UTILITY",
                    language: language || "en_US",
                    type: type || "TEXT",
                    body,
                    footer: footer || null,
                    buttons: buttons || [],
                    metadata: metadata || null,
                    status: status || "DRAFT"
                }
            });
            return { success: true, template: updated };
        } else {
            const existingName = await db.messageTemplate.findFirst({ where: { userId, name } });
            if (existingName) {
                return { error: "A template with this name already exists." };
            }
            const template = await db.messageTemplate.create({
                data: {
                    userId,
                    name,
                    category: category || "UTILITY",
                    language: language || "en_US",
                    type: type || "TEXT",
                    body,
                    footer: footer || null,
                    buttons: buttons || [],
                    metadata: metadata || null,
                    status: "PENDING"
                }
            });
            return { success: true, template };
        }
    } catch (error) {
        return { error: error.message || "Failed to save template" };
    }
};

export const saveTemplate = createSafeAction(SaveTemplateSchema, handler);
