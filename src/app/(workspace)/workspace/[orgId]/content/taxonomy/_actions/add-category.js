'use server'
import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { db } from "@/lib/db";
import { v4 as uuidv4 } from 'uuid'
import { ROLE } from "@prisma/client";
import { slug } from "@/utils/functions";


const NewCategory = z.object({
    formData: z.any()
});

const handler = async (data) => {
    let category
    let categories
    console.log(data.formData)

    try {
        const tags = data?.formData?.tags
        category = await db.category.create({
            data: {
                name: data.formData.name,
                slug: slug(data?.formData?.name),
                description: data.formData.description,
                parentId: data.formData.parentId,
                //parent: data.formData.parentId && { connect: { id: data.formData.parentId } },
                level: data.formData.parentId ? 1 : 0,
                tags: { connect: tags.map(tag => ({ id: tag.id })) }
            },
            include: { tags: true }
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