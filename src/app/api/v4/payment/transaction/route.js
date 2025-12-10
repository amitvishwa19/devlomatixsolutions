import { NextResponse } from "next/server";
import { db } from '@/lib/db'
import { headers } from "next/headers";
import { decrypt } from "@/lib/auth";
import useAuth from "@/hooks/useAuth";
import { put } from '@vercel/blob'
export async function GET(req) {

    try {

        console.log('getting docs data')
        const headersList = headers()
        const accessToken = headersList.get('Authorization')
        const { userId } = await decrypt(accessToken)


        const user = await db.user.findUnique({ where: { id: userId } })
        if (!user) return NextResponse.json({ status: 401, message: 'Unauthorized access' })


        const transactions = await db.transaction.findMany(
            {
                where: {
                    userId: userId,
                }
            }
        )

        const credits = await db.credit.findUnique({
            where: {
                userId: userId
            }
        })
        //console.log('getting files', documents)

        return NextResponse.json({ status: 200, transactions: transactions, credits: credits })

    } catch (error) {
        console.log(error)
        return NextResponse.json({ status: 500, message: 'Internal server Error' })
    }



}

export async function POST(req) {
    try {


        const headersList = headers()
        const accessToken = headersList.get('Authorization')
        const { userId } = await decrypt(accessToken)
        const payload = await req.json();
        const { paymentId, orderId, amount, signature } = payload.transData
        let transaction, transactions
        let credits

        //console.log('Add transaction', payload)

        // const payload = headersList.get('data');
        // console.log('payload', payload.formData)


        const user = await db.user.findUnique({ where: { id: userId } })
        if (!user) return NextResponse.json({ status: 401, message: 'Unauthorized access' })
        //console.log('Uploading docs data', user)

        console.log('userId', userId)

        transaction = await db.transaction.create({
            data: {
                payerId: userId,
                payeeId: userId,
                amount: amount / 100,
                status: 'success',
                paymentId: paymentId,
                orderId: orderId,
            }
        })

        transactions = await db.transaction.findMany(
            {
                where: {
                    payerId: userId,
                }
            }
        )


        if (transaction) {

            await db.credit.update({
                //where: { id: crdt.id },
                where: { userId: userId },
                data: {
                    value: {
                        increment: parseFloat(amount / 100) // Increment the credit value by the transaction amount
                    }
                }
            })


        }

        //console.log('Document comment', comment)
        return NextResponse.json({ status: 200, transaction: transaction, transactions: transactions, credits: credits })

    } catch (error) {
        console.log(error)
        return NextResponse.json({ status: 500, message: 'Internal server Error' })
    }
}