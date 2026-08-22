'use server'

import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { db } from "@/lib/db";
import { ensureWorkspaceAccess } from "@/lib/auth-utils";
import { resolveWhatsAppCredentials } from "@/lib/whatsapp-credentials";
import * as cloudApi from '../../_lib/whatsapp-cloud-api';
import { revalidatePath } from "next/cache";

const SaveProductSchema = z.object({
    workspaceId: z.string(),
    id: z.string().optional(),
    title: z.string().min(1, "Product title is required"),
    sku: z.string().optional(),
    description: z.string().optional(),
    price: z.number().min(0, "Price must be positive"),
    currency: z.string().default("INR"),
    imageUrl: z.string().optional(),
    url: z.string().optional(),
    status: z.string().default("ACTIVE"),
    inventoryCount: z.number().optional().default(100),
    catalogId: z.string().optional()
});

const handler = async (data) => {
    const { workspaceId, id, title, sku, description, price, currency, imageUrl, url, status, inventoryCount, catalogId } = data;

    try {
        const session = await ensureWorkspaceAccess(workspaceId);
        const userId = session.user.userId || session.user.id;

        const effectiveSku = sku?.trim() || `SKU_${Date.now()}`;
        const finalImages = imageUrl ? [imageUrl] : [];

        let savedProduct = null;

        if (id) {
            // Update
            savedProduct = await db.eCommerceProduct.update({
                where: { id },
                data: {
                    title,
                    sku: effectiveSku,
                    description,
                    price,
                    currency: currency.toUpperCase(),
                    imageUrls: finalImages,
                    status,
                    inventoryCount,
                    updatedAt: new Date()
                }
            });
        } else {
            // Create
            savedProduct = await db.eCommerceProduct.create({
                data: {
                    title,
                    sku: effectiveSku,
                    description,
                    price,
                    currency: currency.toUpperCase(),
                    imageUrls: finalImages,
                    status,
                    inventoryCount,
                    userId
                }
            });
        }

        // Ensure image is recorded in workspace documents
        if (imageUrl && imageUrl.trim()) {
            try {
                const existingDoc = await db.workspaceDocument.findFirst({
                    where: {
                        workspaceId,
                        fileUrl: imageUrl.trim(),
                        deletedAt: null
                    }
                });

                if (!existingDoc) {
                    await db.workspaceDocument.create({
                        data: {
                            name: `${title.trim()} Image`,
                            fileUrl: imageUrl.trim(),
                            fileType: 'image/jpeg',
                            extension: '.jpg',
                            category: 'IMAGE',
                            status: 'APPROVED',
                            isFolder: false,
                            workspaceId,
                            userId,
                            tags: ['catalog', 'product', effectiveSku]
                        }
                    });
                }
            } catch (docErr) {
                console.warn("[saveProduct] Could not link to workspace document:", docErr.message);
            }
        }

        // Push to Meta Catalog if catalogId is available and credentials exist
        let metaSyncResult = null;
        if (catalogId) {
            // Resolve credentials
            const { credentials: decrypted } = await resolveWhatsAppCredentials({
                workspaceId,
                userId
            });

            if (decrypted?.accessToken) {
                metaSyncResult = await cloudApi.createCatalogProductMeta(decrypted, catalogId, {
                    sku: effectiveSku,
                    title,
                    description,
                    price,
                    currency,
                    image_url: imageUrl,
                    url,
                    availability: status === 'ACTIVE' ? 'in stock' : 'out of stock'
                });

                if (metaSyncResult.success && metaSyncResult.data?.id) {
                    await db.eCommerceProduct.update({
                        where: { id: savedProduct.id },
                        data: {
                            externalProductId: metaSyncResult.data.id,
                            metadata: {
                                metaCatalogId: catalogId,
                                metaProductId: metaSyncResult.data.id,
                                lastSyncedAt: new Date().toISOString()
                            }
                        }
                    }).catch(() => {});
                }
            }
        }

        revalidatePath(`/workspace/${workspaceId}/konnectx/catalog`);
        return {
            data: {
                success: true,
                product: JSON.parse(JSON.stringify(savedProduct)),
                metaSynced: metaSyncResult?.success || false,
                metaError: metaSyncResult?.error || null
            }
        };

    } catch (error) {
        console.error("[saveProduct] Error:", error);
        return { error: error.message || "Failed to save product" };
    }
};

export const saveProduct = createSafeAction(SaveProductSchema, handler);
