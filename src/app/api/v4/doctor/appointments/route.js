import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { APPOINTMENTSTATUS, MemberRole } from "@prisma/client";
import { headers } from "next/headers";
import { decrypt } from "@/lib/auth";



export async function GET(req) {

    try {

        const headersList = await headers()
        const accessToken = headersList.get('Authorization')
        const { userId } = await decrypt(accessToken)

        const searchParams = req.nextUrl.searchParams;
        const doctorId = searchParams.get('doctorId')
        console.log(doctorId)

        const user = await db.user.findUnique({ where: { id: userId } })
        if (!user) return NextResponse.json({ status: 401, message: 'Unauthorized access' })

        const appointments = await db.appointment.findMany({
            where: { doctorId: doctorId, status: APPOINTMENTSTATUS.PENDING },
            // include: {
            //     doctor: true,
            //     patient: true
            // },
            orderBy: {
                updatedAt: 'desc',
            },
        })

        console.log(appointments)

        return NextResponse.json({ status: 200, appointments: appointments })
    } catch (error) {
        console.log(error)
        return NextResponse.json({ status: 500, message: 'Internal server error' })
    }
}