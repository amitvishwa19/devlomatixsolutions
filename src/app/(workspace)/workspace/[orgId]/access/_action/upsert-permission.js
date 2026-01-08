'use server'
import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { db } from "@/lib/db";
import { v4 as uuidv4 } from 'uuid'
import { ROLE } from "@prisma/client";
import { slug } from "@/utils/functions";
import { color } from "framer-motion";

const UpsertPermission = z.object({
    userId: z.string(),
    formData: z.any(),
});

const handler = async (data) => {



    const { orgId, userId, formData } = data
    let permission
    let permissions
    let services = []



    try {

        const ops = formData.map((item) =>
            db.permission.upsert({
                where: { id: item.id || '000' },
                update: {
                    title: item?.title,
                    value: item?.value,
                    description: item?.description,
                    category: item?.category,
                    status: item.status,
                    color: item.color
                },
                create: {
                    title: item?.title,
                    value: item?.value,
                    description: item?.description,
                    category: item?.category,
                    status: item.status,
                    color: item.color
                },
            })
        );

        const permissions = await db.$transaction(ops);

        console.log(formData)

        // permission = await db.permission.upsert({
        //     where: {
        //         id: formData.id || '000'
        //     },
        //     create: {
        //         title: formData?.title,
        //         description: formData?.description,
        //         color: formData?.color
        //     },
        //     update: {
        //         title: formData?.title,
        //         description: formData?.description,
        //         color: formData?.color
        //     },
        //     include: {
        //         roles: true
        //     },
        // })


    } catch (error) {
        console.log(error)
        return {
            message: "Oops!, something went wrong", error
        }
    }

    //revalidatePath(`/org/${orgId}`)
    return { data: { permissions } };

}


export const upsertPermission = createSafeAction(UpsertPermission, handler);