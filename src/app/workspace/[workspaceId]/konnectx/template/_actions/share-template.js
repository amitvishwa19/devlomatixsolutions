'use server'

import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { db } from "@/lib/db";
import { ensureWorkspaceAccess } from "@/lib/auth-utils";

const ShareTemplateSchema = z.object({
    workspaceId: z.string(),
    templateId: z.string(),
    email: z.string().email(),
});

const handler = async (data) => {
    const { workspaceId, templateId, email } = data;

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
            return { error: "You can only share your own templates" };
        }

        const userToShare = await db.user.findUnique({
            where: { email }
        });
        if (!userToShare) {
            return { error: "User with this email not found" };
        }
        if (userToShare.id === currentUserId) {
            return { error: "Cannot share template with yourself" };
        }

        const existing = await db.templateShare.findUnique({
            where: {
                templateId_sharedWithUserId: {
                    templateId,
                    sharedWithUserId: userToShare.id
                }
            }
        });
        if (existing) {
            return { error: "Template already shared with this user" };
        }

        await db.templateShare.create({
            data: {
                templateId,
                sharedWithUserId: userToShare.id
            }
        });

        return { data: { success: true, sharedWith: { id: userToShare.id, displayName: userToShare.displayName, email: userToShare.email } } };
    } catch (error) {
        console.error("[shareTemplate] Error:", error);
        return { error: error.message || "Failed to share template" };
    }
};

export const shareTemplate = createSafeAction(ShareTemplateSchema, handler);
