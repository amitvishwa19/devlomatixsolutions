'use server'
import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { db } from "@/lib/db";
import { v4 as uuidv4 } from 'uuid'
import { ROLE } from "@prisma/client";
import { slug } from "@/utils/functions";

const DeleteService = z.object({
    serviceId: z.string()
});

const handler = async (data) => {



    const { serviceId } = data
    let service = {}




    try {

        service = await db.service.delete({
            where: {
                id: serviceId
            }
        })


    } catch (error) {
        console.log(error)
        return {
            message: "Oops!, something went wrong", error
        }
    }

    //revalidatePath(`/org/${orgId}`)
    return { data: { service } };

}


export const deleteService = createSafeAction(DeleteService, handler);