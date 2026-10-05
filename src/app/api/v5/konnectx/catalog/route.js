import { db } from "@/lib/db";
import {
    fetchAssignedCatalogs,
    fetchCatalogDetailsMeta,
    fetchCatalogProductsMeta,
    getCommerceSettings
} from "@/lib/whatsapp-cloud-api";
import { getWhatsAppAccount, ok, created, fail, requireUserId } from "../_lib/helpers";

export const dynamic = "force-dynamic";

/**
 * GET /api/v5/konnectx/catalog
 *
 * Mirrors the web `getCatalogData` action so the mobile catalog screen sees
 * the same shape: local products, the catalogs Meta has assigned to the WABA,
 * commerce settings and headline stats — in a single round-trip.
 */
export async function GET(request) {
    try {
        const userId = await requireUserId(request);
        const account = await getWhatsAppAccount(request, userId);

        const [localProducts, localStores, totalOrders, credentialRows] = await Promise.all([
            db.eCommerceProduct.findMany({
                where: { userId },
                orderBy: { updatedAt: "desc" }
            }),
            db.eCommerceStore.findMany({ where: { userId } }),
            db.eCommerceOrder.count({ where: { userId } }).catch(() => 0),
            db.credentials.findMany({
                where: { userId, platform: "WHATSAPP_CLOUD" },
                select: { id: true, profile: true, isDefault: true, status: true },
                orderBy: [{ isDefault: "desc" }, { updatedAt: "desc" }]
            })
        ]);

        let commerceSettings = null;
        let metaCatalogs = [];

        if (account.accessToken && account.phoneNumberId) {
            const [settingsRes, catalogsRes] = await Promise.all([
                getCommerceSettings(account).catch(() => ({ success: false })),
                fetchAssignedCatalogs(account).catch(() => ({ success: false }))
            ]);

            if (settingsRes?.success) commerceSettings = settingsRes.data;
            if (catalogsRes?.success && Array.isArray(catalogsRes.data)) {
                metaCatalogs = catalogsRes.data;
            }
        }

        // Surface the catalog the WABA actually points at, even when the
        // assigned-catalogs call did not list it.
        if (commerceSettings?.catalog_id && account.accessToken) {
            const known = metaCatalogs.find((c) => c.id === commerceSettings.catalog_id);
            if (!known) {
                const details = await fetchCatalogDetailsMeta(
                    account,
                    commerceSettings.catalog_id
                ).catch(() => null);
                if (details?.success && details.data?.id) {
                    metaCatalogs.unshift(details.data);
                }
            }
        }

        // Local stores double as selectable catalogs on the mobile picker.
        for (const store of localStores) {
            if (!metaCatalogs.some((c) => c.id === store.id)) {
                metaCatalogs.push({
                    id: store.id,
                    name: store.name || "E-Commerce Store",
                    product_count: localProducts.filter((p) => p.storeId === store.id).length,
                    isStore: true
                });
            }
        }

        const inStockCount = localProducts.filter(
            (p) =>
                p.status === "ACTIVE" ||
                p.status === "in stock" ||
                (p.inventoryCount && p.inventoryCount > 0)
        ).length;

        const activeCatalogId =
            commerceSettings?.catalog_id ||
            localProducts.find((p) => p.metadata?.metaCatalogId)?.metadata?.metaCatalogId ||
            metaCatalogs[0]?.id ||
            null;

        return ok({
            hasCredentials: !!account.accessToken,
            profile: account.profile || "Default Account",
            activePhoneId: account.phoneNumberId || "",
            activeWabaId: account.wabaId || "",
            credentialId: account.credentialId,
            credentials: credentialRows,
            commerceSettings: commerceSettings || {
                is_catalog_visible: false,
                is_cart_enabled: false,
                catalog_id: activeCatalogId
            },
            metaCatalogs,
            products: localProducts,
            stats: {
                totalProducts: localProducts.length,
                inStockCount,
                totalOrders,
                activeCatalogId
            }
        });
    } catch (error) {
        if (error?.status) throw error;
        console.error("[konnectx/catalog] GET failed:", error);
        return fail(error.message || "Failed to load catalog", 500);
    }
}

/**
 * POST /api/v5/konnectx/catalog
 *
 * Imports every product from a linked Meta catalog into the local catalogue.
 * Idempotent: products are matched on `externalProductId`, so re-running
 * refreshes prices and images instead of creating duplicates.
 */
export async function POST(request) {
    try {
        const userId = await requireUserId(request);
        const body = await request.json().catch(() => ({}));
        const account = await getWhatsAppAccount(request, userId);

        if (!account.accessToken) {
            return fail("No WhatsApp Cloud account connected", 400);
        }

        let catalogId = body.catalogId || null;

        // Fall back to whatever catalog the WABA currently points at.
        if (!catalogId && account.phoneNumberId) {
            const settingsRes = await getCommerceSettings(account).catch(() => null);
            if (settingsRes?.success) catalogId = settingsRes.data?.catalog_id || null;
        }

        if (!catalogId) {
            return fail("No Meta catalog is linked to this WABA", 400);
        }

        const result = await fetchCatalogProductsMeta(account, catalogId);
        if (!result?.success) {
            return fail(result?.error || "Failed to fetch products from Meta", 502);
        }

        const metaProducts = result.data || [];
        let imported = 0;
        let refreshed = 0;

        for (const metaProduct of metaProducts) {
            if (!metaProduct?.id) continue;

            // Meta returns price in the currency's minor unit.
            const price =
                typeof metaProduct.price === "number" ? metaProduct.price / 100 : 0;

            const payload = {
                externalProductId: String(metaProduct.id),
                title: metaProduct.name || "Untitled product",
                description: metaProduct.description || null,
                price,
                currency: (metaProduct.currency || "INR").toUpperCase(),
                imageUrls: metaProduct.image_url ? [metaProduct.image_url] : [],
                status: metaProduct.availability === "out of stock" ? "out of stock" : "ACTIVE",
                metadata: { ...(metaProduct || {}), metaCatalogId: catalogId }
            };

            const existing = await db.eCommerceProduct.findFirst({
                where: { externalProductId: String(metaProduct.id) },
                select: { id: true }
            });

            if (existing) {
                await db.eCommerceProduct.update({ where: { id: existing.id }, data: payload });
                refreshed += 1;
            } else {
                await db.eCommerceProduct.create({ data: { ...payload, userId } });
                imported += 1;
            }
        }

        return created({ imported, refreshed, total: metaProducts.length });
    } catch (error) {
        if (error?.status) throw error;
        console.error("[konnectx/catalog] POST failed:", error);
        return fail(error.message || "Failed to import catalog", 500);
    }
}