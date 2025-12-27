'use server'
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { v4 as uuidv4 } from 'uuid'
import useAuth from "@/hooks/useAuth";
import { db } from "@/lib/db";
import { includes, orderBy, update } from "lodash";
import { slugify } from "@/utils/functions";


const RoleManagement = z.object({
    serverId: z.optional(z.string()),
    id: z.optional(z.string()),
    title: z.optional(z.string()),
    description: z.optional(z.string()),
    status: z.optional(z.boolean()),
    type: z.string(),
    permissions: z.optional(z.array(z.string()))
});

const handler = async (data) => {
    const { userId } = await useAuth()
    const { id, title, description, type, status, permissions, serverId } = data;
    let role = {}
    let roles = []
    let temproles = []


    try {

        if (type === 'getRoles') {
            roles = await db.role.findMany({
                orderBy: {
                    createdAt: 'desc',
                },
                include: {
                    permissions: true
                }
            })
        }

        if (type === 'addRole') {

            const nperm = permissions.map((i) => { return { id: i }; })

            role = await db.role.create({
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


        }

        if (type === 'editRole') {

            const nperm = permissions.map((i) => { return { id: i }; })

            role = await db.role.update({
                where: { id },
                data: {
                    title: slugify(title),
                    description,
                    status: status === 'true' ? true : false,
                    permissions: {
                        set: nperm
                    },
                },
                include: {
                    permissions: true
                }
            })


        }

        if (type === 'deleteRole') {
            role = await db.role.delete({
                where: {
                    id
                },
            })
            //console.log('delete role', id)
        }

        roles = await db.role.findMany({
            orderBy: {
                createdAt: 'desc',
            },
            include: {
                permissions: true
            }
        })

        temproles = await db.role.findMany({
            orderBy: {
                createdAt: 'desc',
            },
            include: {
                permissions: true
            }
        })

    } catch (error) {

        return {
            error: { message: "Failed to create permission", error: error.message }
        }
    }

    //revalidatePath(`/workspace/${serverId}/management/role`)
    return { data: { roles, role, temproles } };

}


export const roleManagement = createSafeAction(RoleManagement, handler);