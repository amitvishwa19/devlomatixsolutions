import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { decrypt } from "@/lib/auth";
import { FcmNotify } from "@/utils/fcm";


export async function POST(req) {

    try {

        console.log('Notification send action')
        let res

        const headersList = headers()
        const accessToken = headersList.get('Authorization')
        const payload = await req.json();
        const { channelId, channelName, userId: user_id, title, body, userDevicetoken, screen, action } = payload.data
        console.log('payload', payload.data)

        const { userId } = await decrypt(accessToken)
        const user = await db.user.findUnique({ where: { id: userId } })

        // console.log('Care Team post', careteamId, userId)

        if (!user) return NextResponse.json({ status: 401, message: 'Unauthorized access' })


        const message = {
            "title": title,
            "body": body,
            //    "icon": "https://example.com/icon.png",
        }

        const data = {
            channelId,
            channelName,
            soundName: "raw",
            message: 'message',
            screen,
            userId: user_id,
            action
        }


        await FcmNotify(userDevicetoken, message, data)

        //console.log('appointment', appointment)



        //console.log('appointments', appointments)
        return NextResponse.json({ status: 200, res: 'Notification action  sent successfully' })
    } catch (error) {
        console.log(error)
        return NextResponse.json({ status: 500, message: 'Internal server Error' })
    }
}