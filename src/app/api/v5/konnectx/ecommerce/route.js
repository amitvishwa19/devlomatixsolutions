import { db } from "@/lib/db";
import {
    ok,
    created,
    fail,
    requireUserId,
    assertOwned,
    encryptSecret,
    toPublicStore,
    SECRET_FIELDS
} from "../_lib/helpers";

export const dynamic = "force-dynamic";

/**
 * GET /api/v5/konnectx/ecommerce
 *
 * Lists the caller's stores with product/order/abandoned-cart counts.
 * Credentials are reduced to booleans so a leaked response cannot expose them.
 */
export async function GET(request) {
    try {
        const userId = await requireUserId(request);

        const stores = await db.eCommerceStore.findMany({
            where: { userId },
            include: {
                _count: {
                    select: { orders: true, products: true, abandonedCarts: true }
                }
            },
            orderBy: { createdAt: "desc" }
        });

        return ok({ stores: stores.map(toPublicStore) });
    } catch (error) {
        if (error?.status) throw error;
        console.error("[konnectx/ecommerce] GET failed:", error);
        return fail(error.message || "Failed to fetch stores", 500);
    }
}

/**
 * POST /api/v5/konnectx/ecommerce
 *
 * Creates a store, or updates the existing one when `id` is supplied.
 * `apiKey` / `apiSecret` / `accessToken` are encrypted before they hit the
 * database and are never echoed back.
 */
export async function POST(request) {
    try {
        const userId = await requireUserId(request);
        const { searchParams } = new URL(request.url);
        const body = await request.json().catch(() => ({}));
        const workspaceId = body.workspaceId || searchParams.get("workspaceId") || null;

        const {
            id,
            name,
            platform = "manual",
            storeUrl,
            description,
            currency = "INR",
            timezone = "Asia/Kolkata",
            isDefault = false
        } = body;

        // Secrets are read straight off `body` below so they are never bound
        // to a named variable that could be logged or echoed back.

        if (!name || !String(name).trim()) {
            return fail("Store name is required", 400);
        }

        const slug = String(name)
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "");

        const data = {
            name: String(name).trim(),
            platform,
            storeUrl: storeUrl || "",
            description: description || null,
            currency,
            timezone,
            isDefault
        };

        for (const field of SECRET_FIELDS) {
            if (body[field] !== undefined) data[field] = encryptSecret(body[field]) || null;
        }

        let store;
        let isNew = false;

        if (id) {
            await assertOwned("eCommerceStore", id, userId, "Store");
            store = await db.eCommerceStore.update({ where: { id }, data });
        } else {
            isNew = true;
            store = await db.eCommerceStore.create({
                data: { ...data, slug, userId, status: "connected" }
            });
        }

        // Only one store can be the default.
        if (isDefault) {
            await db.eCommerceStore.updateMany({
                where: { userId, NOT: { id: store.id } },
                data: { isDefault: false }
            });
        }

        // Give the store a matching category so products can be grouped.
        let category = null;
        let categoryError = null;
        if (isNew && workspaceId) {
            try {
                category = await db.category.create({
                    data: {
                        name: store.name,
                        slug: `${store.slug}-category`,
                        type: "GENERAL",
                        color: "#3b82f6",
                        workspaceId,
                        storeId: store.id
                    }
                });
            } catch (error) {
                categoryError = error.message;
            }
        }

        return created({
            store: toPublicStore(store),
            category,
            categoryError
        });
    } catch (error) {
        if (error?.status) throw error;
        console.error("[konnectx/ecommerce] POST failed:", error);
        return fail(error.message || "Failed to save store", 500);
    }
}

/**
 * DELETE /api/v5/konnectx/ecommerce?id=...
 *
 * Cascades to the store's products, orders and categories.
 */
export async function DELETE(request) {
    try {
        const userId = await requireUserId(request);
        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");

        if (!id) return fail("Store id is required", 400);

        await assertOwned("eCommerceStore", id, userId, "Store");
        await db.eCommerceStore.delete({ where: { id } });

        return created({ id });
    } catch (error) {
        if (error?.status) throw error;
        console.error("[konnectx/ecommerce] DELETE failed:", error);
        return fail(error.message || "Failed to delete store", 500);
    }
}