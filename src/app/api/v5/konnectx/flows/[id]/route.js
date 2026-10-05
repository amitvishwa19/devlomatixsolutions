import { db } from "@/lib/db";
import { ok, fail, requireUserId } from "../../_lib/helpers";

export const dynamic = "force-dynamic";

/**
 * Loads a flow owned by the caller.
 *
 * `WhatsAppFlow` was previously reachable through a bare `id`, letting any
 * caller read, rewrite or delete another tenant's flow. Ownership is checked
 * on every verb now, and a foreign id reports 404 so ids stay unenumerable.
 */
async function findOwnedFlow(id, userId) {
    if (!id) return { error: fail("Flow id is required", 400) };

    const flow = await db.whatsAppFlow.findFirst({
        where: { id, userId },
        select: { id: true }
    });

    if (!flow) return { error: fail("Flow not found", 404) };
    return { flow };
}

/** GET /api/v5/konnectx/flows/[id] — single flow with its screens and DSL. */
export async function GET(request, { params }) {
    try {
        const userId = await requireUserId(request);
        const { id } = await params;

        const owned = await findOwnedFlow(id, userId);
        if (owned.error) return owned.error;

        const flow = await db.whatsAppFlow.findUnique({ where: { id } });

        return ok({ flow });
    } catch (error) {
        if (error?.status) throw error;
        console.error("[konnectx/flows/[id]] GET failed:", error);
        return fail(error.message || "Failed to fetch flow", 500);
    }
}

/** PUT /api/v5/konnectx/flows/[id] */
export async function PUT(request, { params }) {
    try {
        const userId = await requireUserId(request);
        const { id } = await params;
        const body = await request.json().catch(() => ({}));

        const owned = await findOwnedFlow(id, userId);
        if (owned.error) return owned.error;

        const updateData = {};
        if (body.name !== undefined) updateData.name = body.name;
        if (body.description !== undefined) updateData.description = body.description;
        if (body.screens !== undefined) updateData.screens = body.screens;
        if (body.definition !== undefined) updateData.definition = body.definition;
        if (body.categories !== undefined) updateData.categories = body.categories;
        if (body.status !== undefined) updateData.status = body.status;
        if (body.flowId !== undefined) updateData.flowId = body.flowId;
        if (body.endpointUrl !== undefined) updateData.endpointUrl = body.endpointUrl;
        if (body.metaValidationErrors !== undefined) {
            updateData.metaValidationErrors = body.metaValidationErrors;
        }

        const flow = await db.whatsAppFlow.update({ where: { id }, data: updateData });

        return ok({ flow });
    } catch (error) {
        if (error?.status) throw error;
        console.error("[konnectx/flows/[id]] PUT failed:", error);
        return fail(error.message || "Failed to update flow", 500);
    }
}

/** DELETE /api/v5/konnectx/flows/[id] */
export async function DELETE(request, { params }) {
    try {
        const userId = await requireUserId(request);
        const { id } = await params;

        const owned = await findOwnedFlow(id, userId);
        if (owned.error) return owned.error;

        await db.whatsAppFlow.delete({ where: { id } });

        return ok({ id });
    } catch (error) {
        if (error?.status) throw error;
        console.error("[konnectx/flows/[id]] DELETE failed:", error);
        return fail(error.message || "Failed to delete flow", 500);
    }
}