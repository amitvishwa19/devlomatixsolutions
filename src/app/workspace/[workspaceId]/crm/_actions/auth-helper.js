import { prisma } from "@/lib/prisma";
import { getAuthSession } from "@/lib/auth-utils";

/**
 * Resolves a valid User ID that exists in the database.
 * Checks session userId, id, sub, and email, falling back to the first active user
 * to prevent foreign key constraint violations during dev/impersonation.
 */
export async function getValidUserId(workspaceId, session = null) {
    if (!session) {
        try {
            session = await getAuthSession();
        } catch (e) {
            session = null;
        }
    }

    const candidateId = session?.user?.userId || session?.user?.id || session?.user?.sub;
    if (candidateId) {
        const existing = await prisma.user.findUnique({
            where: { id: candidateId },
            select: { id: true }
        });
        if (existing) return existing.id;
    }

    // Try finding user by email
    if (session?.user?.email) {
        const userByEmail = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { id: true }
        });
        if (userByEmail) return userByEmail.id;
    }

    // Fallback to first available database user
    const firstUser = await prisma.user.findFirst({
        select: { id: true }
    });

    if (firstUser) return firstUser.id;

    // Fallback: create a system admin user if database has none
    const systemUser = await prisma.user.create({
        data: {
            displayName: "System Admin",
            email: "admin@devlomatix.com",
            role: "ADMIN"
        }
    });

    return systemUser.id;
}
