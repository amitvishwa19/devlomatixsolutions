'use server'
import nodemailer from 'nodemailer';
import bcryptjs from 'bcryptjs';
import { google } from 'googleapis'
import axios from 'axios';


export const FcmNotify = async (deviceTokens, message, data) => {
    try {

        const fcm_url = 'https://fcm.googleapis.com/v1/projects/healthyfine-android/messages:send'
        const serviceAccount = require('../fcm_service_account.json')



        var MESSAGING_SCOPE = 'https://www.googleapis.com/auth/firebase.messaging';
        var SCOPES = [MESSAGING_SCOPE];

        var jwtClient = new google.auth.JWT(serviceAccount.client_email, null, serviceAccount.private_key, SCOPES, null);

        jwtClient.authorize(async (err, tokens) => {

            let payload = {
                "message": {
                    "token": deviceTokens,
                    "data": data,
                    "notification": message
                }
            };

            //console.log(data.id)

            let config = {
                method: 'post',
                maxBodyLength: Infinity,
                url: fcm_url,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${tokens?.access_token}`
                },
                data: payload
            };

            const res = await axios.request(config)
            return res
        })

        return { 'status': 200, message: 'notification sent successfully' }

    } catch (error) {
        console.log(error)
        return { 'status': 500, message: 'Internal server error' }
    }
}



