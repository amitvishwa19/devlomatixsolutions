import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { SignJWT, jwtVerify } from "jose";
import { APPOINTMENTSTATUS, MemberRole, ROLE } from "@prisma/client";
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
        const searchParams = req.nextUrl.searchParams;
        const userType = searchParams.get('userType')

        const user = await db.user.findUnique({ where: { id: userId } })
        if (!user) return NextResponse.json({ status: 401, message: 'Unauthorized access' })

        const appointments = await db.appointment.findMany({
            where: userType === ROLE.DOCTOR ? { doctorId: userId } : { patientId: userId },
            include: {
                doctor: {
                    include: {
                        profile: true
                    }
                },
                patient: true
            },
            orderBy: {
                updatedAt: 'desc',
            },
        })
        console.log('geting appointments')

        return NextResponse.json({ status: 200, appointments: appointments })
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
        const { date, slot, time, note, type, selectedDoctor, patient, presData } = payload.data
        //console.log('payload', payload.data)

        const { userId } = await decrypt(accessToken)
        user = await db.user.findUnique({ where: { id: userId } })



        if (!user) return NextResponse.json({ status: 401, message: 'Unauthorized access' })

        const checkAppointment = await db.appointment.findFirst({
            where: {
                patientId: patient,
                doctorId: selectedDoctor,
                status: APPOINTMENTSTATUS.PENDING
            }
        })


        console.log('@checkAppointment', moment(checkAppointment?.date).format("MMM Do YY"))

        if (checkAppointment) {
            const d1 = moment(checkAppointment?.date).format("MMM Do YY")
            console.log('@d1', d1)
            const d2 = moment(date.date).format("MMM Do YY")
            console.log('@d2', d2)
            if (d1 === d2) return NextResponse.json({ status: 400, message: 'Appointment for this date already exists, please delete previous appointment before creating new appointment' })
        }

        appointment = await db.appointment.create({
            data: {
                patientId: patient,
                doctorId: selectedDoctor,
                date: new Date(date.date),
                slot: slot.slot,
                note: presData.note,
                time: time,
                type: type?.type,
                status: 'PENDING',
                uid: Math.floor(Math.random() * (9999999999 - 1000000000 + 1) + 1000000000).toString(),
                transaction: {
                    create: {
                        amount: type?.charge,
                        status: 'PENDING',
                        type: type?.type,
                    }
                },
                prescription: {
                    create: {
                        title: presData?.title,
                        description: presData?.description,
                        prescription: {}
                    }
                },
            },

        })



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