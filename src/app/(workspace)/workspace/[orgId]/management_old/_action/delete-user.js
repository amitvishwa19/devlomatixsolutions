'use server'
import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { db } from "@/lib/db";
import { ROLE } from "@prisma/client";


const DeleteUser = z.object({
    id: z.optional(z.string()),
});

const handler = async (data) => {
    const { id } = data;
    let user = {}
    let users = []


    try {

        const user = await db.user.delete({
            where: {
                id
            },
        })

        users = await db.user.findMany({
            where: {
                role: {
                    not: ROLE.PATIENT
                }
            },
            include: {
                roles: {
                    include: {
                        permissions: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc',
            },
        })


    } catch (error) {
        console.log(error)
        return {
            error: "Failed to delete role"
        }
    }

    return { data: { users } };

}


export const deleteUser = createSafeAction(DeleteUser, handler);