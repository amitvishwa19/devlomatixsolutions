'use server'

import { db } from "@/lib/db"

export async function GetAvaliableCredits(userId) {
    console.log('@@userId', userId)
    if (!userId) {
        throw new Error('User not defined')
    }

    const balance = await db.userBalance.findUnique({
        where: {
            userId: userId
        }
    })

    if (!balance) return 0

    return balance.credits
}