import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { db } from "@/lib/db";
import { symmetricDecrypt } from "@/lib/encryption";


export async function POST(request, { params }) {

    const data = await request.json();
    const { appIdentifier, storeName, storeId, webhookUrl, apiKey, isActive } = data
    let decryptedApiKey


    try {
        console.log('Test connection', data)
        //console.log('data', data)
        decryptedApiKey = symmetricDecrypt(apiKey);

        const store = await db.eCommerceStore.findFirst({
            where: {
                id: storeId,
                apiKey: apiKey
            },
        });

        console.log('store', store)

        if (!store) {
            return NextResponse.json({ success: false, message: "Store not found" }, { status: 404 });
        }

        if (store.status !== 'connected') {
            return NextResponse.json({ success: false, message: "Store is not connected" }, { status: 403 });
        }



        return NextResponse.json({ success: true, message: "Connection Successfull", store }, { status: 202 });
    } catch (error) {
        return NextResponse.json({ success: false, message: "Invalid API Key format or decryption failed" }, { status: 400 });
    }
}