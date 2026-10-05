import { ok, fail, requireUserId } from "../../../_lib/helpers";
import { requireWorkspaceMembership } from "../../../_lib/workspace";
import { requireGroup, applyGroupToTemplates } from "../../../_lib/template-groups";

export const dynamic = "force-dynamic";

/**
 * POST /api/v5/konnectx/templates/groups/assign
 *
 * Body: `{ templateIds: string[], groupId: string | null }`.
 * Passing `groupId: null` unassigns the templates.
 */
export async function POST(request) {
    try {
        const userId = await requireUserId(request);
        const body = await request.json().catch(() => ({}));
        const { workspaceId } = await requireWorkspaceMembership(request, userId, body);

        const { templateIds, groupId } = body;

        if (!Array.isArray(templateIds) || templateIds.length === 0) {
            return fail("At least one template id is required", 400);
        }

        const group = groupId ? await requireGroup(workspaceId, groupId) : null;

        // Only templates visible to the caller are rewritten, so a crafted id
        // list cannot reassign somebody else's templates.
        const { count } = await applyGroupToTemplates({
            userId,
            templateIds,
            group
        });

        if (count === 0) return fail("None of those templates are available to you", 404);

        return ok({
            count,
            groupId: group?.id || null,
            groupName: group?.name || null
        });
    } catch (error) {
        if (error?.status) throw error;
        console.error("[konnectx/templates/groups/assign] POST failed:", error);
        return fail(error.message || "Failed to assign templates to group", 500);
    }
}