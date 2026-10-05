import { db } from "@/lib/db";
import { ok, fail, requireUserId } from "../../_lib/helpers";

export const dynamic = "force-dynamic";

/**
 * GET /api/v5/konnectx/templates/search-users
 *
 * Workspace members a template can be shared with. The caller is always
 * excluded — sharing with yourself is a no-op. Returns at most 25 matches.
 */
export async function GET(request) {
    try {
        const userId = await requireUserId(request);
        const { searchParams } = new URL(request.url);

        const workspaceId = searchParams.get("workspaceId");
        const query = (searchParams.get("query") || "").trim();
        const limit = Math.min(
            25,
            Math.max(1, parseInt(searchParams.get("limit") || "25", 10))
        );

        if (!workspaceId) return fail("workspaceId is required", 400);

        // The workspace must actually belong to the caller.
        const workspace = await db.server.findFirst({
            where: {
                id: workspaceId,
                OR: [{ userId }, { members: { some: { userId } } }]
            },
            select: { id: true, userId: true }
        });
        if (!workspace) return fail("Workspace not found", 404);

        // Membership and the free-text filter are independent constraints, so
        // they have to live under AND — two sibling `OR` keys would collide.
        const users = await db.user.findMany({
            where: {
                id: { not: userId },
                isActive: true,
                AND: [
                    {
                        OR: [
                            { id: workspace.userId },
                            { members: { some: { serverId: workspaceId } } }
                        ]
                    },
                    ...(query
                        ? [
                            {
                                OR: [
                                    { email: { contains: query, mode: "insensitive" } },
                                    { username: { contains: query, mode: "insensitive" } },
                                    { displayName: { contains: query, mode: "insensitive" } }
                                ]
                            }
                        ]
                        : [])
                ]
            },
            select: { id: true, email: true, username: true, displayName: true, avatar: true },
            take: limit,
            orderBy: { displayName: "asc" }
        });

        return ok({
            users: users.map((u) => ({
                id: u.id,
                email: u.email,
                username: u.username,
                displayName: u.displayName || u.username || u.email,
                avatar: u.avatar
            }))
        });
    } catch (error) {
        if (error?.status) throw error;
        console.error("[konnectx/templates/search-users] GET failed:", error);
        return fail(error.message || "Failed to search users", 500);
    }
}