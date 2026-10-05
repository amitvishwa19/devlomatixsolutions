import { db } from "@/lib/db";
import { created, fail, ok, requireUserId } from "../../_lib/helpers";

export const dynamic = "force-dynamic";

/**
 * Verifies the template belongs to the caller.
 *
 * `MessageTemplate` was previously readable and writable through a bare `id`,
 * letting any caller rewrite or delete another tenant's template. Ownership is
 * checked up front and a foreign id reports 404.
 */
async function findOwnedTemplate(id, userId) {
    if (!id) return { error: fail("Template id is required", 400) };

    const template = await db.messageTemplate.findFirst({
        where: { id, userId },
        select: { id: true }
    });

    if (!template) return { error: fail("Template not found", 404) };
    return { template };
}

/** GET /api/v5/konnectx/templates/[id] */
export async function GET(request, { params }) {
    try {
        const userId = await requireUserId(request);
        const { id } = await params;

        const owned = await findOwnedTemplate(id, userId);
        if (owned.error) return owned.error;

        const template = await db.messageTemplate.findUnique({ where: { id } });

        return ok({ template });
    } catch (error) {
        if (error?.status) throw error;
        console.error("[konnectx/templates/[id]] GET failed:", error);
        return fail(error.message || "Failed to fetch template", 500);
    }
}

/** PUT /api/v5/konnectx/templates/[id] */
export async function PUT(request, { params }) {
    try {
        const userId = await requireUserId(request);
        const { id } = await params;
        const body = await request.json().catch(() => ({}));

        const owned = await findOwnedTemplate(id, userId);
        if (owned.error) return owned.error;

        const updateData = {};
        if (body.name !== undefined) updateData.name = body.name;
        if (body.category !== undefined) updateData.category = body.category;
        if (body.language !== undefined) updateData.language = body.language;
        if (body.type !== undefined) updateData.type = body.type;
        if (body.body !== undefined) updateData.body = body.body;
        if (body.footer !== undefined) updateData.footer = body.footer;
        if (body.buttons !== undefined) updateData.buttons = body.buttons;
        if (body.metadata !== undefined) updateData.metadata = body.metadata;
        if (body.status !== undefined) updateData.status = body.status;

        const template = await db.messageTemplate.update({ where: { id }, data: updateData });

        return created({ template });
    } catch (error) {
        if (error?.status) throw error;
        console.error("[konnectx/templates/[id]] PUT failed:", error);
        return fail(error.message || "Failed to update template", 500);
    }
}

/** DELETE /api/v5/konnectx/templates/[id] */
export async function DELETE(request, { params }) {
    try {
        const userId = await requireUserId(request);
        const { id } = await params;

        const owned = await findOwnedTemplate(id, userId);
        if (owned.error) return owned.error;

        await db.messageTemplate.delete({ where: { id } });

        return ok({ id });
    } catch (error) {
        if (error?.status) throw error;
        console.error("[konnectx/templates/[id]] DELETE failed:", error);
        return fail(error.message || "Failed to delete template", 500);
    }
}