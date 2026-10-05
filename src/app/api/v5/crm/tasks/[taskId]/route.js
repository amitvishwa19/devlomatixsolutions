import { validateCrmUserToken } from "../../_lib/auth";
import { apiSuccess, apiError } from "../../_lib/response";
import { updateCrmTaskStatusAction, deleteCrmTaskAction } from "@/app/workspace/[workspaceId]/crm/_actions/crm-task-actions";

/**
 * PATCH /api/v5/crm/tasks/[taskId]
 * Body: { isCompleted }
 */
export async function PATCH(request, { params }) {
    try {
        const auth = await validateCrmUserToken(request);
        if (!auth.authenticated) return apiError(auth.error, auth.status);

        const { taskId } = await params;
        const body = await request.json();

        const isCompleted = body.isCompleted !== undefined ? !!body.isCompleted : true;

        const res = await updateCrmTaskStatusAction(auth.workspaceId, taskId, isCompleted);

        if (!res.success) {
            return apiError(res.error || "Failed to update task", 400);
        }

        return apiSuccess(res.data, { message: "Task updated successfully" });
    } catch (error) {
        console.error("[API_CRM_UPDATE_TASK_ERROR]", error);
        return apiError(error.message || "Failed to update task", 500);
    }
}

/**
 * DELETE /api/v5/crm/tasks/[taskId]
 */
export async function DELETE(request, { params }) {
    try {
        const auth = await validateCrmUserToken(request);
        if (!auth.authenticated) return apiError(auth.error, auth.status);

        const { taskId } = await params;

        const res = await deleteCrmTaskAction(auth.workspaceId, taskId);

        if (!res.success) {
            return apiError(res.error || "Failed to delete task", 400);
        }

        return apiSuccess({ id: taskId }, { message: "Task deleted successfully" });
    } catch (error) {
        console.error("[API_CRM_DELETE_TASK_ERROR]", error);
        return apiError(error.message || "Failed to delete task", 500);
    }
}
