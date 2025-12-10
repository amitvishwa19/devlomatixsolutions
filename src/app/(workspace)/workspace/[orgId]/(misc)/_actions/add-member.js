'use server'
import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { put } from '@vercel/blob'
import { db } from "@/lib/db";
import { v4 as uuidv4 } from 'uuid'
import { MemberRole } from "@prisma/client";


const AddMemberOrg = z.object({
    serverId: z.string(),
    userId: z.string()
});

const handler = async (data) => {
    const { userId, serverId } = data
    let server
    let member
    let members

    try {

        // server = await db.server.findFirst({
        //     where: {
        //         id: serverId
        //     },
        //     include: {
        //         members: true
        //     }
        // })

        const server = await db.server.update({
            where: {
                id: serverId,
            },
            data: {
                members: {
                    create: [
                        {
                            userId: userId,
                        }
                    ]
                }
            }
        });


    } catch (error) {
        console.log(error)
        return {
            message: "Oops!, something went wrong", error
        }
    }

    //revalidatePath(`/org/${orgId}`)
    return { data: { member, members } };

}


export const addMemberOrg = createSafeAction(AddMemberOrg, handler);