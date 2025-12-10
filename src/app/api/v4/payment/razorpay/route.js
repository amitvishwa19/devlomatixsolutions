import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { SignJWT, jwtVerify } from "jose";
import { MemberRole } from "@prisma/client";
import { v4 as uuidv4 } from 'uuid'
import { headers } from "next/headers";
import { decrypt } from "@/lib/auth";
import Razorpay from 'razorpay';


const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});


export async function POST(req, { params }) {

    try {
        const headersList = headers()
        const accessToken = headersList.get('Authorization')
        const payload = await req.json();
        const { amount, currency, receipt, payment_capture } = payload.orderData

        const { userId } = await decrypt(accessToken)
        const user = await db.user.findUnique({ where: { id: userId } })
        if (!user) return NextResponse.json({ status: 401, message: 'Unauthorized access' })


        var options = {
            amount: amount,
            currency: currency,
            receipt: receipt,
        };

        const order = await razorpay.orders.create(options);

        return NextResponse.json({ status: 200, orderId: order.id })
    } catch (error) {
        console.log(error)
        return NextResponse.json({ status: 500, message: 'Internal Error', user: null })
    }
}