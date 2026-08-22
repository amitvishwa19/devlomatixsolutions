'use server'

import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { db } from "@/lib/db";
import { ensureWorkspaceAccess } from "@/lib/auth-utils";
import { resolveWhatsAppCredentials } from "@/lib/whatsapp-credentials";
import * as cloudApi from '../../_lib/whatsapp-cloud-api';

const GetCatalogDataSchema = z.object({
    workspaceId: z.string(),
});

const handler = async (data) => {
    const { workspaceId } = data;

    try {
        const session = await ensureWorkspaceAccess(workspaceId);
        const userId = session.user.userId || session.user.id;

        // 1. Resolve workspace members
        const workspace = await db.server.findUnique({
            where: { id: workspaceId },
            include: { members: true }
        }).catch(() => null);

        const workspaceUserIds = [
            ...new Set([
                userId,
                workspace?.userId,
                ...((workspace?.members || []).map(m => m.userId))
            ].filter(Boolean))
        ];

        // 2. Resolve Active Default Credential
        const { credential: defaultCredential, credentials: decryptedCreds } = await resolveWhatsAppCredentials({
            workspaceId,
            userId
        });

        const credsPayload = decryptedCreds ? {
            accessToken: decryptedCreds.accessToken || '',
            phoneNumberId: decryptedCreds.phoneNumberId || '',
            wabaId: decryptedCreds.wabaId || '',
            businessId: decryptedCreds.businessId || decryptedCreds.wabaId || ''
        } : null;

        // 3. Fetch Commerce Settings & Catalogs from Meta
        let commerceSettings = null;
        let metaCatalogs = [];

        if (credsPayload?.accessToken && credsPayload?.phoneNumberId) {
            const [settingsRes, catalogsRes] = await Promise.all([
                cloudApi.getCommerceSettings(credsPayload).catch(() => ({ success: false })),
                cloudApi.fetchAssignedCatalogs(credsPayload).catch(() => ({ success: false }))
            ]);

            if (settingsRes.success) {
                commerceSettings = settingsRes.data;
            }
            if (catalogsRes.success && Array.isArray(catalogsRes.data)) {
                metaCatalogs = catalogsRes.data;
            }
        }

        // 4. Fetch Local Products & Stores
        const [localProducts, localStores] = await Promise.all([
            db.eCommerceProduct.findMany({
                where: { userId: { in: workspaceUserIds } },
                orderBy: { updatedAt: 'desc' }
            }).catch(() => []),
            db.eCommerceStore.findMany({
                where: { userId: { in: workspaceUserIds } }
            }).catch(() => [])
        ]);

        // 5. Fetch details for commerceSettings.catalog_id from Meta if needed
        if (commerceSettings?.catalog_id && credsPayload?.accessToken) {
            const existingCat = metaCatalogs.find(c => c.id === commerceSettings.catalog_id);
            if (!existingCat) {
                const detailsRes = await cloudApi.fetchCatalogDetailsMeta(credsPayload, commerceSettings.catalog_id).catch(() => null);
                if (detailsRes?.success && detailsRes.data?.id) {
                    metaCatalogs.unshift(detailsRes.data);
                }
            } else if (existingCat.name?.startsWith('Workspace Catalog')) {
                const detailsRes = await cloudApi.fetchCatalogDetailsMeta(credsPayload, commerceSettings.catalog_id).catch(() => null);
                if (detailsRes?.success && detailsRes.data?.name) {
                    existingCat.name = detailsRes.data.name;
                    if (detailsRes.data.product_count !== undefined) existingCat.product_count = detailsRes.data.product_count;
                }
            }
        }

        // 6. Add local stores as selectable catalogs
        localStores.forEach(s => {
            if (s.id && !metaCatalogs.some(c => c.id === s.id || c.name === s.name)) {
                const count = localProducts.filter(p => p.storeId === s.id).length;
                metaCatalogs.push({
                    id: s.id,
                    name: s.name || 'E-Commerce Store',
                    product_count: count,
                    isStore: true
                });
            }
        });

        // 7. Aggregate all created/known catalogs from local products
        const discoveredCatalogIds = new Set();
        localProducts.forEach(p => {
            if (p.metadata?.metaCatalogId) discoveredCatalogIds.add(p.metadata.metaCatalogId);
            if (p.metadata?.catalogId) discoveredCatalogIds.add(p.metadata.catalogId);
        });
        if (commerceSettings?.catalog_id) {
            discoveredCatalogIds.add(commerceSettings.catalog_id);
        }

        discoveredCatalogIds.forEach(id => {
            if (id && !metaCatalogs.some(c => c.id === id)) {
                const matchingProducts = localProducts.filter(p => p.metadata?.metaCatalogId === id || p.metadata?.catalogId === id);
                const sampleProduct = matchingProducts[0];
                const catName = sampleProduct?.metadata?.catalogName || sampleProduct?.metadata?.metaCatalogName || `Workspace Catalog (${id})`;
                metaCatalogs.push({
                    id,
                    name: catName,
                    product_count: matchingProducts.length || undefined,
                    isLocal: true
                });
            }
        });

        // 8. If products exist with distinct titles or custom SKU/IDs (like 'hhhh'), ensure they appear as selectable product catalogs
        localProducts.forEach(p => {
            const prodIdentifier = p.metadata?.metaCatalogId || p.sku || p.externalProductId || p.id;
            if (prodIdentifier && !metaCatalogs.some(c => c.id === prodIdentifier || c.name === p.title)) {
                metaCatalogs.push({
                    id: prodIdentifier,
                    name: p.title || 'Product Catalog',
                    product_count: 1,
                    isProductCatalog: true
                });
            }
        });

        // 9. Compute Stats & Active Catalog Resolution
        const fallbackCatalogId = localProducts.find(p => p.metadata?.metaCatalogId)?.metadata?.metaCatalogId || null;
        const resolvedCatalogId = commerceSettings?.catalog_id || (metaCatalogs[0]?.id || fallbackCatalogId || null);

        const totalProducts = localProducts.length;
        const inStockCount = localProducts.filter(p => p.status === 'ACTIVE' || p.status === 'in stock' || (p.inventoryCount && p.inventoryCount > 0)).length;
        const totalOrders = await db.eCommerceOrder.count({
            where: { userId: { in: workspaceUserIds } }
        }).catch(() => 0);

        return {
            data: {
                success: true,
                hasCredentials: !!credsPayload?.accessToken,
                activePhoneId: credsPayload?.phoneNumberId || '',
                activeWabaId: credsPayload?.wabaId || '',
                profile: defaultCredential?.profile || 'Default Account',
                commerceSettings: commerceSettings || {
                    is_catalog_visible: false,
                    is_cart_enabled: false,
                    catalog_id: resolvedCatalogId
                },
                metaCatalogs,
                products: JSON.parse(JSON.stringify(localProducts)),
                stats: {
                    totalProducts,
                    inStockCount,
                    totalOrders,
                    activeCatalogId: resolvedCatalogId
                }
            }
        };

    } catch (error) {
        console.error("[getCatalogData] Error:", error);
        return { error: error.message || "Failed to load catalog data" };
    }
};

export const getCatalogData = createSafeAction(GetCatalogDataSchema, handler);
