import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { SignJWT, jwtVerify } from "jose";
import { MemberRole } from "@prisma/client";
import { v4 as uuidv4 } from 'uuid'
import { headers } from "next/headers";
import { decrypt } from "@/lib/auth";
import { orderBy } from "lodash";
import { data } from "autoprefixer";


export async function GET(req) {
    try {
        console.log('Getting all address')
        const headersList = headers()
        const accessToken = headersList.get('Authorization')
        const { userId } = await decrypt(accessToken)
        const user = await db.user.findUnique({ where: { id: userId } })
        if (!user) return NextResponse.json({ status: 401, message: 'Unauthorized access' })

        const addresses = await db.address.findMany({
            where: { userId: userId },
            orderBy: {
                updatedAt: 'desc',
            },
        })


        return NextResponse.json({ status: 200, addresses: addresses })
    } catch (error) {
        console.log(error)
        return NextResponse.json({ status: 500, message: 'Internal server error' })
    }
}

export async function POST(req) {

    try {
        let user
        console.log('Add or address')
        const headersList = headers()
        const accessToken = headersList.get('Authorization')
        const payload = await req.json();
        const { address, coords, googleAddress } = payload

        const { userId } = await decrypt(accessToken)
        user = await db.user.findUnique({ where: { id: userId } })

        if (!user) return NextResponse.json({ status: 401, message: 'Unauthorized access' })

        await db.user.update({
            where: { id: userId },
            data: {
                address: payload,
            }
        })

        await db.address.create({
            data: {
                userId,
                address: payload
            }
        })

        const addresses = await db.address.findMany({
            where: { userId: userId },
            orderBy: {
                updatedAt: 'desc',
            },
        })

        return NextResponse.json({ status: 200, address: payload, addresses })
    } catch (error) {
        console.log(error)
        return NextResponse.json({ status: 500, message: 'Internal server Error' })
    }
}