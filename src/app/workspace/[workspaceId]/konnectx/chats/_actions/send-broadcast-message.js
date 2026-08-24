'use server'

import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { db } from "@/lib/db";
import { ensureWorkspaceAccess } from "@/lib/auth-utils";
import * as cloudApi from '../../_lib/whatsapp-cloud-api';
import { symmetricDecrypt } from "@/lib/encryption";
import { getWhatsappDefault } from "@/lib/whatsapp-default";

const SendBroadcastMessageSchema = z.object({
    workspaceId: z.string(),
    segmentType: z.string().default('group'), // 'group', 'category', 'tag'
    segmentId: z.string().optional(),
    segmentName: z.string().optional(),
    recipients: z.array(z.string()).min(1, "At least one recipient is required"),
    type: z.string().default('text'),
    body: z.string().optional(),
    text: z.string().optional(),
    mediaUrl: z.string().optional(),
    template: z.object({
        name: z.string(),
        language: z.object({
            code: z.string()
        }).optional(),
        components: z.array(z.any()).optional()
    }).optional()
});

const handler = async (data) => {
    const { workspaceId, segmentType, segmentId, segmentName, recipients, type, template } = data;

    try {
        const session = await ensureWorkspaceAccess(workspaceId);
        const userId = session.user.userId || session.user.id;

        // 1. Resolve Active Default Credential
        let credential = await db.credentials.findFirst({
            where: { userId, platform: 'WHATSAPP_CLOUD', isDefault: true }
        }).catch(() => null);

        if (!credential) {
            credential = await db.credentials.findFirst({
                where: { workspaceId, platform: 'WHATSAPP_CLOUD', isDefault: true }
            }).catch(() => null);
        }

        if (!credential) {
            const defaultInfo = await getWhatsappDefault(workspaceId).catch(() => null);
            if (defaultInfo?.credentialId) {
                credential = await db.credentials.findUnique({ where: { id: defaultInfo.credentialId } }).catch(() => null);
            }
        }

        if (!credential) {
            credential = await db.credentials.findFirst({
                where: {
                    OR: [
                        { workspaceId, platform: 'WHATSAPP_CLOUD' },
                        { userId, platform: 'WHATSAPP_CLOUD' },
                    ]
                },
                orderBy: { updatedAt: 'desc' }
            }).catch(() => null);
        }

        if (!credential || !credential.credentials) {
            return { error: "WhatsApp Cloud API credentials not found. Please configure them in Settings." };
        }

        let cloudCredentials = null;
        const stored = credential.credentials;
        if (typeof stored === 'string' && stored.includes(':')) {
            cloudCredentials = JSON.parse(symmetricDecrypt(stored));
        } else if (typeof stored === 'string') {
            cloudCredentials = JSON.parse(stored);
        } else {
            cloudCredentials = stored;
        }

        if (cloudCredentials?.enc) {
            cloudCredentials = JSON.parse(symmetricDecrypt(cloudCredentials.enc));
        }

        if (!cloudCredentials?.accessToken || !cloudCredentials?.phoneNumberId) {
            return { error: "Incomplete Cloud API credentials." };
        }

        const msgType = (type || 'text').toLowerCase();
        const textBody = (data.body || data.text || "").trim();

        // 2. Pre-process template if sending template
        let templateComponents = template?.components || [];
        if (msgType === 'template' && template?.name) {
            if (templateComponents.length > 0) {
                const processParameters = async (parameters) => {
                    for (const param of parameters) {
                        if (['image', 'video', 'document'].includes(param.type) && param[param.type]?.link) {
                            const mediaUrl = param[param.type].link;
                            const mediaId = await cloudApi.uploadMetaMedia(cloudCredentials, mediaUrl);
                            if (mediaId) {
                                delete param[param.type].link;
                                param[param.type].id = mediaId;
                            }
                        }
                    }
                };

                for (const comp of templateComponents) {
                    if (comp.type === 'header' && comp.parameters) {
                        await processParameters(comp.parameters);
                    } else if (comp.type === 'carousel' && comp.cards) {
                        for (const card of comp.cards) {
                            if (card.components) {
                                for (const cardComp of card.components) {
                                    if (cardComp.type === 'header' && cardComp.parameters) {
                                        await processParameters(cardComp.parameters);
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        // Get template text preview for logging
        let templateLogText = "";
        if (msgType === 'template' && template?.name) {
            const dbTmpl = await db.messageTemplate.findFirst({
                where: { userId, OR: [{ name: template.name }, { templateName: template.name }] }
            }).catch(() => null);
            if (dbTmpl) {
                let fullText = dbTmpl.body;
                const bodyComp = templateComponents.find(c => c.type?.toLowerCase() === 'body');
                if (bodyComp?.parameters) {
                    bodyComp.parameters.forEach((param, idx) => {
                        fullText = fullText.replace(`{{${idx + 1}}}`, param.text || "");
                    });
                }
                templateLogText = fullText;
            } else {
                templateLogText = `[Template: ${template.name}]`;
            }
        }

        let sentCount = 0;
        let failedCount = 0;
        const errors = [];

        // 3. Loop over all recipients and send
        for (const rawTo of recipients) {
            const digitsOnly = String(rawTo).replace(/[^\d]/g, '');
            if (!digitsOnly || digitsOnly.length < 7) continue;

            const cleanTo = digitsOnly.length === 10 ? `91${digitsOnly}` : digitsOnly;
            const formattedJid = `${cleanTo}@s.whatsapp.net`;

            let result = null;
            try {
                if (msgType === 'text') {
                    result = await cloudApi.sendTextMessage(cloudCredentials, cleanTo, textBody);
                } else if (msgType === 'template' && template?.name) {
                    result = await cloudApi.sendTemplateMessage(
                        cloudCredentials,
                        cleanTo,
                        template.name,
                        template.language?.code || 'en_US',
                        templateComponents
                    );
                } else {
                    result = await cloudApi.sendTextMessage(cloudCredentials, cleanTo, textBody);
                }

                if (result?.success) {
                    sentCount++;
                    const waMessageId = result.data?.messages?.[0]?.id || `bc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
                    const logMessageText = msgType === 'template' ? templateLogText : textBody;

                    await db.whatsAppMessage.create({
                        data: {
                            userId,
                            waId: waMessageId,
                            jid: formattedJid,
                            text: logMessageText,
                            fromMe: true,
                            timestamp: BigInt(Math.floor(Date.now() / 1000)),
                            status: "SENT",
                            metadata: {
                                type: msgType,
                                broadcast: true,
                                segmentType: segmentType || 'group',
                                segmentId: segmentId || null,
                                segmentName: segmentName || null,
                                phone_number_id: String(cloudCredentials.phoneNumberId || "")
                            }
                        }
                    }).catch(err => console.error(`[sendBroadcastMessage] DB logging error for ${cleanTo}:`, err));
                } else {
                    failedCount++;
                    errors.push({ recipient: cleanTo, error: result?.error || "Send failed" });
                }
            } catch (err) {
                failedCount++;
                errors.push({ recipient: cleanTo, error: err.message });
            }
        }

        return {
            data: {
                success: sentCount > 0,
                sentCount,
                failedCount,
                total: recipients.length,
                errors
            }
        };

    } catch (error) {
        console.error("[sendBroadcastMessage] Top level error:", error);
        return { error: error.message || "Failed to send broadcast message" };
    }
};

export const sendBroadcastMessage = createSafeAction(SendBroadcastMessageSchema, handler);
