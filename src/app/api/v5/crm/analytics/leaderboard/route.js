import { NextResponse } from "next/server";
import { validateCrmUserToken } from "../../_lib/auth";
import { apiSuccess, apiError } from "../../_lib/response";
import { getTeamSalesLeaderboardAction } from "@/app/workspace/[workspaceId]/crm/_actions/crm-analytics-actions";

/**
 * GET /api/v5/crm/analytics/leaderboard
 * Team sales rep leaderboard, quota attainment & activity breakdown
 */
export async function GET(request) {
    try {
        const auth = await validateCrmUserToken(request);
        if (!auth.authenticated) {
            return apiError(auth.error, auth.status || 401);
        }

        const { searchParams } = new URL(request.url);
        const timeframe = searchParams.get("timeframe") || "CURRENT_MONTH";

        const result = await getTeamSalesLeaderboardAction(auth.workspaceId, { timeframe });
        if (!result.success) {
            return apiError(result.error, 400);
        }

        return apiSuccess(result.data);
    } catch (err) {
        return apiError(err.message || "Failed to load team sales leaderboard", 500);
    }
}
