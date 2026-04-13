'use server'
import { db } from "@/lib/db"
import { getSession } from "@/lib/auth"

export async function getCredentials() {
    const session = await getSession()
    const userId = session?.data?.id

    if (!userId) return []

    const credentials = await db.credentials.findMany({
        where: { userId },
        orderBy: {
            platform: 'asc'
        }
    });

    return credentials
}
