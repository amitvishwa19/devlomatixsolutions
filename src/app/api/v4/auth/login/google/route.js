
import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { SignJWT, jwtVerify } from "jose";
import { MemberRole } from "@prisma/client";
import { v4 as uuidv4 } from 'uuid'

export async function POST(req) {

    try {
        const secretKey = process.env.APP_SECRET;
        const key = new TextEncoder().encode(secretKey);
        const payload = await req.json();
        const { uid, email, provider, displayName, avatar, location, deviceToken, expoPushToken } = payload
        let user
        let server

        user = await db.user.upsert({
            where: { email: email },
            update: {
                uid,
                email,
                provider,
                displayName,
                avatar,
                deviceToken,
                expoPushToken,
                profile: {
                    update: {
                        displayname: displayName,
                        location: location,
                    }
                },
            },
            create: {
                uid,
                email,
                provider,
                displayName,
                avatar,
                deviceToken,
                expoPushToken,
                profile: {
                    create: {
                        displayname: displayName,
                        location: location,
                    }
                },
                credit: {
                    create: {
                        value: 0
                    }
                },
            },
        })

        if (user) {

            server = await db.server.findFirst({
                where: { userId: user?.id }
            })

            if (!server) {
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
                                    role: MemberRole.ADMIN
                                }
                            ]
                        }
                    }
                })
            }

        }

        const accessToken = await new SignJWT({ userId: user.id }).setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime("24h").sign(key);
        const refreshToken = await new SignJWT({ userId: user.id }).setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime("10d").sign(key);

        user = await db.user.update({
            where: { id: user.id },
            data: { accessToken, refreshToken }
        })



        user = await db.user.findUnique({
            where: { id: user.id },
            include: {
                roles: {
                    include: {
                        permissions: true
                    }
                },
                servers: {
                    orderBy: {
                        createdAt: "asc",
                    },
                    include: {
                        members: {
                            include: {
                                user: {
                                    include: {
                                        profile: true
                                    }
                                }
                            },
                            orderBy: {
                                role: "asc",
                            }
                        },
                        channels: {
                            orderBy: {
                                createdAt: "asc",
                            },
                        }
                    },
                },
                profile: true
            }
        })

        //console.log(user)


        return NextResponse.json({ status: 200, user: user })
    } catch (error) {
        console.log(error)
        return NextResponse.json({ status: 500, message: 'Internal Error', user: null })
    }

}