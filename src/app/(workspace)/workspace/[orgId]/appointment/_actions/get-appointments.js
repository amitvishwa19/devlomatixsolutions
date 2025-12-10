'use server'
import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { db } from "@/lib/db";
import { ROLE } from "@prisma/client";

const GetAppointments = z.object({
    userId: z.string(),
    role: z.string(),
    serverId: z.string()
});

const handler = async (data) => {

    const { userId, role, serverId } = data
    let appointments = []


    try {

        console.log('@ Getting appointments server')

        // appointments = await db.appointment.findMany({
        //     where: role === ROLE.DOCTOR ? { doctorId: userId } : { patientId: userId },
        //     include: {
        //         doctor: {
        //             include: {
        //                 profile: true
        //             }
        //         },
        //         patient: {
        //             include: {
        //                 profile: true
        //             }
        //         },
        //     },
        //     orderBy: {
        //         createdAt: 'desc',
        //     },
        // })

        appointments = await db.appointment.findMany({
            where: {
                serverId: serverId
            },
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
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        })




        //console.log('getting appointments from server', appointments)


    } catch (error) {
        console.log(error)
        return {
            message: "Failed to fetch servers", error
        }
    }

    //revalidatePath(`/org/${orgId}`)
    return { data: { appointments } };

}


export const getAppointments = createSafeAction(GetAppointments, handler);