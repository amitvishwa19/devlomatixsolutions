'use server'
import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { db } from "@/lib/db";
import { v4 as uuidv4 } from 'uuid'
import { ROLE } from "@prisma/client";
import { slug } from "@/utils/functions";


const DeleteCategory = z.object({
    categoryId: z.string().optional(),
    rootId: z.string().optional()
});

const handler = async (data) => {
    let category
    const { categoryId, rootId } = data

    console.log('delete category action', data)
    try {
        category = await db.category.delete({
            where: {
                id: categoryId
            }
        })

        if (data.rootId) {
            category = await db.category.findFirst({
                where: {
                    id: rootId
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
                    createdAt: 'desc'
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
    return { data: { category } };

}


export const deleteCategory = createSafeAction(DeleteCategory, handler);