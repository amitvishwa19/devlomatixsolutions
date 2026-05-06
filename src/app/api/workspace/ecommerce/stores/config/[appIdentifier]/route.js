import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { symmetricDecrypt } from "@/lib/encryption";

export async function GET(request, { params }) {
    try {
        const { appIdentifier } = await params;
        
        if (!appIdentifier) {
            return NextResponse.json({ success: false, message: "App Identifier is required" }, { status: 400 });
        }

        const configData = await db.ecommerceConfig.findFirst({
            where: { appIdentifier: appIdentifier }
        });

        if (!configData) {
            return NextResponse.json({ success: false, message: "Configuration not found for this app" }, { status: 404 });
        }

        let decryptedApiKey = null;
        try {
            decryptedApiKey = symmetricDecrypt(configData.apiKey);
        } catch (decryptError) {
            console.error("[DECRYPTION_ERROR]", decryptError);
            // We still return the config, but without the decrypted key if it fails
        }

        return NextResponse.json({ 
            success: true, 
            message: "Configuration Retrieved Successfully", 
            config: {
                ...configData,
                decryptedApiKey
            }
        }, { status: 200 });

    } catch (error) {
        console.error("[CONFIG_RETRIEVAL_ERROR]", error);
        return NextResponse.json({ 
            success: false, 
            message: error.message || "Internal server error",
            stack: error.stack 
        }, { status: 500 });
    }
}

export async function POST(request) {
    return NextResponse.json({ success: false, message: "Method not allowed" }, { status: 405 });
}