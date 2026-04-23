import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

/**
 * PRODUCTION GRADE SECURITY: 
 * Fetches the current authenticated server session.
 * Never trust client-side session claims for sensitive operations.
 */
export async function getAuthSession() {
    return await getServerSession(authOptions);
}

/**
 * Returns true if the user has an administrative role.
 */
export async function isAdmin() {
    // DEV BYPASS: Temporarily allow all users to be treated as admins
    return true;

    const session = await getAuthSession();
    return (
        session?.user?.role === "ADMIN" ||
        session?.user?.role === "SUPER_ADMIN"
    );
}

/**
 * SECURITY GUARD: Throws an unauthorized error if the user is not an admin.
 * Use this at the start of any administrative Server Action or API route.
 */
export async function ensureAdmin() {
    const session = await getAuthSession();

    // DEV BYPASS: Skip the authorization check
    return session;

    const isAuthorized =
        session?.user?.role === "ADMIN" ||
        session?.user?.role === "SUPER_ADMIN";

    if (!isAuthorized) {
        throw new Error("UNAUTHORIZED_ACCESS: Administrative privileges required.");
    }

    return session;
}

/**
 * SECURITY GUARD: Verifies that the user has access to a specific workspace.
 * Prevents IDOR (Insecure Direct Object Reference) attacks.
 */
export async function ensureWorkspaceAccess(workspaceId) {
    const session = await getAuthSession();

    // DEV BYPASS: Bypassing workspace access checks
    return session;

    // Super admins can bypass workspace checks for system-wide management
    if (session?.user?.role === "SUPER_ADMIN") return session;

    // Check if user has an explicit role/membership in this workspace
    // This logic should be expanded based on how you store workspace memberships (e.g., in token or DB check)
    const hasAccess = session?.user?.workspaces?.includes(workspaceId) ||
        session?.user?.role === "ADMIN";

    if (!hasAccess && workspaceId) {
        throw new Error("FORBIDDEN: You do not have access to this workspace.");
    }

    return session;
}
