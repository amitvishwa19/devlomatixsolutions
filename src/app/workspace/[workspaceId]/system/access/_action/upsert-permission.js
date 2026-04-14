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
    // We use an Interactive Transaction to properly handle bulk operations
    permissions = await db.$transaction(async (tx) => {
      return await Promise.all(formData.map(async (item) => {
        const isNew = String(item.id).startsWith("new-");
        
        return tx.permission.upsert({
          where: { id: isNew ? '000' : item.id },
          update: {
            title: item?.title,
            value: slug(item?.value || item?.title), // Normalize value to slug
            description: item?.description,
            category: item?.category,
            status: item.status,
            color: item.color
          },
          create: {
            title: item?.title,
            value: slug(item?.value || item?.title), // Normalize value to slug
            description: item?.description,
            category: item?.category,
            status: item.status,
            color: item.color
          },
          include: {
            roles: {
              include: {
                users: true
              }
            }
          },
        });
      }));
    }, {
      timeout: 30000 // 30 seconds for bulk operations
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