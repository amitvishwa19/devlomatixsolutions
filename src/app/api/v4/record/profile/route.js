import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { SignJWT, jwtVerify } from "jose";
import { MemberRole } from "@prisma/client";
import { v4 as uuidv4 } from 'uuid'
import { headers } from "next/headers";
import { decrypt } from "@/lib/auth";


export async function GET(req, { params }) {

    try {
        let user
        console.log('Get User Profile')
        const headersList = headers()
        const accessToken = headersList.get('Authorization')
        //const payload = await req.json();
        // const { firstname, lastname, dob, sex, memberId } = payload
        const { profileId } = params

        const { userId } = await decrypt(accessToken)
        user = await db.user.findUnique({ where: { id: userId } })



        console.log('Update or add Records', profileId)

        // //console.log('Update or add Records', user)

        if (!user) return NextResponse.json({ status: 401, message: 'Unauthorized access' })

        const profile = await db.profile.findUnique({
            where: { userId: profileId },
        })



        return NextResponse.json({ status: 200, profile: profile, user: user })
    } catch (error) {
        console.log(error)
        return NextResponse.json({ status: 500, message: 'Internal Error', user: null })
    }
}

export async function POST(req, { params }) {

    try {
        let user
        let profile
        const headersList = headers()
        const accessToken = headersList.get('Authorization')
        const payload = await req.json();
        const { firstname, lastname, dob, gender, weight, height, waist, memberId, bloodGroup, contact, emrContact } = payload.data

        const { userId } = await decrypt(accessToken)
        user = await db.user.findUnique({ where: { id: userId } })

        console.log('Update or add Records', payload.data)

        if (!user) return NextResponse.json({ status: 401, message: 'Unauthorized access' })



        profile = await db.profile.update({
            where: { userId: userId },
            data: {
                firstname,
                lastname,
                dob,
                gender,
                weight: parseFloat(weight),
                height: parseFloat(height),
                waist: parseFloat(waist),
                bloodGroup,
                contact,
                emrcontact: emrContact
            }
        })

        if (profile) {
            const user = await db.user.update({
                where: { id: userId },
                data: { profileStatus: true }
            })
        }

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


        //console.log('Update or add Records new route', profile)


        return NextResponse.json({ status: 200, profile: profile, user: user })
    } catch (error) {
        console.log(error)
        return NextResponse.json({ status: 500, message: 'Internal Error', user: null })
    }
}


