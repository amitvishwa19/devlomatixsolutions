'use server'
import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { db } from "@/lib/db";
import { v4 as uuidv4 } from 'uuid'
import { ROLE } from "@prisma/client";
import { slug } from "@/utils/functions";

const UpsertService = z.object({
    orgId: z.string(),
    userId: z.string(),
    formData: z.any().optional(),
});

const handler = async (data) => {

    console.log('@Service server action', data)

    const { orgId, userId, formData } = data
    let service = {}
    let services = []



    try {

        service = await db.service.upsert({
            where: {
                id: formData.id || '000'
            },
            create: {
                title: formData.title,
                slug: slug(formData.title),
                description: formData.description,
                categoryId: formData.category,
                status: formData?.status,
                price: formData?.price,
                insurancePrice: formData?.insurancePrice,
            },
            update: {
                title: formData.title,
                slug: slug(formData.title),
                description: formData.description,
                categoryId: formData.category,
                status: formData?.status,
                price: formData?.price,
                insurancePrice: formData?.insurancePrice,
            },
            include: {
                category: true
            }
        })


    } catch (error) {
        console.log(error)
        return {
            message: "Oops!, something went wrong", error
        }
    }

    //revalidatePath(`/org/${orgId}`)
    return { data: { service, services } };

}


export const upsertService = createSafeAction(UpsertService, handler);