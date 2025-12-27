'use server'
import { optional, z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { db } from "@/lib/db";
import { ROLE } from "@prisma/client";


const EditUser = z.object({
    id: z.optional(z.string()),
    serverId: z.optional(z.string()),
    status: z.boolean(),
    roles: z.optional(z.array(z.string()))
});

const handler = async (data) => {
    const { id, status, roles, serverId } = data;
    let user = {}
    let users = []
    let server = {}


    try {

        const nroles = roles.map((i) => { return { id: i }; })

        user = await db.user.update({
            where: { id },
            data: {
                status: status,
                roles: {
                    set: nroles
                },
            },
            include: {
                roles: {
                    include: {
                        permissions: true
                    }
                }
            }
        })

        user = await db.server.update({
            where: { id: serverId },
            data: {
                roles: {
                    set: nroles
                },
            },
            include: {
                roles: {
                    include: {
                        permissions: true
                    }
                }
            }
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
            error: "Failed to update role"
        }
    }

    return { data: { users } };

}


export const editUser = createSafeAction(EditUser, handler);