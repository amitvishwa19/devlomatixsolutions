
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
//import { sendEmail } from "@/utils/mailer";
import bcryptjs from "bcryptjs";
import { MemberRole } from "@prisma/client";
import { v4 as uuidv4 } from 'uuid'


export async function POST(req) {
    try {



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
            return NextResponse.json({ status: 500, error: 'user already exists' })
        }


        const hashedPassword = await bcryptjs.hash(password, 10)
        const displayName = email.split('@')[0]


        user = await db.user.create({
            data: {
                email,
                password: hashedPassword,
                displayName,
                deviceToken,
                credit: {
                    create: {
                        type: 'virtual',
                        value: 500
                    }
                },
                profile: {
                    create: {
                        displayname: displayName,
                        location: location
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

        return NextResponse.json({ status: 200, message: "Registration success" })
    } catch (error) {
        return NextResponse.json({ error: error.message, status: 500 })
    }
}