'use server'
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { v4 as uuidv4 } from 'uuid'
import useAuth from "@/hooks/useAuth";
import { db } from "@/lib/db";
import { includes, orderBy } from "lodash";
import { slugify } from "@/utils/functions";
import { ROLE } from "@prisma/client";


const Management = z.object({
    serverId: z.string()
});

const handler = async (data) => {
    const { userId } = await useAuth()
    const { id, title, description, type, status, serverId } = data;
    let users = []
    let roles = []
    let permissions = []

    try {
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

        roles = await db.role.findMany({
            orderBy: {
                createdAt: 'asc',
            },
            include: {
                permissions: true
            }
        })

        permissions = await db.permission.findMany()

    } catch (error) {
        console.log(error)
        return {
            error: "Failed to get roles & permissions"
        }
    }

    //revalidatePath(`/admin//permission`)
    return { data: { users, roles, permissions } };

}


export const management = createSafeAction(Management, handler);