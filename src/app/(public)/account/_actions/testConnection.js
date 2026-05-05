'use server'

import { db } from "@/lib/db";
import { symmetricDecrypt } from "@/lib/encryption";
import { z } from "zod";

const TestConnectionSchema = z.object({
    storeId: z.string().min(1),
    webhookUrl: z.string().url(),
    apiKey: z.string().min(1),
});

export async function testConnection(data) {
    console.log("[TEST_CONNECTION] Received data:", data);
    try {
        const validated = TestConnectionSchema.parse(data);
        console.log("[TEST_CONNECTION] Validated data:", validated);
        const appIdentifier = process.env.ENCRYPTION_KEY;

        if (!appIdentifier) {
            console.error("[TEST_CONNECTION] App identifier not configured");
            return { success: false, error: "App identifier not configured" };
        }

        console.log("[TEST_CONNECTION] Looking for config with storeName:", validated.storeId.toLowerCase().trim());
        const config = await db.ecommerceConfig.findFirst({
            where: {
                appIdentifier: appIdentifier,
                storeName: validated.storeId.toLowerCase().trim(),
                isActive: true,
            },
        });

        if (!config) {
            console.error("[TEST_CONNECTION] Store not found for:", validated.storeId.toLowerCase().trim());
            return { success: false, error: "Store not found" };
        }

        console.log("[TEST_CONNECTION] Found config:", config);
        const decryptedApiKey = symmetricDecrypt(config.apiKey);
        console.log("[TEST_CONNECTION] Decrypted API key comparison:", { 
          decryptedApiKeyExists: !!decryptedApiKey, 
          validatedApiKeyExists: !!validated.apiKey,
          keysMatch: decryptedApiKey === validated.apiKey 
        });

        if (decryptedApiKey !== validated.apiKey) {
            console.error("[TEST_CONNECTION] Invalid API key");
            return { success: false, error: "Invalid API key" };
        }

        console.log("[TEST_CONNECTION] Calling health endpoint:", `${config.webhookUrl}/api/health`);
        const response = await fetch(`${config.webhookUrl}/api/health`, {
            method: "GET",
            headers: {
                "x-api-key": validated.apiKey,
                "Content-Type": "application/json",
            },
        });

        console.log("[TEST_CONNECTION] Health endpoint response:", { 
          status: response.status, 
          ok: response.ok 
        });

        if (response.ok) {
            return { success: true, message: "Connection successful!" };
        } else if (response.status === 401) {
            return { success: false, error: "Invalid API key" };
        } else if (response.status === 404) {
            return { success: false, error: "Health endpoint not found" };
        } else {
            return { success: false, error: `Connection failed: ${response.status}` };
        }
    } catch (error) {
        console.error("[TEST_CONNECTION_ERROR]", error);
        return { success: false, error: "Cannot connect to server. Check webhook URL." };
    }
}