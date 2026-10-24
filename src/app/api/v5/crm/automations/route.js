import { validateCrmUserToken } from "../_lib/auth";
import { apiSuccess, apiError } from "../_lib/response";
import { getRules, createRule } from "../_lib/automations";

/**
 * GET /api/v5/crm/automations
 */
export async function GET(request) {
    try {
        const auth = await validateCrmUserToken(request);
        if (!auth.authenticated) return apiError(auth.error, auth.status);

        return apiSuccess(getRules(auth.workspaceId));
    } catch (error) {
        console.error("[API_CRM_GET_AUTOMATIONS_ERROR]", error);
        return apiError(error.message || "Failed to fetch automations", 500);
    }
}

/**
 * POST /api/v5/crm/automations
 * Body: { name, description, category, triggerEvent, triggerStageName, conditions, actions }
 */
export async function POST(request) {
    try {
        const auth = await validateCrmUserToken(request);
        if (!auth.authenticated) return apiError(auth.error, auth.status);

        const body = await request.json();
        if (!body?.name?.trim()) return apiError("Automation name is required", 400);

        const rule = createRule(auth.workspaceId, body);
        return apiSuccess(rule, { message: "Automation created successfully" }, 201);
    } catch (error) {
        console.error("[API_CRM_CREATE_AUTOMATION_ERROR]", error);
        return apiError(error.message || "Failed to create automation", 500);
    }
}
