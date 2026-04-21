'use server'

import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { db } from "@/lib/db";
import { ensureWorkspaceAccess } from "@/lib/auth-utils";
import { symmetricDecrypt } from "@/lib/encryption";

const SubmitTemplateSchema = z.object({
    workspaceId: z.string(),
    templateId: z.string(),
});

const handler = async (data) => {
    const { workspaceId, templateId } = data;

    try {
        const session = await ensureWorkspaceAccess(workspaceId);
        const userId = session.user.userId || session.user.id;

        // 1. Fetch template data
        const template = await db.messageTemplate.findUnique({
            where: { id: templateId }
        });

        if (!template || template.userId !== userId) {
            return { error: "Template not found" };
        }

        // 2. Fetch Cloud API Credentials
        const credential = await db.credentials.findFirst({
            where: { userId, platform: 'WHATSAPP_CLOUD' },
            orderBy: { updatedAt: 'desc' }
        });

        if (!credential) {
            return { error: "WhatsApp Cloud credentials not found" };
        }

        let cloudCreds = null;
        const stored = credential.credentials;

        if (typeof stored === 'string' && stored.includes(':')) {
            try {
                const decryptedStr = symmetricDecrypt(stored);
                cloudCreds = JSON.parse(decryptedStr);
            } catch (e) {
                return { error: "Failed to decrypt WhatsApp credentials." };
            }
        } else if (typeof stored === 'string') {
            try {
                cloudCreds = JSON.parse(stored);
            } catch (e) {
                return { error: "Invalid credentials format." };
            }
        } else {
            cloudCreds = stored;
        }

        // 3. Prepare Meta Template Data
        const sanitizedName = template.name
            .toLowerCase()
            .trim()
            .replace(/\s+/g, '_')
            .replace(/[^a-z0-9_]/g, '');

        const getExampleSamples = (text) => {
            const matches = [...(text || "").matchAll(/{{(\d+)}}/g)];
            if (matches.length === 0) return null;
            return matches.map((_, i) => `Sample ${i + 1}`);
        };

        const components = [];

        // HEADER
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

        // BODY
        const bodyText = (template.body || "").trim();
        const bodyExamples = getExampleSamples(bodyText);
        const bodyComp = {
            type: "BODY",
            text: bodyText
        };
        if (bodyExamples) {
            bodyComp.example = { body_text: [bodyExamples] };
        }
        components.push(bodyComp);

        // FOOTER
        if (template.footer) {
            components.push({
                type: "FOOTER",
                text: template.footer.trim()
            });
        }

        // BUTTONS
        if (template.buttons && Array.isArray(template.buttons) && template.buttons.length > 0) {
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
            return {
                error: result.error?.message || "Meta API submission failed",
                details: result.error
            };
        }

        // 5. Update local database
        const metaStatus = result.status === 'APPROVED' ? 'APPROVED' : 'PENDING_APPROVAL';

        const updatedTemplate = await db.messageTemplate.update({
            where: { id: templateId },
            data: {
                templateId: result.id,
                templateName: sanitizedName,
                status: metaStatus,
                approved: result.status === "APPROVED"
            }
        });

        return {
            success: true,
            message: "Template submitted for approval",
            template: updatedTemplate
        };

    } catch (error) {
        return { error: error.message || "Internal server error" };
    }
};

export const submitTemplate = createSafeAction(SubmitTemplateSchema, handler);
