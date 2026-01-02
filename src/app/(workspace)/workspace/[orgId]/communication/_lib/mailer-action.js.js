"use server";

/**
 * Mailer Action - Server-side email functions using Resend
 * Use with useAction: const { execute } = useAction(singleMailSend, { onSuccess, onError })
 * Then call: execute({ to, subject, html, from, text })
 * 
 * Required: RESEND_API_KEY in your .env file
 */

const RESEND_API_KEY = process.env.RESEND_API_KEY;

/**
 * Send a single email
 * @param {Object} params - All parameters passed from execute()
 * @param {string} params.to - Recipient email address
 * @param {string} params.subject - Email subject
 * @param {string} params.html - HTML content of the email
 * @param {string} [params.from] - Sender email (defaults to onboarding@resend.dev)
 * @param {string} [params.text] - Plain text version of the email
 */
export async function singleMailSend({ to, subject, html, from, text }) {
    if (!RESEND_API_KEY) {
        throw new Error("RESEND_API_KEY is not configured");
    }

    if (!to || !subject || !html) {
        throw new Error("Missing required fields: to, subject, html");
    }

    const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
            from: from || "Hospital Management <onboarding@resend.dev>",
            to: Array.isArray(to) ? to : [to],
            subject,
            html,
            ...(text && { text }),
        }),
    });

    if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Failed to send email: ${errorData}`);
    }

    const data = await response.json();
    return { success: true, emailId: data.id, data };
}

/**
 * Send emails to multiple recipients (batch)
 * @param {Object} params - All parameters passed from execute()
 * @param {string[]} params.recipients - Array of recipient email addresses
 * @param {string} params.subject - Email subject
 * @param {string} params.html - HTML content of the email
 * @param {string} [params.from] - Sender email
 */
export async function bulkMailSend({ recipients, subject, html, from }) {
    if (!RESEND_API_KEY) {
        throw new Error("RESEND_API_KEY is not configured");
    }

    if (!Array.isArray(recipients) || recipients.length === 0) {
        throw new Error("Recipients array is required");
    }

    if (!subject || !html) {
        throw new Error("Missing required fields: subject, html");
    }

    const emails = recipients.map((recipient) => ({
        from: from || "Hospital Management <onboarding@resend.dev>",
        to: recipient,
        subject,
        html,
    }));

    const response = await fetch("https://api.resend.com/emails/batch", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify(emails),
    });

    if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Failed to send batch email: ${errorData}`);
    }

    const data = await response.json();
    return { success: true, count: recipients.length, data };
}

/**
 * Send email with attachments
 * @param {Object} params - All parameters passed from execute()
 * @param {string} params.to - Recipient email address
 * @param {string} params.subject - Email subject
 * @param {string} params.html - HTML content
 * @param {Array<{filename: string, content: string}>} params.attachments - File attachments (base64 encoded content)
 * @param {string} [params.from] - Sender email
 */
export async function mailWithAttachment({ to, subject, html, attachments, from }) {
    if (!RESEND_API_KEY) {
        throw new Error("RESEND_API_KEY is not configured");
    }

    if (!to || !subject || !html) {
        throw new Error("Missing required fields: to, subject, html");
    }

    if (!Array.isArray(attachments) || attachments.length === 0) {
        throw new Error("Attachments array is required");
    }

    const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
            from: from || "Hospital Management <onboarding@resend.dev>",
            to: Array.isArray(to) ? to : [to],
            subject,
            html,
            attachments,
        }),
    });

    if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Failed to send email: ${errorData}`);
    }

    const data = await response.json();
    return { success: true, emailId: data.id, data };
}
