import { NextResponse } from 'next/server'
import { google } from 'googleapis'
import { decrypt } from "@/lib/auth";
import { db } from "@/lib/db";
import { headers } from "next/headers"
import axios from 'axios';
const { initializeApp } = require("firebase-admin/app");
var admin = require('firebase-admin');
import { Expo } from 'expo-server-sdk';



export async function POST(req) {
    try {


        const headersList = await headers()
        const accessToken = headersList.get('Authorization')
        const payload = await req.json();
        const { deviceToken, message, data: notificationData } = payload
        //console.log('@data', data.data)

        const { userId } = await decrypt(accessToken)
        const user = await db.user.findUnique({ where: { id: userId } })
        if (!user) return NextResponse.json({ status: 401, message: 'Unauthorized access' })


        const expo = new Expo();

        const notimessage = {
            to: "ExponentPushToken[NG2QGxBwBPq7fjWnXYr2Bi]",
            sound: "default",
            title: "title",
            body: "body",
            data: {},
        };


        const tickets = await expo.sendPushNotificationsAsync([notimessage]);

        console.log(tickets)

        return NextResponse.json({ status: 200, message: 'push notification sent' })
    } catch (error) {
        console.log(error)
        return NextResponse.json({ status: 500, message: 'Internal server Error' })
    }
}