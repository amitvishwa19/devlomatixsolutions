import { NextResponse } from "next/server";
import { validateCrmUserToken } from "../../_lib/auth";
import { apiSuccess, apiError } from "../../_lib/response";
import { analyzeDealAiHealthAction } from "@/app/workspace/[workspaceId]/crm/_actions/crm-ai-actions";

/**
 * POST /api/v5/crm/copilot/score
 * FlowGenix AI Deal Health, Momentum, and Win Probability scoring
 */
export async function POST(request) {
    try {
        const auth = await validateCrmUserToken(request);
        if (!auth.authenticated) {
            return apiError(auth.error, auth.status || 401);
        }

        const body = await request.json().catch(() => ({}));
        const { dealId } = body;

        if (!dealId) {
            return apiError("Missing required parameter 'dealId' in request body.", 400);
        }

        const result = await analyzeDealAiHealthAction(auth.workspaceId, dealId);
        if (!result.success) {
            return apiError(result.error, 400);
        }

        return apiSuccess(result.data, "Deal health and AI win score computed successfully.");
    } catch (err) {
        return apiError(err.message || "Failed to analyze deal AI health", 500);
    }
}
