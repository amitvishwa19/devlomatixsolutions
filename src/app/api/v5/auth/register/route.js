
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
//import { sendEmail } from "@/utils/mailer";
import bcryptjs from "bcryptjs";
import { MemberRole } from "@prisma/client";
import { v4 as uuidv4 } from 'uuid';
import { SignJWT } from "jose";


export async function POST(req) {
    try {

        console.log("register api called")

        const payload = await req.json();
        const { email, password, location, deviceToken } = payload;


        let user
        let server

        if (!(email && password)) {
            return NextResponse.json({ error: "email and password is required" }, { status: 500 })
        }

        user = await db.user.findUnique({
            where: { email: email },
        })

        if (user) {
            return NextResponse.json({ status: 409, error: 'user already exists' }, { status: 409 })
        }


        const hashedPassword = await bcryptjs.hash(password, 10)
        const displayName = email.split('@')[0]
        const userId = uuidv4()

        const secretKey = process.env.ENCRYPTION_KEY;
        const key = new TextEncoder().encode(secretKey);
        const accessToken = await new SignJWT({ userId }).setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime("24h").sign(key);
        const refreshToken = await new SignJWT({ userId }).setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime("10d").sign(key);

        user = await db.user.create({
            data: {
                id: userId,
                email,
                password: hashedPassword,
                displayName,
                deviceToken,
                accessToken,
                refreshToken,
                credit: {
                    create: {
                        type: 'virtual',
                        value: 500
                    }
                },
                profile: {
                    create: {
                        info: {
                            displayname: displayName,
                            location: location
                        }
                    }
                }
            }
        })


        // if (user) {
        //     const profile = await db.profile.upsert({
        //         where: { userId: user.id, },
        //         update: {
        //             userId: user.id,
        //             type: 'profile',
        //             location
        //         },
        //         create: {
        //             userId: user.id,
        //             type: 'profile',
        //             location
        //         },
        //     })
        // }




        if (user) {
            server = await db.server.create({
                data: {
                    userId: user?.id,
                    name: user?.displayName,
                    default: true,
                    inviteCode: uuidv4(),
                    selected: true,
                    channels: {
                        create: [{ name: 'general', userId: user?.id }]
                    },
                    members: {
                        create: [
                            {
                                userId: user?.id,
                                role: MemberRole.PATIENT
                            }
                        ]
                    }
                }
            })
        }

        if (user) {
            //await sendEmail({ email, emailType: 'verify', userId: user.id })
        }

        return NextResponse.json({ status: 200, message: "Registration success" }, { status: 200 })
    } catch (error) {
        console.error("Registration error:", error);
        return NextResponse.json({ error: error.message, status: 500 }, { status: 500 })
    }
}