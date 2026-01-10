'use server'
import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { db } from "@/lib/db";

// Service item schema
const serviceItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  category: z.string().optional(),
  price: z.number().optional(),
  duration: z.string().optional(),
  active: z.boolean().optional(),
});

const UpsertServiceSetting = z.object({
  userId: z.string(),
  formData: z.object({
    items: z.array(serviceItemSchema).optional(),
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
        services: formData,
      },
      update: {
        services: formData,
      },
    });

    console.log('@service setting server action', setting);

  } catch (error) {
    console.log(error);
    return { message: "Oops!, something went wrong", error };
  }

  return { data: { setting } };
};

export const upsertServiceSetting = createSafeAction(UpsertServiceSetting, handler);

const DeleteServiceSetting = z.object({
  userId: z.string(),
  itemId: z.string(),
});

const deleteHandler = async (data) => {
  const { userId, itemId } = data;

  try {
    const current = await db.setting.findUnique({ where: { userId } });

    if (current?.services?.items && Array.isArray(current.services.items)) {
      const updatedItems = current.services.items.filter(item => item.id !== itemId);
      await db.setting.update({
        where: { userId },
        data: { services: { ...current.services, items: updatedItems } }
      });
    }

    console.log('@service setting deleted', itemId);

  } catch (error) {
    console.log(error);
    return { message: "Oops!, something went wrong", error };
  }

  return { data: { success: true } };
};

export const deleteServiceSetting = createSafeAction(DeleteServiceSetting, deleteHandler);
