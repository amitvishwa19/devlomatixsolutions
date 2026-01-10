'use server'
import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { db } from "@/lib/db";

const UpsertGeneralSetting = z.object({
  userId: z.string(),
  formData: z.object({
    hospitalName: z.string().optional(),
    hospitalCode: z.string().optional(),
    contactEmail: z.string().optional(),
    contactPhone: z.string().optional(),
    website: z.string().optional(),
    timezone: z.string().optional(),
    language: z.string().optional(),
    dateFormat: z.string().optional(),
    timeFormat: z.string().optional(),
  }),
});

const handler = async (data) => {
  const { userId, formData } = data;
  let setting;

  try {
    setting = await db.generalSetting.upsert({
      where: { userId },
      create: {
        userId,
        hospitalName: formData.hospitalName,
        hospitalCode: formData.hospitalCode,
        contactEmail: formData.contactEmail,
        contactPhone: formData.contactPhone,
        website: formData.website,
        timezone: formData.timezone,
        language: formData.language,
        dateFormat: formData.dateFormat,
        timeFormat: formData.timeFormat,
      },
      update: {
        hospitalName: formData.hospitalName,
        hospitalCode: formData.hospitalCode,
        contactEmail: formData.contactEmail,
        contactPhone: formData.contactPhone,
        website: formData.website,
        timezone: formData.timezone,
        language: formData.language,
        dateFormat: formData.dateFormat,
        timeFormat: formData.timeFormat,
      },
    });

    console.log('@generalsetting server action', setting);

  } catch (error) {
    console.log(error);
    return {
      message: "Oops!, something went wrong", error
    };
  }

  return { data: { setting } };
};

export const upsertGeneralSetting = createSafeAction(UpsertGeneralSetting, handler);
