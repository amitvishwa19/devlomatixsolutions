'use server'
import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { db } from "@/lib/db";

const SeedDatabase = z.object({
  userId: z.string(),
  seedType: z.string(),
  count: z.number().optional(),
});

const handler = async (data) => {
  const { userId, seedType, count = 10 } = data;
  let result;

  try {
    const seedItems = {
      items: Array.from({ length: count }, (_, i) => ({
        id: crypto.randomUUID(),
        name: `${seedType} ${i + 1}`,
        createdAt: new Date().toISOString(),
      }))
    };

    const updateData = { [seedType]: seedItems };

    result = await db.setting.upsert({
      where: { userId },
      create: { userId, ...updateData },
      update: updateData,
    });

    console.log('@dbseed server action', seedType, result);

  } catch (error) {
    console.log(error);
    return { message: "Oops!, something went wrong", error };
  }

  return { data: { result, seedType } };
};

export const seedDatabase = createSafeAction(SeedDatabase, handler);

const ResetDatabase = z.object({
  userId: z.string(),
  resetType: z.string(),
});

const resetHandler = async (data) => {
  const { userId, resetType } = data;

  try {
    if (resetType === 'all') {
      await db.setting.deleteMany({ where: { userId } });
      await db.generalSetting.deleteMany({ where: { userId } });
    } else {
      await db.setting.update({
        where: { userId },
        data: { [resetType]: null },
      });
    }

    console.log('@dbreset server action', resetType);

  } catch (error) {
    console.log(error);
    return { message: "Oops!, something went wrong", error };
  }

  return { data: { success: true, resetType } };
};

export const resetDatabase = createSafeAction(ResetDatabase, resetHandler);
