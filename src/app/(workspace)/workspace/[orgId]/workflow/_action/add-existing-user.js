'use server'
import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { db } from "@/lib/db";
import { v4 as uuidv4 } from 'uuid'
import { ROLE } from "@prisma/client";
import { slug } from "@/utils/functions";

const AddExistingUser = z.object({
    userId: z.string(),
    patientId: z.string(),
    workflowType: z.string()
});

const handler = async (data) => {



    const { userId, patientId, workflowType } = data
    console.log('@Exesting user to flow', data)

    let flow

    try {



    } catch (error) {
        console.log(error)
        return {
            message: "Oops!, something went wrong", error
        }
    }

    //revalidatePath(`/org/${orgId}`)
    return { data: { flow } };

}


export const addExistingUser = createSafeAction(AddExistingUser, handler);