'use server'

import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { db } from "@/lib/db";
import { ensureWorkspaceAccess } from "@/lib/auth-utils";
import { symmetricDecrypt } from "@/lib/encryption";
import * as cloudApi from '../../_lib/whatsapp-cloud-api';
import { revalidatePath } from "next/cache";

const SyncMetaCatalogSchema = z.object({
    workspaceId: z.string(),
    catalogId: z.string(),
});

const handler = async (data) => {
    const { workspaceId, catalogId } = data;

    try {
        const session = await ensureWorkspaceAccess(workspaceId);
        const userId = session.user.userId || session.user.id;

        // Resolve credentials
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

        if (!decrypted?.accessToken) throw new Error("Meta access token is missing");

        const metaProductsRes = await cloudApi.fetchCatalogProductsMeta(decrypted, catalogId);
        if (!metaProductsRes.success) throw new Error(metaProductsRes.error || "Failed to fetch products from Meta");

        const metaProducts = metaProductsRes.data || [];
        let importedCount = 0;

        for (const mp of metaProducts) {
            const rawPrice = mp.price ? String(mp.price).replace(/[^\d.]/g, '') : "0";
            const priceNum = parseFloat(rawPrice) || 0;

            const existing = await db.eCommerceProduct.findFirst({
                where: {
                    userId,
                    OR: [
                        { externalProductId: mp.id },
                        { sku: mp.retailer_id }
                    ]
                }
            });

            if (existing) {
                await db.eCommerceProduct.update({
                    where: { id: existing.id },
                    data: {
                        title: mp.name || existing.title,
                        description: mp.description || existing.description,
                        price: priceNum > 0 ? priceNum : existing.price,
                        currency: mp.currency || existing.currency,
                        imageUrls: mp.image_url ? [mp.image_url] : existing.imageUrls,
                        externalProductId: mp.id,
                        status: mp.availability === 'in stock' ? 'ACTIVE' : 'out of stock',
                        metadata: {
                            metaCatalogId: catalogId,
                            metaProductId: mp.id,
                            lastSyncedAt: new Date().toISOString()
                        }
                    }
                });
            } else {
                await db.eCommerceProduct.create({
                    data: {
                        userId,
                        title: mp.name || "Meta Product",
                        sku: mp.retailer_id || `SKU_${mp.id}`,
                        description: mp.description || "",
                        price: priceNum,
                        currency: mp.currency || "INR",
                        imageUrls: mp.image_url ? [mp.image_url] : [],
                        externalProductId: mp.id,
                        status: mp.availability === 'in stock' ? 'ACTIVE' : 'out of stock',
                        inventoryCount: 100,
                        metadata: {
                            metaCatalogId: catalogId,
                            metaProductId: mp.id,
                            lastSyncedAt: new Date().toISOString()
                        }
                    }
                });
                importedCount++;
            }
        }

        revalidatePath(`/workspace/${workspaceId}/konnectx/catalog`);
        return {
            data: {
                success: true,
                count: metaProducts.length,
                importedCount
            }
        };

    } catch (error) {
        console.error("[syncMetaCatalog] Error:", error);
        return { error: error.message || "Failed to sync catalog" };
    }
};

export const syncMetaCatalog = createSafeAction(SyncMetaCatalogSchema, handler);
