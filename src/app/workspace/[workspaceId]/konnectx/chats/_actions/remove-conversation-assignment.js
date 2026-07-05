'use server'

import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { db } from "@/lib/db";
import { ensureWorkspaceAccess } from "@/lib/auth-utils";

const RemoveConversationAssignmentSchema = z.object({
    workspaceId: z.string(),
    jid: z.string(),
    sharedWithUserId: z.string(),
});

const handler = async (data) => {
    const { workspaceId, jid, sharedWithUserId } = data;

    try {
        const session = await ensureWorkspaceAccess(workspaceId);
        const userId = session.user.userId || session.user.id;

        const share = await db.conversationShare.findUnique({
            where: {
                jid_workspaceId_sharedWithUserId: { jid, workspaceId, sharedWithUserId }
            }
        });

        if (!share) return { error: "Assignment not found" };
        if (share.sharedByUserId !== userId && sharedWithUserId !== userId) {
            return { error: "Unauthorized" };
        }

        await db.conversationShare.delete({
            where: {
                jid_workspaceId_sharedWithUserId: { jid, workspaceId, sharedWithUserId }
            }
        });

        return { data: { success: true } };
    } catch (error) {
        console.error("[RemoveConversationAssignment] Error:", error);
        return { error: error.message || "Failed to remove assignment" };
    }
};

export const removeConversationAssignment = createSafeAction(RemoveConversationAssignmentSchema, handler);
