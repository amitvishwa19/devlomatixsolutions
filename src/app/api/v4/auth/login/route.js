import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import jwt from 'jsonwebtoken'
import bcryptjs from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { v4 as uuidv4 } from 'uuid'
import { MemberRole } from "@prisma/client";

export async function POST(req) {

    try {
        const secretKey = process.env.APP_SECRET;
        const key = new TextEncoder().encode(secretKey);
        const payload = await req.json();
        const { email, password, deviceToken, location } = payload
        let user
        let server

        console.log('mobile api login', location)

        //Checking for user if already exixts
        user = await db.user.findUnique({
            where: { email },
        })

        console.log('user', user)


        if (!user) {
            return NextResponse.json({ message: "User does not exist", status: 401 })
        }

        const validPassword = await bcryptjs.compare(password, user.password)
        if (!validPassword) {
            return NextResponse.json({ message: "Invalid credentials", status: 401 })
        }

        const accessToken = await new SignJWT({ userId: user.id }).setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime("24h").sign(key);
        const refreshToken = await new SignJWT({ userId: user.id }).setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime("10d").sign(key);

        await db.user.update({
            where: { email: email },
            data: {
                accessToken,
                refreshToken,
                deviceToken,
                profile: {
                    update: {
                        location: location,
                    }
                }
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