import { decrypt } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { SignJWT, jwtVerify } from "jose";
import { headers } from "next/headers";



export async function POST(req) {
    try {
        console.log('getting user from token')
        let user = null
        const headersList = headers()
        const accessToken = headersList.get('Authorization')
        //console.log('userfromtoken', accessToken)

        const secretKey = process.env.APP_SECRET;




        const key = new TextEncoder().encode(secretKey);

        const { userId } = await decrypt(accessToken)




        user = await db.user.findUnique({
            where: { id: userId },
            include: {
                roles: {
                    include: {
                        permissions: true
                    }
                },
                channels: {
                    orderBy: {
                        createdAt: "asc",
                    },
                },
                members: {
                    include: {
                        user: true,
                    },
                    orderBy: {
                        role: "asc",
                    }
                }
            }
        })



        if (user) {
            const accessToken = await new SignJWT({ userId: user.id }).setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime("24h").sign(key);
            const refreshToken = await new SignJWT({ userId: user.id }).setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime("10d").sign(key);

            await db.user.update({
                where: { id: userId },
                data: { refreshToken },
            })

            // user = {
            //     id: user?.id,
            //     uid: user?.uid,
            //     displayName: user?.displayName,
            //     email: user?.email,
            //     avatar: user?.avatar,
            //     roles: user?.roles,
            //     channels: user?.channels,
            //     members: user?.members,
            //     accessToken,
            //     refreshToken
            // }

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
        }


        console.log(user)


        return NextResponse.json({ status: 200, user: user })
    } catch (error) {

        return NextResponse.json({ error: 'internal server error' }, { status: 500 })
    }
}