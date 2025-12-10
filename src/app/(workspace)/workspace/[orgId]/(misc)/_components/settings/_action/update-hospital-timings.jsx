'use server'
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { v4 as uuidv4 } from 'uuid'
import { MemberRole } from "@prisma/client";
import useAuth from "@/hooks/useAuth";
import { db } from "@/lib/db";


const UpdateHospitalTimings = z.object({
    userId: z.string(),
    serverId: z.string(),
    slotTime: z.any(),
    timings: z.any(),
    meetingType: z.any(),
    open: z.boolean()
});

const handler = async (data) => {
    const { serverId, userId, slotTime, timings, meetingType, open } = data;
    let hospitalsettings = {}
    let setting

    try {

        setting = await db.setting.update({
            where: { serverId },
            data: {
                offline: open,
                timing: timings,
                slotTime: slotTime,
                consultationOptions: meetingType
            }
        })

    } catch (error) {
        console.log(error)
        return {
            error: "Failed to copy the list."
        }
    }

    //revalidatePath(`/org//${orgId}`)
    return { data: { hospitalsettings } };

}


export const updateHospitalTimings = createSafeAction(UpdateHospitalTimings, handler);