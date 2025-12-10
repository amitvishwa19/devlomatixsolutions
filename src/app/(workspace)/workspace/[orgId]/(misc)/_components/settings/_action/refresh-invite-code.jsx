'use server'
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { v4 as uuidv4 } from 'uuid'
import { MemberRole } from "@prisma/client";
import useAuth from "@/hooks/useAuth";
import { db } from "@/lib/db";


const RefreshInviteCode = z.object({
    userId: z.string(),
    serverId: z.string(),
});

const handler = async (data) => {

    const { serverId, userId } = data;

    console.log('userId from server updated', serverId, userId)

    let server


    try {

        server = await db.server.update({
            where: { id: serverId, userId: userId },
            data: {
                inviteCode: uuidv4()
            }
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


export const refreshInviteCode = createSafeAction(RefreshInviteCode, handler);