import { headers } from "next/headers"
import { NextResponse } from "next/server"
import { decrypt } from "@/lib/auth";
import { db } from "@/lib/db";
import { orderBy } from "lodash";

export async function GET(req, { params }) {

    try {

        console.log('Health Metics data')
        const headersList = headers()
        const accessToken = headersList.get('Authorization')
        const { userId } = await decrypt(accessToken)
        const user = await db.user.findUnique({ where: { id: userId } })
        if (!user) return NextResponse.json({ status: 401, message: 'Unauthorized access' })


        const records = await db.healthMetric.findMany({
            where: {
                userId: userId
            },
            orderBy: {
                createdAt: 'desc'
            },
        })



        //console.log(items)


        return NextResponse.json({ status: 200, records: records })
    } catch (error) {
        console.log(error)
        return NextResponse.json({ status: 500, message: 'Internal Error', user: null })
    }
}

export async function POST(req) {

    try {
        let healthMetric = {}
        const headersList = headers()
        const accessToken = headersList.get('Authorization')
        const payload = await req.json();
        const { value, unit, data } = payload
        console.log('Add Record', payload.data)

        const { userId } = await decrypt(accessToken)
        const user = await db.user.findUnique({ where: { id: userId } })

        if (!user) return NextResponse.json({ status: 401, message: 'Unauthorized access' })

        healthMetric = await db.healthMetric.create({
            data: {
                userId: userId,
                title: payload.data.data.title,
                slug: payload.data.data.slug,
                value: payload.data.value.toString(),
                unit: payload.data?.data.unit
            }
        })

        const healthMetricRecords = await db.healthMetric.findMany({
            where: { userId },
            orderBy: {
                createdAt: 'asc'
            },
        })




        return NextResponse.json({ status: 200, healthMetric, healthMetricRecords })
    } catch (error) {
        console.log(error)
        return NextResponse.json({ status: 500, message: 'Internal Error' })
    } finally {

    }
}