import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { db } from "@/lib/db";
import { symmetricDecrypt } from "@/lib/encryption";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

export async function GET(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id && !session?.user?.userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userId = session.user.userId || session.user.id;
        const { searchParams } = new URL(req.url);
        const templateId = searchParams.get("templateId");

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

        if (!template.templateName) {
            return NextResponse.json({ error: "Template has not been submitted to Meta yet" }, { status: 400 });
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

        // 3. Fetch status from Meta
        // Filter by name to get the specific template
        const response = await fetch(
            `https://graph.facebook.com/v17.0/${cloudCreds.wabaId}/message_templates?name=${template.templateName}`,
            {
                headers: {
                    "Authorization": `Bearer ${cloudCreds.accessToken}`
                }
            }
        );

        const result = await response.json();

        if (!response.ok || result.error) {
            console.error("[Meta Template Status] Error:", result.error);
            return NextResponse.json({
                error: result.error?.message || "Failed to fetch status from Meta"
            }, { status: response.status || 500 });
        }

        const metaTemplate = result.data?.find(t => t.name === template.templateName);

        if (!metaTemplate) {
            return NextResponse.json({ error: "Template not found on Meta" }, { status: 404 });
        }

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

        const { body, footer, buttons } = parseComponents(metaTemplate.components);

        // 4. Update local database
        const updatedTemplate = await db.messageTemplate.update({
            where: { id: templateId },
            data: {
                templateId: metaTemplate.id,
                status: metaTemplate.status,
                approved: metaTemplate.status === "APPROVED",
                category: metaTemplate.category,
                body,
                footer,
                buttons: buttons || []
            }
        });

        return NextResponse.json({
            success: true,
            status: metaTemplate.status,
            template: updatedTemplate
        });

    } catch (error) {
        console.error("Error checking template status:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

