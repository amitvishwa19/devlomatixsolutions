'use server'
import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { db } from "@/lib/db";
import { ROLE } from "@prisma/client";

const UpdateAppointment = z.object({
    id: z.string().trim(),
    doctorId: z.string().trim(),
    patientId: z.string().trim(),
    serverId: z.string().trim(),
    date: z.string(),
    slot: z.any(),
    time: z.string().trim(),
    type: z.object({
        type: z.string(),
        status: z.boolean(),
        charge: z.number(),
        icon: z.string()
    }),
    note: z.string().optional(),
    status: z.string().trim(),
    additionalNote: z.string(),
    doctorNote: z.string()
});

const handler = async (data) => {

    const { userId, appointmentId, value, role } = data
    let appointment = {}
    let appointments = []
    console.log('UpdateAppointmentStatus', data)

    try {

        appointment = await db.appointment.update({
            where: {
                id: data.id,
            },
            data: data
        })


    } catch (error) {

        return {
            message: "Oops!, something went wrong", error
        }
    }

    //revalidatePath(`/org/${orgId}`)
    return { data: { appointment, appointments } };

}


export const updateAppointment = createSafeAction(UpdateAppointment, handler);