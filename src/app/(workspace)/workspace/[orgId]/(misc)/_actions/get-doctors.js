'use server'
import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { db } from "@/lib/db";
import { ROLE } from "@prisma/client";

const GetDoctors = z.object({
    userId: z.string(),

});

const handler = async (data) => {

    const { userId, role } = data
    let doctors


    try {

        doctors = await db.user.findMany({
            where: { role: ROLE.DOCTOR },
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
    return { data: { doctors } };

}


export const getDoctors = createSafeAction(GetDoctors, handler);