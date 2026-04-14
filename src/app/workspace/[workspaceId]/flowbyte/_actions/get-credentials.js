'use server'
import { db } from "@/lib/db"
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

export async function getCredentials({ workspaceId, types } = {}) {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.userId;

    if (!userId) {
        console.error("[getCredentials] Unauthorized: No userId found");
        return [];
    }

    const where = { userId }
    if (workspaceId) where.workspaceId = workspaceId
    if (types && types.length > 0) {
        where.platform = { in: types }
    }

    const credentials = await db.credentials.findMany({
        where,
        orderBy: {
            profile: 'asc'
        }
    });

    // Map profile to name for UI consistency if needed, 
    // but the UI expects 'name' and 'credential_type'.
    return credentials.map(c => ({
        ...c,
        name: c.profile || c.platform,
        credential_type: c.platform
    }))
}
