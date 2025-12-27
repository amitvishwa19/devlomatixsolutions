'use server'
import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { db } from "@/lib/db";


const DeleteRole = z.object({
    id: z.optional(z.string()),
});

const handler = async (data) => {
    const { id } = data;
    let roles


    try {

        const role = await db.role.delete({
            where: {
                id
            },
        })

        roles = await db.role.findMany({
            orderBy: {
                createdAt: 'desc',
            },
            include: {
                permissions: true
            }
        })


    } catch (error) {
        console.log(error)
        return {
            error: "Failed to delete role"
        }
    }

    return { data: { roles: roles } };

}


export const deleteRole = createSafeAction(DeleteRole, handler);