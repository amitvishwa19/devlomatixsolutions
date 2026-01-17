'use server'
import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { db } from "@/lib/db";
import { v4 as uuidv4 } from 'uuid'
import { ROLE } from "@prisma/client";
import { slug } from "@/utils/functions";


const UpdateCategory = z.object({
    formData: z.any()
});

const handler = async (data) => {
    let category
    let categories


    try {
        console.log('@update category server action', data)


        const tags = data?.formData?.tags
        category = await db.category.update({
            where: {
                id: data.formData.id
            },
            data: {
                name: data.formData.name,
                slug: slug(data?.formData?.name),
                description: data.formData.description,
                parentId: data.formData.parentId,
                tags: {
                    connect: tags.map(tag => ({ id: tag.id })) // Connect existing tags
                }
            },
            include: { tags: true, posts: true }
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


export const updateCategory = createSafeAction(UpdateCategory, handler);