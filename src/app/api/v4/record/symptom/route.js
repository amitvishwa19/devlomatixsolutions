import { headers } from "next/headers"
import { NextResponse } from "next/server"
import { decrypt } from "@/lib/auth";
import { db } from "@/lib/db";
import { orderBy } from "lodash";

export async function GET(req, { params }) {

    try {

        const headersList = headers()
        const accessToken = headersList.get('Authorization')
        const { userId } = await decrypt(accessToken)
        const user = await db.user.findUnique({ where: { id: userId } })
        if (!user) return NextResponse.json({ status: 401, message: 'Unauthorized access' })


        const symptoms = await db.symptom.findMany({
            where: {
                userId: userId
            },
            orderBy: {
                createdAt: 'desc'
            }
        })


        //console.log(items)


        return NextResponse.json({ status: 200, symptoms: symptoms })
    } catch (error) {
        console.log(error)
        return NextResponse.json({ status: 500, message: 'Internal Error', user: null })
    }
}

export async function POST(req, { params }) {

    try {

        const headersList = headers()
        const accessToken = headersList.get('Authorization')
        const payload = await req.json();
        const { allergyType, allergyDescription } = payload.data

        const { userId } = await decrypt(accessToken)
        const user = await db.user.findUnique({ where: { id: userId } })

        if (!user) return NextResponse.json({ status: 401, message: 'Unauthorized access' })

        const symptom = await db.symptom.create({
            data: {
                userId: userId,
                title: allergyType,
                description: allergyDescription
            }
        })

        const symptoms = await db.symptom.findMany({
            where: {
                userId: userId
            },
            orderBy: {
                createdAt: 'desc'
            }
        })




        return NextResponse.json({ status: 200, symptom: symptom, symptoms: symptoms })
    } catch (error) {
        console.log(error)
        return NextResponse.json({ status: 500, message: 'Internal Error' })
    }
}