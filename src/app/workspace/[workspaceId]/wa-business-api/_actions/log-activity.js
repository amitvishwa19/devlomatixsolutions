import { db } from "@/lib/db";

/**
 * Internal utility to log activities for the WhatsApp Business API module.
 */
export async function logActivity({ workspaceId, userId, message, type = 'info', level = 'info', details = {} }) {
    try {
        await db.systemLog.create({
            data: {
                workspaceId,
                userId,
                message,
                type,
                level,
                provider: 'wa-business-api',
                details: details || {}
            }
        });
    } catch (error) {
        console.error("[WA Activity Log Error]", error);
    }
}
