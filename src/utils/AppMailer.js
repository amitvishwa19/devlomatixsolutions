
import { Resend } from 'resend';
import { NextResponse } from 'next/server';
import BoardNotification from '@/emails/BoardNotification'
import nodemailer from 'nodemailer';
import { render } from '@react-email/components';


export async function AppMailer(data, component) {

    var transporter = nodemailer.createTransport({
        host: process.env.MAIL_SERVICE_HOST,
        port: process.env.MAIL_SERVICE_PORT,
        secure: false,
        auth: {
            user: process.env.MAIL_SERVICE_USERNAME,
            pass: process.env.MAIL_SERVICE_PASSWORD
        }
    });


    const mailComponent = render(component);


    const options = {
        from: data?.from,
        to: data?.to,
        subject: data?.subject,
        html: mailComponent,
    };

    transporter.sendMail(options);

    return NextResponse.json({
        status: 'ok'
    })
};
