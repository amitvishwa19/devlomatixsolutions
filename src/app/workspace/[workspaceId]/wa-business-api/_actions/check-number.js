'use server'

import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { waManager } from "../../wa-api_delete/_lib/whatsapp-v2";
import { db } from "@/lib/db";

const CheckNumberSchema = z.object({
    phone: z.string(),
    workspaceId: z.string(),
});

const handler = async (data) => {
    const { phone, workspaceId } = data;

    try {
        const result = await waManager.checkNumber(phone);

        // If the number exists on WhatsApp, persist verified=true to the DB contact record
        if (result.exists) {
            const cleanPhone = phone.replace(/[^\d+]/g, '');
            // Try to find a matching contact in this workspace and update it
            const contact = await db.contact.findFirst({
                where: { workspaceId, phone: { contains: cleanPhone.slice(-9) } }
            });
            if (contact) {
                await db.contact.update({
                    where: { id: contact.id },
                    data: {
                        verified: true,
                        ...(result.name ? { whatsappName: result.name } : {}),
                    }
                });
            }
        }

        return { data: result };
    } catch (error) {
        console.error('[WA_BUSINESS_CHECK_NUMBER]', error);
        return { error: error.message || "Failed to check number" };
    }
};

export const checkNumber = createSafeAction(CheckNumberSchema, handler);
