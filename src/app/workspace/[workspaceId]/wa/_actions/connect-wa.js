'use server'

import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { ensureWorkspaceAccess } from "@/lib/auth-utils";
import { waManager } from "../_lib/whatsapp-v2";

const ConnectWaSchema = z.object({
    workspaceId: z.string(),
});

const handler = async (data) => {
    const { workspaceId } = data;

    try {
        const session = await ensureWorkspaceAccess(workspaceId);
        const userId = session.user.userId || session.user.id;
        
        waManager.connect(userId);
        
        return {
            data: {
                success: true,
                status: waManager.getState()
            }
        };
    } catch (error) {
        return { error: error.message || "Failed to connect" };
    }
};

export const connectWa = createSafeAction(ConnectWaSchema, handler);
