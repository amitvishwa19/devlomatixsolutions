'use server'
import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { db } from "@/lib/db";

const CreateAgentModel = z.object({
    workspaceId: z.string(),
    userId: z.string(),
    provider: z.string(),
    name: z.string(),
    apiKey: z.string(),
    baseUrl: z.optional(z.string()),
    description: z.optional(z.string()),
    isDefault: z.optional(z.boolean()),
    healthStatus: z.optional(z.string()),
});

const handler = async (data) => {
    const { workspaceId, userId, provider, name, apiKey, baseUrl, description, isDefault, healthStatus } = data;

    try {
        // Defensive check for dev mode singleton staleness
        if (!db.agentModel && process.env.NODE_ENV !== 'production') {
            console.error("❌ Critical: db.agentModel is undefined in action context. This usually requires a server restart.");
            return { error: "Database client is out of sync. Please restart the dev server." };
        }

        // Handle singleton default logic
        if (isDefault) {
            await db.agentModel.updateMany({
                where: { 
                    workspaceId, 
                    isDefault: true 
                },
                data: { isDefault: false }
            });
        }

        const model = await db.agentModel.create({
            data: {
                workspaceId,
                userId,
                provider,
                name,
                apiKey,
                baseUrl,
                description,
                isDefault: !!isDefault,
                healthStatus: healthStatus || "UNTESTED", 
                successRate: "0%", // Starting metric
                latency: "N/A", // Starting metric
                capability: "Probing Hub...", // Will be updated by AMID on first handshake
                bestFor: "Initializing Cluster...", // Will be updated by AMID on first handshake
            }
        });

        return { data: { model } };

    } catch (error) {
        console.error("Action Error [createAgentModel]:", error);
        return {
            error: error.message || "Failed to deploy AI node to cluster"
        };
    }
}

export const createAgentModel = createSafeAction(CreateAgentModel, handler);
