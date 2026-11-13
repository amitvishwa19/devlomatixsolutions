import { db } from "@/lib/db";

/**
 * Universal Server-Side Workspace Resolver for API v5
 *
 * Resolves the effective workspaceId for any authenticated request without requiring
 * client-side workspace tracking or parameters.
 *
 * Priority:
 * 1. Explicit request param, header, or body (optional backwards compatibility for Web)
 * 2. User's owned default workspace (`Server` where `userId` and `default: true`)
 * 3. Any owned workspace (`Server` where `userId`)
 * 4. Any organization membership (`Member` where `userId`)
 * 5. Auto-provisioning: creates a default workspace on-the-fly for fresh accounts
 *
 * @param {string} userId - The authenticated user's ID
 * @param {Request|URL|null} request - Optional request object to check for explicit overrides
 * @param {object|null} body - Optional parsed body object to check for explicit overrides
 * @returns {Promise<string>} The effective workspace ID
 */
export async function resolveEffectiveWorkspaceId(userId, request = null, body = null) {
  if (!userId) return null;

  // 1. Check for explicit overrides from request (backwards-compatible for web multi-workspace switcher)
  if (body?.workspaceId || body?.workspace_id) {
    return String(body.workspaceId || body.workspace_id);
  }

  if (request) {
    try {
      const url = typeof request.url === "string" ? new URL(request.url) : null;
      if (url) {
        const queryWs = url.searchParams.get("workspaceId") || url.searchParams.get("workspace_id");
        if (queryWs) return queryWs;
      }
      if (request.headers && typeof request.headers.get === "function") {
        const headerWs =
          request.headers.get("x-workspace-id") ||
          request.headers.get("workspaceid") ||
          request.headers.get("workspace-id");
        if (headerWs) return headerWs;
      }
    } catch {
      // Ignored
    }
  }

  try {
    // 2. Check for owned default workspace
    const defaultOwned = await db.server.findFirst({
      where: { userId, default: true },
      select: { id: true },
    });
    if (defaultOwned?.id) return defaultOwned.id;

    // 3. Check for any owned workspace
    const anyOwned = await db.server.findFirst({
      where: { userId },
      orderBy: { createdAt: "asc" },
      select: { id: true },
    });
    if (anyOwned?.id) return anyOwned.id;

    // 4. Check for membership in any workspace
    const memberWs = await db.member.findFirst({
      where: { userId },
      select: { serverId: true },
    });
    if (memberWs?.serverId) return memberWs.serverId;

    // 5. Auto-provision default workspace if none exists
    const newWs = await db.server.create({
      data: {
        userId,
        name: "Default Workspace",
        inviteCode: `inv_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        default: true,
        type: "default",
      },
      select: { id: true },
    });
    return newWs.id;
  } catch (err) {
    console.error("[WORKSPACE_RESOLVER_ERROR]", err);
    return "default-workspace";
  }
}
