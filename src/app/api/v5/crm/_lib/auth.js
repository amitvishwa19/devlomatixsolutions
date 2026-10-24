import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { decrypt } from "@/lib/auth";

/**
 * Standard HTTP Error for API Route Handlers
 */
export class ApiHttpError extends Error {
    constructor(message, status = 400) {
        super(message);
        this.name = "ApiHttpError";
        this.status = status;
    }
}

/**
 * Validate `usertoken` or Bearer token from external request headers/query.
 * Supports:
 * - Header: `authorization: Bearer <token>`
 * - Header: `usertoken: <token>`
 * - Header: `user-token: <token>`
 * - Header: `x-user-token: <token>`
 * - Query: `?usertoken=<token>`
 * - Query/Header fallback: `?userId=<userId>` or `x-user-id`
 */
export async function validateCrmUserToken(request) {
    try {
        const { searchParams } = new URL(request.url);

        const authHeader =
            request.headers.get("authorization") ||
            request.headers.get("usertoken") ||
            request.headers.get("user-token") ||
            request.headers.get("x-user-token");

        const queryToken = searchParams.get("usertoken") || searchParams.get("userToken");
        const tokenRaw = authHeader || queryToken;

        let userId = null;
        let tokenPayload = null;

        if (tokenRaw) {
            const token = tokenRaw.replace(/^Bearer\s+/i, '').trim();
            tokenPayload = await decrypt(token).catch(() => null);

            if (!tokenPayload && token.includes('.')) {
                try {
                    const { decodeJwt } = await import("jose");
                    tokenPayload = decodeJwt(token);
                } catch (e) {}
            }

            if (tokenPayload) {
                userId = tokenPayload?.userId || tokenPayload?.id || tokenPayload?.data?.id || tokenPayload?.data?.userId || null;
            } else if (token.length >= 20 && !token.includes('.')) {
                // If direct raw user ID was provided in header
                const directUser = await prisma.user.findUnique({ where: { id: token } });
                if (directUser) userId = directUser.id;
            }
        }

        // Fallback for NextAuth session (when called from web browser)
        if (!userId) {
            try {
                const { getServerSession } = await import("next-auth");
                const { authOptions } = await import("@/app/api/auth/[...nextauth]/options");
                const session = await getServerSession(authOptions);
                if (session?.user?.userId || session?.user?.id) {
                    userId = session.user.userId || session.user.id;
                }
            } catch (e) {}
        }

        // Fallback for query/header userId (dev or server-to-server)
        if (!userId) {
            const fallbackId = searchParams.get("userId") || request.headers.get("x-user-id");
            if (fallbackId) {
                const userExists = await prisma.user.findUnique({ where: { id: fallbackId } });
                if (userExists) userId = userExists.id;
            }
        }

        // If still not found, check first active user in system for local bypass if explicitly enabled
        if (!userId && process.env.NODE_ENV === 'development') {
            const firstUser = await prisma.user.findFirst();
            if (firstUser) userId = firstUser.id;
        }

        if (!userId) {
            return {
                authenticated: false,
                error: "Unauthorized: Valid usertoken or Bearer token is required.",
                status: 401
            };
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, displayName: true, email: true, role: true, avatar: true, activeSession: true }
        });

        if (!user) {
            return {
                authenticated: false,
                error: "Unauthorized: User account not found.",
                status: 401
            };
        }

        // Single-device mutual exclusivity:
        // If user logged into Web, mobile sessions are immediately revoked
        const isMobileClient = Boolean(
            request.headers.get("x-mobile-app") ||
            request.headers.get("usertoken") ||
            request.headers.get("user-token") ||
            request.headers.get("user-agent")?.includes("Expo") ||
            request.headers.get("user-agent")?.includes("okhttp") ||
            request.headers.get("user-agent")?.includes("CFNetwork") ||
            tokenPayload?.platform === "mobile"
        );

        if (isMobileClient && user.activeSession?.platform === "web") {
            return {
                authenticated: false,
                error: "SESSION_SUPERSEDED: Your account was logged in on Web. Mobile session terminated.",
                status: 401
            };
        }

        // Resolve workspaceId
        let workspaceId =
            searchParams.get("workspaceId") ||
            searchParams.get("workspace_id") ||
            request.headers.get("x-workspace-id") ||
            request.headers.get("workspaceid");

        if (!workspaceId) {
            // Find user's first workspace
            const memberServer = await prisma.member.findFirst({
                where: { userId: user.id },
                select: { serverId: true }
            });
            workspaceId = memberServer?.serverId || 'default-workspace';
        }

        return {
            authenticated: true,
            userId: user.id,
            user,
            workspaceId,
            isMobileClient
        };
    } catch (error) {
        console.error("[CRM_API_AUTH_ERROR]", error);
        return {
            authenticated: false,
            error: error?.message || "Authentication failed",
            status: 401
        };
    }
}

/**
 * Guard Helper: Ensures valid authentication or throws ApiHttpError
 */
export async function requireCrmAuth(request) {
    const auth = await validateCrmUserToken(request);
    if (!auth.authenticated) {
        throw new ApiHttpError(auth.error || "Unauthorized", auth.status || 401);
    }
    return auth;
}
