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

        // 4. Fetch Local Products
        const localProducts = await db.eCommerceProduct.findMany({
            where: {
                userId: { in: workspaceUserIds }
            },
            orderBy: { updatedAt: 'desc' }
        }).catch(() => []);

        // 5. Compute Stats & Active Catalog Resolution
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
