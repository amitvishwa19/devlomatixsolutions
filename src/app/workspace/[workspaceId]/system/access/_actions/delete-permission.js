'use server'
import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { db } from "@/lib/db";
import { ensureAdmin } from "@/lib/auth-utils";

const DeletePermission = z.object({
  userId: z.string().optional(),
  permissionsToDelete: z.any()
});

const handler = async (data) => {
  await ensureAdmin();
  const { permissionsToDelete } = data;
  let permissions;

  try {
    const idsToDelete = (permissionsToDelete || []).map(p => typeof p === 'string' ? p : p.id).filter(Boolean);

    permissions = await db.permission.deleteMany({
      where: {
        id: { in: idsToDelete },
      },
    });

  } catch (error) {
    console.error('Delete Permission Error:', error);
    return {
      message: error?.message || "Oops!, something went wrong", 
      error
    };
  }

  return { data: { permissions } };
};

export const deletePermission = createSafeAction(DeletePermission, handler);
