'use server'
import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { db } from "@/lib/db";
import { v4 as uuidv4 } from 'uuid'
import { ROLE } from "@prisma/client";
import { slug } from "@/utils/functions";

const UpsertPermission = z.object({
    userId: z.string(),
    formData: z.any(),
});

const handler = async (data) => {

    console.log('@permission server action', data)

    const { orgId, userId, formData } = data
    let permission
    let services = []



    try {

        permission = await db.permission.upsert({
            where: {
                id: formData.id || '000'
            },
            create: {
                title: formData?.title,
                description: formData?.description,
                color: formData?.color
            },
            update: {
                title: formData?.title,
                description: formData?.description,
                color: formData?.color
            },
            include: {
                roles: true
            },
        })


    } catch (error) {
        console.log(error)
        return {
            message: "Oops!, something went wrong", error
        }
    }

    //revalidatePath(`/org/${orgId}`)
    return { data: { permission } };

}


export const upsertPermission = createSafeAction(UpsertPermission, handler);