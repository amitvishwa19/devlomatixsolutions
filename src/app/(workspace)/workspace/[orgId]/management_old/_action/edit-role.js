'use server'
import { optional, z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { db } from "@/lib/db";


const EditRole = z.object({
    id: z.optional(z.string()),
    serverId: z.optional(z.string()),
    title: z.string(),
    description: z.optional(z.string()),
    status: z.boolean(),
    permissions: z.optional(z.array(z.string()))
});

const handler = async (data) => {
    const { id, title, description, status, permissions } = data;
    let role = {}
    let roles = []


    try {

        const nperm = permissions.map((i) => { return { id: i }; })

        console.log('@update role server', id)

        role = await db.role.update({
            where: { id },
            data: {
                title,
                description,
                status,
                permissions: {
                    set: nperm
                },
            },
            include: {
                permissions: true
            }
        })



        roles = await db.role.findMany({
            orderBy: {
                createdAt: 'asc',
            },
            include: {
                permissions: true,
            }
        })


    } catch (error) {
        console.log(error)
        return {
            error: "Failed to update role"
        }
    }

    return { data: { roles: roles } };

}


export const editRole = createSafeAction(EditRole, handler);