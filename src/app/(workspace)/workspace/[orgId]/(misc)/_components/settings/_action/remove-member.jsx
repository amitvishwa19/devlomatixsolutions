'use server'
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { v4 as uuidv4 } from 'uuid'
import { MemberRole } from "@prisma/client";
import useAuth from "@/hooks/useAuth";
import { db } from "@/lib/db";


const RemoveMember = z.object({
    id: z.string(),
    userId: z.string(),
    serverId: z.string(),
});

const handler = async (data) => {
    const { userId, serverId, id } = data;
    let server = {}

    try {

        await db.member.delete({
            where: {
                id,
                userId,
                serverId
            }
        });


    } catch (error) {
        console.log(error)
        return {
            error: "Failed to copy the list."
        }
    }

    //revalidatePath(`/org//${orgId}`)
    return { data: server };

}


export const removeMember = createSafeAction(RemoveMember, handler);