import { validateCrmUserToken } from "../_lib/auth";
import { apiSuccess, apiError } from "../_lib/response";
import { getCrmTasksAction, createCrmTaskAction } from "@/app/workspace/[workspaceId]/crm/_actions/crm-task-actions";

/**
 * GET /api/v5/crm/tasks
 * Query: status, type, priority, dealId, contactId
 */
export async function GET(request) {
    try {
        const auth = await validateCrmUserToken(request);
        if (!auth.authenticated) return apiError(auth.error, auth.status);

        const { searchParams } = new URL(request.url);
        const status = searchParams.get("status") || "ALL";
        const type = searchParams.get("type");
        const priority = searchParams.get("priority");
        const dealId = searchParams.get("dealId");
        const contactId = searchParams.get("contactId");

        const res = await getCrmTasksAction(auth.workspaceId, {
            status,
            type,
            priority,
            dealId,
            contactId
        });

        if (!res.success) {
            return apiError(res.error || "Failed to fetch tasks", 400);
        }

        return apiSuccess(res.data);
    } catch (error) {
        console.error("[API_CRM_GET_TASKS_ERROR]", error);
        return apiError(error.message || "Failed to fetch tasks", 500);
    }
}

/**
 * POST /api/v5/crm/tasks
 * Body: { title, description, type, priority, dueDate, dealId, contactId, assignedTo }
 */
export async function POST(request) {
    try {
        const auth = await validateCrmUserToken(request);
        if (!auth.authenticated) return apiError(auth.error, auth.status);

        const body = await request.json();
        const res = await createCrmTaskAction(auth.workspaceId, body);

        if (!res.success) {
            return apiError(res.error || "Failed to create task", 400);
        }

        return apiSuccess(res.data, { message: "Task scheduled successfully" }, 201);
    } catch (error) {
        console.error("[API_CRM_CREATE_TASK_ERROR]", error);
        return apiError(error.message || "Failed to schedule task", 500);
    }
}
