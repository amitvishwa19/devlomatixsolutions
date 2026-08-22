'use server'

import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { db } from "@/lib/db";
import { ensureWorkspaceAccess } from "@/lib/auth-utils";
import * as cloudApi from '../../_lib/whatsapp-cloud-api';
import { symmetricDecrypt } from "@/lib/encryption";
import { getWhatsappDefault } from "@/lib/whatsapp-default";

const ForwardMessageSchema = z.object({
    workspaceId: z.string(),
    recipients: z.array(z.string()).min(1, "At least one recipient is required"),
    message: z.object({
        type: z.string().default('text'),
        text: z.string().optional(),
        body: z.string().optional(),
        mediaUrl: z.string().optional(),
        caption: z.string().optional(),
        location: z.any().optional(),
        template: z.any().optional()
    })
});

const handler = async (data) => {
    const { workspaceId, recipients, message } = data;

    try {
        const session = await ensureWorkspaceAccess(workspaceId);
        const userId = session.user.userId || session.user.id;

        // 1. Resolve Active Default Credential (Prioritize user's switched default)
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
            return { error: "WhatsApp Cloud API credentials not found." };
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

        const msgType = (message.type || 'text').toLowerCase();
        const textContent = message.body || message.text || '';
        let sentCount = 0;
        const errors = [];

        for (const rawTo of recipients) {
            const cleanTo = rawTo.replace(/[^\d+]/g, '').replace(/^\+/, '');
            if (!cleanTo || cleanTo.length < 7) continue;

            let result = null;
            try {
                if (msgType === 'text') {
                    result = await cloudApi.sendTextMessage(cloudCredentials, cleanTo, textContent);
                } else if (['image', 'video', 'audio', 'document'].includes(msgType)) {
                    result = await cloudApi.sendMediaMessage(cloudCredentials, cleanTo, {
                        type: msgType,
                        url: message.mediaUrl,
                        caption: message.caption || ''
                    });
                } else if (msgType === 'template' && message.template) {
                    result = await cloudApi.sendTemplateMessage(cloudCredentials, cleanTo, message.template);
                } else if (msgType === 'location' && message.location) {
                    result = await cloudApi.sendLocationMessage(cloudCredentials, cleanTo, message.location);
                } else {
                    // Fallback to text
                    result = await cloudApi.sendTextMessage(cloudCredentials, cleanTo, textContent || '[Forwarded Message]');
                }

                if (result?.success) {
                    sentCount++;
                    const waId = result.data?.messages?.[0]?.id || `fwd_${Date.now()}`;
                    await db.whatsAppMessage.create({
                        data: {
                            userId,
                            jid: `${cleanTo}@s.whatsapp.net`,
                            fromMe: true,
                            text: textContent || `[${msgType.toUpperCase()}]`,
                            status: 'SENT',
                            waId,
                            timestamp: Math.floor(Date.now() / 1000),
                            metadata: {
                                type: msgType,
                                forwarded: true,
                                originalType: msgType,
                                mediaUrl: message.mediaUrl,
                                caption: message.caption,
                                phone_number_id: cloudCredentials.phoneNumberId
                            }
                        }
                    }).catch(() => {});
                } else {
                    errors.push({ recipient: cleanTo, error: result?.error || "Send failed" });
                }
            } catch (err) {
                errors.push({ recipient: cleanTo, error: err.message });
            }
        }

        return {
            data: {
                success: sentCount > 0,
                sentCount,
                total: recipients.length,
                errors
            }
        };

    } catch (error) {
        console.error("[forwardMessage] Error:", error);
        return { error: error.message || "Failed to forward message" };
    }
};

export const forwardMessage = createSafeAction(ForwardMessageSchema, handler);
