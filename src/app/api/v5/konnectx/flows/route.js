import { db } from "@/lib/db";
import { created, fail, ok, requireUserId } from "../_lib/helpers";

export const dynamic = "force-dynamic";

/**
 * GET /api/v5/konnectx/flows
 *
 * Lists WhatsApp Flows for the caller. Scoped to the verified `userId` — the
 * previous implementation returned every tenant's flows in one payload.
 */
export async function GET(request) {
    try {
        const userId = await requireUserId(request);
        const { searchParams } = new URL(request.url);
        const workspaceId = searchParams.get("workspaceId");

        const flows = await db.whatsAppFlow.findMany({
            where: {
                userId,
                ...(workspaceId ? { workspaceId } : {})
            },
            orderBy: { updatedAt: "desc" }
        });

        return ok({ flows });
    } catch (error) {
        if (error?.status) throw error;
        console.error("[konnectx/flows] GET failed:", error);
        return fail(error.message || "Failed to fetch flows", 500);
    }
}

/**
 * POST /api/v5/konnectx/flows
 *
 * `workspaceId` is required by the schema, so it is resolved from the caller
 * (body, query, or their active workspace) instead of being written blindly.
 */
export async function POST(request) {
    try {
        const userId = await requireUserId(request);
        const body = await request.json().catch(() => ({}));
        const { searchParams } = new URL(request.url);

        if (!body.name || !String(body.name).trim()) {
            return fail("Flow name is required", 400);
        }

        const workspaceId =
            body.workspaceId ||
            searchParams.get("workspaceId") ||
            (await resolveWorkspaceId(userId));

        if (!workspaceId) {
            return fail("Workspace is required to create a flow", 400);
        }

        const flow = await db.whatsAppFlow.create({
            data: {
                workspaceId,
                userId,
                name: String(body.name).trim(),
                description: body.description ?? null,
                screens: body.screens || [],
                definition: body.definition ?? null,
                categories: Array.isArray(body.categories) && body.categories.length
                    ? body.categories
                    : ["OTHER"],
                status: body.status || "DRAFT"
            }
        });

        return created({ flow }, 201);
    } catch (error) {
        if (error?.status) throw error;
        console.error("[konnectx/flows] POST failed:", error);
        return fail(error.message || "Failed to create flow", 500);
    }
}

/** Falls back to a workspace the caller owns or is a member of. */
async function resolveWorkspaceId(userId) {
    const workspace = await db.server.findFirst({
        where: { OR: [{ userId }, { members: { some: { userId } } }] },
        select: { id: true }
    });
    return workspace?.id || null;
}