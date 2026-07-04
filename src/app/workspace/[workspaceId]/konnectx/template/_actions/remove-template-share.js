'use server'

import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { db } from "@/lib/db";
import { ensureWorkspaceAccess } from "@/lib/auth-utils";

const RemoveTemplateShareSchema = z.object({
    workspaceId: z.string(),
    templateId: z.string(),
    sharedWithUserId: z.string(),
});

const handler = async (data) => {
    const { workspaceId, templateId, sharedWithUserId } = data;

    try {
        const session = await ensureWorkspaceAccess(workspaceId);
        if (!session) {
            throw new Error("No active session found");
        }
        const currentUserId = session.user?.userId || session.user?.id;

        const template = await db.messageTemplate.findUnique({
            where: { id: templateId }
        });
        if (!template) {
            return { error: "Template not found" };
        }
        if (template.userId !== currentUserId) {
            return { error: "You can only manage sharing for your own templates" };
        }

        await db.templateShare.deleteMany({
            where: {
                templateId,
                sharedWithUserId
            }
        });

        return { data: { success: true } };
    } catch (error) {
        console.error("[removeTemplateShare] Error:", error);
        return { error: error.message || "Failed to remove share" };
    }
};

export const removeTemplateShare = createSafeAction(RemoveTemplateShareSchema, handler);
