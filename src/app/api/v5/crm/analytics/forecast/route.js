import { NextResponse } from "next/server";
import { validateCrmUserToken } from "../../_lib/auth";
import { apiSuccess, apiError } from "../../_lib/response";
import { getRevenueForecastAction } from "@/app/workspace/[workspaceId]/crm/_actions/crm-analytics-actions";

/**
 * GET /api/v5/crm/analytics/forecast
 * Revenue Forecasting Engine with weighted value, commit floor & best-case metrics
 */
export async function GET(request) {
    try {
        const auth = await validateCrmUserToken(request);
        if (!auth.authenticated) {
            return apiError(auth.error, auth.status || 401);
        }

        const { searchParams } = new URL(request.url);
        const pipelineId = searchParams.get("pipelineId") || undefined;
        const timeframe = searchParams.get("timeframe") || "CURRENT_QUARTER";

        const result = await getRevenueForecastAction(auth.workspaceId, { pipelineId, timeframe });
        if (!result.success) {
            return apiError(result.error, 400);
        }

        return apiSuccess(result.data);
    } catch (err) {
        return apiError(err.message || "Failed to calculate revenue forecast", 500);
    }
}
