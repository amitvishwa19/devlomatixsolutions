'use server'
import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { v4 as uuidv4 } from 'uuid'
import { db } from "@/lib/db";
import { cookies } from "next/headers";
import { randomUUID } from "crypto";



const UpdateDeviceToken = z.object({
    userId: z.string(),
    deviceToken: z.string()
});

const handler = async (data) => {
    const { deviceToken, userId } = data
    let user



    try {
        user = await db.user.findFirst({
            where: {
                id: userId
            }
        })

        if (user) {
            user = await db.user.update({
                where: {
                    id: userId
                },
                data: {
                    webDeviceToken: deviceToken
                }
            })
        }


    } catch (error) {
        console.log(error)
        return {
            error: "Failed to update device token"
        }
    }

    return { data: { user } };

}


export const updateDeviceToken = createSafeAction(UpdateDeviceToken, handler);