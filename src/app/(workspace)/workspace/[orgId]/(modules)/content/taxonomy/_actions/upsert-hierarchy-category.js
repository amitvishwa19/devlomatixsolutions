'use server'
import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { db } from "@/lib/db";
import { slug } from "@/utils/functions";


const UpsertHierarchyCategory = z.object({
    formData: z.any(),
    root: z.any(),
    orgId: z.string().optional()
});

const handler = async (data) => {
    let category = {}
    let parentCategory
    let categories = []
    let sortOrder
    let level = 0


    try {

        //console.log('@upsert category server action', data.formData, data.root)


        const tmpData = data.formData

        if (tmpData.parentId) {
            const parent = await db.category.findUnique({
                where: { id: tmpData.parentId },
            });
            if (!parent) throw new Error("Parent not found");
            level = parent.level + 1;
        }

        const tags = data?.formData?.tags

        category = await db.category.upsert({
            where: {
                id: tmpData.id || '000'
            },
            update: {
                name: tmpData.name,
                slug: slug(tmpData.name),
                description: tmpData.description,
                //parentId: tmpData.parentId && tmpData.parentId,
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
            },
            include: {
                children: true,

            },
        })

        if (data.root) {
            parentCategory = await db.category.findFirst({
                where: {
                    id: data?.root?.id
                },
                include: {
                    children: {
                        include: {
                            children: {
                                include: {
                                    children: true
                                }
                            }
                        }
                    }
                },
                orderBy: {
                    createdAt: 'asc'
                }
            })
        }



    } catch (error) {
        console.log(error)
        return {
            message: "Oops!, something went wrong", error
        }
    }

    //revalidatePath(`/org/${orgId}`)
    return { data: { parentCategory, category, categories } };

}


export const upsertHierarchyCategory = createSafeAction(UpsertHierarchyCategory, handler);