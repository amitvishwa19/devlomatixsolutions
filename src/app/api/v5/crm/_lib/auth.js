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

        if (tokenRaw) {
            const token = tokenRaw.replace(/^Bearer\s+/i, '').trim();
            const payload = await decrypt(token).catch(() => null);

            if (payload) {
                userId = payload?.userId || payload?.id || payload?.data?.id || payload?.data?.userId || null;
            } else if (token.length >= 20 && !token.includes('.')) {
                // If direct raw user ID was provided in header
                const directUser = await prisma.user.findUnique({ where: { id: token } });
                if (directUser) userId = directUser.id;
            }
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
            select: { id: true, displayName: true, email: true, role: true, avatar: true }
        });

        if (!user) {
            return {
                authenticated: false,
                error: "Unauthorized: User account not found.",
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
            workspaceId
        };
    } catch (error) {
        console.error("[CRM_API_AUTH_ERROR]", error);
        return {
            authenticated: false,
            error: "Authentication failed",
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
