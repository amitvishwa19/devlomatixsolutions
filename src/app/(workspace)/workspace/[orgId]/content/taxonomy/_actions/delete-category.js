'use server'
import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { db } from "@/lib/db";
import { v4 as uuidv4 } from 'uuid'
import { ROLE } from "@prisma/client";
import { slug } from "@/utils/functions";


const DeleteCategory = z.object({
    categoryId: z.string().optional()
});

const handler = async (data) => {
    let category
    const { categoryId } = data

    console.log('delete category action', categoryId)
    try {
        category = await db.category.delete({
            where: {
                id: categoryId
            }
        })

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