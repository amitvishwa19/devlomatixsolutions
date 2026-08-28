'use server'
import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { db } from "@/lib/db";
import { ensureAdmin } from "@/lib/auth-utils";

const DeleteUser = z.object({
  userId: z.string().optional(),
  deleteUserId: z.string()
});

const handler = async (data) => {
  await ensureAdmin();
  const { deleteUserId } = data;
  let user;

  try {
    user = await db.user.delete({
      where: {
        id: deleteUserId
      }
    });

  } catch (error) {
    console.error('Delete User Error:', error);
    return {
      message: error?.message || "Oops!, something went wrong", 
      error
    };
  }

  return { data: { user } };
};

export const deleteUser = createSafeAction(DeleteUser, handler);
