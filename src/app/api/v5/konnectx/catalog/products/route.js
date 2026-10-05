import { db } from "@/lib/db";
import { createCatalogProductMeta, deleteCatalogProductMeta, getCommerceSettings } from "@/lib/whatsapp-cloud-api";
import { getWhatsAppAccount, paged, created, fail, requireUserId, assertOwned } from "../../_lib/helpers";

export const dynamic = "force-dynamic";

/** GET /api/v5/konnectx/catalog/products — paginated local products. */
export async function GET(request) {
    try {
        const userId = await requireUserId(request);
        const { searchParams } = new URL(request.url);

        const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
        const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "50", 10)));
        const search = (searchParams.get("search") || "").trim();
        const storeId = searchParams.get("storeId");

        const where = {
            userId,
            ...(storeId ? { storeId } : {}),
            ...(search
                ? {
                    OR: [
                        { title: { contains: search, mode: "insensitive" } },
                        { description: { contains: search, mode: "insensitive" } },
                        { sku: { contains: search, mode: "insensitive" } }
                    ]
                }
                : {})
        };

        const [products, total] = await Promise.all([
            db.eCommerceProduct.findMany({
                where,
                orderBy: { updatedAt: "desc" },
                skip: (page - 1) * limit,
                take: limit
            }),
            db.eCommerceProduct.count({ where })
        ]);

        return paged(products, { page, limit, total });
    } catch (error) {
        if (error?.status) throw error;
        console.error("[konnectx/catalog/products] GET failed:", error);
        return fail(error.message || "Failed to fetch products", 500);
    }
}

function slugify(value) {
    return String(value || "")
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 60);
}

/**
 * POST /api/v5/konnectx/catalog/products
 *
 * Saves a product locally and, when a Meta catalog is linked, mirrors it to
 * Meta. A Meta failure does not discard the local save — the response reports
 * both outcomes so the app can show "saved locally, sync failed".
 */
export async function POST(request) {
    try {
        const userId = await requireUserId(request);
        const body = await request.json().catch(() => ({}));

        const {
            id,
            title,
            description,
            price,
            currency = "INR",
            sku,
            storeId,
            inventoryCount,
            imageUrls,
            status = "ACTIVE",
            metaCatalogId
        } = body;

        if (!title || !String(title).trim()) {
            return fail("Product title is required", 400);
        }
        const numericPrice = Number(price);
        if (!Number.isFinite(numericPrice) || numericPrice < 0) {
            return fail("A valid non-negative price is required", 400);
        }

        let slug = slugify(title);
        if (slug) {
            const taken = await db.eCommerceProduct.findFirst({
                where: { slug, ...(id ? { NOT: { id } } : {}) },
                select: { id: true }
            });
            if (taken) slug = `${slug}-${Date.now().toString(36)}`;
        }

        const data = {
            title: String(title).trim(),
            description: description || null,
            price: numericPrice,
            currency: String(currency || "INR").toUpperCase(),
            sku: sku || null,
            slug: slug || null,
            storeId: storeId || null,
            inventoryCount:
                inventoryCount === undefined || inventoryCount === null
                    ? null
                    : Number(inventoryCount),
            imageUrls: Array.isArray(imageUrls) ? imageUrls : [],
            status
        };

        let product;
        if (id) {
            await assertOwned("eCommerceProduct", id, userId, "Product");
            product = await db.eCommerceProduct.update({ where: { id }, data });
        } else {
            product = await db.eCommerceProduct.create({ data: { ...data, userId } });
        }

        // Best-effort mirror to Meta.
        let metaSynced = false;
        let metaError = null;

        const account = await getWhatsAppAccount(request, userId);
        if (account.accessToken) {
            let catalogId = metaCatalogId || null;
            if (!catalogId && account.phoneNumberId) {
                const settingsRes = await getCommerceSettings(account).catch(() => null);
                if (settingsRes?.success) catalogId = settingsRes.data?.catalog_id || null;
            }

            if (catalogId) {
                const result = await createCatalogProductMeta(account, catalogId, {
                    name: data.title,
                    description: data.description || data.title,
                    price: data.price,
                    currency: data.currency,
                    sku: data.sku,
                    image_url: data.imageUrls?.[0],
                    availability: data.status === "out of stock" ? "out of stock" : "in stock"
                }).catch((error) => ({ success: false, error: error.message }));

                if (result?.success) {
                    metaSynced = true;
                    const metaId = result.data?.id ? String(result.data.id) : null;
                    if (metaId) {
                        product = await db.eCommerceProduct.update({
                            where: { id: product.id },
                            data: {
                                externalProductId: metaId,
                                metadata: { metaCatalogId: catalogId }
                            }
                        });
                    }
                } else {
                    metaError = result?.error || "Failed to sync product to Meta";
                }
            }
        }

        return created({ product, metaSynced, metaError });
    } catch (error) {
        if (error?.status) throw error;
        console.error("[konnectx/catalog/products] POST failed:", error);
        return fail(error.message || "Failed to save product", 500);
    }
}

/**
 * DELETE /api/v5/konnectx/catalog/products?id=...
 *
 * Removes the product from Meta (when linked) and the local catalogue.
 */
export async function DELETE(request) {
    try {
        const userId = await requireUserId(request);
        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");

        if (!id) return fail("Product id is required", 400);

        await assertOwned("eCommerceProduct", id, userId, "Product");

        const product = await db.eCommerceProduct.findUnique({
            where: { id },
            select: { externalProductId: true }
        });

        let metaDeleted = false;
        let metaError = null;

        if (product?.externalProductId) {
            const account = await getWhatsAppAccount(request, userId);
            if (account.accessToken) {
                const result = await deleteCatalogProductMeta(
                    account,
                    product.externalProductId
                ).catch((error) => ({ success: false, error: error.message }));

                metaDeleted = !!result?.success;
                metaError = result?.success ? null : result?.error || "Failed to delete from Meta";
            }
        }

        await db.eCommerceProduct.delete({ where: { id } });

        return created({ id, metaDeleted, metaError });
    } catch (error) {
        if (error?.status) throw error;
        console.error("[konnectx/catalog/products] DELETE failed:", error);
        return fail(error.message || "Failed to delete product", 500);
    }
}