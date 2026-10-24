import { validateCrmUserToken } from "../../_lib/auth";
import { apiSuccess, apiError } from "../../_lib/response";
import { getLogs } from "../../_lib/automations";

/**
 * GET /api/v5/crm/automations/logs
 */
export async function GET(request) {
    try {
        const auth = await validateCrmUserToken(request);
        if (!auth.authenticated) return apiError(auth.error, auth.status);

        return apiSuccess(getLogs(auth.workspaceId));
    } catch (error) {
        console.error("[API_CRM_GET_AUTOMATION_LOGS_ERROR]", error);
        return apiError(error.message || "Failed to fetch automation logs", 500);
    }
}
