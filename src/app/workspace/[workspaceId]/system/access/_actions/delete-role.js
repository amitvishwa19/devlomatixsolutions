'use server'
import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { db } from "@/lib/db";
import { ensureAdmin } from "@/lib/auth-utils";

const DeleteRole = z.object({
  userId: z.string().optional(),
  roleId: z.string()
});

const handler = async (data) => {
  await ensureAdmin();
  const { roleId } = data;
  let role;

  try {
    role = await db.role.delete({
      where: {
        id: roleId
      }
    });

  } catch (error) {
    console.error('Delete Role Error:', error);
    return {
      message: error?.message || "Oops!, something went wrong", 
      error
    };
  }

  return { data: { role } };
};

export const deleteRole = createSafeAction(DeleteRole, handler);
