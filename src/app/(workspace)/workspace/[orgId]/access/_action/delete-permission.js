'use server'
import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { db } from "@/lib/db";
import { v4 as uuidv4 } from 'uuid'
import { ROLE } from "@prisma/client";
import { slug } from "@/utils/functions";

const DeletePermission = z.object({
    userId: z.string(),
    permissionsToDelete: z.any()
});

const handler = async (data) => {



    const { permissionsToDelete, userId } = data
    let permissions

    console.log(permissionsToDelete)


    try {

        const idsToDelete = permissionsToDelete.map(p => p.id);

        permissions = await db.permission.deleteMany({
            where: {
                id: { in: idsToDelete },
            },
        });

        // permission = await db.permission.delete({
        //     where: {
        //         id: permissionId
        //     }
        // })


    } catch (error) {
        console.log(error)
        return {
            message: "Oops!, something went wrong", error
        }
    }

    //revalidatePath(`/org/${orgId}`)
    return { data: { permissions } };

}


export const deletePermission = createSafeAction(DeletePermission, handler);