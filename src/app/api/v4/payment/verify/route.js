import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { decrypt } from "@/lib/auth";
import crypto from 'crypto';


const generatedSignature = (razorpayOrderId, razorpayPaymentId) => {
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
        throw new Error(
            'Razorpay key secret is not defined in environment variables.'
        );
    }
    const sig = crypto
        .createHmac('sha256', keySecret)
        .update(razorpayOrderId + '|' + razorpayPaymentId)
        .digest('hex');
    return sig;
};

export async function POST(req, { params }) {

    try {
        const headersList = headers()
        const accessToken = headersList.get('Authorization')
        const payload = await req.json();
        const { razorpayPaymentId, razorpayOrderId, razorpaySignature } = payload.data

        const { userId } = await decrypt(accessToken)
        const user = await db.user.findUnique({ where: { id: userId } })
        if (!user) return NextResponse.json({ status: 401, message: 'Unauthorized access' })

        const signature = generatedSignature(razorpayOrderId, razorpayPaymentId);
        if (signature !== razorpaySignature) return NextResponse.json({ status: 400, message: 'payment verification failed' })


        return NextResponse.json({ status: 200, orderId: 'payment verified successfully' })
    } catch (error) {
        console.log(error)
        return NextResponse.json({ status: 500, message: 'Internal Error', user: null })
    }
}