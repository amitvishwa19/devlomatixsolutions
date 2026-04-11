import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { db } from "@/lib/db";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import * as cloudApi from "@/app/workspace/[workspaceId]/wa/_lib/whatsapp-cloud-api";
import { symmetricDecrypt } from "@/lib/encryption";

export async function GET(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id && !session?.user?.userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userId = session.user.userId || session.user.id;

        // 1. Fetch Cloud API Credentials
        const credential = await db.credentials.findFirst({
            where: { userId, platform: 'WHATSAPP_CLOUD' },
            orderBy: { updatedAt: 'desc' }
        });

        if (!credential || !credential.credentials) {
            return NextResponse.json({ error: "Cloud API credentials not found" }, { status: 404 });
        }

        let cloudCredentials = typeof credential.credentials === 'string' 
            ? JSON.parse(credential.credentials) 
            : credential.credentials;

        if (cloudCredentials?.enc) {
            const decrypted = symmetricDecrypt(cloudCredentials.enc);
            cloudCredentials = JSON.parse(decrypted);
        }

        if (!cloudCredentials.accessToken || !cloudCredentials.wabaId) {
            return NextResponse.json({ error: "Incomplete credentials (missing Access Token or WABA ID)" }, { status: 400 });
        }

        // 2. Fetch Templates from Meta
        const metaRes = await cloudApi.fetchTemplates(cloudCredentials);
        if (!metaRes.success) {
            return NextResponse.json({ error: metaRes.error }, { status: 500 });
        }

        const metaTemplates = metaRes.data; // Array of templates
        console.log(`[Template Sync] Fetched ${metaTemplates.length} templates from Meta`);

        // 3. Upsert into Database
        const syncResults = [];
        for (const metaT of metaTemplates) {
            // Find content components
            const bodyComp = metaT.components?.find(c => c.type === 'BODY');
            const footerComp = metaT.components?.find(c => c.type === 'FOOTER');
            const buttonComp = metaT.components?.find(c => c.type === 'BUTTONS');

            const templateData = {
                userId,
                name: metaT.name, // Display name
                templateName: metaT.name, // Slug
                category: metaT.category,
                language: metaT.language,
                status: metaT.status,
                type: 'TEXT', // Default type, can be refined based on components
                body: bodyComp?.text || "",
                footer: footerComp?.text || null,
                buttons: buttonComp?.buttons || [],
                isDefault: true, // Synced templates are considered system/default
                platform: 'WHATSAPP_CLOUD'
            };

            // Use upsert to update if exists (by userId + name unique constraint) or create
            const synced = await db.messageTemplate.upsert({
                where: {
                    userId_name: {
                        userId,
                        name: metaT.name
                    }
                },
                update: templateData,
                create: templateData
            });
            syncResults.push(synced);
        }

        return NextResponse.json({ 
            success: true, 
            count: metaTemplates.length,
            synced: syncResults.length 
        });

    } catch (error) {
        console.error("[TEMPLATE_SYNC_ERROR]", error);
        return NextResponse.json({ error: "Failed to sync templates" }, { status: 500 });
    }
}
