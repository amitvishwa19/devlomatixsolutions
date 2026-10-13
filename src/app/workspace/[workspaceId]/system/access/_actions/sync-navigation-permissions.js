'use server'

import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { syncNavigationPermissionsToDb } from "@/lib/nav-permission-sync";
import { ensureAdmin } from "@/lib/auth-utils";
import { db } from "@/lib/db";

const SyncNavigationPermissionsSchema = z.object({
  workspaceId: z.string().optional(),
});

const handler = async (data) => {
  await ensureAdmin();
  try {
    const result = await syncNavigationPermissionsToDb(data?.workspaceId || "default");
    
    // Fetch refreshed permissions
    const permissions = await db.permission.findMany({
      include: {
        roles: {
          include: {
            users: {
              select: {
                id: true,
                displayName: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: {
        category: 'asc',
      },
    });

    return {
      data: {
        syncResult: result,
        permissions,
      },
    };
  } catch (error) {
    console.error("[syncNavigationPermissions] Error:", error);
    return {
      message: error?.message || "Failed to sync navigation permissions",
      error,
    };
  }
};

export const syncNavigationPermissions = createSafeAction(SyncNavigationPermissionsSchema, handler);
