'use server'

import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { db } from "@/lib/db";
import { ensureWorkspaceAccess } from "@/lib/auth-utils";
import { revalidatePath } from "next/cache";

const CloneFlowSchema = z.object({
    workspaceId: z.string(),
    id: z.string(),
});

const handler = async (data) => {
    const { workspaceId, id: sourceId } = data;

    try {
        const session = await ensureWorkspaceAccess(workspaceId);
        const userId = session.user.userId || session.user.id;

        // 1. Get Source Flow
        const source = await db.whatsAppFlow.findFirst({
            where: { id: sourceId, workspaceId }
        });

        if (!source) throw new Error("Source flow not found");

        // 2. Create Clone
        const clone = await db.whatsAppFlow.create({
            data: {
                workspaceId,
                userId,
                name: `${source.name} (Copy)`,
                description: source.description,
                status: 'DRAFT',
                categories: source.categories,
                screens: source.screens,
                definition: source.definition,
                // Do NOT copy flowId (Meta ID) as it must be unique
            }
        });

        revalidatePath(`/workspace/${workspaceId}/wa-cloud-api/flows`);
        return { success: true, id: clone.id };

    } catch (error) {
        console.error("❌ CloneFlow Error:", error);
        return { error: error.message || "Failed to clone flow" };
    }
};

export const cloneFlow = createSafeAction(CloneFlowSchema, handler);
