import { getCommerceSettings, updateCommerceSettings } from "@/lib/whatsapp-cloud-api";
import { getWhatsAppAccount, canSend, created, fail, requireUserId } from "../../_lib/helpers";

export const dynamic = "force-dynamic";

/**
 * POST /api/v5/konnectx/catalog/unlink
 *
 * Hides the linked catalog from WhatsApp without removing it from the
 * WABA — reversible via /catalog/link.
 */
export async function POST(request) {
    try {
        const userId = await requireUserId(request);
        const body = await request.json().catch(() => ({}));

        const account = await getWhatsAppAccount(request, userId);
        if (!canSend(account)) {
            return fail("No WhatsApp Cloud account is connected", 400);
        }

        const current = await getCommerceSettings(account);
        const catalogId = body.catalogId || (current?.success ? current.data?.catalog_id : null);

        const result = await updateCommerceSettings(account, {
            is_catalog_visible: false,
            is_cart_enabled: false,
            catalog_id: catalogId || undefined
        });

        if (!result?.success) {
            return fail(result?.error || "Failed to hide the catalog", 502);
        }

        return created({ catalogId, settings: result.data });
    } catch (error) {
        if (error?.status) throw error;
        console.error("[konnectx/catalog/unlink] failed:", error);
        return fail(error.message || "Failed to unlink the catalog", 500);
    }
}