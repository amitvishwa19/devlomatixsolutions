import { headers } from "next/headers"
import { NextResponse } from "next/server"
import { decrypt } from "@/lib/auth";
import { db } from "@/lib/db";
import { orderBy } from "lodash";

export async function GET(req, { params }) {

    try {
        console.log('Allergy server route')
        const headersList = headers()
        const accessToken = headersList.get('Authorization')
        const { userId } = await decrypt(accessToken)
        const user = await db.user.findUnique({ where: { id: userId } })
        if (!user) return NextResponse.json({ status: 401, message: 'Unauthorized access' })


        const allergies = await db.allergy.findMany({
            where: {
                userId: userId
            },
            orderBy: {
                createdAt: 'desc'
            }
        })


        //console.log(items)


        return NextResponse.json({ status: 200, allergies: allergies })
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

        const allergy = await db.allergy.create({
            data: {
                userId: userId,
                title: allergyType,
                description: allergyDescription
            }
        })

        const allergies = await db.allergy.findMany({
            where: {
                userId: userId
            },
            orderBy: {
                createdAt: 'desc'
            }
        })




        return NextResponse.json({ status: 200, allergy: allergy, allergies: allergies })
    } catch (error) {
        console.log(error)
        return NextResponse.json({ status: 500, message: 'Internal Error' })
    }
}