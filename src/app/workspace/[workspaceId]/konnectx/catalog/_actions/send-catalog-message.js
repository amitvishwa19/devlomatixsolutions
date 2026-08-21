'use server'

import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { db } from "@/lib/db";
import { ensureWorkspaceAccess } from "@/lib/auth-utils";
import { symmetricDecrypt } from "@/lib/encryption";
import * as cloudApi from '../../_lib/whatsapp-cloud-api';

const SendCatalogMessageSchema = z.object({
    workspaceId: z.string(),
    to: z.string().min(1, "Recipient phone number is required"),
    type: z.enum(["product", "catalog_message"]),
    catalogId: z.string().optional(),
    retailerId: z.string().optional(),
    bodyText: z.string().optional(),
    footerText: z.string().optional()
});

const handler = async (data) => {
    const { workspaceId, to, type, catalogId, retailerId, bodyText, footerText } = data;

    try {
        const session = await ensureWorkspaceAccess(workspaceId);
        const userId = session.user.userId || session.user.id;

        const cred = await db.credentials.findFirst({
            where: { userId, platform: 'WHATSAPP_CLOUD' },
            orderBy: [{ isDefault: 'desc' }, { updatedAt: 'desc' }]
        }).catch(() => null);

        if (!cred?.credentials) throw new Error("WhatsApp Cloud API credentials not found");

        let decrypted = null;
        const stored = cred.credentials;
        if (typeof stored === 'string' && stored.includes(':')) {
            try { decrypted = JSON.parse(symmetricDecrypt(stored)); } catch (e) { }
        } else if (typeof stored === 'string') {
            try { decrypted = JSON.parse(stored); } catch (e) { }
        } else {
            decrypted = stored;
        }

        if (!decrypted?.accessToken || !decrypted?.phoneNumberId) {
            throw new Error("Missing Meta access token or phone number ID");
        }

        const cleanTo = to.replace(/[^\d+]/g, '').replace(/^\+/, '');

        let sendRes = null;
        if (type === 'product') {
            if (!catalogId || !retailerId) throw new Error("Catalog ID and Product SKU/Retailer ID are required to send product message");
            sendRes = await cloudApi.sendProductInteractiveMessage(decrypted, cleanTo, {
                catalogId,
                retailerId,
                bodyText,
                footerText
            });
        } else {
            sendRes = await cloudApi.sendCatalogInteractiveMessage(decrypted, cleanTo, {
                bodyText,
                footerText
            });
        }

        if (!sendRes.success) {
            throw new Error(sendRes.error || "Failed to dispatch WhatsApp Catalog message");
        }

        // Save outbound message in db.whatsAppMessage for live chat history
        const waId = sendRes.data?.messages?.[0]?.id || `out_${Date.now()}`;
        await db.whatsAppMessage.create({
            data: {
                userId,
                jid: `${cleanTo}@s.whatsapp.net`,
                fromMe: true,
                text: type === 'product' ? `[Product: ${retailerId}] ${bodyText || ''}` : `[Catalog] ${bodyText || ''}`,
                status: 'SENT',
                waId,
                timestamp: Math.floor(Date.now() / 1000),
                metadata: {
                    type: 'interactive',
                    interactiveType: type,
                    catalogId,
                    retailerId,
                    phone_number_id: decrypted.phoneNumberId
                }
            }
        }).catch(() => {});

        return {
            data: {
                success: true,
                messageId: waId
            }
        };

    } catch (error) {
        console.error("[sendCatalogMessage] Error:", error);
        return { error: error.message || "Failed to send message" };
    }
};

export const sendCatalogMessage = createSafeAction(SendCatalogMessageSchema, handler);
