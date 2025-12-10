'use server'
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { prisma } from "../../../../../../prisma/prisma";
import { v4 as uuidv4 } from 'uuid'
import { MemberRole } from "@prisma/client";
import useAuth from "@/hooks/useAuth";
import { db } from "@/lib/db";


const CreateChannel = z.object({
    name: z.string(),
    type: z.string(),
    serverId: z.string(),
});

const handler = async (data) => {
    const { userId } = await useAuth()

    const { name, type, serverId } = data;
    console.log('create channel from server action', data)
    let channel;
    let server

    if (name === 'general') {
        return {
            error: "Channel name cannot be general"
        }
    }

    try {

        server = await db.server.update({
            where: {
                id: serverId,
                members: {
                    some: {
                        userId,
                        role: {
                            in: [MemberRole.ADMIN, MemberRole.MODERATOR]
                        }
                    }
                }
            },
            data: {
                channels: {
                    create: {
                        userId, name, type
                    }
                }
            }
        })

    } catch (error) {
        console.log(error)
        return {
            error: "Failed to create channel"
        }
    }

    //revalidatePath(`/org//${server.id}`)
    return { data: name };

}


export const createChannel = createSafeAction(CreateChannel, handler);