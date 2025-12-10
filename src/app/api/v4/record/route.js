import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { SignJWT, jwtVerify } from "jose";
import { MemberRole } from "@prisma/client";
import { v4 as uuidv4 } from 'uuid'
import { headers } from "next/headers";
import { decrypt } from "@/lib/auth";
import { orderBy } from "lodash";


export async function GET(req) {
    try {
        console.log('Getting Health Records')
        const headersList = headers()
        const accessToken = headersList.get('Authorization')
        const { userId } = await decrypt(accessToken)
        const user = await db.user.findUnique({ where: { id: userId } })
        if (!user) return NextResponse.json({ status: 401, message: 'Unauthorized access' })

        const records = await db.healthRecord.findMany({
            orderBy: {
                order: 'asc'
            }
        })


        return NextResponse.json({ status: 200, records: records })
    } catch (error) {
        return NextResponse.json({ status: 500, message: 'Internal server error' })
    }
}

export async function POST(req) {

    try {
        let user
        console.log('Update or add Records')
        const headersList = headers()
        const accessToken = headersList.get('Authorization')
        const payload = await req.json();
        const { firstname, lastname, dob, sex, memberId } = payload

        const { userId } = await decrypt(accessToken)
        user = await db.user.findUnique({ where: { id: userId } })

        //console.log('Update or add Records', user)

        if (!user) return NextResponse.json({ status: 401, message: 'Unauthorized access' })

        console.log('Update or add Records', payload)

        const profile = await db.profile.update({
            where: { userId: memberId },
            data: {
                firstname,
                lastname,
                dob
            }
        })



        return NextResponse.json({ status: 200, record: 'record' })
    } catch (error) {

        return NextResponse.json({ status: 500, message: 'Internal Error', user: null })
    }
}