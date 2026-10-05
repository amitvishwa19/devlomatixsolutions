import {
    sendCatalogInteractiveMessage,
    sendProductInteractiveMessage
} from "@/lib/whatsapp-cloud-api";
import { getWhatsAppAccount, canSend, created, fail, requireUserId } from "../../_lib/helpers";

export const dynamic = "force-dynamic";

/**
 * POST /api/v5/konnectx/catalog/send
 *
 * Sends either a single-product message (`type: "product"`) or a catalog
 * browse message (`type: "catalog"`) over WhatsApp.
 */
export async function POST(request) {
    try {
        const userId = await requireUserId(request);
        const body = await request.json().catch(() => ({}));
        const { to, type = "catalog", catalogId, retailerId, bodyText, footerText } = body;

        if (!to) return fail("A recipient phone number is required", 400);

        const account = await getWhatsAppAccount(request, userId);
        if (!canSend(account)) {
            return fail("No WhatsApp Cloud account is connected", 400);
        }

        let result;
        if (type === "product") {
            if (!catalogId || !retailerId) {
                return fail("catalogId and retailerId are required to send a product", 400);
            }
            result = await sendProductInteractiveMessage(account, to, {
                catalogId,
                retailerId,
                bodyText,
                footerText
            });
        } else {
            result = await sendCatalogInteractiveMessage(account, to, { bodyText, footerText });
        }

        if (!result?.success) {
            return fail(result?.error || "Failed to send catalog message", 502);
        }

        return created(result.data);
    } catch (error) {
        if (error?.status) throw error;
        console.error("[konnectx/catalog/send] failed:", error);
        return fail(error.message || "Failed to send catalog message", 500);
    }
}