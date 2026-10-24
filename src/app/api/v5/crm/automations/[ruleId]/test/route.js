import { validateCrmUserToken } from "../../../_lib/auth";
import { apiSuccess, apiError } from "../../../_lib/response";
import { testRule } from "../../../_lib/automations";

/**
 * POST /api/v5/crm/automations/[ruleId]/test
 */
export async function POST(request, { params }) {
    try {
        const auth = await validateCrmUserToken(request);
        if (!auth.authenticated) return apiError(auth.error, auth.status);

        const { ruleId } = await params;
        const result = testRule(auth.workspaceId, ruleId);
        if (!result) return apiError("Automation rule not found", 404);

        return apiSuccess(result, { message: "Test run completed" });
    } catch (error) {
        console.error("[API_CRM_TEST_AUTOMATION_ERROR]", error);
        return apiError(error.message || "Failed to test automation", 500);
    }
}
