

import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { SignJWT, jwtVerify } from "jose";
import { MemberRole } from "@prisma/client";
import { v4 as uuidv4 } from 'uuid'
import { headers } from "next/headers";
import { decrypt } from "@/lib/auth";
import { orderBy } from "lodash";
import { data } from "autoprefixer";


export async function DELETE(req, { params }) {

    try {
        let user
        const headersList = headers()
        const accessToken = headersList.get('Authorization')
        const { addressId } = params
        console.log('Delete address', addressId)

        const { userId } = await decrypt(accessToken)
        user = await db.user.findUnique({ where: { id: userId } })

        if (!user) return NextResponse.json({ status: 401, message: 'Unauthorized access' })

        await db.address.delete({
            where: { id: addressId, userId },
        })

        const addresses = await db.address.findMany({
            where: { userId: userId },
            orderBy: {
                updatedAt: 'desc',
            },
        })

        console.log(addresses)


        return NextResponse.json({ status: 200, message: 'address deleted', addresses })
    } catch (error) {
        console.log(error)
        return NextResponse.json({ status: 500, message: 'Internal server Error' })
    }
}