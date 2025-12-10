'use server'
import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { db } from "@/lib/db";


const AddRole = z.object({
    id: z.optional(z.string()),
    title: z.string(),
    description: z.optional(z.string()),
    status: z.boolean(),
    permissions: z.optional(z.array(z.string()))
});

const handler = async (data) => {
    const { id, title, description, type, status, permissions } = data;
    let roles

    console.log('creating role')
    try {

        const nperm = permissions.map((i) => { return { id: i }; })

        const role = await db.role.create({
            data: {
                title,
                description,
                status

            },
            include: {
                permissions: true
            }
        })

        if (permissions.length > 0) {
            permissions.map(async (p) => {
                await db.role.update({
                    where: {
                        id: role.id
                    },
                    data: {
                        permissions: {
                            set: nperm
                        },
                    }
                })
            })
        }

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
            error: "Failed to create role"
        }
    }

    return { data: { roles: roles } };

}


export const addRole = createSafeAction(AddRole, handler);