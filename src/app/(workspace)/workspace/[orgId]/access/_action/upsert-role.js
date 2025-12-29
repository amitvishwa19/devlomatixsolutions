'use server'
import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { db } from "@/lib/db";
import { v4 as uuidv4 } from 'uuid'
import { ROLE } from "@prisma/client";
import { slug } from "@/utils/functions";
import { connect } from "http2";

const UpsertRole = z.object({
    userId: z.string(),
    formData: z.any(),
});

const handler = async (data) => {



    const { userId, formData } = data
    let role
    let temprole



    try {
        const perms = formData?.permissions.map((i) => { return { id: i }; })

        role = await db.role.upsert({
            where: {
                id: formData.id || '000'
            },
            create: {
                title: formData?.title,
                description: formData?.description,
                color: formData?.color,
            },
            update: {
                title: formData?.title,
                description: formData?.description,
                color: formData?.color,
                permissions: {
                    connect: perms
                }
            },
            include: {
                permissions: true
            },
        })

        // if (formData?.permissions.length > 0) {
        //     formData?.permissions.map(async (p) => {
        //         role = await db.role.update({
        //             where: {
        //                 id: role.id
        //             },
        //             data: {
        //                 permissions: {
        //                     set: perms
        //                 },
        //             },
        //         })
        //     })
        // }

        // temprole = await db.role.findFirst({
        //     where: {
        //         id: role.id
        //     },
        //     include: {
        //         permissions: true
        //     },
        // })


        console.log('@role server action', temprole)


    } catch (error) {
        console.log(error)
        return {
            message: "Oops!, something went wrong", error
        }
    }

    //revalidatePath(`/org/${orgId}`)
    return { data: { role } };

}


export const upsertRole = createSafeAction(UpsertRole, handler);