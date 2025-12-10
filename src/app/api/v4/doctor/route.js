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


export async function GET(req) {
    try {

        const headersList = await headers()
        const accessToken = headersList.get('Authorization')



        const { userId } = await decrypt(accessToken)

        //const decrypttoken = await decrypt(accessToken)

        //console.log('Getting all appointment', decrypttoken)


        const user = await db.user.findUnique({ where: { id: userId } })
        if (!user) return NextResponse.json({ status: 401, message: 'Unauthorized access' })

        const doctors = await db.user.findMany({
            where: { role: ROLE.DOCTOR },
            include: {
                profile: true
            },
            orderBy: {
                updatedAt: 'desc',
            },
        })

        //console.log('doctors', doctors)


        return NextResponse.json({ status: 200, doctors: doctors })
    } catch (error) {
        console.log(error)
        return NextResponse.json({ status: 500, message: 'Internal server error' })
    }
}

export async function POST(req) {

    try {
        let user

        const headersList = headers()
        const accessToken = headersList.get('Authorization')
        const payload = await req.json();
        const { date, slot, time, note, type } = payload.data
        console.log('payload', payload)

        const { userId } = await decrypt(accessToken)
        user = await db.user.findUnique({ where: { id: userId } })

        console.log(userId)

        if (!user) return NextResponse.json({ status: 401, message: 'Unauthorized access' })

        // await db.user.update({
        //     where: { id: userId },
        //     data: {
        //         address: payload,
        //     }
        // })
        console.log('new date', moment)

        const appointment = await db.appointment.create({
            data: {
                patientId: userId,
                doctorId: userId,
                date: new Date(date),
                slot,
                note,
                time,
                type,
                status: 'PENDING'
            }
        })

        //console.log('appointment', appointment)

        const appointments = await db.appointment.findMany({
            where: { patientId: user.id },
            include: {
                doctor: true
            },
            orderBy: {
                updatedAt: 'desc',
            },
        })

        //console.log('appointments', appointments)
        return NextResponse.json({ status: 200, appointment: appointment, 'appointments': appointments })
    } catch (error) {
        console.log(error)
        return NextResponse.json({ status: 500, message: 'Internal server Error' })
    }
}