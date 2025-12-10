
import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { SignJWT, jwtVerify } from "jose";
import { MemberRole } from "@prisma/client";
import { v4 as uuidv4 } from 'uuid'
import { headers } from "next/headers";
import { decrypt } from "@/lib/auth";

export async function POST(req, { params }) {

    try {

        const headersList = headers()
        const accessToken = headersList.get('Authorization')

        const { userId } = await decrypt(accessToken)
        const payload = await req.json();
        const { memberId } = params

        const { serverId } = payload
        let tempmail
        let user

        //console.log('Add member after scan', memberId)

        if (userId) {

            await db.server.update({
                where: {
                    id: serverId,
                },
                data: {
                    members: {
                        create: [
                            {
                                userId: memberId,
                            }
                        ]
                    }
                }
            });


        } else {
            NextResponse.json({ status: 401, message: 'Unauthorized access' })
        }


        return NextResponse.json({ status: 200, user: 'user' })
    } catch (error) {
        console.log(error)
        return NextResponse.json({ status: 500, message: 'Internal Error', user: null })
    }

}