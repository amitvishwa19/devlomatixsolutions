'use server'

import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { db } from "@/lib/db";
import { ensureWorkspaceAccess } from "@/lib/auth-utils";
import { resolveWhatsAppCredentials } from "@/lib/whatsapp-credentials";
import * as cloudApi from '../../_lib/whatsapp-cloud-api';

const SendCatalogMessageSchema = z.object({
    workspaceId: z.string(),
    to: z.string().min(1, "Recipient phone number is required"),
    type: z.enum(["product", "catalog_message"]),
    catalogId: z.string().optional(),
    retailerId: z.string().optional(),
    productId: z.string().optional(),
    bodyText: z.string().optional(),
    footerText: z.string().optional()
});

const handler = async (data) => {
    const { workspaceId, to, type, catalogId, retailerId, productId, bodyText, footerText } = data;

    try {
        const session = await ensureWorkspaceAccess(workspaceId);
        const userId = session.user.userId || session.user.id;

        const { credentials: decrypted, credential: credRecord } = await resolveWhatsAppCredentials({
            workspaceId,
            userId
        });

        if (!decrypted?.accessToken || !decrypted?.phoneNumberId) {
            throw new Error("WhatsApp Cloud API credentials not configured or missing Access Token / Phone Number ID. Please check Settings.");
        }

        const cleanTo = to.replace(/[^\d+]/g, '').replace(/^\+/, '');

        // Fetch product info if available
        let product = null;
        if (productId || retailerId) {
            product = await db.eCommerceProduct.findFirst({
                where: {
                    OR: [
                        ...(productId ? [{ id: productId }] : []),
                        ...(retailerId ? [{ sku: retailerId }] : [])
                    ]
                }
            }).catch(() => null);
        }

        let sendRes = null;

        if (type === 'product') {
            if (catalogId && retailerId) {
                // Official Meta Single Product Message
                sendRes = await cloudApi.sendProductInteractiveMessage(decrypted, cleanTo, {
                    catalogId,
                    retailerId,
                    bodyText: bodyText || (product ? `Check out our ${product.title}:` : 'Featured Product:'),
                    footerText
                });
            } else if (product) {
                // Fallback: Rich Product Showcase Message with Image & Details
                const img = Array.isArray(product.imageUrls) ? product.imageUrls[0] : (product.imageUrl || product.image_url);
                const captionLines = [
                    bodyText ? `*${bodyText}*` : null,
                    `🛍️ *${product.title}*`,
                    `💰 *Price:* ${product.currency || 'INR'} ${Number(product.price).toLocaleString()}`,
                    product.sku ? `🏷️ *SKU:* \`${product.sku}\`` : null,
                    product.description ? `\n${product.description}` : null,
                    product.url ? `\n🔗 *Order Link:* ${product.url}` : null,
                    footerText ? `\n_${footerText}_` : null
                ].filter(Boolean).join('\n');

                if (img) {
                    sendRes = await cloudApi.sendMediaMessage(decrypted, cleanTo, {
                        type: 'image',
                        url: img,
                        caption: captionLines
                    });
                } else {
                    sendRes = await cloudApi.sendTextMessage(decrypted, cleanTo, captionLines);
                }
            } else {
                throw new Error("Product information not found");
            }
        } else {
            // Catalog Message
            if (catalogId) {
                sendRes = await cloudApi.sendCatalogInteractiveMessage(decrypted, cleanTo, {
                    bodyText: bodyText || 'Explore our full product catalog on WhatsApp!',
                    footerText
                });
            } else {
                // Fallback: Text summary of top products
                const allProducts = await db.eCommerceProduct.findMany({
                    where: { userId, status: 'ACTIVE' },
                    take: 5
                }).catch(() => []);

                let textSummary = `🛍️ *${bodyText || 'Devlomatix Product Catalog'}*\n\n`;
                if (allProducts.length > 0) {
                    textSummary += allProducts.map((p, i) => `${i + 1}. *${p.title}* — ${p.currency || 'INR'} ${Number(p.price).toLocaleString()}`).join('\n');
                } else {
                    textSummary += `Browse our full range of products. Contact us for custom quotes and orders.`;
                }
                if (footerText) textSummary += `\n\n_${footerText}_`;

                sendRes = await cloudApi.sendTextMessage(decrypted, cleanTo, textSummary);
            }
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
                text: type === 'product'
                    ? (product ? `[Product: ${product.title}] ${product.currency || 'INR'} ${product.price}` : `[Product: ${retailerId}]`)
                    : `[Catalog] ${bodyText || ''}`,
                status: 'SENT',
                waId,
                timestamp: Math.floor(Date.now() / 1000),
                metadata: {
                    type: 'interactive',
                    interactiveType: type,
                    catalogId: catalogId || null,
                    retailerId: retailerId || product?.sku,
                    productTitle: product?.title || product?.name || null,
                    productPrice: product?.price || null,
                    productCurrency: product?.currency || 'INR',
                    productImageUrl: product ? (Array.isArray(product.imageUrls) ? product.imageUrls[0] : (product.imageUrl || product.image_url)) : null,
                    productDescription: product?.description || null,
                    productUrl: product?.url || null,
                    bodyText: bodyText || '',
                    footerText: footerText || '',
                    phone_number_id: decrypted.phoneNumberId
                }
            }
        }).catch(() => {});

        return {
            data: {
                success: true,
                messageId: waId,
                mode: catalogId ? 'meta_catalog' : 'rich_product_card'
            }
        };

    } catch (error) {
        console.error("[sendCatalogMessage] Error:", error);
        return { error: error.message || "Failed to send message" };
    }
};

export const sendCatalogMessage = createSafeAction(SendCatalogMessageSchema, handler);
