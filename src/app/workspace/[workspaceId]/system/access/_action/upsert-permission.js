'use server'
import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { db } from "@/lib/db";
import { slug } from "@/utils/functions";

const UpsertPermission = z.object({
  userId: z.string(),
  formData: z.any(),
});

const handler = async (data) => {
  const { userId, formData } = data
  let permissions

  try {
    // Use an Interactive Transaction with a high timeout to handle the large manifest reliably
    permissions = await db.$transaction(async (tx) => {
      // 1. Separate items by status
      const toUpsert = formData.filter(item => item.status === true);
      const toRemove = formData.filter(item => item.status === false);

      // 2. Perform Clean-up (Selected Only Model)
      // We only delete module-specific functional permissions. 
      // We NEVER delete shared 'navbar:' items during a module-specific save to avoid breaking other modules.
      const removeValues = toRemove
        .filter(item => !item.value.startsWith('navbar:'))
        .map(item => item.value);

      if (removeValues.length > 0) {
        await tx.permission.deleteMany({
          where: {
            value: { in: removeValues }
          }
        });
      }

      // 3. Perform Upserts for active grants
      const results = [];
      for (const item of toUpsert) {
        const permissionValue = item?.value || slug(item?.title);
        
        const result = await tx.permission.upsert({
          where: { value: permissionValue },
          update: {
            title: item?.title,
            description: item?.description,
            category: item?.category,
            status: item.status,
            color: item.color
          },
          create: {
            title: item?.title,
            value: permissionValue,
            description: item?.description,
            category: item?.category,
            status: item.status,
            color: item.color
          }
        });
        results.push(result);
      }
      return results;
    }, {
      timeout: 60000 // 60 seconds
    });

  } catch (error) {
    console.error('Upsert Permission Error:', error)
    return {
      message: "Oops!, something went wrong", 
      error
    }
  }

  return { data: { permissions } };
}

export const upsertPermission = createSafeAction(UpsertPermission, handler);