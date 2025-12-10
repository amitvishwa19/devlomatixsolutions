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

        console.log('Record server route')



        if (!user) return NextResponse.json({ status: 401, message: 'Unauthorized access' })


        const records = await db.record.findMany({
            where: {
                userId: userId
            },
            orderBy: {
                createdAt: 'desc'
            }
        })


        //console.log(items)


        return NextResponse.json({ status: 200, records: records })
    } catch (error) {
        console.log(error)
        return NextResponse.json({ status: 500, message: 'Internal Error', user: null })
    }
}

export async function POST(req, { params }) {

    try {

        console.log('records')

        let record = {}
        let records = []
        const headersList = headers()
        const accessToken = headersList.get('Authorization')
        const payload = await req.json();
        const { title, description, type, prescription } = payload.data

        const { userId } = await decrypt(accessToken)
        const user = await db.user.findUnique({ where: { id: userId } })

        if (!user) return NextResponse.json({ status: 401, message: 'Unauthorized access' })

        record = await db.record.create({
            data: {
                userId: userId,
                title: title,
                description: description,
                type: type,

            }
        })

        records = await db.record.findMany({
            where: {
                userId: userId
            },
            orderBy: {
                createdAt: 'desc'
            }
        })




        return NextResponse.json({ status: 200, record: record, records: records })
    } catch (error) {
        console.log(error)
        return NextResponse.json({ status: 500, message: 'Internal Error' })
    }
}