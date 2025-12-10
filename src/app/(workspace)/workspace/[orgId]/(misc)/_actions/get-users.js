'use server'
import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { db } from "@/lib/db";
import { ROLE } from "@prisma/client";

const GetAllUsers = z.object({
    userId: z.string(),

});

const handler = async (data) => {

    const { userId, role } = data
    let users = []


    try {

        users = await db.user.findMany({
            include: {
                profile: true
            },
            orderBy: {
                createdAt: 'desc',
            },
        })


    } catch (error) {

        return {
            message: "Failed to fetch servers", error
        }
    }

    //revalidatePath(`/org/${orgId}`)
    return { data: { users } };

}


export const getAllUsers = createSafeAction(GetAllUsers, handler);