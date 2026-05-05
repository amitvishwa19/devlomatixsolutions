'use server'

import { db } from "@/lib/db";
import { symmetricDecrypt } from "@/lib/encryption";

export async function getEcommerceConfig() {
    try {
        const appIdentifier = process.env.ENCRYPTION_KEY;
        
        if (!appIdentifier) {
            return { success: false, error: "App identifier not configured" };
        }

        const config = await db.ecommerceConfig.findFirst({
            where: {
                appIdentifier: appIdentifier,
                isActive: true,
            },
            orderBy: { updatedAt: 'desc' },
        });

        if (!config) {
            return { success: true, data: null };
        }

        const decryptedConfig = {
            ...config,
            apiKey: symmetricDecrypt(config.apiKey),
        };

        return { success: true, data: decryptedConfig };
    } catch (error) {
        console.error("[GET_ECOMMERCE_CONFIG_ERROR]", error);
        return { success: false, error: "Failed to fetch configuration" };
    }
}