'use server'

import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { db } from "@/lib/db";
import { ensureWorkspaceAccess } from "@/lib/auth-utils";
import { waManager } from "../_lib/whatsapp-v2";

const DisconnectWaSchema = z.object({
    workspaceId: z.string(),
});

const handler = async (data) => {
    const { workspaceId } = data;

    try {
        const session = await ensureWorkspaceAccess(workspaceId);
        const userId = session.user.userId || session.user.id;
        
        await waManager.disconnect();
        
        if (userId) {
            console.log(`[WA Action] Clearing session records from DB for user: ${userId}`);
            await db.whatsAppAuth.deleteMany({
                where: { sessionId: userId }
            });
        }
        
        return { 
            data: {
                success: true 
            }
        };
    } catch (error) {
        return { error: error.message || "Failed to disconnect" };
    }
};

export const disconnectWa = createSafeAction(DisconnectWaSchema, handler);
