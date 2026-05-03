'use server'

import { createSafeAction } from "@/utils/CreateSafeAction";
import { db } from "@/lib/db";
import { symmetricDecrypt } from "@/lib/encryption";
import { z } from "zod";

const VerifyApiKey = z.object({
    apiKey: z.string().min(1, "API key is required"),
});

const handler = async (data) => {
    try {
        const { apiKey } = data;

        const stores = await db.eCommerceStore.findMany({
            where: { status: "connected" }
        });

        for (const store of stores) {
            if (store.apiKey) {
                try {
                    const decryptedKey = symmetricDecrypt(store.apiKey);
                    if (decryptedKey === apiKey) {
                        return { 
                            data: { 
                                store: {
                                    id: store.id,
                                    name: store.name,
                                    platform: store.platform,
                                    storeUrl: store.storeUrl,
                                    logo: store.logo,
                                    currency: store.currency,
                                    userId: store.userId
                                }
                            } 
                        };
                    }
                } catch (e) {
                    console.error("Decryption error:", e.message);
                }
            }
        }

        return { error: "Invalid API key" };
    } catch (error) {
        console.error("[VERIFY_API_KEY_ERROR]", error);
        return { error: "Failed to verify API key" };
    }
};

export const verifyApiKey = createSafeAction(VerifyApiKey, handler);