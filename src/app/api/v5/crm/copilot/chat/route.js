import { NextResponse } from "next/server";
import { validateCrmUserToken } from "../../_lib/auth";
import { apiSuccess, apiError } from "../../_lib/response";
import { askSalesCopilotChatAction } from "@/app/workspace/[workspaceId]/crm/_actions/crm-ai-actions";

/**
 * POST /api/v5/crm/copilot/chat
 * FlowGenix AI Sales Copilot interactive strategy advisory chat
 */
export async function POST(request) {
    try {
        const auth = await validateCrmUserToken(request);
        if (!auth.authenticated) {
            return apiError(auth.error, auth.status || 401);
        }

        const body = await request.json().catch(() => ({}));
        const { message, chatHistory = [] } = body;

        if (!message || typeof message !== 'string') {
            return apiError("Missing required parameter 'message' in request body.", 400);
        }

        const result = await askSalesCopilotChatAction(auth.workspaceId, { message, chatHistory });
        if (!result.success) {
            return apiError(result.error, 400);
        }

        return apiSuccess(result.data);
    } catch (err) {
        return apiError(err.message || "Failed to query sales copilot", 500);
    }
}
