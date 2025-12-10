'use server'
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { v4 as uuidv4 } from 'uuid'
import { MemberRole } from "@prisma/client";
import useAuth from "@/hooks/useAuth";
import { db } from "@/lib/db";


const DeleteOrg = z.object({
    userId: z.string(),
    serverId: z.string(),
});

const handler = async (data) => {
    const { serverId, userId } = data;
    let server = {}


    try {
        // server = await db.server.delete({
        //     where: { id: serverId, userId: userId },
        // })

        server = await db.server.findFirst({
            where: { userId: userId, type: 'default' },
        })

    } catch (error) {
        console.log(error)
        return {
            error: "Failed to copy the list."
        }
    }

    //revalidatePath(`/org//${orgId}`)
    return { data: server };

}


export const deleteOrg = createSafeAction(DeleteOrg, handler);