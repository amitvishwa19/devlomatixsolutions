'use server'
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createSafeAction } from "@/utils/CreateSafeAction";
import bcryptjs from "bcryptjs";
import { sendEmail } from "@/utils/mailer";
import { SignJWT } from "jose";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { Mail } from "@/utils/Mail";
import RegisterationMail from "@/emails/RegisterationMail";
import { v4 as uuidv4 } from 'uuid'
import { MemberRole, ROLE } from "@prisma/client";
import { AppMailer } from "@/utils/AppMailer";
import { render } from "@react-email/render";

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


        const secretKey = process.env.ENCRYPTION_KEY;
        const key = new TextEncoder().encode(secretKey);

        const hashedPassword = await bcryptjs.hash(password, 10)
        const userId = uuidv4()

        const accessToken = await new SignJWT({ email }).setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime("24h").sign(key);
        const refreshToken = await new SignJWT({ userId }).setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime("10d").sign(key);

        user = await db.user.create({
            data: {
                //id: userId,
                email, password: hashedPassword, displayName,
                accessToken, refreshToken,
            }
        })


        //console.log('user registration test', 'displayName', displayName)

        if (user) {
            verifyToken = await new SignJWT({ id: user.id }).setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime("1d").sign(key);
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
                            default: true,
                            channels: {
                                create: [{ name: 'general', userId: user?.id }]
                            },
                            members: {
                                create: [{
                                    userId: user?.id,
                                    role: MemberRole.ADMIN
                                }]
                            }
                        }
                    })
                }
            }

            if (server) {
                // Seed the registration template for this new workspace
                const templateHtml = await render(<RegisterationMail mailData={{ token: '{{mailData.token}}' }} />);
                const decodedHtml = templateHtml.replace(/%7B%7B/g, '{{').replace(/%7D%7D/g, '}}');

                await db.emailAssignment.upsert({
                    where: {
                        workspaceId_event: {
                            workspaceId: server.id,
                            event: 'USER_REGISTRATION'
                        }
                    },
                    update: {},
                    create: {
                        workspaceId: server.id,
                        event: 'USER_REGISTRATION',
                        templateName: 'RegisterationMail.jsx',
                        subject: `Welcome to ${process.env.APP_NAME}`,
                        content: decodedHtml,
                        isActive: true
                    }
                });

                // Send the email using the custom AppMailer module
                await AppMailer(server.id, {
                    to: user.email,
                    templateName: 'RegisterationMail.jsx',
                    templateData: { mailData: { token: verifyToken } }
                });

                console.log(`[Registration] Verification email sent to ${user.email}`);
            }
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