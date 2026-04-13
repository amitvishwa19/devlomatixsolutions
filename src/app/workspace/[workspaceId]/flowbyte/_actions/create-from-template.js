'use server'
import { db } from "@/lib/db"
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { revalidatePath } from "next/cache"

export async function createFromTemplate({ workspaceId, name, definition }) {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.userId;

    if (!userId) {
        throw new Error("Unauthorized");
    }

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
