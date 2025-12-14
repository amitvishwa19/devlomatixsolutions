'use server'
import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { db } from "@/lib/db";
import { ROLE } from "@prisma/client";

const DeleteAppointment = z.object({
    appointmentId: z.string()
});

const handler = async (data) => {

    const { appointmentId } = data
    let appointment


    try {

        appointment = await db.appointment.delete({
            where: {
                id: appointmentId
            }
        })




    } catch (error) {
        console.log(error)
        return {
            message: "Failed to fetch servers", error
        }
    }

    //revalidatePath(`/org/${orgId}`)
    return { data: { appointment } };

}


export const deleteAppointment = createSafeAction(DeleteAppointment, handler);