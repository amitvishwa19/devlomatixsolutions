'use server'
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { prisma } from "../../../../../../prisma/prisma";
import { v4 as uuidv4 } from 'uuid'
import { MemberRole } from "@prisma/client";
import useAuth from "@/hooks/useAuth";
import { db } from "@/lib/db";


const LeaveServer = z.object({
    serverId: z.optional(z.string()),
});

const handler = async (data) => {
    const { userId } = await useAuth()
    const { serverId } = data;
    let server


    try {
        server = await db.server.update({
            where: {
                id: serverId,
                userId: {
                    not: userId
                },
                members: {
                    some: { userId }
                }
            },
            data: {
                members: {
                    deleteMany: {
                        userId
                    }
                }
            }
        })
    } catch (error) {

        return {
            error: "Failed to leave the organization."
        }
    }

    revalidatePath(`/org/${serverId}`)
    return { data: 'server' };

}


export const leaveServer = createSafeAction(LeaveServer, handler);