import { NextResponse } from "next/server";
import { validateCrmUserToken } from "../_lib/auth";
import { apiSuccess, apiError } from "../_lib/response";
import {
    getDcrRecordsAction,
    createDcrRecordAction,
    updateDcrRecordAction,
    deleteDcrRecordAction
} from "@/app/workspace/[workspaceId]/crm/_actions/dcr-actions";

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

        // Normalize latitude / longitude to geolocation object if passed flat
        if ((body.latitude !== undefined || body.longitude !== undefined) && !body.geolocation) {
            body.geolocation = {
                latitude: body.latitude,
                longitude: body.longitude,
                capturedAt: new Date().toISOString()
            };
        }

        const result = await createDcrRecordAction(auth.workspaceId, body);

        if (!result.success) {
            return apiError(result.error, 400);
        }

        return apiSuccess(result.data, 201);
    } catch (err) {
        return apiError(err.message || "Failed to create DCR record", 500);
    }
}

/**
 * PATCH /api/v5/crm/dcr
 * Update a DCR record (pass id in body or query param ?id=...)
 */
export async function PATCH(request) {
    try {
        const auth = await validateCrmUserToken(request);
        if (!auth.authenticated) return apiError(auth.error, auth.status || 401);

        const { searchParams } = new URL(request.url);
        const body = await request.json();
        const dcrId = body.id || body.dcrId || searchParams.get("id");

        if (!dcrId) return apiError("Record ID is required for update", 400);

        if ((body.latitude !== undefined || body.longitude !== undefined) && !body.geolocation) {
            body.geolocation = {
                latitude: body.latitude,
                longitude: body.longitude,
                capturedAt: new Date().toISOString()
            };
        }

        const result = await updateDcrRecordAction(auth.workspaceId, dcrId, body);
        if (!result.success) {
            return apiError(result.error || "Failed to update DCR record", 400);
        }

        return apiSuccess(result.data, { message: "DCR record updated successfully" });
    } catch (err) {
        return apiError(err.message || "Failed to update DCR record", 500);
    }
}

/**
 * DELETE /api/v5/crm/dcr
 * Delete a DCR record (pass id in body or query param ?id=...)
 */
export async function DELETE(request) {
    try {
        const auth = await validateCrmUserToken(request);
        if (!auth.authenticated) return apiError(auth.error, auth.status || 401);

        const { searchParams } = new URL(request.url);
        let dcrId = searchParams.get("id");
        if (!dcrId) {
            const body = await request.json().catch(() => ({}));
            dcrId = body?.id || body?.dcrId;
        }

        if (!dcrId) return apiError("Record ID is required for deletion", 400);

        const result = await deleteDcrRecordAction(auth.workspaceId, dcrId);
        if (!result.success) {
            return apiError(result.error || "Failed to delete DCR record", 400);
        }

        return apiSuccess({ id: dcrId }, { message: "DCR record deleted successfully" });
    } catch (err) {
        return apiError(err.message || "Failed to delete DCR record", 500);
    }
}
