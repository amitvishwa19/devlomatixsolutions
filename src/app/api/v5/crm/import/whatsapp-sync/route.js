import { NextResponse } from "next/server";
import { validateCrmUserToken } from "../../_lib/auth";
import { apiSuccess, apiError } from "../../_lib/response";
import { syncWhatsAppChatsToCrmAction } from "@/app/workspace/[workspaceId]/crm/_actions/crm-import-sync-actions";

/**
 * POST /api/v5/crm/import/whatsapp-sync
 * 1-Click KonnectX WhatsApp Chat Synchronization into CRM Contacts & Activity Streams
 */
export async function POST(request) {
    try {
        const auth = await validateCrmUserToken(request);
        if (!auth.authenticated) {
            return apiError(auth.error, auth.status || 401);
        }

        const result = await syncWhatsAppChatsToCrmAction(auth.workspaceId);
        if (!result.success) {
            return apiError(result.error, 400);
        }

        return apiSuccess(result.data, "WhatsApp chats synchronized to CRM successfully.");
    } catch (err) {
        return apiError(err.message || "Failed to synchronize WhatsApp chats", 500);
    }
}
