"use server";

import { sendEmail, sendBatchEmail } from "@/lib/mailer-action";

export async function sendContactEmail(formData) {
    const to = formData.get("email");
    const name = formData.get("name");
    const message = formData.get("message");

    const result = await sendEmail({
        to,
        subject: `New message from ${name}`,
        html: `
      <h1>New Contact Form Submission</h1>
      <p><strong>From:</strong> ${name}</p>
      <p><strong>Message:</strong> ${message}</p>
    `,
    });

    return result;
}

export async function sendBulkNotification(emails, subject, content) {
    const result = await sendBatchEmail({
        to: emails,
        subject,
        html: content,
    });

    return result;
}