'use server'

import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { ensureWorkspaceAccess } from "@/lib/auth-utils";
import { resolveWhatsAppCredentials } from "@/lib/whatsapp-credentials";
import * as cloudApi from '../../_lib/whatsapp-cloud-api';
import { revalidatePath } from "next/cache";

const UnlinkProfileCatalogSchema = z.object({
    workspaceId: z.string()
});

const handler = async (data) => {
    const { workspaceId } = data;

    try {
        const session = await ensureWorkspaceAccess(workspaceId);
        const userId = session.user.userId || session.user.id;

        const { credentials: decrypted } = await resolveWhatsAppCredentials({
            workspaceId,
            userId
        });

        if (!decrypted?.accessToken || !decrypted?.phoneNumberId) {
            throw new Error("WhatsApp Cloud API credentials not configured. Please check Settings.");
        }

        // Hide catalog from profile & disable in-chat cart
        const commerceRes = await cloudApi.updateCommerceSettings(decrypted, {
            is_catalog_visible: false,
            is_cart_enabled: false
        });

        if (!commerceRes.success) {
            throw new Error(commerceRes.error || "Failed to remove catalog from WhatsApp profile on Meta");
        }

        revalidatePath(`/workspace/${workspaceId}/konnectx/catalog`);

        return {
            data: {
                success: true,
                message: "Catalog storefront (🛍️) successfully removed from WhatsApp Profile"
            }
        };

    } catch (error) {
        console.error("[unlinkProfileCatalog] Error:", error);
        return { error: error.message || "Failed to remove catalog from WhatsApp profile" };
    }
};

export const unlinkProfileCatalogAction = createSafeAction(UnlinkProfileCatalogSchema, handler);
