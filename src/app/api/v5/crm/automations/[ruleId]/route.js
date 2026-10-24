import { validateCrmUserToken } from "../../_lib/auth";
import { apiSuccess, apiError } from "../../_lib/response";
import { toggleRule, deleteRule } from "../../_lib/automations";

/**
 * PATCH /api/v5/crm/automations/[ruleId]
 * Toggles the rule active state.
 */
export async function PATCH(request, { params }) {
    try {
        const auth = await validateCrmUserToken(request);
        if (!auth.authenticated) return apiError(auth.error, auth.status);

        const { ruleId } = await params;
        const rule = toggleRule(auth.workspaceId, ruleId);
        if (!rule) return apiError("Automation rule not found", 404);

        return apiSuccess(rule, { message: rule.isActive ? "Automation activated" : "Automation paused" });
    } catch (error) {
        console.error("[API_CRM_TOGGLE_AUTOMATION_ERROR]", error);
        return apiError(error.message || "Failed to toggle automation", 500);
    }
}

/**
 * DELETE /api/v5/crm/automations/[ruleId]
 */
export async function DELETE(request, { params }) {
    try {
        const auth = await validateCrmUserToken(request);
        if (!auth.authenticated) return apiError(auth.error, auth.status);

        const { ruleId } = await params;
        deleteRule(auth.workspaceId, ruleId);
        return apiSuccess({ id: ruleId }, { message: "Automation deleted" });
    } catch (error) {
        console.error("[API_CRM_DELETE_AUTOMATION_ERROR]", error);
        return apiError(error.message || "Failed to delete automation", 500);
    }
}
