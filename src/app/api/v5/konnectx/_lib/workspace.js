import { db } from "@/lib/db";
import { getUserIdFromRequest } from "./helpers";

/** Thrown for expected 4xx failures so route handlers can `throw error`. */
export class HttpError extends Error {
    constructor(message, status = 400) {
        super(message);
        this.name = "HttpError";
        this.status = status;
    }
}

/**
 * Resolves the user id without the "throw when missing" behaviour of
 * `requireUserId`, so this module can be reused by GET handlers that would
 * rather surface a 401 themselves.
 */
export async function resolveUserId(request) {
    return getUserIdFromRequest(request);
}

/**
 * Resolves `workspaceId` from the query or body and verifies the caller is a
 * member of it. Throws 404 when the workspace exists but the caller is not in
 * it, rather than 403, so membership is not enumerable.
 */
export async function requireWorkspaceMembership(request, userId, body) {
    const { searchParams } = new URL(request.url);
    const workspaceId =
        body?.workspaceId ||
        searchParams.get("workspaceId") ||
        searchParams.get("workspace_id") ||
        null;

    if (!workspaceId) throw new HttpError("workspaceId is required", 400);

    const workspace = await db.server.findFirst({
        where: {
            id: workspaceId,
            OR: [{ userId }, { members: { some: { userId } } }]
        },
        select: { id: true, userId: true }
    });

    if (!workspace) throw new HttpError("Workspace not found", 404);

    return { workspaceId, workspace };
}

/**
 * The user ids that make up a workspace team: the owner plus every member.
 * Used to scope reports to the whole team rather than a single account.
 */
export async function getWorkspaceTeamUserIds(workspaceId, currentUserId) {
    const workspace = await db.server.findUnique({
        where: { id: workspaceId },
        include: { members: true }
    }).catch(() => null);

    return [
        ...new Set(
            [
                currentUserId,
                workspace?.userId,
                ...((workspace?.members || []).map((m) => m.userId))
            ].filter(Boolean)
        )
    ];
}