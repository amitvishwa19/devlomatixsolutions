import { getCommerceSettings, updateCommerceSettings } from "@/lib/whatsapp-cloud-api";
import { getWhatsAppAccount, ok, created, fail, requireUserId } from "../../_lib/helpers";

export const dynamic = "force-dynamic";

/** GET /api/v5/konnectx/catalog/commerce-settings */
export async function GET(request) {
    try {
        const userId = await requireUserId(request);
        const account = await getWhatsAppAccount(request, userId);

        if (!account.accessToken) {
            return fail("No WhatsApp Cloud account connected", 400);
        }
        if (!account.phoneNumberId) {
            return fail("The connected account has no phone number ID", 400);
        }

        const result = await getCommerceSettings(account);
        if (!result?.success) {
            return fail(result?.error || "Failed to read commerce settings", 502);
        }

        return ok(result.data);
    } catch (error) {
        if (error?.status) throw error;
        console.error("[konnectx/catalog/commerce-settings] GET failed:", error);
        return fail(error.message || "Failed to read commerce settings", 500);
    }
}

/**
 * POST /api/v5/konnectx/catalog/commerce-settings
 *
 * Body accepts `is_catalog_visible`, `is_cart_enabled` and `catalog_id`.
 */
export async function POST(request) {
    try {
        const userId = await requireUserId(request);
        const body = await request.json().catch(() => ({}));

        const account = await getWhatsAppAccount(request, userId);
        if (!account.accessToken || !account.phoneNumberId) {
            return fail("No WhatsApp Cloud account with a phone number is connected", 400);
        }

        const result = await updateCommerceSettings(account, {
            is_catalog_visible: body.is_catalog_visible,
            is_cart_enabled: body.is_cart_enabled,
            catalog_id: body.catalog_id
        });

        if (!result?.success) {
            return fail(result?.error || "Failed to update commerce settings", 502);
        }

        return created(result.data);
    } catch (error) {
        if (error?.status) throw error;
        console.error("[konnectx/catalog/commerce-settings] POST failed:", error);
        return fail(error.message || "Failed to update commerce settings", 500);
    }
}