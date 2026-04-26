import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { decrypt } from "@/lib/auth";



export async function POST(req) {


    console.log('api agent hit')
    try {
        let user
        let appointment

        const headersList = await headers()
        const authHeader =
            headersList.get('authorization') ||
            headersList.get('Authorization') ||
            headersList.get('x-access-token') ||
            headersList.get('X-Access-Token')
        const accessToken = authHeader?.replace(/^Bearer\s+/i, '') || null
        console.log('accessToken', accessToken)
        //const payload = await req.json();
        //const { date, slot, time, note, type, selectedDoctor, patient, presData } = payload.data
        //console.log('payload', payload.data)

        //const { userId } = await decrypt(accessToken)
        //onsole.log(userId)
        //user = await db.user.findUnique({ where: { id: userId } })



        const response = "lorem ipsum dolor sit amet consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."





        //console.log('appointments', appointments)
        return NextResponse.json({ status: 200, response: response })
    } catch (error) {
        console.log(error)
        return NextResponse.json({ status: 500, message: 'Internal server Error' })
    }
}
