'use server'
import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { db } from "@/lib/db";

const UpsertIntegrationsSetting = z.object({
  userId: z.string(),
  formData: z.object({
    twilioSms: z.boolean().optional(),
    sendGridEmail: z.boolean().optional(),
    stripePayments: z.boolean().optional(),
    paypal: z.boolean().optional(),
    googleCalendar: z.boolean().optional(),
    microsoft365: z.boolean().optional(),
    slack: z.boolean().optional(),
    awsS3: z.boolean().optional(),
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
        integrations: formData,
      },
      update: {
        integrations: formData,
      },
    });

    console.log('@integrations setting server action', setting);

  } catch (error) {
    console.log(error);
    return { message: "Oops!, something went wrong", error };
  }

  return { data: { setting } };
};

export const upsertIntegrationsSetting = createSafeAction(UpsertIntegrationsSetting, handler);
