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

const getMetaHeaderHandle = async (mediaUrl, accessToken, format) => {
    const appId = process.env.FACEBOOK_APP_ID || process.env.NEXT_PUBLIC_FACEBOOK_APP_ID;
    if (!appId) {
        console.warn("[getMetaHeaderHandle] FACEBOOK_APP_ID is not configured in environment variables.");
        return null;
    }

    try {
        console.log("[getMetaHeaderHandle] Initiating resumable upload for URL:", mediaUrl);
        
        // 1. Download file from URL to get file size and mime type
        const mediaResponse = await fetch(mediaUrl);
        if (!mediaResponse.ok) {
            throw new Error(`Failed to fetch media file from URL: ${mediaResponse.statusText}`);
        }
        const buffer = Buffer.from(await mediaResponse.arrayBuffer());
        const fileLength = buffer.length;
        const fileType = mediaResponse.headers.get('content-type') || 'image/jpeg';
        const fileName = mediaUrl.split('/').pop()?.split('?')[0] || 'sample_file';

        console.log("[getMetaHeaderHandle] File fetched. MIME Type:", fileType);

        // MIME Type validation against the required Meta format
        if (format === 'IMAGE') {
            const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
            if (!allowedTypes.includes(fileType.toLowerCase())) {
                throw new Error(`Unsupported image MIME type: ${fileType}. Meta only supports JPEG and PNG for template headers.`);
            }
        } else if (format === 'VIDEO') {
            const allowedTypes = ['video/mp4', 'video/3gpp'];
            if (!allowedTypes.includes(fileType.toLowerCase())) {
                throw new Error(`Unsupported video MIME type: ${fileType}. Meta only supports MP4 and 3GP.`);
            }
        } else if (format === 'AUDIO') {
            const allowedTypes = ['audio/aac', 'audio/mp4', 'audio/mpeg', 'audio/amr', 'audio/ogg'];
            if (!allowedTypes.includes(fileType.toLowerCase())) {
                throw new Error(`Unsupported audio MIME type: ${fileType}.`);
            }
        } else if (format === 'DOCUMENT') {
            const allowedTypes = ['application/pdf'];
            if (!allowedTypes.includes(fileType.toLowerCase())) {
                throw new Error(`Unsupported document MIME type: ${fileType}. Meta template headers only support PDF.`);
            }
        }

        console.log("[getMetaHeaderHandle] File details validated:", { fileName, fileLength, fileType });

        // 2. Start Meta resumable upload session
        const initiateUrl = `https://graph.facebook.com/v17.0/${appId}/uploads?file_name=${encodeURIComponent(fileName)}&file_length=${fileLength}&file_type=${fileType}&access_token=${accessToken}`;
        const initiateRes = await fetch(initiateUrl, { method: "POST" });
        const initiateData = await initiateRes.json();
        
        if (!initiateRes.ok || !initiateData.id) {
            throw new Error(initiateData.error?.message || "Failed to initiate Meta upload session");
        }
        const uploadSessionId = initiateData.id;
        console.log("[getMetaHeaderHandle] Meta upload session initiated. Session ID:", uploadSessionId);

        // 3. Upload file binary data
        const uploadUrl = `https://graph.facebook.com/v17.0/${uploadSessionId}`;
        const uploadRes = await fetch(uploadUrl, {
            method: "POST",
            headers: {
                "Authorization": `OAuth ${accessToken}`,
                "file_offset": "0",
                "Content-Type": "application/octet-stream"
            },
            body: buffer
        });
        const uploadData = await uploadRes.json();
        if (!uploadRes.ok || !uploadData.h) {
            throw new Error(uploadData.error?.message || "Failed to upload media bytes to Meta");
        }

        console.log("[getMetaHeaderHandle] Meta upload completed. Header handle:", uploadData.h);
        return uploadData.h;
    } catch (error) {
        console.error("[getMetaHeaderHandle] Error during upload:", error.message || error);
        return null;
    }
};

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

        // 2. Fetch Cloud API Credentials (with fallback)
        let credential = await db.credentials.findFirst({
            where: { userId, platform: 'WHATSAPP_CLOUD', isDefault: true }
        });

        if (!credential) {
            credential = await db.credentials.findFirst({
                where: { userId, platform: 'WHATSAPP_CLOUD' },
                orderBy: { updatedAt: 'desc' }
            });
        }

        if (!credential) {
            return { error: "WhatsApp Cloud credentials not found" };
        }

        let cloudCreds = null;
        const stored = credential.credentials;
        if (stored) {
            if (typeof stored === 'string' && stored.includes(':')) {
                try { cloudCreds = JSON.parse(symmetricDecrypt(stored)); } catch (e) { }
            } else if (typeof stored === 'object' && stored.enc && typeof stored.enc === 'string' && stored.enc.includes(':')) {
                try { cloudCreds = JSON.parse(symmetricDecrypt(stored.enc)); } catch (e) { }
            } else if (typeof stored === 'object') {
                cloudCreds = stored;
            } else {
                try { cloudCreds = JSON.parse(stored); } catch (e) { }
            }
        }

        // 3. Prepare Meta Template Data
        const sanitizedName = (template.templateName || template.name)
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

        const templateType = (template.type || 'text').toLowerCase();

        // HEADER
        if (templateType === 'location') {
            components.push({
                type: "HEADER",
                format: "LOCATION"
            });
        } else if (['image', 'video', 'audio', 'document'].includes(templateType)) {
            const format = templateType.toUpperCase();
            const mediaComp = {
                type: "HEADER",
                format: format,
            };

            // Clean/parse metadata if it is stored as string
            let metadata = template.metadata;
            if (typeof metadata === 'string') {
                try { metadata = JSON.parse(metadata); } catch (e) {}
            }

            const mediaUrl = metadata?.mediaUrl;
            let headerHandle = null;

             if (mediaUrl) {
                const isUrl = /^https?:\/\//i.test(mediaUrl);
                if (isUrl) {
                    // Upload the file to Meta on-the-fly to get a header_handle
                    headerHandle = await getMetaHeaderHandle(mediaUrl, cloudCreds.accessToken, format);
                } else {
                    headerHandle = mediaUrl; // already a handle
                }
            }

            // Fallback to uploading a standard abstract asset if no URL was provided or upload failed
            if (!headerHandle) {
                const fallbackUrl = {
                    IMAGE: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809",
                    VIDEO: "https://www.w3schools.com/html/mov_bbb.mp4",
                    AUDIO: "https://www.w3schools.com/html/horse.mp3",
                    DOCUMENT: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
                }[format];
                headerHandle = await getMetaHeaderHandle(fallbackUrl, cloudCreds.accessToken, format);
            }

            if (headerHandle) {
                mediaComp.example = { header_handle: [headerHandle] };
            }
            
            components.push(mediaComp);
        } else if (template.metadata?.headerText) {
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
        if (template.buttons && Array.isArray(template.buttons)) {
            const validButtons = template.buttons
                .map(btn => {
                    const b = typeof btn === 'string' ? { type: 'QUICK_REPLY', text: btn } : btn;
                    const type = (b.type || 'QUICK_REPLY').toUpperCase();
                    const text = (b.text || b.url || '').trim();
                    return {
                        type: type,
                        text: text,
                        url: type === 'URL' ? b.url : undefined,
                        phone_number: type === 'PHONE_NUMBER' ? b.phone_number : undefined
                    };
                })
                .filter(btn => btn.text.length > 0);

            if (validButtons.length > 0) {
                components.push({
                    type: "BUTTONS",
                    buttons: validButtons
                });
            }
        }

        const metaPayload = {
            name: sanitizedName,
            language: template.language || "en_US",
            category: (template.category || "UTILITY").toUpperCase(),
            components: components
        };

        console.log("[SubmitTemplate] Meta Payload:", JSON.stringify(metaPayload, null, 2));

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
        console.log("[SubmitTemplate] Meta Result:", JSON.stringify(result, null, 2));

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
