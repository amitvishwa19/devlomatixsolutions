'use server'
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { prisma } from "../../../../prisma/prisma";
import { headers, cookies } from 'next/headers';
import jwt from 'jsonwebtoken'
import bcryptjs from "bcryptjs";
import { setSession } from '@/lib/auth'
import { db } from "@/lib/db";
import { v4 as uuidv4 } from 'uuid'
import { MemberRole } from "@prisma/client";

const EmailLogin = z.object({
    email: z.string(),
    password: z.string(),
});

const handler = async (data) => {


    const { email, password } = data;



    let user
    let server

    try {

        user = await db.user.findUnique({
            where: {
                email: email,
            },
        })

        if (!user) {
            return { error: "No account found with  this email", }
        }

        // if (!user.emailVerified) {
        //     return { error: "Email not verified", }
        // }

        const validPassword = await bcryptjs.compare(password, user.password)

        if (!validPassword) {
            return { error: "Authentication failed, please check provided credentials", }
        }

        const accessToken = jwt.sign({ id: user.id }, process.env.APP_SECRET, { expiresIn: '1d' })
        const refreshToken = jwt.sign({ id: user.id, email }, process.env.APP_SECRET, { expiresIn: '10d' })

        await db.user.update({
            where: { email: email },
            data: { refreshToken },
        })

        user = {
            id: user?.id,
            uid: user?.uid,
            displayName: user?.displayName,
            email: user?.email,
            avatar: user?.avatar,
            accessToken,
            refreshToken
        }

        // server = await db.server.create({
        //     data: {
        //         userId: user?.id,
        //         name: 'default',
        //         inviteCode: uuidv4(),
        //         selected: true,
        //         channels: {
        //             create: [{ name: 'general', userId: user?.id }]
        //         },
        //         members: {
        //             create: [
        //                 {
        //                     userId: user?.id,
        //                     role: MemberRole.ADMIN
        //                 }
        //             ]
        //         }
        //     }
        // })



        // cookies().set('DEVUSRAT', accessToken)
        // cookies().set('DEVUSRRT', refreshToken)
        // cookies().set('DEVUSR', JSON.stringify(user))
        setSession(user)


    } catch (error) {
        console.log(error.message)
        return {
            error: "Login failed"
        }
    }

    //revalidatePath('/')
    return { data: user };

}


export const userEmailLogin = createSafeAction(EmailLogin, handler);