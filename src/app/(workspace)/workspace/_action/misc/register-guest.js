'use server'
import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { v4 as uuidv4 } from 'uuid'
import { db } from "@/lib/db";
import { cookies } from "next/headers";
import { randomUUID } from "crypto";
import { ROLE } from "@prisma/client";



const RegisterGuest = z.object({
    deviceToken: z.string()
});

const handler = async (data) => {

    const { deviceToken } = data
    let email
    let user


    try {
        const cookieStore = await cookies()
        const guestEmail = `guest_${randomUUID()}@devlomatix.in`;
        const guestUser = cookieStore.get("guest")?.value



        if (!guestUser) {
            cookieStore.set("guest", guestEmail, {
                httpOnly: true,
                secure: true,
                path: "/",
                maxAge: 60 * 60 * 24 * 30, // 30 days
            });

            user = await db.user.findFirst({
                where: {
                    role: 'GUEST',
                    webDeviceToken: deviceToken
                }
            })

            if (!user) {
                user = await db.user.create({
                    data: {
                        email: guestEmail,
                        guest: true,
                        displayName: 'guest-user',
                        webDeviceToken: deviceToken,
                        role: 'GUEST',
                    }
                })
            }
        }

    } catch (error) {
        console.log(error)
        return {
            error: "Failed to register guest"
        }
    }

    return { data: { user } };

}


export const registerGuest = createSafeAction(RegisterGuest, handler);