import { NextResponse } from "next/server"
import { headers } from 'next/headers'
import { SignJWT, jwtVerify } from "jose";
import { decrypt } from "@/lib/auth";
import { db } from "@/lib/db";

export async function DELETE(req, { params }) {
    try {
        const { docId } = params
        const headersList = headers()
        const accessToken = headersList.get('Authorization')
        const { userId } = await decrypt(accessToken)
        let document, documents

        const user = await db.user.findUnique({
            where: { id: userId },
        })

        if (user) {
            document = await db.document.delete({
                where: {
                    id: docId,
                    userId: userId
                }
            })

        } else {
            NextResponse.json({ status: 401, message: 'Unauthorized access' })
        }

        documents = await db.document.findMany(
            {
                where: {
                    userId: userId,
                    documentType: 'health-record'
                }
            })

        //console.log('User from access token', user)


        return NextResponse.json({ status: 200, document, documents })
    } catch (error) {
        return NextResponse.json({ status: 500, message: 'Internal server Error' })
    }
}