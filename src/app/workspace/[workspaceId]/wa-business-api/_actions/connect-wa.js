'use server'

import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { db } from "@/lib/db";
import { ensureWorkspaceAccess } from "@/lib/auth-utils";
import { waManager } from "../../wa-api_delete/_lib/whatsapp-v2";
import { logActivity } from "./log-activity";

const ConnectSchema = z.object({
    workspaceId: z.string(),
});

const handler = async (data) => {
    const { workspaceId } = data;
    try {
        const session = await ensureWorkspaceAccess(workspaceId);
        const userId = session.user.userId || session.user.id;

        console.log("[WA Business Action] Initializing connection for user:", userId);

        // Persist workspaceId in metadata for background activity logging
        const existing = await db.whatsAppAuth.findUnique({ where: { sessionId: userId } });
        const metadata = { ...(typeof existing?.metadata === 'object' ? existing.metadata : {}), workspaceId };

        await db.whatsAppAuth.upsert({
            where: { sessionId: userId },
            update: { metadata },
            create: { sessionId: userId, userId, metadata }
        });

        waManager.connect(userId);

        await logActivity({
            workspaceId,
            userId,
            message: "WA Business Engine connection initialized",
            type: "ENGINE_CONNECT",
            level: "info"
        });

        return { data: { success: true } };
    } catch (error) {
        return { error: error.message || "Failed to initialize connection" };
    }
};

export const connectWa = createSafeAction(ConnectSchema, handler);
