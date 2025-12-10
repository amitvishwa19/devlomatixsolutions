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
        console.log('Allergy delete')

        const { id } = params
        const headersList = headers()
        const accessToken = headersList.get('Authorization')
        const { userId } = await decrypt(accessToken)

        console.log(params)

        const user = await db.user.findUnique({
            where: { id: userId },
        })

        if (!user) return NextResponse.json({ status: 401, message: 'Unauthorized access' })


        const allergy = await db.allergy.delete({
            where: { id: id }
        })

        const allergies = await db.allergy.findMany({
            where: { userId: userId },
            orderBy: { createdAt: 'desc' }
        })





        return NextResponse.json({ status: 200, allergy: allergy, allergies: allergies })
    } catch (error) {
        return NextResponse.json({ status: 500, message: 'Internal server Error' })
    }
}

