'use server'
import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { db } from "@/lib/db";

const UpsertPrescriptionSetting = z.object({
  userId: z.string(),
  formData: z.object({
    prescriptionPrefix: z.string().optional(),
    defaultValidityPeriod: z.string().optional(),
    defaultInstructions: z.string().optional(),
    footerText: z.string().optional(),
    checkDrugInteractions: z.boolean().optional(),
    allergyWarnings: z.boolean().optional(),
    dosageValidation: z.boolean().optional(),
    requireDigitalSignature: z.boolean().optional(),
    paperSize: z.string().optional(),
    copies: z.string().optional(),
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
        prescription: formData,
      },
      update: {
        prescription: formData,
      },
    });

    console.log('@prescription setting server action', setting);

  } catch (error) {
    console.log(error);
    return { message: "Oops!, something went wrong", error };
  }

  return { data: { setting } };
};

export const upsertPrescriptionSetting = createSafeAction(UpsertPrescriptionSetting, handler);
