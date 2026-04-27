'use server';

import { resend } from "@/lib/resend";
import ContactInquiryTemplate from "@/emails/ContactInquiry";
import ContactAcknowledgementTemplate from "@/emails/ContactAcknowledgement";
import React from 'react';

export async function sendContactEmail(formData) {
    try {
        const { name, email, company, mobile, message } = formData;

        if (!name || !email || !mobile || !message) {
            return { success: false, error: "Missing required fields" };
        }

        // 1. Send internal inquiry to the team
        const teamInquiry = await resend.emails.send({
            from: `Devlomatix Contact <${process.env.RESEND_FROM_EMAIL || 'notifications@devlomatix.com'}>`,
            to: 'contact@devlomatix.com',
            subject: `New Inquiry from ${name}`,
            reply_to: email,
            react: <ContactInquiryTemplate 
                name={name}
                email={email}
                company={company}
                mobile={mobile}
                message={message}
            />,
        });

        // 2. Send acknowledgment to the sender
        await resend.emails.send({
            from: `Devlomatix Solutions <${process.env.RESEND_FROM_EMAIL || 'info@devlomatix.com'}>`,
            to: email,
            subject: `Inquiry Received - Devlomatix Solutions`,
            react: <ContactAcknowledgementTemplate name={name} />,
        });

        return { success: true, id: teamInquiry.id };
    } catch (error) {
        console.error("Error sending contact email:", error);
        return { success: false, error: error.message };
    }
}
