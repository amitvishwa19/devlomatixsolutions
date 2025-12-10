'use server'
import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { db } from "@/lib/db";
import { v4 as uuidv4 } from 'uuid'
import { ROLE } from "@prisma/client";
import { slug } from "@/utils/functions";

const NewCategory = z.object({
    name: z.string(),
    slug: z.string(),
    description: z.string().optional(),
    status: z.string(),
    data: z.any()
});

const handler = async (data) => {
    let category
    let categories


    console.log('add category action', data)

    const { name, description, slug, status } = data


    try {

        category = await db.category.create({
            data: {
                name,
                description,
                slug,
                status: status === 'true' ? true : false
            }
        })


    } catch (error) {
        console.log(error)
        return {
            message: "Oops!, something went wrong", error
        }
    }

    //revalidatePath(`/org/${orgId}`)
    return { data: { category, categories } };

}


export const newCategory = createSafeAction(NewCategory, handler);