'use server'
import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { db } from "@/lib/db";
import { slug } from "@/utils/functions";


const UpsertCategory = z.object({
    formData: z.any(),
    orgId: z.string().optional()
});

const handler = async (data) => {
    let category = {}
    let categories = []
    let sortOrder
    let level = 0


    try {

        console.log('@upsert category server action', data.formData)
        console.log('category', 'category')


        const tmpData = data.formData

        if (tmpData.parentId) {
            const parent = await db.category.findUnique({
                where: { id: tmpData.parentId },
            });
            if (!parent) throw new Error("Parent not found");
            level = parent.level + 1;
        }

        const tags = data?.formData?.tags
        // category = await db.category.create({
        //     data: {
        //         name: tmpData.name,
        //         slug: tmpData.name,
        //         description: tmpData.description,
        //         parentId: tmpData.parentId && tmpData.parentId,
        //         level,
        //         color: tmpData.color,
        //         sortOrder: tmpData.sortOrder,
        //         tags: { connect: tags.map(tag => ({ id: tag.id })) }
        //     },
        //     include: { tags: true, posts: true }
        // })

        category = await db.category.upsert({
            where: {
                id: tmpData.id || '000'
            },
            update: {
                name: tmpData.name,
                slug: slug(tmpData.name),
                description: tmpData.description,
                parentId: tmpData.parentId && tmpData.parentId,
                level,
                color: tmpData.color,
                icon: tmpData.icon,
                sortOrder: tmpData.sortOrder,
                tags: { connect: tags.map(tag => ({ id: tag.id })) },
                isActive: tmpData.isActive
            },
            create: {
                name: tmpData.name,
                slug: slug(tmpData.name),
                description: tmpData.description,
                parentId: tmpData.parentId && tmpData.parentId,
                level,
                color: tmpData.color,
                icon: tmpData.icon,
                sortOrder: tmpData.sortOrder,
                tags: { connect: tags.map(tag => ({ id: tag.id })) },
                isActive: tmpData.isActive
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


export const upsertCategory = createSafeAction(UpsertCategory, handler);