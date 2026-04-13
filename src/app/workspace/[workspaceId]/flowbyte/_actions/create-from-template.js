'use server'
import { db } from "@/lib/db"
import { getSession } from "@/lib/auth"
import { revalidatePath } from "next/cache"

export async function createFromTemplate({ workspaceId, name, definition }) {
    const session = await getSession()
    const userId = session?.data?.id
    if (!userId) throw new Error("Unauthorized")

    const workflow = await db.workflow.create({
        data: {
            userId,
            workspaceId,
            name: `${name} (Template)`,
            definition: definition,
            status: "DRAFT"
        }
    })

    revalidatePath(`/workspace/${workspaceId}/flowbyte`)
    return workflow
}
