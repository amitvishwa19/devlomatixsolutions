'use server'
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { prisma } from "../../../../prisma/prisma";
import { headers, cookies } from 'next/headers';
import jwt from 'jsonwebtoken'
import { setSession } from '@/lib/auth'
import { db } from "@/lib/db";
import { v4 as uuidv4 } from 'uuid'
import { MemberRole } from "@prisma/client";

const GoogleLogin = z.object({
    uid: z.string(),
    name: z.string(),
    displayName: z.string(),
    email: z.string(),
    emailVerified: z.boolean(),
    avatar: z.string(),
    password: z.string(),
    status: z.boolean(),
    provider: z.string(),
});

const handler = async (data) => {

    console.log('Google login actin')

    const { email } = data;

    let user
    let server

    try {

        user = await db.user.upsert({
            where: { email: email, },
            update: data,
            create: data,
        })

        console.log('getting data', data)

        if (user) {


            // const profile = await db.profile.upsert({
            //     where: { userId: user.id, },
            //     update: {
            //         userId: user.id,
            //         name: user.displayName,
            //         email: user.email,
            //         avatar: user.avatar
            //     },
            //     create: {
            //         userId: user.id,
            //         name: user.displayName,
            //         email: user.email,
            //         avatar: user.avatar
            //     },
            // })

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

        // const tempServer = await db.server.findFirst({
        //     where: { userId: user?.id, name: 'default', }
        // })



        // if (!tempServer) {
        //     server = await db.server.create({
        //         data: {
        //             userId: user?.id,
        //             name: 'default',
        //             inviteCode: uuidv4(),
        //             selected: true,
        //             channels: {
        //                 create: [{ name: 'general', userId: user?.id }]
        //             },
        //             members: {
        //                 create: [
        //                     {
        //                         userId: user?.id,
        //                         role: MemberRole.ADMIN
        //                     }
        //                 ]
        //             }
        //         }
        //     })
        // }


        setSession(user)

        //console.log(JSON.stringify(user))

    } catch (error) {
        console.log(error.message)
        return { error: "Google login failed" }
    }

    //revalidatePath('/')
    return { data: user };

}


export const userGoogleLogin = createSafeAction(GoogleLogin, handler);