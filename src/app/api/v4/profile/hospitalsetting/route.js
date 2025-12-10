import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { SignJWT, jwtVerify } from "jose";
import { MemberRole, ROLE } from "@prisma/client";
import { v4 as uuidv4 } from 'uuid'
import { headers } from "next/headers";
import { decrypt } from "@/lib/auth";
import { orderBy } from "lodash";
import { data } from "autoprefixer";
import moment from "moment";


export async function GET(req, { params }) {
    try {

        console.log('@getting hospital setting data')

        const headersList = await headers()
        const accessToken = headersList.get('Authorization')
        const { userId } = await decrypt(accessToken)
        const searchParams = req.nextUrl.searchParams;

        const user = await db.user.findUnique({ where: { id: userId } })
        if (!user) return NextResponse.json({ status: 401, message: 'Unauthorized access' })

        const hospitalsettings = await db.profile.findFirst({
            where: { userId: userId },

        })


        return NextResponse.json({ status: 200, hospitalsettings })
    } catch (error) {
        console.log(error)
        return NextResponse.json({ status: 500, message: 'Internal server error' })
    }
}

export async function POST(req) {

    try {
        let user
        let appointment

        const headersList = await headers()
        const accessToken = headersList.get('Authorization')
        const payload = await req.json();
        const { open, timings, slotTime, consultation } = payload.data
        //console.log('payload', payload.data.open)

        const { userId } = await decrypt(accessToken)
        user = await db.user.findUnique({ where: { id: userId } })

        //console.log('clg from profile save', userId)

        if (!user) return NextResponse.json({ status: 401, message: 'Unauthorized access' })


        const hospitalsettings = await db.profile.update({
            where: { userId: userId },
            data: {
                open: open,
                timing: timings,
                slotTime: slotTime,
                consultationOptions: consultation
            }
        })



        //console.log('appointments', appointments)
        return NextResponse.json({ status: 200, hospitalsettings })
    } catch (error) {
        console.log(error)
        return NextResponse.json({ status: 500, message: 'Internal server Error' })
    }
}