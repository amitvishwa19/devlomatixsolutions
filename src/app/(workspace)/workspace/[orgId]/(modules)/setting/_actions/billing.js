'use server'
import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { db } from "@/lib/db";

const UpsertBillingSetting = z.object({
  userId: z.string(),
  formData: z.object({
    currentPlan: z.string().optional(),
    paymentMethodId: z.string().optional(),
    autoRenew: z.boolean().optional(),
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
        billing: formData,
      },
      update: {
        billing: formData,
      },
    });

    console.log('@billing setting server action', setting);

  } catch (error) {
    console.log(error);
    return { message: "Oops!, something went wrong", error };
  }

  return { data: { setting } };
};

export const upsertBillingSetting = createSafeAction(UpsertBillingSetting, handler);
