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
        await ensureWorkspaceAccess(workspaceId);

        const flows = await db.whatsAppFlow.findMany({
            where: { workspaceId },
            orderBy: [
                { createdAt: 'desc' },
                { updatedAt: 'desc' }
            ]
        });

        return { success: true, flows: JSON.parse(JSON.stringify(flows)) };
    } catch (error) {
        console.error("❌ GetFlows Error:", error);
        return { error: error.message || "Failed to fetch flows" };
    }
};

export const getFlows = createSafeAction(GetFlowsSchema, handler);
