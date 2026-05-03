'use server'

import { db } from "@/lib/db";
import { symmetricEncrypt } from "@/lib/encryption";
import { z } from "zod";

const SaveEcommerceConfigSchema = z.object({
    userId: z.string(),
    storeName: z.string().min(1).transform(val => val.toLowerCase().trim()),
    backendUrl: z.string().url(),
    apiKey: z.string().min(1),
});

export async function saveEcommerceConfig(data) {
    try {
        const validated = SaveEcommerceConfigSchema.parse(data);

        const encryptedApiKey = symmetricEncrypt(validated.apiKey);

        const existing = await db.ecommerceConfig.findFirst({
            where: {
                userId: validated.userId,
                storeName: validated.storeName,
            },
        });

        if (existing) {
            const updated = await db.ecommerceConfig.update({
                where: { id: existing.id },
                data: {
                    backendUrl: validated.backendUrl,
                    apiKey: encryptedApiKey,
                    isActive: true,
                    updatedAt: new Date(),
                },
            });
            return { success: true, data: updated };
        }

        const created = await db.ecommerceConfig.create({
            data: {
                userId: validated.userId,
                storeName: validated.storeName,
                backendUrl: validated.backendUrl,
                apiKey: encryptedApiKey,
                isActive: true,
            },
        });

        return { success: true, data: created };
    } catch (error) {
        console.error("[SAVE_ECOMMERCE_CONFIG_ERROR]", error);
        return { success: false, error: error.message || "Failed to save configuration" };
    }
}