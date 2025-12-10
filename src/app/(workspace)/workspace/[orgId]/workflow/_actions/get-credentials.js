'use server'

import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { db } from "@/lib/db"
import { getServerSession } from "next-auth/next"



export async function GetCredentials() {
    const session = await getServerSession(authOptions)



    const credentials = await db.credential.findMany({
        where: { userId: session.user.userId },
        orderBy: {
            name: 'asc'
        }
    });

    //console.log('@@credentials', credentials)

    return credentials
}