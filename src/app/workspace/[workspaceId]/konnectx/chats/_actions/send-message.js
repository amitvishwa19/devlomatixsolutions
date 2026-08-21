'use server'

import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { db } from "@/lib/db";
import { ensureWorkspaceAccess } from "@/lib/auth-utils";
import * as cloudApi from '../../_lib/whatsapp-cloud-api';
import { symmetricDecrypt } from "@/lib/encryption";
import { getWhatsappDefault } from "@/lib/whatsapp-default";
import fs from 'fs';

const SendMessageSchema = z.object({
    workspaceId: z.string(),
    to: z.string(),
    type: z.string().default('text'),
    body: z.string().optional(),
    text: z.string().optional(),
    content: z.string().optional(),
    mediaUrl: z.string().optional(),
    url: z.string().optional(),
    caption: z.string().optional(),
    location: z.any().optional(),
    interactive: z.any().optional(),
    template: z.object({
        name: z.string(),
        language: z.object({
            code: z.string()
        }).optional(),
        components: z.array(z.any()).optional()
    }).optional()
});

const handler = async (data) => {
    const { workspaceId, to, type } = data;

    try {
        const session = await ensureWorkspaceAccess(workspaceId);
        const userId = session.user.userId || session.user.id;

        const cleanTo = to.replace(/[^\d+]/g, '');

        // 1. Fetch Cloud API Credentials (prioritize user's switched default)
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

        if (!cloudCredentials.accessToken || !cloudCredentials.phoneNumberId) {
            return { error: "Incomplete Cloud API credentials." };
        }

        // 2. Dispatch
        let result;
        const msgType = type.toLowerCase();

        switch (msgType) {
            case 'text':
                const textBody = (data.body || data.text || (typeof data.content === 'string' ? data.content : "")).trim();
                result = await cloudApi.sendTextMessage(cloudCredentials, cleanTo, textBody);
                break;
            case 'image':
            case 'video':
            case 'audio':
            case 'document':
                const mediaUrl = data.mediaUrl || data[msgType]?.url || data.url;
                const caption = (data.caption || (data[msgType]?.caption) || "").trim();
                result = await cloudApi.sendMediaMessage(cloudCredentials, cleanTo, msgType, mediaUrl, caption);
                break;
            case 'location':
                const loc = data.location;
                if (!loc) return { error: "Missing location data" };
                result = await cloudApi.sendLocationMessage(
                    cloudCredentials, cleanTo,
                    loc.degreesLatitude || loc.latitude,
                    loc.degreesLongitude || loc.longitude,
                    loc.name, loc.address
                );
                break;
            case 'interactive':
                result = await cloudApi.sendInteractiveMessage(cloudCredentials, cleanTo, data.interactive);
                break;
            case 'template':
                if (!data.template?.name) return { error: "Missing template name" };

                // Pre-process template components to convert media links to internal Meta media IDs
                if (data.template.components && data.template.components.length > 0) {
                    // Helper to process parameters
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

                    for (const comp of data.template.components) {
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
                
                console.log("[SendMessage] Final Template Components Payload:", JSON.stringify(data.template.components, null, 2));
                fs.writeFileSync('d:\\Dev\\React\\devlomatix\\devlomatix-workspace\\devlomatix\\debug-payload.json', JSON.stringify({
                    templateName: data.template.name,
                    components: data.template.components,
                    fullRequestData: data
                }, null, 2));

                result = await cloudApi.sendTemplateMessage(
                    cloudCredentials, cleanTo,
                    data.template.name,
                    data.template.language?.code || 'en_US',
                    data.template.components || []
                );
                break;
            default:
                return { error: `Unsupported message type: ${msgType}` };
        }

        if (!result.success) return { error: result.error };

        // 3. Log to DB
        try {
            let logText = "";
            if (msgType === 'template') {
                const template = await db.messageTemplate.findFirst({
                    where: { userId, OR: [{ name: data.template.name }, { templateName: data.template.name }] }
                });
                if (template) {
                    let fullText = template.body;
                    const bodyComp = data.template.components?.find(c => c.type?.toLowerCase() === 'body');
                    if (bodyComp?.parameters) {
                        bodyComp.parameters.forEach((param, idx) => {
                            fullText = fullText.replace(`{{${idx + 1}}}`, param.text || "");
                        });
                    }
                    logText = fullText;
                } else {
                    logText = `[Template: ${data.template.name}]`;
                }
            } else {
                switch (msgType) {
                    case 'text': logText = data.body || data.text || data.content || ""; break;
                    case 'interactive': logText = "[Interactive Message]"; break;
                    default: logText = `[${msgType.toUpperCase()}] ${data.caption || ""}`;
                }
            }

            const waMessageId = result.data?.messages?.[0]?.id;
            const formattedJid = cleanTo.length === 10 ? `91${cleanTo}@s.whatsapp.net` : (cleanTo.includes('@') ? cleanTo : `${cleanTo}@s.whatsapp.net`);
            await db.whatsAppMessage.create({
                data: {
                    userId,
                    waId: waMessageId || `local_${Date.now()}`,
                    jid: formattedJid,
                    text: logText,
                    fromMe: true,
                    timestamp: BigInt(Math.floor(Date.now() / 1000)),
                    status: "SENT",
                    metadata: { 
                        type: msgType, 
                        originalPayload: data,
                        phone_number_id: String(cloudCredentials?.phoneNumberId || cloudCredentials?.phone_number_id || "")
                    }
                }
            });
        } catch (dbError) {
            console.error(`[SendMessage Action] DB log failed`, dbError);
        }

        return { 
            data: {
                success: true, 
                metaData: JSON.parse(JSON.stringify(result.data))
            } 
        };
    } catch (error) {
        return { error: error.message || "Failed to send message" };
    }
};

export const sendMessage = createSafeAction(SendMessageSchema, handler);
