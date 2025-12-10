'use server'
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { v4 as uuidv4 } from 'uuid'
import { MemberRole, ROLE } from "@prisma/client";
import useAuth from "@/hooks/useAuth";
import { db } from "@/lib/db";


const GetAllUsers = z.object({
    serverId: z.optional(z.string()),
});

const handler = async (data) => {
    const { serverId, userId, orgData } = data;
    let users = []


    console.log('get all users', data)

    try {
        users = await db.user.findMany({
            where: {
                status: true
            },
            include: {
                profile: true
            }
        })

    } catch (error) {
        console.log(error)
        return {
            error: "Failed to copy the list."
        }
    }

    //revalidatePath(`/org//${orgId}`)
    return { data: { users } };

}


export const getAllUsers = createSafeAction(GetAllUsers, handler);