'use server'
import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { db } from "@/lib/db";

const DeleteAgentModel = z.object({
    id: z.string(),
});

const handler = async (data) => {
    const { id } = data;

    try {
        // Defensive check for dev mode singleton staleness
        if (!db.agentModel && process.env.NODE_ENV !== 'production') {
            console.error("❌ Critical: db.agentModel is undefined in action context. This usually requires a server restart");
            return { error: "Database client is out of sync. Please restart the dev server." };
        }

        await db.agentModel.delete({
            where: { id }
        });

        return { data: { success: true } };

    } catch (error) {
        console.error("Action Error [deleteAgentModel]:", error);
        return {
            error: "Failed to remove model from cluster"
        };
    }
}

export const deleteAgentModel = createSafeAction(DeleteAgentModel, handler);
