'use server'
import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { db } from "@/lib/db";


const NewCategory = z.object({
    formData: z.any(),
    orgId: z.string().optional()
});

const handler = async (data) => {
    let category = {}
    let categories = []
    let sortOrder
    let level = 0


    try {

        const tmpData = data.formData

        if (tmpData.parentId) {
            const parent = await db.category.findUnique({
                where: { id: tmpData.parentId },
            });
            if (!parent) throw new Error("Parent not found");
            level = parent.level + 1;
        }

        const tags = data?.formData?.tags
        category = await db.category.create({
            data: {
                name: tmpData.name,
                slug: tmpData.name,
                description: tmpData.description,
                parentId: tmpData.parentId && tmpData.parentId,
                level,
                sortOrder,
                tags: { connect: tags.map(tag => ({ id: tag.id })) }
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


export const newCategory = createSafeAction(NewCategory, handler);