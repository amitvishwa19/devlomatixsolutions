import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { SignJWT, jwtVerify } from "jose";
import { MemberRole } from "@prisma/client";
import { v4 as uuidv4 } from 'uuid'
import { headers } from "next/headers";
import { decrypt } from "@/lib/auth";
import { orderBy } from "lodash";


export async function GET(req) {

    console.log('Getting all prescriptions from server')
    try {
        let prescriptions = []
        const headersList = headers()
        const accessToken = headersList.get('Authorization')
        const { userId } = await decrypt(accessToken)
        const user = await db.user.findUnique({ where: { id: userId } })
        if (!user) return NextResponse.json({ status: 401, message: 'Unauthorized access' })


        prescriptions = await db.prescription.findMany({
            where: {
                userId: userId,
                status: true
            },
            include: {
                appointment: {
                    include: {
                        doctor: true
                    }
                }

            },
            orderBy: {
                createdAt: 'desc'
            }
        })

        console.log('@prescriptions', prescriptions)

        return NextResponse.json({ status: 200, prescriptions })
    } catch (error) {
        return NextResponse.json({ status: 500, message: 'Internal server error' })
    }

}
