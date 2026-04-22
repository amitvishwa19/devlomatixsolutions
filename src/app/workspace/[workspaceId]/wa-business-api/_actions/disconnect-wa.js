'use server'

import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { ensureWorkspaceAccess } from "@/lib/auth-utils";
import { waManager } from "../../wa-api_delete/_lib/whatsapp-v2";
import { logActivity } from "./log-activity";

const DisconnectSchema = z.object({
    workspaceId: z.string(),
});

const handler = async (data) => {
    const { workspaceId } = data;
    try {
        await ensureWorkspaceAccess(workspaceId);

        console.log("[WA Business Action] Terminating connection");
        waManager.disconnect();

        const session = await ensureWorkspaceAccess(workspaceId);
        const userId = session.user.userId || session.user.id;

        await logActivity({
            workspaceId,
            userId,
            message: "WA Business Engine terminated",
            type: "ENGINE_DISCONNECT",
            level: "warn"
        });

        return { data: { success: true } };
    } catch (error) {
        return { error: error.message || "Failed to terminate connection" };
    }
};

export const disconnectWa = createSafeAction(DisconnectSchema, handler);
