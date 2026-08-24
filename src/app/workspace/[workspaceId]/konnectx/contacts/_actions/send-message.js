'use server'

import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { db } from "@/lib/db";
import { ensureWorkspaceAccess } from "@/lib/auth-utils";
import { resolveWhatsAppCredentials } from "@/lib/whatsapp-credentials";
import * as cloudApi from "../../_lib/whatsapp-cloud-api";

const SendMessageSchema = z.object({
    workspaceId: z.string(),
    phone: z.string().min(1, "Phone is required"),
    type: z.string().default('text'),
    message: z.string().optional(),
    template: z.object({
        name: z.string(),
        language: z.object({
            code: z.string()
        }).optional(),
        components: z.array(z.any()).optional()
    }).optional()
});

const handler = async (data) => {
    const { workspaceId, phone, message, type = 'text', template } = data;

    try {
        const session = await ensureWorkspaceAccess(workspaceId);
        const userId = session.user.userId || session.user.id;

        const { credentials: cloudCredentials } = await resolveWhatsAppCredentials({
            workspaceId,
            userId
        });

        if (!cloudCredentials?.accessToken || !cloudCredentials?.phoneNumberId) {
            throw new Error("No active Cloud API credential found with Access Token and Phone Number ID");
        }

        const phoneNum = phone.replace(/[^\d+]/g, '');
        let result;

        if (type === 'template' && template) {
            if (!template.name) throw new Error("Template name is required");

            // Process any media upload parameters
            if (template.components && template.components.length > 0) {
                for (const comp of template.components) {
                    if (comp.type === 'header' && comp.parameters) {
                        for (const param of comp.parameters) {
                            if (['image', 'video', 'document'].includes(param.type) && param[param.type]?.link) {
                                const mediaUrl = param[param.type].link;
                                const mediaId = await cloudApi.uploadMetaMedia(cloudCredentials, mediaUrl);
                                if (mediaId) {
                                    delete param[param.type].link;
                                    param[param.type].id = mediaId;
                                }
                            }
                        }
                    }
                }
            }

            result = await cloudApi.sendTemplateMessage(
                cloudCredentials,
                phoneNum,
                template.name,
                template.language?.code || 'en_US',
                template.components || []
            );
        } else {
            const textContent = (message || "").trim();
            if (!textContent) throw new Error("Message content cannot be empty");
            result = await cloudApi.sendTextMessage(cloudCredentials, phoneNum, textContent);
        }

        if (!result.success) throw new Error(result.error);

        return { success: true, result: result.data };
    } catch (error) {
        console.error('Action Error (sendMessage):', error);
        return { error: error.message || 'Internal Server Error' };
    }
};

export const sendMessage = createSafeAction(SendMessageSchema, handler);
