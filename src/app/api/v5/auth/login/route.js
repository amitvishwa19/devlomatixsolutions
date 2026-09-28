import { db } from "@/lib/db";
import bcryptjs from "bcryptjs";
import { SignJWT } from "jose";
import { NextResponse } from "next/server";

export async function POST(req) {

    try {
        const secretKey = process.env.ENCRYPTION_KEY;
        const key = new TextEncoder().encode(secretKey);
        const payload = await req.json();
        const { email, password, deviceToken, expoPushToken, location } = payload
        let user
        let server

        console.log('mobile api login', location)

        if (!email || !password || typeof password !== "string") {
            return NextResponse.json({ message: "Email and password are required", status: 400 }, { status: 400 })
        }

        //Checking for user if already exixts
        user = await db.user.findUnique({
            where: { email },
        })

        console.log('user', user)


        if (!user) {
            return NextResponse.json({ message: "User does not exist", status: 401 }, { status: 401 })
        }

        if (!user.password || typeof user.password !== "string") {
            return NextResponse.json({ message: "Invalid credentials", status: 401 }, { status: 401 })
        }

        const validPassword = await bcryptjs.compare(password, user.password)
        if (!validPassword) {
            return NextResponse.json({ message: "Invalid credentials", status: 401 }, { status: 401 })
        }

        const accessToken = await new SignJWT({ userId: user.id }).setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime("24h").sign(key);
        const refreshToken = await new SignJWT({ userId: user.id }).setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime("10d").sign(key);

        await db.user.update({
            where: { email: email },
            data: {
                accessToken,
                refreshToken,
                deviceToken,
                expoPushToken,
                ...(location ? {
                    profile: {
                        upsert: {
                            create: {
                                info: { location }
                            },
                            update: {
                                info: { location }
                            }
                        }
                    }
                } : {})
            },
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
        return NextResponse.json({ error: 'internal server error' }, { status: 500 })
    }
}