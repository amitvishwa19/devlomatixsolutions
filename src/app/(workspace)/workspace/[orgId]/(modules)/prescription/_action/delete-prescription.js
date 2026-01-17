'use server'
import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { db } from "@/lib/db";
import { v4 as uuidv4 } from 'uuid'
import { ROLE } from "@prisma/client";
import { slug } from "@/utils/functions";

const DeletePrescription = z.object({
    prescriptionId: z.string()
});

const handler = async (data) => {



    const { prescriptionId } = data
    let prescription




    try {

        prescription = await db.prescription.delete({
            where: {
                id: prescriptionId
            }
        })


    } catch (error) {
        console.log(error)
        return {
            message: "Oops!, something went wrong", error
        }
    }

    //revalidatePath(`/org/${orgId}`)
    return { data: { prescription } };

}


export const deletePrescription = createSafeAction(DeletePrescription, handler);