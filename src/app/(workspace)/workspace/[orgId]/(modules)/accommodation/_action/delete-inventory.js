'use server'
import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { db } from "@/lib/db";
import { v4 as uuidv4 } from 'uuid'
import { ROLE } from "@prisma/client";
import { slug } from "@/utils/functions";

const DeleteInventory = z.object({
    inventoryId: z.string()
});

const handler = async (data) => {



    const { inventoryId } = data
    let inventory = {}




    try {

        inventory = await db.inventory.delete({
            where: {
                id: inventoryId
            }
        })


    } catch (error) {
        console.log(error)
        return {
            message: "Oops!, something went wrong", error
        }
    }

    //revalidatePath(`/org/${orgId}`)
    return { data: { inventory } };

}


export const deleteInventory = createSafeAction(DeleteInventory, handler);