'use server'
import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { db } from "@/lib/db";

const UpsertNotificationsSetting = z.object({
  userId: z.string(),
  formData: z.object({
    emailAppointmentConfirmations: z.boolean().optional(),
    emailAppointmentReminders: z.boolean().optional(),
    emailInvoiceBilling: z.boolean().optional(),
    emailLabResults: z.boolean().optional(),
    smsAppointmentReminders: z.boolean().optional(),
    smsPrescriptionReady: z.boolean().optional(),
    smsPaymentConfirmations: z.boolean().optional(),
    inAppNewPatient: z.boolean().optional(),
    inAppEmergencyAlerts: z.boolean().optional(),
    inAppLowInventory: z.boolean().optional(),
    inAppScheduleChanges: z.boolean().optional(),
    quietHoursStart: z.string().optional(),
    quietHoursEnd: z.string().optional(),
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
        notifications: formData,
      },
      update: {
        notifications: formData,
      },
    });

    console.log('@notifications setting server action', setting);

  } catch (error) {
    console.log(error);
    return { message: "Oops!, something went wrong", error };
  }

  return { data: { setting } };
};

export const upsertNotificationsSetting = createSafeAction(UpsertNotificationsSetting, handler);
