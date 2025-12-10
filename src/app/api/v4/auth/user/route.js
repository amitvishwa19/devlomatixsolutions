import { decrypt } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { SignJWT, jwtVerify } from "jose";
import { headers } from "next/headers";



export async function POST(req) {
    try {
        let user
        const headersList = headers()
        const accessToken = headersList.get('Authorization')
        const payload = await req.json();
        const { guestUserId } = payload

        const { userId } = await decrypt(accessToken)
        user = await db.user.findUnique({ where: { id: userId } })

        //console.log('Update or add Records', user)

        if (!user) return NextResponse.json({ status: 401, message: 'Unauthorized access' })


        //console.log('guestUserId', guestUserId)

        const gusetUser = await db.user.findUnique({
            where: { id: guestUserId },
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


        // user = await db.user.findUnique({
        //     where: { id: userId },
        //     include: {
        //         roles: {
        //             include: {
        //                 permissions: true
        //             }
        //         },
        //         channels: {
        //             orderBy: {
        //                 createdAt: "asc",
        //             },
        //         },
        //         members: {
        //             include: {
        //                 user: true,
        //             },
        //             orderBy: {
        //                 role: "asc",
        //             }
        //         }
        //     }
        // })



        // if (user) {
        //     const accessToken = await new SignJWT({ userId: user.id }).setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime("24h").sign(key);
        //     const refreshToken = await new SignJWT({ userId: user.id }).setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime("10d").sign(key);

        //     await db.user.update({
        //         where: { id: userId },
        //         data: { refreshToken },
        //     })

        //     // user = {
        //     //     id: user?.id,
        //     //     uid: user?.uid,
        //     //     displayName: user?.displayName,
        //     //     email: user?.email,
        //     //     avatar: user?.avatar,
        //     //     roles: user?.roles,
        //     //     channels: user?.channels,
        //     //     members: user?.members,
        //     //     accessToken,
        //     //     refreshToken
        //     // }

        //     user = await db.user.findUnique({
        //         where: { id: user.id },
        //         include: {
        //             roles: {
        //                 include: {
        //                     permissions: true
        //                 }
        //             },
        //             servers: {
        //                 orderBy: {
        //                     createdAt: "asc",
        //                 },
        //                 include: {
        //                     members: {
        //                         include: {
        //                             user: {
        //                                 include: {
        //                                     profile: true
        //                                 }
        //                             }
        //                         },
        //                         orderBy: {
        //                             role: "asc",
        //                         }
        //                     },
        //                     channels: {
        //                         orderBy: {
        //                             createdAt: "asc",
        //                         },
        //                     }
        //                 },
        //             },
        //             profile: true
        //         }
        //     })
        // }


        //console.log(user)


        return NextResponse.json({ status: 200, user: gusetUser })
    } catch (error) {

        return NextResponse.json({ error: 'internal server error' }, { status: 500 })
    }
}