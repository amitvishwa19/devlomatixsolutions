'use server'
import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { db } from "@/lib/db";

const UpsertAppointmentsSetting = z.object({
  userId: z.string(),
  formData: z.object({
    defaultDuration: z.string().optional(),
    bufferTime: z.string().optional(),
    advanceBookingLimit: z.string().optional(),
    cancellationNotice: z.string().optional(),
    openingTime: z.string().optional(),
    closingTime: z.string().optional(),
    allowWeekendAppointments: z.boolean().optional(),
    allowOnlineBooking: z.boolean().optional(),
    sendSmsReminders: z.boolean().optional(),
    sendEmailReminders: z.boolean().optional(),
    reminderTime: z.string().optional(),
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
        appointments: formData,
      },
      update: {
        appointments: formData,
      },
    });

    console.log('@appointments setting server action', setting);

  } catch (error) {
    console.log(error);
    return { message: "Oops!, something went wrong", error };
  }

  return { data: { setting } };
};

export const upsertAppointmentsSetting = createSafeAction(UpsertAppointmentsSetting, handler);
