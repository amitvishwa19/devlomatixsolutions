import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { db } from "@/lib/db";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { symmetricDecrypt } from '@/lib/encryption';

export async function GET(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id && !session?.user?.userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userId = session.user.userId || session.user.id;

        // 1. Fetch Cloud API Credentials
        const credential = await db.credentials.findFirst({
            where: {
                userId,
                platform: 'WHATSAPP_CLOUD'
            },
            orderBy: { updatedAt: 'desc' }
        });

        if (!credential || !credential.credentials) {
            console.error(`[Cloud API Send] No credentials found for user ${userId}`);
            return NextResponse.json({
                error: "WhatsApp Cloud API credentials not found. Please configure them in Settings > Credentials."
            }, { status: 404 });
        }

        // Standardize credentials object for the library
        let cloudCredentials = typeof credential.credentials === 'string'
            ? JSON.parse(credential.credentials)
            : credential.credentials;

        // Handle Encrypted Credentials
        if (cloudCredentials?.enc) {
            try {
                console.log(`[Cloud API Send] Decrypting credentials for user ${userId}`);
                const decryptedStr = symmetricDecrypt(cloudCredentials.enc);
                cloudCredentials = JSON.parse(decryptedStr);


            } catch (e) {
                console.error(`[Cloud API Send] Decryption failed!`, e);
                return NextResponse.json({ error: "Failed to decrypt WhatsApp credentials." }, { status: 500 });
            }
        }

        const cloudUrl = `https://graph.facebook.com/v19.0/${cloudCredentials.wabaId}/message_templates`

        const response = await fetch(
            `https://graph.facebook.com/v17.0/${cloudCredentials.wabaId}/message_templates`,
            {
                headers: {
                    Authorization: `Bearer ${cloudCredentials.accessToken}`,
                },
            }
        );

        const data = await response.json();

        console.log('cloud templates templates', 'cloudCredentials', data)




        return NextResponse.json({ success: true, templates: data });
    } catch (error) {
        console.error("Error fetching templates:", error);
        return NextResponse.json({ error: "Failed to fetch templates" }, { status: 500 });
    }
}

