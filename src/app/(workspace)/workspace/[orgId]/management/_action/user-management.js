'use server'
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { v4 as uuidv4 } from 'uuid'
import { MemberRole } from "@prisma/client";
import useAuth from "@/hooks/useAuth";
import { db } from "@/lib/db";
import { includes } from "lodash";
import { SendMail } from "@/app/(workspace)/workspace/[orgId]/(admin)/(management)/user/SendMail";


const UserManagement = z.object({
    id: z.optional(z.string()),
    displayName: z.optional(z.string()),
    email: z.optional(z.string().email()),
    status: z.optional(z.string()),
    emailVerified: z.optional(z.string()),
    roles: z.optional(z.array(z.string())),
    type: z.string(),
});

const handler = async (data) => {
    const { id, displayName, email, status, emailVerified, roles, type } = data;
    let users


    try {

        type === 'getUsers' && (
            users = await db.user.findMany({
                include: {
                    servers: true,
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
        )

        if (type === 'addUser') {
            users = await db.user.create({
                data: {
                    email,
                    displayName,
                    status: status === 'true' ? true : false,
                    emailVerified: emailVerified === 'true' ? true : false,
                }
            }).then(() => SendMail(type, 'amitvishwa19@gmail.com'))


        }


        if (type === 'editUser') {
            const nroles = roles.map((i) => { return { id: i }; })


            // Filter out the current logged in user to
            users = db.user.update({
                where: { id },
                data: {
                    displayName,
                    status: status === 'true' ? true : false,
                    emailVerified: emailVerified === 'true' ? true : false,
                    roles: {
                        set: nroles
                    },
                }
            }).then(() => SendMail(type))


        }

        if (type === 'deleteUser') {
            users = await db.user.delete({
                where: {
                    id
                },
            }).then(() => SendMail(type, 'amitvishwa19@gmail.com'))


        }



    } catch (error) {
        return {
            error: "Failed to execute userManagement"
        }
    }

    //revalidatePath(`/org//${server.id}`)
    return { data: { users: users } };

}


export const userManagement = createSafeAction(UserManagement, handler);