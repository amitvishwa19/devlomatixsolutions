'use server'
import { Resend } from 'resend';
import { NextResponse } from 'next/server';
import BoardNotification from '@/emails/BoardNotification'
import nodemailer from 'nodemailer';
import { render } from '@react-email/components';


export async function Mail(data, template) {

    console.log('data', data.to)

    var transporter = nodemailer.createTransport({
        host: process.env.MAIL_SERVICE_HOST,
        port: process.env.MAIL_SERVICE_PORT,
        secure: false,
        auth: {
            user: process.env.MAIL_SERVICE_USERNAME,
            pass: process.env.MAIL_SERVICE_PASSWORD
        }
    });


    const mailComponent = render(template);


    const options = {
        from: process.env.APP_DEFAULT_EMAIL,
        to: data?.to,
        subject: data?.subject,
        html: mailComponent,
    };

    transporter.sendMail(options);

    return NextResponse.json({
        status: 'ok'
    })
};
