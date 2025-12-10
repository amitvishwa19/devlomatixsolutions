'use server'
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createSafeAction } from "@/utils/CreateSafeAction";
import bcryptjs from "bcryptjs";
import { sendEmail } from "@/utils/mailer";
import jwt from 'jsonwebtoken'
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { Mail } from "@/utils/Mail";
import RegisterationMail from "@/emails/RegisterationMail";
import { v4 as uuidv4 } from 'uuid'
import { MemberRole } from "@prisma/client";

const UserRegister = z.object({
    email: z.string(),
    password: z.string(),
});

const handler = async (data) => {

    const { email, password } = data;
    //console.log('create user action', data)
    let user
    let server
    let verifyToken

    try {

        user = await db.user.findUnique({
            where: { email: email },
        })

        const displayName = email.split('@')[0]

        if (user) {
            return {
                error: "User already registered, please try to recover your password"
            }
        }


        const hashedPassword = await bcryptjs.hash(password, 10)

        user = await db.user.create({
            data: {
                email, password: hashedPassword, displayName, name: displayName
            }
        })

        if (user) {
            verifyToken = jwt.sign({ id: user.id }, process.env.APP_SECRET, { expiresIn: '1d' })
            user = await db.user.update({
                where: { email: email },
                data: { verifyToken }
            })

            if (user) {
                server = await db.server.findFirst({
                    where: { userId: user.id, name: 'default' }
                })

                if (!server) {
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
            }

            //await sendEmail({ email, emailType: 'verify', userId: user.id, token: verifyToken })
            //TODO: send email verification
            await Mail(
                { to: user.email, subject: `Activate your ${process.env.APP_NAME} account` },
                <RegisterationMail
                    mailData={
                        { to: user.email, token: verifyToken }
                    }
                />
            )
            console.log('Send email verification')
        }



    } catch (error) {
        console.log(error)
        return {
            error: "Failed to create user"
        }
    }


    return { data: user };

}


export const registerUser = createSafeAction(UserRegister, handler);