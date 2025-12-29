'use server'
import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { db } from "@/lib/db";
import { v4 as uuidv4 } from 'uuid'
import { ROLE } from "@prisma/client";
import { slug } from "@/utils/functions";

const UpsertUser = z.object({
    userId: z.string(),
    formData: z.any(),
});

const handler = async (data) => {

    const { userId, formData } = data
    let user


    try {

        const nroles = formData.roles.map((i) => { return { id: i }; })
        user = await db.user.upsert({
            where: {
                id: formData.id || '000'
            },
            create: {
                displayName: formData?.name,
                email: formData?.email,
                department: formData?.department,
                status: formData.status,
                roles: {
                    connect: nroles
                },
            },
            update: {
                displayName: formData?.name,
                email: formData?.email,
                department: formData?.department,
                status: formData.status,
                roles: {
                    connect: nroles
                },
            },
            include: {
                roles: true
            },
        })

        console.log('@user server action', user)




    } catch (error) {
        console.log(error)
        return {
            message: "Oops!, something went wrong", error
        }
    }

    //revalidatePath(`/org/${orgId}`)
    return { data: { user } };

}


export const upsertUser = createSafeAction(UpsertUser, handler);