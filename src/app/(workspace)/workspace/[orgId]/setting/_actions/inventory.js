'use server'
import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { db } from "@/lib/db";

const UpsertInventorySetting = z.object({
  userId: z.string(),
  formData: z.object({
    skuPrefix: z.string().optional(),
    barcodeFormat: z.string().optional(),
    autoGenerateSku: z.boolean().optional(),
    trackSerialNumbers: z.boolean().optional(),
    trackBatchNumbers: z.boolean().optional(),
    stockValuationMethod: z.string().optional(),
    reorderPointCalculation: z.string().optional(),
    lowStockAlertThreshold: z.number().optional(),
    expiryAlertDays: z.number().optional(),
    dailyStockReport: z.boolean().optional(),
    autoReorderSuggestions: z.boolean().optional(),
  }),
});

const handler = async (data) => {
  const { userId, formData } = data;
  let setting;

  try {
    setting = await db.setting.upsert({
      where: { userId },
      create: {
        userId,
        inventory: formData,
      },
      update: {
        inventory: formData,
      },
    });

    console.log('@inventory setting server action', setting);

  } catch (error) {
    console.log(error);
    return { message: "Oops!, something went wrong", error };
  }

  return { data: { setting } };
};

export const upsertInventorySetting = createSafeAction(UpsertInventorySetting, handler);
