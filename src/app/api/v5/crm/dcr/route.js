import { NextResponse } from "next/server";
import { validateCrmUserToken } from "../_lib/auth";
import { apiSuccess, apiError } from "../_lib/response";
import { getDcrRecordsAction, createDcrRecordAction } from "@/app/workspace/[workspaceId]/crm/_actions/dcr-actions";

/**
 * GET /api/v5/crm/dcr
 * Fetch Daily Call Records & KPI metrics
 */
export async function GET(request) {
    try {
        const auth = await validateCrmUserToken(request);
        if (!auth.authenticated) {
            return apiError(auth.error, auth.status || 401);
        }

        const { searchParams } = new URL(request.url);
        const date = searchParams.get("date") || undefined;
        const startDate = searchParams.get("startDate") || undefined;
        const endDate = searchParams.get("endDate") || undefined;
        const repId = searchParams.get("repId") || undefined;
        const callType = searchParams.get("callType") || undefined;
        const outcome = searchParams.get("outcome") || undefined;
        const search = searchParams.get("search") || undefined;
        const page = searchParams.get("page") || 1;
        const limit = searchParams.get("limit") || 50;

        const result = await getDcrRecordsAction(auth.workspaceId, {
            date,
            startDate,
            endDate,
            repId,
            callType,
            outcome,
            search,
            page,
            limit
        });

        if (!result.success) {
            return apiError(result.error, 400);
        }

        return apiSuccess(result.data);
    } catch (err) {
        return apiError(err.message || "Failed to fetch DCR records", 500);
    }
}

/**
 * POST /api/v5/crm/dcr
 * Log a new Daily Call Record
 */
export async function POST(request) {
    try {
        const auth = await validateCrmUserToken(request);
        if (!auth.authenticated) {
            return apiError(auth.error, auth.status || 401);
        }

        const body = await request.json();
        const result = await createDcrRecordAction(auth.workspaceId, body);

        if (!result.success) {
            return apiError(result.error, 400);
        }

        return apiSuccess(result.data, 201);
    } catch (err) {
        return apiError(err.message || "Failed to create DCR record", 500);
    }
}
