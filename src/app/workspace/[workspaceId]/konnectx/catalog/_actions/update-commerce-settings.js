'use server'

import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { db } from "@/lib/db";
import { ensureWorkspaceAccess } from "@/lib/auth-utils";
import { resolveWhatsAppCredentials } from "@/lib/whatsapp-credentials";
import * as cloudApi from '../../_lib/whatsapp-cloud-api';
import { revalidatePath } from "next/cache";

const UpdateCommerceSettingsSchema = z.object({
    workspaceId: z.string(),
    catalog_id: z.string().optional(),
    is_catalog_visible: z.boolean().optional(),
    is_cart_enabled: z.boolean().optional(),
});

const handler = async (data) => {
    const { workspaceId, catalog_id, is_catalog_visible, is_cart_enabled } = data;

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

        const updateRes = await cloudApi.updateCommerceSettings(decrypted, {
            catalog_id,
            is_catalog_visible,
            is_cart_enabled
        });

        if (!updateRes.success) {
            throw new Error(updateRes.error || "Failed to update Meta Commerce settings");
        }

        revalidatePath(`/workspace/${workspaceId}/konnectx/catalog`);
        return {
            data: {
                success: true,
                settings: updateRes.data
            }
        };

    } catch (error) {
        console.error("[updateCommerceSettings] Error:", error);
        return { error: error.message || "Failed to update commerce settings" };
    }
};

export const updateCommerceSettingsAction = createSafeAction(UpdateCommerceSettingsSchema, handler);
