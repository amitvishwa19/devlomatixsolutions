import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { db } from "@/lib/db";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { symmetricDecrypt } from "@/lib/encryption";

export async function GET(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id && !session?.user?.userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userId = session.user.userId || session.user.id;
        const templates = await db.messageTemplate.findMany({
            where: {
                OR: [
                    { isDefault: true },
                    { userId }
                ]
            },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json({ success: true, templates });
    } catch (error) {
        console.error("Error fetching templates:", error);
        return NextResponse.json({ error: "Failed to fetch templates" }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id && !session?.user?.userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userId = session.user.userId || session.user.id;
        const body = await req.json();
        const { templateId } = body;

        if (!templateId) {
            return NextResponse.json({ error: "Template ID is required" }, { status: 400 });
        }

        // 1. Fetch template data
        const template = await db.messageTemplate.findUnique({
            where: { id: templateId }
        });

        if (!template || template.userId !== userId) {
            return NextResponse.json({ error: "Template not found" }, { status: 404 });
        }

        // 2. Fetch Cloud API Credentials
        const credential = await db.credentials.findFirst({
            where: {
                userId,
                platform: 'WHATSAPP_CLOUD'
            },
            orderBy: { updatedAt: 'desc' }
        });

        if (!credential) {
            return NextResponse.json({ error: "WhatsApp Cloud credentials not found" }, { status: 404 });
        }

        // Standardize and decrypt credentials
        let cloudCreds = typeof credential.credentials === 'string'
            ? JSON.parse(credential.credentials)
            : credential.credentials;

        if (cloudCreds?.enc) {
            const decrypted = symmetricDecrypt(cloudCreds.enc);
            cloudCreds = JSON.parse(decrypted);
        }

        // 3. Prepare Meta Template Data
        // Meta requires name to be lowercase with underscores
        const sanitizedName = template.name
            .toLowerCase()
            .trim()
            .replace(/\s+/g, '_')
            .replace(/[^a-z0-9_]/g, '');

        const components = [
            {
                type: "BODY",
                text: template.body
            }
        ];

        if (template.footer) {
            components.push({
                type: "FOOTER",
                text: template.footer
            });
        }

        // Add buttons if they exist
        if (template.buttons && Array.isArray(template.buttons) && template.buttons.length > 0) {
            components.push({
                type: "BUTTONS",
                buttons: template.buttons
            });
        }

        const metaPayload = {
            name: sanitizedName,
            language: template.language || "en_US",
            category: template.category || "UTILITY",
            components: components
        };

        // 4. Submit to Meta
        const response = await fetch(
            `https://graph.facebook.com/v17.0/${cloudCreds.wabaId}/message_templates`,
            {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${cloudCreds.accessToken}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(metaPayload)
            }
        );

        const result = await response.json();

        if (!response.ok || result.error) {
            console.error("[Meta Template Create] Error:", result.error);
            return NextResponse.json({
                error: result.error?.message || "Meta API submission failed",
                details: result.error
            }, { status: response.status || 500 });
        }

        // 5. Update local database
        const updatedTemplate = await db.messageTemplate.update({
            where: { id: templateId },
            data: {
                templateId: result.id, // Store the official Meta ID
                templateName: sanitizedName,
                status: result.status || "PENDING_APPROVAL",
                approved: result.status === "APPROVED"
            }
        });

        return NextResponse.json({
            success: true,
            message: "Template submitted for approval",
            template: updatedTemplate,
            metaResponse: result
        });

    } catch (error) {
        console.error("Error submitting template to Meta:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

