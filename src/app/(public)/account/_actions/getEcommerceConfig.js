'use server'

import { db } from "@/lib/db";
import { symmetricDecrypt } from "@/lib/encryption";

export async function getEcommerceConfig(userId) {
    try {
        const configs = await db.ecommerceConfig.findMany({
            where: {
                userId,
                isActive: true,
            },
            orderBy: { updatedAt: 'desc' },
        });

        const decryptedConfigs = configs.map(config => ({
            ...config,
            apiKey: symmetricDecrypt(config.apiKey),
        }));

        return { success: true, data: decryptedConfigs };
    } catch (error) {
        console.error("[GET_ECOMMERCE_CONFIG_ERROR]", error);
        return { success: false, error: "Failed to fetch configuration" };
    }
}