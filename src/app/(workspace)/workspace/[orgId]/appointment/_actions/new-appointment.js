'use server'
import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { db } from "@/lib/db";
import { v4 as uuidv4 } from 'uuid'
import { ROLE } from "@prisma/client";

const NewAppointment = z.object({
    // patientId: z.string(),
    // doctorId: z.string(),
    // date: z.string(),
    // slot: z.json(),
    // time: z.string(),
    // type: z.json(),
    // role: z.string(),
    // serverId: z.string(),
    // note: z.optional(z.string())
    data: z.any().optional(),
});

const handler = async (data) => {

    console.log('!appointmentData', data)

    const { patientId, doctorId, date, slot, time, role, serverId, note, type } = data
    let appointment = {}
    let appointments = []




    try {

        const formatdata = { ...data.data, uid: Math.floor(Math.random() * (9999999999 - 1000000000 + 1) + 1000000000).toString() }
        // console.log('@new appointment server', formatdata)

        appointment = await db.appointment.create({
            data: formatdata
        })

    } catch (error) {

        return {
            message: "Oops!, something went wrong", error
        }
    }

    //revalidatePath(`/org/${orgId}`)
    return { data: { appointment, appointments } };

}


export const newAppointment = createSafeAction(NewAppointment, handler);