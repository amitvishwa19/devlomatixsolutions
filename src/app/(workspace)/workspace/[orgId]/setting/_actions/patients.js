'use server'
import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { db } from "@/lib/db";

const UpsertPatientsSetting = z.object({
  userId: z.string(),
  formData: z.object({
    patientIdPrefix: z.string().optional(),
    idNumberLength: z.string().optional(),
    autoGenerateId: z.boolean().optional(),
    requirePhotoUpload: z.boolean().optional(),
    smsNotifications: z.boolean().optional(),
    recordRetentionPeriod: z.string().optional(),
    defaultBloodType: z.string().optional(),
    requireConsentForm: z.boolean().optional(),
    hipaaComplianceMode: z.boolean().optional(),
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
        patients: formData,
      },
      update: {
        patients: formData,
      },
    });

    console.log('@patients setting server action', setting);

  } catch (error) {
    console.log(error);
    return { message: "Oops!, something went wrong", error };
  }

  return { data: { setting } };
};

export const upsertPatientsSetting = createSafeAction(UpsertPatientsSetting, handler);
