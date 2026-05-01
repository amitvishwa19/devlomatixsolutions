'use server'

import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { db } from "@/lib/db";
import { ensureWorkspaceAccess } from "@/lib/auth-utils";

const GetFlowsSchema = z.object({
    workspaceId: z.string(),
});

const handler = async (data) => {
    const { workspaceId } = data;

    try {
        const session = await ensureWorkspaceAccess(workspaceId);
        const userId = session.user.userId || session.user.id;

        console.log("🔍 Checking DB models in action...");
        const models = Object.keys(db).filter(k => !k.startsWith('_'));
        console.log("Available models:", models);

        if (!db.whatsAppFlow) {
            throw new Error(`whatsAppFlow model not found in DB object. Available: ${models.join(', ')}`);
        }

        const flows = await db.whatsAppFlow.findMany({
            where: { workspaceId, userId },
            orderBy: { updatedAt: 'desc' }
        });

        return { success: true, flows };
    } catch (error) {
        console.error("❌ GetFlows Error:", error);
        return { error: error.message || "Failed to fetch flows" };
    }
};

export const getFlows = createSafeAction(GetFlowsSchema, handler);
