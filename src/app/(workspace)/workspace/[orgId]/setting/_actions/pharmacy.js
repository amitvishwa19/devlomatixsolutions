'use server'
import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { db } from "@/lib/db";

const UpsertPharmacySetting = z.object({
  userId: z.string(),
  formData: z.object({
    pharmacyName: z.string().optional(),
    licenseNumber: z.string().optional(),
    requirePrescriptionVerification: z.boolean().optional(),
    trackControlledSubstances: z.boolean().optional(),
    lowStockThreshold: z.number().optional(),
    criticalStockThreshold: z.number().optional(),
    emailLowStockAlerts: z.boolean().optional(),
    expiryDateAlerts: z.boolean().optional(),
    defaultDispensingUnit: z.string().optional(),
    printFormat: z.string().optional(),
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
        pharmacy: formData,
      },
      update: {
        pharmacy: formData,
      },
    });

    console.log('@pharmacy setting server action', setting);

  } catch (error) {
    console.log(error);
    return { message: "Oops!, something went wrong", error };
  }

  return { data: { setting } };
};

export const upsertPharmacySetting = createSafeAction(UpsertPharmacySetting, handler);
