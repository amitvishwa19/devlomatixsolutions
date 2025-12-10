
import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { SignJWT, jwtVerify } from "jose";
import { MemberRole } from "@prisma/client";
import { v4 as uuidv4 } from 'uuid'
import { headers } from "next/headers";
import { decrypt } from "@/lib/auth";

export async function POST(req) {

    try {

        const headersList = headers()
        const accessToken = headersList.get('Authorization')

        const { userId } = await decrypt(accessToken)
        const payload = await req.json();
        console.log('Creating member', payload)
        const { firstname, lastname, email, dob, sex, serverId } = payload
        let tempmail
        let user

        if (userId) {
            if (email === '') {
                tempmail = uuidv4() + '@devlomatix.com'
            } else {
                tempmail = email
            }


            user = await db.user.create({
                data: {
                    email: tempmail,
                    displayName: firstname + ' ' + lastname,
                    role: MemberRole.MEMBER,
                }
            })

            if (user) {

                await db.profile.create({
                    data: {
                        userId: user.id,
                        firstname,
                        lastname,
                        dob
                    }
                })

                await db.server.update({
                    where: {
                        id: serverId,
                    },
                    data: {
                        members: {
                            create: [
                                {
                                    userId: user.id,
                                }
                            ]
                        }
                    }
                });


            }



            //console.log(user)

        } else {
            NextResponse.json({ status: 401, message: 'Unauthorized access' })
        }


        return NextResponse.json({ status: 200, user: user })
    } catch (error) {
        console.log(error)
        return NextResponse.json({ status: 500, message: 'Internal Error', user: null })
    }

}