import { db } from "@/lib/db";
import { ok, fail, requireUserId } from "../../../_lib/helpers";

export const dynamic = "force-dynamic";

/**
 * POST /api/v5/konnectx/templates/[id]/share
 *
 * Body: `{ email }` or `{ sharedWithUserId }`.
 * Shares one of the caller's templates with another user.
 */
export async function POST(request, { params }) {
    try {
        const userId = await requireUserId(request);
        const { id } = await params;
        const body = await request.json().catch(() => ({}));

        if (!id) return fail("Template id is required", 400);

        const template = await db.messageTemplate.findFirst({
            where: { id, userId },
            select: { id: true }
        });
        if (!template) return fail("Template not found", 404);

        const sharedWithUserId =
            body.sharedWithUserId ||
            (body.email
                ? (
                    await db.user.findUnique({
                        where: { email: String(body.email).trim().toLowerCase() },
                        select: { id: true }
                    })
                )?.id
                : null);

        if (!sharedWithUserId) return fail("No matching user for that email", 404);
        if (sharedWithUserId === userId) {
            return fail("You already own this template", 400);
        }

        const existing = await db.templateShare.findUnique({
            where: {
                templateId_sharedWithUserId: { templateId: id, sharedWithUserId }
            },
            select: { id: true }
        });
        if (existing) return fail("Template is already shared with that user", 409);

        const share = await db.templateShare.create({
            data: { templateId: id, sharedWithUserId },
            include: { sharedWith: { select: { id: true, email: true, displayName: true, avatar: true } } }
        });

        return ok({ share });
    } catch (error) {
        if (error?.status) throw error;
        console.error("[konnectx/templates/[id]/share] POST failed:", error);
        return fail(error.message || "Failed to share template", 500);
    }
}

/**
 * DELETE /api/v5/konnectx/templates/[id]/share?sharedWithUserId=...
 */
export async function DELETE(request, { params }) {
    try {
        const userId = await requireUserId(request);
        const { id } = await params;
        const { searchParams } = new URL(request.url);
        const sharedWithUserId = searchParams.get("sharedWithUserId");

        if (!id) return fail("Template id is required", 400);
        if (!sharedWithUserId) return fail("sharedWithUserId is required", 400);

        const template = await db.messageTemplate.findFirst({
            where: { id, userId },
            select: { id: true }
        });
        if (!template) return fail("Template not found", 404);

        await db.templateShare.deleteMany({ where: { templateId: id, sharedWithUserId } });

        return ok({ id, sharedWithUserId });
    } catch (error) {
        if (error?.status) throw error;
        console.error("[konnectx/templates/[id]/share] DELETE failed:", error);
        return fail(error.message || "Failed to remove share", 500);
    }
}