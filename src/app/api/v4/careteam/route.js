import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { SignJWT, jwtVerify } from "jose";
import { MemberRole } from "@prisma/client";
import { v4 as uuidv4 } from 'uuid'
import { headers } from "next/headers";
import { decrypt } from "@/lib/auth";
import { orderBy } from "lodash";
import { data } from "autoprefixer";
import moment from "moment";


export async function GET(req) {
    try {

        const headersList = headers()
        const accessToken = headersList.get('Authorization')
        console.log('Care team api')


        const { userId } = await decrypt(accessToken)

        //const decrypttoken = await decrypt(accessToken)

        //console.log('Getting all appointment', decrypttoken)
        //console.log('userId', userId)

        const user = await db.user.findUnique(
            {
                where: { id: userId },

            }
        )
        if (!user) return NextResponse.json({ status: 401, message: 'Unauthorized access' })

        const careteam = await db.care.findMany({
            where: { patientId: userId },
            include: {
                care: true
            },
            orderBy: {
                updatedAt: 'desc',
            },
        })


        return NextResponse.json({ status: 200, careteam: careteam })
    } catch (error) {
        console.log(error)
        return NextResponse.json({ status: 500, message: 'Internal server error' })
    }
}

export async function POST(req) {

    try {
        let res

        const headersList = headers()
        const accessToken = headersList.get('Authorization')
        const payload = await req.json();
        const { careteamId } = payload.data
        console.log('payload', payload.data)

        const { userId } = await decrypt(accessToken)
        const user = await db.user.findUnique({ where: { id: userId } })

        console.log('Care Team post', careteamId, userId)

        if (!user) return NextResponse.json({ status: 401, message: 'Unauthorized access' })

        const fav = await db.care.findFirst({
            where: {
                patientId: userId,
                careId: careteamId
            }
        })


        console.log('fav', fav)

        if (!fav) {
            res = await db.care.create({
                data: {
                    patientId: userId,
                    careId: careteamId
                }
            })
        } else {
            return NextResponse.json({ status: 206, message: 'data already exists' })
        }



        //console.log('appointment', appointment)

        const care = await db.care.findMany({
            where: { patientId: user.id },
            include: {
                care: true
            },
            orderBy: {
                updatedAt: 'desc',
            },
        })

        //console.log('appointments', appointments)
        return NextResponse.json({ status: 200, res: res, 'care': care })
    } catch (error) {
        console.log(error)
        return NextResponse.json({ status: 500, message: 'Internal server Error' })
    }
}