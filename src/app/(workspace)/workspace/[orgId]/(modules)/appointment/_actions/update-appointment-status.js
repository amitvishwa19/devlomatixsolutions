'use server'
import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { db } from "@/lib/db";
import { ROLE } from "@prisma/client";

const UpdateAppointmentStatus = z.object({
    userId: z.string(),
    appointmentId: z.string(),
    value: z.string(),
    role: z.string()
});

const handler = async (data) => {
    console.log('UpdateAppointmentStatus')
    const { userId, appointmentId, value, role } = data
    let appointment = {}
    let appointments = []


    try {

        appointment = await db.appointment.update({
            where: {
                id: appointmentId,
            },
            data: {
                status: value
            },
        })

        appointments = await db.appointment.findMany({
            where: role === ROLE.DOCTOR ? { doctorId: userId } : { patientId: userId },
            include: {
                doctor: {
                    include: {
                        profile: true
                    }
                },
                patient: {
                    include: {
                        profile: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc',
            },
        })


    } catch (error) {

        return {
            message: "Oops!, something went wrong", error
        }
    }

    //revalidatePath(`/org/${orgId}`)
    return { data: { appointment, appointments } };

}


export const updateAppointmentStatus = createSafeAction(UpdateAppointmentStatus, handler);