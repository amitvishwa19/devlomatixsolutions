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

    let member = {}
    let members = []

    try {




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