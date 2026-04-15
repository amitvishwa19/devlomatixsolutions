'use server'
import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { db } from "@/lib/db";

const GetAgentModels = z.object({
    workspaceId: z.string(),
});

const handler = async (data) => {
    const { workspaceId } = data;

    try {
        // Defensive check for dev mode singleton staleness
        if (!db.agentModel && process.env.NODE_ENV !== 'production') {
            console.error("❌ Critical: db.agentModel is undefined in action context. This usually requires a server restart.");
            return { error: "Database client is out of sync. Please restart the dev server." };
        }

        const models = await db.agentModel.findMany({
            where: { workspaceId },
            orderBy: {
                createdAt: 'desc',
            },
        });

        return { data: { models } };

    } catch (error) {
        console.error("Action Error [getAgentModels]:", error);
        return {
            error: "Failed to fetch model cluster"
        };
    }
}

export const getAgentModels = createSafeAction(GetAgentModels, handler);
