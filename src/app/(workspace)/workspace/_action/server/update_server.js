'use server'
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { prisma } from "../../../../../../prisma/prisma";
import { v4 as uuidv4 } from 'uuid'
import { MemberRole } from "@prisma/client";
import useAuth from "@/hooks/useAuth";


const UpdateServer = z.object({
    serverId: z.optional(z.string()),
    name: z.string(),
    imageUrl: z.string(),
});

const handler = async (data) => {
    const { userId } = useAuth()

    const { name, imageUrl, serverId } = data;
    let server;

    try {

        server = await prisma.server.update({
            where: {
                id: serverId,
                userId
            },
            data: {
                name,
                imageUrl
            }
        })


    } catch (error) {

        return {
            error: "Failed to copy the list."
        }
    }

    revalidatePath(`/org/server/${serverId}`)
    return { data: server };

}


export const updateServer = createSafeAction(UpdateServer, handler);