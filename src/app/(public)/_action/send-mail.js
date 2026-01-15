'use server'
import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { v4 as uuidv4 } from 'uuid'
import { db } from "@/lib/db";
import { cookies } from "next/headers";
import { randomUUID } from "crypto";
import { ROLE } from "@prisma/client";
import { sendEmail, sendMail } from "@/utils/sendEmail";
import { EnquiryEmail } from "../_components/EnquiryEmail";




const SendInquiryMail = z.object({
    email: z.string(),
    name: z.string().optional(),
    phone: z.string().optional(),
    message: z.string().optional()
});

const handler = async (data) => {

    const { email, name, phone, message } = data
    let mail


    try {

        const mail = await sendMail({
            to: "amitvishva19@gmail.com",
            subject: "This is a test mail for contact us",
            Template: EnquiryEmail, // ✅ component, NOT JSX
            props: {
                name: "Amit Vijay Vishwakarma",
                email: "amitvishva19@gmail.com",
            },
            textFallback: "New contact enquiry received",
        });


        console.log(mail)

    } catch (error) {
        console.log(error)
        return {
            error: "Failed to register guest"
        }
    }

    return { data: { message: 'mail sent' } };

}


export const sendInquiryMail = createSafeAction(SendInquiryMail, handler);