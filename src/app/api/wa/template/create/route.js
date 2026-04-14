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
        let cloudCreds = null;
        const stored = credential.credentials;

        if (typeof stored === 'string' && stored.includes(':')) {
            try {
                const decryptedStr = symmetricDecrypt(stored);
                cloudCreds = JSON.parse(decryptedStr);
            } catch (e) {
                console.error(`[Template Create] Decryption failed!`, e);
                return NextResponse.json({ error: "Failed to decrypt WhatsApp credentials." }, { status: 500 });
            }
        } else if (typeof stored === 'string') {
            try {
                cloudCreds = JSON.parse(stored);
            } catch (e) {
                return NextResponse.json({ error: "Invalid credentials format." }, { status: 500 });
            }
        } else {
            cloudCreds = stored;
        }

        // Handle Legacy Object Wrapping
        if (cloudCreds?.enc) {
            try {
                const decryptedStr = symmetricDecrypt(cloudCreds.enc);
                cloudCreds = JSON.parse(decryptedStr);
            } catch (e) {
                console.error(`[Template Create] legacy Decryption failed!`, e);
            }
        }

        // 3. Prepare Meta Template Data
        // Meta requires name to be lowercase with underscores
        const sanitizedName = template.name
            .toLowerCase()
            .trim()
            .replace(/\s+/g, '_')
            .replace(/[^a-z0-9_]/g, '');

        // Helper to detect variables and generate samples
        const getExampleSamples = (text) => {
            const matches = [...(text || "").matchAll(/{{(\d+)}}/g)];
            if (matches.length === 0) return null;
            
            // Meta expects body_text: [ ["sample1", "sample2"] ] for multiple variables
            // or header_text: ["sample"] for header
            return matches.map((_, i) => `Sample ${i + 1}`);
        };

        const components = [];

        // 1. HEADER
        if (template.metadata?.headerText) {
            const headerText = template.metadata.headerText.trim();
            const headerExamples = getExampleSamples(headerText);
            const headerComp = {
                type: "HEADER",
                format: "TEXT",
                text: headerText
            };
            if (headerExamples) {
                headerComp.example = { header_text: headerExamples };
            }
            components.push(headerComp);
        }

        // 2. BODY
        const bodyText = (template.body || "").trim();
        const bodyExamples = getExampleSamples(bodyText);
        const bodyComp = {
            type: "BODY",
            text: bodyText
        };
        if (bodyExamples) {
            bodyComp.example = { body_text: [bodyExamples] }; // Meta expects nested array for body
        }
        components.push(bodyComp);

        // 3. FOOTER
        if (template.footer) {
            components.push({
                type: "FOOTER",
                text: template.footer.trim()
            });
        }

        // 4. BUTTONS
        if (template.buttons && Array.isArray(template.buttons) && template.buttons.length > 0) {
            // Normalize buttons for creation (some Meta versions require specific fields)
            const metaButtons = template.buttons.map(btn => {
                const b = typeof btn === 'string' ? { type: 'QUICK_REPLY', text: btn } : btn;
                return {
                    type: b.type || 'QUICK_REPLY',
                    text: b.text || b.url || 'Click here',
                    url: b.type === 'URL' ? b.url : undefined,
                    phone_number: b.type === 'PHONE_NUMBER' ? b.phone_number : undefined
                };
            });

            components.push({
                type: "BUTTONS",
                buttons: metaButtons
            });
        }

        const metaPayload = {
            name: sanitizedName,
            language: template.language || "en_US",
            category: (template.category || "UTILITY").toUpperCase(),
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

        // 5. Update local database ONLY after success
        const metaStatus = result.status === 'APPROVED' ? 'APPROVED' : 'PENDING_APPROVAL';

        const updatedTemplate = await db.messageTemplate.update({
            where: { id: templateId },
            data: {
                templateId: result.id, // Store the official Meta ID
                templateName: sanitizedName,
                status: metaStatus,
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

