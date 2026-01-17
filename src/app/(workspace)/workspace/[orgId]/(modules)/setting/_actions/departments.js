'use server'
import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { db } from "@/lib/db";

// Department item schema
const departmentItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  code: z.string(),
  head: z.string().optional(),
  beds: z.number().optional(),
  active: z.boolean().optional(),
});

const UpsertDepartmentSetting = z.object({
  userId: z.string(),
  formData: z.object({
    items: z.array(departmentItemSchema).optional(),
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
        departments: formData,
      },
      update: {
        departments: formData,
      },
    });

    console.log('@department setting server action', setting);

  } catch (error) {
    console.log(error);
    return { message: "Oops!, something went wrong", error };
  }

  return { data: { setting } };
};

export const upsertDepartmentSetting = createSafeAction(UpsertDepartmentSetting, handler);

const DeleteDepartmentSetting = z.object({
  userId: z.string(),
  itemId: z.string(),
});

const deleteHandler = async (data) => {
  const { userId, itemId } = data;

  try {
    const current = await db.setting.findUnique({ where: { userId } });

    if (current?.departments?.items && Array.isArray(current.departments.items)) {
      const updatedItems = current.departments.items.filter(item => item.id !== itemId);
      await db.setting.update({
        where: { userId },
        data: { departments: { ...current.departments, items: updatedItems } }
      });
    }

    console.log('@department setting deleted', itemId);

  } catch (error) {
    console.log(error);
    return { message: "Oops!, something went wrong", error };
  }

  return { data: { success: true } };
};

export const deleteDepartmentSetting = createSafeAction(DeleteDepartmentSetting, deleteHandler);
