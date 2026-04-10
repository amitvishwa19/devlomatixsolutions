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

        if (data.error) {
            console.error("[Cloud API Sync] Meta API error:", data.error);
            return NextResponse.json({ error: data.error.message || "Failed to fetch from Meta" }, { status: 500 });
        }

        const cloudTemplates = data.data || [];

        // Helper to parse Meta components into local format
        const parseComponents = (components) => {
            let body = "";
            let footer = "";
            let buttons = [];
            
            components.forEach(comp => {
                if (comp.type === 'BODY') body = comp.text;
                if (comp.type === 'FOOTER') footer = comp.text;
                if (comp.type === 'BUTTONS') buttons = comp.buttons;
            });
            
            return { body, footer, buttons: buttons.length > 0 ? buttons : undefined };
        };

        // 2. Sync with local database
        let updatedCount = 0;
        let importedCount = 0;
        const syncedIds = [];
        
        await Promise.all(cloudTemplates.map(async (metaTpl) => {
            const { body, footer, buttons } = parseComponents(metaTpl.components);
            
            // Use upsert to handle both new and existing templates based on the unique userId+name constraint
            const result = await db.messageTemplate.upsert({
                where: { 
                    userId_name: { 
                        userId, 
                        name: metaTpl.name 
                    } 
                },
                update: {
                    templateId: metaTpl.id,
                    templateName: metaTpl.name,
                    status: metaTpl.status,
                    approved: metaTpl.status === 'APPROVED',
                    category: metaTpl.category,
                    language: metaTpl.language,
                    body,
                    footer,
                    buttons: buttons || [],
                    isDefault: true // Managed cloud template - hide from My Templates
                },
                create: {
                    userId,
                    name: metaTpl.name,
                    templateName: metaTpl.name,
                    templateId: metaTpl.id,
                    status: metaTpl.status,
                    approved: metaTpl.status === 'APPROVED',
                    category: metaTpl.category,
                    language: metaTpl.language,
                    type: metaTpl.type || 'TEXT',
                    platform: 'WHATSAPP_CLOUD',
                    body,
                    footer,
                    buttons: buttons || [],
                    isDefault: true // Managed cloud template - hide from My Templates
                }
            });

            syncedIds.push(result.id);
            // Rough count based on timestamp similarity (optional)
            if (result.createdAt.getTime() === result.updatedAt.getTime()) {
                importedCount++;
            } else {
                updatedCount++;
            }
        }));

        // 3. Reset unmatched templates to DRAFT
        // We now reset ANY Cloud template visible to the user that wasn't found on Meta.
        // This ensures the dashboard perfectly reflects the Meta account.
        const resetResult = await db.messageTemplate.updateMany({
            where: {
                userId,
                platform: 'WHATSAPP_CLOUD',
                id: { notIn: syncedIds }
                // Removed the isDefault: false check because user-owned cloud templates 
                // should always reflect their real Meta status.
            },
            data: {
                status: 'DRAFT',
                approved: false
            }
        });

        return NextResponse.json({ 
            success: true, 
            templates: cloudTemplates,
            updatedCount,
            importedCount,
            resetCount: resetResult.count,
            message: `Sync complete: ${updatedCount} updated, ${importedCount} imported, ${resetResult.count} reset to Draft.`
        });
    } catch (error) {
        console.error("Error fetching templates:", error);
        return NextResponse.json({ error: "Failed to fetch templates" }, { status: 500 });
    }
}

