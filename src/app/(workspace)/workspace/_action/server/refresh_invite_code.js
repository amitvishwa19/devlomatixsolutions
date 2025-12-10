'use server'
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { prisma } from "../../../../../../prisma/prisma";
import { v4 as uuidv4 } from 'uuid'
import { MemberRole } from "@prisma/client";
import useAuth from "@/hooks/useAuth";


const RefreshInviteCode = z.object({
    serverId: z.string(),
});

const handler = async (data) => {
    const { userId } = await useAuth()
    const { serverId } = data;


    let server


    try {
        server = await prisma.server.update({
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