'use server'

import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { ensureWorkspaceAccess } from "@/lib/auth-utils";
import { resolveWhatsAppCredentials } from "@/lib/whatsapp-credentials";
import * as cloudApi from '../../_lib/whatsapp-cloud-api';
import { revalidatePath } from "next/cache";

const LinkProfileCatalogSchema = z.object({
    workspaceId: z.string(),
    catalogId: z.string().min(1, "Meta Catalog ID is required"),
    isCatalogVisible: z.boolean().default(true),
    isCartEnabled: z.boolean().default(true),
    businessDescription: z.string().optional(),
    businessWebsite: z.string().optional()
});

const handler = async (data) => {
    const { workspaceId, catalogId, isCatalogVisible, isCartEnabled, businessDescription, businessWebsite } = data;

    try {
        const session = await ensureWorkspaceAccess(workspaceId);
        const userId = session.user.userId || session.user.id;

        const { credentials: decrypted } = await resolveWhatsAppCredentials({
            workspaceId,
            userId
        });

        if (!decrypted?.accessToken || !decrypted?.phoneNumberId) {
            throw new Error("WhatsApp Cloud API credentials not configured or missing Meta Access Token / Phone Number ID. Please check Settings.");
        }

        const results = {
            wabaAssigned: false,
            commerceSettingsUpdated: false,
            businessProfileUpdated: false,
            catalogId
        };

        // Step 1: Assign Catalog to WABA (if WABA ID exists)
        if (decrypted.wabaId) {
            const assignRes = await cloudApi.assignCatalogToWaba(decrypted, catalogId);
            results.wabaAssigned = assignRes.success;
        }

        // Step 2: Update WhatsApp Commerce Settings (make visible on profile & enable cart)
        const commerceRes = await cloudApi.updateCommerceSettings(decrypted, {
            catalog_id: catalogId,
            is_catalog_visible: isCatalogVisible,
            is_cart_enabled: isCartEnabled
        });

        if (!commerceRes.success) {
            throw new Error(commerceRes.error || "Failed to update WhatsApp Commerce settings on Meta");
        }
        results.commerceSettingsUpdated = true;

        // Step 3: Update WhatsApp Business Profile (Set category to RETAIL & website/description)
        const profilePayload = {
            vertical: "RETAIL"
        };
        if (businessDescription) profilePayload.description = businessDescription.trim();
        if (businessWebsite) profilePayload.websites = [businessWebsite.trim()];

        const profileRes = await cloudApi.updateWhatsAppBusinessProfile(decrypted, profilePayload);
        results.businessProfileUpdated = profileRes.success;

        revalidatePath(`/workspace/${workspaceId}/konnectx/catalog`);

        return {
            data: {
                success: true,
                message: "Catalog successfully linked and activated on WhatsApp Business Profile!",
                results
            }
        };

    } catch (error) {
        console.error("[linkProfileCatalog] Error:", error);
        return { error: error.message || "Failed to link catalog to WhatsApp profile" };
    }
};

export const linkProfileCatalogAction = createSafeAction(LinkProfileCatalogSchema, handler);
