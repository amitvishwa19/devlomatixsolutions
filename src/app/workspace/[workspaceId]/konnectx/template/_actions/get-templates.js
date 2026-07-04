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

        console.log('[getTemplates] filtering by sharedWith userId:', currentUserId);

        const templates = await db.messageTemplate.findMany({
            where: {
                sharedWith: { some: { sharedWithUserId: currentUserId } }
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
