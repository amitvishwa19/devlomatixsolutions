import { decrypt } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { SignJWT, jwtVerify } from "jose";
import { headers } from "next/headers";



export async function POST(req) {
    try {
        console.log('getting user from token')
        let user = null;
        let bodyPayload = {};
        try {
            bodyPayload = await req.json();
        } catch (_) {}

        let accessToken = req?.headers?.get('Authorization') || req?.headers?.get('authorization');
        if (!accessToken) {
            accessToken = bodyPayload?.token || bodyPayload?.accessToken || bodyPayload?.refreshToken;
        }
        if (!accessToken) {
            try {
                const headersList = await headers();
                accessToken = headersList.get('Authorization') || headersList.get('authorization');
            } catch (_) {}
        }

        const secretKey = process.env.ENCRYPTION_KEY;
        const key = new TextEncoder().encode(secretKey);

        const decoded = await decrypt(accessToken);
        const userId = decoded?.userId || decoded?.id;
        if (!userId) {
            return NextResponse.json({ message: "Invalid or expired token", status: 401 }, { status: 401 });
        }




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
        });

        if (!user) {
            return NextResponse.json({ message: "User not found", status: 401 }, { status: 401 });
        }

        // Single-device mutual exclusivity:
        // If user logged into Web, the Mobile session is revoked
        if (user.activeSession && typeof user.activeSession === "object" && user.activeSession.platform === "web") {
            return NextResponse.json(
                { message: "SESSION_SUPERSEDED: Your account was logged in on Web. Please sign in again.", status: 401 },
                { status: 401 }
            );
        }



        // If user does not have an activeSession yet, establish mobile activeSession
        if (!user.activeSession) {
            const { recordUserLoginSession } = await import("@/lib/sessionAuth");
            await recordUserLoginSession({
                userId: user.id,
                email: user.email,
                userName: user.displayName,
                platform: "mobile",
                deviceModel: bodyPayload?.deviceModel || bodyPayload?.device || "Mobile App",
                req,
            });
        }

        if (user) {
            const accessToken = await new SignJWT({
                userId: user.id,
                platform: "mobile",
            }).setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime("24h").sign(key);
            const refreshToken = await new SignJWT({
                userId: user.id,
                platform: "mobile",
            }).setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime("10d").sign(key);

            const updateData = { accessToken, refreshToken };
            if (bodyPayload?.expoPushToken) updateData.expoPushToken = bodyPayload.expoPushToken;
            if (bodyPayload?.deviceToken) updateData.deviceToken = bodyPayload.deviceToken;

            await db.user.update({
                where: { id: userId },
                data: updateData,
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
            if (user) {
                user.accessToken = accessToken;
                user.refreshToken = refreshToken;
            }
        }

        return NextResponse.json({
            status: 200,
            user: user,
            accessToken: user?.accessToken,
            refreshToken: user?.refreshToken
        })
    } catch (error) {

        return NextResponse.json({ error: 'internal server error' }, { status: 500 })
    }
}