'use server'
import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { db } from "@/lib/db";

const UpsertSecuritySetting = z.object({
  userId: z.string(),
  formData: z.object({
    minPasswordLength: z.string().optional(),
    passwordExpiry: z.string().optional(),
    requireUppercase: z.boolean().optional(),
    requireNumbers: z.boolean().optional(),
    requireSpecialChars: z.boolean().optional(),
    twoFactorAuth: z.boolean().optional(),
    sessionTimeout: z.string().optional(),
    failedLoginLockout: z.string().optional(),
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
        security: formData,
      },
      update: {
        security: formData,
      },
    });

    console.log('@security setting server action', setting);

  } catch (error) {
    console.log(error);
    return { message: "Oops!, something went wrong", error };
  }

  return { data: { setting } };
};

export const upsertSecuritySetting = createSafeAction(UpsertSecuritySetting, handler);
