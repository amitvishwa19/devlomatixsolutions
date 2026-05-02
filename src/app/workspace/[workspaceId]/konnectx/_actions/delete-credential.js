'use server'

import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { db } from "@/lib/db";
import { ensureWorkspaceAccess } from "@/lib/auth-utils";

const DeleteCredentialSchema = z.object({
    workspaceId: z.string(),
    id: z.string(),
});

const handler = async (data) => {
    const { workspaceId, id } = data;

    try {
        const session = await ensureWorkspaceAccess(workspaceId);
        const userId = session.user.userId || session.user.id;

        await db.credentials.delete({
            where: { id, userId }
        });

        return { success: true };
    } catch (error) {
        return { error: error.message || "Failed to delete credential" };
    }
};

export const deleteCredential = createSafeAction(DeleteCredentialSchema, handler);
