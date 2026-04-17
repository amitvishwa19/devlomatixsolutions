'use server'
import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { db } from "@/lib/db";
import { v4 as uuidv4 } from 'uuid'
import { ROLE } from "@prisma/client";
import { slug } from "@/utils/functions";

const UpsertRole = z.object({
  userId: z.string(),
  formData: z.object({
    id: z.string().optional(),
    title: z.string(),
    description: z.string().optional(),
    color: z.string().optional(),
    permissions: z.array(z.any()).optional(),
    parentId: z.string().optional().nullable(),
  }),
});

const handler = async (data) => {
  const { userId, formData } = data
  let role

  try {
    const perms = (formData.permissions || [])
      .filter((p) => p.status === true)
      .map((p) => ({ id: p.id }));

    role = await db.role.upsert({
      where: {
        id: formData.id || '000'
      },
      create: {
        title: slug(formData?.title),
        description: formData?.description,
        color: formData?.color,
        parentId: formData?.parentId,
        permissions: {
          connect: perms
        }
      },
      update: {
        title: slug(formData?.title),
        description: formData?.description,
        color: formData?.color,
        parentId: formData?.parentId,
        permissions: {
          set: perms
        }
      },
      include: {
        permissions: true
      },
    })

  } catch (error) {
    console.error('Upsert Role Error:', error)
    return {
      message: "Oops!, something went wrong", 
      error
    }
  }

  return { data: { role } };
}

export const upsertRole = createSafeAction(UpsertRole, handler);