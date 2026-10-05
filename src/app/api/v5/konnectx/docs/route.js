import { db } from "@/lib/db";
import { created, fail, ok, requireUserId } from "../_lib/helpers";

export const dynamic = "force-dynamic";

/**
 * Scopes documents to the caller: rows they own plus rows shared with them
 * through the `members` list. An explicit `workspaceId` narrows it further
 * and is only honoured when the caller actually belongs to that workspace.
 *
 * The previous implementation returned every workspace document in the
 * database and deleted by bare `id`.
 */
async function documentScope(userId, requestedWorkspaceId) {
    const base = {
        OR: [{ userId }, { members: { has: userId } }]
    };

    if (!requestedWorkspaceId) return base;

    const workspace = await db.server.findFirst({
        where: {
            id: requestedWorkspaceId,
            OR: [{ userId }, { members: { some: { userId } } }]
        },
        select: { id: true }
    });

    if (!workspace) return { AND: [{ id: "__no_access__" }] };

    return { AND: [base, { workspaceId: workspace.id }] };
}

/** Falls back to a workspace the caller owns or is a member of. */
async function resolveWorkspaceId(userId) {
    const workspace = await db.server.findFirst({
        where: { OR: [{ userId }, { members: { some: { userId } } }] },
        select: { id: true }
    });
    return workspace?.id || null;
}

/** GET /api/v5/konnectx/docs?category=&search= */
export async function GET(request) {
    try {
        const userId = await requireUserId(request);
        const { searchParams } = new URL(request.url);
        const category = searchParams.get("category");
        const search = (searchParams.get("search") || "").trim();

        const documents = await db.workspaceDocument.findMany({
            where: {
                AND: [
                    await documentScope(userId, searchParams.get("workspaceId")),
                    { deletedAt: null },
                    ...(category && category !== 'ALL' ? [{ category }] : []),
                    ...(search
                        ? [
                            {
                                OR: [
                                    { name: { contains: search, mode: "insensitive" } },
                                    { description: { contains: search, mode: "insensitive" } }
                                ]
                            }
                        ]
                        : [])
                ]
            },
            orderBy: { updatedAt: "desc" }
        });

        return ok({ documents });
    } catch (error) {
        if (error?.status) throw error;
        console.error("[konnectx/docs] GET failed:", error);
        return fail(error.message || "Failed to fetch documents", 500);
    }
}

/**
 * POST /api/v5/konnectx/docs
 *
 * `WorkspaceDocument` has a required `workspaceId` and names its text column
 * `name`; the old body used `title` and never set the workspace, so creating a
 * document failed outright.
 */
export async function POST(request) {
    try {
        const userId = await requireUserId(request);
        const body = await request.json().catch(() => ({}));
        const { searchParams } = new URL(request.url);

        const name = String(body.name || body.title || "").trim();
        const content = body.content ?? "";

        if (!name || !String(content).trim()) {
            return fail("Title and content are required", 400);
        }

        const workspaceId =
            body.workspaceId ||
            searchParams.get("workspaceId") ||
            (await resolveWorkspaceId(userId));

        if (!workspaceId) {
            return fail("Workspace is required to save a document", 400);
        }

        // Editing an existing document still requires ownership.
        if (body.id) {
            const existing = await db.workspaceDocument.findFirst({
                where: { id: body.id, userId },
                select: { id: true }
            });
            if (!existing) return fail("Document not found", 404);

            const document = await db.workspaceDocument.update({
                where: { id: body.id },
                data: {
                    name,
                    content: String(content),
                    description: body.description ?? null,
                    category: body.category || "GENERAL"
                }
            });

            return created({ document });
        }

        const document = await db.workspaceDocument.create({
            data: {
                workspaceId,
                userId,
                name,
                content: String(content),
                description: body.description ?? null,
                category: body.category || "GENERAL"
            }
        });

        return created({ document }, 201);
    } catch (error) {
        if (error?.status) throw error;
        console.error("[konnectx/docs] POST failed:", error);
        return fail(error.message || "Failed to save document", 500);
    }
}

/** DELETE /api/v5/konnectx/docs?id= */
export async function DELETE(request) {
    try {
        const userId = await requireUserId(request);
        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");

        if (!id) return fail("Document id is required", 400);

        const existing = await db.workspaceDocument.findFirst({
            where: { id, userId },
            select: { id: true }
        });
        if (!existing) return fail("Document not found", 404);

        await db.workspaceDocument.update({
            where: { id },
            data: { deletedAt: new Date() }
        });

        return ok({ id });
    } catch (error) {
        if (error?.status) throw error;
        console.error("[konnectx/docs] DELETE failed:", error);
        return fail(error.message || "Failed to delete document", 500);
    }
}