'use server'

import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { db } from "@/lib/db";
import { ensureWorkspaceAccess } from "@/lib/auth-utils";

const SaveBotSchema = z.object({
    workspaceId: z.string(),
    id: z.string().optional(),
    name: z.string().optional(),
    description: z.string().optional(),
    active: z.boolean().optional(),
    nodes: z.any().optional(),
    edges: z.any().optional(),
});

const handler = async (data) => {
    const { workspaceId, id, name, description, active, nodes, edges } = data;

    try {
        const session = await ensureWorkspaceAccess(workspaceId);
        const userId = session.user.userId || session.user.id;

        if (id) {
            // Update
            const updated = await db.botFlow.update({
                where: { id, userId },
                data: {
                    name: name !== undefined ? name : undefined,
                    description: description !== undefined ? description : undefined,
                    active: active !== undefined ? active : undefined,
                    nodes: nodes !== undefined ? nodes : undefined,
                    edges: edges !== undefined ? edges : undefined,
                }
            });
            return { success: true, bot: updated };
        } else {
            // Create
            if (!name) return { error: "Name is required for new bots" };
            const newBotFlow = await db.botFlow.create({
                data: {
                    name,
                    description,
                    userId,
                    // Create a default start step
                    steps: {
                        create: {
                            type: 'trigger',
                            config: { keyword: name.toLowerCase().replace(/\s+/g, '_'), type: 'keyword' },
                            positionX: 100,
                            positionY: 100,
                            order: 0
                        }
                    }
                }
            });
            return { success: true, bot: newBotFlow };
        }
    } catch (error) {
        return { error: error.message || "Failed to save bot" };
    }
};

export const saveBot = createSafeAction(SaveBotSchema, handler);
