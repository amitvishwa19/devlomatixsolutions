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

const GithubLogin = z.object({
    email: z.string(),
});

const handler = async (data) => {

    console.log('githublogin')

    const { email } = data;

    let user
    let server

    try {

        user = await db.user.upsert({
            where: { email: email, },
            update: data,
            create: data,
        })

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

        const tempServer = await db.server.findFirst({
            where: { userId: user?.id, name: 'default', }
        })

        console.log('getting server check before login create', tempServer)

        if (!tempServer) {
            server = await db.server.create({
                data: {
                    userId: user?.id,
                    name: 'default',
                    inviteCode: uuidv4(),
                    selected: true,
                    channels: {
                        create: [{ name: 'general', userId: user?.id }]
                    },
                    members: {
                        create: [
                            {
                                userId: user?.id,
                                role: MemberRole.ADMIN
                            }
                        ]
                    }
                }
            })
        }


        setSession(user)

        //console.log(JSON.stringify(user))

    } catch (error) {
        console.log(error.message)
        return { error: "Github login failed" }
    }

    //revalidatePath('/')
    return { data: user };

}


export const userGithubLogin = createSafeAction(GithubLogin, handler);