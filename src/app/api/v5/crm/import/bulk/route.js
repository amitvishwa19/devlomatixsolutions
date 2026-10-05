import { NextResponse } from "next/server";
import { validateCrmUserToken } from "../../_lib/auth";
import { apiSuccess, apiError } from "../../_lib/response";
import { bulkImportContactsAndDealsAction } from "@/app/workspace/[workspaceId]/crm/_actions/crm-import-sync-actions";

/**
 * POST /api/v5/crm/import/bulk
 * Bulk ingestion of Contacts, Accounts, and Deals with validation and deduplication
 */
export async function POST(request) {
    try {
        const auth = await validateCrmUserToken(request);
        if (!auth.authenticated) {
            return apiError(auth.error, auth.status || 401);
        }

        const body = await request.json().catch(() => ({}));
        const { rows, options = {} } = body;

        if (!Array.isArray(rows) || rows.length === 0) {
            return apiError("Request body must include a non-empty 'rows' array.", 400);
        }

        const result = await bulkImportContactsAndDealsAction(auth.workspaceId, rows, options);
        if (!result.success) {
            return apiError(result.error, 400);
        }

        return apiSuccess(result.data, "Bulk import completed successfully.");
    } catch (err) {
        return apiError(err.message || "Failed to execute bulk import", 500);
    }
}
