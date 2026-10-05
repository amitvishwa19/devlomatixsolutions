import {
    assignCatalogToWaba,
    getCommerceSettings,
    updateCommerceSettings
} from "@/lib/whatsapp-cloud-api";
import { getWhatsAppAccount, canSend, created, fail, requireUserId } from "../../_lib/helpers";

export const dynamic = "force-dynamic";

/**
 * POST /api/v5/konnectx/catalog/link
 *
 * Links a Meta product catalog to the caller's WABA and makes it visible.
 * Reports which of the two Meta calls succeeded so the UI can be precise
 * about a partial failure.
 */
export async function POST(request) {
    try {
        const userId = await requireUserId(request);
        const body = await request.json().catch(() => ({}));
        const { catalogId, isCatalogVisible = true, isCartEnabled = false } = body;

        if (!catalogId) return fail("catalogId is required", 400);

        const account = await getWhatsAppAccount(request, userId);
        if (!canSend(account)) {
            return fail("No WhatsApp Cloud account is connected", 400);
        }
        if (!account.wabaId) {
            return fail("The connected account has no WhatsApp Business Account ID", 400);
        }

        const assigned = await assignCatalogToWaba(account, catalogId);
        if (!assigned?.success) {
            return fail(assigned?.error || "Failed to assign the catalog to the WABA", 502);
        }

        let settings = null;
        let settingsError = null;
        try {
            const current = await getCommerceSettings(account);
            const updated = await updateCommerceSettings(account, {
                is_catalog_visible: isCatalogVisible,
                is_cart_enabled: isCartEnabled,
                catalog_id:
                    catalogId ||
                    (current?.success ? current.data?.catalog_id : undefined)
            });
            if (updated?.success) {
                settings = updated.data;
            } else {
                settingsError = updated?.error || "Failed to update commerce settings";
            }
        } catch (error) {
            settingsError = error.message;
        }

        return created({ catalogId, wabaId: account.wabaId, settings, settingsError });
    } catch (error) {
        if (error?.status) throw error;
        console.error("[konnectx/catalog/link] failed:", error);
        return fail(error.message || "Failed to link the catalog", 500);
    }
}