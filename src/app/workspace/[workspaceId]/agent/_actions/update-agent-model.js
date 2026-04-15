'use server'
import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { db } from "@/lib/db";

const UpdateAgentModel = z.object({
    id: z.string(),
    workspaceId: z.string(),
    provider: z.optional(z.string()),
    name: z.optional(z.string()),
    apiKey: z.optional(z.string()),
    baseUrl: z.optional(z.string()),
    description: z.optional(z.string()),
    isDefault: z.optional(z.boolean()),
    isActive: z.optional(z.boolean()),
    healthStatus: z.optional(z.string()),
});

const handler = async (data) => {
    const { id, workspaceId, provider, name, apiKey, baseUrl, description, isDefault, isActive, healthStatus } = data;

    try {
        // Defensive check for dev mode singleton staleness
        if (!db.agentModel && process.env.NODE_ENV !== 'production') {
            console.error("❌ Critical: db.agentModel is undefined in action context. This usually requires a server restart");
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

        const model = await db.agentModel.update({
            where: { id },
            data: {
                provider,
                name,
                apiKey,
                baseUrl,
                description,
                isDefault,
                isActive,
                healthStatus,
            }
        });

        return { data: { model } };

    } catch (error) {
        console.error("Action Error [updateAgentModel]:", error);
        return {
            error: error.message || "Failed to update cluster node"
        };
    }
}

export const updateAgentModel = createSafeAction(UpdateAgentModel, handler);
