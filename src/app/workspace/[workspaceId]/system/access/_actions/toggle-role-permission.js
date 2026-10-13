'use server'

import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { db } from "@/lib/db";
import { ensureAdmin } from "@/lib/auth-utils";

const ToggleRolePermissionSchema = z.object({
  roleId: z.string(),
  permissionId: z.string(),
});

const handler = async (data) => {
  await ensureAdmin();
  const { roleId, permissionId } = data;

  try {
    const role = await db.role.findUnique({
      where: { id: roleId },
      include: { permissions: true },
    });

    if (!role) {
      throw new Error(`Role with ID ${roleId} not found`);
    }

    const hasPermission = role.permissions.some((p) => p.id === permissionId);

    const updatedRole = await db.role.update({
      where: { id: roleId },
      data: {
        permissions: hasPermission
          ? { disconnect: { id: permissionId } }
          : { connect: { id: permissionId } },
      },
      include: {
        permissions: true,
      },
    });

    return {
      data: {
        roleId,
        permissionId,
        assigned: !hasPermission,
        role: updatedRole,
      },
    };
  } catch (error) {
    console.error("[toggleRolePermission] Error:", error);
    return {
      message: error?.message || "Failed to toggle role permission",
      error,
    };
  }
};

export const toggleRolePermission = createSafeAction(ToggleRolePermissionSchema, handler);
