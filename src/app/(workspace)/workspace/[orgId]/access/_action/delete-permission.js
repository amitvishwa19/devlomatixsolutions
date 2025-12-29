'use server'
import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { db } from "@/lib/db";
import { v4 as uuidv4 } from 'uuid'
import { ROLE } from "@prisma/client";
import { slug } from "@/utils/functions";

const DeletePermission = z.object({
    userId: z.string(),
    permissionId: z.string()
});

const handler = async (data) => {



    const { permissionId } = data
    let permission




    try {

        permission = await db.permission.delete({
            where: {
                id: permissionId
            }
        })


    } catch (error) {
        console.log(error)
        return {
            message: "Oops!, something went wrong", error
        }
    }

    //revalidatePath(`/org/${orgId}`)
    return { data: { permission } };

}


export const deletePermission = createSafeAction(DeletePermission, handler);