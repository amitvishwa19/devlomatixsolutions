'use server'
import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { db } from "@/lib/db";

// Staff item schema
const staffItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().optional(),
  role: z.string().optional(),
  department: z.string().optional(),
  status: z.string().optional(),
});

const UpsertStaffSetting = z.object({
  userId: z.string(),
  formData: z.object({
    items: z.array(staffItemSchema).optional(),
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
        staff: formData,
      },
      update: {
        staff: formData,
      },
    });

    console.log('@staff setting server action', setting);

  } catch (error) {
    console.log(error);
    return { message: "Oops!, something went wrong", error };
  }

  return { data: { setting } };
};

export const upsertStaffSetting = createSafeAction(UpsertStaffSetting, handler);

const DeleteStaffSetting = z.object({
  userId: z.string(),
  itemId: z.string(),
});

const deleteHandler = async (data) => {
  const { userId, itemId } = data;

  try {
    const current = await db.setting.findUnique({ where: { userId } });

    if (current?.staff?.items && Array.isArray(current.staff.items)) {
      const updatedItems = current.staff.items.filter(item => item.id !== itemId);
      await db.setting.update({
        where: { userId },
        data: { staff: { ...current.staff, items: updatedItems } }
      });
    }

    console.log('@staff setting deleted', itemId);

  } catch (error) {
    console.log(error);
    return { message: "Oops!, something went wrong", error };
  }

  return { data: { success: true } };
};

export const deleteStaffSetting = createSafeAction(DeleteStaffSetting, deleteHandler);
