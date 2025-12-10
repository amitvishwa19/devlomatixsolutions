import { NextResponse } from 'next/server'
import { google } from 'googleapis'
import { decrypt } from "@/lib/auth";
import { db } from "@/lib/db";
import { headers } from "next/headers"
import axios from 'axios';
const { initializeApp } = require("firebase-admin/app");
var admin = require('firebase-admin');

export async function POST(req) {
    try {
        console.log('FCM Native notification')

        const headersList = await headers()
        const accessToken = headersList.get('Authorization')
        const payload = await req.json();
        const { deviceToken, message, data: notificationData } = payload
        //console.log('@data', data.data)

        const { userId } = await decrypt(accessToken)
        const user = await db.user.findUnique({ where: { id: userId } })
        if (!user) return NextResponse.json({ status: 401, message: 'Unauthorized access' })



        const fcm_url = `https://fcm.googleapis.com/v1/projects/${process.env.FCM_PROJECT_ID}/messages:send`
        const serviceAccount = require('../../../../../fcm_service_account.json')

        const firebaseConfig = require('../../../../../fcm_service_account.json')

        //const fbapp = initializeApp(firebaseConfig);



        // admin.initializeApp({
        //     credential: admin.credential.cert(firebaseConfig),
        // });


        var MESSAGING_SCOPE = 'https://www.googleapis.com/auth/firebase.messaging';
        var SCOPES = [MESSAGING_SCOPE];

        var jwtClient = new google.auth.JWT(serviceAccount.client_email, null, serviceAccount.private_key, SCOPES, null);



        jwtClient.authorize(async (err, tokens) => {
            console.log('@accesstoken', tokens)
            let data = {
                "message": {
                    "token": "d0ZCQ_6zRxWIShJstY7Mcu:APA91bFNNUdsGE6tErmxwBD3BtPhDNX8-2BOYNGbGCwsLwMK0W4Txe1YPaEs1glDHvclLCE5jrpDOOvaQqBcDf--4hV2-xq6hHLnEAxUe9aNn8PD7BkjbG4",
                    "notification": {
                        "title": "This is notification title",
                        "body": "This is notification body",

                    },
                    "data": { "id": JSON.stringify(notificationData.data.id) }
                }
            };

            let config = {
                method: 'post',
                maxBodyLength: Infinity,
                url: 'https://fcm.googleapis.com/v1/projects/healthyfineexpo/messages:send',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${tokens?.access_token}`
                },
                data: data
            };

            //const res = await axios.request(config)

        })

        // console.log(access_token)

        return NextResponse.json({ status: 200, message: 'push notification sent' })
    } catch (error) {
        console.log(error)
        return NextResponse.json({ status: 500, message: 'Internal server Error' })
    }
}