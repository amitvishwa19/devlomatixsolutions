import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { symmetricEncrypt } from "@/lib/encryption";

export async function POST(request) {
    try {
        const data = await request.json();
        const { storeName, storeId, webhookUrl, apiKey, appIdentifier } = data;

        console.log('Saving eCommerce Config:', data);

        if (!appIdentifier) {
            return NextResponse.json({ success: false, message: "App Identifier is required" }, { status: 400 });
        }

        const encryptedApiKey = symmetricEncrypt(apiKey);

        const config = await db.ecommerceConfig.upsert({
            where: { storeName: storeName },
            update: {
                storeId,
                webhookUrl,
                apiKey: encryptedApiKey,
                appIdentifier,
                isActive: true
            },
            create: {
                storeName,
                storeId,
                webhookUrl,
                apiKey: encryptedApiKey,
                appIdentifier,
                isActive: true
            }
        });

        return NextResponse.json({ 
            success: true, 
            message: "Configuration Saved Successfully", 
            config:'config' 
        }, { status: 202 });

    } catch (error) {
        console.error('Save Configuration Error:', error);
        return NextResponse.json({ 
            success: false, 
            message: error.message || "Failed to save configuration" 
        }, { status: 500 });
    }
}