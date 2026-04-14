'use server'
import { db } from "@/lib/db"
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { revalidatePath } from "next/cache"

export async function createCredential({ workspaceId, name, type, value }) {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.userId;
    if (!userId) throw new Error("Unauthorized")

    const credential = await db.credentials.create({
        data: {
            userId,
            workspaceId,
            platform: type,
            profile: name,
            credentials: { value },
            status: "connected"
        }
    })

    revalidatePath(`/workspace/${workspaceId}/flowbyte/credentials`)
    return credential
}

export async function updateCredential({ id, workspaceId, name, type, value }) {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.userId;
    if (!userId) throw new Error("Unauthorized")

    const data = {
        platform: type,
        profile: name
    }
    
    if (value) {
        data.credentials = { value }
    }

    const credential = await db.credentials.update({
        where: { id, userId },
        data
    })

    revalidatePath(`/workspace/${workspaceId}/flowbyte/credentials`)
    return credential
}

export async function deleteCredential({ id, workspaceId }) {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.userId;
    if (!userId) throw new Error("Unauthorized")

    await db.credentials.delete({
        where: { id, userId }
    })

    revalidatePath(`/workspace/${workspaceId}/flowbyte/credentials`)
    return { success: true }
}
