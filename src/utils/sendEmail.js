import { Resend } from "resend";
import React from "react";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendMail({
    to,
    subject,
    Template,
    props = {},
    textFallback = "You have a new email",
}) {
    try {
        const { data, error } = await resend.emails.send({
            from: "Healthyfine <info@healthyfine.devlomatix.in>",
            to, // string OR array of strings
            subject,
            react: React.createElement(Template, props),
            text: textFallback, // required fallback
        });

        if (error) {
            console.error("Resend error:", error);
            return { success: false, error };
        }

        return { success: true, data };
    } catch (error) {
        console.error("Send mail failed:", error);
        return { success: false, error };
    }
}
