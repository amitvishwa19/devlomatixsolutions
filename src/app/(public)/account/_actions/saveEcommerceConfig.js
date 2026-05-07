"use server";

import { z } from "zod";

const SaveEcommerceConfigSchema = z
  .object({
    storeName: z
      .string()
      .min(1)
      .transform((val) => val.toLowerCase().trim()),
    storeId: z.string().min(1).optional(),
    webhookUrl: z.string().url().optional(),
    backendUrl: z.string().url().optional(),
    apiKey: z.string().min(1),
  })
  .transform((data) => ({
    storeName: data.storeName,
    storeId: data.storeId,
    webhookUrl: data.webhookUrl || data.backendUrl || "",
    apiKey: data.apiKey,
  }));

export async function saveEcommerceConfig(data) {
  try {
    const validated = SaveEcommerceConfigSchema.parse(data);

    // DB functionality removed as per request.
    // Configuration should be handled via environment variables in the new API-only architecture.
    console.log(
      "[SAVE_ECOMMERCE_CONFIG] DB save disabled. Use environment variables for permanent config.",
      validated
    );

    return { success: true, message: "Configuration update received (DB save disabled)" };
  } catch (error) {
    console.error("[SAVE_ECOMMERCE_CONFIG_ERROR]", error);
    return {
      success: false,
      error: error.message || "Failed to save configuration",
    };
  }
}