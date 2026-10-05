import { db } from "@/lib/db";
import { ok, fail, requireUserId } from "../../../_lib/helpers";

export const dynamic = "force-dynamic";

/**
 * POST /api/v5/konnectx/templates/[id]/remove-share
 *
 * Body: `{ sharedWithUserId }`. Revokes one share of the caller's template.
 */
export async function POST(request, { params }) {
    try {
        const userId = await requireUserId(request);
        const { id } = await params;
        const body = await request.json().catch(() => ({}));

        if (!id) return fail("Template id is required", 400);

        const sharedWithUserId = body.sharedWithUserId || body.userId;
        if (!sharedWithUserId) return fail("sharedWithUserId is required", 400);

        // Only the owner may revoke a share.
        const template = await db.messageTemplate.findFirst({
            where: { id, userId },
            select: { id: true }
        });
        if (!template) return fail("Template not found", 404);

        const { count } = await db.templateShare.deleteMany({
            where: { templateId: id, sharedWithUserId }
        });

        if (count === 0) return fail("That template is not shared with the user", 404);

        return ok({ id, sharedWithUserId });
    } catch (error) {
        if (error?.status) throw error;
        console.error("[konnectx/templates/[id]/remove-share] POST failed:", error);
        return fail(error.message || "Failed to remove share", 500);
    }
}