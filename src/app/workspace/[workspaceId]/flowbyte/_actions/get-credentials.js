'use server'
import { db } from "@/lib/db"
import { getSession } from "@/lib/auth"

export async function getCredentials({ workspaceId, types } = {}) {
    const session = await getSession()
    const userId = session?.data?.id

    if (!userId) return []

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
