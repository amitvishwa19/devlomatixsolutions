import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { db } from "@/lib/db";
import { symmetricDecrypt } from "@/lib/encryption";


export async function POST(request, { params }) {

    const data = await request.json();
    let decryptedApiKey;



    const { appIdentifier, storeName, storeId, webhookUrl, apiKey, isActive } = data


    //console.log('data', data)

    // if (!apiKey) {
    //   return NextResponse.json({ success: false, message: "API Key is required" }, { status: 400 });
    // }

    //sample payload

    //     {
    //     "id": "cmoscfo4b00001sikca62h7p8",
    //     "appIdentifier": "b9f781c6465e99dfb8cd41fa313002a007bf0a03d2bebac11937bd998d8ac3dd",
    //     "storeName": "crystal-aura",
    //     "storeId":"cmorcc5pg000bm0ikk5slmqww",
    //     "webhookUrl": "https://dev.devlomatix.com/api/workspace/ecommerce/stores",
    //     "apiKey": "474c4540a6f9c57a16e79a5c937920c2:5988f569d3fb65b17963a94c3e53313377c3ef063c034b4a986af08e0997549ea4fd58a49123b9ba4fd8ef17c35441d15f790d7746ab8ddee2f2166027fec852aaf5a3c3ad9428141ab1ecc861a2a8274df0b022dc8ac0c2db4ce5b02f5a6af65c73bef397a8ab970d4a1521a6996b623ca710a9a75209fa8283645c68753947f8710b58f5d31e36a13b292ba4d5bb1a8ed723de7029a5af7b808378a68dfb4d98500269afbbade9de978018abc546ad",
    //     "isActive": true
    // }

    try {

        const config = await db.ecommerceConfig.findFirst({
            where: {
                storeId,
                appIdentifier
            }
        });

        if (!config) {
            return NextResponse.json({ success: false, message: "App Configuration not found" }, { status: 404 });
        }

        if (config.isActive) {
            decryptedApiKey = symmetricDecrypt(config.apiKey);
        }


        console.log('config', config);


        // const store = await db.eCommerceStore.findFirst({
        //     where: {
        //         id: storeId,
        //         appIdentifier,
        //     },
        // });




        //decryptedApiKey = symmetricDecrypt(apiKey);


        // if (!decryptedApiKey) {
        //   return NextResponse.json({ success: false, message: "Invalid app configuration credentials" }, { status: 400 });
        // }




        console.log('store', 'store')



        //console.log("🚀 ~ symmetricDecrypt decryptedApiKey:", decryptedApiKey)
        return NextResponse.json({ success: true, message: "Data fetch successfully" }, { status: 202 });



    } catch (error) {
        console.error("[DECRYPTION_ERROR]", error.message);
        return NextResponse.json({ success: false, message: "Invalid API Key format or decryption failed" }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: "post from frontend" }, { status: 202 });
}