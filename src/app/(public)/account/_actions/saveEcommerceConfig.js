'use server'

import { db } from "@/lib/db";
import { symmetricEncrypt } from "@/lib/encryption";
import { z } from "zod";

const SaveEcommerceConfigSchema = z.object({
    storeName: z.string().min(1).transform(val => val.toLowerCase().trim()),
    storeId: z.string().min(1).optional(),
    webhookUrl: z.string().url().optional(),
    backendUrl: z.string().url().optional(),
    apiKey: z.string().min(1),
}).transform((data) => ({
    storeName: data.storeName,
    storeId: data.storeId,
    webhookUrl: data.webhookUrl || data.backendUrl || "",
    apiKey: data.apiKey,
}));

export async function saveEcommerceConfig(data) {
    try {
        const validated = SaveEcommerceConfigSchema.parse(data);
        const appIdentifier = process.env.ENCRYPTION_KEY;

        if (!appIdentifier) {
            return { success: false, error: "App identifier not configured" };
        }

        if (!validated.webhookUrl) {
            return { success: false, error: "Webhook URL is required" };
        }

        const encryptedApiKey = symmetricEncrypt(validated.apiKey);

        const existing = await db.ecommerceConfig.findFirst({
            where: {
                appIdentifier: appIdentifier,
            },
        });

        if (existing) {
            const updated = await db.ecommerceConfig.update({
                where: { id: existing.id },
                data: {
                    storeName: validated.storeName,
                    storeId: validated.storeId || "",
                    webhookUrl: validated.webhookUrl,
                    apiKey: encryptedApiKey,
                    isActive: true,
                    updatedAt: new Date(),
                },
            });
            return { success: true, data: updated };
        }

        const created = await db.ecommerceConfig.create({
            data: {
                appIdentifier: appIdentifier,
                storeName: validated.storeName,
                storeId: validated.storeId || "",
                webhookUrl: validated.webhookUrl,
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